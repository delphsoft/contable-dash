import { fmtCurrency, fmtDate } from '../../utils.js'

export function renderFFDashboard(el) {
  const facturas = JSON.parse(localStorage.getItem('ff_facturas') || '[]')
  const total = facturas.reduce((s,f)=>s+Number(f.monto||0),0)
  const autorizadas = facturas.filter(f=>f.cae).length
  const pct = facturas.length ? Math.round(autorizadas/facturas.length*100) : 100

  el.innerHTML=`
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Total facturas</div><div class="kpi-value">${facturas.length}</div><div class="kpi-delta delta-flat">registradas</div></div>
      <div class="kpi-card"><div class="kpi-label">Total facturado</div><div class="kpi-value">${fmtCurrency(total)}</div><div class="kpi-delta delta-up">▲ acumulado</div></div>
      <div class="kpi-card"><div class="kpi-label">Promedio</div><div class="kpi-value">${facturas.length?fmtCurrency(Math.round(total/facturas.length)):'$0'}</div><div class="kpi-delta delta-flat">por factura</div></div>
      <div class="kpi-card"><div class="kpi-label">Autorizadas</div><div class="kpi-value" style="color:var(--green)">${pct}%</div><div class="kpi-delta delta-flat">${autorizadas}/${facturas.length} con CAE</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">Facturas recientes</span>
        <div style="display:flex;gap:8px">
          <button class="ff-btn ff-btn-secondary" style="font-size:11px;padding:5px 12px" onclick="window.__navigate('ff-facturas')">Ver todas</button>
          <button class="ff-btn ff-btn-primary" style="font-size:11px;padding:5px 12px" onclick="window.__navigate('ff-facturas')">+ Nueva Factura</button>
        </div>
      </div>
      ${facturas.length===0?`
        <div style="text-align:center;padding:40px 20px;color:var(--txt3)">
          <div style="font-size:28px;margin-bottom:10px">📄</div>
          <div style="font-size:13px;margin-bottom:8px;color:var(--txt2)">No hay facturas todavía</div>
          <button class="ff-btn ff-btn-primary" onclick="window.__navigate('ff-facturas')">Crear primera factura</button>
        </div>
      `:`
        <div style="overflow-x:auto">
          <table class="tbl">
            <thead><tr><th>Tipo</th><th>Cliente</th><th>Monto</th><th>CAE</th><th>Fecha</th><th>Estado</th></tr></thead>
            <tbody>${facturas.slice(-10).reverse().map(f=>`
              <tr>
                <td><span class="ff-tag badge-purple">FC ${f.tipo||'A'}</span></td>
                <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.cliente||'—'}</td>
                <td style="font-family:'DM Mono',monospace">${fmtCurrency(f.monto||0)}</td>
                <td style="font-family:'DM Mono',monospace;font-size:11px;color:var(--txt2)">${f.cae?f.cae.slice(0,8)+'...':'Pendiente'}</td>
                <td style="font-size:11px;color:var(--txt2)">${f.fecha?fmtDate(f.fecha):'—'}</td>
                <td><span class="card-badge ${f.cae?'badge-green':'badge-amber'}">${f.cae?'Autorizada':'Borrador'}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`}
    </div>
  `
}
