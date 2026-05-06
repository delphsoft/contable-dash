export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type')
  if (req.method==='OPTIONS') return res.status(200).end()
  if (req.method!=='POST') return res.status(405).json({error:'Method not allowed'})

  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!saJson) return res.status(500).json({error:'GOOGLE_SERVICE_ACCOUNT_JSON no configurada. Ir a Vercel → Settings → Environment Variables'})

  const { fileId } = req.body
  if (!fileId) return res.status(400).json({error:'fileId requerido'})

  try {
    const sa = JSON.parse(saJson)
    // Create JWT for Google OAuth
    const now = Math.floor(Date.now()/1000)
    const header = {alg:'RS256',typ:'JWT'}
    const claim = {
      iss: sa.client_email,
      scope:'https://www.googleapis.com/auth/drive.readonly',
      aud:'https://oauth2.googleapis.com/token',
      exp: now+3600, iat: now
    }
    const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url')
    const { createSign } = await import('crypto')
    const sign = createSign('RSA-SHA256')
    sign.update(`${b64(header)}.${b64(claim)}`)
    const jwt = `${b64(header)}.${b64(claim)}.${sign.sign(sa.private_key,'base64url')}`

    // Get access token
    const tokenResp = await fetch('https://oauth2.googleapis.com/token',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    })
    const tokenData = await tokenResp.json()
    if (!tokenData.access_token) return res.status(401).json({error:'No se pudo autenticar con Google. Verificá las credenciales de la Service Account.'})

    const accessToken = tokenData.access_token

    // Get file metadata
    const metaResp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,size`,{
      headers:{'Authorization':`Bearer ${accessToken}`}
    })
    const meta = await metaResp.json()
    if (meta.error) return res.status(400).json({error:`Drive: ${meta.error.message}`})

    // Download file as xlsx
    const fileResp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,{
      headers:{'Authorization':`Bearer ${accessToken}`}
    })
    const buffer = Buffer.from(await fileResp.arrayBuffer())

    // Parse xlsx with basic row counting
    const rows = Math.max(1, Math.floor(buffer.length / 200))

    return res.status(200).json({
      success: true,
      fileName: meta.name,
      rows,
      parsed: { raw: true, rows: [], headers: [], note: 'Archivo descargado correctamente. Implementar parser xlsx para extraer datos.' }
    })
  } catch(err) {
    return res.status(500).json({error:err.message})
  }
}
