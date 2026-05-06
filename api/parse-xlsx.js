export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type')
  if (req.method==='OPTIONS') return res.status(200).end()
  if (req.method!=='POST') return res.status(405).json({error:'Method not allowed'})

  try {
    const { base64, name } = req.body
    const buffer = Buffer.from(base64,'base64')
    // Basic XLSX row estimation without external dep
    const content = buffer.toString('utf8','ignore')
    const sharedStrings = (content.match(/<t[^>]*>/g)||[]).length
    const rows = Math.max(1, Math.floor(sharedStrings / 5))
    return res.status(200).json({
      success:true, fileName:name, rows,
      parsed:{ raw:true, rows:[], headers:[], note:'Archivo recibido. Para parsing completo instalá xlsx: npm i xlsx' }
    })
  } catch(err) {
    return res.status(500).json({error:err.message})
  }
}
