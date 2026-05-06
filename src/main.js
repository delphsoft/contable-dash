import './style.css'
import { renderFFDashboard }  from './views/factura/dashboard.js'
import { renderFFFacturas }   from './views/factura/facturas.js'
import { renderFFMercadoPago} from './views/factura/mercadopago.js'
import { renderFFImpuestos }  from './views/factura/impuestos.js'
import { renderOverview }     from './views/contable/overview.js'
import { renderVentas }       from './views/contable/ventas.js'
import { renderProveedores }  from './views/contable/proveedores.js'
import { renderBreakeven }    from './views/contable/breakeven.js'
import { renderAlertas }      from './views/contable/alertas.js'
import { renderDrive }        from './views/contable/drive.js'
import { renderAgente }       from './views/contable/agente.js'

const VIEWS = {
  'ff-dashboard':   { render: renderFFDashboard,  title:'Dashboard',       sub:'Resumen de facturación' },
  'ff-facturas':    { render: renderFFFacturas,    title:'Mis Facturas',    sub:'Emitir y gestionar comprobantes ARCA' },
  'ff-mercadopago': { render: renderFFMercadoPago, title:'MercadoPago',     sub:'Importar movimientos' },
  'ff-impuestos':   { render: renderFFImpuestos,   title:'Impuestos',       sub:'Monotributo · IIBB · Simulador' },
  'ct-overview':    { render: renderOverview,      title:'Overview Contable', sub:'Resumen ejecutivo del período' },
  'ct-ventas':      { render: renderVentas,        title:'Ventas',          sub:'Canales, categorías y gastos' },
  'ct-proveedores': { render: renderProveedores,   title:'Proveedores',     sub:'Concentración y mapa de riesgo' },
  'ct-breakeven':   { render: renderBreakeven,     title:'Break-even',      sub:'Simulador de punto de equilibrio' },
  'ct-alertas':     { render: renderAlertas,       title:'Alertas',         sub:'Diagnóstico y acciones prioritarias' },
  'ct-drive':       { render: renderDrive,         title:'Google Drive',    sub:'Actualizar datos desde .xlsx' },
  'ct-agente':      { render: renderAgente,        title:'Asesor IA',       sub:'Estrategia y recomendaciones' },
}

let current = null
const rendered = new Set()

function navigate(view) {
  if (!VIEWS[view]) return
  if (current === view) return
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view))
  document.getElementById('page-title').textContent = VIEWS[view].title
  document.getElementById('page-sub').textContent = VIEWS[view].sub
  if (current) document.getElementById(`view-${current}`).classList.remove('active')
  const el = document.getElementById(`view-${view}`)
  el.classList.add('active')
  // re-render mutable views every time
  const mutableViews = new Set(['ff-dashboard','ff-facturas','ff-mercadopago'])
  if (!rendered.has(view) || mutableViews.has(view)) {
    VIEWS[view].render(el)
    rendered.add(view)
  }
  current = view
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

window.__navigate = navigate

document.querySelectorAll('.nav-item').forEach(el =>
  el.addEventListener('click', () => navigate(el.dataset.view))
)

navigate('ff-dashboard')
