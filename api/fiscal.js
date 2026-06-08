// api/fiscal.js — fusión de f931-sicoss, sicore-retencion y vep-link
// Rutas:
//   POST /api/fiscal?action=f931       → genera archivo SICOSS
//   POST /api/fiscal?action=sicore     → genera archivo SICORE
//   GET  /api/fiscal?action=vep&tipo=  → genera link VEP

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

// ── SICOSS (F931) ─────────────────────────────────────────────────────────────
function padL(val, len) { return String(val ?? '').padStart(len, '0') }
function padR(val, len) { return String(val ?? '').padEnd(len, ' ').slice(0, len) }

function generarSICOSS(cuit, periodo, empleados, liquidaciones) {
  const lines      = []
  const per        = periodo.replace('-', '')
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
  lines.push(['1', padL(cuitLimpio,11), padL(per,6), padL(empleados.length,6),
    padL(Math.round(totAportes*100).toString(),15), padL(Math.round(totContribs*100).toString(),15)].join(''))
  for (const emp of empleados) {
    const liq = liquidaciones.find(l => l.empleado_id === emp.id)
    if (!liq) continue
    const cuil = (emp.cuil || '').replace(/\D/g, '')
    const b = liq.salario_bruto || 0
    lines.push(['2', padL(cuitLimpio,11), padL(cuil,11), padL(per,6),
      padR(emp.apellido,20), padR(emp.nombre,20),
      padL(Math.round(b*100).toString(),15),
      padL(Math.round((liq.jubilacion||0)*100).toString(),15),
      padL(Math.round((liq.obra_social||0)*100).toString(),15),
      padL(Math.round((liq.pami||0)*100).toString(),15),
      padL(Math.round(b*0.109*100).toString(),15),
      padL(Math.round(b*0.06*100).toString(),15),
      padL(Math.round(b*0.015*100).toString(),15),
      padL(Math.round(b*0.007*100).toString(),15),
    ].join(''))
  }
  return lines.join('\r\n') + '\r\n'
}

async function handleF931(req, res, auth) {
  const { periodo } = req.body ?? {}
  if (!periodo) return res.status(400).json({ error: 'periodo requerido' })
  const [{ data: empleados }, { data: liquidaciones }] = await Promise.all([
    sb.from('empleados').select('*').eq('cuit_usuario', auth.cuit).eq('estado', 'activo'),
    sb.from('liquidaciones').select('*').eq('cuit_usuario', auth.cuit).eq('periodo', periodo)
  ])
  if (!empleados?.length)     return res.status(400).json({ error: 'Sin empleados activos' })
  if (!liquidaciones?.length) return res.status(400).json({ error: 'Sin liquidaciones para ' + periodo })
  const contenido = generarSICOSS(auth.cuit, periodo, empleados, liquidaciones)
  const filename  = 'F931_' + auth.cuit.replace(/\D/g,'') + '_' + periodo.replace('-','') + '.txt'
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"')
  res.send(contenido)
}

// ── SICORE ────────────────────────────────────────────────────────────────────
function generarArchivoSICORE(ret) {
  const fecha = new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' })
  return ['80', fecha, (ret.nroComprobante||'00000000').slice(0,8),
    ret.proveedorCuit.replace(/\D/g,''), '3',
    ret.importeNeto.toFixed(2), '10.50', ret.importeRetencion.toFixed(2)].join(';') + '\r\n'
}

async function handleSicore(req, res, auth) {
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
    retenciones.push({ proveedorCuit: c.proveedor_cuit||'', nroComprobante: c.numero_comprobante,
      importeNeto: c.importe_neto||0, importeRetencion: Math.round((c.importe_neto||0)*0.105*100)/100 })
  }
  if (!retenciones.length) return res.json({ ok:true, mensaje:'Sin retenciones a generar', retenciones:[] })
  const contenido = retenciones.map(r => generarArchivoSICORE(r)).join('')
  const filename  = 'SICORE_' + auth.cuit.replace(/\D/g,'') + '_' + periodo.replace('-','') + '.txt'
  await sb.from('cron_log').insert({ estado:'ok', periodo, cuit_usuario:auth.cuit, sincronizados:retenciones.length, motivo:'sicore_generado', ejecutado_at:new Date().toISOString() })
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"')
  res.send(contenido)
}

// ── VEP LINK ──────────────────────────────────────────────────────────────────
const CODIGOS_VEP = {
  iva:       { impuesto:'030', concepto:'019', subConcepto:'001', label:'IVA' },
  f931:      { impuesto:'301', concepto:'078', subConcepto:'001', label:'F931' },
  sicore:    { impuesto:'217', concepto:'080', subConcepto:'001', label:'Retenciones SICORE' },
  ganancias: { impuesto:'011', concepto:'019', subConcepto:'001', label:'Ganancias' },
}

async function calcularMontoVEP(cuit, tipo, periodo) {
  const [y, m] = periodo.split('-')
  const desde  = y + '-' + m + '-01'
  const hasta  = m === '12' ? (parseInt(y)+1) + '-01-01' : y + '-' + String(parseInt(m)+1).padStart(2,'0') + '-01'
  if (tipo === 'iva') {
    const [{ data: ventas }, { data: compras }] = await Promise.all([
      sb.from('facturas').select('importe_iva').eq('cuit_usuario', cuit).gte('fecha_iso', desde).lt('fecha_iso', hasta),
      sb.from('compras_contable').select('importe_iva').eq('cuit_usuario', cuit).gte('fecha', desde).lt('fecha', hasta)
    ])
    const debito  = (ventas  ?? []).reduce((s, f) => s + (f.importe_iva ?? 0), 0)
    const credito = (compras ?? []).reduce((s, c) => s + (c.importe_iva ?? 0), 0)
    return Math.max(0, Math.round((debito - credito) * 100) / 100)
  }
  if (tipo === 'f931') {
    const { data: liqs } = await sb.from('liquidaciones').select('salario_bruto,jubilacion,obra_social,pami').eq('cuit_usuario', cuit).eq('periodo', periodo)
    return (liqs ?? []).reduce((s, l) => {
      const aportes  = (l.jubilacion||0) + (l.obra_social||0) + (l.pami||0)
      const contribs = Math.round((l.salario_bruto||0) * 0.231 * 100) / 100
      return Math.round((s + aportes + contribs) * 100) / 100
    }, 0)
  }
  if (tipo === 'sicore') {
    const { data: compras } = await sb.from('compras_contable').select('importe_neto,proveedor_nombre').eq('cuit_usuario', cuit).gte('fecha', desde).lt('fecha', hasta)
    const MINIMO = 400000
    return (compras ?? []).reduce((s, c) => {
      if ((c.proveedor_nombre||'').toLowerCase().includes('mono') || (c.importe_neto||0) < MINIMO) return s
      return Math.round((s + (c.importe_neto||0) * 0.105) * 100) / 100
    }, 0)
  }
  return 0
}

async function handleVep(req, res, auth) {
  const { tipo = 'iva', periodo } = req.query
  if (!periodo) return res.status(400).json({ error: 'periodo requerido' })
  if (!CODIGOS_VEP[tipo]) return res.status(400).json({ error: 'tipo invalido' })
  const monto   = await calcularMontoVEP(auth.cuit, tipo, periodo)
  const codigos = CODIGOS_VEP[tipo]
  const params  = new URLSearchParams({ tipoPago:codigos.impuesto, concepto:codigos.concepto,
    subConcepto:codigos.subConcepto, periodo:periodo.replace('-',''), monto:monto.toFixed(2),
    cuit:auth.cuit.replace(/\D/g,'') })
  const url = 'https://serviciosjava.afip.gob.ar/claveFiscal/loginSinClave/LoginServlet?destino=vep&' + params.toString()
  return res.json({ ok:true, tipo, periodo, monto, url, label: codigos.label + ' ' + periodo + ' — $' + Math.round(monto).toLocaleString('es-AR') })
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const auth = await getAuth(req)
  if (!auth?.cuit) return res.status(401).json({ error: 'No autorizado' })

  const action = req.query.action
  if (action === 'f931'   && req.method === 'POST') return handleF931(req, res, auth)
  if (action === 'sicore' && req.method === 'POST') return handleSicore(req, res, auth)
  if (action === 'vep'    && req.method === 'GET')  return handleVep(req, res, auth)

  return res.status(400).json({ error: 'action inválido. Usá: f931, sicore, vep' })
}
