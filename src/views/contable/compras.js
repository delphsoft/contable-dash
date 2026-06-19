function getHeaders() {
  return {
    'Authorization': 'Bearer ' + (localStorage.getItem('ff_jwt') ?? ''),
    'Content-Type': 'application/json'
  }
}

function fmt(n) { return '$' + (n ?? 0).toLocaleString('es-AR') }

export function renderCompras(container) {
  let pendientes = [], alicuota = 21, cuitTimer = null, razonSocial = ''

  const html = '<div style="padding:24px">'
    + '<h2 style="font-size:1.3rem;font-weight:600;margin-bottom:4px">Compras</h2>'
    + '<p style="color:var(--text-muted);font-size:.85rem;margin-bottom:20px">Carga manual · validación padrón ARCA en tiempo real</p>'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px">'
    + '<h3 style="font-size:.92rem;font-weight:600;margin-bottom:14px">Nueva compra</h3>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'

    + '<div style="grid-column:1/-1">'
    + '<label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">CUIT del proveedor *</label>'
    + '<div style="position:relative">'
    + '<input id="cc-cuit" placeholder="20-12345678-9" style="width:100%;padding:8px 36px 8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">'
    + '<span id="cc-icon" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:13px"></span>'
    + '</div>'
    + '<div id="cc-padron" style="display:none;margin-top:5px;padding:7px 10px;border-radius:6px;font-size:.8rem"></div>'
    + '</div>'

    + '<div>'
    + '<label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Nro comprobante *</label>'
    + '<input id="cc-nro" placeholder="0001-00012345" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">'
    + '</div>'

    + '<div>'
    + '<label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Fecha *</label>'
    + '<input id="cc-fecha" type="date" value="' + new Date().toISOString().split('T')[0] + '" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">'
    + '</div>'

    + '<div>'
    + '<label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Tipo</label>'
    + '<select id="cc-tipo" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">'
    + '<option>FA</option><option>FB</option><option>FC</option><option>RC</option><option>TP</option>'
    + '</select>'
    + '</div>'

    + '<div>'
    + '<label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Importe total *</label>'
    + '<input id="cc-total" type="number" placeholder="100000" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">'
    + '</div>'

    + '<div>'
    + '<label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Alícuota IVA</label>'
    + '<div style="display:flex;gap:6px;margin-top:4px" id="cc-ali">'
    + '<button class="cali active" data-v="21"   style="padding:5px 10px;border-radius:6px;border:1px solid #6c5ce7;background:#6c5ce7;color:#fff;font-size:.78rem;cursor:pointer;font-family:inherit">21%</button>'
    + '<button class="cali"        data-v="10.5" style="padding:5px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-size:.78rem;cursor:pointer;font-family:inherit">10.5%</button>'
    + '<button class="cali"        data-v="27"   style="padding:5px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-size:.78rem;cursor:pointer;font-family:inherit">27%</button>'
    + '<button class="cali"        data-v="0"    style="padding:5px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-size:.78rem;cursor:pointer;font-family:inherit">Exento</button>'
    + '</div>'
    + '</div>'

    + '<div id="cc-calc" style="grid-column:1/-1;display:none;background:rgba(108,92,231,.07);border-radius:8px;padding:12px;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">'
    + '<div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">Neto</div><div id="cc-cn" style="font-size:1rem;font-weight:600">$0</div></div>'
    + '<div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">IVA CF</div><div id="cc-ci" style="font-size:1rem;font-weight:600;color:#00b894">$0</div></div>'
    + '<div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">Total</div><div id="cc-ct" style="font-size:1rem;font-weight:600;color:#6c5ce7">$0</div></div>'
    + '</div>'

    + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:14px;align-items:center">'
    + '<button id="cc-add" style="padding:8px 18px;background:#6c5ce7;color:#fff;border:none;border-radius:8px;font-size:.85rem;cursor:pointer;font-family:inherit">+ Agregar</button>'
    + '<span id="cc-msg" style="font-size:.8rem;color:#6c5ce7"></span>'
    + '</div>'
    + '</div>'
    + '<div id="cc-pending"></div>'
    + '</div>'

  container.innerHTML = html

  const ci = function(id) { return container.querySelector(id) }

  function setAli(v) {
    alicuota = v
    container.querySelectorAll('.cali').forEach(function(b) {
      var on = parseFloat(b.dataset.v) === v
      b.style.background  = on ? '#6c5ce7' : 'transparent'
      b.style.color       = on ? '#fff' : 'var(--text-muted)'
      b.style.borderColor = on ? '#6c5ce7' : 'var(--border)'
    })
    calcular()
  }

  function calcular() {
    var total = parseFloat(ci('#cc-total').value) || 0
    var calc  = ci('#cc-calc')
    if (!total) { calc.style.display = 'none'; return }
    calc.style.display = 'grid'
    var div  = 1 + alicuota / 100
    var neto = alicuota === 0 ? total : Math.round(total / div * 100) / 100
    var iva  = Math.round((total - neto) * 100) / 100
    ci('#cc-cn').textContent = fmt(neto)
    ci('#cc-ci').textContent = fmt(iva)
    ci('#cc-ct').textContent = fmt(total)
  }

  function spinStyle() {
    if (!document.getElementById('cspin-style')) {
      var s = document.createElement('style')
      s.id = 'cspin-style'
      s.textContent = '@keyframes cspin{to{transform:rotate(360deg)}}'
      document.head.appendChild(s)
    }
  }

  async function consultarPadron(cuit) {
    spinStyle()
    ci('#cc-icon').innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid var(--border);border-top-color:#6c5ce7;border-radius:50%;animation:cspin .7s linear infinite"></span>'
    try {
      var r = await fetch('/api/arca?action=padron&cuit=' + cuit)
      var d = await r.json()
      if (d.error || d.errorConstancia) throw new Error('no encontrado')
      razonSocial = (d.datosGenerales && (d.datosGenerales.razonSocial || d.datosGenerales.nombre)) || ''
      var esMono  = !!d.datosMonotributo
      ci('#cc-icon').textContent   = '✓'
      ci('#cc-icon').style.color   = '#00b894'
      ci('#cc-cuit').style.borderColor = '#00b894'
      ci('#cc-padron').style.cssText   = 'display:block;margin-top:5px;padding:7px 10px;border-radius:6px;font-size:.8rem;background:rgba(0,184,148,.1);color:#00b894'
      ci('#cc-padron').textContent     = '✓ ' + razonSocial + ' · ' + (esMono ? 'Monotributista' : 'Responsable Inscripto')
      if (esMono) setAli(0)
    } catch(_) {
      ci('#cc-icon').textContent       = '✗'
      ci('#cc-icon').style.color       = '#e84393'
      ci('#cc-cuit').style.borderColor = '#e84393'
      ci('#cc-padron').style.cssText   = 'display:block;margin-top:5px;padding:7px 10px;border-radius:6px;font-size:.8rem;background:rgba(232,67,147,.1);color:#e84393'
      ci('#cc-padron').textContent     = 'CUIT no encontrado en padrón ARCA'
      razonSocial = ''
    }
  }

  function renderPendientes() {
    var div = ci('#cc-pending')
    if (!pendientes.length) { div.innerHTML = ''; return }
    var cf = pendientes.reduce(function(s, p) { return s + p.importe_iva }, 0)

    var rows = pendientes.map(function(p, i) {
      return '<tr>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border)">' + (p.proveedor_nombre || p.proveedor_cuit) + '</td>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border)">' + p.numero_comprobante + '</td>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border)">' + fmt(p.importe_neto) + '</td>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border);color:#00b894;font-weight:500">' + fmt(p.importe_iva) + '</td>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border)">' + fmt(p.importe_total) + '</td>'
        + '<td style="padding:8px 10px;border-bottom:1px solid var(--border)">'
        + '<button class="cc-del" data-i="' + i + '" style="background:none;border:none;color:#e84393;cursor:pointer;font-size:14px">✕</button>'
        + '</td>'
        + '</tr>'
    }).join('')

    div.innerHTML = '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
      + '<div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'
      + '<span style="font-size:.85rem;font-weight:500">Pendientes (' + pendientes.length + ') · CF: ' + fmt(cf) + '</span>'
      + '<button id="cc-send" style="padding:6px 14px;background:#6c5ce7;color:#fff;border:none;border-radius:6px;font-size:.8rem;cursor:pointer;font-family:inherit">Enviar a Supabase</button>'
      + '</div>'
      + '<table style="width:100%;border-collapse:collapse;font-size:.82rem">'
      + '<thead><tr>'
      + ['Proveedor','Nro','Neto','IVA CF','Total',''].map(function(h) {
          return '<th style="padding:8px 10px;text-align:left;color:var(--text-muted);font-weight:500;border-bottom:1px solid var(--border)">' + h + '</th>'
        }).join('')
      + '</tr></thead>'
      + '<tbody>' + rows + '</tbody>'
      + '</table>'
      + '</div>'

    ci('#cc-send').addEventListener('click', async function() {
      var r = await fetch('/api/compras', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(pendientes)
      })
      if (r.ok) {
        ci('#cc-msg').textContent = '✓ ' + pendientes.length + ' compras guardadas.'
        pendientes = []
        renderPendientes()
      } else {
        ci('#cc-msg').textContent = 'Error al guardar'
      }
      setTimeout(function() { ci('#cc-msg').textContent = '' }, 3000)
    })

    container.querySelectorAll('.cc-del').forEach(function(b) {
      b.addEventListener('click', function() {
        pendientes.splice(parseInt(b.dataset.i), 1)
        renderPendientes()
      })
    })
  }

  ci('#cc-cuit').addEventListener('input', function(e) {
    var clean = e.target.value.replace(/\D/g, '')
    ci('#cc-icon').innerHTML         = ''
    ci('#cc-padron').style.display   = 'none'
    ci('#cc-cuit').style.borderColor = ''
    razonSocial = ''
    clearTimeout(cuitTimer)
    if (clean.length >= 11) {
      cuitTimer = setTimeout(function() { consultarPadron(clean) }, 700)
    }
  })

  ci('#cc-total').addEventListener('input', calcular)

  container.querySelectorAll('.cali').forEach(function(b) {
    b.addEventListener('click', function() { setAli(parseFloat(b.dataset.v)) })
  })

  ci('#cc-add').addEventListener('click', function() {
    var total = parseFloat(ci('#cc-total').value) || 0
    if (!ci('#cc-cuit').value || !ci('#cc-nro').value || !ci('#cc-fecha').value || !total) {
      ci('#cc-msg').textContent = 'Completá CUIT, Nro, Fecha y Total.'
      setTimeout(function() { ci('#cc-msg').textContent = '' }, 3000)
      return
    }
    var div  = 1 + alicuota / 100
    var neto = alicuota === 0 ? total : Math.round(total / div * 100) / 100
    var iva  = Math.round((total - neto) * 100) / 100
    pendientes.push({
      proveedor_cuit:      ci('#cc-cuit').value.replace(/\D/g, ''),
      proveedor_nombre:    razonSocial,
      numero_comprobante:  ci('#cc-nro').value,
      tipo:                ci('#cc-tipo').value,
      fecha:               ci('#cc-fecha').value,
      importe_neto:        neto,
      importe_iva:         iva,
      importe_total:       total
    })
    renderPendientes()
    ci('#cc-cuit').value          = ''
    ci('#cc-nro').value           = ''
    ci('#cc-total').value         = ''
    ci('#cc-icon').innerHTML      = ''
    ci('#cc-padron').style.display = 'none'
    ci('#cc-cuit').style.borderColor = ''
    ci('#cc-calc').style.display  = 'none'
    razonSocial = ''
    setAli(21)
  })

  renderPendientes()
}
