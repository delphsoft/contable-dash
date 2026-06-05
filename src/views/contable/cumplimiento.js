function getHeaders() {
  return {
    'Authorization': 'Bearer ' + (localStorage.getItem('ff_jwt') || ''),
    'Content-Type': 'application/json'
  }
}

function getPeriodoActual() {
  var d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

function fmt(n) { return '$' + Math.round(n || 0).toLocaleString('es-AR') }

function generarOpcionesPeriodo() {
  var opts = ''
  var d = new Date()
  for (var i = 0; i < 6; i++) {
    var y = d.getFullYear()
    var m = String(d.getMonth() + 1).padStart(2, '0')
    var val = y + '-' + m
    opts += '<option value="' + val + '">' + val + '</option>'
    d.setMonth(d.getMonth() - 1)
  }
  return opts
}

function hexToRgb(hex) {
  var r = parseInt(hex.slice(1,3),16)
  var g = parseInt(hex.slice(3,5),16)
  var b = parseInt(hex.slice(5,7),16)
  return r + ',' + g + ',' + b
}

function pasoHtml(estado, num, titulo, sub, labelTxt, labelColor) {
  var numBg, numColor
  if (estado === 'done')    { numBg = 'rgba(0,184,148,.15)';    numColor = '#00b894' }
  else if (estado === 'pending') { numBg = 'rgba(108,92,231,.12)'; numColor = '#6c5ce7' }
  else                      { numBg = 'var(--bg)';               numColor = 'var(--text-muted)' }
  var pillBg    = labelColor ? 'rgba(' + hexToRgb(labelColor) + ',.1)' : 'var(--bg)'
  var pillColor = labelColor || 'var(--text-muted)'
  var ico       = estado === 'done' ? '✓' : num
  return '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">'
    + '<div style="width:22px;height:22px;border-radius:50%;background:' + numBg + ';color:' + numColor + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0;margin-top:1px">' + ico + '</div>'
    + '<div style="flex:1">'
    + '<div style="font-size:.88rem;font-weight:500;color:var(--text)">' + titulo + '</div>'
    + '<div style="font-size:.78rem;color:var(--text-muted);margin-top:2px">' + sub + '</div>'
    + '</div>'
    + '<span style="padding:2px 10px;border-radius:20px;font-size:.72rem;font-weight:500;background:' + pillBg + ';color:' + pillColor + ';flex-shrink:0">' + labelTxt + '</span>'
    + '</div>'
}

export function renderCumplimiento(container) {
  var periodo = getPeriodoActual()

  var html = '<div style="padding:24px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">'
    + '<div>'
    + '<h2 style="font-size:1.3rem;font-weight:600;margin-bottom:4px">Cumplimiento fiscal</h2>'
    + '<p style="color:var(--text-muted);font-size:.85rem">F931 · SICORE · VEP — generación automática desde tus datos</p>'
    + '</div>'
    + '<select id="cum-periodo" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:.85rem;font-family:inherit">'
    + generarOpcionesPeriodo()
    + '</select>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:5px">IVA a pagar</div><div id="kpi-iva" style="font-size:1.4rem;font-weight:600;color:#e84393">Calculando...</div><div style="font-size:.75rem;color:var(--text-muted);margin-top:3px">Vence 18 del mes siguiente</div></div>'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:5px">F931 total</div><div id="kpi-f931" style="font-size:1.4rem;font-weight:600;color:#6c5ce7">Calculando...</div><div style="font-size:.75rem;color:var(--text-muted);margin-top:3px">Vence 10 del mes siguiente</div></div>'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:5px">Retenciones SICORE</div><div id="kpi-sicore" style="font-size:1.4rem;font-weight:600;color:#e17055">$0</div><div style="font-size:.75rem;color:var(--text-muted);margin-top:3px" id="kpi-sicore-sub">Cargando...</div></div>'
    + '</div>'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:14px">'
    + '<div style="font-size:.92rem;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:7px"><i class="ti ti-file-text" style="font-size:16px;color:#6c5ce7"></i>F931 — SICOSS</div>'
    + pasoHtml('done',    '1', 'Liquidación del período', '<span id="f931-step1-sub">Cargando...</span>', 'completado', '#00b894')
    + pasoHtml('pending', '2', 'Generar archivo SICOSS', 'F931_CUIT_PERIODO.txt — para subir en ARCA', 'pendiente', '#6c5ce7')
    + pasoHtml('next',    '3', 'Presentar en ARCA', 'Subir el .txt en ARCA → Presentación de DDJJ y Pagos', 'siguiente', null)
    + '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">'
    + '<button id="btn-f931" style="padding:8px 16px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:.85rem;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px"><i class="ti ti-download" style="font-size:14px"></i>Descargar SICOSS</button>'
    + '<button id="btn-vep-f931" style="padding:8px 16px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:.85rem;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px"><i class="ti ti-external-link" style="font-size:14px"></i>Generar VEP F931 en ARCA</button>'
    + '</div>'
    + '<div id="f931-msg" style="display:none;margin-top:10px;padding:10px 12px;border-radius:8px;font-size:.82rem"></div>'
    + '</div>'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:14px">'
    + '<div style="font-size:.92rem;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:7px"><i class="ti ti-receipt-tax" style="font-size:16px;color:#e84393"></i>IVA — posición del período</div>'
    + '<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:.85rem"><span style="color:var(--text-muted)">Débito fiscal (ventas)</span><span id="iva-debito" style="color:#e84393">...</span></div>'
    + '<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:.85rem"><span style="color:var(--text-muted)">Crédito fiscal (compras)</span><span id="iva-credito" style="color:#00b894">...</span></div>'
    + '<div style="display:flex;justify-content:space-between;padding:9px 0;font-size:.9rem;font-weight:600"><span>Saldo neto a ingresar</span><span id="iva-saldo" style="color:#e84393">...</span></div>'
    + '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">'
    + '<button id="btn-vep-iva" style="padding:8px 16px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:.85rem;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px"><i class="ti ti-external-link" style="font-size:14px"></i>Generar VEP IVA en ARCA</button>'
    + '<button id="btn-csv-iva" style="padding:8px 16px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:.85rem;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px"><i class="ti ti-download" style="font-size:14px"></i>Exportar libro IVA CSV</button>'
    + '</div>'
    + '<div id="vep-iva-msg" style="display:none;margin-top:10px;padding:10px 12px;border-radius:8px;font-size:.82rem"></div>'
    + '</div>'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:14px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    + '<div style="font-size:.92rem;font-weight:600;display:flex;align-items:center;gap:7px"><i class="ti ti-percentage" style="font-size:16px;color:#e17055"></i>SICORE — retenciones del período</div>'
    + '<span id="sicore-badge" style="padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:500;background:rgba(225,112,85,.1);color:#e17055">0 retenciones</span>'
    + '</div>'
    + '<div style="background:rgba(108,92,231,.06);border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:.8rem;color:var(--text-muted)"><i class="ti ti-info-circle" style="font-size:13px;vertical-align:-2px;margin-right:4px"></i>Se retiene IVA (10.5%) a proveedores Responsables Inscriptos con importe neto mayor a $400.000</div>'
    + '<div id="sicore-tabla-wrap"><div style="color:var(--text-muted);font-size:.85rem">Cargando compras del período...</div></div>'
    + '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">'
    + '<button id="btn-sicore" style="padding:8px 16px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:.85rem;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px"><i class="ti ti-download" style="font-size:14px"></i>Descargar archivo SICORE</button>'
    + '<button id="btn-vep-sicore" style="padding:8px 16px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:.85rem;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px"><i class="ti ti-external-link" style="font-size:14px"></i>Generar VEP retenciones en ARCA</button>'
    + '</div>'
    + '<div id="sicore-msg" style="display:none;margin-top:10px;padding:10px 12px;border-radius:8px;font-size:.82rem"></div>'
    + '</div>'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
    + '<div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:.88rem;font-weight:600">Historial de presentaciones</div>'
    + '<div id="cum-historial"><div style="padding:16px;color:var(--text-muted);font-size:.85rem">Cargando...</div></div>'
    + '</div>'
    + '</div>'

  container.innerHTML = html

  var ci = function(id) { return container.querySelector(id) }

  function showMsg(id, tipo, texto) {
    var el = ci('#' + id)
    if (!el) return
    el.style.display = 'block'
    var bgMap = { ok:'rgba(0,184,148,.12)', info:'rgba(108,92,231,.1)', warn:'rgba(225,112,85,.1)', err:'rgba(232,67,147,.1)' }
    var clMap = { ok:'#00b894', info:'#6c5ce7', warn:'#e17055', err:'#e84393' }
    el.style.background = bgMap[tipo] || bgMap.info
    el.style.color = clMap[tipo] || clMap.info
    el.textContent = texto
    setTimeout(function() { el.style.display = 'none' }, 6000)
  }

  function setBtnLoading(id, loading) {
    var btn = ci('#' + id)
    if (!btn) return
    if (loading) {
      btn.disabled = true
      btn.setAttribute('data-orig', btn.innerHTML)
      btn.innerHTML = 'Procesando...'
    } else {
      btn.disabled = false
      btn.innerHTML = btn.getAttribute('data-orig') || btn.innerHTML
    }
  }

  function spinStyle() {
    if (!document.getElementById('cum-spin-style')) {
      var s = document.createElement('style')
      s.id = 'cum-spin-style'
      s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}'
      document.head.appendChild(s)
    }
  }
  spinStyle()

  function renderTablaRetenciones(retenciones) {
    var wrap = ci('#sicore-tabla-wrap')
    if (!retenciones.length) {
      wrap.innerHTML = '<div style="padding:12px 0;color:var(--text-muted);font-size:.85rem">Sin retenciones — todos los proveedores son Monotributistas o los importes están bajo el mínimo ($400.000).</div>'
      return
    }
    var filas = retenciones.map(function(r) {
      return '<tr>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border);font-size:.82rem;color:var(--text)">' + r.proveedor + '</td>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border);font-size:.82rem;color:var(--text-muted)">' + r.nro + '</td>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border);font-size:.82rem;text-align:right">' + fmt(r.neto) + '</td>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border);font-size:.82rem;text-align:right;color:#e17055;font-weight:500">' + fmt(r.retencion) + '</td>'
        + '</tr>'
    }).join('')
    wrap.innerHTML = '<table style="width:100%;border-collapse:collapse">'
      + '<thead><tr>'
      + '<th style="padding:7px 10px;text-align:left;color:var(--text-muted);font-size:.78rem;font-weight:500;border-bottom:1px solid var(--border)">Proveedor</th>'
      + '<th style="padding:7px 10px;text-align:left;color:var(--text-muted);font-size:.78rem;font-weight:500;border-bottom:1px solid var(--border)">Nro</th>'
      + '<th style="padding:7px 10px;text-align:right;color:var(--text-muted);font-size:.78rem;font-weight:500;border-bottom:1px solid var(--border)">Neto</th>'
      + '<th style="padding:7px 10px;text-align:right;color:var(--text-muted);font-size:.78rem;font-weight:500;border-bottom:1px solid var(--border)">Retención 10.5%</th>'
      + '</tr></thead>'
      + '<tbody>' + filas + '</tbody>'
      + '</table>'
  }

  async function cargarIVA(p) {
    try {
      var r = await fetch('/api/iva/posicion?periodo=' + p, { headers: getHeaders() })
      if (!r.ok) throw new Error()
      var d = await r.json()
      ci('#kpi-iva').textContent     = fmt(d.saldo)
      ci('#iva-debito').textContent  = fmt(d.debito)
      ci('#iva-credito').textContent = '- ' + fmt(d.credito)
      ci('#iva-saldo').textContent   = fmt(d.saldo)
    } catch (_) {
      ci('#kpi-iva').textContent     = 'Sin datos'
      ci('#iva-debito').textContent  = '—'
      ci('#iva-credito').textContent = '—'
      ci('#iva-saldo').textContent   = '—'
    }
  }

  async function cargarF931(p) {
    try {
      var re = await fetch('/api/sueldos?action=empleados', { headers: getHeaders() })
      var empleados = re.ok ? await re.json() : []
      var rl = await fetch('/api/sueldos?action=liquidar&periodo=' + p, { headers: getHeaders() })
      var liqs = rl.ok ? (await rl.json()).liquidaciones || [] : []
      var aportes  = liqs.reduce(function(s, l) { return s + (l.jubilacion||0) + (l.obra_social||0) + (l.pami||0) }, 0)
      var contribs = liqs.reduce(function(s, l) { return s + Math.round((l.salario_bruto||0) * 0.231 * 100) / 100 }, 0)
      var total    = Math.round((aportes + contribs) * 100) / 100
      ci('#kpi-f931').textContent       = fmt(total)
      ci('#f931-step1-sub').textContent = empleados.length + ' empleados · masa bruta liquidada'
    } catch (_) {
      ci('#kpi-f931').textContent       = 'Sin liquidación'
      ci('#f931-step1-sub').textContent = 'Liquidá el período primero en el tab Sueldos'
    }
  }

  async function cargarSICORE(p) {
    try {
      var r = await fetch('/api/compras?periodo=' + p, { headers: getHeaders() })
      if (!r.ok) throw new Error()
      var compras = await r.json()
      var MINIMO  = 400000
      var retenciones = (compras || []).filter(function(c) {
        var esMono = (c.proveedor_nombre || '').toLowerCase().includes('mono')
        return !esMono && (c.importe_neto || 0) >= MINIMO
      }).map(function(c) {
        return {
          proveedor: c.proveedor_nombre || c.proveedor_cuit,
          nro:       c.numero_comprobante,
          neto:      c.importe_neto || 0,
          retencion: Math.round((c.importe_neto || 0) * 0.105 * 100) / 100
        }
      })
      var totalRet = retenciones.reduce(function(s, r) { return s + r.retencion }, 0)
      ci('#kpi-sicore').textContent   = fmt(totalRet)
      ci('#kpi-sicore-sub').textContent = retenciones.length + ' proveedor' + (retenciones.length !== 1 ? 'es' : '') + ' RI'
      ci('#sicore-badge').textContent = retenciones.length + ' retenci' + (retenciones.length !== 1 ? 'ones' : 'ón')
      renderTablaRetenciones(retenciones)
    } catch (_) {
      ci('#kpi-sicore').textContent   = '—'
      ci('#sicore-tabla-wrap').innerHTML = '<div style="color:var(--text-muted);font-size:.85rem">Sin compras cargadas para el período.</div>'
    }
  }

  async function cargarHistorial() {
    try {
      var r = await fetch('/api/sueldos?action=cronlog', { headers: getHeaders() })
      if (!r.ok) throw new Error()
      var logs = await r.json()
      if (!logs.length) {
        ci('#cum-historial').innerHTML = '<div style="padding:16px;color:var(--text-muted);font-size:.85rem">Sin presentaciones registradas aún.</div>'
        return
      }
      ci('#cum-historial').innerHTML = logs.slice(0, 8).map(function(l) {
        var color = l.estado === 'ok' ? '#00b894' : l.estado === 'parcial' ? '#f59e0b' : '#888'
        return '<div style="display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid var(--border);font-size:.8rem">'
          + '<span style="width:8px;height:8px;border-radius:50%;background:' + color + ';flex-shrink:0;display:inline-block"></span>'
          + '<span style="min-width:130px;color:var(--text-muted)">' + new Date(l.ejecutado_at).toLocaleString('es-AR') + '</span>'
          + '<span style="flex:1;color:var(--text-muted)">' + (l.periodo || '—') + ' · ' + (l.motivo || l.sincronizados + ' sync') + '</span>'
          + '<span style="padding:2px 8px;border-radius:20px;font-size:.72rem;font-weight:500;background:rgba(0,0,0,.06);color:' + color + '">' + l.estado + '</span>'
          + '</div>'
      }).join('')
    } catch (_) {
      ci('#cum-historial').innerHTML = '<div style="padding:16px;color:var(--text-muted);font-size:.85rem">Sin historial disponible.</div>'
    }
  }

  async function cargarDatos(p) {
    await Promise.all([cargarIVA(p), cargarF931(p), cargarSICORE(p), cargarHistorial()])
  }

  ci('#btn-f931').addEventListener('click', async function() {
    var p = ci('#cum-periodo').value
    setBtnLoading('btn-f931', true)
    try {
      var r = await fetch('/api/f931-sicoss', { method:'POST', headers:getHeaders(), body:JSON.stringify({ periodo:p }) })
      if (!r.ok) { var e = await r.json(); throw new Error(e.error || 'Error') }
      var blob = await r.blob()
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob)
      a.download = 'F931_' + p.replace('-','') + '.txt'; a.click()
      showMsg('f931-msg', 'ok', '✓ Archivo SICOSS descargado — subílo en ARCA → Presentación de DDJJ y Pagos')
    } catch (err) { showMsg('f931-msg', 'err', 'Error: ' + err.message) }
    setBtnLoading('btn-f931', false)
  })

  ci('#btn-vep-f931').addEventListener('click', async function() {
    var p = ci('#cum-periodo').value
    try {
      var r = await fetch('/api/vep-link?tipo=f931&periodo=' + p, { headers:getHeaders() })
      var d = await r.json()
      if (d.url) { window.open(d.url, '_blank'); showMsg('f931-msg', 'info', '↗ Abriendo ARCA con VEP pre-cargado — ' + d.label) }
    } catch (_) { showMsg('f931-msg', 'warn', 'Error generando link VEP. Verificá la conexión.') }
  })

  ci('#btn-vep-iva').addEventListener('click', async function() {
    var p = ci('#cum-periodo').value
    try {
      var r = await fetch('/api/vep-link?tipo=iva&periodo=' + p, { headers:getHeaders() })
      var d = await r.json()
      if (d.url) { window.open(d.url, '_blank'); showMsg('vep-iva-msg', 'info', '↗ Abriendo ARCA con VEP pre-cargado — ' + d.label) }
    } catch (_) { showMsg('vep-iva-msg', 'warn', 'Error calculando VEP IVA.') }
  })

  ci('#btn-csv-iva').addEventListener('click', function() {
    var p = ci('#cum-periodo').value
    var a = document.createElement('a')
    a.href = '/api/iva/exportar?periodo=' + p + '&tipo=ventas'
    a.download = 'iva-ventas-' + p + '.csv'; a.click()
  })

  ci('#btn-sicore').addEventListener('click', async function() {
    var p = ci('#cum-periodo').value
    setBtnLoading('btn-sicore', true)
    try {
      var r = await fetch('/api/sicore-retencion', { method:'POST', headers:getHeaders(), body:JSON.stringify({ periodo:p }) })
      if (!r.ok) { var e = await r.json(); throw new Error(e.error || 'Error') }
      var ct = r.headers.get('Content-Type') || ''
      if (ct.includes('text')) {
        var blob = await r.blob()
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob)
        a.download = 'SICORE_' + p.replace('-','') + '.txt'; a.click()
        showMsg('sicore-msg', 'ok', '✓ Archivo SICORE descargado — importálo en SIAP/SICORE y presentá en ARCA')
      } else {
        var d = await r.json()
        showMsg('sicore-msg', 'info', d.mensaje || 'Sin retenciones para este período')
      }
    } catch (err) { showMsg('sicore-msg', 'err', 'Error: ' + err.message) }
    setBtnLoading('btn-sicore', false)
  })

  ci('#btn-vep-sicore').addEventListener('click', async function() {
    var p = ci('#cum-periodo').value
    try {
      var r = await fetch('/api/vep-link?tipo=sicore&periodo=' + p, { headers:getHeaders() })
      var d = await r.json()
      if (d.url) { window.open(d.url, '_blank'); showMsg('sicore-msg', 'info', '↗ Abriendo ARCA con VEP pre-cargado — ' + d.label) }
    } catch (_) { showMsg('sicore-msg', 'warn', 'Error generando VEP retenciones.') }
  })

  ci('#cum-periodo').addEventListener('change', function() { cargarDatos(this.value) })
  cargarDatos(periodo)
}
