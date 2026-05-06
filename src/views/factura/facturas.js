import { fmtCurrency, fmtDate } from '../../utils.js'

function getFacturas(){return JSON.parse(localStorage.getItem('ff_facturas')||'[]')}
function saveFacturas(f){localStorage.setItem('ff_facturas',JSON.stringify(f))}

export function renderFFFacturas(el) {
  function render() {
    const facturas = getFacturas()
    el.innerHTML=`
      <div class="grid-2" style="margin-bottom:14px">
        <div class="card" style="margin-bottom:0">
          <div class="card-header"><span class="card-title">Nueva Factura</span><span class="card-badge badge-blue">ARCA</span></div>
          <div class="ff-form" id="ff-form">
            <div class="ff-grid-2">
              <div class="ff-field"><label class="ff-label">Tipo</label>
                <select class="ff-select" id="f-tipo"><option value="A">Factura A</option><option value="B">Factura B</option><option value="C">Factura C</option></select>
              </div>
              <div class="ff-field"><label class="ff-label">Punto de venta</label>
                <input class="ff-input" id="f-pv" value="0001" placeholder="0001"/>
              </div>
            </div>
            <div class="ff-field"><label class="ff-label">CUIT Receptor</label>
              <input class="ff-input" id="f-cuit" placeholder="20-12345678-9"/>
            </div>
            <div class="ff-field"><label class="ff-label">Razón Social / Cliente</label>
              <input class="ff-input" id="f-cliente" placeholder="Nombre del cliente"/>
            </div>
            <div class="ff-grid-2">
              <div class="ff-field"><label class="ff-label">Monto ($)</label>
                <input class="ff-input" id="f-monto" type="number" placeholder="0.00"/>
              </div>
              <div class="ff-field"><label class="ff-label">Concepto</label>
                <select class="ff-select" id="f-concepto">
                  <option value="1">Productos</option>
                  <option value="2">Servicios</option>
                  <option value="3">Productos y Servicios</option>
                </select>
              </div>
            </div>
            <div class="ff-field"><label class="ff-label">Descripción</label>
              <input class="ff-input" id="f-desc" placeholder="Detalle de la factura"/>
            </div>
            <div style="display:flex;gap:8px">
              <button class="ff-btn ff-btn-primary" style="flex:1" id="ff-emit-btn">Emitir Factura</button>
              <button class="ff-btn ff-btn-secondary" id="ff-borrador-btn">Guardar borrador</button>
            </div>
            <div id="ff-emit-result" style="display:none"></div>
          </div>
        </div>

        <div class="card" style="margin-bottom:0;overflow-y:auto;max-height:520px">
          <div class="card-header">
            <span class="card-title">Historial</span>
            <span class="card-badge badge-blue">${facturas.length} facturas</span>
          </div>
          ${facturas.length===0?`<div style="text-align:center;padding:30px;color:var(--txt3);font-size:12px">Sin facturas todavía</div>`
          :facturas.slice().reverse().map((f,ri)=>{
            const i=facturas.length-1-ri
            return`<div style="padding:10px 0;border-bottom:0.5px solid var(--border)">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span class="card-badge badge-purple" style="font-size:10px">FC ${f.tipo||'A'}</span>
                <span style="font-size:12px;color:var(--txt);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.cliente||'Sin nombre'}</span>
                <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--txt)">${fmtCurrency(f.monto||0)}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="card-badge ${f.cae?'badge-green':'badge-amber'}" style="font-size:10px">${f.cae?'CAE: '+f.cae.slice(0,10)+'...':'Borrador'}</span>
                <span style="font-size:10px;color:var(--txt3);flex:1">${f.fecha?fmtDate(f.fecha):''}</span>
                <button onclick="window.__deleteFactura(${i})" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:13px;padding:2px 6px" title="Eliminar">×</button>
              </div>
            </div>`
          }).join('')}
        </div>
      </div>
    `
    bindForm()
  }

  function bindForm() {
    window.__deleteFactura = (i) => {
      const fs = getFacturas()
      fs.splice(i,1)
      saveFacturas(fs)
      render()
      window.__navigate('ff-dashboard')
      setTimeout(()=>window.__navigate('ff-facturas'),50)
    }

    document.getElementById('ff-borrador-btn').addEventListener('click', () => {
      const f = collectForm()
      if (!f) return
      f.fecha = new Date().toISOString()
      const fs = getFacturas()
      fs.push(f)
      saveFacturas(fs)
      render()
    })

    document.getElementById('ff-emit-btn').addEventListener('click', async () => {
      const f = collectForm()
      if (!f) return
      const btn = document.getElementById('ff-emit-btn')
      const res = document.getElementById('ff-emit-result')
      btn.disabled = true
      btn.textContent = 'Emitiendo...'
      res.style.display = 'block'
      res.innerHTML = `<div style="padding:10px;border-radius:8px;background:var(--blue-d);color:var(--blue);font-size:12px">Conectando con ARCA...</div>`
      try {
        const resp = await fetch('/api/factura', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify(f)
        })
        const data = await resp.json()
        if (data.cae) {
          f.cae = data.cae
          f.caeFchVto = data.caeFchVto
          f.nroComp = data.nroComp
          f.fecha = new Date().toISOString()
          const fs = getFacturas(); fs.push(f); saveFacturas(fs)
          res.innerHTML=`<div style="padding:10px;border-radius:8px;background:var(--green-d);color:var(--green);font-size:12px">✓ CAE: <strong>${data.cae}</strong> · Vence: ${data.caeFchVto}</div>`
          render()
        } else {
          res.innerHTML=`<div style="padding:10px;border-radius:8px;background:var(--red-d);color:var(--red);font-size:12px">Error: ${data.error||'Sin respuesta de ARCA'}</div>`
        }
      } catch(e) {
        f.fecha = new Date().toISOString()
        const fs = getFacturas(); fs.push(f); saveFacturas(fs)
        res.innerHTML=`<div style="padding:10px;border-radius:8px;background:var(--amber-d);color:var(--amber);font-size:12px">⚠ Sin conexión con ARCA — guardado como borrador</div>`
        render()
      }
      btn.disabled = false
      btn.textContent = 'Emitir Factura'
    })
  }

  function collectForm() {
    const cliente = document.getElementById('f-cliente').value.trim()
    const monto = parseFloat(document.getElementById('f-monto').value)
    if (!cliente) { alert('Ingresá el nombre del cliente'); return null }
    if (!monto || monto <= 0) { alert('Ingresá un monto válido'); return null }
    return {
      tipo: document.getElementById('f-tipo').value,
      pv: document.getElementById('f-pv').value,
      cuit: document.getElementById('f-cuit').value,
      cliente,
      monto,
      concepto: document.getElementById('f-concepto').value,
      descripcion: document.getElementById('f-desc').value,
    }
  }

  render()
}
