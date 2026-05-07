export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { cuit } = req.query
  if (!cuit) return res.status(400).json({ error: 'CUIT requerido' })

  const clean = String(cuit).replace(/[-\s]/g, '')
  if (clean.length !== 11) return res.status(400).json({ error: 'CUIT inválido' })

  const sdkToken = process.env.AFIPSDK_ACCESS_TOKEN
  const AFIP_ENV = (() => {
    const e = process.env.AFIPSDK_ENV || 'prod'
    if (e === 'production') return 'prod'
    if (e === 'development') return 'dev'
    return e
  })()

  // If no SDK token, return demo data
  if (!sdkToken) {
    return res.status(200).json({
      razonSocial: 'DEMO - Configurá AFIPSDK_ACCESS_TOKEN',
      condicionIva: 'Monotributista',
      domicilio: 'Sin datos reales',
      estadoClave: 'ACTIVO',
      demo: true,
    })
  }

  try {
    const response = await fetch('https://app.afipsdk.com/api/v1/afip/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sdkToken}`,
      },
      body: JSON.stringify({
        environment: AFIP_ENV,
        method: 'getPersona',
        wsid: 'ws_sr_padron_a4',
        params: { idPersona: parseInt(clean) },
      }),
    })

    const data = await response.json()
    if (!response.ok) return res.status(400).json({ error: data?.message || 'Error consultando ARCA' })

    const persona = data?.persona || data
    const razonSocial = persona?.razonSocial ||
      [persona?.apellido, persona?.nombre].filter(Boolean).join(', ') ||
      'Sin datos'

    const tipoClave = persona?.tipoClave || ''
    const condicionIva = tipoClave === 'MONOTRIBUTO' ? 'Monotributista'
      : tipoClave === 'IVA_RESPONSABLE_INSCRIPTO' ? 'Responsable Inscripto'
      : tipoClave === 'IVA_EXENTO' ? 'IVA Exento'
      : tipoClave || 'Sin datos'

    const domicilio = persona?.domicilioFiscal
      ? `${persona.domicilioFiscal.direccion || ''} ${persona.domicilioFiscal.localidad || ''}`.trim()
      : null

    return res.status(200).json({
      razonSocial,
      condicionIva,
      domicilio,
      estadoClave: persona?.estadoClave || 'ACTIVO',
      esRI: tipoClave === 'IVA_RESPONSABLE_INSCRIPTO',
      esMono: tipoClave === 'MONOTRIBUTO',
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
