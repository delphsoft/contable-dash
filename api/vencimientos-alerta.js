// api/vencimientos-alerta.js
// Vercel Serverless Function — POST /api/vencimientos-alerta
// Envía email de alerta de vencimientos críticos via Resend
// Variables de entorno requeridas:
//   RESEND_API_KEY    — tu API key de Resend
//   RESEND_FROM_EMAIL — ej: alertas@pymestudio.xyz
//   RESEND_TO_EMAIL   — email del contador/cliente (o usar el del JWT)

var VENCIMIENTOS_2026 = [
  { id: 'iva-01',    nombre: 'IVA Enero 2026',              tipo: 'IVA',        fecha: '2026-02-20' },
  { id: 'iva-02',    nombre: 'IVA Febrero 2026',            tipo: 'IVA',        fecha: '2026-03-20' },
  { id: 'iva-03',    nombre: 'IVA Marzo 2026',              tipo: 'IVA',        fecha: '2026-04-21' },
  { id: 'iva-04',    nombre: 'IVA Abril 2026',              tipo: 'IVA',        fecha: '2026-05-20' },
  { id: 'iva-05',    nombre: 'IVA Mayo 2026',               tipo: 'IVA',        fecha: '2026-06-22' },
  { id: 'iva-06',    nombre: 'IVA Junio 2026',              tipo: 'IVA',        fecha: '2026-07-20' },
  { id: 'iva-07',    nombre: 'IVA Julio 2026',              tipo: 'IVA',        fecha: '2026-08-20' },
  { id: 'iva-08',    nombre: 'IVA Agosto 2026',             tipo: 'IVA',        fecha: '2026-09-21' },
  { id: 'iva-09',    nombre: 'IVA Septiembre 2026',         tipo: 'IVA',        fecha: '2026-10-20' },
  { id: 'iva-10',    nombre: 'IVA Octubre 2026',            tipo: 'IVA',        fecha: '2026-11-20' },
  { id: 'iva-11',    nombre: 'IVA Noviembre 2026',          tipo: 'IVA',        fecha: '2026-12-21' },
  { id: 'f931-01',   nombre: 'F931 Enero 2026',             tipo: 'F931',       fecha: '2026-02-10' },
  { id: 'f931-02',   nombre: 'F931 Febrero 2026',           tipo: 'F931',       fecha: '2026-03-10' },
  { id: 'f931-03',   nombre: 'F931 Marzo 2026',             tipo: 'F931',       fecha: '2026-04-10' },
  { id: 'f931-04',   nombre: 'F931 Abril 2026',             tipo: 'F931',       fecha: '2026-05-12' },
  { id: 'f931-05',   nombre: 'F931 Mayo 2026',              tipo: 'F931',       fecha: '2026-06-10' },
  { id: 'f931-06',   nombre: 'F931 Junio 2026',             tipo: 'F931',       fecha: '2026-07-10' },
  { id: 'f931-07',   nombre: 'F931 Julio 2026',             tipo: 'F931',       fecha: '2026-08-10' },
  { id: 'f931-08',   nombre: 'F931 Agosto 2026',            tipo: 'F931',       fecha: '2026-09-10' },
  { id: 'f931-09',   nombre: 'F931 Septiembre 2026',        tipo: 'F931',       fecha: '2026-10-12' },
  { id: 'f931-10',   nombre: 'F931 Octubre 2026',           tipo: 'F931',       fecha: '2026-11-10' },
  { id: 'f931-11',   nombre: 'F931 Noviembre 2026',         tipo: 'F931',       fecha: '2026-12-10' },
  { id: 'gan-ant1',  nombre: 'Ganancias Anticipo 1/5',      tipo: 'Ganancias',  fecha: '2026-03-20' },
  { id: 'gan-ant2',  nombre: 'Ganancias Anticipo 2/5',      tipo: 'Ganancias',  fecha: '2026-05-20' },
  { id: 'gan-ant3',  nombre: 'Ganancias Anticipo 3/5',      tipo: 'Ganancias',  fecha: '2026-07-20' },
  { id: 'gan-ant4',  nombre: 'Ganancias Anticipo 4/5',      tipo: 'Ganancias',  fecha: '2026-09-21' },
  { id: 'gan-ant5',  nombre: 'Ganancias Anticipo 5/5',      tipo: 'Ganancias',  fecha: '2026-11-20' },
  { id: 'gan-dj',    nombre: 'Ganancias DJ Anual 2025',     tipo: 'Ganancias',  fecha: '2026-06-22' },
  { id: 'bp-2025',   nombre: 'Bienes Personales DJ 2025',   tipo: 'Bienes Pers.', fecha: '2026-06-22' },
  { id: 'mono-recateg-1', nombre: 'Recategorización Monotributo', tipo: 'Monotributo', fecha: '2026-01-20' },
  { id: 'mono-recateg-2', nombre: 'Recategorización Monotributo', tipo: 'Monotributo', fecha: '2026-05-20' },
  { id: 'mono-recateg-3', nombre: 'Recategorización Monotributo', tipo: 'Monotributo', fecha: '2026-09-21' },
];

function diasRestantes(fechaStr) {
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  var venc = new Date(fechaStr + 'T00:00:00');
  return Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
}

function formatFecha(fechaStr) {
  var d = new Date(fechaStr + 'T00:00:00');
  var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return d.getDate() + ' de ' + meses[d.getMonth()] + ' de ' + d.getFullYear();
}

function buildEmailHtml(criticos, urgentes) {
  var rows = '';

  criticos.forEach(function(v) {
    var dias = diasRestantes(v.fecha);
    var label = dias < 0 ? ('VENCIDO hace ' + Math.abs(dias) + ' d') : (dias === 0 ? 'HOY' : 'en ' + dias + ' días');
    rows += '<tr style="background:#FCEBEB">';
    rows += '<td style="padding:10px 12px;border-bottom:1px solid #F7C1C1;font-weight:600;color:#A32D2D">⚠ ' + label + '</td>';
    rows += '<td style="padding:10px 12px;border-bottom:1px solid #F7C1C1">' + v.nombre + '</td>';
    rows += '<td style="padding:10px 12px;border-bottom:1px solid #F7C1C1;color:#666;font-size:12px">' + v.tipo + '</td>';
    rows += '<td style="padding:10px 12px;border-bottom:1px solid #F7C1C1;font-size:12px">' + formatFecha(v.fecha) + '</td>';
    rows += '</tr>';
  });

  urgentes.forEach(function(v) {
    var dias = diasRestantes(v.fecha);
    rows += '<tr>';
    rows += '<td style="padding:10px 12px;border-bottom:1px solid #eee;color:#854F0B">· en ' + dias + ' días</td>';
    rows += '<td style="padding:10px 12px;border-bottom:1px solid #eee">' + v.nombre + '</td>';
    rows += '<td style="padding:10px 12px;border-bottom:1px solid #eee;color:#666;font-size:12px">' + v.tipo + '</td>';
    rows += '<td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:12px">' + formatFecha(v.fecha) + '</td>';
    rows += '</tr>';
  });

  return '<!DOCTYPE html><html><body style="font-family:sans-serif;background:#F4EFE6;margin:0;padding:20px">' +
    '<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0">' +
    '<div style="background:#1A1A1A;padding:24px 28px;color:#F4EFE6">' +
    '<h1 style="margin:0;font-size:20px;font-weight:600">PymeStudio — Alerta de Vencimientos</h1>' +
    '<p style="margin:6px 0 0;font-size:13px;color:rgba(244,239,230,.7)">' + new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '</p>' +
    '</div>' +
    '<div style="padding:24px 28px">' +
    '<p style="font-size:14px;color:#3A3A36;margin:0 0 20px">Tenés <strong>' + criticos.length + ' obligación/es crítica/s</strong> y <strong>' + urgentes.length + ' próximas</strong> que requieren atención:</p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
    '<thead><tr style="background:#F4EFE6"><th style="padding:8px 12px;text-align:left;font-weight:600;color:#7A746A;font-size:11px;text-transform:uppercase;letter-spacing:.04em">Estado</th><th style="padding:8px 12px;text-align:left;font-weight:600;color:#7A746A;font-size:11px;text-transform:uppercase;letter-spacing:.04em">Obligación</th><th style="padding:8px 12px;text-align:left;font-weight:600;color:#7A746A;font-size:11px;text-transform:uppercase;letter-spacing:.04em">Tipo</th><th style="padding:8px 12px;text-align:left;font-weight:600;color:#7A746A;font-size:11px;text-transform:uppercase;letter-spacing:.04em">Vencimiento</th></tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
    '</table>' +
    '</div>' +
    '<div style="padding:16px 28px;background:#F4EFE6;border-top:1px solid #e0e0e0">' +
    '<a href="https://dashbi.pymestudio.xyz" style="display:inline-block;background:#C24A1F;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;font-size:13px;font-weight:500">Ver en el Dashboard →</a>' +
    '<p style="margin:12px 0 0;font-size:11px;color:#7A746A">PymeStudio · Gestión fiscal para PyMEs argentinas · <a href="https://pymestudio.xyz" style="color:#7A746A">pymestudio.xyz</a></p>' +
    '</div>' +
    '</div></body></html>';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    var criticos = VENCIMIENTOS_2026.filter(function(v) {
      var d = diasRestantes(v.fecha);
      return d >= -7 && d <= 3;
    });

    var urgentes = VENCIMIENTOS_2026.filter(function(v) {
      var d = diasRestantes(v.fecha);
      return d > 3 && d <= 10;
    });

    if (criticos.length === 0 && urgentes.length === 0) {
      return res.status(200).json({ ok: true, message: 'Sin vencimientos urgentes', sent: false });
    }

    var toEmail = process.env.RESEND_TO_EMAIL || req.body.email;
    if (!toEmail) {
      return res.status(400).json({ error: 'No hay email destino configurado' });
    }

    var emailHtml = buildEmailHtml(criticos, urgentes);
    var subject = criticos.length > 0
      ? 'URGENTE: ' + criticos.length + ' obligación/es fiscal/es vencen pronto — PymeStudio'
      : criticos.length + urgentes.length + ' vencimientos próximos — PymeStudio';

    var resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'alertas@pymestudio.xyz',
        to: [toEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    var resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('[VENC ALERTA] Resend error:', resendData);
      return res.status(500).json({ error: 'Error al enviar email', detail: resendData });
    }

    return res.status(200).json({
      ok: true,
      sent: true,
      email: toEmail,
      criticos: criticos.length,
      urgentes: urgentes.length,
      resend_id: resendData.id,
    });

  } catch (err) {
    console.error('[VENC ALERTA] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
