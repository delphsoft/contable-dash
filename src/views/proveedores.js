import Chart from 'chart.js/auto'
import { PROVEEDORES,GRAND_TOTAL_PROV } from '../data/data.js'
import { fmtM } from '../utils.js'

const CC={Embutidos:'#4f8ef7',Delicatessen:'#f05a5a',Bebidas:'#2ec08a',Quesos:'#f0a050',Snack:'#9b82f7',Encurtidos:'#5DCAA5'}

export function renderProveedores(el) {
  const gc='rgba(255,255,255,0.05)',tc='#666'
  const rows=PROVEEDORES.map((p,i)=>{
    const pct=(p.total/GRAND_TOTAL_PROV*100)
    const [rl,rc]=pct>=20?['Crítico','badge-red']:pct>=10?['Alto','badge-amber']:pct>=5?['Medio','badge-blue']:['Bajo','badge-green']
    return`<div class="prov-row">
      <span class="prov-rank">${String(i+1).padStart(2,'0')}</span>
      <span class="prov-name">${p.name}</span>
      <span class="prov-cat">${p.cat}</span>
      <span class="prov-bar-wrap"><span class="prov-bar" style="width:${Math.round(pct/31*100)}%;background:${CC[p.cat]||'#4f8ef7'}"></span></span>
      <span class="prov-amt">${pct.toFixed(1)}%</span>
      <span class="prov-amt">${fmtM(p.total)}</span>
      <span class="card-badge ${rc}">${rl}</span>
    </div>`
  }).join('')
  el.innerHTML=`
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Total pagado</div><div class="kpi-value">${fmtM(GRAND_TOTAL_PROV)}</div><div class="kpi-delta delta-flat">6 meses · 18 proveedores</div></div>
      <div class="kpi-card"><div class="kpi-label">Concentración top 3</div><div class="kpi-value" style="color:var(--red)">58.3%</div><div class="kpi-delta delta-down">▼ Riesgo crítico</div></div>
      <div class="kpi-card"><div class="kpi-label">Categoría líder</div><div class="kpi-value">Embutidos</div><div class="kpi-delta delta-flat">54% del CMV</div></div>
      <div class="kpi-card"><div class="kpi-label">Proveedor #1</div><div class="kpi-value">Rozzi</div><div class="kpi-delta delta-down">▼ $21.3M · 30.7%</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">Top 8 proveedores</span></div>
        <div class="chart-wrap" style="height:${8*40+80}px"><canvas id="pv1"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Curva de Pareto</span></div>
        <div class="chart-wrap h300"><canvas id="pv2"></canvas></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Todos los proveedores — mapa de riesgo</span><span class="card-badge badge-blue">${PROVEEDORES.length} activos</span></div>
      ${rows}
    </div>`
  const top8=PROVEEDORES.slice(0,8)
  new Chart(document.getElementById('pv1'),{type:'bar',indexAxis:'y',data:{labels:top8.map(p=>p.name.split(' ').slice(0,2).join(' ')),datasets:[{data:top8.map(p=>p.total),backgroundColor:top8.map(p=>CC[p.cat]||'#4f8ef7')}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:tc,font:{size:10},callback:fmtM},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10}},grid:{color:gc}}}}})
  let cum=0
  const cumPcts=PROVEEDORES.map(p=>{cum+=p.total/GRAND_TOTAL_PROV*100;return Math.round(cum*10)/10})
  new Chart(document.getElementById('pv2'),{type:'bar',data:{labels:PROVEEDORES.map((_,i)=>`#${i+1}`),datasets:[
    {type:'bar',data:PROVEEDORES.map(p=>+(p.total/GRAND_TOTAL_PROV*100).toFixed(1)),backgroundColor:'#4f8ef740',order:2},
    {type:'line',data:cumPcts,borderColor:'#4f8ef7',backgroundColor:'transparent',pointRadius:2,borderWidth:2,yAxisID:'y2',order:1},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:tc,font:{size:9}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10},callback:v=>v+'%'},grid:{color:gc}},y2:{position:'right',ticks:{color:'#4f8ef7',font:{size:10},callback:v=>v+'%'},grid:{display:false},max:100}}}})
}
