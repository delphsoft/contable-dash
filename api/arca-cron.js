import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const AFIP_BASE = 'https://app.afipsdk.com/api/v1'
const TIPOS = [1, 6, 11, 3, 8, 13]

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
function getPeriodo() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ error: 'Unauthorized' })

  const { data: cfg } = await sb.from('cron_config')
    .select('value').eq('key', 'sync_arca_enabled').single()
  if (!cfg || cfg.value !== 'true')
    return res.json({ ok: true, skipped: true, motivo: 'cron deshabilitado' })

  const { data: usuarios } = await sb.from('usuarios')
    .select('cuit, punto_venta')
    .eq('cron_habilitado', true)
    .eq('activo', true)
  if (!usuarios?.length)
    return res.json({ ok: true, skipped: true, motivo: 'sin usuarios activos' })

  const periodo = getPeriodo()
  const [y, m] = periodo.split('-')
  const resumen = []

  for (const usr of usuarios) {
    const pv = usr.punto_venta ?? 1
    let sync = 0, errs = 0

    for (const tipo of TIPOS) {
      try {
        const last = await afipGet(
          `/afip/electronic-billing/last-voucher?cuit=${usr.cuit}&punto_venta=${pv}&tipo_comprobante=${tipo}`
        )
        const ultimo = last?.numero ?? 0
        if (!ultimo) continue

        const filas = []
        for (let nro = Math.max(1, ultimo - 100); nro <= ultimo; nro++) {
          try {
            const cbte = await afipGet(
              `/afip/electronic-billing/vouchers/${nro}?cuit=${usr.cuit}&punto_venta=${pv}&tipo_comprobante=${tipo}`
            )
            if (!cbte) continue
            const fecha = parseFecha(cbte.fecha ?? cbte.CbteFch ?? '')
            if (!fecha || !fecha.startsWith(`${y}-${m}`)) continue
            filas.push({
              cuit_usuario: usr.cuit,
              tipo: tipoLabel(tipo),
              voucher_number: cbte.numero ?? nro,
              date: fecha, fecha_iso: fecha,
              amount: cbte.importe_total ?? 0,
              importe_neto: cbte.importe_neto ?? 0,
              importe_iva: cbte.importe_iva ?? 0,
              cae: cbte.cae ?? null,
              recipient: cbte.receptor_razon_social ?? 'Consumidor Final',
              payment_source: 'arca_sync',
            })
          } catch { /* saltar */ }
        }
        if (filas.length) {
          const { error } = await sb.from('facturas')
            .upsert(filas, { onConflict: 'cuit_usuario,tipo,voucher_number' })
          if (error) errs++; else sync += filas.length
        }
      } catch { errs++ }
    }

    await sb.from('cron_log').insert({
      estado: errs === 0 ? 'ok' : 'parcial',
      periodo, cuit_usuario: usr.cuit,
      sincronizados: sync, errores: errs,
      ejecutado_at: new Date().toISOString()
    })
    resumen.push({ cuit: usr.cuit, sincronizados: sync, errores: errs })
  }

  return res.json({ ok: true, periodo, usuarios: resumen })
}
