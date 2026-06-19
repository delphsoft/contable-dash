// api/keepalive.js
// Vercel Serverless Function — GET /api/keepalive
// Hace un ping liviano a Supabase cada 3 días para evitar el pausing automático
// Cron: "0 12 */3 * *" — cada 3 días a las 9AM Argentina (UTC-3)

export default async function handler(req, res) {
  var start = Date.now();

  try {
    var supabaseUrl = process.env.SUPABASE_URL;
    var supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ ok: false, error: 'Variables SUPABASE_URL o SUPABASE_SERVICE_KEY no configuradas' });
    }

    // Ping liviano: consulta la tabla más simple del proyecto
    // Usamos ?limit=1 para que sea instantáneo
    var pingRes = await fetch(supabaseUrl + '/rest/v1/usuarios?limit=1', {
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
      },
    });

    // Si la tabla no existe probamos con el health check de PostgREST
    if (pingRes.status === 404) {
      pingRes = await fetch(supabaseUrl + '/rest/v1/', {
        headers: {
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey,
        },
      });
    }

    var ms = Date.now() - start;
    var ok = pingRes.ok || pingRes.status === 200;

    console.log('[KEEPALIVE] Supabase ping', ok ? 'OK' : 'FAIL', pingRes.status, ms + 'ms');

    return res.status(200).json({
      ok: ok,
      status: pingRes.status,
      ms: ms,
      timestamp: new Date().toISOString(),
      project: supabaseUrl.split('.')[0].replace('https://', ''),
    });

  } catch (err) {
    console.error('[KEEPALIVE] Error:', err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
      ms: Date.now() - start,
    });
  }
}
