// ─── Constants ────────────────────────────────────────────────────────────────
const PROVINCIAS = {
  bsas:'Buenos Aires',caba:'CABA',cordoba:'Córdoba',santafe:'Santa Fe',
  mendoza:'Mendoza',tucuman:'Tucumán',neuquen:'Neuquén',
  salta:'Salta',entrerios:'Entre Ríos',chaco:'Chaco',
}
const ACTIVIDADES = {
  servicios:'Servicios generales',software:'Software / Tecnología',
  comercio:'Comercio minorista',profesional:'Servicios profesionales',
}
const CBTE_LABELS = { 1:'FA', 6:'FB', 11:'FC' }
const IIBB_RATES = { bsas:3.5,caba:3.0,cordoba:3.0,santafe:3.5,mendoza:3.5,tucuman:4.0,neuquen:3.0,salta:3.5,entrerios:3.5,chaco:4.0 }
const CATEGORIAS_MONO = [
  {cat:'A',tope:2109220,impuesto:5069,obraSocial:3383,jubilacion:2024},
  {cat:'B',tope:3163830,impuesto:5069,obraSocial:3383,jubilacion:2024},
  {cat:'C',tope:4218440,impuesto:5510,obraSocial:3383,jubilacion:2024},
  {cat:'D',tope:5272350,impuesto:6119,obraSocial:3383,jubilacion:2024},
  {cat:'E',tope:7055680,impuesto:8001,obraSocial:3383,jubilacion:2024},
  {cat:'F',tope:8688720,impuesto:10150,obraSocial:5076,jubilacion:3036},
  {cat:'G',tope:10321760,impuesto:12744,obraSocial:5076,jubilacion:3036},
  {cat:'H',tope:14050080,impuesto:17760,obraSocial:6769,jubilacion:4048},
  {cat:'I',tope:16521270,impuesto:22393,obraSocial:6769,jubilacion:4048},
  {cat:'J',tope:19517770,impuesto:27789,obraSocial:6769,jubilacion:4048},
  {cat:'K',tope:23034350,impuesto:33986,obraSocial:6769,jubilacion:4048},
]
const fmt = n => '$' + Math.round(n).toLocaleString('es-AR')
const fmtPct = n => Number(n).toFixed(1) + '%'
const mesesLabels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

// ─── State ────────────────────────────────────────────────────────────────────
let S = {
  activeTab: 'resumen',
  periodo: new Date().toISOString().slice(0,7),
  config: null,
  editConfig: null,
  calc: null,
  pagos: [],
  comprobantes: [],
  loading: true,
  loadingComp: false,
  savingConfig: false,
  showConfigModal: false,
  showPagoModal: false,
  showGastoModal: false,
  newPago: { periodo: new Date().toISOString().slice(0,7), concepto:'monotributo', monto:'' },
  newGasto: { proveedor:'', descripcion:'', monto:'', iva:'' },
  simExtra: 500000,
  simMeses: 6,
}

let rootEl = null
function re() { if (rootEl) { rootEl.innerHTML = renderHTML(); bindEvents() } }

const getToken = () => localStorage.getItem('ff_jwt') || ''

// ─── Local config storage ─────────────────────────────────────────────────────
function getLocalConfig() {
  return JSON.parse(localStorage.getItem('ff_impuestos_cfg') || 'null') || {
    provincia:'bsas', actividad:'servicios',
    modalidad_iibb:'local', categoria_mono:'H', regimen:'monotributo'
  }
}
function saveLocalConfig(cfg) { localStorage.setItem('ff_impuestos_cfg', JSON.stringify(cfg)) }
function getLocalPagos() { return JSON.parse(localStorage.getItem('ff_impuestos_pagos') || '[]') }
function saveLocalPagos(p) { localStorage.setItem('ff_impuestos_pagos', JSON.stringify(p)) }

// ─── Calculation engine (local) ───────────────────────────────────────────────
function calcLocal(config, periodo) {
  const invoices = JSON.parse(localStorage.getItem('ff_facturas') || '[]')
  const [year, month] = periodo.split('-').map(Number)

  const ingresosMes = invoices.filter(f => {
    const d = new Date(f.fecha || f.created_at || f.date || '')
    return d.getFullYear() === year && d.getMonth() + 1 === month
  }).reduce((s,f) => s + Number(f.amount || f.monto || 0), 0)

  const ingresosAnio = invoices.filter(f => {
    const d = new Date(f.fecha || f.created_at || f.date || '')
    return d.getFullYear() === year
  }).reduce((s,f) => s + Number(f.amount || f.monto || 0), 0)

  const catActual = CATEGORIAS_MONO.find(c => ingresosAnio <= c.tope) || CATEGORIAS_MONO[CATEGORIAS_MONO.length-1]
  const catConfig = CATEGORIAS_MONO.find(c => c.cat === (config.categoria_mono || 'H')) || catActual
  const catRecomendada = catActual.cat
  const pctLimite = catConfig.tope > 0 ? Math.round(ingresosAnio / catConfig.tope * 100) : 0

  const iibbRate = IIBB_RATES[config.provincia] || 3.5
  const iibbImporte = Math.round(ingresosMes * iibbRate / 100)

  const monotributo = config.regimen === 'monotributo' ? {
    impuesto: catConfig.impuesto,
    obraSocial: catConfig.obraSocial,
    jubilacion: catConfig.jubilacion,
    total: catConfig.impuesto + catConfig.obraSocial + catConfig.jubilacion,
  } : null

  // IVA for RI
  const ivaVentas = Math.round(ingresosMes / 1.21 * 0.21)
  const gastosM = JSON.parse(localStorage.getItem('ff_impuestos_pagos') || '[]')
    .filter(p => p.concepto === 'gasto_compra' && p.periodo === periodo)
    .reduce((s,p) => s + Number(p.monto || 0), 0)
  const ivaCompras = Math.round(gastosM / 1.21 * 0.21)
  const iva = config.regimen === 'responsable_inscripto' ? {
    ventas: ivaVentas, compras: ivaCompras, saldo: ivaVentas - ivaCompras
  } : null

  const totalMes = config.regimen === 'monotributo'
    ? (monotributo?.total || 0) + iibbImporte
    : iibbImporte + (iva?.saldo || 0) + 15000 // autónomos estimado

  return {
    regimen: config.regimen,
    periodo,
    ingresosMes, ingresosAnio,
    categoriaActual: catConfig.cat,
    catRecomendada,
    limiteAnual: catConfig.tope,
    pctLimite,
    monotributo,
    iva,
    iibb: { alicuota: iibbRate, importe: iibbImporte, modalidad: config.modalidad_iibb || 'local' },
    autonomos: config.regimen === 'responsable_inscripto' ? 15000 : undefined,
    totalMes,
    forecast: {
      mes1: Math.round(totalMes * 1.0),
      mes2: Math.round(totalMes * 1.05),
      mes3: Math.round(totalMes * 1.10),
    }
  }
}

// ─── API calls (with local fallback) ─────────────────────────────────────────
async function loadAll() {
  S.loading = true; re()
  const token = getToken()

  if (token) {
    try {
      const [cfgRes, pagosRes] = await Promise.all([
        fetch('/api/impuestos/config', { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/impuestos/pagos?year=${S.periodo.slice(0,4)}`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (cfgRes.ok) { S.config = await cfgRes.json(); S.editConfig = { ...S.config } }
      else { S.config = getLocalConfig(); S.editConfig = { ...S.config } }
      if (pagosRes.ok) S.pagos = await pagosRes.json()
      else S.pagos = getLocalPagos()
    } catch {
      S.config = getLocalConfig(); S.editConfig = { ...S.config }; S.pagos = getLocalPagos()
    }
  } else {
    S.config = getLocalConfig(); S.editConfig = { ...S.config }; S.pagos = getLocalPagos()
  }

  S.calc = calcLocal(S.config, S.periodo)
  S.loading = false; re()
}

async function loadCalc() {
  const token = getToken()
  if (token) {
    try {
      const res = await fetch(`/api/impuestos/calcular?periodo=${S.periodo}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { S.calc = await res.json(); re(); return }
    } catch {}
  }
  S.calc = calcLocal(S.config, S.periodo); re()
}

async function saveConfig() {
  S.savingConfig = true; re()
  const token = getToken()
  const cfg = S.editConfig
  if (token) {
    try {
      const res = await fetch('/api/impuestos/config', {
        method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body: JSON.stringify(cfg),
      })
      if (res.ok) { S.config = await res.json() }
      else { S.config = cfg; saveLocalConfig(cfg) }
    } catch { S.config = cfg; saveLocalConfig(cfg) }
  } else { S.config = cfg; saveLocalConfig(cfg) }
  S.calc = calcLocal(S.config, S.periodo)
  S.showConfigModal = false; S.savingConfig = false; re()
}

async function registrarPago() {
  const token = getToken()
  const pago = { ...S.newPago, monto: parseFloat(S.newPago.monto), pagado: true, fecha_pago: new Date().toISOString().split('T')[0], id: Date.now().toString() }
  if (token) {
    try {
      const res = await fetch('/api/impuestos/pagos', {
        method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body: JSON.stringify(pago),
      })
      if (res.ok) { S.pagos = [await res.json(), ...S.pagos]; S.showPagoModal = false; re(); return }
    } catch {}
  }
  S.pagos = [pago, ...S.pagos]; saveLocalPagos(S.pagos)
  S.showPagoModal = false; re()
}

async function marcarPagado(id, pagado) {
  const token = getToken()
  const fecha = pagado ? new Date().toISOString().split('T')[0] : null
  if (token) {
    try {
      const res = await fetch('/api/impuestos/pagos', {
        method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body: JSON.stringify({ id, pagado, fecha_pago: fecha }),
      })
      if (res.ok) { const d = await res.json(); S.pagos = S.pagos.map(p => p.id === id ? d : p); re(); return }
    } catch {}
  }
  S.pagos = S.pagos.map(p => p.id === id ? { ...p, pagado, fecha_pago: fecha } : p)
  saveLocalPagos(S.pagos); re()
}

async function agregarGasto() {
  const token = getToken()
  const pago = {
    periodo: S.periodo, concepto: 'gasto_compra',
    monto: parseFloat(S.newGasto.monto), pagado: true,
    fecha_pago: new Date().toISOString().split('T')[0],
    comprobante: `${S.newGasto.proveedor} — ${S.newGasto.descripcion}`,
    id: Date.now().toString(),
  }
  if (token) {
    try {
      await fetch('/api/impuestos/pagos', {
        method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body: JSON.stringify(pago),
      })
    } catch {}
  }
  S.pagos = [pago, ...S.pagos]; saveLocalPagos(S.pagos)
  S.calc = calcLocal(S.config, S.periodo)
  S.showGastoModal = false; re()
}

async function loadComprobantes() {
  S.loadingComp = true; re()
  const token = getToken()
  if (token) {
    try {
      const res = await fetch(`/api/impuestos/arca-comprobantes?periodo=${S.periodo}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { const d = await res.json(); S.comprobantes = d.comprobantes || []; S.loadingComp = false; re(); return }
    } catch {}
  }
  S.comprobantes = []; S.loadingComp = false; re()
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderHTML() {
  const { activeTab, periodo, config, calc, pagos, comprobantes, loading, loadingComp, simExtra, simMeses } = S
  if (loading) return `<div style="text-align:center;padding:60px;color:var(--txt3)"><div style="font-size:13px;margin-bottom:8px">Cargando módulo de impuestos...</div></div>`
  if (!config || !calc) return `<div style="text-align:center;padding:60px;color:var(--txt3)">Sin datos — configurá tu perfil fiscal</div>`

  const periodoNum = parseInt(periodo.slice(5,7)) - 1
  const iibbRate = IIBB_RATES[config.provincia] || 3.5
  const simIIBB = Math.round(simExtra * simMeses * iibbRate / 100)
  const simTotal = simExtra * simMeses
  const simNeto = simTotal - simIIBB
  const ingAnioConSim = (calc.ingresosAnio || 0) + simExtra * Math.min(simMeses, 12 - parseInt(periodo.slice(5,7)))
  const limiteCat = calc.limiteAnual || 6450000
  const superaLimite = ingAnioConSim > limiteCat

  const tabs = [
    {k:'resumen',l:'Resumen'},{k:'iibb',l:'IIBB'},{k:'forecast',l:'Forecast'},
    {k:'simulador',l:'Simulador'},{k:'historial',l:'Historial'},{k:'comprobantes',l:'Comprobantes recibidos'}
  ]

  return `
    <!-- Header -->
    <div class="card" style="margin-bottom:14px;padding:14px 18px">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-family:'Syne',sans-serif;font-size:16px;font-weight:600;color:var(--txt)">Módulo de Impuestos</span>
            <span style="font-size:9px;background:var(--purple-d);color:var(--purple);padding:2px 9px;border-radius:20px;font-weight:600;border:0.5px solid rgba(155,130,247,.3)">★ Premium</span>
          </div>
          <div style="font-size:11px;color:var(--txt2);margin-top:2px">
            ${config.regimen==='responsable_inscripto'?'Resp. Inscripto':'Monotributista'} · ${PROVINCIAS[config.provincia]||'—'} · ${ACTIVIDADES[config.actividad]||'—'}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <label style="font-size:11px;color:var(--txt2)">Período:</label>
          <input type="month" id="imp-periodo" value="${periodo}" class="ff-input" style="width:140px;font-size:12px;padding:6px 10px"/>
        </div>
        <button id="btn-config-modal" class="ff-btn ff-btn-secondary" style="font-size:12px;padding:7px 13px">⚙ Configurar</button>
      </div>
      <!-- Tabs -->
      <div style="display:flex;gap:0;margin-top:12px;border-top:0.5px solid var(--border);padding-top:10px;overflow-x:auto">
        ${tabs.map(t=>`<button class="imp-tab" data-tab="${t.k}" style="padding:6px 14px;border:none;background:transparent;cursor:pointer;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:${activeTab===t.k?'var(--txt)':'var(--txt2)'};border-bottom:${activeTab===t.k?'2px solid var(--purple)':'2px solid transparent'};white-space:nowrap">${t.l}</button>`).join('')}
      </div>
    </div>

    <!-- RESUMEN -->
    ${activeTab==='resumen'?`
      <div class="kpi-grid" style="margin-bottom:14px">
        <div class="kpi-card">
          <div class="kpi-label">Ingresos este mes</div>
          <div class="kpi-value">${fmt(calc.ingresosMes)}</div>
          <div class="kpi-delta delta-flat">Facturas emitidas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Ingresos en el año</div>
          <div class="kpi-value">${fmt(calc.ingresosAnio)}</div>
          <div class="kpi-delta ${calc.pctLimite>80?'delta-down':'delta-flat'}">${calc.pctLimite||0}% del límite Cat. ${calc.categoriaActual||''}</div>
        </div>
        <div class="kpi-card" style="border-left:3px solid var(--purple);border-radius:0 13px 13px 0">
          <div class="kpi-label">Total impuestos mes</div>
          <div class="kpi-value" style="color:var(--purple)">${fmt(calc.totalMes)}</div>
          <div class="kpi-delta delta-flat">Todos los conceptos</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Presión fiscal</div>
          <div class="kpi-value">${calc.ingresosMes>0?fmtPct(calc.totalMes/calc.ingresosMes*100):'0%'}</div>
          <div class="kpi-delta delta-flat">Sobre ingresos del mes</div>
        </div>
      </div>
      <div class="grid-2">
        ${calc.regimen==='monotributo'&&calc.monotributo?`
        <div class="card" style="margin-bottom:0">
          <div class="card-header"><span class="card-title">Monotributo — desglose mensual</span></div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <div style="background:var(--purple-d);border:0.5px solid rgba(155,130,247,.4);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:8px">
              <span style="font-size:26px;font-weight:700;color:var(--purple)">${calc.categoriaActual}</span>
              <span style="font-size:9px;color:var(--purple)">actual</span>
            </div>
            ${calc.catRecomendada!==calc.categoriaActual?`
              <span style="color:var(--txt3)">→</span>
              <div style="background:var(--amber-d);border:0.5px solid rgba(240,160,80,.4);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:8px">
                <span style="font-size:26px;font-weight:700;color:var(--amber)">${calc.catRecomendada}</span>
                <span style="font-size:9px;color:var(--amber)">recomendada</span>
              </div>
            `:''}
          </div>
          ${[
            {l:'Impuesto integrado',v:fmt(calc.monotributo.impuesto)},
            {l:'Obra social',v:fmt(calc.monotributo.obraSocial)},
            {l:'Jubilación (SIPA)',v:fmt(calc.monotributo.jubilacion)},
          ].map(r=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid var(--border);font-size:13px"><span style="color:var(--txt2)">${r.l}</span><span style="color:var(--txt)">${r.v}</span></div>`).join('')}
          <div style="display:flex;justify-content:space-between;padding:10px;background:var(--purple-d);border-radius:8px;margin-top:8px;font-size:13px;font-weight:600">
            <span style="color:var(--purple)">Total monotributo</span>
            <span style="color:var(--purple)">${fmt(calc.monotributo.total)}</span>
          </div>
          <button id="btn-pago-modal" class="ff-btn ff-btn-primary" style="width:100%;margin-top:12px;font-size:12px">Registrar pago →</button>
        </div>
        `:''}
        ${calc.regimen==='responsable_inscripto'&&calc.iva?`
        <div class="card" style="margin-bottom:0">
          <div class="card-header"><span class="card-title">IVA — período ${periodo}</span></div>
          ${[
            {l:'Débito fiscal (ventas)',v:fmt(calc.iva.ventas),c:'var(--txt)'},
            {l:'Crédito fiscal (compras)',v:`- ${fmt(calc.iva.compras)}`,c:'var(--green)'},
          ].map(r=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid var(--border);font-size:13px"><span style="color:var(--txt2)">${r.l}</span><span style="color:${r.c}">${r.v}</span></div>`).join('')}
          <div style="display:flex;justify-content:space-between;padding:10px;background:${calc.iva.saldo>0?'var(--red-d)':'var(--green-d)'};border-radius:8px;margin-top:8px;font-size:13px;font-weight:600">
            <span>Saldo ${calc.iva.saldo>0?'a pagar':'a favor'}</span>
            <span style="color:${calc.iva.saldo>0?'var(--red)':'var(--green)'}">${fmt(Math.abs(calc.iva.saldo))}</span>
          </div>
          <button id="btn-gasto-modal" class="ff-btn ff-btn-secondary" style="width:100%;margin-top:10px;font-size:12px;border:0.5px solid var(--purple);color:var(--purple)">+ Agregar compra manual</button>
        </div>
        `:''}
        <div class="card" style="margin-bottom:0">
          <div class="card-header"><span class="card-title">${calc.regimen==='monotributo'?'Progreso hacia recategorización':'IIBB + Otros'}</span></div>
          ${calc.regimen==='monotributo'?`
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt2);margin-bottom:5px">
              <span>${fmt(calc.ingresosAnio)} facturados</span>
              <span>Límite Cat. ${calc.categoriaActual}: ${fmt(calc.limiteAnual||0)}</span>
            </div>
            <div style="height:10px;background:var(--bg3);border-radius:5px;overflow:hidden;margin-bottom:8px">
              <div style="height:100%;width:${Math.min(calc.pctLimite||0,100)}%;background:${(calc.pctLimite||0)>80?'var(--red)':'var(--purple)'};border-radius:5px"></div>
            </div>
            <div style="font-size:11px;padding:7px 10px;border-radius:8px;background:${(calc.pctLimite||0)>80?'var(--amber-d)':'var(--green-d)'};color:${(calc.pctLimite||0)>80?'var(--amber)':'var(--green)'};margin-bottom:14px">
              ${(calc.pctLimite||0)>80
                ?`⚠ Faltan ${fmt((calc.limiteAnual||0)-calc.ingresosAnio)} para recategorizar`
                :`✓ Dentro del límite — ${100-(calc.pctLimite||0)}% disponible`}
            </div>
          `:''}
          <div style="font-size:12px;font-weight:600;color:var(--txt);margin-bottom:10px">Vencimientos del mes</div>
          ${[
            {l:calc.regimen==='monotributo'?'Monotributo':'IVA', m:calc.regimen==='monotributo'?calc.monotributo?.total||0:calc.iva?.saldo||0, d:20},
            {l:'IIBB', m:calc.iibb.importe, d:15},
            ...(calc.regimen==='responsable_inscripto'?[{l:'Autónomos',m:calc.autonomos||0,d:8}]:[]),
          ].map(v=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid var(--border);font-size:12px">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:6px;height:6px;border-radius:50%;background:var(--purple)"></div>
                <span style="color:var(--txt)">${v.l}</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:10px;color:var(--txt3)">día ${v.d}</span>
                <span style="font-weight:600;color:var(--txt)">${fmt(v.m)}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>
    `:''}

    <!-- IIBB -->
    ${activeTab==='iibb'?`
      <div class="kpi-grid" style="margin-bottom:14px">
        <div class="kpi-card" style="border-left:3px solid var(--purple);border-radius:0 13px 13px 0">
          <div class="kpi-label">Alícuota</div>
          <div class="kpi-value" style="color:var(--purple)">${fmtPct(calc.iibb.alicuota)}</div>
          <div class="kpi-delta delta-flat">${PROVINCIAS[config.provincia]||'—'} · ${ACTIVIDADES[config.actividad]||'—'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">IIBB este mes</div>
          <div class="kpi-value">${fmt(calc.iibb.importe)}</div>
          <div class="kpi-delta delta-flat">Sobre ${fmt(calc.ingresosMes)} facturados</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Modalidad</div>
          <div class="kpi-value" style="font-size:15px;line-height:1.4">${calc.iibb.modalidad==='cm'?'Convenio Multilateral':'Local'}</div>
          <div class="kpi-delta delta-flat">Vence día 15 de cada mes</div>
        </div>
      </div>
      ${calc.iibb.modalidad==='cm'&&calc.iibb.porProvincia?`
        <div class="card" style="margin-bottom:14px">
          <div class="card-header"><span class="card-title">Distribución Convenio Multilateral</span></div>
          ${calc.iibb.porProvincia.map(p=>`
            <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:0.5px solid var(--border);font-size:12px">
              <span style="min-width:120px;color:var(--txt2)">${PROVINCIAS[p.provincia]||p.provincia}</span>
              <span style="min-width:36px;color:var(--txt)">${p.porcentaje}%</span>
              <div style="flex:1;height:5px;background:var(--bg3);border-radius:3px;overflow:hidden">
                <div style="height:5px;width:${p.porcentaje*2.5}%;background:var(--purple);border-radius:3px"></div>
              </div>
              <span style="min-width:40px;color:var(--txt2)">${fmtPct(p.alicuota)}</span>
              <span style="min-width:70px;text-align:right;font-weight:600;color:var(--txt)">${fmt(p.importe)}</span>
            </div>`).join('')}
          <div style="display:flex;justify-content:flex-end;margin-top:10px;padding:8px 12px;background:var(--purple-d);border-radius:8px;font-size:13px;font-weight:600;color:var(--purple)">Total IIBB: ${fmt(calc.iibb.importe)}</div>
        </div>
      `:''}
      <div style="background:var(--blue-d);border:0.5px solid rgba(79,142,247,.3);border-radius:10px;padding:10px 14px;font-size:12px;color:var(--blue)">
        Para cambiar de Local a Convenio Multilateral o actualizar tu provincia, usá el botón ⚙ Configurar arriba.
      </div>
    `:''}

    <!-- FORECAST -->
    ${activeTab==='forecast'?`
      <div class="kpi-grid" style="margin-bottom:14px">
        ${[
          {l:mesesLabels[periodoNum%12],v:fmt(calc.forecast.mes1),sub:'Igual tendencia actual',c:'var(--purple)'},
          {l:mesesLabels[(periodoNum+1)%12],v:fmt(calc.forecast.mes2),sub:'Tendencia +5%',c:'var(--blue)'},
          {l:mesesLabels[(periodoNum+2)%12],v:fmt(calc.forecast.mes3),sub:'Tendencia +10%',c:'var(--amber)'},
        ].map(c=>`
          <div class="kpi-card">
            <div class="kpi-label">${c.l}</div>
            <div class="kpi-value" style="color:${c.c}">${c.v}</div>
            <div class="kpi-delta delta-flat">${c.sub}</div>
          </div>`).join('')}
      </div>
      <div class="card" style="margin-bottom:14px">
        <div class="card-header"><span class="card-title">Proyección carga fiscal — próximos 6 meses</span></div>
        <div style="display:flex;align-items:flex-end;gap:10px;height:140px;padding-top:8px">
          ${[
            {mes:mesesLabels[(periodoNum-2+12)%12],val:Math.round(calc.totalMes*0.9),real:true},
            {mes:mesesLabels[(periodoNum-1+12)%12],val:Math.round(calc.totalMes*0.95),real:true},
            {mes:mesesLabels[periodoNum%12],val:calc.totalMes,real:true},
            {mes:mesesLabels[(periodoNum+1)%12],val:calc.forecast.mes1,real:false},
            {mes:mesesLabels[(periodoNum+2)%12],val:calc.forecast.mes2,real:false},
            {mes:mesesLabels[(periodoNum+3)%12],val:calc.forecast.mes3,real:false},
          ].map(b=>{
            const h = Math.round((b.val/(calc.forecast.mes3*1.1))*120)
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
              <span style="font-size:9.5px;color:var(--txt2)">${fmt(b.val).slice(0,7)}</span>
              <div style="width:100%;height:${h}px;background:${b.real?'var(--purple)':'rgba(155,130,247,.4)'};border-radius:3px 3px 0 0"></div>
              <span style="font-size:10px;color:${b.real?'var(--txt)':'var(--txt2)'};font-weight:${b.real?600:400}">${b.mes}</span>
              ${!b.real?`<span style="font-size:9px;color:var(--txt3)">est.</span>`:''}
            </div>`
          }).join('')}
        </div>
      </div>
      <div class="grid-2">
        <div class="card" style="margin-bottom:0">
          <div class="card-header"><span class="card-title">Desglose proyectado — ${mesesLabels[(periodoNum+1)%12]}</span></div>
          ${calc.regimen==='monotributo'&&calc.monotributo?[
            {l:'Monotributo',v:fmt(calc.monotributo.total)},
            {l:'IIBB',v:fmt(Math.round(calc.iibb.importe*1.05))},
          ].map(r=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid var(--border);font-size:13px"><span style="color:var(--txt2)">${r.l}</span><span style="color:var(--txt)">${r.v}</span></div>`).join(''):''}
          ${calc.regimen==='responsable_inscripto'?[
            {l:'IVA (estimado)',v:fmt(Math.round((calc.iva?.saldo||0)*1.05))},
            {l:'IIBB',v:fmt(Math.round(calc.iibb.importe*1.05))},
            {l:'Autónomos',v:fmt(calc.autonomos||0)},
          ].map(r=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid var(--border);font-size:13px"><span style="color:var(--txt2)">${r.l}</span><span style="color:var(--txt)">${r.v}</span></div>`).join(''):''}
          <div style="display:flex;justify-content:space-between;padding:9px 12px;background:var(--purple-d);border-radius:8px;margin-top:8px;font-size:13px;font-weight:600;color:var(--purple)">
            <span>Total estimado</span><span>${fmt(calc.forecast.mes2)}</span>
          </div>
        </div>
        <div class="card" style="margin-bottom:0;background:var(--bg3)">
          <div class="card-header"><span class="card-title">Resumen anual proyectado</span></div>
          ${[
            {l:'Carga fiscal acum. (real)',v:fmt(calc.totalMes*parseInt(periodo.slice(5,7))),b:false},
            {l:'Proyección resto del año',v:fmt(calc.forecast.mes2*(12-parseInt(periodo.slice(5,7)))),b:false},
            {l:'Total carga anual est.',v:fmt(calc.totalMes*parseInt(periodo.slice(5,7))+calc.forecast.mes2*(12-parseInt(periodo.slice(5,7)))),b:true},
          ].map(r=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid var(--border);font-size:13px;font-weight:${r.b?600:400}"><span style="color:var(--txt2)">${r.l}</span><span style="color:${r.b?'var(--purple)':'var(--txt)'}">${r.v}</span></div>`).join('')}
        </div>
      </div>
    `:''}

    <!-- SIMULADOR -->
    ${activeTab==='simulador'?`
      <div class="card" style="margin-bottom:14px">
        <div class="card-header"><span class="card-title">Si facturo más... ¿cuánto pago?</span></div>
        <div class="slider-row">
          <span class="slider-label">Facturación mensual extra</span>
          <input type="range" id="sim-extra" min="0" max="3000000" step="50000" value="${simExtra}">
          <span class="slider-val" id="sim-extra-out">${fmt(simExtra)}</span>
        </div>
        <div class="slider-row">
          <span class="slider-label">Meses proyectados</span>
          <input type="range" id="sim-meses" min="1" max="12" step="1" value="${simMeses}">
          <span class="slider-val" id="sim-meses-out">${simMeses} meses</span>
        </div>
      </div>
      <div class="kpi-grid" style="margin-bottom:14px">
        <div class="kpi-card" style="border-left:3px solid var(--purple);border-radius:0 13px 13px 0">
          <div class="kpi-label">Ingresos adicionales</div>
          <div class="kpi-value" style="color:var(--purple)">${fmt(simTotal)}</div>
          <div class="kpi-delta delta-flat">en ${simMeses} meses</div>
        </div>
        <div class="kpi-card" style="border-left:3px solid var(--red);border-radius:0 13px 13px 0">
          <div class="kpi-label">IIBB adicional</div>
          <div class="kpi-value" style="color:var(--red)">${fmt(simIIBB)}</div>
          <div class="kpi-delta delta-down">${fmtPct(calc.iibb.alicuota)} sobre ${fmt(simTotal)}</div>
        </div>
        <div class="kpi-card" style="border-left:3px solid var(--green);border-radius:0 13px 13px 0">
          <div class="kpi-label">Ingreso neto adicional</div>
          <div class="kpi-value" style="color:var(--green)">${fmt(simNeto)}</div>
          <div class="kpi-delta delta-up">${simTotal>0?fmtPct(simNeto/simTotal*100):'0%'} de retención</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Impacto en categoría Monotributo</span></div>
        ${[
          {l:'Facturación actual (año)',v:fmt(calc.ingresosAnio),c:'var(--txt)',b:false},
          {l:'Facturación adicional proyectada',v:'+'+fmt(simExtra*Math.min(simMeses,12-parseInt(periodo.slice(5,7)))),c:'var(--purple)',b:false},
          {l:'Total proyectado año',v:fmt(ingAnioConSim),c:'var(--txt)',b:true},
          {l:'Límite categoría actual',v:fmt(limiteCat),c:'var(--txt)',b:false},
        ].map(r=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid var(--border);font-size:13px;font-weight:${r.b?600:400}"><span style="color:var(--txt2)">${r.l}</span><span style="color:${r.c}">${r.v}</span></div>`).join('')}
        <div style="margin-top:12px;padding:10px 14px;border-radius:8px;font-size:12px;background:${superaLimite?'var(--amber-d)':'var(--green-d)'};color:${superaLimite?'var(--amber)':'var(--green)'}">
          ${superaLimite
            ?`⚠ Con esta facturación superarías el límite de Cat. ${calc.categoriaActual} (${fmt(limiteCat)}). Necesitarías recategorizarte.`
            :`✓ Dentro del límite de Cat. ${calc.categoriaActual}. Sin impacto en recategorización.`}
        </div>
      </div>
    `:''}

    <!-- HISTORIAL -->
    ${activeTab==='historial'?`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="font-size:13px;font-weight:600;color:var(--txt)">Historial de pagos ${periodo.slice(0,4)}</div>
        <button id="btn-pago-modal" class="ff-btn ff-btn-primary" style="font-size:12px;padding:7px 14px">+ Registrar pago</button>
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        ${pagos.length===0?`<div style="text-align:center;padding:48px;color:var(--txt3);font-size:13px">Sin pagos registrados. Usá "+ Registrar pago" para cargar.</div>`
        :pagos.map((p,i)=>`
          <div style="display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:${i<pagos.length-1?'0.5px solid var(--border)':'none'};font-size:12px">
            <span class="card-badge ${p.pagado?'pill-green':'pill-red'}" style="font-size:10px;min-width:64px;text-align:center">${p.pagado?'Pagado':'Pendiente'}</span>
            <span style="flex:1;color:var(--txt)">${p.concepto.replace('_',' ')} — ${p.periodo}</span>
            <span style="color:var(--txt2);font-size:11px">${p.fecha_pago||'—'}</span>
            <span style="font-weight:600;color:var(--txt)">${fmt(p.monto)}</span>
            ${!p.pagado?`<button class="mark-pagado ff-btn ff-btn-secondary" data-id="${p.id}" style="font-size:11px;padding:4px 10px">Marcar pagado</button>`:''}
          </div>`).join('')}
      </div>
    `:''}

    <!-- COMPROBANTES -->
    ${activeTab==='comprobantes'?`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--txt)">Comprobantes recibidos — ${periodo}</div>
          <div style="font-size:11px;color:var(--txt2);margin-top:2px">Importados desde ARCA · wscdc</div>
        </div>
        <button id="btn-load-comp" class="ff-btn ff-btn-secondary" style="font-size:12px;padding:7px 14px">${loadingComp?'Cargando...':'↺ Actualizar'}</button>
      </div>
      ${comprobantes.length===0&&!loadingComp?`
        <div class="card" style="text-align:center;padding:48px;color:var(--txt3);font-size:13px">Hacé click en "↺ Actualizar" para importar comprobantes de ARCA</div>
      `:`
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:12px">
          ${comprobantes.map((c,i)=>`
            <div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:${i<comprobantes.length-1?'0.5px solid var(--border)':'none'};font-size:12px">
              <span class="pill pill-purple" style="font-size:9.5px">${CBTE_LABELS[c.tipoComprobante]||'C'+c.tipoComprobante}</span>
              <div style="flex:1">
                <div style="font-weight:500;color:var(--txt)">${c.razonSocialEmisor}</div>
                <div style="font-size:10.5px;color:var(--txt2)">${c.fechaEmision}</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:600;color:var(--txt)">${fmt(c.importeTotal)}</div>
                <div style="font-size:10.5px;color:${c.ivaCalculado>0?'var(--green)':'var(--txt3)'}">${c.ivaCalculado>0?`IVA: ${fmt(c.ivaCalculado)}`:'Sin IVA crédito'}</div>
              </div>
            </div>`).join('')}
        </div>
        <div style="background:var(--green-d);border:0.5px solid rgba(46,192,138,.3);border-radius:10px;padding:10px 16px;display:flex;justify-content:space-between;font-size:13px">
          <span style="color:var(--green);font-weight:500">Total IVA crédito fiscal del período</span>
          <span style="color:var(--green);font-weight:600">${fmt(comprobantes.reduce((s,c)=>s+(c.ivaCalculado||0),0))}</span>
        </div>
      `}
    `:''}

    ${renderConfigModal()}
    ${renderPagoModal()}
    ${renderGastoModal()}
  `
}

function renderConfigModal() {
  if (!S.showConfigModal || !S.editConfig) return ''
  const cfg = S.editConfig
  const fields = [
    {l:'Régimen fiscal',k:'regimen',opts:[{v:'monotributo',l:'Monotributo'},{v:'responsable_inscripto',l:'Responsable Inscripto'}]},
    {l:'Provincia IIBB',k:'provincia',opts:Object.entries(PROVINCIAS).map(([k,v])=>({v:k,l:v}))},
    {l:'Actividad principal',k:'actividad',opts:Object.entries(ACTIVIDADES).map(([k,v])=>({v:k,l:v}))},
    {l:'Modalidad IIBB',k:'modalidad_iibb',opts:[{v:'local',l:'Contribuyente local'},{v:'cm',l:'Convenio Multilateral'}]},
    ...(cfg.regimen==='monotributo'?[{l:'Categoría actual',k:'categoria_mono',opts:'ABCDEFGHIJK'.split('').map(c=>({v:c,l:`Categoría ${c}`}))}]:[]),
  ]
  return `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px">
      <div style="background:var(--surface);border:0.5px solid var(--border2);border-radius:16px;padding:28px;width:440px;max-height:90vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;margin-bottom:20px">
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:600;color:var(--txt)">Configuración fiscal</div>
            <div style="font-size:11px;color:var(--txt2);margin-top:2px">Se aplica a todos los cálculos de impuestos</div>
          </div>
          <button id="btn-close-cfg" style="background:none;border:none;color:var(--txt3);font-size:20px;cursor:pointer">×</button>
        </div>
        <div class="ff-form">
          ${fields.map(f=>`
            <div class="ff-field">
              <label class="ff-label">${f.l}</label>
              <select class="ff-select cfg-field" data-key="${f.k}">
                ${f.opts.map(o=>`<option value="${o.v}" ${cfg[f.k]===o.v?'selected':''}>${o.l}</option>`).join('')}
              </select>
            </div>`).join('')}
          <div style="display:flex;gap:10px;margin-top:4px">
            <button id="btn-cancel-cfg" class="ff-btn ff-btn-secondary" style="flex:1">Cancelar</button>
            <button id="btn-save-cfg" class="ff-btn ff-btn-primary" style="flex:2" ${S.savingConfig?'disabled':''}>
              ${S.savingConfig?'Guardando...':'Guardar configuración →'}
            </button>
          </div>
        </div>
      </div>
    </div>`
}

function renderPagoModal() {
  if (!S.showPagoModal) return ''
  return `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px">
      <div style="background:var(--surface);border:0.5px solid var(--border2);border-radius:16px;padding:28px;width:400px">
        <div style="display:flex;justify-content:space-between;margin-bottom:20px">
          <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:600;color:var(--txt)">Registrar pago</div>
          <button id="btn-close-pago" style="background:none;border:none;color:var(--txt3);font-size:20px;cursor:pointer">×</button>
        </div>
        <div class="ff-form">
          <div class="ff-field"><label class="ff-label">Período</label>
            <input class="ff-input" type="month" id="pago-periodo" value="${S.newPago.periodo}"/>
          </div>
          <div class="ff-field"><label class="ff-label">Concepto</label>
            <select class="ff-select" id="pago-concepto">
              ${[['monotributo','Monotributo'],['iibb','IIBB'],['iva','IVA'],['autonomos','Autónomos'],['ganancias','Ganancias'],['otro','Otro']].map(([v,l])=>`<option value="${v}" ${S.newPago.concepto===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="ff-field"><label class="ff-label">Monto</label>
            <input class="ff-input" type="number" id="pago-monto" value="${S.newPago.monto}" placeholder="0.00" style="font-family:'DM Mono',monospace"/>
          </div>
          <div style="display:flex;gap:10px;margin-top:4px">
            <button id="btn-cancel-pago" class="ff-btn ff-btn-secondary" style="flex:1">Cancelar</button>
            <button id="btn-confirm-pago" class="ff-btn ff-btn-primary" style="flex:2" ${!S.newPago.monto?'disabled':''}>Registrar →</button>
          </div>
        </div>
      </div>
    </div>`
}

function renderGastoModal() {
  if (!S.showGastoModal) return ''
  const g = S.newGasto
  return `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px">
      <div style="background:var(--surface);border:0.5px solid var(--border2);border-radius:16px;padding:28px;width:400px">
        <div style="display:flex;justify-content:space-between;margin-bottom:20px">
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:600;color:var(--txt)">Agregar compra manual</div>
            <div style="font-size:11px;color:var(--txt2);margin-top:2px">Para calcular IVA crédito fiscal</div>
          </div>
          <button id="btn-close-gasto" style="background:none;border:none;color:var(--txt3);font-size:20px;cursor:pointer">×</button>
        </div>
        <div class="ff-form">
          <div class="ff-field"><label class="ff-label">Proveedor</label>
            <input class="ff-input" id="gasto-prov" value="${g.proveedor}" placeholder="Nombre del proveedor"/>
          </div>
          <div class="ff-field"><label class="ff-label">Descripción</label>
            <input class="ff-input" id="gasto-desc" value="${g.descripcion}" placeholder="Servicio de hosting, etc."/>
          </div>
          <div class="ff-field"><label class="ff-label">Monto total (con IVA)</label>
            <input class="ff-input" id="gasto-monto" type="number" value="${g.monto}" placeholder="0.00" style="font-family:'DM Mono',monospace"/>
          </div>
          <div class="ff-field"><label class="ff-label">IVA crédito fiscal <span style="font-size:10px;color:var(--txt3)">— auto-calculado</span></label>
            <input class="ff-input" id="gasto-iva" type="number" value="${g.iva}" placeholder="Auto-calculado" style="font-family:'DM Mono',monospace"/>
          </div>
          <div style="display:flex;gap:10px;margin-top:4px">
            <button id="btn-cancel-gasto" class="ff-btn ff-btn-secondary" style="flex:1">Cancelar</button>
            <button id="btn-confirm-gasto" class="ff-btn ff-btn-primary" style="flex:2" ${!g.monto||!g.proveedor?'disabled':''}>Agregar →</button>
          </div>
        </div>
      </div>
    </div>`
}

function bindEvents() {
  if (!rootEl) return

  // Tabs
  rootEl.querySelectorAll('.imp-tab').forEach(b => b.addEventListener('click', e => {
    S.activeTab = e.target.dataset.tab
    if (S.activeTab==='comprobantes'&&S.comprobantes.length===0) loadComprobantes()
    re()
  }))

  // Period change
  const per = rootEl.querySelector('#imp-periodo')
  if (per) per.addEventListener('change', e => { S.periodo = e.target.value; S.newPago.periodo = e.target.value; loadCalc() })

  // Config modal
  const btnCfg = rootEl.querySelector('#btn-config-modal')
  if (btnCfg) btnCfg.addEventListener('click', () => { S.editConfig = {...S.config}; S.showConfigModal = true; re() })

  // Close modals
  ;['#btn-close-cfg','#btn-cancel-cfg'].forEach(s => { const b = rootEl.querySelector(s); if (b) b.addEventListener('click', () => { S.showConfigModal=false; re() }) })
  ;['#btn-close-pago','#btn-cancel-pago'].forEach(s => { const b = rootEl.querySelector(s); if (b) b.addEventListener('click', () => { S.showPagoModal=false; re() }) })
  ;['#btn-close-gasto','#btn-cancel-gasto'].forEach(s => { const b = rootEl.querySelector(s); if (b) b.addEventListener('click', () => { S.showGastoModal=false; re() }) })

  // Open modals
  rootEl.querySelectorAll('#btn-pago-modal').forEach(b => b.addEventListener('click', () => { S.showPagoModal=true; re() }))
  const btnGasto = rootEl.querySelector('#btn-gasto-modal')
  if (btnGasto) btnGasto.addEventListener('click', () => { S.showGastoModal=true; re() })

  // Config fields live update
  rootEl.querySelectorAll('.cfg-field').forEach(s => s.addEventListener('change', e => {
    S.editConfig = { ...S.editConfig, [e.target.dataset.key]: e.target.value }
    if (e.target.dataset.key === 'regimen') re() // re-render to show/hide categoria
  }))

  // Save config
  const btnSaveCfg = rootEl.querySelector('#btn-save-cfg')
  if (btnSaveCfg) btnSaveCfg.addEventListener('click', saveConfig)

  // Pago modal fields
  const pagoP = rootEl.querySelector('#pago-periodo')
  if (pagoP) pagoP.addEventListener('change', e => { S.newPago = {...S.newPago, periodo:e.target.value} })
  const pagoC = rootEl.querySelector('#pago-concepto')
  if (pagoC) pagoC.addEventListener('change', e => { S.newPago = {...S.newPago, concepto:e.target.value} })
  const pagoM = rootEl.querySelector('#pago-monto')
  if (pagoM) pagoM.addEventListener('input', e => { S.newPago = {...S.newPago, monto:e.target.value}; re() })

  // Confirm pago
  const btnConfPago = rootEl.querySelector('#btn-confirm-pago')
  if (btnConfPago) btnConfPago.addEventListener('click', registrarPago)

  // Gasto fields with auto-IVA
  const gastoMonto = rootEl.querySelector('#gasto-monto')
  if (gastoMonto) gastoMonto.addEventListener('input', e => {
    const v = parseFloat(e.target.value)||0
    S.newGasto = {...S.newGasto, monto:e.target.value, iva:String(Math.round(v/1.21*0.21))}
    const ivaEl = rootEl.querySelector('#gasto-iva')
    if (ivaEl) ivaEl.value = S.newGasto.iva
    re()
  })
  const gastoP = rootEl.querySelector('#gasto-prov')
  if (gastoP) gastoP.addEventListener('input', e => { S.newGasto = {...S.newGasto, proveedor:e.target.value}; re() })
  const gastoD = rootEl.querySelector('#gasto-desc')
  if (gastoD) gastoD.addEventListener('input', e => { S.newGasto = {...S.newGasto, descripcion:e.target.value} })
  const gastoIva = rootEl.querySelector('#gasto-iva')
  if (gastoIva) gastoIva.addEventListener('input', e => { S.newGasto = {...S.newGasto, iva:e.target.value} })

  // Confirm gasto
  const btnConfGasto = rootEl.querySelector('#btn-confirm-gasto')
  if (btnConfGasto) btnConfGasto.addEventListener('click', agregarGasto)

  // Sliders
  const slExtra = rootEl.querySelector('#sim-extra')
  if (slExtra) slExtra.addEventListener('input', e => { S.simExtra = parseInt(e.target.value); const o = rootEl.querySelector('#sim-extra-out'); if(o) o.textContent=fmt(S.simExtra); re() })
  const slMeses = rootEl.querySelector('#sim-meses')
  if (slMeses) slMeses.addEventListener('input', e => { S.simMeses = parseInt(e.target.value); const o = rootEl.querySelector('#sim-meses-out'); if(o) o.textContent=S.simMeses+' meses'; re() })

  // Mark pagado
  rootEl.querySelectorAll('.mark-pagado').forEach(b => b.addEventListener('click', e => marcarPagado(e.target.dataset.id, true)))

  // Load comprobantes
  const btnComp = rootEl.querySelector('#btn-load-comp')
  if (btnComp) btnComp.addEventListener('click', loadComprobantes)
}

export function renderFFImpuestos(el) {
  rootEl = el
  S.activeTab = 'resumen'
  S.comprobantes = []
  re()
  loadAll()
}
