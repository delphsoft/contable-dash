// Cron 8AM — alerta de vencimientos próximos (≤3 días)

const VENCIMIENTOS_2026 = [
  { id:'iva-01', nombre:'IVA Enero 2026',             fecha:'2026-02-20', tipo:'IVA' },
  { id:'iva-02', nombre:'IVA Febrero 2026',           fecha:'2026-03-20', tipo:'IVA' },
  { id:'iva-03', nombre:'IVA Marzo 2026',             fecha:'2026-04-22', tipo:'IVA' },
  { id:'iva-04', nombre:'IVA Abril 2026',             fecha:'2026-05-21', tipo:'IVA' },
  { id:'iva-05', nombre:'IVA Mayo 2026',              fecha:'2026-06-22', tipo:'IVA' },
  { id:'iva-06', nombre:'IVA Junio 2026',             fecha:'2026-07-21', tipo:'IVA' },
  { id:'iva-07', nombre:'IVA Julio 2026',             fecha:'2026-08-20', tipo:'IVA' },
  { id:'iva-08', nombre:'IVA Agosto 2026',            fecha:'2026-09-21', tipo:'IVA' },
  { id:'iva-09', nombre:'IVA Septiembre 2026',        fecha:'2026-10-21', tipo:'IVA' },
  { id:'iva-10', nombre:'IVA Octubre 2026',           fecha:'2026-11-20', tipo:'IVA' },
  { id:'iva-11', nombre:'IVA Noviembre 2026',         fecha:'2026-12-21', tipo:'IVA' },
  { id:'iva-12', nombre:'IVA Diciembre 2026',         fecha:'2027-01-20', tipo:'IVA' },
  { id:'gan-01', nombre:'Anticipo Ganancias 1° 2026', fecha:'2026-03-16', tipo:'Ganancias' },
  { id:'gan-02', nombre:'Anticipo Ganancias 2° 2026', fecha:'2026-05-15', tipo:'Ganancias' },
  { id:'gan-03', nombre:'Anticipo Ganancias 3° 2026', fecha:'2026-07-15', tipo:'Ganancias' },
  { id:'gan-04', nombre:'Anticipo Ganancias 4° 2026', fecha:'2026-09-15', tipo:'Ganancias' },
  { id:'gan-05', nombre:'Anticipo Ganancias 5° 2026', fecha:'2026-11-16', tipo:'Ganancias' },
  { id:'gan-06', nombre:'DDJJ Ganancias 2025',        fecha:'2026-05-11', tipo:'Ganancias' },
  { id:'bp-01',  nombre:'DDJJ Bienes Personales 2025',fecha:'2026-06-22', tipo:'BienesPersonales' },
  { id:'ib-01',  nombre:'IIBB Bimestre Ene-Feb 2026', fecha:'2026-03-20', tipo:'IIBB' },
  { id:'ib-02',  nombre:'IIBB Bimestre Mar-Abr 2026', fecha:'2026-05-20', tipo:'IIBB' },
  { id:'ib-03',  nombre:'IIBB Bimestre May-Jun 2026', fecha:'2026-07-20', tipo:'IIBB' },
  { id:'ib-04',  nombre:'IIBB Bimestre Jul-Ago 2026', fecha:'2026-09-21', tipo:'IIBB' },
  { id:'ib-05',  nombre:'IIBB Bimestre Sep-Oct 2026', fecha:'2026-11-20', tipo:'IIBB' },
  { id:'ib-06',  nombre:'IIBB Bimestre Nov-Dic 2026', fecha:'2027-01-20', tipo:'IIBB' },
  { id:'ss-01',  nombre:'Cargas Sociales Enero 2026',     fecha:'2026-02-10', tipo:'Sueldos' },
  { id:'ss-02',  nombre:'Cargas Sociales Febrero 2026',   fecha:'2026-03-10', tipo:'Sueldos' },
  { id:'ss-03',  nombre:'Cargas Sociales Marzo 2026',     fecha:'2026-04-10', tipo:'Sueldos' },
  { id:'ss-04',  nombre:'Cargas Sociales Abril 2026',     fecha:'2026-05-11', tipo:'Sueldos' },
  { id:'ss-05',  nombre:'Cargas Sociales Mayo 2026',      fecha:'2026-06-10', tipo:'Sueldos' },
  { id:'ss-06',  nombre:'Cargas Sociales Junio 2026',     fecha:'2026-07-10', tipo:'Sueldos' },
  { id:'ss-07',  nombre:'Cargas Sociales Julio 2026',     fecha:'2026-08-10', tipo:'Sueldos' },
  { id:'ss-08',  nombre:'Cargas Sociales Agosto 2026',    fecha:'2026-09-10', tipo:'Sueldos' },
  { id:'ss-09',  nombre:'Cargas Sociales Septiembre 2026',fecha:'2026-10-12', tipo:'Sueldos' },
  { id:'ss-10',  nombre:'Cargas Sociales Octubre 2026',   fecha:'2026-11-10', tipo:'Sueldos' },
  { id:'ss-11',  nombre:'Cargas Sociales Noviembre 2026', fecha:'2026-12-10', tipo:'Sueldos' },
  { id:'ss-12',  nombre:'Cargas Sociales Diciembre 2026', fecha:'2027-01-12', tipo:'Sueldos' },
]

function diasRestantes(fecha) {
  const hoy  = new Date(); hoy.setHours(0, 0, 0, 0)
  const venc = new Date(fecha + 'T00:00:00')
  return Math.ceil((venc - hoy) / 86400000)
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const hoy = new Date().toISOString().split('T')[0]

  const alertas = VENCIMIENTOS_2026
    .map(v => ({ ...v, dias: diasRestantes(v.fecha) }))
    .filter(v => v.dias >= 0 && v.dias <= 3)
    .sort((a, b) => a.dias - b.dias)

  const vencidos = VENCIMIENTOS_2026
    .map(v => ({ ...v, dias: diasRestantes(v.fecha) }))
    .filter(v => v.dias < 0 && v.dias >= -7)

  const payload = {
    fecha: hoy,
    alertas,
    vencidos,
    total_criticos: alertas.length,
    total_vencidos_semana: vencidos.length,
  }

  // Si hay webhook configurado, dispararlo
  const webhookUrl = process.env.ALERTA_WEBHOOK_URL
  if (webhookUrl && (alertas.length > 0 || vencidos.length > 0)) {
    const lines = []
    if (vencidos.length > 0) {
      lines.push(`🔴 *Vencimientos sin cumplir (últimos 7 días):*`)
      vencidos.forEach(v => lines.push(`  • ${v.nombre} — venció hace ${Math.abs(v.dias)}d`))
    }
    if (alertas.length > 0) {
      lines.push(`⚠️ *Vencimientos en los próximos 3 días:*`)
      alertas.forEach(v => lines.push(`  • ${v.nombre} — ${v.dias === 0 ? '¡HOY!' : `en ${v.dias}d`}`))
    }
    const text = lines.join('\n')
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
    } catch (e) {
      console.error('[vencimientos-alerta] webhook error:', e.message)
    }
  }

  return res.status(200).json(payload)
}
