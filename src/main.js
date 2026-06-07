import './style.css'
import { renderOverview }        from './views/contable/overview.js'
import { renderEstadoContable }  from './views/contable/estado-contable.js'
import { renderProveedores }     from './views/contable/proveedores.js'
import { renderBreakeven }       from './views/contable/breakeven.js'
import { renderAlertas }         from './views/contable/alertas.js'
import { renderDrive }           from './views/contable/drive.js'
import { renderSuperAdmin }      from './views/contable/superadmin.js'
import { renderFiscal }          from './views/contable/fiscal.js'
import { renderFacturacion }     from './views/contable/facturacion.js'

const VIEWS = {
  'ct-overview':    { render: renderOverview,       title:'Overview',         sub:'Oct 2025 — Feb 2026 · 5 meses',             action:'Analizar ↗',       prompt:'Dame un análisis ejecutivo del negocio',                                       showPeriod:true  },
  'ct-estado':      { render: renderEstadoContable, title:'Estado Contable',  sub:'Resultados, márgenes y gastos',              action:'Analizar ↗',       prompt:'Analizá el estado contable — por qué el margen neto es negativo y qué hacer', showPeriod:true  },
  'ct-proveedores': { render: renderProveedores,    title:'Proveedores',      sub:'Concentración y mapa de riesgo',             action:'Estrategia ↗',     prompt:'Dame estrategia de negociación con Las Dinas y Pampa Líder para bajar el CMV', showPeriod:false },
  'ct-breakeven':   { render: renderBreakeven,      title:'Break-even',       sub:'Simulador de punto de equilibrio',           action:'Simular ↗',        prompt:'¿Cuánto tengo que vender por mes para ser rentable?',                          showPeriod:false },
  'ct-alertas':     { render: renderAlertas,        title:'Alertas',          sub:'3 críticas · 4 advertencias activas',        action:'Plan de acción ↗', prompt:'Dame un plan de acción para las 3 alertas críticas del negocio',               showPeriod:false },
  'ct-drive':       { render: renderDrive,          title:'Google Drive',     sub:'Sincronizar datos desde .xlsx',              action:null, prompt:null,   showPeriod:false },
  'ct-fiscal':      { render: renderFiscal,         title:'Fiscal',           sub:'IVA · Compras · Sueldos · Impuestos · Sync', action:null, prompt:null,   showPeriod:false },
  'ff-facturacion': { render: renderFacturacion,    title:'Facturación',      sub:'Facturas ARCA · MercadoPago',                action:null, prompt:null,   showPeriod:false },
  'ct-superadmin':  { render: renderSuperAdmin,     title:'Super Admin',      sub:'Panel estratégico — acceso restringido',     action:null, prompt:null,   showPeriod:false, nomemo:true },
}

let current = null
const rendered = new Set()
const mutableViews = new Set(['ct-fiscal','ff-facturacion','ct-superadmin'])

function setActiveRail(view) {
  document.querySelectorAll('.rail-item[data-view]').forEach(el => {
    const isActive = el.dataset.view === view
    el.classList.toggle('active', isActive)
    const ct = el.querySelector('.corner-top')
    const cb = el.querySelector('.corner-bottom')
    if (isActive) {
      if (!ct) { const d = document.createElement('div'); d.className='corner-top';    el.appendChild(d) }
      if (!cb) { const d = document.createElement('div'); d.className='corner-bottom'; el.appendChild(d) }
    } else {
      if (ct) ct.remove()
      if (cb) cb.remove()
    }
  })
}

function navigate(view) {
  if (!VIEWS[view] || current === view) return
  const meta = VIEWS[view]
  setActiveRail(view)
  document.getElementById('page-title').textContent = meta.title
  document.getElementById('page-sub').textContent   = meta.sub
  const chips = document.getElementById('period-chips')
  if (chips) chips.style.display = meta.showPeriod ? 'flex' : 'none'
  const btnAction = document.getElementById('topbar-action')
  const btnLabel  = document.getElementById('topbar-action-label')
  if (btnAction) {
    if (meta.action && meta.prompt) {
      btnAction.style.display = 'flex'
      btnLabel.textContent    = meta.action
      btnAction.onclick = () => {
        const ta = document.querySelector('#ag-input')
        if (ta) { ta.value = meta.prompt; ta.dispatchEvent(new Event('input')) }
      }
    } else {
      btnAction.style.display = 'none'
    }
  }
  if (current) document.getElementById('view-' + current).classList.remove('active')
  const el = document.getElementById('view-' + view)
  el.classList.add('active')
  if (!rendered.has(view) || mutableViews.has(view)) {
    meta.render(el)
    rendered.add(view)
  }
  current = view
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

window.__navigate = navigate

document.querySelectorAll('.rail-item[data-view]').forEach(el =>
  el.addEventListener('click', () => navigate(el.dataset.view))
)

document.querySelectorAll('.period-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.period-chip').forEach(c => c.classList.remove('active'))
    chip.classList.add('active')
  })
})
// Verificar sesión antes de cargar el dashboard
async function checkAuth() {
  const token = localStorage.getItem('ff_jwt')
  if (!token) {
    showAuthModal()
    return false
  }
  // Verificar que el JWT no esté vencido
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp && payload.exp < Date.now() / 1000) {
      localStorage.removeItem('ff_jwt')
      showAuthModal()
      return false
    }
    return true
  } catch {
    showAuthModal()
    return false
  }
}

navigate('ct-overview')
