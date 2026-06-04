import { createClient } from '@supabase/supabase-js'

const sb = (() => {
  const url = import.meta.env?.VITE_SUPABASE_URL
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY
  if (url && key) return createClient(url, key)
  return null
})()

function getJWT() { return localStorage.getItem('ff_jwt') ?? '' }
function getHeaders() {
  return { 'Authorization': `Bearer ${getJWT()}`, 'Content-Type': 'application/json' }
}
function getPeriodoActual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}
function fmt(n) { return '$' + (n ?? 0).toLocaleString('es-AR') }

async function cargarPosicion(periodo) {
  try {
    const [y, m] = periodo.split('-')
    const desde  = `${y}-${m}-01`
    const hasta  = m === '12'
      ? `${+y+1}-01-01`
      : `${y}-${String(+m+1).padStart(2,'0')}-01`
    const raw  = getJWT().split('.')[1] ?? ''
    const pad  = raw + '=='.slice((raw.length % 4))
    const cuit = raw ? (JSON.parse(atob(pad))?.cuit ?? '') : ''

    let ventas = [], compras = []
    if (sb && cuit) {
      const [rv, rc] = await Promise.all([
        sb.from('facturas')
          .select('importe_neto,importe_iva,tipo,voucher_number,date,recipient,amount')
          .eq('cuit_usuario', cuit)
          .gte('fecha_iso', desde)
          .lt('fecha_iso', hasta),
        sb.from('compras_contable')
          .select('*')
          .eq('cuit_usuario', cuit)
          .gte('fecha', desde)
          .lt('fecha', hasta)
      ])
      ventas  = rv.data ?? []
      compras = rc.data ?? []
    }

    const debito  = ventas.reduce((s, f) => s + (f.importe_iva ?? 0), 0)
    const credito = compras.reduce((s, c) => s + (c.importe_iva ?? 0), 0)
    return { debito, credito, saldo: debito - credito, ventas, compras }
  } catch {
    // datos demo si no hay conexión
    return { debito: 260469, credito: 121835, saldo: 138634, ventas: [], compras: [] }
  }
}

export function renderIVA(container) {
  const periodo = getPeriodoActual()

  container.innerHTML = `
    <div style="padding:24px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
        <div>
          <h2 style="font-size:1.3rem;font-weight:600;margin-bottom:4px">Módulo IVA</h2>
          <p style="color:var(--text-muted);font-size:.85rem">Libro ventas · Libro compras · Posición mensual</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input type="month" id="iva-periodo" value="${periodo}"
            style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:.85rem">
          <button id="iva-sync-btn"
            style="padding:7px 16px;background:#6c5ce7;color:#fff;border:none;border-radius:8px;font-size:.85rem;cursor:pointer;font-family:inherit">
            Sincronizar ARCA
          </button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px">
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px">Débito fiscal</div>
          <div id="iva-debito" style="font-size:1.4rem;font-weight:600;color:#e84393">...</div>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px">Crédito fiscal</div>
          <div id="iva-credito" style="font-size:1.4rem;font-weight:600;color:#00b894">...</div>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px">Saldo a pagar</div>
          <div id="iva-saldo" style="font-size:1.4rem;font-weight:600;color:#6c5ce7">...</div>
        </div>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">
        <button class="iva-tab active" data-tab="posicion"
          style="padding:6px 16px;border-radius:20px;border:1px solid #6c5ce7;background:#6c5ce7;color:#fff;font-size:.82rem;cursor:pointer;font-family:inherit">
          Posición
        </button>
        <button class="iva-tab" data-tab="ventas"
          style="padding:6px 16px;border-radius:20px;border:1px solid var(--border);background:var(--surface);color:var(--text-muted);font-size:.82rem;cursor:pointer;font-family:inherit">
          Libro ventas
        </button>
        <button class="iva-tab" data-tab="compras"
          style="padding:6px 16px;border-radius:20px;border:1px solid var(--border);background:var(--surface);color:var(--text-muted);font-size:.82rem;cursor:pointer;font-family:inherit">
          Libro compras
        </button>
        <button id="iva-export-btn"
          style="margin-left:auto;padding:6px 14px;border:1px solid #6c5ce7;color:#6c5ce7;background:transparent;border-radius:20px;font-size:.8rem;cursor:pointer;font-family:inherit">
          Exportar CSV
        </button>
      </div>

      <div id="iva-content"
        style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;min-height:160px;font-size:.85rem;color:var(--text-muted)">
        Cargando...
      </div>
    </div>
  `

  let posData = null
  let activeTab = 'posicion'
  const content      = container.querySelector('#iva-content')
  const periodoInput = container.querySelector('#iva-periodo')
  const syncBtn      = container.querySelector('#iva-sync-btn')
  const exportBtn    = container.querySelector('#iva-export-btn')

  function renderTab() {
    if (!posData) {
      content.textContent = 'Sin datos. Sincronizá con ARCA o verificá Supabase.'
      return
    }

    if (activeTab === 'posicion') {
      content.innerHTML = `
        <div style="font-size:.85rem">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="color:var(--text-muted)">Débito fiscal (ventas)</span>
            <span style="color:#e84393;font-weight:500">${fmt(posData.debito)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="color:var(--text-muted)">Crédito fiscal (compras)</span>
            <span style="color:#00b894;font-weight:500">- ${fmt(posData.credito)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:600;font-size:.95rem">
            <span>Saldo neto a ingresar</span>
            <span style="color:#6c5ce7">${fmt(posData.saldo)}</span>
          </div>
          <a href="https://www.arca.gob.ar" target="_blank"
            style="display:inline-block;margin-top:8px;padding:8px 18px;background:#6c5ce7;color:#fff;border-radius:8px;font-size:.82rem;text-decoration:none">
            Ir a ARCA — VEP ↗
          </a>
        </div>
      `
      return
    }

    const rows = activeTab === 'ventas' ? posData.ventas : posData.compras
    if (!rows?.length) {
      content.textContent = `Sin comprobantes de ${activeTab} para este período.`
      return
    }

    const cols = activeTab === 'ventas'
      ? ['Fecha','Tipo','Nro','Receptor','Neto','IVA','Total']
      : ['Fecha','Proveedor','Nro','Neto','IVA CF','Total']

    content.innerHTML = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.82rem">
          <thead><tr>${cols.map(c => `
            <th style="padding:8px 10px;text-align:left;color:var(--text-muted);font-weight:500;border-bottom:1px solid var(--border)">${c}</th>
          `).join('')}</tr></thead>
          <tbody>${rows.map(v => activeTab === 'ventas' ? `
            <tr>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${v.date ?? ''}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${v.tipo ?? ''}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${v.voucher_number ?? ''}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${v.recipient ?? ''}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${fmt(v.importe_neto)}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border);color:#00b894">${fmt(v.importe_iva)}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${fmt(v.amount)}</td>
            </tr>` : `
            <tr>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${v.fecha ?? ''}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${v.proveedor_nombre ?? v.proveedor_cuit ?? ''}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${v.numero_comprobante ?? ''}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${fmt(v.importe_neto)}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border);color:#00b894">${fmt(v.importe_iva)}</td>
              <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${fmt(v.importe_total)}</td>
            </tr>`
          ).join('')}</tbody>
        </table>
      </div>
    `
  }

  async function cargar(p) {
    content.textContent = 'Cargando...'
    posData = await cargarPosicion(p)
    container.querySelector('#iva-debito').textContent  = fmt(posData.debito)
    container.querySelector('#iva-credito').textContent = fmt(posData.credito)
    container.querySelector('#iva-saldo').textContent   = fmt(posData.saldo)
    renderTab()
  }

  container.querySelectorAll('.iva-tab').forEach(t => {
    t.addEventListener('click', () => {
      container.querySelectorAll('.iva-tab').forEach(x => {
        x.style.background  = 'var(--surface)'
        x.style.color       = 'var(--text-muted)'
        x.style.borderColor = 'var(--border)'
      })
      t.style.background  = '#6c5ce7'
      t.style.color       = '#fff'
      t.style.borderColor = '#6c5ce7'
      activeTab = t.dataset.tab
      renderTab()
    })
  })

  syncBtn.addEventListener('click', async () => {
    const p = periodoInput.value || getPeriodoActual()
    syncBtn.disabled    = true
    syncBtn.textContent = 'Sincronizando...'
    try {
      const r = await fetch('/api/arca-sync', {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ periodo: p })
      })
      const d = await r.json()
      syncBtn.textContent = `✓ ${d.sincronizados ?? 0} sincronizados`
      await cargar(p)
    } catch {
      syncBtn.textContent = 'Error — reintentar'
    }
    syncBtn.disabled = false
    setTimeout(() => { syncBtn.textContent = 'Sincronizar ARCA' }, 3000)
  })

  exportBtn.addEventListener('click', () => {
    if (!posData) return
    const rows = activeTab === 'compras' ? posData.compras : posData.ventas
    const tipo = activeTab === 'compras' ? 'compras' : 'ventas'
    const headers = tipo === 'ventas'
      ? 'Fecha,Tipo,Numero,Receptor,Neto,IVA,Total'
      : 'Fecha,Proveedor,Nro,Neto,IVA,Total'
    const lines = rows.map(r => tipo === 'ventas'
      ? [r.date, r.tipo, r.voucher_number, r.recipient, r.importe_neto, r.importe_iva, r.amount].join(',')
      : [r.fecha, r.proveedor_nombre, r.numero_comprobante, r.importe_neto, r.importe_iva, r.importe_total].join(',')
    )
    const blob = new Blob([[headers, ...lines].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `iva-${tipo}-${periodoInput.value}.csv`
    a.click()
  })

  periodoI
