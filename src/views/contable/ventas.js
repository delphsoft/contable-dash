import Chart from 'chart.js/auto'
import { MONTHS,CMV,CAT_DATA,CANAL,SUELDOS,ALQUILER,MONOTRIB,COM_MP,OTROS_G } from '../../data/data.js'
import { fmtM,sum } from '../../utils.js'

export function renderVentas(el) {
  const gc='rgba(255,255,255,0.05)',tc='#666'
  el.innerHTML=`
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Mercado Pago</div><div class="kpi-value">${fmtM(CANAL.mp)}</div><div class="kpi-delta delta-flat">66.2% del total</div></div>
      <div class="kpi-card"><div class="kpi-label">Efectivo</div><div class="kpi-value">${fmtM(CANAL.efectivo)}</div><div class="kpi-delta delta-flat">33.8% del total</div></div>
      <div class="kpi-card"><div class="kpi-label">Com. Mercado Pago</div><div class="kpi-value" style="color:var(--red)">${fmtM(sum(COM_MP))}</div><div class="kpi-delta delta-down">▼ 3.8% sobre ventas MP</div></div>
      <div class="kpi-card"><div class="kpi-label">Alquiler total</div><div class="kpi-value" style="color:var(--red)">${fmtM(sum(ALQUILER))}</div><div class="kpi-delta delta-flat">$1M/mes fijo</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">Canal de cobro acumulado</span></div>
        <div class="chart-wrap h200"><canvas id="v1"></canvas></div>
        <div class="legend">
          <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Mercado Pago 66%</div>
          <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Efectivo 34%</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">CMV por categoría</span></div>
        <div class="chart-wrap h200"><canvas id="v2"></canvas></div>
        <div class="legend">
          <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Embutidos 54%</div>
          <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>Delicatessen 21%</div>
          <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Bebidas 11%</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">CMV por categoría — evolución mensual</span><span class="pill pill-blue">apilado</span></div>
      <div class="chart-wrap h260"><canvas id="v3"></canvas></div>
      <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Embutidos</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>Delicatessen</div>
        <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Bebidas</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f0a050"></div>Quesos</div>
        <div class="legend-item"><div class="legend-dot" style="background:#9b82f7"></div>Snack</div>
        <div class="legend-item"><div class="legend-dot" style="background:#5DCAA5"></div>Encurtidos</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Gastos fijos y variables — mensual</span></div>
      <div class="chart-wrap h240"><canvas id="v4"></canvas></div>
      <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Sueldos</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>Alquiler</div>
        <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Monotributo</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f0a050"></div>Com. MP</div>
        <div class="legend-item"><div class="legend-dot" style="background:#9b82f7"></div>Otros</div>
      </div>
    </div>`
  new Chart(document.getElementById('v1'),{type:'doughnut',data:{labels:['Mercado Pago','Efectivo'],datasets:[{data:[CANAL.mp,CANAL.efectivo],backgroundColor:['#4f8ef7','#2ec08a'],borderWidth:0,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'60%'}})
  new Chart(document.getElementById('v2'),{type:'doughnut',data:{labels:['Embutidos','Delicatessen','Bebidas','Quesos','Snack','Encurtidos'],datasets:[{data:[24667268,9717411,4815855,3572073,1578821,906367],backgroundColor:['#4f8ef7','#f05a5a','#2ec08a','#f0a050','#9b82f7','#5DCAA5'],borderWidth:0,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'58%'}})
  new Chart(document.getElementById('v3'),{type:'bar',data:{labels:MONTHS,datasets:[
    {data:CAT_DATA.embutidos,backgroundColor:'#4f8ef7',stack:'a'},
    {data:CAT_DATA.delicatessen,backgroundColor:'#f05a5a',stack:'a'},
    {data:CAT_DATA.bebidas,backgroundColor:'#2ec08a',stack:'a'},
    {data:CAT_DATA.quesos,backgroundColor:'#f0a050',stack:'a'},
    {data:CAT_DATA.snack,backgroundColor:'#9b82f7',stack:'a'},
    {data:CAT_DATA.encurtidos,backgroundColor:'#5DCAA5',stack:'a'},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{stacked:true,ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{stacked:true,ticks:{color:tc,font:{size:10},callback:fmtM},grid:{color:gc}}}}})
  new Chart(document.getElementById('v4'),{type:'bar',data:{labels:MONTHS,datasets:[
    {data:SUELDOS,backgroundColor:'#4f8ef7',stack:'a'},
    {data:ALQUILER,backgroundColor:'#f05a5a',stack:'a'},
    {data:MONOTRIB,backgroundColor:'#2ec08a',stack:'a'},
    {data:COM_MP,backgroundColor:'#f0a050',stack:'a'},
    {data:OTROS_G,backgroundColor:'#9b82f7',stack:'a'},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{stacked:true,ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{stacked:true,ticks:{color:tc,font:{size:10},callback:fmtM},grid:{color:gc}}}}})
}
