// api/core.js — fusión de chat, diagnostico, drive, mercadopago, parse-xlsx
// Rutas:
//   POST /api/core?action=chat         → proxy Anthropic
//   POST /api/core?action=diagnostico  → diagnóstico IA de empresa
//   POST /api/core?action=drive        → leer archivo Google Drive
//   POST /api/core?action=mp           → pagos MercadoPago
//   POST /api/core?action=parse-xlsx   → parsear XLSX base64

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const action = req.query.action

  if (action === 'chat')        return handleChat(req, res)
  if (action === 'diagnostico') return handleDiagnostico(req, res)
  if (action === 'drive')       return handleDrive(req, res)
  if (action === 'mp')          return handleMP(req, res)
  if (action === 'parse-xlsx')  return handleParseXlsx(req, res)

  return res.status(400).json({ error: 'action inválido. Usá: chat, diagnostico, drive, mp, parse-xlsx' })
}

// ── CHAT ──────────────────────────────────────────────────────────────────────
async function handleChat(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada' })
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1024, ...req.body }),
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Anthropic API error' })
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error: ' + err.message })
  }
}

// ── DIAGNÓSTICO ───────────────────────────────────────────────────────────────
async function handleDiagnostico(req, res) {
  const { contexto, archivos } = req.body
  if (!contexto || contexto.trim().length < 20) return res.status(400).json({ error: 'Contexto insuficiente' })
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key no configurada' })

  const systemPrompt = `Sos un contador público argentino senior especializado en PyMEs.
Analizás el contexto de una empresa y devolvés un diagnóstico estructurado en JSON.
REGLAS:
- Respondé SOLO con JSON válido, sin texto extra, sin markdown, sin bloques de código
- Usá conocimiento de normativa ARCA/AFIP 2025-2026 vigente
- Sé específico y accionable, no genérico
ESTRUCTURA JSON obligatoria:
{
  "empresa": "nombre o tipo de empresa detectado",
  "actividad": "actividad principal detectada",
  "regimen": "Monotributo Cat X / Responsable Inscripto / No identificado",
  "score": número entre 0 y 100,
  "score_descripcion": "frase corta explicando el score",
  "alertas_criticas": [{ "texto": "descripción del riesgo crítico" }],
  "metricas": [{ "label": "nombre métrica", "valor": "valor", "sub": "aclaración" }],
  "dimensiones": [
    { "id": "fiscal", "nombre": "Fiscal / impositiva", "riesgo": 0-4, "nota": "análisis específico", "tags": [] },
    { "id": "laboral", "nombre": "Laboral / cargas sociales", "riesgo": 0-4, "nota": "análisis específico", "tags": [] },
    { "id": "societaria", "nombre": "Societaria", "riesgo": 0-4, "nota": "análisis específico", "tags": [] },
    { "id": "financiera", "nombre": "Financiera", "riesgo": 0-4, "nota": "análisis específico", "tags": [] },
    { "id": "estrategica", "nombre": "Estratégica", "riesgo": 0-4, "nota": "análisis específico", "tags": [] }
  ],
  "recomendaciones": [{ "urgencia": "ur|me|ok", "tag": "Esta semana|Este mes|Oportunidad|Verificar|Antes de expandir", "texto": "recomendación específica" }]
}`

  const userPrompt = `Analizá esta empresa argentina y devolvé el diagnóstico JSON:\n\nCONTEXTO:\n${contexto}\n\n${archivos?.length ? 'ARCHIVOS: ' + archivos.join(', ') : ''}\n\nIdentificá: régimen impositivo, situación laboral, estructura societaria, flujo de caja, oportunidades estratégicas.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1500, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] })
    })
    if (!response.ok) {
      const err = await response.json()
      return res.status(502).json({ error: 'Error al consultar IA', detalle: err.error?.message })
    }
    const data = await response.json()
    const texto = data.content[0].text.trim()
    let diagnostico
    try { diagnostico = JSON.parse(texto) }
    catch {
      const match = texto.match(/\{[\s\S]*\}/)
      if (match) diagnostico = JSON.parse(match[0])
      else throw new Error('Respuesta no es JSON válido')
    }
    return res.status(200).json({ ok: true, diagnostico })
  } catch (err) {
    return res.status(500).json({ error: 'Error interno', detalle: err.message })
  }
}

// ── DRIVE ─────────────────────────────────────────────────────────────────────
async function handleDrive(req, res) {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!saJson) return res.status(500).json({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON no configurada' })
  const { fileId } = req.body
  if (!fileId) return res.status(400).json({ error: 'fileId requerido' })
  try {
    const sa = JSON.parse(saJson)
    const now = Math.floor(Date.now()/1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const claim = { iss: sa.client_email, scope: 'https://www.googleapis.com/auth/drive.readonly', aud: 'https://oauth2.googleapis.com/token', exp: now+3600, iat: now }
    const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url')
    const { createSign } = await import('crypto')
    const sign = createSign('RSA-SHA256')
    sign.update(`${b64(header)}.${b64(claim)}`)
    const jwt = `${b64(header)}.${b64(claim)}.${sign.sign(sa.private_key,'base64url')}`
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    })
    const tokenData = await tokenResp.json()
    if (!tokenData.access_token) return res.status(401).json({ error: 'No se pudo autenticar con Google' })
    const accessToken = tokenData.access_token
    const metaResp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,size`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
    const meta = await metaResp.json()
    if (meta.error) return res.status(400).json({ error: `Drive: ${meta.error.message}` })
    const fileResp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
    const buffer = Buffer.from(await fileResp.arrayBuffer())
    const rows = Math.max(1, Math.floor(buffer.length / 200))
    return res.status(200).json({ success: true, fileName: meta.name, rows, parsed: { raw: true, rows: [], headers: [], note: 'Archivo descargado. Implementar parser xlsx para extraer datos.' } })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// ── MERCADO PAGO ──────────────────────────────────────────────────────────────
async function handleMP(req, res) {
  const token = req.body?.token || process.env.MP_ACCESS_TOKEN
  if (!token) return res.status(400).json({ error: 'Token de MercadoPago requerido' })
  try {
    const MY_PAYER_ID = process.env.MP_PAYER_ID || '0'
    const resp = await fetch('https://api.mercadopago.com/v1/payments/search?limit=100&sort=date_created&criteria=desc', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await resp.json()
    if (!resp.ok) return res.status(resp.status).json({ error: data.message || 'MP API error' })
    const payments = data.results || []
    const recibidos = payments.filter(p => String(p.payer?.id) !== MY_PAYER_ID)
    const enviados  = payments.filter(p => String(p.payer?.id) === MY_PAYER_ID)
    return res.status(200).json({ recibidos, enviados, total: payments.length })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// ── PARSE XLSX ────────────────────────────────────────────────────────────────
async function handleParseXlsx(req, res) {
  try {
    const { base64, name } = req.body
    const buffer = Buffer.from(base64, 'base64')
    const content = buffer.toString('utf8', 'ignore')
    const sharedStrings = (content.match(/<t[^>]*>/g) || []).length
    const rows = Math.max(1, Math.floor(sharedStrings / 5))
    return res.status(200).json({ success: true, fileName: name, rows, parsed: { raw: true, rows: [], headers: [], note: 'Archivo recibido. Para parsing completo instalá xlsx: npm i xlsx' } })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
