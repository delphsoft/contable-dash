import { createClient } from '@supabase/supabase-js'
import { jwtVerify }    from 'jose'

const sb  = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const KEY = new TextEncoder().encode(process.env.JWT_SECRET ?? 'facturafacil-secret-2026')

async function getAuth(req) {
  try {
    const token = req.cookies?.ff_jwt ?? req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null
    const { payload } = await jwtVerify(token, KEY)
    return payload
  } catch { return null }
}

function generarArchivoSICORE(ret) {
  const fecha = new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' })
  return [
    '80',
    fecha,
    (ret.nroComprobante || '00000000').slice(0, 8),
    ret.proveedorCuit.replace(/\D/g, ''),
    '3',
    ret.importeNeto.toFixed(2),
    '10.50',
    ret.importeRetencion.toFixed(2),
  ].join(';') + '\r\n'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const auth = await getAuth(req)
  if (!auth?.cuit) return res.status(401).json({ error: 'No autorizado' })

  const { periodo } = req.body ?? {}
  if (!periodo) return res.status(400).json({ error: 'periodo requerido' })

  const [y, m] = periodo.split('-')
  const desde  = y + '-' + m + '-01'
  const hasta  = m === '12' ? (parseInt(y)+1) + '-01-01' : y + '-' + String(parseInt(m)+1).padStart(2,'0') + '-01'

  const { data: compras } = await sb.from('compras_contable').select('*').eq('cuit_usuario', auth.cuit).gte('fecha', desde).lt('fecha', hasta)

  if (!compras?.length) return res.status(400).json({ error: 'Sin compras para ' + periodo })

  const MINIMO = 400000
  const retenciones = []
  for (const c of compras) {
    const esMono = (c.proveedor_nombre || '').toLowerCase().includes('mono')
    if (esMono || (c.importe_neto || 0) < MINIMO) continue
    retenciones.push({
      proveedorCuit:    c.proveedor_cuit || '',
      nroComprobante:   c.numero_comprobante,
      importeNeto:      c.importe_neto || 0,
      importeRetencion: Math.round((c.importe_neto || 0) * 0.105 * 100) / 100,
    })
  }

  if (!retenciones.length) {
    return res.json({ ok: true, mensaje: 'Sin retenciones a generar — todos los proveedores son Monotributistas o los importes están bajo el mínimo ($400.000)', retenciones: [] })
  }

  const contenido = retenciones.map(r => generarArchivoSICORE(r)).join('')
  const filename  = 'SICORE_' + auth.cuit.replace(/\D/g,'') + '_' + periodo.replace('-','') + '.txt'

  await sb.from('cron_log').insert({ estado:'ok', periodo, cuit_usuario:auth.cuit, sincronizados:retenciones.length, motivo:'sicore_generado', ejecutado_at:new Date().toISOString() })

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"')
  res.send(contenido)
}
