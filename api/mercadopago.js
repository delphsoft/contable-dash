export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type')
  if (req.method==='OPTIONS') return res.status(200).end()
  if (req.method!=='POST') return res.status(405).json({error:'Method not allowed'})

  const token = req.body?.token || process.env.MP_ACCESS_TOKEN
  if (!token) return res.status(400).json({error:'Token de MercadoPago requerido'})

  try {
    const MY_PAYER_ID = process.env.MP_PAYER_ID || '0'
    const resp = await fetch(`https://api.mercadopago.com/v1/payments/search?limit=100&sort=date_created&criteria=desc`,{
      headers:{'Authorization':`Bearer ${token}`}
    })
    const data = await resp.json()
    if (!resp.ok) return res.status(resp.status).json({error:data.message||'MP API error'})

    const payments = data.results||[]
    const recibidos = payments.filter(p=>String(p.payer?.id)!==MY_PAYER_ID)
    const enviados  = payments.filter(p=>String(p.payer?.id)===MY_PAYER_ID)
    return res.status(200).json({recibidos,enviados,total:payments.length})
  } catch(err) {
    return res.status(500).json({error:err.message})
  }
}
