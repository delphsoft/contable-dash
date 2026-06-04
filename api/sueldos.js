import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const KEY = new TextEncoder().encode(process.env.JWT_SECRET ?? 'facturafacil-secret-2026')
const MNI = 7_003_662
const A = { jubilacion: 0.11, obraSocial: 0.03, pami: 0.03 }
const rn = n => Math.round(n * 100) / 100

function liquidar(bruto) {
  const anual = bruto * 13
  const base  = Math.max(0, anual - MNI)
  const ga = base <= 0 ? 0
    : base <= 1_200_000 ? rn(base * 0.05 / 13)
    : base <= 2_400_000 ? rn((60_000 + (base - 1_200_000) * 0.09) / 13)
    : base <= 3_600_000 ? rn((168_000 + (base - 2_400_000) * 0.12) / 13)
    : rn((312_000 + (base - 3_600_000) * 0.15) / 13)
  const jub = rn(bruto * A.jubilacion)
  const os  = rn(bruto * A.obraSocial)
  const pa  = rn(bruto * A.pami)
  return {
    jubilacion: jub, obra_social: os, pami: pa, ganancias: ga,
    salario_neto: rn(bruto - jub - os - pa - ga)
  }
}

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
  const action = req.query.action

  if (req.method === 'GET' && action === 'empleados') {
    const { data, error } = await sb.from('empleados').select('*')
      .eq('cuit_usuario', auth.cuit).neq('estado', 'baja').order('apellido')
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'GET' && action === 'cronlog') {
    const { data } = await sb.from('cron_log').select('*')
      .eq('cuit_usuario', auth.cuit)
      .order('ejecutado_at', { ascending: false })
      .limit(20)
    return res.json(data ?? [])
  }

  if (req.method === 'POST' && action === 'agregar') {
    const { data, error } = await sb.from('empleados')
      .insert({ ...req.body, cuit_usuario: auth.cuit })
      .select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'POST' && action === 'liquidar') {
    const { periodo } = req.body ?? {}
    if (!periodo) return res.status(400).json({ error: 'periodo requerido' })
    const { data: emp } = await sb.from('empleados').select('*')
      .eq('cuit_usuario', auth.cuit).eq('estado', 'activo')
    const rows = (emp ?? []).map(e => ({
      cuit_usuario: auth.cuit,
      empleado_id: e.id,
      periodo,
      salario_bruto: e.salario_bruto,
      ...liquidar(e.salario_bruto)
    }))
    if (!rows.length) return res.json({ ok: true, count: 0 })
    const { error } = await sb.from('liquidaciones')
      .upsert(rows, { onConflict: 'empleado_id,periodo' })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, count: rows.length })
  }

  return res.status(400).json({ error: 'action no reconocida' })
}
