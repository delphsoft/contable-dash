import './style.css'
import { renderOverview }    from './views/overview.js'
import { renderVentas }      from './views/ventas.js'
import { renderProveedores } from './views/proveedores.js'
import { renderBreakeven }   from './views/breakeven.js'
import { renderAlertas }     from './views/alertas.js'

const VIEWS={
  overview:    {render:renderOverview,    title:'Overview',     sub:'Resumen ejecutivo del período'},
  ventas:      {render:renderVentas,      title:'Ventas',       sub:'Canales, categorías y gastos'},
  proveedores: {render:renderProveedores, title:'Proveedores',  sub:'Concentración y mapa de riesgo'},
  breakeven:   {render:renderBreakeven,   title:'Break-even',   sub:'Simulador de punto de equilibrio'},
  alertas:     {render:renderAlertas,     title:'Alertas',      sub:'Diagnóstico y acciones prioritarias'},
}

let current=null
const rendered=new Set()

function navigate(view){
  if(current===view)return
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view))
  document.getElementById('page-title').textContent=VIEWS[view].title
  document.getElementById('page-sub').textContent=VIEWS[view].sub
  if(current)document.getElementById(`view-${current}`).classList.remove('active')
  const el=document.getElementById(`view-${view}`)
  el.classList.add('active')
  if(!rendered.has(view)){VIEWS[view].render(el);rendered.add(view)}
  current=view
  window.scrollTo({top:0,behavior:'smooth'})
}

document.querySelectorAll('.nav-item').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.view)))
navigate('overview')
