import Chart from 'chart.js/auto'
import { MONTHS, VENTAS, CMV, MB, MN, MB_PCT, MN_PCT } from '../../data/data.js'
import { fmtM, fmtPct, sum } from '../../utils.js'

export function renderOverview(el) {
  const tV=sum(VENTAS),tC=sum(CMV),tB=sum(MB),tN=sum(MN)
  const gc='rgba(255,255,255,0.06)',tc='#4a4f5e'

  el.innerHTML=`
    <div class="hero-card">
      <div class="hero-label"><div class="hero-dot"></div>Ventas acumuladas</div>
      <div class="hero-row">
        <div class="hero-amount">${new Intl.NumberFormat('es-AR').format(tV)}</div>
        <div class="hero-delta delta-up-pill"><i class="ti ti-trending-up" style="font-size:12px"></i>5 meses</div>
      </div>
      <div class="hero-sub">Mejor mes: dic-25 con $22.9M · Promedio $10.7M/mes</div>
      <div class="hero-arrow"><i class="ti ti-arrow-right"></i></div>
    </div>

    <div class="grid-3">
      <div class="kpi">
        <div style="font-size:13px;color:var(--txt2);margin-bottom:8px">Margen bruto</div>
        <div style="font-size:26px;font-weight:700;color:#2ec08a;letter-spacing:-0.03em">${fmtM(tB)}</div>
        <div class="kpi-delta delta-up" style="margin-top:6px"><i class="ti ti-arrow-up-right" style="font-size:13px"></i>${fmtPct(tB/tV*100)}</div>
      </div>
      <div class="kpi">
        <div style="font-size:13px;color:var(--txt2);margin-bottom:8px">Resultado neto</div>
        <div style="font-size:26px;font-weight:700;color:#f05a5a;letter-spacing:-0.03em">${fmtM(tN)}</div>
        <div class="kpi-delta delta-dn" style="margin-top:6px"><i class="ti ti-arrow-down-right" style="font-size:13px"></i>${fmtPct(tN/tV*100)}</div>
      </div>
      <div class="kpi">
        <div style="font-size:13px;color:var(--txt2);margin-bottom:8px">CMV / Ventas</div>
        <div style="font-size:26px;font-weight:700;color:#f0a050;letter-spacing:-0.03em">84.5%</div>
        <div class="kpi-delta delta-dn" style="margin-top:6px"><i class="ti ti-arrow-down-right" style="font-size:13px"></i>obj. ≤70%</div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-hd">
        <div>
          <div class="chart-title">Ventas mensuales</div>
          <div class="chart-sub-val">
            ${fmtM(tV)}
            <span class="hero-delta delta-up-pill" style="font-size:11px"><i class="ti ti-trending-up" style="font-size:11px"></i>acumulado</span>
          </div>
        </div>
        <div class="legend">
          <div class="legend-item"><div class="legend-dot" style="background:#378ADD"></div>Ventas</div>
          <div class="legend-item" style="color:var(--txt2)"><span style="display:inline-block;width:14px;height:0;border-top:2px dashed #f05a5a;vertical-align:middle;margin-right:6px"></span>CMV</div>
        </div>
      </div>
      <div class="chart-wrap h220"><canvas id="ov1" role="img" aria-label="Ventas y CMV mensual oct-25 a feb-26"></canvas></div>
    </div>

    <div class="grid-2">
      <div class="chart-card" style="margin-bottom:0">
        <div class="chart-hd"><div class="chart-title">Resultado neto mensual</div></div>
        <div class="chart-wrap h140"><canvas id="ov2" role="img" aria-label="Resultado neto mensual"></canvas></div>
      </div>
      <div class="chart-card" style="margin-bottom:0">
        <div class="chart-hd">
          <div class="chart-title">Márgenes %</div>
          <div class="legend">
            <div class="legend-item"><div class="legend-dot" style="background:#2ec08a"></div>Bruto%</div>
            <div class="legend-item" style="color:var(--txt2)"><span style="display:inline-block;width:12px;height:0;border-top:2px dashed #f05a5a;vertical-align:middle;margin-right:5px"></span>Neto%</div>
          </div>
        </div>
        <div class="chart-wrap h140"><canvas id="ov3" role="img" aria-label="Márgenes bruto y neto"></canvas></div>
      </div>
    </div>`

  const base = (yFmt=fmtM) => ({
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false} },
    scales:{
      x:{ticks:{color:tc,font:{size:11}},grid:{color:gc},border:{display:false}},
      y:{ticks:{color:tc,font:{size:11},callback:yFmt},grid:{color:gc},border:{display:false}}
    }
  })

  new Chart(document.getElementById('ov1'),{
    type:'bar',
    data:{labels:MONTHS,datasets:[
      {label:'Ventas',data:VENTAS,backgroundColor:'#378ADD',borderRadius:5,borderSkipped:false,order:2},
      {label:'CMV',data:CMV,type:'line',borderColor:'#f05a5a',backgroundColor:'transparent',tension:0.35,pointRadius:5,pointBackgroundColor:'#f05a5a',pointBorderColor:'#f05a5a',borderWidth:2,borderDash:[6,4],order:1},
    ]},
    options:base()
  })

  new Chart(document.getElementById('ov2'),{
    type:'bar',
    data:{labels:MONTHS,datasets:[{data:MN,backgroundColor:MN.map(v=>v>=0?'#2ec08a':'#f05a5a'),borderRadius:4}]},
    options:base()
  })

  new Chart(document.getElementById('ov3'),{
    type:'line',
    data:{labels:MONTHS,datasets:[
      {data:MB_PCT,borderColor:'#2ec08a',backgroundColor:'rgba(46,192,138,0.08)',fill:true,tension:0.35,pointRadius:3,borderWidth:2},
      {data:MN_PCT,borderColor:'#f05a5a',backgroundColor:'transparent',fill:false,tension:0.35,pointRadius:3,borderWidth:2,borderDash:[5,3]},
    ]},
    options:base(v=>v+'%')
  })
}
