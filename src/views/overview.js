import Chart from 'chart.js/auto'
import { MONTHS,VENTAS,CMV,MB,MN,MB_PCT,MN_PCT } from '../data/data.js'
import { fmtM,fmtPct,sum } from '../utils.js'

export function renderOverview(el) {
  const tV=sum(VENTAS),tC=sum(CMV),tB=sum(MB),tN=sum(MN)
  const gc='rgba(255,255,255,0.05)',tc='#666'
  el.innerHTML=`
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Ventas acumuladas</div><div class="kpi-value">${fmtM(tV)}</div><div class="kpi-delta delta-flat">5 meses registrados</div></div>
      <div class="kpi-card"><div class="kpi-label">CMV acumulado</div><div class="kpi-value">${fmtM(tC)}</div><div class="kpi-delta delta-down">▼ ${fmtPct(tC/tV*100)} de ventas</div></div>
      <div class="kpi-card"><div class="kpi-label">Margen bruto</div><div class="kpi-value" style="color:var(--green)">${fmtM(tB)}</div><div class="kpi-delta delta-up">▲ ${fmtPct(tB/tV*100)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Margen neto</div><div class="kpi-value" style="color:var(--red)">${fmtM(tN)}</div><div class="kpi-delta delta-down">▼ ${fmtPct(tN/tV*100)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Sueldos acumulados</div><div class="kpi-value">${fmtM(5091800)}</div><div class="kpi-delta delta-flat">9.5% de ventas</div></div>
      <div class="kpi-card"><div class="kpi-label">Mejor mes</div><div class="kpi-value" style="color:var(--green)">Dic-25</div><div class="kpi-delta delta-up">▲ ${fmtM(6348492)} neto</div></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Ventas vs CMV vs Margen bruto</span><span class="card-badge badge-blue">5 meses</span></div>
      <div class="chart-wrap h260"><canvas id="ov1"></canvas></div>
      <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Ventas</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>CMV</div>
        <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Margen bruto</div>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">Resultado neto mensual</span></div>
        <div class="chart-wrap h200"><canvas id="ov2"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Márgenes % — bruto vs neto</span></div>
        <div class="chart-wrap h200"><canvas id="ov3"></canvas></div>
        <div class="legend">
          <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Bruto%</div>
          <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>Neto%</div>
        </div>
      </div>
    </div>`
  new Chart(document.getElementById('ov1'),{type:'bar',data:{labels:MONTHS,datasets:[
    {label:'Ventas',data:VENTAS,backgroundColor:'#4f8ef7'},
    {label:'CMV',data:CMV,backgroundColor:'#f05a5a'},
    {label:'Margen bruto',data:MB,backgroundColor:'#2ec08a'},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10},callback:fmtM},grid:{color:gc}}}}})
  new Chart(document.getElementById('ov2'),{type:'bar',data:{labels:MONTHS,datasets:[{data:MN,backgroundColor:MN.map(v=>v>=0?'#2ec08a':'#f05a5a')}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10},callback:fmtM},grid:{color:gc}}}}})
  new Chart(document.getElementById('ov3'),{type:'line',data:{labels:MONTHS,datasets:[
    {data:MB_PCT,borderColor:'#2ec08a',tension:0.35,pointRadius:3,fill:false,borderWidth:2},
    {data:MN_PCT,borderColor:'#f05a5a',tension:0.35,pointRadius:3,fill:false,borderWidth:2,borderDash:[4,3]},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10},callback:v=>v+'%'},grid:{color:gc}}}}})
}
