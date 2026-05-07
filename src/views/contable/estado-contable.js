import Chart from 'chart.js/auto'
import { MONTHS, VENTAS, CMV, MB, MN, MB_PCT, MN_PCT, SUELDOS, ALQUILER, COM_MP, MONOTRIB, OTROS_G, CANAL } from '../../data/data.js'
import { fmtM, fmtPct, sum } from '../../utils.js'

export function renderEstadoContable(el) {
  const tV=sum(VENTAS), tC=sum(CMV), tB=sum(MB), tN=sum(MN)
  const gc='rgba(255,255,255,0.05)', tc='#666'

  el.innerHTML=`
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Ventas acumuladas</div>
        <div class="kpi-value">${fmtM(tV)}</div>
        <div class="kpi-delta delta-flat">5 meses registrados</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">CMV total</div>
        <div class="kpi-value">${fmtM(tC)}</div>
        <div class="kpi-delta delta-down">▼ ${fmtPct(tC/tV*100)} de ventas</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Margen bruto</div>
        <div class="kpi-value" style="color:var(--green)">${fmtM(tB)}</div>
        <div class="kpi-delta delta-up">▲ ${fmtPct(tB/tV*100)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Resultado neto</div>
        <div class="kpi-value" style="color:var(--red)">${fmtM(tN)}</div>
        <div class="kpi-delta delta-down">▼ ${fmtPct(tN/tV*100)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Mercado Pago</div>
        <div class="kpi-value">${fmtM(CANAL.mp)}</div>
        <div class="kpi-delta delta-flat">66.2% del total</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Efectivo</div>
        <div class="kpi-value">${fmtM(CANAL.efectivo)}</div>
        <div class="kpi-delta delta-flat">33.8% del total</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Estado de resultados — mensual</span>
        <span class="card-badge badge-blue">oct-25 a feb-26</span>
      </div>
      <div class="chart-wrap h260"><canvas id="ec-bar"></canvas></div>
      <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Ventas</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>CMV</div>
        <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Margen bruto</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Resultado neto mensual</span>
          <span class="card-badge ${tN<0?'badge-red':'badge-green'}">${fmtM(tN)} total</span>
        </div>
        <div class="chart-wrap h200"><canvas id="ec-net"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Estructura de gastos — acumulado</span>
        </div>
        <div class="chart-wrap h200"><canvas id="ec-gastos"></canvas></div>
        <div class="legend">
          <div class="legend-item"><div class="legend-dot" style="background:#4f8ef7"></div>Sueldos</div>
          <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>Alquiler</div>
          <div class="legend-item"><div class="legend-dot" style="background:#f0a050"></div>Com. MP</div>
          <div class="legend-item"><div class="legend-dot" style="background:#9b82f7"></div>Monotributo</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Márgenes % — evolución bruto vs neto</span>
      </div>
      <div class="chart-wrap h200"><canvas id="ec-pct"></canvas></div>
      <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Margen bruto %</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f05a5a"></div>Margen neto %</div>
      </div>
    </div>
  `

  const opts = (yFmt=fmtM) => ({
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false} },
    scales:{
      x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},
      y:{ticks:{color:tc,font:{size:10},callback:yFmt},grid:{color:gc}}
    }
  })

  new Chart(document.getElementById('ec-bar'),{
    type:'bar',
    data:{labels:MONTHS,datasets:[
      {label:'Ventas', data:VENTAS, backgroundColor:'#4f8ef7'},
      {label:'CMV',    data:CMV,    backgroundColor:'#f05a5a'},
      {label:'Mg. bruto', data:MB,  backgroundColor:'#2ec08a'},
    ]},
    options:opts()
  })

  new Chart(document.getElementById('ec-net'),{
    type:'bar',
    data:{labels:MONTHS,datasets:[{
      data:MN,
      backgroundColor:MN.map(v=>v>=0?'#2ec08a':'#f05a5a'),
      borderRadius:4,
    }]},
    options:opts()
  })

  const gastosAcum = {
    sueldos: sum(SUELDOS),
    alquiler: sum(ALQUILER),
    comMP: sum(COM_MP),
    monotrib: sum(MONOTRIB),
    otros: sum(OTROS_G),
  }
  new Chart(document.getElementById('ec-gastos'),{
    type:'doughnut',
    data:{
      labels:['Sueldos','Alquiler','Com. MP','Monotributo','Otros'],
      datasets:[{
        data:Object.values(gastosAcum),
        backgroundColor:['#4f8ef7','#f05a5a','#f0a050','#9b82f7','#5a6070'],
        borderWidth:0,hoverOffset:4
      }]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'58%'}
  })

  new Chart(document.getElementById('ec-pct'),{
    type:'line',
    data:{labels:MONTHS,datasets:[
      {label:'Bruto%',data:MB_PCT,borderColor:'#2ec08a',tension:0.35,pointRadius:3,fill:false,borderWidth:2},
      {label:'Neto%', data:MN_PCT,borderColor:'#f05a5a',tension:0.35,pointRadius:3,fill:false,borderWidth:2,borderDash:[4,3]},
    ]},
    options:opts(v=>v+'%')
  })
}
