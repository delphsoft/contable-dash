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

function padL(val, len) { return String(val ?? '').padStart(len, '0') }
function padR(val, len) { return String(val ?? '').padEnd(len, ' ').slice(0, len) }
function formatPeriodo(p) { return p.replace('-', '') }

function generarSICOSS(cuit, periodo, empleados, liquidaciones) {
  const lines    = []
  const per      = formatPeriodo(periodo)
  const cuitLimpio = cuit.replace(/\D/g, '')

  const totAportes = liquidaciones.reduce((s, l) =>
    s + (l.jubilacion || 0) + (l.obra_social || 0) + (l.pami || 0), 0)
  const totContribs = liquidaciones.reduce((s, l) => {
    const b = l.salario_bruto || 0
    return s + Math.round(b * 0.109 * 100) / 100
             + Math.round(b * 0.06  * 100) / 100
             + Math.round(b * 0.015 * 100) / 100
             + Math.round(b * 0.007 * 100) / 100
  }, 0)

  lines.push([
    '1',
    padL(cuitLimpio, 11),
    padL(per, 6),
    padL(empleados.length, 6),
    padL(Math.round(totAportes  * 100).toString(), 15),
    padL(Math.round(totContribs * 100).toString(), 15),
  ].join(''))

  for (const emp of empleados) {
    const liq = liquidaciones.find(l => l.empleado_id === emp.id)
    if (!liq) continue
    const cuil    = (emp.cuil || '').replace(/\D/g, '')
    const bruto   = liq.salario_bruto || 0
    const jub     = liq.jubilacion    || 0
    const os      = liq.obra_social   || 0
    const pami    = liq.pami          || 0
    const jubPat  = Math.round(bruto * 0.109 * 100) / 100
    const osPat   = Math.round(bruto * 0.06  * 100) / 100
    const pamiPat = Math.round(bruto * 0.015 * 100) / 100
    const art     = Math.round(bruto * 0.007 * 100) / 100
    lines.push([
      '2',
      padL(cuitLimpio, 11),
      padL(cuil, 11),
      padL(per, 6),
      padR(emp.apellido, 20),
      padR(emp.nombre,   20),
      padL(Math.round(bruto   * 100).toString(), 15),
      padL(Math.round(jub     * 100).toString(), 15),
      padL(Math.round(os      * 100).toString(), 15),
      padL(Math.round(pami    * 100).toString(), 15),
      padL(Math.round(jubPat  * 100).toString(), 15),
      padL(Math.round(osPat   * 100).toString(), 15),
      padL(Math.round(pamiPat * 100).toString(), 15),
      padL(Math.round(art     * 100).toString(), 15),
    ].join(''))
  }
  return lines.join('\r\n') + '\r\n'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const auth = await getAuth(req)
  if (!auth?.cuit) return res.status(401).json({ error: 'No autorizado' })
  const { periodo } = req.body ?? {}
  if (!periodo) return res.status(400).json({ error: 'periodo requerido' })

  const [{ data: empleados }, { data: liquidaciones }] = await Promise.all([
    sb.from('empleados').select('*').eq('cuit_usuario', auth.cuit).eq('estado', 'activo'),
    sb.from('liquidaciones').select('*').eq('cuit_usuario', auth.cuit).eq('periodo', periodo)
  ])

  if (!empleados?.length)    return res.status(400).json({ error: 'Sin empleados activos' })
  if (!liquidaciones?.length) return res.status(400).json({ error: 'Sin liquidaciones para ' + periodo + '. Liquidá el período primero.' })

  const contenido = generarSICOSS(auth.cuit, periodo, empleados, liquidaciones)
  const filename  = 'F931_' + auth.cuit.replace(/\D/g,'') + '_' + periodo.replace('-','') + '.txt'
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"')
  res.send(contenido)
}
