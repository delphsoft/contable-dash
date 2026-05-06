export function renderFFImpuestos(el) {
  const PROVINCIAS={bsas:'Buenos Aires',caba:'CABA',cordoba:'Córdoba',santafe:'Santa Fe',mendoza:'Mendoza',tucuman:'Tucumán',otro:'Otra'}
  const ACTIVIDADES={servicios:'Servicios',comercio:'Comercio',construccion:'Construcción',gastronomia:'Gastronomía',otro:'Otra'}
  const CATEGORIAS=[
    {cat:'A',tope:2109220,monotributo:5069},
    {cat:'B',tope:3163830,monotributo:5069},
    {cat:'C',tope:4218440,monotributo:5510},
    {cat:'D',tope:5272350,monotributo:6119},
    {cat:'E',tope:7055680,monotributo:8001},
    {cat:'F',tope:8688720,monotributo:10150},
    {cat:'G',tope:10321760,monotributo:12744},
    {cat:'H',tope:14050080,monotributo:17760},
    {cat:'I',tope:16521270,monotributo:22393},
    {cat:'J',tope:19517770,monotributo:27789},
    {cat:'K',tope:23034350,monotributo:33986},
  ]

  let cfg = JSON.parse(localStorage.getItem('ff_impuestos_cfg')||'{}')
  let tab = 'resumen'

  const ingresos = Number(cfg.ingresos||0)
  const catActual = CATEGORIAS.find(c=>ingresos<=c.tope) || CATEGORIAS[CATEGORIAS.length-1]
  const alicuotaIIBB = {bsas:0.035,caba:0.03,cordoba:0.04,santafe:0.035,mendoza:0.03,tucuman:0.035,otro:0.035}[cfg.provincia||'bsas']
  const iibb = ingresos * alicuotaIIBB
  const ganancias = Math.max(0,(ingresos - (catActual?.tope||0)*0.4)*0.1)
  const monotributoCuota = catActual?.monotributo || 0
  const totalMes = monotributoCuota + iibb/12 + (cfg.obrasocial?Number(cfg.obrasocial):0)

  function render() {
    el.innerHTML=`
      <div style="display:flex;gap:7px;margin-bottom:18px;flex-wrap:wrap">
        ${['resumen','iibb','simulador','config'].map(t=>`
          <button class="sc-chip ${tab===t?'active':''}" data-tab="${t}">${{resumen:'Resumen',iibb:'IIBB',simulador:'Simulador',config:'Configuración'}[t]}</button>
        `).join('')}
      </div>

      ${tab==='resumen'?renderResumen():tab==='iibb'?renderIIBB():tab==='simulador'?renderSimulador():renderConfig()}
    `
    el.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;render()}))
    if(tab==='config') bindConfig()
    if(tab==='simulador') bindSimulador()
  }

  function renderResumen() {
    return`
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">Categoría Monotributo</div><div class="kpi-value" style="color:var(--blue)">Cat. ${catActual.cat}</div><div class="kpi-delta delta-flat">Tope: $${(catActual.tope/1e6).toFixed(1)}M/año</div></div>
        <div class="kpi-card"><div class="kpi-label">Cuota Monotributo</div><div class="kpi-value">${new Intl.NumberFormat('es-AR').format(monotributoCuota)}</div><div class="kpi-delta delta-flat">mensual</div></div>
        <div class="kpi-card"><div class="kpi-label">IIBB estimado</div><div class="kpi-value">${new Intl.NumberFormat('es-AR').format(Math.round(iibb/12))}</div><div class="kpi-delta delta-flat">${(alicuotaIIBB*100).toFixed(1)}% · mensual</div></div>
        <div class="kpi-card"><div class="kpi-label">Carga total mes</div><div class="kpi-value" style="color:var(--red)">${new Intl.NumberFormat('es-AR').format(Math.round(totalMes))}</div><div class="kpi-delta delta-down">▼ impuestos + aportes</div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Escala de categorías monotributo</span></div>
        <table class="tbl">
          <thead><tr><th>Cat.</th><th>Tope anual</th><th>Cuota mensual</th><th>Estado</th></tr></thead>
          <tbody>${CATEGORIAS.map(c=>`<tr style="${c.cat===catActual.cat?'background:var(--blue-d)':''}">
            <td style="font-weight:${c.cat===catActual.cat?'600':'400'};color:${c.cat===catActual.cat?'var(--blue)':'var(--txt)'}">Categoría ${c.cat}</td>
            <td style="font-family:'DM Mono',monospace;font-size:11px">$${(c.tope/1e6).toFixed(2)}M</td>
            <td style="font-family:'DM Mono',monospace;font-size:11px">$${new Intl.NumberFormat('es-AR').format(c.monotributo)}</td>
            <td>${c.cat===catActual.cat?'<span class="card-badge badge-blue">Actual</span>':ingresos>c.tope?'<span class="card-badge badge-red">Superado</span>':'<span style="font-size:11px;color:var(--txt3)">—</span>'}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`
  }

  function renderIIBB() {
    return`
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">Alícuota IIBB</div><div class="kpi-value" style="color:var(--purple)">${(alicuotaIIBB*100).toFixed(1)}%</div><div class="kpi-delta delta-flat">${PROVINCIAS[cfg.provincia||'bsas']}</div></div>
        <div class="kpi-card"><div class="kpi-label">IIBB anual</div><div class="kpi-value">${new Intl.NumberFormat('es-AR').format(Math.round(iibb))}</div><div class="kpi-delta delta-flat">sobre $${(ingresos/1e6).toFixed(1)}M</div></div>
        <div class="kpi-card"><div class="kpi-label">IIBB mensual</div><div class="kpi-value">${new Intl.NumberFormat('es-AR').format(Math.round(iibb/12))}</div><div class="kpi-delta delta-flat">promedio</div></div>
        <div class="kpi-card"><div class="kpi-label">Próximo vencimiento</div><div class="kpi-value" style="color:var(--amber)">15/06</div><div class="kpi-delta delta-flat">declaración mensual</div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Alícuotas por provincia</span></div>
        <table class="tbl">
          <thead><tr><th>Provincia</th><th>Alícuota</th><th>IIBB sobre tus ingresos</th></tr></thead>
          <tbody>${Object.entries(alicuotaIIBB.__proto__?{bsas:0.035,caba:0.03,cordoba:0.04,santafe:0.035,mendoza:0.03,tucuman:0.035}:{bsas:0.035,caba:0.03,cordoba:0.04,santafe:0.035,mendoza:0.03,tucuman:0.035}).map(([k,v])=>`<tr style="${(cfg.provincia||'bsas')===k?'background:var(--blue-d)':''}">
            <td style="color:${(cfg.provincia||'bsas')===k?'var(--blue)':'var(--txt)'}">${PROVINCIAS[k]}</td>
            <td style="font-family:'DM Mono',monospace">${(v*100).toFixed(1)}%</td>
            <td style="font-family:'DM Mono',monospace">${new Intl.NumberFormat('es-AR').format(Math.round(ingresos*v/12))}/mes</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`
  }

  function renderSimulador() {
    return`
      <div class="card">
        <div class="card-header"><span class="card-title">Simulador de carga fiscal</span></div>
        <div class="slider-row">
          <span class="slider-label">Ingresos mensuales ($)</span>
          <input type="range" id="sim-ing" min="100000" max="2000000" step="10000" value="${ingresos/12||500000}">
          <span class="slider-val" id="sim-ing-out">—</span>
        </div>
        <div id="sim-results" class="kpi-grid" style="margin-top:14px"></div>
        <div style="position:relative;height:240px;margin-top:14px"><canvas id="sim-chart"></canvas></div>
      </div>`
  }

  function bindSimulador() {
    const sl = document.getElementById('sim-ing')
    function updateSim() {
      const ingMes = Number(sl.value)
      const ingAnual = ingMes * 12
      document.getElementById('sim-ing-out').textContent = '$'+new Intl.NumberFormat('es-AR').format(ingMes)
      const cat = CATEGORIAS.find(c=>ingAnual<=c.tope)||CATEGORIAS[CATEGORIAS.length-1]
      const iibbSim = ingAnual * alicuotaIIBB / 12
      const mono = cat.monotributo
      const total = mono + iibbSim
      const pct = (total/ingMes*100).toFixed(1)
      document.getElementById('sim-results').innerHTML=`
        <div class="kpi-card"><div class="kpi-label">Categoría</div><div class="kpi-value" style="color:var(--blue)">Cat. ${cat.cat}</div></div>
        <div class="kpi-card"><div class="kpi-label">Monotributo</div><div class="kpi-value">$${new Intl.NumberFormat('es-AR').format(mono)}</div></div>
        <div class="kpi-card"><div class="kpi-label">IIBB mensual</div><div class="kpi-value">$${new Intl.NumberFormat('es-AR').format(Math.round(iibbSim))}</div></div>
        <div class="kpi-card"><div class="kpi-label">Presión fiscal</div><div class="kpi-value" style="color:${pct>15?'var(--red)':'var(--green)'}">${pct}%</div></div>
      `
    }
    sl.addEventListener('input', updateSim)
    updateSim()
  }

  function renderConfig() {
    return`
      <div class="card" style="max-width:500px">
        <div class="card-header"><span class="card-title">Configuración fiscal</span></div>
        <div class="ff-form">
          <div class="ff-field"><label class="ff-label">Ingresos anuales ($)</label>
            <input class="ff-input" id="cfg-ingresos" type="number" value="${cfg.ingresos||''}" placeholder="2000000"/>
          </div>
          <div class="ff-field"><label class="ff-label">Provincia (IIBB)</label>
            <select class="ff-select" id="cfg-prov">
              ${Object.entries(PROVINCIAS).map(([k,v])=>`<option value="${k}" ${(cfg.provincia||'bsas')===k?'selected':''}>${v}</option>`).join('')}
            </select>
          </div>
          <div class="ff-field"><label class="ff-label">Actividad</label>
            <select class="ff-select" id="cfg-act">
              ${Object.entries(ACTIVIDADES).map(([k,v])=>`<option value="${k}" ${(cfg.actividad||'servicios')===k?'selected':''}>${v}</option>`).join('')}
            </select>
          </div>
          <div class="ff-field"><label class="ff-label">Obra social mensual ($)</label>
            <input class="ff-input" id="cfg-os" type="number" value="${cfg.obrasocial||''}" placeholder="0"/>
          </div>
          <button class="ff-btn ff-btn-primary" id="cfg-save-btn">Guardar configuración</button>
          <div id="cfg-msg" style="display:none;font-size:12px;color:var(--green);margin-top:4px">✓ Guardado</div>
        </div>
      </div>`
  }

  function bindConfig() {
    document.getElementById('cfg-save-btn').addEventListener('click',()=>{
      cfg = {
        ingresos: document.getElementById('cfg-ingresos').value,
        provincia: document.getElementById('cfg-prov').value,
        actividad: document.getElementById('cfg-act').value,
        obrasocial: document.getElementById('cfg-os').value,
      }
      localStorage.setItem('ff_impuestos_cfg', JSON.stringify(cfg))
      document.getElementById('cfg-msg').style.display='block'
      setTimeout(()=>{document.getElementById('cfg-msg').style.display='none';render()},1200)
    })
  }

  render()
}
