function getHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('ff_jwt') ?? ''}`, 'Content-Type': 'application/json' }
}
function fmt(n) { return '$' + Math.round(n ?? 0).toLocaleString('es-AR') }
function getPeriodo() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

const MNI = 7_003_662
const A   = { j: 0.11, o: 0.03, p: 0.03 }
const rn  = n => Math.round(n * 100) / 100

function liquidar(bruto) {
  const anual = bruto * 13
  const base  = Math.max(0, anual - MNI)
  const ga = base <= 0 ? 0
    : base <= 1_200_000 ? rn(base * 0.05 / 13)
    : base <= 2_400_000 ? rn((60_000 + (base - 1_200_000) * 0.09) / 13)
    : base <= 3_600_000 ? rn((168_000 + (base - 2_400_000) * 0.12) / 13)
    : rn((312_000 + (base - 3_600_000) * 0.15) / 13)
  const jub = rn(bruto * A.j)
  const os  = rn(bruto * A.o)
  const pa  = rn(bruto * A.p)
  return { jubilacion: jub, obra_social: os, pami: pa, ganancias: ga,
           salario_neto: rn(bruto - jub - os - pa - ga),
           contribs: rn(bruto * 0.231) }
}

export function renderSueldos(container) {
  let empleados = [], tab = 'nomina'

  container.innerHTML = `
    <div style="padding:24px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
        <div>
          <h2 style="font-size:1.3rem;font-weight:600;margin-bottom:4px">Sueldos</h2>
          <p style="color:var(--text-muted);font-size:.85rem">Nómina · Liquidación · SIPA / F931</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="month" id="sue-per" value="${getPeriodo()}"
            style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:.85rem">
          <button id="sue-liq"
            style="padding:7px 14px;background:#6c5ce7;color:#fff;border:none;border-radius:8px;font-size:.85rem;cursor:pointer;font-family:inherit">
            Liquidar período
          </button>
        </div>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:14px">
        <button class="st active" data-t="nomina"  style="padding:6px 14px;border-radius:20px;border:1px solid #6c5ce7;background:#6c5ce7;color:#fff;font-size:.82rem;cursor:pointer;font-family:inherit">Nómina</button>
        <button class="st"        data-t="recibos" style="padding:6px 14px;border-radius:20px;border:1px solid var(--border);background:var(--surface);color:var(--text-muted);font-size:.82rem;cursor:pointer;font-family:inherit">Recibos</button>
        <button class="st"        data-t="f931"    style="padding:6px 14px;border-radius:20px;border:1px solid var(--border);background:var(--surface);color:var(--text-muted);font-size:.82rem;cursor:pointer;font-family:inherit">SIPA / F931</button>
      </div>

      <div id="sue-msg" style="font-size:.8rem;color:#6c5ce7;min-height:18px;margin-bottom:8px"></div>
      <div id="sue-body" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden"></div>
    </div>
  `

  const ci = id => container.querySelector(id)

  function f931() {
    return empleados.reduce((a, e) => {
      const l = liquidar(e.salario_bruto)
      return {
        ap:  a.ap  + l.jubilacion + l.obra_social + l.pami,
        co:  a.co  + l.contribs,
        tot: a.tot + l.jubilacion + l.obra_social + l.pami + l.contribs
      }
    }, { ap: 0, co: 0, tot: 0 })
  }

  function renderTab() {
    const body = ci('#sue-body')
    if (!empleados.length) {
      body.innerHTML = '<div style="padding:20px;color:var(--text-muted);font-size:.85rem">Sin empleados activos. Agregá empleados en la tabla <code>empleados</code> de Supabase.</div>'
      return
    }

    if (tab === 'nomina') {
      body.innerHTML = empleados.map(e => {
        const l   = liquidar(e.salario_bruto)
        const ini = ((e.nombre?.[0] ?? '') + (e.apellido?.[0] ?? '')).toUpperCase()
        return `
          <div style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--border)">
            <div style="width:34px;height:34px;border-radius:50%;background:rgba(108,92,231,.15);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#6c5ce7;flex-shrink:0">${ini}</div>
            <div style="flex:1">
              <div style="font-size:.88rem;font-weight:500">${e.nombre} ${e.apellido}</div>
              <div style="font-size:.76rem;color:var(--text-muted)">Cat ${e.categoria} · ${e.cuil}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:.88rem;font-weight:500">${fmt(e.salario_bruto)}</div>
              <div style="font-size:.76rem;color:#00b894">Neto ${fmt(l.salario_neto)}</div>
            </div>
          </div>`
      }).join('')
      return
    }

    if (tab === 'recibos') {
      const cols = ['Empleado','Bruto','Jub 11%','OS 3%','PAMI 3%','Gan.','Neto']
      body.innerHTML = `
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:.82rem">
            <thead><tr>${cols.map(c =>
              `<th style="padding:8px 10px;text-align:left;color:var(--text-muted);font-weight:500;border-bottom:1px solid var(--border)">${c}</th>`
            ).join('')}</tr></thead>
            <tbody>${empleados.map(e => {
              const l = liquidar(e.salario_bruto)
              return `<tr>${[e.nombre+' '+e.apellido, e.salario_bruto, l.jubilacion, l.obra_social, l.pami, l.ganancias, l.salario_neto].map(v =>
                `<td style="padding:8px 10px;border-bottom:1px solid var(--border)">${typeof v === 'number' ? fmt(v) : v}</td>`
              ).join('')}</tr>`
            }).join('')}</tbody>
          </table>
        </div>`
      return
    }

    if (tab === 'f931') {
      const f = f931()
      body.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;padding:20px">
          ${[
            ['Aportes empleados',         f.ap,  '#378ADD'],
            ['Contribuciones patronales',  f.co,  '#e84393'],
            ['Total F931',                 f.tot, '#6c5ce7'],
          ].map(([l, v, c]) => `
            <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:16px;text-align:center">
              <div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">${l}</div>
              <div style="font-size:1.3rem;font-weight:600;color:${c}">${fmt(v)}</div>
            </div>`).join('')}
        </div>
        <div style="padding:0 20px 20px">
          <a href="https://www.arca.gob.ar" target="_blank"
            style="display:inline-block;padding:8px 18px;background:#6c5ce7;color:#fff;border-radius:8px;font-size:.82rem;text-decoration:none">
            Ir a ARCA — SICOSS ↗
          </a>
        </div>`
    }
  }

  container.querySelectorAll('.st').forEach(b => b.addEventListener('click', () => {
    container.querySelectorAll('.st').forEach(x => {
      x.style.background = 'var(--surface)'; x.style.color = 'var(--text-muted)'; x.style.borderColor = 'var(--border)'
    })
    b.style.background = '#6c5ce7'; b.style.color = '#fff'; b.style.borderColor = '#6c5ce7'
    tab = b.dataset.t; renderTab()
  }))

  ci('#sue-liq').addEventListener('click', async () => {
    const btn = ci('#sue-liq')
    btn.disabled = true; btn.textContent = 'Procesando...'
    try {
      const r = await fetch('/api/ops?action=liquidar', {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ periodo: ci('#sue-per').value })
      })
      const d = await r.json()
      ci('#sue-msg').textContent = `✓ ${d.count} liquidaciones guardadas para ${ci('#sue-per').value}`
    } catch { ci('#sue-msg').textContent = 'Error al liquidar' }
    btn.disabled = false; btn.textContent = 'Liquidar período'
    setTimeout(() => { ci('#sue-msg').textContent = '' }, 4000)
  })

  async function cargar() {
    try {
      const r = await fetch('/api/ops?action=empleados', { headers: getHeaders() })
      if (r.ok) empleados = await r.json()
    } catch { /* sin conexión */ }
    renderTab()
  }
  cargar()
}
