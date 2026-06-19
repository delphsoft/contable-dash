// api/ops.js — fusión de sueldos, vencimientos-alerta, keepalive
// Rutas:
//   GET  /api/ops?action=empleados          → listar empleados
//   GET  /api/ops?action=cronlog            → historial cron
//   POST /api/ops?action=agregar-empleado   → agregar empleado
//   POST /api/ops?action=liquidar           → liquidar sueldos del período
//   POST /api/ops?action=venc-alerta        → enviar email alertas vencimientos
//   GET  /api/ops?action=keepalive          → ping Supabase

import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

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

// ── SUELDOS ───────────────────────────────────────────────────────────────────
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
  return { jubilacion: jub, obra_social: os, pami: pa, ganancias: ga, salario_neto: rn(bruto - jub - os - pa - ga) }
}

// ── VENCIMIENTOS ──────────────────────────────────────────────────────────────
const VENCIMIENTOS_2026 = [
  { id: 'iva-01', nombre: 'IVA Enero 2026', tipo: 'IVA', fecha: '2026-02-20' },
  { id: 'iva-02', nombre: 'IVA Febrero 2026', tipo: 'IVA', fecha: '2026-03-20' },
  { id: 'iva-03', nombre: 'IVA Marzo 2026', tipo: 'IVA', fecha: '2026-04-21' },
  { id: 'iva-04', nombre: 'IVA Abril 2026', tipo: 'IVA', fecha: '2026-05-20' },
  { id: 'iva-05', nombre: 'IVA Mayo 2026', tipo: 'IVA', fecha: '2026-06-22' },
  { id: 'iva-06', nombre: 'IVA Junio 2026', tipo: 'IVA', fecha: '2026-07-20' },
  { id: 'iva-07', nombre: 'IVA Julio 2026', tipo: 'IVA', fecha: '2026-08-20' },
  { id: 'iva-08', nombre: 'IVA Agosto 2026', tipo: 'IVA', fecha: '2026-09-21' },
  { id: 'iva-09', nombre: 'IVA Septiembre 2026', tipo: 'IVA', fecha: '2026-10-20' },
  { id: 'iva-10', nombre: 'IVA Octubre 2026', tipo: 'IVA', fecha: '2026-11-20' },
  { id: 'iva-11', nombre: 'IVA Noviembre 2026', tipo: 'IVA', fecha: '2026-12-21' },
  { id: 'f931-01', nombre: 'F931 Enero 2026', tipo: 'F931', fecha: '2026-02-10' },
  { id: 'f931-02', nombre: 'F931 Febrero 2026', tipo: 'F931', fecha: '2026-03-10' },
  { id: 'f931-03', nombre: 'F931 Marzo 2026', tipo: 'F931', fecha: '2026-04-10' },
  { id: 'f931-04', nombre: 'F931 Abril 2026', tipo: 'F931', fecha: '2026-05-12' },
  { id: 'f931-05', nombre: 'F931 Mayo 2026', tipo: 'F931', fecha: '2026-06-10' },
  { id: 'f931-06', nombre: 'F931 Junio 2026', tipo: 'F931', fecha: '2026-07-10' },
  { id: 'f931-07', nombre: 'F931 Julio 2026', tipo: 'F931', fecha: '2026-08-10' },
  { id: 'f931-08', nombre: 'F931 Agosto 2026', tipo: 'F931', fecha: '2026-09-10' },
  { id: 'f931-09', nombre: 'F931 Septiembre 2026', tipo: 'F931', fecha: '2026-10-12' },
  { id: 'f931-10', nombre: 'F931 Octubre 2026', tipo: 'F931', fecha: '2026-11-10' },
  { id: 'f931-11', nombre: 'F931 Noviembre 2026', tipo: 'F931', fecha: '2026-12-10' },
  { id: 'gan-ant1', nombre: 'Ganancias Anticipo 1/5', tipo: 'Ganancias', fecha: '2026-03-20' },
  { id: 'gan-ant2', nombre: 'Ganancias Anticipo 2/5', tipo: 'Ganancias', fecha: '2026-05-20' },
  { id: 'gan-ant3', nombre: 'Ganancias Anticipo 3/5', tipo: 'Ganancias', fecha: '2026-07-20' },
  { id: 'gan-ant4', nombre: 'Ganancias Anticipo 4/5', tipo: 'Ganancias', fecha: '2026-09-21' },
  { id: 'gan-ant5', nombre: 'Ganancias Anticipo 5/5', tipo: 'Ganancias', fecha: '2026-11-20' },
  { id: 'gan-dj', nombre: 'Ganancias DJ Anual 2025', tipo: 'Ganancias', fecha: '2026-06-22' },
  { id: 'bp-2025', nombre: 'Bienes Personales DJ 2025', tipo: 'Bienes Pers.', fecha: '2026-06-22' },
  { id: 'mono-1', nombre: 'Recategorización Monotributo', tipo: 'Monotributo', fecha: '2026-01-20' },
  { id: 'mono-2', nombre: 'Recategorización Monotributo', tipo: 'Monotributo', fecha: '2026-05-20' },
  { id: 'mono-3', nombre: 'Recategorización Monotributo', tipo: 'Monotributo', fecha: '2026-09-21' },
]

function diasRestantes(fechaStr) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return Math.ceil((new Date(fechaStr + 'T00:00:00') - hoy) / (1000*60*60*24))
}
function formatFecha(fechaStr) {
  const d = new Date(fechaStr + 'T00:00:00')
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return d.getDate() + ' de ' + meses[d.getMonth()] + ' de ' + d.getFullYear()
}
function buildEmailHtml(criticos, urgentes) {
  let rows = ''
  criticos.forEach(v => {
    const dias = diasRestantes(v.fecha)
    const label = dias < 0 ? ('VENCIDO hace ' + Math.abs(dias) + ' d') : (dias === 0 ? 'HOY' : 'en ' + dias + ' días')
    rows += '<tr style="background:#FCEBEB"><td style="padding:10px 12px;border-bottom:1px solid #F7C1C1;font-weight:600;color:#A32D2D">⚠ ' + label + '</td><td style="padding:10px 12px;border-bottom:1px solid #F7C1C1">' + v.nombre + '</td><td style="padding:10px 12px;border-bottom:1px solid #F7C1C1;color:#666;font-size:12px">' + v.tipo + '</td><td style="padding:10px 12px;border-bottom:1px solid #F7C1C1;font-size:12px">' + formatFecha(v.fecha) + '</td></tr>'
  })
  urgentes.forEach(v => {
    const dias = diasRestantes(v.fecha)
    rows += '<tr><td style="padding:10px 12px;border-bottom:1px solid #eee;color:#854F0B">· en ' + dias + ' días</td><td style="padding:10px 12px;border-bottom:1px solid #eee">' + v.nombre + '</td><td style="padding:10px 12px;border-bottom:1px solid #eee;color:#666;font-size:12px">' + v.tipo + '</td><td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:12px">' + formatFecha(v.fecha) + '</td></tr>'
  })
  return '<!DOCTYPE html><html><body style="font-family:sans-serif;background:#F4EFE6;margin:0;padding:20px"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0"><div style="background:#1A1A1A;padding:24px 28px;color:#F4EFE6"><h1 style="margin:0;font-size:20px;font-weight:600">PymeStudio — Alerta de Vencimientos</h1><p style="margin:6px 0 0;font-size:13px;color:rgba(244,239,230,.7)">' + new Date().toLocaleDateString('es-AR', {weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '</p></div><div style="padding:24px 28px"><p style="font-size:14px;color:#3A3A36;margin:0 0 20px">Tenés <strong>' + criticos.length + ' obligación/es crítica/s</strong> y <strong>' + urgentes.length + ' próximas</strong>:</p><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#F4EFE6"><th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#7A746A">Estado</th><th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#7A746A">Obligación</th><th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#7A746A">Tipo</th><th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#7A746A">Vencimiento</th></tr></thead><tbody>' + rows + '</tbody></table></div><div style="padding:16px 28px;background:#F4EFE6;border-top:1px solid #e0e0e0"><a href="https://dashbi.pymestudio.xyz" style="display:inline-block;background:#C24A1F;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;font-size:13px;font-weight:500">Ver en el Dashboard →</a><p style="margin:12px 0 0;font-size:11px;color:#7A746A">PymeStudio · <a href="https://pymestudio.xyz" style="color:#7A746A">pymestudio.xyz</a></p></div></div></body></html>'
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const action = req.query.action

  // ── Keepalive (no requiere auth) ──
  if (action === 'keepalive') {
    const start = Date.now()
    try {
      let pingRes = await fetch(process.env.SUPABASE_URL + '/rest/v1/usuarios?limit=1', {
        headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY }
      })
      if (pingRes.status === 404) {
        pingRes = await fetch(process.env.SUPABASE_URL + '/rest/v1/', {
          headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY }
        })
      }
      const ms = Date.now() - start
      return res.status(200).json({ ok: pingRes.ok, status: pingRes.status, ms, timestamp: new Date().toISOString() })
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, ms: Date.now() - start })
    }
  }

  // ── Vencimientos alerta (no requiere auth, usa RESEND_TO_EMAIL) ──
  if (action === 'venc-alerta') {
    try {
      const criticos = VENCIMIENTOS_2026.filter(v => { const d = diasRestantes(v.fecha); return d >= -7 && d <= 3 })
      const urgentes = VENCIMIENTOS_2026.filter(v => { const d = diasRestantes(v.fecha); return d > 3 && d <= 10 })
      if (!criticos.length && !urgentes.length)
        return res.status(200).json({ ok: true, message: 'Sin vencimientos urgentes', sent: false })
      const toEmail = process.env.RESEND_TO_EMAIL || req.body?.email
      if (!toEmail) return res.status(400).json({ error: 'No hay email destino configurado' })
      const subject = criticos.length > 0
        ? 'URGENTE: ' + criticos.length + ' obligación/es fiscal/es vencen pronto — PymeStudio'
        : (criticos.length + urgentes.length) + ' vencimientos próximos — PymeStudio'
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL || 'alertas@pymestudio.xyz', to: [toEmail], subject, html: buildEmailHtml(criticos, urgentes) })
      })
      const resendData = await resendRes.json()
      if (!resendRes.ok) return res.status(500).json({ error: 'Error al enviar email', detail: resendData })
      return res.status(200).json({ ok: true, sent: true, email: toEmail, criticos: criticos.length, urgentes: urgentes.length, resend_id: resendData.id })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── Sueldos (requiere auth) ──
  const auth = await getAuth(req)
  if (!auth?.cuit) return res.status(401).json({ error: 'No autorizado' })

  if (action === 'empleados' && req.method === 'GET') {
    const { data, error } = await sb.from('empleados').select('*').eq('cuit_usuario', auth.cuit).neq('estado', 'baja').order('apellido')
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }
  if (action === 'cronlog' && req.method === 'GET') {
    const { data } = await sb.from('cron_log').select('*').eq('cuit_usuario', auth.cuit).order('ejecutado_at', { ascending: false }).limit(20)
    return res.json(data ?? [])
  }
  if (action === 'agregar-empleado' && req.method === 'POST') {
    const { data, error } = await sb.from('empleados').insert({ ...req.body, cuit_usuario: auth.cuit }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }
  if (action === 'liquidar' && req.method === 'POST') {
    const { periodo } = req.body ?? {}
    if (!periodo) return res.status(400).json({ error: 'periodo requerido' })
    const { data: emp } = await sb.from('empleados').select('*').eq('cuit_usuario', auth.cuit).eq('estado', 'activo')
    const rows = (emp ?? []).map(e => ({ cuit_usuario: auth.cuit, empleado_id: e.id, periodo, salario_bruto: e.salario_bruto, ...liquidar(e.salario_bruto) }))
    if (!rows.length) return res.json({ ok: true, count: 0 })
    const { error } = await sb.from('liquidaciones').upsert(rows, { onConflict: 'empleado_id,periodo' })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, count: rows.length })
  }

  return res.status(400).json({ error: 'action inválido. Usá: empleados, cronlog, agregar-empleado, liquidar, venc-alerta, keepalive' })
}
