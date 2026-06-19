function getHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('ff_jwt') ?? ''}`, 'Content-Type': 'application/json' }
}
function getPeriodo() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

export function renderCron(container) {
  let cronOn = true

  container.innerHTML = `
    <div style="padding:24px">
      <h2 style="font-size:1.3rem;font-weight:600;margin-bottom:4px">Sincronización ARCA</h2>
      <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:20px">Cron automático diario · historial de ejecuciones</p>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:14px">
        <h3 style="font-size:.92rem;font-weight:600;margin-bottom:12px">Sincronización manual</h3>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <input type="month" id="cr-per" value="${getPeriodo()}"
            style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem">
          <button id="cr-sync"
            style="padding:8px 16px;background:#6c5ce7;color:#fff;border:none;border-radius:8px;font-size:.85rem;cursor:pointer;font-family:inherit">
            Sincronizar ahora
          </button>
          <span id="cr-msg" style="font-size:.8rem;color:#6c5ce7"></span>
        </div>
      </div>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:14px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:.92rem;font-weight:600">Sincronización automática diaria</div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-top:3px">Todos los días 6:00 AM UTC · vercel.json cron</div>
          </div>
          <div id="cr-tog" style="width:44px;height:24px;border-radius:12px;cursor:pointer;position:relative;background:#6c5ce7;flex-shrink:0;transition:background .2s">
            <div id="cr-thumb" style="position:absolute;top:3px;left:23px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)"></div>
          </div>
        </div>
        <div id="cr-warn" style="display:none;margin-top:10px;padding:8px 10px;border-radius:6px;background:rgba(237,137,54,.12);font-size:.8rem;color:#ed8936">
          El cron está deshabilitado. Las facturas no se sincronizarán automáticamente.
        </div>
      </div>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">
        <div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:.88rem;font-weight:500">Historial de ejecuciones</span>
          <button id="cr-ref" style="font-size:.8rem;color:#6c5ce7;background:none;border:none;cursor:pointer;font-family:inherit">↺ Actualizar</button>
        </div>
        <div id="cr-log"><div style="padding:18px;color:var(--text-muted);font-size:.85rem">Cargando historial...</div></div>
      </div>
    </div>
  `

  const ci = id => container.querySelector(id)
  const badge = { ok:'#00b894', parcial:'#f59e0b', skipped:'#888', error:'#e84393' }

  ci('#cr-tog').addEventListener('click', () => {
    cronOn = !cronOn
    ci('#cr-tog').style.background   = cronOn ? '#6c5ce7' : 'var(--border)'
    ci('#cr-thumb').style.left       = cronOn ? '23px' : '3px'
    ci('#cr-warn').style.display     = cronOn ? 'none' : 'block'
  })

  ci('#cr-sync').addEventListener('click', async () => {
    const btn = ci('#cr-sync')
    btn.disabled = true; btn.textContent = 'Sincronizando...'
    try {
      const r = await fetch('/api/arca?action=sync', {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ periodo: ci('#cr-per').value || getPeriodo() })
      })
      const d = await r.json()
      ci('#cr-msg').textContent = `✓ ${d.sincronizados ?? 0} comprobantes sincronizados`
      await cargarLog()
    } catch { ci('#cr-msg').textContent = 'Error al sincronizar' }
    btn.disabled = false; btn.textContent = 'Sincronizar ahora'
    setTimeout(() => { ci('#cr-msg').textContent = '' }, 5000)
  })

  ci('#cr-ref').addEventListener('click', cargarLog)

  async function cargarLog() {
    try {
      const r = await fetch('/api/ops?action=cronlog', { headers: getHeaders() })
      if (!r.ok) throw new Error()
      renderLog(await r.json())
    } catch { renderLog([]) }
  }

  function renderLog(logs) {
    const el = ci('#cr-log')
    if (!logs.length) {
      el.innerHTML = '<div style="padding:18px;color:var(--text-muted);font-size:.85rem">Sin ejecuciones registradas aún.</div>'
      return
    }
    el.innerHTML = logs.map(l => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid var(--border);font-size:.8rem">
        <span style="width:8px;height:8px;border-radius:50%;background:${badge[l.estado] ?? '#888'};flex-shrink:0;display:inline-block"></span>
        <span style="min-width:140px;color:var(--text-muted)">${new Date(l.ejecutado_at).toLocaleString('es-AR')}</span>
        <span style="flex:1;color:var(--text-muted)">${l.periodo ?? '—'}</span>
        <span style="color:#00b894">${l.sincronizados ?? 0} sync</span>
        <span style="padding:2px 8px;border-radius:20px;font-size:.7rem;font-weight:500;
          background:${l.estado==='ok'?'rgba(0,184,148,.12)':'rgba(245,158,11,.12)'};
          color:${badge[l.estado] ?? '#888'}">${l.estado}</span>
      </div>`).join('')
  }

  cargarLog()
}
