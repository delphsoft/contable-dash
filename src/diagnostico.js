// diagnostico.js — Módulo de diagnóstico IA para DashBI
// Compatible con contable-dash (Vite + Vanilla JS)
// Constraint: NO usar template literals anidados — concatenación de strings

var _diagFiles = []

export function renderDiagnostico(container) {
  container.innerHTML = getDiagHTML()
  initDiagEvents()
}

function getDiagHTML() {
  return '<div class="diag-wrap">' +
    '<div class="diag-screen" id="diag-input">' +
      '<div class="diag-badge">Diagnóstico IA</div>' +
      '<h2 class="diag-title">Contanos el estado de tu empresa</h2>' +
      '<p class="diag-sub">Escribí libremente — el motor detecta régimen, empleados, sociedad, cashflow y oportunidades.</p>' +
      '<div class="diag-guide">' +
        '<div class="diag-guide-title">Qué incluir para un diagnóstico preciso</div>' +
        '<div class="diag-guide-grid">' +
          '<div class="diag-gi">Régimen impositivo (Monotributo cat. / RI) y situación ARCA</div>' +
          '<div class="diag-gi">Facturación anual y principales costos</div>' +
          '<div class="diag-gi">Empleados: cantidad, si están registrados, ART</div>' +
          '<div class="diag-gi">Tipo de sociedad (SAS, SRL, unipersonal…)</div>' +
          '<div class="diag-gi">Situación de caja, cobros, deudas</div>' +
          '<div class="diag-gi">Objetivo: crecer, exportar, vender, ordenarse</div>' +
          '<div class="diag-gi">Proveedores: si los validás en ARCA o no</div>' +
          '<div class="diag-gi">Si operás en dólares o tenés clientes del exterior</div>' +
        '</div>' +
      '</div>' +
      '<textarea id="diag-txt" class="diag-textarea" placeholder="Ej: Soy responsable inscripto, panadería en Córdoba, facturación $45M anuales, costos $28M. Tengo 4 empleados registrados y 1 en negro. Sin ART. Proveedores de harina sin validar en ARCA. Cobro a 30 días. Quiero abrir segundo local. Soy persona física sin sociedad formal..."></textarea>' +
      '<input type="file" id="diag-finp" multiple accept=".pdf,.xlsx,.xls,.csv" style="display:none" />' +
      '<div class="diag-upload" id="diag-upload-zone">' +
        '<span class="diag-upload-icon">📎</span>' +
        '<span class="diag-upload-text"><strong>Adjuntá archivos</strong> — cashflow, balance, libro IVA, estado ARCA (opcional)</span>' +
      '</div>' +
      '<div id="diag-flist" class="diag-flist"></div>' +
      '<div class="diag-foot">' +
        '<span class="diag-hint">El análisis usa IA especializada en normativa argentina 2026</span>' +
        '<button class="diag-btn-main" id="diag-btn-analizar">✦ Analizar empresa</button>' +
      '</div>' +
    '</div>' +
    '<div class="diag-screen" id="diag-thinking" style="display:none">' +
      '<div class="diag-thinking-wrap">' +
        '<div class="diag-dots"><span></span><span></span><span></span></div>' +
        '<div id="diag-tmsg" class="diag-tmsg">Analizando el contexto de tu empresa…</div>' +
      '</div>' +
    '</div>' +
    '<div class="diag-screen" id="diag-result" style="display:none">' +
      '<div id="diag-chips" class="diag-chips"></div>' +
      '<div class="diag-res-top">' +
        '<div id="diag-res-nom" class="diag-res-nom"></div>' +
        '<button class="diag-nuevo-btn" id="diag-nuevo">Nuevo diagnóstico</button>' +
      '</div>' +
      '<div id="diag-alertas"></div>' +
      '<div class="diag-score-block">' +
        '<div id="diag-score-num" class="diag-score-num">—</div>' +
        '<div class="diag-score-right">' +
          '<div class="diag-score-lbl">Score de salud empresarial / 100</div>' +
          '<div class="diag-score-bar"><div id="diag-score-fill" class="diag-score-fill" style="width:0%"></div></div>' +
          '<div id="diag-score-desc" class="diag-score-desc"></div>' +
        '</div>' +
      '</div>' +
      '<div id="diag-metrics" class="diag-metrics-grid"></div>' +
      '<hr class="diag-hr" />' +
      '<div class="diag-sec-lbl">Semáforo por dimensión</div>' +
      '<div id="diag-dims"></div>' +
      '<hr class="diag-hr" />' +
      '<div class="diag-sec-lbl">Recomendaciones priorizadas</div>' +
      '<div id="diag-recs"></div>' +
      '<hr class="diag-hr" />' +
      '<div class="diag-actions">' +
        '<button class="diag-btn-full" id="diag-act-profundizar">Profundizar con el asesor IA →</button>' +
        '<button class="diag-btn-sec" id="diag-act-informe">📄 Generar informe para el cliente</button>' +
        '<button class="diag-btn-sec" id="diag-act-monori">⚖️ Análisis Monotributo vs RI</button>' +
        '<button class="diag-btn-sec" id="diag-act-incentivos">🏷️ Ver incentivos disponibles</button>' +
        '<button class="diag-btn-sec" id="diag-act-iva">🧮 Calcular posición IVA</button>' +
      '</div>' +
    '</div>' +
  '</div>'
}

function initDiagEvents() {
  _diagFiles = []

  var uploadZone = document.getElementById('diag-upload-zone')
  var fileInput = document.getElementById('diag-finp')
  var btnAnalizar = document.getElementById('diag-btn-analizar')
  var btnNuevo = document.getElementById('diag-nuevo')

  if (uploadZone) uploadZone.addEventListener('click', function() { fileInput.click() })
  if (fileInput) fileInput.addEventListener('change', function() { diagAddFiles(this) })
  if (btnAnalizar) btnAnalizar.addEventListener('click', diagAnalizar)
  if (btnNuevo) btnNuevo.addEventListener('click', diagReiniciar)

  var actProfundizar = document.getElementById('diag-act-profundizar')
  var actInforme = document.getElementById('diag-act-informe')
  var actMonoRI = document.getElementById('diag-act-monori')
  var actIncentivos = document.getElementById('diag-act-incentivos')
  var actIVA = document.getElementById('diag-act-iva')

  if (actProfundizar) actProfundizar.addEventListener('click', function() {
    navigate('chat')
  })
  if (actInforme) actInforme.addEventListener('click', function() {
    navigate('chat')
  })
  if (actMonoRI) actMonoRI.addEventListener('click', function() {
    navigate('chat')
  })
  if (actIncentivos) actIncentivos.addEventListener('click', function() {
    navigate('chat')
  })
  if (actIVA) actIVA.addEventListener('click', function() {
    navigate('iva-ventas')
  })
}

function diagAddFiles(inp) {
  var fl = document.getElementById('diag-flist')
  Array.from(inp.files).forEach(function(f) {
    if (_diagFiles.find(function(x) { return x.name === f.name })) return
    _diagFiles.push(f)
    var id = 'dfc' + f.name.replace(/\W/g, '_')
    var chip = document.createElement('span')
    chip.className = 'diag-fchip'
    chip.id = id
    chip.textContent = f.name.slice(0, 22) + (f.name.length > 22 ? '…' : '')
    var rmBtn = document.createElement('span')
    rmBtn.textContent = ' ×'
    rmBtn.style.cursor = 'pointer'
    rmBtn.addEventListener('click', function() { diagRmFile(f.name) })
    chip.appendChild(rmBtn)
    fl.appendChild(chip)
  })
}

function diagRmFile(name) {
  _diagFiles = _diagFiles.filter(function(f) { return f.name !== name })
  var chip = document.getElementById('dfc' + name.replace(/\W/g, '_'))
  if (chip) chip.remove()
}

function diagShow(id) {
  var screens = ['diag-input', 'diag-thinking', 'diag-result']
  screens.forEach(function(s) {
    var el = document.getElementById(s)
    if (el) el.style.display = s === id ? 'block' : 'none'
  })
}

var thinkMsgs = [
  'Analizando régimen impositivo y ARCA…',
  'Evaluando situación laboral y cargas sociales…',
  'Revisando estructura societaria y riesgo patrimonial…',
  'Analizando flujo de caja y posición financiera…',
  'Detectando incentivos fiscales disponibles…',
  'Calculando score y priorizando recomendaciones…'
]

async function diagAnalizar() {
  var txt = document.getElementById('diag-txt')
  if (!txt || txt.value.trim().length < 20) {
    txt.style.borderColor = '#E24B4A'
    setTimeout(function() { txt.style.borderColor = '' }, 1500)
    txt.focus()
    return
  }

  diagShow('diag-thinking')

  var i = 0
  var iv = setInterval(function() {
    i++
    var el = document.getElementById('diag-tmsg')
    if (el && i < thinkMsgs.length) el.textContent = thinkMsgs[i]
    else clearInterval(iv)
  }, 900)

  try {
    var archivosNombres = _diagFiles.map(function(f) { return f.name })

    var resp = await fetch('/api/core?action=diagnostico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contexto: txt.value.trim(),
        archivos: archivosNombres
      })
    })

    clearInterval(iv)

    if (!resp.ok) {
      var errData = await resp.json()
      throw new Error(errData.error || 'Error en el servidor')
    }

    var data = await resp.json()
    diagRenderResultado(data.diagnostico)

  } catch (err) {
    clearInterval(iv)
    console.error('Diagnóstico error:', err)
    diagShow('diag-input')
    var errBanner = document.createElement('div')
    errBanner.className = 'diag-error-banner'
    errBanner.textContent = 'Error al analizar: ' + err.message + '. Intentá de nuevo.'
    var inputScreen = document.getElementById('diag-input')
    if (inputScreen) inputScreen.insertBefore(errBanner, inputScreen.firstChild)
    setTimeout(function() { if (errBanner.parentNode) errBanner.remove() }, 4000)
  }
}

function diagRenderResultado(d) {
  // Chips de contexto
  var chipsHTML = ''
  if (d.actividad) chipsHTML += '<span class="diag-chip">' + d.actividad + '</span>'
  if (d.regimen) chipsHTML += '<span class="diag-chip">' + d.regimen + '</span>'
  if (_diagFiles.length) chipsHTML += '<span class="diag-chip">📎 ' + _diagFiles.length + ' archivo' + (_diagFiles.length > 1 ? 's' : '') + '</span>'
  document.getElementById('diag-chips').innerHTML = chipsHTML

  // Nombre empresa
  document.getElementById('diag-res-nom').textContent = d.empresa || d.actividad || 'Su empresa'

  // Alertas críticas
  var alertasHTML = ''
  if (d.alertas_criticas && d.alertas_criticas.length) {
    d.alertas_criticas.forEach(function(a) {
      alertasHTML += '<div class="diag-alert-r">⚠ ' + a.texto + '</div>'
    })
  }
  document.getElementById('diag-alertas').innerHTML = alertasHTML

  // Score
  var score = d.score || 50
  document.getElementById('diag-score-num').textContent = score
  var fillColor = score >= 75 ? '#1D9E75' : score >= 50 ? '#EF9F27' : '#E24B4A'
  var fill = document.getElementById('diag-score-fill')
  fill.style.background = fillColor
  setTimeout(function() { fill.style.width = score + '%' }, 100)
  document.getElementById('diag-score-desc').textContent = d.score_descripcion || ''

  // Métricas
  var metricsHTML = ''
  if (d.metricas && d.metricas.length) {
    d.metricas.forEach(function(m) {
      metricsHTML += '<div class="diag-mc">' +
        '<div class="diag-mc-lbl">' + m.label + '</div>' +
        '<div class="diag-mc-val">' + m.valor + '</div>' +
        '<div class="diag-mc-sub">' + m.sub + '</div>' +
      '</div>'
    })
  }
  document.getElementById('diag-metrics').innerHTML = metricsHTML

  // Dimensiones
  var dimsHTML = ''
  if (d.dimensiones && d.dimensiones.length) {
    d.dimensiones.forEach(function(dim) {
      var r = dim.riesgo || 0
      var pillCls = r >= 3 ? 'diag-pill-r' : r >= 1 ? 'diag-pill-a' : 'diag-pill-v'
      var pillTxt = r >= 3 ? 'Riesgo alto' : r >= 1 ? 'Atención' : 'OK'
      var icMap = { fiscal: '📋', laboral: '👥', societaria: '🏢', financiera: '📈', estrategica: '🚀' }
      var ic = icMap[dim.id] || '●'
      var tagsHTML = ''
      if (dim.tags && dim.tags.length) {
        dim.tags.forEach(function(tg) {
          tagsHTML += '<span class="diag-dtag">' + tg + '</span>'
        })
      }
      dimsHTML += '<div class="diag-dim-row">' +
        '<span class="diag-dim-ic">' + ic + '</span>' +
        '<div class="diag-dim-body">' +
          '<div class="diag-dim-name">' + dim.nombre + '</div>' +
          '<div class="diag-dim-note">' + dim.nota + '</div>' +
          (tagsHTML ? '<div class="diag-dim-tags">' + tagsHTML + '</div>' : '') +
        '</div>' +
        '<span class="diag-pill ' + pillCls + '">' + pillTxt + '</span>' +
      '</div>'
    })
  }
  document.getElementById('diag-dims').innerHTML = dimsHTML

  // Recomendaciones
  var recsHTML = ''
  if (d.recomendaciones && d.recomendaciones.length) {
    d.recomendaciones.forEach(function(r) {
      recsHTML += '<div class="diag-rec ' + (r.urgencia || 'ok') + '">' +
        '<span class="diag-rec-tag">' + (r.tag || '') + '</span>' +
        r.texto +
      '</div>'
    })
  }
  document.getElementById('diag-recs').innerHTML = recsHTML

  diagShow('diag-result')
}

function diagReiniciar() {
  var txt = document.getElementById('diag-txt')
  var flist = document.getElementById('diag-flist')
  if (txt) txt.value = ''
  if (flist) flist.innerHTML = ''
  _diagFiles = []
  diagShow('diag-input')
}
