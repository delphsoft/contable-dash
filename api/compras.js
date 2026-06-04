import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const KEY = new TextEncoder().encode(process.env.JWT_SECRET ?? 'facturafacil-secret-2026')

async function getAuth(req) {
  try {
    const token = req.cookies?.ff_jwt
      ?? req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null
    const { payload } = await jwtVerify(token, KEY)
    return payload
  } catch { return null }
}

export default async function handler(req, res) {
  const auth = await getAuth(req)
  if (!auth?.cuit) return res.status(401).json({ error: 'No autorizado' })

  if (req.method === 'GET') {
    const periodo = req.query.periodo ?? ''
    const [y, m] = periodo.split('-')
    const desde = `${y}-${m}-01`
    const hasta = m === '12'
      ? `${+y+1}-01-01`
      : `${y}-${String(+m+1).padStart(2,'0')}-01`
    const { data, error } = await sb.from('compras_contable')
      .select('*')
      .eq('cuit_usuario', auth.cuit)
      .gte('fecha', desde)
      .lt('fecha', hasta)
      .order('fecha', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'POST') {
    const compras = Array.isArray(req.body) ? req.body : [req.body]
    const rows = compras.map(c => ({ ...c, cuit_usuario: auth.cuit }))
    const { error } = await sb.from('compras_contable')
      .upsert(rows, { onConflict: 'cuit_usuario,numero_comprobante' })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, count: rows.length })
  }

  return res.status(405).end()
}
