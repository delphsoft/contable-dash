export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type')
  if (req.method==='OPTIONS') return res.status(200).end()
  if (req.method!=='POST') return res.status(405).json({error:'Method not allowed'})

  const sdkToken = process.env.AFIPSDK_ACCESS_TOKEN
  const cuit = process.env.AFIPSDK_CUIT || '20409378472'

  if (!sdkToken) {
    // Return mock CAE for demo
    return res.status(200).json({
      cae:'75116759655165',
      caeFchVto:'20260615',
      nroComp:'00000001',
      demo:true,
      message:'CAE demo — configurá AFIPSDK_ACCESS_TOKEN en Vercel para CAE reales'
    })
  }

  try {
    const { tipo, pv, cuit: cuitReceptor, monto, concepto } = req.body
    const tipoComp = tipo==='A'?1:tipo==='B'?6:11
    const fechaHoy = new Date().toISOString().slice(0,10).replace(/-/g,'')

    const response = await fetch(`https://app.afipsdk.com/api/v1/afip/requests`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${sdkToken}`,
      },
      body: JSON.stringify({
        environment:'production',
        method:'FECAESolicitar',
        params:{
          Auth:{Cuit:cuit},
          FeCAEReq:{
            FeCabReq:{CantReg:1,PtoVta:Number(pv||1),CbteTipo:tipoComp},
            FeDetReq:{FECAEDetRequest:[{
              Concepto:Number(concepto||1),
              DocTipo:80,DocNro:Number((cuitReceptor||'0').replace(/[-]/g,'')||0),
              CbteDesde:1,CbteHasta:1,CbteFch:fechaHoy,
              ImpTotal:Number(monto),ImpTotConc:0,ImpNeto:Number(monto),
              ImpOpEx:0,ImpIVA:0,ImpTrib:0,
              MonId:'PES',MonCotiz:1,
            }]}
          }
        }
      })
    })
    const data = await response.json()
    const det = data?.response?.FeDetResp?.FECAEDetResponse?.[0]
    if (det?.CAE) {
      return res.status(200).json({cae:det.CAE,caeFchVto:det.CAEFchVto,nroComp:det.CbteDesde})
    }
    return res.status(400).json({error:det?.Observaciones?.[0]?.Msg||'Error ARCA'})
  } catch(err) {
    return res.status(500).json({error:err.message})
  }
}
