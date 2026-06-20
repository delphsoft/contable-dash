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

  const systemPrompt = `Sos un contador público argentino senior especializado en PyMEs.
Analizás el contexto de una empresa y devolvés un diagnóstico estructurado en JSON.

REGLAS:
- Respondé SOLO con JSON válido, sin texto extra, sin markdown, sin bloques de código
- Usá conocimiento de normativa ARCA/AFIP 2025-2026 vigente
- Sé específico y accionable, no genérico
- Los montos en pesos argentinos

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
    {
      "id": "fiscal",
      "nombre": "Fiscal / impositiva",
      "riesgo": 0-4,
      "nota": "análisis específico de 1-2 oraciones",
      "tags": ["tag1", "tag2"]
    },
    {
      "id": "laboral",
      "nombre": "Laboral / cargas sociales",
      "riesgo": 0-4,
      "nota": "análisis específico",
      "tags": []
    },
    {
      "id": "societaria",
      "nombre": "Societaria",
      "riesgo": 0-4,
      "nota": "análisis específico",
      "tags": []
    },
    {
      "id": "financiera",
      "nombre": "Financiera",
      "riesgo": 0-4,
      "nota": "análisis específico",
      "tags": []
    },
    {
      "id": "estrategica",
      "nombre": "Estratégica",
      "riesgo": 0-4,
      "nota": "análisis específico",
      "tags": []
    }
  ],
  "recomendaciones": [
    {
      "urgencia": "ur|me|ok",
      "tag": "Esta semana|Este mes|Oportunidad|Verificar|Antes de expandir",
      "texto": "recomendación específica y accionable con contexto de la empresa"
    }
  ]
}`

  const userPrompt = `Analizá esta empresa argentina y devolvé el diagnóstico JSON:

CONTEXTO DE LA EMPRESA:
${contexto}

${archivos && archivos.length > 0 ? 'ARCHIVOS ADJUNTOS: ' + archivos.join(', ') : ''}

Identificá: régimen impositivo, situación laboral, estructura societaria, flujo de caja, oportunidades estratégicas. Calculá métricas financieras si hay montos mencionados. Priorizá las recomendaciones por urgencia real.`

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
        max_tokens: 1500,
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

    return res.status(200).json({ ok: true, diagnostico })

  } catch (err) {
    console.error('diagnostico.js error:', err)
    return res.status(500).json({ error: 'Error interno', detalle: err.message })
  }
}
