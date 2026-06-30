// api/rag-query.js — RAG estático para PymeStudio / DashBI
// Reemplaza el servicio pymes-rag (Railway) — corre como function de Vercel
// dentro de contable-dash. Búsqueda por keyword + scoring, sin vector DB.
//
// Por qué sin vector DB: con 50 chunks, una búsqueda keyword bien ponderada
// es suficientemente precisa. Si el corpus supera ~500 chunks, migrar a
// embeddings (ver nota al final del archivo).

import chunks from '../data/chunks.json' assert { type: 'json' }

// ── Normalización de texto para matching ────────────────────────────────────
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Stopwords en español — no aportan a la relevancia de la búsqueda
const STOPWORDS = new Set([
  'el','la','los','las','un','una','unos','unas','de','del','en','a','al',
  'y','o','que','es','son','para','por','con','su','sus','mi','mis','tu','tus',
  'como','cuando','donde','cual','cuales','que','quien','quienes','este','esta',
  'estos','estas','ese','esa','esos','esas','se','le','les','lo','si','no',
  'mas','muy','pero','sin','sobre','tambien','ya','fue','ser','estar','tener'
])

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
}

// ── Scoring de relevancia ────────────────────────────────────────────────────
function scoreChunk(queryTokens, chunk) {
  const textTokens = tokenize(chunk.text)
  const sourceTokens = tokenize(chunk.source_name)
  const questionTokens = (chunk.questions || []).flatMap(q => tokenize(q))

  let score = 0

  for (const qt of queryTokens) {
    // Match exacto en preguntas pre-cargadas = señal más fuerte
    if (questionTokens.includes(qt)) score += 5

    // Match en el nombre de la fuente = señal fuerte
    if (sourceTokens.includes(qt)) score += 3

    // Match en el cuerpo del texto = señal base, cuenta ocurrencias
    const occurrences = textTokens.filter(t => t === qt).length
    score += occurrences * 1.5

    // Match parcial (substring) como fallback más débil
    if (textTokens.some(t => t.includes(qt) || qt.includes(t))) score += 0.5
  }

  // Ponderar por quality_score del chunk (0-10 → multiplicador 0.8-1.2)
  const qualityMultiplier = 0.8 + (chunk.quality_score / 10) * 0.4
  return score * qualityMultiplier
}

// ── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === 'GET' && req.query?.health !== undefined) {
    return res.status(200).json({
      status: 'ok',
      indexed_chunks: chunks.length,
      has_data: chunks.length > 0,
      categories: [...new Set(chunks.map(c => c.category))],
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST with { query, top_k? }' })
  }

  const { query, top_k = 4, category } = req.body || {}

  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return res.status(400).json({ error: 'query es requerido (mínimo 3 caracteres)' })
  }

  try {
    const queryTokens = tokenize(query)

    if (queryTokens.length === 0) {
      return res.status(200).json({ ok: true, results: [], query })
    }

    let pool = chunks
    if (category) {
      pool = chunks.filter(c => c.category === category)
    }

    const scored = pool
      .map(chunk => ({ chunk, score: scoreChunk(queryTokens, chunk) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(top_k, 10))

    const results = scored.map(({ chunk, score }) => ({
      chunk_id: chunk.chunk_id,
      source_name: chunk.source_name,
      category: chunk.category,
      text: chunk.text,
      relevance_score: Math.round(score * 100) / 100,
    }))

    return res.status(200).json({
      ok: true,
      query,
      results,
      total_indexed: chunks.length,
    })

  } catch (err) {
    console.error('rag-query error:', err)
    return res.status(500).json({ error: 'Error interno', detalle: err.message })
  }
}

// ── Nota de escalabilidad ────────────────────────────────────────────────────
// Este enfoque (keyword scoring sobre JSON estático) es apropiado hasta
// ~300-500 chunks. Más allá de eso, considerar:
//   1. Embeddings con Supabase pgvector (ya está disponible en el proyecto)
//   2. O migrar a un índice externo (Qdrant, Pinecone)
// Con 50 chunks actuales, este enfoque es instantáneo (<5ms) y sin costo
// de infraestructura adicional — corre dentro de la misma function de Vercel.
