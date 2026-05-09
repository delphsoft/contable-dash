import './style.css'
import { renderOverview }        from './views/contable/overview.js'
import { renderEstadoContable }  from './views/contable/estado-contable.js'
import { renderProveedores }     from './views/contable/proveedores.js'
import { renderBreakeven }       from './views/contable/breakeven.js'
import { renderAlertas }         from './views/contable/alertas.js'
import { renderDrive }           from './views/contable/drive.js'
import { renderAgente }          from './views/contable/agente.js'
import { renderSuperAdmin }      from './views/contable/superadmin.js'
import { renderFFDashboard }     from './views/factura/dashboard.js'
import { renderFFMercadoPago }   from './views/factura/mercadopago.js'
import { renderFFImpuestos }     from './views/factura/impuestos.js'

const VIEWS = {
  'ct-overview':    { render: renderOverview,       title: 'Overview',          sub: 'Oct 2025 — Feb 2026 · 5 meses',            action: 'Analizar ↗',    prompt: 'Dame un análisis ejecutivo del negocio basado en los datos del dashboard', showPeriod: true  },
  'ct-estado':      { render: renderEstadoContable, title: 'Estado Contable',   sub: 'Resultados, márgenes y gastos',             action: 'Analizar ↗',    prompt: 'Analizá el estado contable — por qué el margen neto es negativo y qué hacer', showPeriod: true  },
  'ct-proveedores': { render: renderProveedores,    title: 'Proveedores',       sub: 'Concentración y mapa de riesgo',            action: 'Estrategia ↗',  prompt: 'Dame estrategia de negociación con Las Dinas y Pampa Líder para bajar el CMV', showPeriod: false },
  'ct-breakeven':   { render: renderBreakeven,      title: 'Break-even',        sub: 'Simulador de punto de equilibrio',          action: 'Simular ↗',     prompt: '¿Cuánto tengo que vender por mes para que el negocio sea rentable?',        showPeriod: false },
  'ct-alertas':     { render: renderAlertas,        title: 'Alertas',           sub: '3 críticas · 4 advertencias activas',       action: 'Plan de acción ↗', prompt: 'Dame un plan de acción concreto para resolver las 3 alertas críticas del negocio', showPeriod: false },
  'ct-drive':       { render: renderDrive,          title: 'Google Drive',      sub: 'Sincronizar datos desde .xlsx',             action: null,            prompt: null,                                                                           showPeriod: false },
  'ct-agente':      { render: renderAgente,         title: 'Asesor IA',         sub: 'Estrategia y recomendaciones',              action: null,            prompt: null,                                                                           showPeriod: false },
  'ct-superadmin':  { render: renderSuperAdmin,     title: 'Super Admin',       sub: 'Panel estratégico — acceso restringido',   action: null,            prompt: null,                                                                           showPeriod: false, nomemo: true },
  'ff-dashboard':   { render: renderFFDashboard,    title: 'Facturas',          sub: 'Emitir y gestionar comprobantes ARCA',      action: 'Nueva factura', prompt: null,                                                                           showPeriod: false },
  'ff-mercadopago': { render: renderFFMercadoPago,  title: 'MercadoPago',       sub: 'Importar y clasificar movimientos',         action: null,            prompt: null,                                                                           showPeriod: false },
  'ff-impuestos':   { render: renderFFImpuestos,    title: 'Impuestos',         sub: 'Monotributo · IIBB · Simulador',           action: null,            prompt: null,                                                                           showPeriod: false },
}

let current = null
const rendered = new Set()
const mutableViews = new Set(['ff-dashboard','ff-mercadopago','ct-superadmin'])

function navigate(view) {
  if (!VIEWS[view] || current === view) return
  const meta = VIEWS[view]

  // Rail items
  document.querySelectorAll('.rail-item[data-view]').forEach(el =>
    el.classList.toggle('active', el.dataset.view === view)
  )

  // Topbar
  document.getElementById('page-title').textContent = meta.title
  document.getElementById('page-sub').textContent   = meta.sub

  // Period chips
  const chips = document.getElementById('period-chips')
  if (chips) chips.style.display = meta.showPeriod ? 'flex' : 'none'

  // Action button
  const btnAction = document.getElementById('topbar-action')
  const btnLabel  = document.getElementById('topbar-action-label')
  if (btnAction) {
    if (meta.action && meta.prompt) {
      btnAction.style.display = 'flex'
      btnLabel.textContent = meta.action
      btnAction.onclick = () => {
        if (meta.prompt) {
          const inp = document.getElementById('ct-agente')
          navigate('ct-agente')
          setTimeout(() => {
            const ta = document.getElementById('sa-input') || document.getElementById('ag-input')
            if (ta) { ta.value = meta.prompt; ta.dispatchEvent(new Event('input')) }
          }, 300)
        }
      }
    } else if (meta.action === 'Nueva factura') {
      btnAction.style.display = 'flex'
      btnLabel.textContent = 'Nueva factura'
      btnAction.onclick = () => navigate('ff-dashboard')
    } else {
      btnAction.style.display = 'none'
    }
  }

  // Swap views
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

// Rail click
document.querySelectorAll('.rail-item[data-view]').forEach(el =>
  el.addEventListener('click', () => navigate(el.dataset.view))
)

// Period chips
document.querySelectorAll('.period-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.period-chip').forEach(c => c.classList.remove('active'))
    chip.classList.add('active')
  })
})

navigate('ct-overview')
