// api/diagnostico.js — Diagnóstico IA con RAG estático integrado
// Ya no depende de pymes-rag en Railway. El RAG corre en la misma function
// de Vercel (api/rag-query.js) consultando data/chunks.json directamente.

import chunks from '../data/chunks.json' assert { type: 'json' }

// ── RAG inline — mismo motor que rag-query.js, reutilizado aquí ────────────
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const STOPWORDS = new Set([
  'el','la','los','las','un','una','unos','unas','de','del','en','a','al',
  'y','o','que','es','son','para','por','con','su','sus','mi','mis','tu','tus',
  'como','cuando','donde','cual','cuales','quien','quienes','este','esta',
  'estos','estas','ese','esa','esos','esas','se','le','les','lo','si','no',
  'mas','muy','pero','sin','sobre','tambien','ya','fue','ser','estar','tener'
])

function tokenize(text) {
  return normalize(text).split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w))
}

function scoreChunk(queryTokens, chunk) {
  const textTokens = tokenize(chunk.text)
  const sourceTokens = tokenize(chunk.source_name)
  const questionTokens = (chunk.questions || []).flatMap(q => tokenize(q))
  let score = 0
  for (const qt of queryTokens) {
    if (questionTokens.includes(qt)) score += 5
    if (sourceTokens.includes(qt)) score += 3
    score += textTokens.filter(t => t === qt).length * 1.5
    if (textTokens.some(t => t.includes(qt) || qt.includes(t))) score += 0.5
  }
  return score * (0.8 + (chunk.quality_score / 10) * 0.4)
}

function ragQuery(query, topK = 4) {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []
  return chunks
    .map(chunk => ({ chunk, score: scoreChunk(queryTokens, chunk) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk)
}

// ── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { contexto, archivos } = req.body

  if (!contexto || contexto.trim().length < 20) {
    return res.status(400).json({ error: 'Contexto insuficiente' })
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key no configurada' })
  }

  // ── Consultar el RAG con el contexto del usuario ──────────────────────────
  const relevantChunks = ragQuery(contexto, 5)
  const ragContext = relevantChunks.length > 0
    ? relevantChunks.map(c =>
        `[${c.source_name}]\n${c.text}`
      ).join('\n\n---\n\n')
    : ''

  const systemPrompt = `Sos un contador público argentino senior especializado en PyMEs,
con conocimiento profundo de normativa ARCA/AFIP 2025-2026, frameworks de
consultoría estratégica (McKinsey, BCG, MIT), y metodologías de crecimiento
(YC, a16z, Lean Startup). Analizás el contexto de una empresa y devolvés
un diagnóstico estructurado en JSON.

${ragContext ? `CONOCIMIENTO RELEVANTE PARA ESTE CASO (usalo para fundamentar tu análisis):
${ragContext}

` : ''}REGLAS:
- Respondé SOLO con JSON válido, sin texto extra, sin markdown, sin bloques de código
- Usá conocimiento de normativa ARCA/AFIP 2025-2026 vigente
- Si hay conocimiento relevante arriba, fundamentá tu análisis en él explícitamente
- Sé específico y accionable, no genérico
- Los montos en pesos argentinos
- Estructurá al menos una recomendación usando la técnica de contraste
  (estado actual vs estado posible, con números concretos)

ESTRUCTURA JSON obligatoria:
{
  "empresa": "nombre o tipo de empresa detectado",
  "actividad": "actividad principal detectada",
  "regimen": "Monotributo Cat X / Responsable Inscripto / No identificado",
  "score": número entre 0 y 100,
  "score_descripcion": "frase corta explicando el score",
  "alertas_criticas": [
    { "texto": "descripción del riesgo crítico" }
  ],
  "metricas": [
    { "label": "nombre métrica", "valor": "valor", "sub": "aclaración" }
  ],
  "dimensiones": [
    { "id": "fiscal", "nombre": "Fiscal / impositiva", "riesgo": 0-4, "nota": "...", "tags": [] },
    { "id": "laboral", "nombre": "Laboral / cargas sociales", "riesgo": 0-4, "nota": "...", "tags": [] },
    { "id": "societaria", "nombre": "Societaria", "riesgo": 0-4, "nota": "...", "tags": [] },
    { "id": "financiera", "nombre": "Financiera", "riesgo": 0-4, "nota": "...", "tags": [] },
    { "id": "estrategica", "nombre": "Estratégica", "riesgo": 0-4, "nota": "...", "tags": [] }
  ],
  "recomendaciones": [
    { "urgencia": "ur|me|ok", "tag": "Esta semana|Este mes|Oportunidad", "texto": "..." }
  ],
  "fuentes_consultadas": ["nombres de los chunks de conocimiento usados, si aplica"]
}`

  const userPrompt = `Analizá esta empresa argentina y devolvé el diagnóstico JSON:

CONTEXTO DE LA EMPRESA:
${contexto}

${archivos && archivos.length > 0 ? 'ARCHIVOS ADJUNTOS: ' + archivos.join(', ') : ''}

Identificá: régimen impositivo, situación laboral, estructura societaria, flujo de caja,
oportunidades estratégicas. Calculá métricas financieras si hay montos mencionados.
Priorizá las recomendaciones por urgencia real.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Anthropic error:', err)
      return res.status(502).json({ error: 'Error al consultar IA', detalle: err.error?.message })
    }

    const data = await response.json()
    const texto = data.content[0].text.trim()

    let diagnostico
    try {
      diagnostico = JSON.parse(texto)
    } catch (e) {
      const match = texto.match(/\{[\s\S]*\}/)
      if (match) {
        diagnostico = JSON.parse(match[0])
      } else {
        throw new Error('Respuesta no es JSON válido')
      }
    }

    return res.status(200).json({
      ok: true,
      diagnostico,
      rag_chunks_used: relevantChunks.map(c => c.chunk_id)
    })

  } catch (err) {
    console.error('diagnostico.js error:', err)
    return res.status(500).json({ error: 'Error interno', detalle: err.message })
  }
}
