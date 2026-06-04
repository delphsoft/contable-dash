import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const KEY = new TextEncoder().encode(process.env.JWT_SECRET ?? 'facturafacil-secret-2026')
const AFIP_BASE = 'https://app.afipsdk.com/api/v1'
const TIPOS = [1, 6, 11, 3, 8, 13]

async function getAuth(req) {
  try {
    const token = req.cookies?.ff_jwt
      ?? req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null
    const { payload } = await jwtVerify(token, KEY)
    return payload
  } catch { return null }
}

async function afipGet(path) {
  const r = await fetch(`${AFIP_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.AFIPSDK_ACCESS_TOKEN}` }
  })
  if (!r.ok) throw new Error(`AFIP ${r.status}`)
  return r.json()
}

function tipoLabel(t) {
  return { 1:'FA', 3:'NCA', 6:'FB', 8:'NCB', 11:'FC', 13:'NCC' }[t] ?? String(t)
}

function parseFecha(s) {
  s = String(s ?? '')
  if (s.includes('-')) return s.slice(0, 10)
  if (s.length === 8) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const auth = await getAuth(req)
  if (!auth?.cuit) return res.status(401).json({ error: 'No autorizado' })

  const { periodo } = req.body ?? {}
  if (!periodo) return res.status(400).json({ error: 'periodo requerido' })

  const [y, m] = periodo.split('-')
  const { data: usr } = await sb
    .from('usuarios').select('punto_venta').eq('cuit', auth.cuit).single()
  const pv = usr?.punto_venta ?? 1

  let sincronizados = 0
  const errores = []

  for (const tipo of TIPOS) {
    try {
      const last = await afipGet(
        `/afip/electronic-billing/last-voucher?cuit=${auth.cuit}&punto_venta=${pv}&tipo_comprobante=${tipo}`
      )
      const ultimo = last?.numero ?? last?.CbteNro ?? 0
      if (!ultimo) continue

      const filas = []
      for (let nro = Math.max(1, ultimo - 200); nro <= ultimo; nro++) {
        try {
          const cbte = await afipGet(
            `/afip/electronic-billing/vouchers/${nro}?cuit=${auth.cuit}&punto_venta=${pv}&tipo_comprobante=${tipo}`
          )
          if (!cbte) continue
          const fechaISO = parseFecha(cbte.fecha ?? cbte.CbteFch ?? '')
          if (!fechaISO || !fechaISO.startsWith(`${y}-${m}`)) continue
          filas.push({
            cuit_usuario: auth.cuit,
            tipo: tipoLabel(tipo),
            voucher_number: cbte.numero ?? cbte.CbteDesde ?? nro,
            date: fechaISO,
            fecha_iso: fechaISO,
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
        const { error } = await sb.from('facturas')
          .upsert(filas, { onConflict: 'cuit_usuario,tipo,voucher_number' })
        if (error) errores.push(`tipo ${tipo}: ${error.message}`)
        else sincronizados += filas.length
      }
    } catch (e) {
      errores.push(`tipo ${tipo}: ${e.message}`)
    }
  }

  await sb.from('cron_log').insert({
    estado: errores.length === 0 ? 'ok' : 'parcial',
    periodo, cuit_usuario: auth.cuit,
    sincronizados, errores: errores.length,
    ejecutado_at: new Date().toISOString()
  })

  return res.json({ ok: true, periodo, sincronizados, errores })
}
