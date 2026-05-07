import { createClient } from '@supabase/supabase-js'
import { SignJWT, jwtVerify } from 'jose'

const AFIPSDK_BASE = 'https://app.afipsdk.com/api/v1'
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'facturafacil-secret-2026')

const AFIP_ENV = (() => {
  const e = process.env.AFIPSDK_ENV || 'prod'
  if (e === 'production') return 'prod'
  if (e === 'development') return 'dev'
  return e
})()

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function getTA(taxId, accessToken, cert, key) {
  const body = { environment: AFIP_ENV, tax_id: taxId, wsid: 'wsfe' }
  if (cert) body.cert = cert
  if (key) body.key = key
  const res = await fetch(`${AFIPSDK_BASE}/afip/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || `Auth error ${res.status}`)
  return { token: data.token, sign: data.sign }
}

async function afipRequest(method, params, accessToken) {
  const body = { environment: AFIP_ENV, method, wsid: 'wsfe', params }
  const res = await fetch(`${AFIPSDK_BASE}/afip/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    const errMsg = data?.data_errors ? JSON.stringify(data.data_errors) : data?.message || `HTTP ${res.status}`
    throw new Error(errMsg)
  }
  return data
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── Auth ──
  const authHeader = req.headers['authorization']
  const supabase = getSupabase()
  let cuitFromJWT = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const { payload } = await jwtVerify(authHeader.replace('Bearer ', ''), SECRET)
      cuitFromJWT = payload.cuit
    } catch (e) {
      // token inválido — fallback a demo mode
    }
  }

  const {
    amount, recipient, description,
    tipoComprobante = 11, concepto = 2,
    receptorTipo = 'consumidor_final',
    receptorDocNro = '0',
    receptorRazonSocial = '',
    receptorEmail = '',
    paymentSource = 'manual',
    mpPaymentId = null,
    // direct fields from unified app (no Supabase)
    tipo, pv, cuit: cuitReceptorDirect, monto, cliente,
  } = req.body

  // Support both call styles: FacturaFácil Next.js style AND unified app style
  const finalAmount   = amount || monto || 0
  const finalRecipient = recipient || cliente || 'Sin nombre'
  const finalTipo     = tipoComprobante || (tipo === 'A' ? 1 : tipo === 'B' ? 6 : 11)

  if (!finalAmount || finalAmount <= 0) {
    return res.status(400).json({ error: 'Monto requerido' })
  }

  // ── Get user config from Supabase or env ──
  let usuario = null
  if (supabase && cuitFromJWT) {
    const { data } = await supabase
      .from('usuarios')
      .select('cuit, razon_social, afipsdk_token, afipsdk_cuit, punto_venta, activo, condicion_iva, email')
      .eq('cuit', cuitFromJWT)
      .single()
    usuario = data
    if (usuario && !usuario.activo) return res.status(401).json({ error: 'Usuario inactivo' })
  }

  const puntoDeVenta = usuario?.punto_venta || parseInt(pv) || 1
  const afipCuit = (usuario?.afipsdk_cuit || usuario?.cuit || cuitFromJWT || process.env.AFIPSDK_CUIT || '').replace(/[-\s]/g, '')
  const accessToken = usuario?.afipsdk_token || process.env.AFIPSDK_ACCESS_TOKEN

  // ── Demo mode if no AfipSDK token ──
  if (!accessToken) {
    const mockInvoice = {
      id: Date.now().toString(),
      cuit_usuario: afipCuit || 'DEMO',
      recipient: finalRecipient,
      description: description || finalRecipient,
      amount: finalAmount,
      tipo_comprobante: finalTipo,
      concepto,
      voucher_number: Math.floor(Math.random() * 9000) + 1000,
      punto_venta: puntoDeVenta,
      cae: '75116759' + String(Date.now()).slice(-8),
      cae_fch_vto: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0,10).replace(/-/g,''),
      date: new Date().toLocaleDateString('es-AR'),
      demo: true,
      message: 'CAE demo — configurá AFIPSDK_ACCESS_TOKEN en Vercel para CAE reales'
    }
    return res.status(200).json(mockInvoice)
  }

  // DocTipo / DocNro
  let docTipo = 99, docNro = 0
  if (receptorTipo === 'cuit') { docTipo = 80; docNro = parseInt(String(receptorDocNro || cuitReceptorDirect || '0').replace(/[-\s]/g, '')) || 0 }
  if (receptorTipo === 'dni')  { docTipo = 96; docNro = parseInt(String(receptorDocNro).replace(/[-\s]/g, '')) || 0 }

  // CondicionIVAReceptor
  let condicionIVAReceptor = 5
  if (finalTipo === 1) condicionIVAReceptor = 1
  else if (finalTipo === 6 && receptorTipo === 'cuit') condicionIVAReceptor = 6

  // Importes
  let impNeto, impIVA, impTotal
  if (finalTipo === 11) {
    impNeto = Math.round(finalAmount * 100) / 100; impIVA = 0; impTotal = impNeto
  } else if (finalTipo === 1) {
    impNeto = Math.round(finalAmount * 100) / 100
    impIVA = Math.round(impNeto * 0.21 * 100) / 100
    impTotal = Math.round((impNeto + impIVA) * 100) / 100
  } else {
    impTotal = Math.round(finalAmount * 100) / 100
    impNeto = Math.round((impTotal / 1.21) * 100) / 100
    impIVA = Math.round((impTotal - impNeto) * 100) / 100
  }

  try {
    // ── Step 1: get TA ──
    const cert = process.env.AFIP_CERT
    const key = process.env.AFIP_KEY
    const { token, sign } = await getTA(afipCuit, accessToken, cert, key)

    // ── Step 2: last voucher ──
    const lastRes = await afipRequest('FECompUltimoAutorizado', {
      Auth: { Token: token, Sign: sign, Cuit: afipCuit },
      PtoVta: puntoDeVenta,
      CbteTipo: finalTipo,
    }, accessToken)

    const lastVoucher = lastRes?.FECompUltimoAutorizadoResult?.CbteNro ?? 0
    const nextVoucher = lastVoucher + 1

    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString().split('T')[0]
    const cbteFch = today.replace(/-/g, '')
    const yyyymm = today.slice(0, 7).replace('-', '')

    const fechasServicio = (concepto === 2 || concepto === 3) ? {
      FchServDesde: `${yyyymm}01`,
      FchServHasta: `${yyyymm}30`,
      FchVtoPago:   `${yyyymm}30`,
    } : {}

    const ivaItems = finalTipo !== 11 ? {
      Iva: { AlicIva: [{ Id: 5, BaseImp: impNeto, Importe: impIVA }] }
    } : {}

    // ── Step 3: request CAE ──
    const caeRes = await afipRequest('FECAESolicitar', {
      Auth: { Token: token, Sign: sign, Cuit: afipCuit },
      FeCAEReq: {
        FeCabReq: { CantReg: 1, PtoVta: puntoDeVenta, CbteTipo: finalTipo },
        FeDetReq: {
          FECAEDetRequest: [{
            Concepto: concepto, DocTipo: docTipo, DocNro: docNro,
            CbteDesde: nextVoucher, CbteHasta: nextVoucher, CbteFch: cbteFch,
            ImpTotal: impTotal, ImpTotConc: 0, ImpNeto: impNeto,
            ImpOpEx: 0, ImpTrib: 0, ImpIVA: finalTipo === 11 ? 0 : impIVA,
            MonId: 'PES', MonCotiz: 1,
            CondicionIVAReceptorId: condicionIVAReceptor,
            ...fechasServicio, ...ivaItems,
          }]
        }
      }
    }, accessToken)

    // Parse response
    const errors = caeRes?.FECAESolicitarResult?.Errors?.Err
    if (errors) {
      const errMsg = Array.isArray(errors)
        ? errors.map(e => `[${e.Code}] ${e.Msg}`).join(' | ')
        : `[${errors.Code}] ${errors.Msg}`
      throw new Error(errMsg)
    }

    const detResp = caeRes?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse
    const detItem = Array.isArray(detResp) ? detResp[0] : detResp
    const cae = detItem?.CAE
    const caeFchVto = detItem?.CAEFchVto

    if (!cae) {
      const obs = detItem?.Observaciones?.Obs
      const obsMsg = Array.isArray(obs)
        ? obs.map(o => `[${o.Code}] ${o.Msg}`).join(' | ')
        : obs ? `[${obs.Code}] ${obs.Msg}` : ''
      throw new Error(obsMsg || `Sin CAE. Resultado: ${detItem?.Resultado}`)
    }

    const invoiceData = {
      id: Date.now().toString(),
      cuit_usuario: cuitFromJWT || afipCuit,
      recipient: finalRecipient,
      description: description || finalRecipient,
      amount: impTotal, tipo_comprobante: finalTipo, concepto,
      voucher_number: nextVoucher, punto_venta: puntoDeVenta,
      cae, cae_fch_vto: caeFchVto,
      date: new Date().toLocaleDateString('es-AR'),
      receptor_tipo: receptorTipo, receptor_doc_tipo: docTipo,
      receptor_doc_nro: String(docNro),
      receptor_razon_social: receptorRazonSocial || finalRecipient,
      receptor_email: receptorEmail || null,
      payment_source: paymentSource, mp_payment_id: mpPaymentId,
    }

    // Save to Supabase if available
    if (supabase) {
      const { data: saved, error: saveError } = await supabase
        .from('facturas').insert(invoiceData).select().single()
      if (saveError) console.error('[SUPABASE ERROR]', saveError)
      if (saved) Object.assign(invoiceData, saved)
    }

    // Email async via Resend
    if (process.env.RESEND_API_KEY && (receptorEmail || usuario?.email)) {
      const to = [...new Set([receptorEmail, usuario?.email].filter(Boolean))]
      const TIPOS = { 1: 'Factura A', 6: 'Factura B', 11: 'Factura C' }
      const label = TIPOS[finalTipo] || 'Factura'
      const num = `${String(puntoDeVenta).padStart(4,'0')}-${String(nextVoucher).padStart(8,'0')}`
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to,
          subject: `${label} N° ${num} — AR$ ${impTotal.toLocaleString('es-AR')}`,
          html: `<p><b>${label}</b> N° ${num}</p><p>CAE: <b>${cae}</b></p><p>Vto: ${caeFchVto}</p><p>Total: AR$ ${impTotal.toLocaleString('es-AR')}</p>`,
        }),
      }).catch(console.error)
    }

    return res.status(200).json(invoiceData)

  } catch (error) {
    console.error('[INVOICE ERROR]', error?.message)
    return res.status(500).json({ error: error?.message || 'Error al crear comprobante en ARCA' })
  }
}
