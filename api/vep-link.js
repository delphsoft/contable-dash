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

const CODIGOS_VEP = {
  iva:     { impuesto: '030', concepto: '019', subConcepto: '001', label: 'IVA' },
  f931:    { impuesto: '301', concepto: '078', subConcepto: '001', label: 'F931' },
  sicore:  { impuesto: '217', concepto: '080', subConcepto: '001', label: 'Retenciones SICORE' },
  ganancias:{ impuesto: '011', concepto: '019', subConcepto: '001', label: 'Ganancias' },
}

async function calcularMonto(cuit, tipo, periodo) {
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
      const esMono = (c.proveedor_nombre || '').toLowerCase().includes('mono')
      if (esMono || (c.importe_neto||0) < MINIMO) return s
      return Math.round((s + (c.importe_neto||0) * 0.105) * 100) / 100
    }, 0)
  }

  return 0
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const auth = await getAuth(req)
  if (!auth?.cuit) return res.status(401).json({ error: 'No autorizado' })

  const { tipo = 'iva', periodo } = req.query
  if (!periodo) return res.status(400).json({ error: 'periodo requerido' })
  if (!CODIGOS_VEP[tipo]) return res.status(400).json({ error: 'tipo invalido' })

  const monto   = await calcularMonto(auth.cuit, tipo, periodo)
  const codigos = CODIGOS_VEP[tipo]
  const per     = periodo.replace('-', '')
  const params  = new URLSearchParams({
    tipoPago:    codigos.impuesto,
    concepto:    codigos.concepto,
    subConcepto: codigos.subConcepto,
    periodo:     per,
    monto:       monto.toFixed(2),
    cuit:        auth.cuit.replace(/\D/g, ''),
  })
  const url = 'https://serviciosjava.afip.gob.ar/claveFiscal/loginSinClave/LoginServlet?destino=vep&' + params.toString()
  const label = codigos.label + ' ' + periodo + ' — $' + Math.round(monto).toLocaleString('es-AR')

  return res.json({ ok: true, tipo, periodo, monto, url, label })
}
