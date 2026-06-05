import { renderIVA }          from './iva.js'
import { renderCompras }      from './compras.js'
import { renderSueldos }      from './sueldos.js'
import { renderFFImpuestos }  from '../factura/impuestos.js'
import { renderCumplimiento } from './cumplimiento.js'
import { renderCron }         from './cron.js'

export function renderFiscal(container) {
  var tabs = [
    { id: 'iva',          label: 'IVA',          render: renderIVA },
    { id: 'compras',      label: 'Compras',      render: renderCompras },
    { id: 'sueldos',      label: 'Sueldos',      render: renderSueldos },
    { id: 'impuestos',    label: 'Impuestos',    render: renderFFImpuestos },
    { id: 'cumplimiento', label: 'Cumplimiento', render: renderCumplimiento },
    { id: 'sync',         label: 'Sync ARCA',    render: renderCron },
  ]

  var nav = tabs.map(function(t, i) {
    return '<button class="fiscal-tab' + (i === 0 ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>'
  }).join('')

  container.innerHTML =
    '<div style="padding:0 0 24px">'
    + '<div class="fiscal-tabs" style="display:flex;gap:2px;border-bottom:1px solid var(--border);margin-bottom:0;padding:0 24px;flex-wrap:wrap">' + nav + '</div>'
    + '<div id="fiscal-panel"></div>'
    + '</div>'
    + '<style>'
    + '.fiscal-tab{padding:10px 16px;font-size:.88rem;cursor:pointer;color:var(--text-muted);border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-1px;font-family:inherit;transition:color .15s}'
    + '.fiscal-tab:hover{color:var(--text)}'
    + '.fiscal-tab.active{color:#6c5ce7;border-bottom-color:#6c5ce7;font-weight:500}'
    + '</style>'

  var panel = container.querySelector('#fiscal-panel')

  function mount(id) {
    var tab = tabs.find(function(t) { return t.id === id })
    if (!tab) return
    panel.innerHTML = ''
    tab.render(panel)
  }

  container.querySelectorAll('.fiscal-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.fiscal-tab').forEach(function(x) { x.classList.remove('active') })
      btn.classList.add('active')
      mount(btn.dataset.tab)
    })
  })

  mount('iva')
}
