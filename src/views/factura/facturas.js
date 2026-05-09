import { fmtCurrency, fmtDate } from '../../utils.js'

const TIPOS_COMP = { A: 1, B: 6, C: 11 }
const TIPOS_LABEL = { 1: 'Factura A', 6: 'Factura B', 11: 'Factura C' }

function getFacturas() { return JSON.parse(localStorage.getItem('ff_facturas') || '[]') }
function saveFacturas(f) { localStorage.setItem('ff_facturas', JSON.stringify(f)) }
function getJWT() { return localStorage.getItem('ff_jwt') || '' }

function calcImportes(monto, tipo) {
  const t = parseInt(tipo)
  if (t === 11) return { impNeto: monto, impIVA: 0, impTotal: monto }
  if (t === 1)  { const n = monto; const iva = Math.round(n*0.21*100)/100; return { impNeto: n, impIVA: iva, impTotal: Math.round((n+iva)*100)/100 } }
  const total = monto; const n = Math.round((total/1.21)*100)/100; const iva = Math.round((total-n)*100)/100
  return { impNeto: n, impIVA: iva, impTotal: total }
}

export function renderFFFacturas(el) {
  function render() {
    const facturas = getFacturas()

    el.innerHTML = `
      <div class="grid-2" style="margin-bottom:14px;align-items:start">

        <!-- FORM -->
        <div class="card" style="margin-bottom:0">
          <div class="card-header">
            <span class="card-title">Nueva factura</span>
            <span class="pill pill-blue">ARCA / AfipSDK</span>
          </div>

          <div class="ff-form">
            <!-- Tipo + Punto de venta -->
            <div class="ff-grid-2">
              <div class="ff-field">
                <label class="ff-label">Tipo de comprobante</label>
                <select class="ff-select" id="f-tipo" onchange="window.__updateIVA()">
                  <option value="11">Factura C (consumidor final)</option>
                  <option value="6">Factura B (responsable inscripto)</option>
                  <option value="1">Factura A (IVA responsable)</option>
                </select>
              </div>
              <div class="ff-field">
                <label class="ff-label">Punto de venta</label>
                <input class="ff-input" id="f-pv" value="1" style="font-family:'DM Mono',monospace"/>
              </div>
            </div>

            <!-- Concepto -->
            <div class="ff-field">
              <label class="ff-label">Concepto</label>
              <select class="ff-select" id="f-concepto">
                <option value="2">Servicios</option>
                <option value="1">Productos</option>
                <option value="3">Productos y Servicios</option>
              </select>
            </div>

            <!-- Receptor -->
            <div class="ff-field">
              <label class="ff-label">Receptor</label>
              <select class="ff-select" id="f-receptor-tipo" onchange="window.__toggleReceptor()">
                <option value="consumidor_final">Consumidor Final</option>
                <option value="cuit">CUIT</option>
                <option value="dni">DNI</option>
              </select>
            </div>

            <div id="f-receptor-doc-wrap" style="display:none">
              <div class="ff-grid-2">
                <div class="ff-field">
                  <label class="ff-label" id="f-doc-label">CUIT / DNI</label>
                  <input class="ff-input" id="f-doc-nro" placeholder="20-12345678-9" style="font-family:'DM Mono',monospace"/>
                </div>
                <div class="ff-field">
                  <label class="ff-label">Razón Social</label>
                  <input class="ff-input" id="f-razon-social" placeholder="Nombre o empresa"/>
                </div>
              </div>
              <div class="ff-field" style="margin-top:10px">
                <label class="ff-label">Email receptor (para envío de factura)</label>
                <input class="ff-input" id="f-email-receptor" type="email" placeholder="receptor@email.com"/>
              </div>
            </div>

            <div class="ff-field">
              <label class="ff-label">Descripción / detalle</label>
              <input class="ff-input" id="f-desc" placeholder="Servicios de consultoría — mayo 2026"/>
            </div>

            <!-- Monto + IVA preview -->
            <div class="ff-grid-2">
              <div class="ff-field">
                <label class="ff-label">Monto neto ($)</label>
                <input class="ff-input" id="f-monto" type="number" min="0" step="0.01" placeholder="0.00" oninput="window.__updateIVA()" style="font-family:'DM Mono',monospace"/>
              </div>
              <div class="ff-field">
                <label class="ff-label">Total a cobrar</label>
                <div id="f-total-preview" style="padding:10px 13px;background:var(--bg3);border-radius:9px;font-family:'DM Mono',monospace;font-size:14px;font-weight:500;color:var(--green)">$0.00</div>
              </div>
            </div>

            <div id="f-iva-detail" style="display:none;padding:10px 13px;border-radius:9px;background:var(--blue-d);border:0.5px solid rgba(79,142,247,.2);font-size:12px;color:var(--txt2)">
              <div style="display:flex;justify-content:space-between"><span>Neto gravado:</span><span id="f-neto-val" style="font-family:'DM Mono',monospace;color:var(--txt)"></span></div>
              <div style="display:flex;justify-content:space-between;margin-top:4px"><span>IVA 21%:</span><span id="f-iva-val" style="font-family:'DM Mono',monospace;color:var(--txt)"></span></div>
            </div>

            <div style="display:flex;gap:8px">
              <button class="ff-btn ff-btn-primary" style="flex:1" id="ff-emit-btn">
                Emitir factura →
              </button>
              <button class="ff-btn ff-btn-secondary" id="ff-borrador-btn">
                Borrador
              </button>
            </div>

            <div id="ff-result" style="display:none"></div>
          </div>
        </div>

        <!-- HISTORIAL -->
        <div class="card" style="margin-bottom:0;max-height:620px;overflow-y:auto">
          <div class="card-header">
            <span class="card-title">Historial</span>
            <span class="pill pill-blue">${facturas.length}</span>
          </div>
          ${facturas.length === 0
            ? `<div style="text-align:center;padding:40px;color:var(--txt3);font-size:12px">Sin facturas todavía.<br>Emití tu primera factura.</div>`
            : facturas.slice().reverse().map((f, ri) => {
                const i = facturas.length - 1 - ri
                const label = TIPOS_LABEL[f.tipo_comprobante] || 'Factura C'
                const num = f.voucher_number
                  ? `${String(f.punto_venta||1).padStart(4,'0')}-${String(f.voucher_number).padStart(8,'0')}`
                  : '—'
                return `
                <div style="padding:10px 0;border-bottom:0.5px solid var(--border)">
                  <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">
                    <span class="pill pill-purple" style="font-size:9.5px">${label}</span>
                    <span style="font-size:11.5px;color:var(--txt);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.recipient||f.receptor_razon_social||'Sin nombre'}</span>
                    <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--txt)">${fmtCurrency(f.amount||f.monto||0)}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:7px">
                    <span class="card-badge ${f.cae?'pill-green':'pill-amber'}" style="font-size:9.5px">${f.cae?'CAE ✓':'Borrador'}</span>
                    ${f.cae?`<span style="font-family:'DM Mono',monospace;font-size:9.5px;color:var(--txt2)">N° ${num}</span>`:''}
                    ${f.cae_fch_vto?`<span style="font-size:9.5px;color:var(--txt3)">Vto: ${f.cae_fch_vto}</span>`:''}
                    ${f.demo?`<span class="pill pill-amber" style="font-size:9px">DEMO</span>`:''}
                    <button onclick="window.__deleteFactura(${i})" style="margin-left:auto;background:none;border:none;color:var(--txt3);cursor:pointer;font-size:15px;padding:0 4px" title="Eliminar">×</button>
                  </div>
                  ${f.description?`<div style="font-size:10.5px;color:var(--txt3);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.description}</div>`:''}
                </div>`
              }).join('')
          }
        </div>
      </div>
    `

    // IVA preview helpers
    window.__updateIVA = () => {
      const tipo = document.getElementById('f-tipo')?.value
      const monto = parseFloat(document.getElementById('f-monto')?.value) || 0
      const preview = document.getElementById('f-total-preview')
      const ivaDetail = document.getElementById('f-iva-detail')
      if (!tipo || !preview) return
      const { impNeto, impIVA, impTotal } = calcImportes(monto, tipo)
      preview.textContent = fmtCurrency(impTotal)
      if (parseInt(tipo) !== 11 && monto > 0) {
        ivaDetail.style.display = 'block'
        document.getElementById('f-neto-val').textContent = fmtCurrency(impNeto)
        document.getElementById('f-iva-val').textContent = fmtCurrency(impIVA)
      } else {
        ivaDetail.style.display = 'none'
      }
    }

    window.__toggleReceptor = () => {
      const tipo = document.getElementById('f-receptor-tipo')?.value
      const wrap = document.getElementById('f-receptor-doc-wrap')
      const lbl  = document.getElementById('f-doc-label')
      if (!wrap) return
      wrap.style.display = (tipo === 'consumidor_final') ? 'none' : 'block'
      if (lbl) lbl.textContent = tipo === 'dni' ? 'DNI' : 'CUIT'
    }

    window.__deleteFactura = (i) => {
      if (!confirm('¿Eliminar esta factura?')) return
      const fs = getFacturas(); fs.splice(i, 1); saveFacturas(fs)
      render()
    }

    // Borrador
    document.getElementById('ff-borrador-btn')?.addEventListener('click', () => {
      const f = collectForm(); if (!f) return
      const fs = getFacturas(); fs.push(f); saveFacturas(fs)
      render()
    })

    // Emit
    document.getElementById('ff-emit-btn')?.addEventListener('click', async () => {
      const f = collectForm(); if (!f) return
      const btn = document.getElementById('ff-emit-btn')
      const resultEl = document.getElementById('ff-result')
      btn.disabled = true; btn.textContent = 'Emitiendo...'
      resultEl.style.display = 'block'
      resultEl.innerHTML = `<div style="padding:10px;border-radius:8px;background:var(--blue-d);color:var(--blue);font-size:12px">Conectando con ARCA...</div>`

      try {
        const jwt = getJWT()
        const headers = { 'Content-Type': 'application/json' }
        if (jwt) headers['Authorization'] = `Bearer ${jwt}`

        const resp = await fetch('/api/factura', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            // FacturaFácil style fields
            amount: f.monto,
            recipient: f.receptor_razon_social || f.cliente || 'Consumidor Final',
            description: f.descripcion,
            tipoComprobante: parseInt(f.tipo_comprobante),
            concepto: parseInt(f.concepto),
            receptorTipo: f.receptor_tipo,
            receptorDocNro: f.receptor_doc_nro,
            receptorRazonSocial: f.receptor_razon_social,
            receptorEmail: f.receptor_email,
            paymentSource: 'manual',
          })
        })
        const data = await resp.json()

        if (data.cae) {
          const saved = { ...f, ...data }
          const fs = getFacturas(); fs.push(saved); saveFacturas(fs)
          const label = TIPOS_LABEL[parseInt(f.tipo_comprobante)] || 'Factura C'
          const num = data.voucher_number
            ? `${String(data.punto_venta||1).padStart(4,'0')}-${String(data.voucher_number).padStart(8,'0')}`
            : '—'
          resultEl.innerHTML = `
            <div style="padding:12px;border-radius:8px;background:var(--green-d);border:0.5px solid rgba(46,192,138,.3)">
              <div style="font-size:12px;color:var(--green);font-weight:500;margin-bottom:6px">✓ ${label} emitida correctamente${data.demo?' (modo demo)':''}</div>
              <div style="font-size:11px;color:var(--txt2);font-family:'DM Mono',monospace">CAE: ${data.cae}</div>
              <div style="font-size:11px;color:var(--txt2);font-family:'DM Mono',monospace">N° ${num} · Vto: ${data.cae_fch_vto}</div>
              ${data.demo?`<div style="font-size:10px;color:var(--amber);margin-top:4px">⚠ Modo demo — configurá AFIPSDK_ACCESS_TOKEN para CAE reales</div>`:''}
            </div>`
          render()
        } else {
          resultEl.innerHTML = `<div style="padding:10px;border-radius:8px;background:var(--red-d);color:var(--red);font-size:12px">⚠ ${data.error || 'Error de ARCA'}</div>`
        }
      } catch (e) {
        // Save as draft on network error
        const fs = getFacturas(); fs.push(f); saveFacturas(fs)
        resultEl.innerHTML = `<div style="padding:10px;border-radius:8px;background:var(--amber-d);color:var(--amber);font-size:12px">⚠ Sin conexión — guardado como borrador</div>`
        render()
      }

      btn.disabled = false; btn.textContent = 'Emitir factura →'
    })
  }

  function collectForm() {
    const tipo   = document.getElementById('f-tipo')?.value
    const pv     = document.getElementById('f-pv')?.value || '1'
    const concepto = document.getElementById('f-concepto')?.value || '2'
    const receptorTipo = document.getElementById('f-receptor-tipo')?.value || 'consumidor_final'
    const docNro = document.getElementById('f-doc-nro')?.value || '0'
    const razonSocial = document.getElementById('f-razon-social')?.value || ''
    const emailReceptor = document.getElementById('f-email-receptor')?.value || ''
    const desc   = document.getElementById('f-desc')?.value || ''
    const montoRaw = parseFloat(document.getElementById('f-monto')?.value)

    if (!montoRaw || montoRaw <= 0) { alert('Ingresá un monto válido'); return null }
    if (receptorTipo !== 'consumidor_final' && !razonSocial.trim()) {
      alert('Ingresá la razón social del receptor'); return null
    }

    const { impNeto, impIVA, impTotal } = calcImportes(montoRaw, tipo)

    return {
      tipo_comprobante: tipo,
      punto_venta: parseInt(pv),
      concepto,
      receptor_tipo: receptorTipo,
      receptor_doc_nro: docNro,
      receptor_razon_social: razonSocial || 'Consumidor Final',
      receptor_email: emailReceptor,
      descripcion: desc,
      monto: impTotal,
      imp_neto: impNeto,
      imp_iva: impIVA,
      fecha: new Date().toISOString(),
    }
  }

  render()
}
