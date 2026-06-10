// Vencimientos ARCA 2026 — motor de calendario fiscal

const VENCIMIENTOS_2026 = [
  // IVA mensual (responsables inscriptos)
  { id:'iva-01', nombre:'IVA Enero 2026',     fecha:'2026-02-20', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-02', nombre:'IVA Febrero 2026',   fecha:'2026-03-20', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-03', nombre:'IVA Marzo 2026',     fecha:'2026-04-22', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-04', nombre:'IVA Abril 2026',     fecha:'2026-05-21', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-05', nombre:'IVA Mayo 2026',      fecha:'2026-06-22', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-06', nombre:'IVA Junio 2026',     fecha:'2026-07-21', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-07', nombre:'IVA Julio 2026',     fecha:'2026-08-20', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-08', nombre:'IVA Agosto 2026',    fecha:'2026-09-21', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-09', nombre:'IVA Septiembre 2026',fecha:'2026-10-21', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-10', nombre:'IVA Octubre 2026',   fecha:'2026-11-20', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-11', nombre:'IVA Noviembre 2026', fecha:'2026-12-21', tipo:'IVA',        monto:null, estado:'pendiente' },
  { id:'iva-12', nombre:'IVA Diciembre 2026', fecha:'2027-01-20', tipo:'IVA',        monto:null, estado:'pendiente' },

  // Ganancias — anticipos bimestrales (régimen simplificado personas jurídicas)
  { id:'gan-01', nombre:'Anticipo Ganancias 1° 2026', fecha:'2026-03-16', tipo:'Ganancias', monto:null, estado:'pendiente' },
  { id:'gan-02', nombre:'Anticipo Ganancias 2° 2026', fecha:'2026-05-15', tipo:'Ganancias', monto:null, estado:'pendiente' },
  { id:'gan-03', nombre:'Anticipo Ganancias 3° 2026', fecha:'2026-07-15', tipo:'Ganancias', monto:null, estado:'pendiente' },
  { id:'gan-04', nombre:'Anticipo Ganancias 4° 2026', fecha:'2026-09-15', tipo:'Ganancias', monto:null, estado:'pendiente' },
  { id:'gan-05', nombre:'Anticipo Ganancias 5° 2026', fecha:'2026-11-16', tipo:'Ganancias', monto:null, estado:'pendiente' },
  { id:'gan-06', nombre:'DDJJ Ganancias 2025',         fecha:'2026-05-11', tipo:'Ganancias', monto:null, estado:'pendiente' },

  // Bienes Personales
  { id:'bp-01', nombre:'DDJJ Bienes Personales 2025', fecha:'2026-06-22', tipo:'BienesPersonales', monto:null, estado:'pendiente' },

  // Ingresos Brutos (CABA — CM05 bimestral ejemplo)
  { id:'ib-01', nombre:'IIBB Bimestre Ene-Feb 2026',  fecha:'2026-03-20', tipo:'IIBB', monto:null, estado:'pendiente' },
  { id:'ib-02', nombre:'IIBB Bimestre Mar-Abr 2026',  fecha:'2026-05-20', tipo:'IIBB', monto:null, estado:'pendiente' },
  { id:'ib-03', nombre:'IIBB Bimestre May-Jun 2026',  fecha:'2026-07-20', tipo:'IIBB', monto:null, estado:'pendiente' },
  { id:'ib-04', nombre:'IIBB Bimestre Jul-Ago 2026',  fecha:'2026-09-21', tipo:'IIBB', monto:null, estado:'pendiente' },
  { id:'ib-05', nombre:'IIBB Bimestre Sep-Oct 2026',  fecha:'2026-11-20', tipo:'IIBB', monto:null, estado:'pendiente' },
  { id:'ib-06', nombre:'IIBB Bimestre Nov-Dic 2026',  fecha:'2027-01-20', tipo:'IIBB', monto:null, estado:'pendiente' },

  // Sueldos / cargas sociales
  { id:'ss-01', nombre:'Cargas Sociales Enero 2026',     fecha:'2026-02-10', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-02', nombre:'Cargas Sociales Febrero 2026',   fecha:'2026-03-10', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-03', nombre:'Cargas Sociales Marzo 2026',     fecha:'2026-04-10', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-04', nombre:'Cargas Sociales Abril 2026',     fecha:'2026-05-11', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-05', nombre:'Cargas Sociales Mayo 2026',      fecha:'2026-06-10', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-06', nombre:'Cargas Sociales Junio 2026',     fecha:'2026-07-10', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-07', nombre:'Cargas Sociales Julio 2026',     fecha:'2026-08-10', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-08', nombre:'Cargas Sociales Agosto 2026',    fecha:'2026-09-10', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-09', nombre:'Cargas Sociales Septiembre 2026',fecha:'2026-10-12', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-10', nombre:'Cargas Sociales Octubre 2026',   fecha:'2026-11-10', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-11', nombre:'Cargas Sociales Noviembre 2026', fecha:'2026-12-10', tipo:'Sueldos', monto:null, estado:'pendiente' },
  { id:'ss-12', nombre:'Cargas Sociales Diciembre 2026', fecha:'2027-01-12', tipo:'Sueldos', monto:null, estado:'pendiente' },
]

const TIPO_COLOR = {
  IVA:             { bg:'#1a3a5c', accent:'#3b82f6', label:'IVA' },
  Ganancias:       { bg:'#1a2e1a', accent:'#22c55e', label:'Ganancias' },
  BienesPersonales:{ bg:'#2e1a3a', accent:'#a855f7', label:'Bs. Personales' },
  IIBB:            { bg:'#3a2a1a', accent:'#f97316', label:'IIBB' },
  Sueldos:         { bg:'#1a2e2e', accent:'#06b6d4', label:'Sueldos' },
}

const STORAGE_KEY = 'venc_estados_2026'

function cargarEstados() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function guardarEstados(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function aplicarEstados(lista) {
  const map = cargarEstados()
  return lista.map(v => ({ ...v, estado: map[v.id] ?? v.estado }))
}

function hoy() { return new Date().toISOString().split('T')[0] }

function diasRestantes(fecha) {
  const diff = (new Date(fecha) - new Date(hoy())) / 86400000
  return Math.ceil(diff)
}

function urgencia(dias) {
  if (dias < 0)   return 'vencido'
  if (dias <= 3)  return 'critico'
  if (dias <= 10) return 'proximo'
  return 'ok'
}

function formatFecha(iso) {
  const [y, m, d] = iso.split('-')
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d} ${meses[+m - 1]} ${y}`
}

export function restaurarCumplidos() {
  const map = cargarEstados()
  const hoyStr = hoy()
  let changed = false
  Object.keys(map).forEach(id => {
    if (map[id] === 'cumplido') {
      const v = VENCIMIENTOS_2026.find(x => x.id === id)
      // Si el vencimiento ya pasó hace más de 60 días, limpiar
      if (v && diasRestantes(v.fecha) < -60) { delete map[id]; changed = true }
    }
  })
  if (changed) guardarEstados(map)
}

function buildCard(v) {
  const dias = diasRestantes(v.fecha)
  const urg  = v.estado === 'cumplido' ? 'ok' : urgencia(dias)
  const cfg  = TIPO_COLOR[v.tipo] || TIPO_COLOR.IVA
  const diasTxt = v.estado === 'cumplido'
    ? '✓ Cumplido'
    : dias < 0
      ? `Venció hace ${Math.abs(dias)}d`
      : dias === 0
        ? '¡Hoy!'
        : `${dias}d`

  return `
    <div class="venc-card venc-${urg}${v.estado === 'cumplido' ? ' venc-done' : ''}" data-id="${v.id}">
      <div class="venc-badge" style="background:${cfg.accent}22;color:${cfg.accent}">${cfg.label}</div>
      <div class="venc-nombre">${v.nombre}</div>
      <div class="venc-fecha">${formatFecha(v.fecha)}</div>
      <div class="venc-dias venc-dias-${urg}">${diasTxt}</div>
      <button class="venc-btn-cumplir" data-id="${v.id}" title="${v.estado === 'cumplido' ? 'Desmarcar' : 'Marcar cumplido'}">
        ${v.estado === 'cumplido' ? '↩' : '✓'}
      </button>
    </div>`
}

function buildResumen(lista) {
  const vencidos = lista.filter(v => v.estado !== 'cumplido' && diasRestantes(v.fecha) < 0).length
  const criticos = lista.filter(v => v.estado !== 'cumplido' && urgencia(diasRestantes(v.fecha)) === 'critico').length
  const proximos = lista.filter(v => v.estado !== 'cumplido' && urgencia(diasRestantes(v.fecha)) === 'proximo').length
  const cumplidos= lista.filter(v => v.estado === 'cumplido').length

  return `
    <div class="venc-resumen">
      <div class="venc-stat venc-stat-vencido"><span>${vencidos}</span><small>Vencidos</small></div>
      <div class="venc-stat venc-stat-critico"><span>${criticos}</span><small>Críticos (≤3d)</small></div>
      <div class="venc-stat venc-stat-proximo"><span>${proximos}</span><small>Próximos (≤10d)</small></div>
      <div class="venc-stat venc-stat-ok"><span>${cumplidos}</span><small>Cumplidos</small></div>
    </div>`
}

export function renderVencimientos(container) {
  restaurarCumplidos()
  const lista = aplicarEstados(VENCIMIENTOS_2026)
    .filter(v => diasRestantes(v.fecha) > -30 || v.estado === 'cumplido')
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const tipos = ['Todos', ...Object.keys(TIPO_COLOR)]
  let filtroActivo = 'Todos'

  function render() {
    const filtrada = filtroActivo === 'Todos'
      ? lista
      : lista.filter(v => v.tipo === filtroActivo)

    container.innerHTML = `
      <div class="venc-root">
        <div class="venc-header">
          <h2>Vencimientos ARCA 2026</h2>
          <p class="venc-desc">Calendario fiscal · IVA · Ganancias · IIBB · Cargas Sociales</p>
        </div>
        ${buildResumen(lista)}
        <div class="venc-filtros">
          ${tipos.map(t => `<button class="venc-filtro${t === filtroActivo ? ' active' : ''}" data-tipo="${t}">${t === 'BienesPersonales' ? 'Bs. Personales' : t}</button>`).join('')}
        </div>
        <div class="venc-grid">
          ${filtrada.length ? filtrada.map(buildCard).join('') : '<p class="venc-empty">Sin vencimientos en este período.</p>'}
        </div>
      </div>`

    container.querySelectorAll('.venc-filtro').forEach(btn => {
      btn.addEventListener('click', () => {
        filtroActivo = btn.dataset.tipo
        render()
      })
    })

    container.querySelectorAll('.venc-btn-cumplir').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.id
        const map = cargarEstados()
        const v   = lista.find(x => x.id === id)
        if (!v) return
        if (v.estado === 'cumplido') {
          delete map[id]
          v.estado = 'pendiente'
        } else {
          map[id] = 'cumplido'
          v.estado = 'cumplido'
        }
        guardarEstados(map)
        render()
      })
    })
  }

  render()
}
