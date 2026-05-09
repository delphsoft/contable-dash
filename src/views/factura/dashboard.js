import { fmtCurrency } from '../../utils.js'

const STATUS_CFG = {
  approved: { label:'Aprobado', bg:'rgba(46,192,138,0.15)', color:'#2ec08a' },
  pending:  { label:'Pendiente', bg:'rgba(240,160,80,0.15)', color:'#f0a050' },
  in_process:{ label:'En proceso', bg:'rgba(79,142,247,0.15)', color:'#4f8ef7' },
  rejected: { label:'Rechazado', bg:'rgba(240,90,90,0.15)', color:'#f05a5a' },
}
const SOURCE_CFG = {
  mp_link:     { label:'Link de pago', icon:'🔗', color:'#9b82f7', bg:'rgba(155,130,247,0.12)' },
  mp_transfer: { label:'Transferencia', icon:'↔', color:'#4f8ef7', bg:'rgba(79,142,247,0.12)' },
  mp_qr:       { label:'QR / POS', icon:'⊞', color:'#2ec08a', bg:'rgba(46,192,138,0.12)' },
  mp_other:    { label:'Otro', icon:'·', color:'#6b7280', bg:'rgba(255,255,255,0.06)' },
}
const CBTE = { 1:'FA', 6:'FB', 11:'FC' }
const fmt = n => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 })

// ─── State ────────────────────────────────────────────────────────────────────
let state = {
  invoices: [], loading: true, search: '',
  activeNav: 'dashboard',
  // modal
  showModal: false, invLoading: false, invError: '',
  amount: '', recipient: '', description: '', receptorEmail: '',
  tipoComprobante: 11, concepto: 2,
  receptorTipo: 'consumidor_final', receptorDocNro: '', receptorRazonSocial: '',
  lookingUpCuit: false, padronResult: null, padronError: '',
  // MP
  mpLoading: false, mpError: '', mpReceived: [], mpSent: [],
  mpTab: 'received', sourceFilter: 'all',
  selectedIds: new Set(), invoicedIds: new Set(),
  // Reportes
  reportDesde: '', reportHasta: '', reportData: null, reportLoading: false,
}

let rootEl = null

function getToken() { return localStorage.getItem('ff_jwt') || '' }
function getCondIva() { return localStorage.getItem('ff_condicion_iva') || 'monotributo' }
function getRazonSocial() { return localStorage.getItem('ff_razon_social') || 'Mi Cuenta' }

// ─── Fetch helpers ─────────────────────────────────────────────────────────
async function fetchInvoices() {
  state.loading = true; re()
  try {
    const jwt = getToken()
    // Try server first, fall back to localStorage
    if (jwt) {
      const res = await fetch('/api/facturas', { headers: { Authorization: `Bearer ${jwt}` } })
      if (res.ok) {
        const data = await res.json()
        state.invoices = data
        const ids = new Set(data.filter(f => f.mp_payment_id).map(f => String(f.mp_payment_id)))
        state.invoicedIds = ids
        state.loading = false; re(); return
      }
    }
    // localStorage fallback
    state.invoices = JSON.parse(localStorage.getItem('ff_facturas') || '[]')
    const ids = new Set(state.invoices.filter(f => f.mp_payment_id).map(f => String(f.mp_payment_id)))
    state.invoicedIds = ids
  } catch(e) {
    state.invoices = JSON.parse(localStorage.getItem('ff_facturas') || '[]')
  }
  state.loading = false; re()
}

async function lookupCuit(cuit) {
  const clean = cuit.replace(/[-\s]/g, '')
  if (clean.length !== 11) { state.padronResult = null; state.padronError = ''; re(); return }
  state.lookingUpCuit = true; state.padronResult = null; state.padronError = ''; re()
  try {
    const res = await fetch(`/api/arca-padron?cuit=${clean}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    const data = await res.json()
    if (!res.ok) { state.padronError = data.error || 'Error al consultar ARCA'; }
    else {
      state.padronResult = data
      if (data.razonSocial && !state.receptorRazonSocial) state.receptorRazonSocial = data.razonSocial
      if (!state.recipient) state.recipient = data.razonSocial || ''
      if (data.estadoClave === 'INACTIVO') state.padronError = '⚠ CUIT inactivo en ARCA'
    }
  } catch { state.padronError = 'No se pudo consultar el padrón ARCA' }
  state.lookingUpCuit = false; re()
}

async function createInvoice(overrides = {}) {
  state.invLoading = true; state.invError = ''; re()
  try {
    const jwt = getToken()
    const civa = getCondIva()
    const payload = {
      amount: parseFloat(state.amount),
      recipient: state.recipient,
      description: state.description,
      tipoComprobante: state.tipoComprobante,
      concepto: state.concepto,
      receptorTipo: state.receptorTipo,
      receptorDocNro: state.receptorDocNro.replace(/[-\s]/g, '') || '0',
      receptorRazonSocial: state.receptorRazonSocial,
      receptorEmail: state.receptorEmail,
      paymentSource: 'manual',
      ...overrides,
    }
    const res = await fetch('/api/factura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) { state.invError = data.error || 'Error al crear la factura'; state.invLoading = false; re(); return }
    // Save to localStorage too
    const local = JSON.parse(localStorage.getItem('ff_facturas') || '[]')
    local.push(data)
    localStorage.setItem('ff_facturas', JSON.stringify(local))
    state.invoices = [data, ...state.invoices]
    if (data.mp_payment_id) state.invoicedIds.add(String(data.mp_payment_id))
    // Reset form
    state.amount = ''; state.recipient = ''; state.description = ''; state.receptorEmail = ''
    state.receptorTipo = 'consumidor_final'; state.receptorDocNro = ''; state.receptorRazonSocial = ''
    state.padronResult = null; state.padronError = ''; state.showModal = false
  } catch(e) { state.invError = 'Error de conexión: ' + e.message }
  state.invLoading = false; re()
}

async function fetchMPPayments() {
  state.mpLoading = true; state.mpError = ''
  state.mpReceived = []; state.mpSent = []
  state.selectedIds = new Set(); state.sourceFilter = 'all'; re()
  try {
    const jwt = getToken()
    const res = await fetch('/api/mercadopago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
      body: JSON.stringify({ token: localStorage.getItem('ff_mp_token') || '' }),
    })
    const data = await res.json()
    if (!res.ok) { state.mpError = data.error || 'Error al conectar con MercadoPago' }
    else {
      state.mpReceived = data.recibidos || data.received || []
      state.mpSent     = data.enviados  || data.sent     || []
    }
  } catch { state.mpError = 'No se pudo conectar' }
  state.mpLoading = false; re()
}

async function generateFromMP() {
  const civa = getCondIva()
  const defTipo = civa === 'responsable_inscripto' ? 6 : 11
  const toInvoice = state.mpReceived.filter(p => state.selectedIds.has(p.id))
  for (const p of toInvoice) {
    await createInvoiceFromMP(p, defTipo)
  }
  state.selectedIds = new Set()
  state.activeNav = 'dashboard'
  re()
}

async function createInvoiceFromMP(p, tipoComp) {
  const jwt = getToken()
  try {
    const res = await fetch('/api/factura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
      body: JSON.stringify({
        amount: p.transaction_amount,
        recipient: p.payer?.email || p.payer?.first_name || `MP #${p.id}`,
        description: p.description || `Pago MP #${p.id}`,
        tipoComprobante: tipoComp, concepto: 2,
        receptorTipo: 'consumidor_final', receptorDocNro: '0',
        receptorEmail: p.payer?.email || '',
        paymentSource: p.payment_source || 'mp_other',
        mpPaymentId: String(p.id),
      }),
    })
    if (res.ok) {
      const inv = await res.json()
      const local = JSON.parse(localStorage.getItem('ff_facturas') || '[]')
      local.push(inv); localStorage.setItem('ff_facturas', JSON.stringify(local))
      state.invoices = [inv, ...state.invoices]
      state.invoicedIds.add(String(p.id))
    }
  } catch(e) { console.error('MP invoice error', e) }
}

async function fetchReporte() {
  state.reportLoading = true; re()
  try {
    const jwt = getToken()
    const params = new URLSearchParams()
    if (state.reportDesde) params.append('desde', state.reportDesde)
    if (state.reportHasta) params.append('hasta', state.reportHasta)
    const res = await fetch(`/api/reportes?${params}`, {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {}
    })
    if (res.ok) state.reportData = await res.json()
    else {
      // Fallback: filter local invoices by date
      const all = JSON.parse(localStorage.getItem('ff_facturas') || '[]')
      const filtered = all.filter(f => {
        const d = new Date(f.fecha || f.created_at || f.date || '')
        if (state.reportDesde && d < new Date(state.reportDesde)) return false
        if (state.reportHasta && d > new Date(state.reportHasta)) return false
        return true
      })
      state.reportData = {
        facturas: filtered,
        resumen: { cantidad: filtered.length, total: filtered.reduce((s,f)=>s+Number(f.amount||f.monto||0),0) }
      }
    }
  } catch(e) { console.error(e) }
  state.reportLoading = false; re()
}

async function exportCSV() {
  const jwt = getToken()
  const params = new URLSearchParams({ formato: 'excel' })
  if (state.reportDesde) params.append('desde', state.reportDesde)
  if (state.reportHasta) params.append('hasta', state.reportHasta)
  try {
    const res = await fetch(`/api/reportes?${params}`, { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `facturas-${state.reportDesde||'all'}-${state.reportHasta||'all'}.csv`
    a.click(); URL.revokeObjectURL(url)
  } catch {
    // Fallback: generate CSV from local data
    const rows = [['Fecha','Tipo','Receptor','Descripcion','Monto','CAE']]
    state.reportData?.facturas?.forEach(f => {
      rows.push([f.date||f.fecha||'',CBTE[f.tipo_comprobante]||'FC',f.recipient||'',f.description||'',f.amount||0,f.cae||''])
    })
    const csv = rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'facturas.csv'; a.click()
  }
}

async function downloadPDF(inv) {
  const jwt = getToken()
  try {
    const res = await fetch(`/api/facturas/pdf?id=${inv.id}`, { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} })
    const html = await res.text()
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 800) }
  } catch {
    alert('PDF no disponible. Configurá /api/facturas/pdf en el servidor.')
  }
}

// ─── Re-render ──────────────────────────────────────────────────────────────
function re() { if (rootEl) rootEl.innerHTML = renderHTML(); bindEvents() }

// ─── Main render ─────────────────────────────────────────────────────────────
function renderHTML() {
  const { invoices, loading, search, activeNav } = state
  const civa = getCondIva()
  const totalAmount = invoices.reduce((s,i)=>s+Number(i.amount||0),0)
  const avg = invoices.length ? totalAmount/invoices.length : 0
  const filtered = invoices.filter(inv =>
    (inv.recipient||'').toLowerCase().includes(search.toLowerCase()) ||
    (inv.description||'').toLowerCase().includes(search.toLowerCase())
  )

  return `
    ${state.showModal ? renderModal(civa) : ''}

    <!-- Header -->
    <div class="card" style="margin-bottom:14px;padding:12px 18px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div style="flex:1">
          <div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:600;color:var(--txt)">
            ${{dashboard:'Dashboard',facturas:'Mis Facturas',mp:'MercadoPago',reportes:'Reportes'}[activeNav]}
          </div>
          <div style="font-size:11px;color:var(--txt2)">${invoices.length} facturas · ${civa==='responsable_inscripto'?'Resp. Inscripto':'Monotributista'} · ARCA</div>
        </div>
        ${activeNav!=='reportes'?`
        <input id="ff-search" class="ff-input" placeholder="Buscar..." value="${search}" style="width:160px;padding:7px 12px;font-size:12px"/>
        <button id="btn-mp" class="ff-btn" style="background:rgba(79,142,247,.15);color:#4f8ef7;border:0.5px solid rgba(79,142,247,.3);font-size:12px;padding:7px 14px">💳 Importar MP</button>
        <button id="btn-new-inv" class="ff-btn ff-btn-primary" style="font-size:12px;padding:7px 14px">+ Nueva Factura</button>
        `:''}
      </div>
      <!-- Nav tabs -->
      <div style="display:flex;gap:4px;margin-top:12px;border-top:0.5px solid var(--border);padding-top:10px">
        ${[{k:'dashboard',l:'Dashboard'},{k:'facturas',l:'Mis Facturas'},{k:'mp',l:'MercadoPago'},{k:'reportes',l:'Reportes'}].map(n=>`
          <button class="nav-tab${activeNav===n.k?' active':''}" data-nav="${n.k}" style="padding:5px 14px;border-radius:7px;border:none;font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;background:${activeNav===n.k?'var(--blue-d)':'transparent'};color:${activeNav===n.k?'var(--blue)':'var(--txt2)'};">${n.l}</button>
        `).join('')}
      </div>
    </div>

    <!-- DASHBOARD -->
    ${activeNav==='dashboard'?`
      <div class="kpi-grid" style="margin-bottom:14px">
        <div class="kpi-card"><div class="kpi-label">Total facturas</div><div class="kpi-value">${invoices.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total facturado</div><div class="kpi-value" style="color:var(--purple)">$${fmt(totalAmount)}</div><div class="kpi-delta delta-up">▲ acumulado</div></div>
        <div class="kpi-card"><div class="kpi-label">Promedio</div><div class="kpi-value">$${fmt(Math.round(avg))}</div><div class="kpi-delta delta-flat">por factura</div></div>
        <div class="kpi-card"><div class="kpi-label">Con CAE</div><div class="kpi-value" style="color:var(--green)">${invoices.filter(i=>i.cae).length}/${invoices.length}</div></div>
      </div>
      ${renderTable(filtered, loading)}
    `:''}

    <!-- FACTURAS -->
    ${activeNav==='facturas'?renderTable(filtered, loading):''}

    <!-- MP -->
    ${activeNav==='mp'?renderMP():''}

    <!-- REPORTES -->
    ${activeNav==='reportes'?renderReportes():''}
  `
}

function renderTable(filtered, loading) {
  return `
    <div class="card" style="overflow-x:auto;padding:0">
      <table class="tbl">
        <thead><tr>
          <th>Tipo</th><th>Cliente</th><th>Monto</th><th>CAE</th><th>Vto.</th><th>Origen</th><th>Estado</th><th>PDF</th>
        </tr></thead>
        <tbody>
          ${loading ? `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--txt3)">Cargando...</td></tr>`
          : filtered.length===0 ? `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--txt3);font-size:12px">Sin facturas todavía — emitís la primera con "+ Nueva Factura"</td></tr>`
          : filtered.slice().reverse().map(inv => {
            const tipo = CBTE[inv.tipo_comprobante] || 'FC'
            const src  = SOURCE_CFG[inv.payment_source]
            const cae8 = inv.cae ? inv.cae.slice(-8) : '—'
            return `<tr>
              <td><span class="pill pill-purple" style="font-size:9.5px">${tipo}</span></td>
              <td style="max-width:180px">
                <div style="font-size:12px;font-weight:500;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inv.recipient||inv.receptor_razon_social||'—'}</div>
                ${inv.description?`<div style="font-size:10.5px;color:var(--txt3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inv.description}</div>`:''}
              </td>
              <td style="font-family:'DM Mono',monospace;font-size:12px">$${fmt(inv.amount||inv.monto||0)}</td>
              <td><span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--blue);background:var(--blue-d);padding:2px 6px;border-radius:4px">${cae8}</span></td>
              <td style="font-size:10.5px;color:var(--txt3)">${inv.cae_fch_vto||'—'}</td>
              <td>${src?`<span style="font-size:10px;padding:2px 7px;border-radius:20px;background:${src.bg};color:${src.color}">${src.icon} ${src.label}</span>`:`<span style="font-size:10.5px;color:var(--txt3)">Manual</span>`}</td>
              <td><span class="card-badge ${inv.cae?'pill-green':'pill-amber'}" style="font-size:9.5px">${inv.cae?'Autorizada':'Borrador'}${inv.demo?' (demo)':''}</span></td>
              <td><button class="pdf-btn ff-btn ff-btn-secondary" data-id="${inv.id}" style="font-size:10.5px;padding:3px 9px">📄 PDF</button></td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>`
}

function renderMP() {
  const { mpLoading, mpError, mpReceived, mpSent, mpTab, sourceFilter, selectedIds, invoicedIds } = state
  const activeP = mpTab==='received' ? mpReceived : mpSent
  const filteredP = sourceFilter==='all' ? activeP : activeP.filter(p=>p.payment_source===sourceFilter)
  const sourceCounts = activeP.reduce((a,p)=>{a[p.payment_source]=(a[p.payment_source]||0)+1;return a},{})
  const selectedTotal = mpReceived.filter(p=>selectedIds.has(p.id)).reduce((s,p)=>s+Number(p.transaction_amount||0),0)

  return `
    <div class="card" style="padding:0;overflow:hidden">
      <!-- Tabs -->
      <div style="display:flex;align-items:center;padding:12px 16px;border-bottom:0.5px solid var(--border);gap:6px">
        ${[{k:'received',l:'📥 Recibidos',c:mpReceived.length},{k:'sent',l:'📤 Enviados',c:mpSent.length}].map(t=>`
          <button class="mp-tab sc-chip${mpTab===t.k?' active':''}" data-tab="${t.k}">${t.l} <span style="font-size:10px">(${t.c})</span></button>
        `).join('')}
        <div style="margin-left:auto;display:flex;gap:7px;align-items:center">
          ${mpTab==='received'&&selectedIds.size>0?`
            <span style="font-size:11px;color:var(--txt2)">${selectedIds.size} sel · <strong style="color:var(--txt)">$${fmt(selectedTotal)}</strong></span>
            <button id="btn-gen-mp" class="ff-btn ff-btn-primary" style="font-size:11px;padding:5px 12px">Facturar ${selectedIds.size} →</button>
          `:''}
          <button id="btn-refresh-mp" class="ff-btn ff-btn-secondary" style="font-size:11px;padding:5px 12px">${mpLoading?'Cargando...':'↺ Actualizar'}</button>
        </div>
      </div>

      <!-- Source filters -->
      ${!mpLoading&&activeP.length>0?`
        <div style="display:flex;gap:5px;flex-wrap:wrap;padding:8px 16px;border-bottom:0.5px solid var(--border);align-items:center">
          ${['all','mp_link','mp_transfer','mp_qr','mp_other'].map(s=>{
            const count = s==='all'?activeP.length:(sourceCounts[s]||0)
            const cfg = s==='all'?{label:'Todos',bg:'var(--blue-d)',color:'var(--blue)'}:SOURCE_CFG[s]
            return `<button class="src-filter sc-chip${sourceFilter===s?' active':''}" data-src="${s}" style="font-size:10.5px;padding:3px 10px">${s!=='all'&&cfg.icon?cfg.icon+' ':''}${cfg.label} (${count})</button>`
          }).join('')}
          ${mpTab==='received'?`
            <label style="margin-left:auto;display:flex;align-items:center;gap:5px;font-size:11px;color:var(--txt2);cursor:pointer">
              <input type="checkbox" id="chk-all-mp" style="accent-color:var(--blue)"> Sel. todos
            </label>
          `:''}
        </div>
      `:''}

      <!-- Body -->
      <div style="min-height:200px;max-height:420px;overflow-y:auto;padding:0 16px">
        ${mpLoading?`<div style="text-align:center;padding:40px;color:var(--txt3);font-size:12px">Conectando con MercadoPago...</div>`:''}
        ${!mpLoading&&mpError?`
          <div style="text-align:center;padding:40px">
            <div style="color:var(--red);font-size:13px;margin-bottom:10px">⚠ ${mpError}</div>
            <button id="btn-refresh-mp2" class="ff-btn ff-btn-secondary" style="font-size:12px">Reintentar</button>
          </div>`:''}
        ${!mpLoading&&!mpError&&filteredP.length===0?`
          <div style="text-align:center;padding:40px;color:var(--txt3);font-size:12px">
            ${activeP.length===0?'Hacé click en "↺ Actualizar" para cargar tus pagos':'Sin resultados para este filtro'}
          </div>`:''}
        ${!mpLoading&&!mpError?filteredP.map((p,i)=>{
          const sCfg = STATUS_CFG[p.status] || STATUS_CFG['pending']
          const srcCfg = SOURCE_CFG[p.payment_source] || SOURCE_CFG['mp_other']
          const isInvoiced = invoicedIds.has(String(p.id))
          const isRec = mpTab==='received'
          const isSel = selectedIds.has(p.id)
          const email = p.payer?.email || p.payer?.first_name || `MP #${p.id}`
          return `<div class="mp-payment-row" data-pid="${p.id}" data-invoiced="${isInvoiced}" style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:${i<filteredP.length-1?'0.5px solid var(--border)':'none'};cursor:${isRec&&!isInvoiced?'pointer':'default'};opacity:${isInvoiced?.6:1}">
            ${isRec&&!isInvoiced?`<input type="checkbox" class="mp-chk" data-pid="${p.id}" ${isSel?'checked':''} style="accent-color:var(--blue);flex-shrink:0">`:`<div style="width:16px;flex-shrink:0"></div>`}
            <div style="width:28px;height:28px;border-radius:50%;background:${isRec?'var(--purple-d)':'var(--amber-d)'};color:${isRec?'var(--purple)':'var(--amber)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0">
              ${isRec?(email).charAt(0).toUpperCase():'↑'}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;font-weight:500;color:${isInvoiced?'var(--txt2)':'var(--txt)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${isRec?email:(p.description||`Pago #${p.id}`)}</div>
              <div style="font-size:10px;color:var(--txt3)">${new Date(p.date_created||Date.now()).toLocaleDateString('es-AR')}</div>
            </div>
            <span style="font-size:10px;padding:2px 7px;border-radius:20px;background:${srcCfg.bg};color:${srcCfg.color};white-space:nowrap">${srcCfg.icon} ${srcCfg.label}</span>
            <span style="font-size:10px;padding:2px 7px;border-radius:20px;background:${sCfg.bg};color:${sCfg.color};white-space:nowrap">${sCfg.label}</span>
            ${isInvoiced
              ? `<span class="pill pill-green" style="font-size:9.5px;white-space:nowrap">✓ Facturado</span>`
              : `<div style="font-family:'DM Mono',monospace;font-size:12px;font-weight:600;color:${isRec?'var(--green)':'var(--red)'};white-space:nowrap">$${fmt(p.transaction_amount||0)}</div>`
            }
          </div>`
        }).join(''):''}
      </div>
    </div>`
}

function renderReportes() {
  const { reportDesde, reportHasta, reportData, reportLoading } = state
  return `
    <div class="card" style="margin-bottom:14px">
      <div style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap">
        <div class="ff-field" style="margin-bottom:0">
          <label class="ff-label">Desde</label>
          <input class="ff-input" type="date" id="rep-desde" value="${reportDesde}" style="width:160px"/>
        </div>
        <div class="ff-field" style="margin-bottom:0">
          <label class="ff-label">Hasta</label>
          <input class="ff-input" type="date" id="rep-hasta" value="${reportHasta}" style="width:160px"/>
        </div>
        <button id="btn-reporte" class="ff-btn ff-btn-primary" style="height:42px">${reportLoading?'Buscando...':'Buscar'}</button>
        ${reportData?`<button id="btn-export-csv" class="ff-btn ff-btn-secondary" style="height:42px">📊 Exportar CSV</button>`:''}
      </div>
    </div>
    ${reportData?`
      <div class="card" style="padding:0;overflow:hidden">
        <div style="display:flex;gap:24px;padding:12px 16px;border-bottom:0.5px solid var(--border)">
          <span style="font-size:12px;color:var(--txt2)">Facturas: <strong style="color:var(--txt)">${reportData.resumen?.cantidad||0}</strong></span>
          <span style="font-size:12px;color:var(--txt2)">Total: <strong style="color:var(--purple)">$${fmt(reportData.resumen?.total||0)}</strong></span>
        </div>
        <div style="overflow-x:auto">
          <table class="tbl">
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Receptor</th><th>Descripción</th><th>Monto</th><th>CAE</th><th>PDF</th></tr></thead>
            <tbody>
              ${(reportData.facturas||[]).map(inv=>`<tr>
                <td style="font-size:11px;color:var(--txt2)">${inv.date||inv.fecha||'—'}</td>
                <td><span class="pill pill-purple" style="font-size:9.5px">${CBTE[inv.tipo_comprobante]||'FC'}</span></td>
                <td style="max-width:160px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inv.receptor_razon_social||inv.recipient||'—'}</td>
                <td style="font-size:11px;color:var(--txt2);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inv.description||'—'}</td>
                <td style="font-family:'DM Mono',monospace;font-size:12px">$${fmt(inv.amount||0)}</td>
                <td><span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--blue);background:var(--blue-d);padding:2px 6px;border-radius:4px">${inv.cae?inv.cae.slice(-8):'—'}</span></td>
                <td><button class="pdf-btn ff-btn ff-btn-secondary" data-id="${inv.id}" style="font-size:10.5px;padding:3px 9px">📄</button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `:`<div style="text-align:center;padding:50px;color:var(--txt3);font-size:12px">Seleccioná un rango de fechas y hacé click en Buscar</div>`}
  `
}

function renderModal(civa) {
  const { amount, recipient, description, receptorEmail, tipoComprobante, concepto,
          receptorTipo, receptorDocNro, receptorRazonSocial, invLoading, invError,
          lookingUpCuit, padronResult, padronError } = state

  const tiposComp = civa === 'responsable_inscripto'
    ? [{v:1,l:'Factura A (RI → RI)'},{v:6,l:'Factura B (RI → CF/Mono)'}]
    : [{v:11,l:'Factura C (Monotributista)'}]

  const montoNum = parseFloat(amount) || 0
  const ivaPreview = tipoComprobante===1
    ? `Neto: $${fmt(montoNum)} · IVA 21%: $${fmt(Math.round(montoNum*0.21))} · <strong>Total: $${fmt(Math.round(montoNum*1.21))}</strong>`
    : montoNum>0 ? `Neto: $${fmt(Math.round(montoNum/1.21*100)/100)} · IVA incluido` : ''

  return `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px">
      <div style="background:var(--card);border:0.5px solid var(--border2);border-radius:16px;padding:28px;width:520px;max-height:90vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:600;color:var(--txt)">Nueva Factura</div>
            <div style="font-size:11px;color:var(--txt2);margin-top:2px">Comprobante real en ARCA con CAE</div>
          </div>
          <button id="btn-close-modal" style="background:none;border:none;color:var(--txt3);font-size:20px;cursor:pointer;line-height:1">×</button>
        </div>

        <div class="ff-form">
          <div class="ff-grid-2">
            <div class="ff-field">
              <label class="ff-label">Tipo de comprobante</label>
              <select class="ff-select" id="m-tipo">
                ${tiposComp.map(t=>`<option value="${t.v}" ${tipoComprobante===t.v?'selected':''}>${t.l}</option>`).join('')}
              </select>
            </div>
            <div class="ff-field">
              <label class="ff-label">Concepto</label>
              <select class="ff-select" id="m-concepto">
                <option value="2" ${concepto===2?'selected':''}>Servicios</option>
                <option value="1" ${concepto===1?'selected':''}>Productos</option>
                <option value="3" ${concepto===3?'selected':''}>Productos y Servicios</option>
              </select>
            </div>
          </div>

          <!-- Receptor -->
          <div style="background:var(--bg3);border-radius:10px;padding:14px">
            <div style="font-size:10.5px;font-weight:500;color:var(--blue);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">
              Receptor ${receptorTipo==='cuit'?'<span style="font-weight:400;color:var(--txt3);text-transform:none">— se valida en ARCA</span>':''}
            </div>
            <div style="display:flex;gap:6px;margin-bottom:12px">
              ${[{v:'consumidor_final',l:'Cons. Final'},{v:'cuit',l:'CUIT'},{v:'dni',l:'DNI'}].map(opt=>`
                <button class="rec-tipo-btn ff-btn${receptorTipo===opt.v?' ff-btn-primary':' ff-btn-secondary'}" data-rtype="${opt.v}" style="flex:1;font-size:11.5px;padding:6px">${opt.l}</button>
              `).join('')}
            </div>
            ${receptorTipo!=='consumidor_final'?`
              <div class="ff-grid-2" style="margin-bottom:10px">
                <div class="ff-field" style="margin-bottom:0">
                  <label class="ff-label">${receptorTipo==='cuit'?'CUIT':'DNI'}</label>
                  <input class="ff-input" id="m-doc-nro" value="${receptorDocNro}" placeholder="${receptorTipo==='cuit'?'20-12345678-9':'12345678'}" style="font-family:'DM Mono',monospace"/>
                  ${lookingUpCuit?`<div style="font-size:10.5px;color:var(--blue);margin-top:4px">🔍 Consultando ARCA...</div>`:''}
                  ${padronResult&&!lookingUpCuit?`
                    <div style="margin-top:6px;padding:8px;background:var(--green-d);border-radius:7px;border:0.5px solid rgba(46,192,138,.3)">
                      <div style="font-size:11px;font-weight:500;color:var(--green)">✓ ${padronResult.razonSocial||''}</div>
                      <div style="font-size:10.5px;color:var(--txt2)">${padronResult.condicionIva||''}</div>
                    </div>`:''}
                  ${padronError?`<div style="font-size:10.5px;color:var(--red);margin-top:4px">${padronError}</div>`:''}
                </div>
                <div class="ff-field" style="margin-bottom:0">
                  <label class="ff-label">Razón Social</label>
                  <input class="ff-input" id="m-razon-social" value="${receptorRazonSocial}" placeholder="Auto desde ARCA"/>
                </div>
              </div>
            `:''}
          </div>

          <div class="ff-field">
            <label class="ff-label">Cliente</label>
            <input class="ff-input" id="m-recipient" value="${recipient}" placeholder="Nombre del cliente o empresa"/>
          </div>
          <div class="ff-field">
            <label class="ff-label">Descripción</label>
            <input class="ff-input" id="m-description" value="${description}" placeholder="Ej: Servicios mayo 2026"/>
          </div>
          <div class="ff-field">
            <label class="ff-label">Email receptor <span style="font-size:10px;font-weight:400;color:var(--txt3)">— para enviar la factura</span></label>
            <input class="ff-input" id="m-email" type="email" value="${receptorEmail}" placeholder="cliente@email.com"/>
          </div>
          <div class="ff-field">
            <label class="ff-label">${tipoComprobante===1?'Monto NETO ($) — IVA se suma':'Monto total ($)'}</label>
            <input class="ff-input" id="m-amount" type="number" value="${amount}" placeholder="0.00" style="font-family:'DM Mono',monospace"/>
            ${ivaPreview?`<div style="font-size:11px;color:var(--txt2);background:var(--bg3);padding:7px 10px;border-radius:7px;margin-top:5px">${ivaPreview}</div>`:''}
          </div>

          ${invError?`<div style="padding:10px;border-radius:8px;background:var(--red-d);color:var(--red);font-size:12px">⚠ ${invError}</div>`:''}

          <div style="display:flex;gap:10px;margin-top:4px">
            <button id="btn-close-modal2" class="ff-btn ff-btn-secondary" style="flex:1">Cancelar</button>
            <button id="btn-emit-modal" class="ff-btn ff-btn-primary" style="flex:2" ${!amount||!recipient||invLoading?'disabled':''}>
              ${invLoading?'Emitiendo en ARCA...':'Emitir Factura →'}
            </button>
          </div>
        </div>
      </div>
    </div>`
}

// ─── Bind events ──────────────────────────────────────────────────────────────
function bindEvents() {
  if (!rootEl) return

  // Nav tabs
  rootEl.querySelectorAll('.nav-tab').forEach(b => b.addEventListener('click', e => {
    state.activeNav = e.target.dataset.nav
    if (state.activeNav==='mp' && state.mpReceived.length===0 && state.mpSent.length===0) fetchMPPayments()
    re()
  }))

  // Search
  const srch = rootEl.querySelector('#ff-search')
  if (srch) srch.addEventListener('input', e => { state.search = e.target.value; re() })

  // New invoice button
  const btnNew = rootEl.querySelector('#btn-new-inv')
  if (btnNew) btnNew.addEventListener('click', () => {
    state.showModal = true; state.invError = ''; state.padronResult = null; state.padronError = ''; re()
  })

  // Import MP button
  const btnMP = rootEl.querySelector('#btn-mp')
  if (btnMP) btnMP.addEventListener('click', () => { state.activeNav='mp'; fetchMPPayments() })

  // PDF buttons
  rootEl.querySelectorAll('.pdf-btn').forEach(b => b.addEventListener('click', e => {
    const inv = state.invoices.find(i=>String(i.id)===e.target.dataset.id) || (state.reportData?.facturas||[]).find(i=>String(i.id)===e.target.dataset.id)
    if (inv) downloadPDF(inv)
  }))

  // MP tabs
  rootEl.querySelectorAll('.mp-tab').forEach(b => b.addEventListener('click', e => {
    state.mpTab = e.target.dataset.tab; state.selectedIds = new Set(); state.sourceFilter='all'; re()
  }))

  // Refresh MP
  ;['#btn-refresh-mp','#btn-refresh-mp2'].forEach(sel => {
    const b = rootEl.querySelector(sel)
    if (b) b.addEventListener('click', fetchMPPayments)
  })

  // Source filter
  rootEl.querySelectorAll('.src-filter').forEach(b => b.addEventListener('click', e => {
    state.sourceFilter = e.target.dataset.src; re()
  }))

  // Select all MP
  const chkAll = rootEl.querySelector('#chk-all-mp')
  if (chkAll) chkAll.addEventListener('change', () => {
    const activeP = state.mpTab==='received' ? state.mpReceived : state.mpSent
    const filtered = state.sourceFilter==='all' ? activeP : activeP.filter(p=>p.payment_source===state.sourceFilter)
    const eligible = filtered.filter(p=>!state.invoicedIds.has(String(p.id))).map(p=>p.id)
    if (chkAll.checked) eligible.forEach(id=>state.selectedIds.add(id))
    else eligible.forEach(id=>state.selectedIds.delete(id))
    re()
  })

  // MP payment rows / checkboxes
  rootEl.querySelectorAll('.mp-payment-row').forEach(row => {
    if (row.dataset.invoiced==='true' || state.mpTab!=='received') return
    const pid = Number(row.dataset.pid)
    row.addEventListener('click', e => {
      if (e.target.type==='checkbox') return
      state.selectedIds.has(pid) ? state.selectedIds.delete(pid) : state.selectedIds.add(pid)
      re()
    })
  })
  rootEl.querySelectorAll('.mp-chk').forEach(chk => {
    chk.addEventListener('change', e => {
      const pid = Number(e.target.dataset.pid)
      e.target.checked ? state.selectedIds.add(pid) : state.selectedIds.delete(pid)
      re()
    })
  })

  // Generate from MP
  const btnGen = rootEl.querySelector('#btn-gen-mp')
  if (btnGen) btnGen.addEventListener('click', generateFromMP)

  // Reportes
  const repD = rootEl.querySelector('#rep-desde')
  if (repD) repD.addEventListener('change', e => { state.reportDesde = e.target.value })
  const repH = rootEl.querySelector('#rep-hasta')
  if (repH) repH.addEventListener('change', e => { state.reportHasta = e.target.value })
  const btnRep = rootEl.querySelector('#btn-reporte')
  if (btnRep) btnRep.addEventListener('click', fetchReporte)
  const btnCSV = rootEl.querySelector('#btn-export-csv')
  if (btnCSV) btnCSV.addEventListener('click', exportCSV)

  // Modal
  if (state.showModal) {
    ;['#btn-close-modal','#btn-close-modal2'].forEach(sel => {
      const b = rootEl.querySelector(sel)
      if (b) b.addEventListener('click', () => { state.showModal=false; re() })
    })

    // Receptor type buttons
    rootEl.querySelectorAll('.rec-tipo-btn').forEach(b => b.addEventListener('click', e => {
      state.receptorTipo = e.target.dataset.rtype
      state.padronResult = null; state.padronError = ''; re()
    }))

    // CUIT lookup on blur
    const docNroEl = rootEl.querySelector('#m-doc-nro')
    if (docNroEl) {
      docNroEl.addEventListener('input', e => { state.receptorDocNro = e.target.value; state.padronResult=null; state.padronError='' })
      docNroEl.addEventListener('blur', e => { if (state.receptorTipo==='cuit') lookupCuit(e.target.value) })
    }

    const razonEl = rootEl.querySelector('#m-razon-social')
    if (razonEl) razonEl.addEventListener('input', e => state.receptorRazonSocial = e.target.value)

    // Live form sync
    const fields = { '#m-tipo':'tipoComprobante', '#m-concepto':'concepto', '#m-recipient':'recipient', '#m-description':'description', '#m-email':'receptorEmail' }
    Object.entries(fields).forEach(([sel, key]) => {
      const el = rootEl.querySelector(sel)
      if (el) el.addEventListener('input', e => {
        state[key] = ['tipoComprobante','concepto'].includes(key) ? Number(e.target.value) : e.target.value
        if (key==='tipoComprobante') re()
      })
    })
    const amtEl = rootEl.querySelector('#m-amount')
    if (amtEl) amtEl.addEventListener('input', e => { state.amount = e.target.value; re() })

    // Emit
    const btnEmit = rootEl.querySelector('#btn-emit-modal')
    if (btnEmit) btnEmit.addEventListener('click', () => createInvoice())
  }
}

// ─── Public render entry ──────────────────────────────────────────────────────
export function renderFFDashboard(el) {
  rootEl = el
  // Reset nav state on re-mount
  state.activeNav = 'dashboard'
  state.showModal = false
  re()
  fetchInvoices()
}
