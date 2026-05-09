import Chart from 'chart.js/auto'
import {
  MONTHS, VENTAS, CMV, MB, MN, MB_PCT, MN_PCT,
  SUELDOS, ALQUILER, COM_MP, MONOTRIB, OTROS_G,
  CAT_DATA, CANAL, PROVEEDORES, GRAND_TOTAL_PROV
} from '../../data/data.js'
import { fmtM, fmtPct, sum } from '../../utils.js'

const CORRECT_PIN = '2025'

const BUSINESS_CONTEXT = `
Sos un asesor contable y estratégico experto para una empresa de venta de delicatessen y embutidos en Argentina.
Tenés acceso completo a los datos reales del negocio para el período oct-2025 a feb-2026.

=== DATOS REALES DEL NEGOCIO ===
VENTAS: Oct-25: $1.95M | Nov-25: $10.5M | Dic-25: $22.9M | Ene-26: $9.9M | Feb-26: $8.2M
Total: $53.5M | CMV promedio: 84.5% (CRÍTICO - óptimo ≤70%)
MARGEN NETO ACUMULADO: -$9.4M (-17.6%) — solo diciembre fue rentable (+$6.3M)
GASTOS FIJOS: Alquiler $1M/mes · Sueldos ~$1M/mes · Com. MP 3.8% · Monotributo al 92% del tope
TOP PROVEEDORES: Rozzi $21.3M (30.7%) · Las Dinas $11.1M · Pampa Líder $7.1M · Top 3 = 58.3%
CATEGORÍAS CMV: Embutidos 54% · Delicatessen 21% · Bebidas 11% · Quesos 8%
PUNTO DE EQUILIBRIO: necesita CMV ≤60% o ventas ≥$16.5M/mes
Cada 1% de descuento con proveedores = ~$692K de ahorro anual

Respondé siempre en español argentino natural. Sé directo, concreto y accionable con números específicos.
`

const QUICK_PROMPTS = [
  { label: '¿Cómo bajo el CMV?',         text: 'Dame un plan concreto para bajar el CMV del 84.5% al 72% en 90 días.' },
  { label: 'Negociación proveedores',     text: 'Dame un guión de negociación con Las Dinas y Pampa Líder para conseguir 5% de descuento.' },
  { label: 'Estrategia diciembre',        text: '¿Cómo capitalizo mejor el pico de ventas de diciembre? ¿Qué preparar desde septiembre?' },
  { label: 'Riesgo monotributo',          text: '¿Qué pasa si supero el tope del monotributo? ¿Qué opciones tengo antes de llegar al límite?' },
  { label: 'Diversificar proveedores',    text: '¿Cómo diversifico proveedores de embutidos para bajar el riesgo del 58% de concentración?' },
  { label: 'Plan rentabilidad 2026',      text: 'Armame un plan de rentabilidad para 2026 basado en los datos reales del negocio.' },
]

let conversationHistory = []
let isLoading = false
let adminCharts = []

export function renderSuperAdmin(el) {
  const stored = sessionStorage.getItem('sa_auth')
  if (stored !== 'ok') {
    renderPIN(el)
  } else {
    renderDashboard(el)
  }
}

function renderPIN(el) {
  el.innerHTML = `
    <div style="max-width:360px;margin:60px auto">
      <div class="card" style="text-align:center">
        <div style="width:52px;height:52px;border-radius:14px;background:var(--purple-d);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:22px">🔐</div>
        <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:600;color:var(--txt);margin-bottom:6px">Super Admin</div>
        <div style="font-size:12px;color:var(--txt2);margin-bottom:24px">Ingresá el PIN para acceder al panel estratégico</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <input class="ff-input" id="pin-input" type="password" maxlength="8"
            placeholder="PIN de acceso" style="text-align:center;font-size:18px;letter-spacing:6px;font-family:'DM Mono',monospace"
          />
          <button class="ff-btn ff-btn-primary" id="pin-btn" style="width:100%">Ingresar</button>
          <div id="pin-error" style="display:none;font-size:12px;color:var(--red)">PIN incorrecto. Intentá de nuevo.</div>
        </div>
      </div>
    </div>
  `
  const input = document.getElementById('pin-input')
  const btn = document.getElementById('pin-btn')
  const err = document.getElementById('pin-error')

  function tryPin() {
    if (input.value === CORRECT_PIN) {
      sessionStorage.setItem('sa_auth','ok')
      renderDashboard(el)
    } else {
      err.style.display = 'block'
      input.value = ''
      input.focus()
      setTimeout(()=>err.style.display='none', 2000)
    }
  }
  btn.addEventListener('click', tryPin)
  input.addEventListener('keydown', e => { if(e.key==='Enter') tryPin() })
  setTimeout(()=>input.focus(), 100)
}

function renderDashboard(el) {
  adminCharts.forEach(c => { try { c.destroy() } catch(e){} })
  adminCharts = []

  const gc='rgba(255,255,255,0.05)', tc='#666'

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="padding:4px 12px;border-radius:20px;background:var(--purple-d);color:var(--purple);font-size:11px;font-family:'DM Mono',monospace;font-weight:500">SUPER ADMIN</div>
        <div style="font-size:12px;color:var(--txt2)">Panel estratégico — datos completos</div>
      </div>
      <button id="sa-logout" style="background:none;border:0.5px solid var(--border2);border-radius:8px;padding:5px 12px;color:var(--txt2);font-size:11.5px;cursor:pointer;font-family:'Inter',sans-serif">Cerrar sesión</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">

      <!-- LEFT: Full analytics -->
      <div style="display:flex;flex-direction:column;gap:14px">

        <div class="card" style="margin-bottom:0">
          <div class="card-header">
            <span class="card-title">Análisis completo — ventas vs CMV vs gastos</span>
            <span class="pill pill-purple">estratégico</span>
          </div>
          <div class="chart-wrap h220"><canvas id="sa-bar"></canvas></div>
          <div class="legend">
            <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Ventas</div>
            <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>CMV</div>
            <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Mg. bruto</div>
            <div class="legend-item"><div class="legend-dot" style="background:#f0a050"></div>Resultado neto</div>
          </div>
        </div>

        <div class="grid-2" style="margin-bottom:0">
          <div class="card" style="margin-bottom:0">
            <div class="card-header"><span class="card-title">CMV por categoría</span></div>
            <div class="chart-wrap h160"><canvas id="sa-cat"></canvas></div>
            <div class="legend">
              <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Embutidos</div>
              <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>Delicatessen</div>
              <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Bebidas</div>
            </div>
          </div>
          <div class="card" style="margin-bottom:0">
            <div class="card-header"><span class="card-title">Curva Pareto — proveedores</span></div>
            <div class="chart-wrap h160"><canvas id="sa-pareto"></canvas></div>
          </div>
        </div>

        <div class="card" style="margin-bottom:0">
          <div class="card-header"><span class="card-title">Márgenes % mensuales</span></div>
          <div class="chart-wrap h160"><canvas id="sa-mg"></canvas></div>
          <div class="legend">
            <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Bruto%</div>
            <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>Neto%</div>
          </div>
        </div>

        <!-- Proveedor table -->
        <div class="card" style="margin-bottom:0">
          <div class="card-header">
            <span class="card-title">Mapa de riesgo proveedores</span>
            <span class="pill pill-red">58% top 3</span>
          </div>
          <div style="overflow-y:auto;max-height:200px">
            ${PROVEEDORES.map((p,i)=>{
              const pct=(p.total/GRAND_TOTAL_PROV*100)
              const [rl,rc]=pct>=20?['Crítico','pill-red']:pct>=10?['Alto','pill-amber']:pct>=5?['Medio','pill-blue']:['Bajo','pill-green']
              return`<div class="prov-row">
                <span class="prov-rank">${String(i+1).padStart(2,'0')}</span>
                <span class="prov-name">${p.name}</span>
                <span class="prov-cat">${p.cat}</span>
                <span class="prov-bar-wrap"><span class="prov-bar" style="width:${Math.round(pct/31*100)}%;background:#4f8ef7"></span></span>
                <span class="prov-amt">${pct.toFixed(1)}%</span>
                <span class="prov-amt">${fmtM(p.total)}</span>
                <span class="card-badge ${rc}" style="font-size:9px">${rl}</span>
              </div>`
            }).join('')}
          </div>
        </div>
      </div>

      <!-- RIGHT: AI Agent -->
      <div class="ag-chat-panel" style="height:calc(100vh - 200px);min-height:600px">
        <div class="ag-header">
          <div class="ag-avatar-lg">C</div>
          <div>
            <div class="ag-name">Asesor Estratégico IA</div>
            <div class="ag-status"><span class="ag-online"></span>Super Admin · contexto completo</div>
          </div>
        </div>
        <div class="ag-chat" id="sa-messages" class="ag-messages">
          <div class="ag-msg ag-bot">
            <div class="ag-avatar">C</div>
            <div class="ag-bubble ag-bubble-bot">
              <p>Panel estratégico activo. Tenés acceso completo a todos los datos del negocio — ventas, CMV, proveedores, márgenes y concentración.</p>
              <p>Puedo ayudarte a diseñar estrategias de pricing, negociación con proveedores, planificación de compras para diciembre o análisis de escenarios de rentabilidad.</p>
              <p>¿Por dónde arrancamos?</p>
            </div>
          </div>
        </div>
        <div class="ag-input-area">
          <div class="ag-quick-row" id="sa-quick"></div>
          <div class="ag-input-row">
            <textarea id="sa-input" class="ag-textarea" placeholder="Diseñá estrategias, analizá escenarios, pedí recomendaciones..." rows="1"></textarea>
            <button id="sa-send" class="ag-send-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2L2 7l5 2 2 5 5-12Z" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  document.getElementById('sa-logout').addEventListener('click', () => {
    sessionStorage.removeItem('sa_auth')
    conversationHistory = []
    renderPIN(el)
  })

  // Charts
  const c1 = new Chart(document.getElementById('sa-bar'),{
    type:'bar',
    data:{labels:MONTHS,datasets:[
      {label:'Ventas',data:VENTAS,backgroundColor:'#4f8ef7'},
      {label:'CMV',data:CMV,backgroundColor:'#f05a5a80'},
      {label:'Mg. bruto',data:MB,backgroundColor:'#2ec08a80'},
      {label:'Neto',data:MN,backgroundColor:MN.map(v=>v>=0?'#2ec08a':'#f05a5a50'),type:'line',borderColor:'#f0a050',tension:0.3,pointRadius:3,borderWidth:2,fill:false},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:tc,font:{size:9}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:9},callback:fmtM},grid:{color:gc}}}}
  })
  adminCharts.push(c1)

  const catAmounts = [
    sum(CAT_DATA.embutidos), sum(CAT_DATA.delicatessen), sum(CAT_DATA.bebidas),
    sum(CAT_DATA.quesos), sum(CAT_DATA.snack), sum(CAT_DATA.encurtidos)
  ]
  const c2 = new Chart(document.getElementById('sa-cat'),{
    type:'doughnut',
    data:{labels:['Embutidos','Delicatessen','Bebidas','Quesos','Snack','Encurtidos'],
      datasets:[{data:catAmounts,backgroundColor:['#4f8ef7','#f05a5a','#2ec08a','#f0a050','#9b82f7','#5DCAA5'],borderWidth:0,hoverOffset:4}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'55%'}
  })
  adminCharts.push(c2)

  let cum=0
  const cumPcts=PROVEEDORES.map(p=>{cum+=p.total/GRAND_TOTAL_PROV*100;return Math.round(cum*10)/10})
  const c3 = new Chart(document.getElementById('sa-pareto'),{
    type:'bar',
    data:{labels:PROVEEDORES.map((_,i)=>`#${i+1}`),datasets:[
      {type:'bar',data:PROVEEDORES.map(p=>+(p.total/GRAND_TOTAL_PROV*100).toFixed(1)),backgroundColor:'#4f8ef740',order:2},
      {type:'line',data:cumPcts,borderColor:'#4f8ef7',backgroundColor:'transparent',pointRadius:0,borderWidth:2,yAxisID:'y2',order:1},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{ticks:{color:tc,font:{size:8}},grid:{color:gc}},
      y:{ticks:{color:tc,font:{size:8},callback:v=>v+'%'},grid:{color:gc}},
      y2:{position:'right',ticks:{color:'#4f8ef7',font:{size:8},callback:v=>v+'%'},grid:{display:false},max:100}
    }}
  })
  adminCharts.push(c3)

  const c4 = new Chart(document.getElementById('sa-mg'),{
    type:'line',
    data:{labels:MONTHS,datasets:[
      {label:'Bruto%',data:MB_PCT,borderColor:'#2ec08a',tension:0.35,pointRadius:3,fill:false,borderWidth:2},
      {label:'Neto%', data:MN_PCT,borderColor:'#f05a5a',tension:0.35,pointRadius:3,fill:false,borderWidth:2,borderDash:[4,3]},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:tc,font:{size:9}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:9},callback:v=>v+'%'},grid:{color:gc}}}}
  })
  adminCharts.push(c4)

  // Agent
  const qRow = document.getElementById('sa-quick')
  QUICK_PROMPTS.forEach(q => {
    const btn = document.createElement('button')
    btn.className = 'ag-quick-btn'
    btn.textContent = q.label
    btn.addEventListener('click', () => {
      document.getElementById('sa-input').value = q.text
      handleSend()
    })
    qRow.appendChild(btn)
  })

  function handleSend() {
    const inp = document.getElementById('sa-input')
    const msg = inp.value.trim()
    if (!msg || isLoading) return
    inp.value = ''
    inp.style.height = 'auto'
    sendMessage(msg)
  }

  document.getElementById('sa-send').addEventListener('click', handleSend)
  document.getElementById('sa-input').addEventListener('keydown', e => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  })
  document.getElementById('sa-input').addEventListener('input', function() {
    this.style.height='auto'
    this.style.height=Math.min(this.scrollHeight,120)+'px'
  })

  renderMessages()
}

async function sendMessage(msg) {
  if (isLoading) return
  isLoading = true
  conversationHistory.push({role:'user',content:msg})
  renderMessages()
  setLoading(true)
  try {
    const resp = await fetch('/api/chat',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({model:'claude-sonnet-4-5',max_tokens:1024,system:BUSINESS_CONTEXT,messages:conversationHistory})
    })
    const data = await resp.json()
    if (!resp.ok) {
      conversationHistory.push({role:'assistant',content:`⚠️ ${data?.error||'Error '+resp.status}`})
    } else {
      conversationHistory.push({role:'assistant',content:data.content?.[0]?.text||'Sin respuesta'})
    }
  } catch(e) {
    conversationHistory.push({role:'assistant',content:`⚠️ Error de red: ${e.message}`})
  }
  isLoading=false
  setLoading(false)
  renderMessages()
}

function setLoading(on) {
  const btn=document.getElementById('sa-send')
  const inp=document.getElementById('sa-input')
  const typing=document.getElementById('sa-typing')
  if(btn) btn.disabled=on
  if(inp) inp.disabled=on
  if(typing) typing.style.display=on?'flex':'none'
  const chat=document.getElementById('sa-chat')
  if(chat) chat.scrollTop=chat.scrollHeight
}

function renderMessages() {
  const chat=document.getElementById('sa-chat')
  if(!chat) return
  const msgs=conversationHistory.map(m=>{
    if(m.role==='user') {
      return`<div class="ag-msg ag-user"><div class="ag-bubble ag-bubble-user">${esc(m.content)}</div></div>`
    }
    return`<div class="ag-msg ag-bot"><div class="ag-avatar">C</div><div class="ag-bubble ag-bubble-bot">${fmt(m.content)}</div></div>`
  }).join('')
  chat.innerHTML=msgs+`<div id="sa-typing" class="ag-msg ag-bot" style="display:none">
    <div class="ag-avatar">C</div>
    <div class="ag-bubble ag-bubble-bot ag-typing-bubble">
      <span class="ag-dot"></span><span class="ag-dot"></span><span class="ag-dot"></span>
    </div>
  </div>`
  chat.scrollTop=chat.scrollHeight
}

function fmt(t){
  return esc(t)
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/\n/g,'<br>')
    .replace(/^/,'<p>').replace(/$/,'</p>')
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
