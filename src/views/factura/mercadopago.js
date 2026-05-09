import { fmtCurrency, fmtDate } from '../../utils.js'

export function renderFFMercadoPago(el) {
  let tab = 'recibidos'
  let data = { recibidos:[], enviados:[] }
  let loading = false

  function render() {
    el.innerHTML=`
      <div class="card" style="margin-bottom:14px">
        <div class="card-header"><span class="card-title">Importar desde MercadoPago</span><span class="pill pill-blue">API</span></div>
        <div style="display:flex;gap:10px;margin-bottom:14px">
          <div class="ff-field" style="flex:1"><label class="ff-label">Access Token</label>
            <input class="ff-input" id="mp-token" placeholder="APP_USR-..." type="password"/>
          </div>
          <div style="display:flex;align-items:flex-end">
            <button class="ff-btn ff-btn-primary" id="mp-import-btn" style="height:42px;white-space:nowrap">Importar movimientos</button>
          </div>
        </div>
        <div id="mp-status"></div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Movimientos</span>
          <div style="display:flex;gap:6px">
            <button class="sc-chip ${tab==='recibidos'?'active':''}" id="tab-rec">Recibidos (${data.recibidos.length})</button>
            <button class="sc-chip ${tab==='enviados'?'active':''}" id="tab-env">Enviados (${data.enviados.length})</button>
          </div>
        </div>
        ${renderTable(tab==='recibidos'?data.recibidos:data.enviados)}
      </div>
    `

    document.getElementById('tab-rec').addEventListener('click',()=>{tab='recibidos';render()})
    document.getElementById('tab-env').addEventListener('click',()=>{tab='enviados';render()})

    document.getElementById('mp-import-btn').addEventListener('click', async () => {
      const token = document.getElementById('mp-token').value.trim()
      if (!token) { alert('Ingresá tu Access Token de MercadoPago'); return }
      const btn = document.getElementById('mp-import-btn')
      const st = document.getElementById('mp-status')
      btn.disabled = true; btn.textContent = 'Importando...'
      st.innerHTML=`<div style="font-size:12px;color:var(--blue)">Conectando con MercadoPago...</div>`
      try {
        const resp = await fetch('/api/mercadopago', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({token})
        })
        const json = await resp.json()
        if (json.recibidos !== undefined) {
          data = json
          st.innerHTML=`<div style="font-size:12px;color:var(--green)">✓ ${data.recibidos.length} recibidos · ${data.enviados.length} enviados</div>`
        } else {
          st.innerHTML=`<div style="font-size:12px;color:var(--red)">Error: ${json.error||'Sin respuesta'}</div>`
        }
      } catch(e) {
        st.innerHTML=`<div style="font-size:12px;color:var(--amber)">⚠ No se pudo conectar con /api/mercadopago</div>`
      }
      btn.disabled=false; btn.textContent='Importar movimientos'
      render()
    })
  }

  function renderTable(rows) {
    if (!rows.length) return `<div style="text-align:center;padding:30px;color:var(--txt3);font-size:12px">Sin movimientos. Importá tu token de MercadoPago arriba.</div>`
    return `<div style="overflow-x:auto"><table class="tbl">
      <thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th><th>Estado</th><th>ID</th></tr></thead>
      <tbody>${rows.map(r=>`<tr>
        <td style="font-size:11px;color:var(--txt2)">${r.date_created?fmtDate(r.date_created):'—'}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${r.description||r.payment_type_id||'—'}</td>
        <td style="font-family:'DM Mono',monospace;color:${r.transaction_amount>0?'var(--green)':'var(--red)'}">${fmtCurrency(Math.abs(r.transaction_amount||0))}</td>
        <td><span class="card-badge ${r.status==='approved'?'pill-green':r.status==='pending'?'pill-amber':'pill-red'}">${r.status||'—'}</span></td>
        <td style="font-family:'DM Mono',monospace;font-size:10px;color:var(--txt3)">${String(r.id||'').slice(0,12)}</td>
      </tr>`).join('')}</tbody>
    </table></div>`
  }

  render()
}
