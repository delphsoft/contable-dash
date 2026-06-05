import { renderFFDashboard }   from '../factura/dashboard.js'
import { renderFFMercadoPago } from '../factura/mercadopago.js'

export function renderFacturacion(container) {
  var tabs = [
    { id: 'facturas', label: 'Facturas',    render: renderFFDashboard },
    { id: 'mp',       label: 'MercadoPago', render: renderFFMercadoPago },
  ]

  var nav = tabs.map(function(t, i) {
    return '<button class="fac-tab' + (i === 0 ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>'
  }).join('')

  container.innerHTML =
    '<div style="padding:0 0 24px">'
    + '<div class="fac-tabs" style="display:flex;gap:2px;border-bottom:1px solid var(--border);margin-bottom:18px;padding:0 24px;flex-wrap:wrap">' + nav + '</div>'
    + '<div id="fac-panel"></div>'
    + '</div>'
    + '<style>'
    + '.fac-tab{padding:10px 16px;font-size:.88rem;cursor:pointer;color:var(--text-muted);border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-1px;font-family:inherit}'
    + '.fac-tab.active{color:#6c5ce7;border-bottom-color:#6c5ce7;font-weight:500}'
    + '</style>'

  var panel = container.querySelector('#fac-panel')

  function mount(id) {
    var tab = tabs.find(function(t) { return t.id === id })
    panel.innerHTML = ''
    tab.render(panel)
  }

  container.querySelectorAll('.fac-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.fac-tab').forEach(function(x) { x.classList.remove('active') })
      btn.classList.add('active')
      mount(btn.dataset.tab)
    })
  })

  mount('facturas')
}
