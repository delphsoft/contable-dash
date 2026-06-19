// api/arca.js — fusión de arca-cron, arca-padron, arca-sync
// Rutas:
//   GET  /api/arca?action=padron&cuit=  → consulta padrón ARCA
//   POST /api/arca?action=sync          → sync manual facturas del período
//   POST /api/arca?action=cron          → sync automático (todos los usuarios activos)

import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const KEY = new TextEncoder().encode(process.env.JWT_SECRET ?? 'facturafacil-secret-2026')
const AFIP_BASE = 'https://app.afipsdk.com/api/v1'
const TIPOS = [1, 6, 11, 3, 8, 13]

const AFIP_ENV = (() => {
  const e = process.env.AFIPSDK_ENV || 'prod'
  if (e === 'production') return 'prod'
  if (e === 'development') return 'dev'
  return e
})()

function tipoLabel(t) {
  return { 1:'FA', 3:'NCA', 6:'FB', 8:'NCB', 11:'FC', 13:'NCC' }[t] ?? String(t)
}
function parseFecha(s) {
  s = String(s ?? '')
  if (s.includes('-')) return s.slice(0, 10)
  if (s.length === 8) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`
  return null
}
async function afipGet(path) {
  const r = await fetch(`${AFIP_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.AFIPSDK_ACCESS_TOKEN}` }
  })
  if (!r.ok) throw new Error(`AFIP ${r.status}`)
  return r.json()
}
async function getAuth(req) {
  try {
    const token = req.cookies?.ff_jwt ?? req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null
    const { payload } = await jwtVerify(token, KEY)
    return payload
  } catch { return null }
}

// ── PADRÓN ────────────────────────────────────────────────────────────────────
async function handlePadron(req, res) {
  const { cuit } = req.query
  if (!cuit) return res.status(400).json({ error: 'CUIT requerido' })
  const clean = String(cuit).replace(/[-\s]/g, '')
  if (clean.length !== 11) return res.status(400).json({ error: 'CUIT inválido' })
  const sdkToken = process.env.AFIPSDK_ACCESS_TOKEN
  if (!sdkToken) {
    return res.status(200).json({
      razonSocial: 'DEMO - Configurá AFIPSDK_ACCESS_TOKEN',
      condicionIva: 'Monotributista', domicilio: 'Sin datos reales',
      estadoClave: 'ACTIVO', demo: true,
    })
  }
  try {
    const response = await fetch('https://app.afipsdk.com/api/v1/afip/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sdkToken}` },
      body: JSON.stringify({
        environment: AFIP_ENV, method: 'getPersona',
        wsid: 'ws_sr_padron_a4', params: { idPersona: parseInt(clean) },
      }),
    })
    const data = await response.json()
    if (!response.ok) return res.status(400).json({ error: data?.message || 'Error consultando ARCA' })
    const persona = data?.persona || data
    const razonSocial = persona?.razonSocial ||
      [persona?.apellido, persona?.nombre].filter(Boolean).join(', ') || 'Sin datos'
    const tipoClave = persona?.tipoClave || ''
    const condicionIva = tipoClave === 'MONOTRIBUTO' ? 'Monotributista'
      : tipoClave === 'IVA_RESPONSABLE_INSCRIPTO' ? 'Responsable Inscripto'
      : tipoClave === 'IVA_EXENTO' ? 'IVA Exento'
      : tipoClave || 'Sin datos'
    const domicilio = persona?.domicilioFiscal
      ? `${persona.domicilioFiscal.direccion || ''} ${persona.domicilioFiscal.localidad || ''}`.trim()
      : null
    return res.status(200).json({
      razonSocial, condicionIva, domicilio,
      estadoClave: persona?.estadoClave || 'ACTIVO',
      esRI: tipoClave === 'IVA_RESPONSABLE_INSCRIPTO',
      esMono: tipoClave === 'MONOTRIBUTO',
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// ── SYNC MANUAL ───────────────────────────────────────────────────────────────
async function handleSync(req, res, auth) {
  const { periodo } = req.body ?? {}
  if (!periodo) return res.status(400).json({ error: 'periodo requerido' })
  const [y, m] = periodo.split('-')
  const { data: usr } = await sb.from('usuarios').select('punto_venta').eq('cuit', auth.cuit).single()
  const pv = usr?.punto_venta ?? 1
  let sincronizados = 0
  const errores = []
  for (const tipo of TIPOS) {
    try {
      const last = await afipGet(`/afip/electronic-billing/last-voucher?cuit=${auth.cuit}&punto_venta=${pv}&tipo_comprobante=${tipo}`)
      const ultimo = last?.numero ?? last?.CbteNro ?? 0
      if (!ultimo) continue
      const filas = []
      for (let nro = Math.max(1, ultimo - 200); nro <= ultimo; nro++) {
        try {
          const cbte = await afipGet(`/afip/electronic-billing/vouchers/${nro}?cuit=${auth.cuit}&punto_venta=${pv}&tipo_comprobante=${tipo}`)
          if (!cbte) continue
          const fechaISO = parseFecha(cbte.fecha ?? cbte.CbteFch ?? '')
          if (!fechaISO || !fechaISO.startsWith(`${y}-${m}`)) continue
          filas.push({
            cuit_usuario: auth.cuit, tipo: tipoLabel(tipo),
            voucher_number: cbte.numero ?? cbte.CbteDesde ?? nro,
            date: fechaISO, fecha_iso: fechaISO,
            receptor_doc_nro: String(cbte.receptor_doc_nro ?? cbte.DocNro ?? ''),
            amount: cbte.importe_total ?? cbte.ImpTotal ?? 0,
            importe_neto: cbte.importe_neto ?? cbte.ImpNeto ?? 0,
            importe_iva: cbte.importe_iva ?? cbte.ImpIVA ?? 0,
            cae: cbte.cae ?? cbte.CAE ?? null,
            cae_fch_vto: parseFecha(cbte.cae_vto ?? cbte.CAEFchVto ?? ''),
            recipient: cbte.receptor_razon_social ?? 'Consumidor Final',
            payment_source: 'arca_sync',
          })
        } catch { /* saltar */ }
      }
      if (filas.length) {
        const { error } = await sb.from('facturas').upsert(filas, { onConflict: 'cuit_usuario,tipo,voucher_number' })
        if (error) errores.push(`tipo ${tipo}: ${error.message}`)
        else sincronizados += filas.length
      }
    } catch (e) { errores.push(`tipo ${tipo}: ${e.message}`) }
  }
  await sb.from('cron_log').insert({
    estado: errores.length === 0 ? 'ok' : 'parcial',
    periodo, cuit_usuario: auth.cuit,
    sincronizados, errores: errores.length,
    ejecutado_at: new Date().toISOString()
  })
  return res.json({ ok: true, periodo, sincronizados, errores })
}

// ── CRON AUTOMÁTICO ───────────────────────────────────────────────────────────
async function handleCron(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ error: 'Unauthorized' })
  const { data: cfg } = await sb.from('cron_config').select('value').eq('key', 'sync_arca_enabled').single()
  if (!cfg || cfg.value !== 'true')
    return res.json({ ok: true, skipped: true, motivo: 'cron deshabilitado' })
  const { data: usuarios } = await sb.from('usuarios').select('cuit, punto_venta')
    .eq('cron_habilitado', true).eq('activo', true)
  if (!usuarios?.length)
    return res.json({ ok: true, skipped: true, motivo: 'sin usuarios activos' })
  const d = new Date()
  const periodo = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  const [y, m] = periodo.split('-')
  const resumen = []
  for (const usr of usuarios) {
    const pv = usr.punto_venta ?? 1
    let sync = 0, errs = 0
    for (const tipo of TIPOS) {
      try {
        const last = await afipGet(`/afip/electronic-billing/last-voucher?cuit=${usr.cuit}&punto_venta=${pv}&tipo_comprobante=${tipo}`)
        const ultimo = last?.numero ?? 0
        if (!ultimo) continue
        const filas = []
        for (let nro = Math.max(1, ultimo - 100); nro <= ultimo; nro++) {
          try {
            const cbte = await afipGet(`/afip/electronic-billing/vouchers/${nro}?cuit=${usr.cuit}&punto_venta=${pv}&tipo_comprobante=${tipo}`)
            if (!cbte) continue
            const fecha = parseFecha(cbte.fecha ?? cbte.CbteFch ?? '')
            if (!fecha || !fecha.startsWith(`${y}-${m}`)) continue
            filas.push({
              cuit_usuario: usr.cuit, tipo: tipoLabel(tipo),
              voucher_number: cbte.numero ?? nro, date: fecha, fecha_iso: fecha,
              amount: cbte.importe_total ?? 0, importe_neto: cbte.importe_neto ?? 0,
              importe_iva: cbte.importe_iva ?? 0, cae: cbte.cae ?? null,
              recipient: cbte.receptor_razon_social ?? 'Consumidor Final',
              payment_source: 'arca_sync',
            })
          } catch { /* saltar */ }
        }
        if (filas.length) {
          const { error } = await sb.from('facturas').upsert(filas, { onConflict: 'cuit_usuario,tipo,voucher_number' })
          if (error) errs++; else sync += filas.length
        }
      } catch { errs++ }
    }
    await sb.from('cron_log').insert({
      estado: errs === 0 ? 'ok' : 'parcial', periodo, cuit_usuario: usr.cuit,
      sincronizados: sync, errores: errs, ejecutado_at: new Date().toISOString()
    })
    resumen.push({ cuit: usr.cuit, sincronizados: sync, errores: errs })
  }
  return res.json({ ok: true, periodo, usuarios: resumen })
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query.action

  if (action === 'padron') return handlePadron(req, res)

  if (action === 'cron' && req.method === 'POST') return handleCron(req, res)

  if (action === 'sync' && req.method === 'POST') {
    const auth = await getAuth(req)
    if (!auth?.cuit) return res.status(401).json({ error: 'No autorizado' })
    return handleSync(req, res, auth)
  }

  return res.status(400).json({ error: 'action inválido. Usá: padron, sync, cron' })
}
