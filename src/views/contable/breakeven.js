import Chart from 'chart.js/auto'
import { fmtM } from '../../utils.js'

const SC=[
  {label:'Situación actual',     ventas:10.7,cmv:84.5,sueldos:1.02,alquiler:1.0,otros:0.55},
  {label:'Negociación exitosa',  ventas:10.7,cmv:78.0,sueldos:1.02,alquiler:1.0,otros:0.48},
  {label:'Crecimiento moderado', ventas:13.9,cmv:80.0,sueldos:1.1, alquiler:1.0,otros:0.55},
  {label:'Meta rentable',        ventas:12.8,cmv:72.0,sueldos:1.02,alquiler:1.0,otros:0.50},
]
let wC=null,bC=null

function calc(v){
  const cmv=v.ventas*v.cmv/100,mb=v.ventas-cmv,fixed=v.sueldos+v.alquiler+v.otros,mn=mb-fixed
  return{cmv,mb,mn,fixed,cmvPe:(1-fixed/v.ventas)*100,ventasPe:fixed/(1-v.cmv/100),mbPct:mb/v.ventas*100,mnPct:mn/v.ventas*100}
}

function gv(){
  return{ventas:+document.getElementById('be-v').value,cmv:+document.getElementById('be-c').value,sueldos:+document.getElementById('be-s').value,alquiler:+document.getElementById('be-a').value,otros:+document.getElementById('be-o').value}
}

function drawCharts(v,r){
  const gc='rgba(255,255,255,0.06)',tc='#aaa'
  const wfV=[v.ventas,-(v.ventas*v.cmv/100),r.mb,-v.sueldos,-v.alquiler,-v.otros,r.mn]
  const wfC=wfV.map((val,i)=>i===0?'#4f8ef7':(i===2||i===6)?val>=0?'#2ec08a':'#f05a5a':'#f05a5a60')
  if(wC)wC.destroy()
  wC=new Chart(document.getElementById('be-wf'),{type:'bar',data:{labels:['Ventas','CMV','Mg. bruto','Sueldos','Alquiler','Otros','Neto'],datasets:[{data:wfV.map(Math.abs),backgroundColor:wfC}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>fmtM(wfV[ctx.dataIndex])}}},scales:{x:{ticks:{color:tc,font:{size:9}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10},callback:fmtM},grid:{color:gc}}}}})
  const cr=[],mn=[]
  for(let c=55;c<=100;c+=0.5){cr.push(c);mn.push(Math.round((v.ventas*(1-c/100)-r.fixed)*100)/100)}
  if(bC)bC.destroy()
  bC=new Chart(document.getElementById('be-cu'),{type:'line',data:{labels:cr.map(c=>c.toFixed(1)+'%'),datasets:[
    {data:mn,borderColor:'#4f8ef7',backgroundColor:'rgba(79,142,247,0.08)',fill:true,tension:0.3,pointRadius:0,borderWidth:2},
    {data:cr.map(()=>0),borderColor:'#f05a5a',borderDash:[4,3],pointRadius:0,borderWidth:1.5,fill:false},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.datasetIndex===0?'Neto: '+fmtM(ctx.parsed.y):''}}},scales:{x:{ticks:{color:tc,font:{size:9},maxTicksLimit:10},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10},callback:fmtM},grid:{color:gc}}}}})
}

function update(){
  const v=gv(),r=calc(v)
  const p=r.mn>=0
  document.getElementById('out-v').textContent='$'+v.ventas.toFixed(1)+'M'
  document.getElementById('out-c').textContent=v.cmv.toFixed(1)+'%'
  document.getElementById('out-s').textContent='$'+v.sueldos.toFixed(2)+'M'
  document.getElementById('out-a').textContent='$'+v.alquiler.toFixed(1)+'M'
  document.getElementById('out-o').textContent='$'+v.otros.toFixed(2)+'M'
  document.getElementById('be-mb').textContent=fmtM(r.mb)
  document.getElementById('be-mb').style.color=r.mb>=0?'var(--green)':'var(--red)'
  document.getElementById('be-mn').textContent=fmtM(r.mn)
  document.getElementById('be-mn').style.color=p?'var(--green)':'var(--red)'
  document.getElementById('be-fx').textContent=fmtM(r.fixed)
  document.getElementById('be-cp').textContent=r.cmvPe.toFixed(1)+'%'
  document.getElementById('be-vp').textContent=fmtM(r.ventasPe)
  document.getElementById('be-an').textContent=fmtM(r.mn*12)
  document.getElementById('be-an').style.color=p?'var(--green)':'var(--red)'
  document.getElementById('be-st').textContent=p?'Rentable':'Pérdida'
  document.getElementById('be-st').className='card-badge '+(p?'pill-green':'pill-red')
  const gap=v.cmv-r.cmvPe,d=document.getElementById('be-diag')
  d.className='diagnosis '+(p?'profit':'loss')
  d.innerHTML=p
    ?`Ganancia neta de <strong style="color:var(--green)">${fmtM(r.mn*1e6)}</strong>/mes (${r.mnPct.toFixed(1)}%). Mantener CMV ≤ <strong>${r.cmvPe.toFixed(1)}%</strong> para sostenibilidad.`
    :`Pérdida de <strong style="color:var(--red)">${fmtM(Math.abs(r.mn*1e6))}</strong>/mes. Para equilibrio: bajar CMV <strong>${gap.toFixed(1)} puntos</strong> (${v.cmv.toFixed(1)}% → ${r.cmvPe.toFixed(1)}%) o subir ventas a <strong>${fmtM(r.ventasPe*1e6)}</strong>/mes.`
  drawCharts(v,r)
}

function applyS(i){
  const s=SC[i]
  document.getElementById('be-v').value=s.ventas
  document.getElementById('be-c').value=s.cmv
  document.getElementById('be-s').value=s.sueldos
  document.getElementById('be-a').value=s.alquiler
  document.getElementById('be-o').value=s.otros
  document.querySelectorAll('.sc-chip').forEach((c,j)=>c.classList.toggle('active',j===i))
  update()
}

export function renderBreakeven(el){
  el.innerHTML=`
    <div class="scenario-row" id="sc-row">
      ${SC.map((s,i)=>`<button class="sc-chip${i===0?' active':''}" data-sc="${i}">${s.label}</button>`).join('')}
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Parámetros del modelo</span></div>
      ${[['be-v','out-v','Ventas mensuales ($M)',5,40,0.5,10.7],['be-c','out-c','CMV (% sobre ventas)',55,100,0.5,84.5],['be-s','out-s','Sueldos mensuales ($M)',0.5,5,0.05,1.02],['be-a','out-a','Alquiler mensual ($M)',0.3,3,0.1,1.0],['be-o','out-o','Otros gastos fijos ($M)',0.1,2,0.05,0.55]].map(([id,oid,lbl,mn,mx,st,val])=>`<div class="slider-row"><span class="slider-label">${lbl}</span><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}" value="${val}"><span class="slider-val" id="${oid}">—</span></div>`).join('')}
    </div>
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Margen bruto</div><div class="kpi-value" id="be-mb">—</div></div>
      <div class="kpi-card"><div class="kpi-label">Gastos fijos</div><div class="kpi-value" id="be-fx">—</div></div>
      <div class="kpi-card"><div class="kpi-label">Resultado neto &nbsp;<span id="be-st" class="pill pill-red" style="font-size:10px;vertical-align:middle"></span></div><div class="kpi-value" id="be-mn">—</div></div>
      <div class="kpi-card"><div class="kpi-label">CMV máx. p/equilibrio</div><div class="kpi-value" style="color:var(--blue)" id="be-cp">—</div></div>
      <div class="kpi-card"><div class="kpi-label">Ventas mín. p/equilibrio</div><div class="kpi-value" style="color:var(--blue)" id="be-vp">—</div></div>
      <div class="kpi-card"><div class="kpi-label">Proyección anual</div><div class="kpi-value" id="be-an">—</div></div>
    </div>
    <div id="be-diag" class="diagnosis loss"></div>
    <div class="grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-header"><span class="card-title">Waterfall — dónde va cada peso</span></div>
        <div class="chart-wrap h240"><canvas id="be-wf"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Break-even curve — CMV vs neto</span></div>
        <div class="chart-wrap h240"><canvas id="be-cu"></canvas></div>
        <div class="legend">
          <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Margen neto</div>
          <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>Punto cero</div>
        </div>
      </div>
    </div>`
  document.getElementById('sc-row').addEventListener('click',e=>{const s=e.target.dataset.sc;if(s!==undefined)applyS(+s)})
  ;['be-v','be-c','be-s','be-a','be-o'].forEach(id=>{
    document.getElementById(id).addEventListener('input',()=>{document.querySelectorAll('.sc-chip').forEach(c=>c.classList.remove('active'));update()})
  })
  update()
}
