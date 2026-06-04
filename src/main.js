import './style.css'
import { renderOverview }        from './views/contable/overview.js'
import { renderEstadoContable }  from './views/contable/estado-contable.js'
import { renderProveedores }     from './views/contable/proveedores.js'
import { renderBreakeven }       from './views/contable/breakeven.js'
import { renderAlertas }         from './views/contable/alertas.js'
import { renderDrive }           from './views/contable/drive.js'
import { renderSuperAdmin }      from './views/contable/superadmin.js'
import { renderFFDashboard }     from './views/factura/dashboard.js'
import { renderFFMercadoPago }   from './views/factura/mercadopago.js'
import { renderFFImpuestos }     from './views/factura/impuestos.js'
import { renderIVA }             from './views/contable/iva.js'
import { renderCompras }         from './views/contable/compras.js'
import { renderSueldos }         from './views/contable/sueldos.js'
import { renderCron }            from './views/contable/cron.js'

const VIEWS = {
  'ct-overview':    { render: renderOverview,       title:'Overview',         sub:'Oct 2025 — Feb 2026 · 5 meses',          action:'Analizar ↗',       prompt:'Dame un análisis ejecutivo del negocio',                                                                          showPeriod:true  },
  'ct-estado':      { render: renderEstadoContable, title:'Estado Contable',  sub:'Resultados, márgenes y gastos',           action:'Analizar ↗',       prompt:'Analizá el estado contable — por qué el margen neto es negativo y qué hacer',                                     showPeriod:true  },
  'ct-proveedores': { render: renderProveedores,    title:'Proveedores',      sub:'Concentración y mapa de riesgo',          action:'Estrategia ↗',     prompt:'Dame estrategia de negociación con Las Dinas y Pampa Líder para bajar el CMV',                                    showPeriod:false },
  'ct-breakeven':   { render: renderBreakeven,      title:'Break-even',       sub:'Simulador de punto de equilibrio',        action:'Simular ↗',        prompt:'¿Cuánto tengo que vender por mes para ser rentable?',                                                             showPeriod:false },
  'ct-alertas':     { render: renderAlertas,        title:'Alertas',          sub:'3 críticas · 4 advertencias activas',     action:'Plan de acción ↗', prompt:'Dame un plan de acción para las 3 alertas críticas del negocio',                                                  showPeriod:false },
  'ct-drive':       { render: renderDrive,          title:'Google Drive',     sub:'Sincronizar datos desde .xlsx',           action:null, prompt:null,   showPeriod:false },
  'ct-superadmin':  { render: renderSuperAdmin,     title:'Super Admin',      sub:'Panel estratégico — acceso restringido',  action:null, prompt:null,   showPeriod:false, nomemo:true },
  'ff-dashboard':   { render: renderFFDashboard,    title:'Facturas',         sub:'Emitir y gestionar comprobantes ARCA',    action:null, prompt:null,   showPeriod:false },
  'ff-mercadopago': { render: renderFFMercadoPago,  title:'MercadoPago',      sub:'Importar y clasificar movimientos',       action:null, prompt:null,   showPeriod:false },
  'ff-impuestos':   { render: renderFFImpuestos,    title:'Impuestos',        sub:'Monotributo · IIBB · Simulador',          action:null, prompt:null,   showPeriod:false },
  'ct-iva':         { render: renderIVA,            title:'IVA',              sub:'Libro ventas/compras · posición mensual', action:'Analizar ↗',       prompt:'Analizá mi posición de IVA del período y dame recomendaciones',                                                   showPeriod:false },
  'ct-compras':     { render: renderCompras,        title:'Compras',          sub:'Carga manual · validación padrón ARCA',   action:null, prompt:null,   showPeriod:false },
  'ct-sueldos':     { render: renderSueldos,        title:'Sueldos',          sub:'Nómina · liquidación · F931',             action:'Calcular ↗',       prompt:'Analizá el costo laboral total y cómo optimizarlo',                                                               showPeriod:false },
  'ct-cron':        { render: renderCron,           title:'Sync ARCA',        sub:'Sincronización automática · historial',   action:null, prompt:null,   showPeriod:false, nomemo:true },
}

let current = null
const rendered = new Set()
const mutableViews = new Set(['ff-dashboard','ff-mercadopago','ct-superadmin','ct-cron'])

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

  if (current) document.getElementById(`view-${current}`).classList.remove('active')
  const el = document.getElementById(`view-${view}`)
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

navigate('ct-overview')
