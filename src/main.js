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
import { renderVencimientos, restaurarCumplidos } from './vencimientos.js'
import './vencimientos.css'
import { renderDiagnostico } from './diagnostico.js'
import './diagnostico.css'

const VIEWS = {
  'ct-overview':    { render: renderOverview,       title:'Overview',         sub:'Oct 2025 — Feb 2026 · 5 meses',             action:'Analizar ↗',       prompt:'Dame un análisis ejecutivo del negocio',                                       showPeriod:true  },
  'ct-estado':      { render: renderEstadoContable, title:'Estado Contable',  sub:'Resultados, márgenes y gastos',              action:'Analizar ↗',       prompt:'Analizá el estado contable — por qué el margen neto es negativo y qué hacer', showPeriod:true  },
  'ct-proveedores': { render: renderProveedores,    title:'Proveedores',      sub:'Concentración y mapa de riesgo',             action:'Estrategia ↗',     prompt:'Dame estrategia de negociación con Las Dinas y Pampa Líder para bajar el CMV', showPeriod:false },
  'ct-breakeven':   { render: renderBreakeven,      title:'Break-even',       sub:'Simulador de punto de equilibrio',           action:'Simular ↗',        prompt:'¿Cuánto tengo que vender por mes para ser rentable?',                          showPeriod:false },
  'ct-alertas':     { render: renderAlertas,        title:'Alertas',          sub:'3 críticas · 4 advertencias activas',        action:'Plan de acción ↗', prompt:'Dame un plan de acción para las 3 alertas críticas del negocio',               showPeriod:false },
  'ct-drive':       { render: renderDrive,          title:'Google Drive',     sub:'Sincronizar datos desde .xlsx',              action:null, prompt:null,   showPeriod:false },
  'ct-fiscal':      { render: renderFiscal,         title:'Fiscal',           sub:'IVA · Compras · Sueldos · Impuestos · Sync', action:null, prompt:null,   showPeriod:false },
  'ff-facturacion': { render: renderFacturacion,    title:'Facturación',      sub:'Facturas ARCA · MercadoPago',                action:null, prompt:null,   showPeriod:false },
  'ct-vencimientos':{ render: renderVencimientos,   title:'Vencimientos',     sub:'Calendario fiscal ARCA 2026',                action:null, prompt:null,   showPeriod:false },
  'ct-diagnostico': { render: renderDiagnostico,    title:'Diagnóstico IA',   sub:'Análisis fiscal y estratégico · powered by Claude', action:null, prompt:null, showPeriod:false },
  'ct-superadmin':  { render: renderSuperAdmin,     title:'Super Admin',      sub:'Panel estratégico — acceso restringido',     action:null, prompt:null,   showPeriod:false, nomemo:true },
}
