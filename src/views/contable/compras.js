function getHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('ff_jwt') ?? ''}`, 'Content-Type': 'application/json' }
}
function fmt(n) { return '$' + (n ?? 0).toLocaleString('es-AR') }

export function renderCompras(container) {
  let pendientes = [], alicuota = 21, cuitTimer = null, razonSocial = ''

  container.innerHTML = `
    <div style="padding:24px">
      <h2 style="font-size:1.3rem;font-weight:600;margin-bottom:4px">Compras</h2>
      <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:20px">Carga manual · validación padrón ARCA en tiempo real</p>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px">
        <h3 style="font-size:.92rem;font-weight:600;margin-bottom:14px">Nueva compra</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

          <div style="grid-column:1/-1">
            <label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">CUIT del proveedor *</label>
            <div style="position:relative">
              <input id="cc-cuit" placeholder="20-12345678-9"
                style="width:100%;padding:8px 36px 8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">
              <span id="cc-icon" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:13px"></span>
            </div>
            <div id="cc-padron" style="display:none;margin-top:5px;padding:7px 10px;border-radius:6px;font-size:.8rem"></div>
          </div>

          <div>
            <label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Nro comprobante *</label>
            <input id="cc-nro" placeholder="0001-00012345"
              style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">
          </div>

          <div>
            <label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Fecha *</label>
            <input id="cc-fecha" type="date" value="${new Date().toISOString().split('T')[0]}"
              style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">
          </div>

          <div>
            <label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Tipo</label>
            <select id="cc-tipo"
              style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">
              <option>FA</option><option>FB</option><option>FC</option><option>RC</option><option>TP</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Importe total *</label>
            <input id="cc-total" type="number" placeholder="100000"
              style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:.85rem;font-family:inherit">
          </div>

          <div>
            <label style="display:block;font-size:.75rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">Alícuota IVA</label>
            <div style="display:flex;gap:6px;margin-top:4px" id="cc-ali">
              <button class="cali active" data-v="21"   style="padding:5px 10px;border-radius:6px;border:1px solid #6c5ce7;background:#6c5ce7;color:#fff;font-size:.78rem;cursor:pointer;font-family:inherit">21%</button>
              <button class="cali"        data-v="10.5" style="padding:5px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-size:.78rem;cursor:pointer;font-family:inherit">10.5%</button>
              <button class="cali"        data-v="27"   style="padding:5px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-size:.78rem;cursor:pointer;font-family:inherit">27%</button>
              <button class="cali"        data-v="0"    style="padding:5px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-size:.78rem;cursor:pointer;font-family:inherit">Exento</button>
            </div>
          </div>

          <div id="cc-calc" style="grid-column:1/-1;display:none;background:rgba(108,92,231,.07);border-radius:8px;padding:12px;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">
            <div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">Neto</div><div id="cc-cn" style="font-size:1rem;font-weight:600">$0</div></div>
            <div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">IVA CF</div><div id="cc-ci" style="font-size:1rem;font-weight:600;color:#00b894">$0</div></div>
            <div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">Total</div><div id="cc-ct" style="font-size:1rem;font-weight:600;color:#6c5ce7">$0</div></div>
          </div>

        </div>
        <div style="display:flex;gap:8px;margin-top:14px;align-items:center">
          <button id="cc-add" style="padding:8px 18px;background:#6c5ce7;color:#fff;border:none;border-radius:8px;font-size:.85rem;cursor:pointer;font-family:inherit">+ Agregar</button>
          <span id="cc-msg" style="font-size:.8rem;color:#6c5ce7"></span>
        </div>
      </div>

      <div id="cc-pending"></div>
    </div>
  `

  const ci = id => container.querySelector(id)

  function setAli(v) {
