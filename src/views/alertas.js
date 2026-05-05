import { fmtM } from '../utils.js'
import { MONOTRIBUTO_DATA } from '../data/data.js'

export function renderAlertas(el){
  const {ventas,tope}=MONOTRIBUTO_DATA
  const pct=(ventas/tope*100).toFixed(1)
  const left=fmtM(tope-ventas)
  const alerts=[
    {lv:'critical',icon:'!',title:'Margen neto negativo acumulado',body:'El negocio acumula -$9.4M de pérdida neta en 5 meses (-17.6%). Solo diciembre fue rentable. La estructura de costos no es sostenible al volumen promedio.',badge:'-$9.4M',bc:'badge-red'},
    {lv:'critical',icon:'!',title:'CMV del 84.5% — margen insuficiente',body:'El costo de mercadería consume 84.5 centavos de cada peso de venta. El objetivo mínimo para viabilidad es CMV ≤ 70%. Cada punto que se baje = ~$535K de ahorro anual.',badge:'84.5% CMV',bc:'badge-red'},
    {lv:'critical',icon:'!',title:'Concentración de proveedores peligrosa',body:'Top 3 proveedores = 58.3% del gasto. Las Dinas + Pampa Líder son críticos sin alternativa calificada. Un corte de suministro para el negocio completamente.',badge:'58% top 3',bc:'badge-red'},
    {lv:'warning',icon:'~',title:`Monotributo al ${pct}% del tope`,body:`Con $64.6M acumulados y tope de $70.1M en categoría H, quedan solo ${left}. Si se supera sin planificación, las consecuencias impositivas son severas. Consultar con contador urgente.`,badge:`${pct}% tope`,bc:'badge-amber'},
    {lv:'warning',icon:'~',title:'Comisiones Mercado Pago: $1.33M',body:'El 66% de las ventas pasa por MP generando $1.33M en comisiones (3.8% sobre ventas MP). Evaluar negociar tarifa por volumen o redirigir pagos mayores a transferencia bancaria.',badge:'$1.33M',bc:'badge-amber'},
    {lv:'warning',icon:'~',title:'Pago extraordinario a F.J. Rozzi',body:'Se registraron $21.3M en el período. Verificar si fue compra de stock estacional, adelanto de mercadería futura o pago de deuda anterior. Impacta fuertemente el CMV de diciembre.',badge:'$21.3M',bc:'badge-amber'},
    {lv:'warning',icon:'~',title:'Volatilidad de ventas 11x',body:'Las ventas van de $1.95M (oct-25) a $22.9M (dic-25). Esta volatilidad dificulta la planificación de compras y el manejo de caja. Diciembre parece un pico estacional a capitalizar.',badge:'11x variación',bc:'badge-amber'},
    {lv:'info',icon:'→',title:'Acción prioritaria: negociar con Las Dinas + Pampa Líder',body:'Con $18.2M combinados, hay poder de negociación real. Una reducción del 5% = $910K de ahorro. Proponer volumen garantizado anual a cambio de precio fijo. Reunión en los próximos 30 días.',badge:'Prioridad 1',bc:'badge-blue'},
  ]
  el.innerHTML=`
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Alertas críticas</div><div class="kpi-value" style="color:var(--red)">3</div><div class="kpi-delta delta-down">▼ Acción inmediata</div></div>
      <div class="kpi-card"><div class="kpi-label">Advertencias</div><div class="kpi-value" style="color:var(--amber)">4</div><div class="kpi-delta delta-flat">Monitorear</div></div>
      <div class="kpi-card"><div class="kpi-label">Monotributo usado</div><div class="kpi-value" style="color:var(--amber)">${pct}%</div><div class="kpi-delta delta-down">▼ Quedan ${left}</div></div>
      <div class="kpi-card"><div class="kpi-label">Único mes rentable</div><div class="kpi-value" style="color:var(--green)">Dic-25</div><div class="kpi-delta delta-up">▲ $6.35M neto</div></div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><span class="card-title">Monotributo — consumo vs tope categoría H</span><span class="card-badge badge-amber">${pct}% usado</span></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt2);margin-bottom:6px"><span>Ventas: ${fmtM(ventas)}</span><span>Tope cat. H: ${fmtM(tope)}</span></div>
      <div class="mono-bar-wrap"><div class="mono-bar" style="width:${pct}%"></div></div>
      <div style="font-size:11px;color:var(--amber);margin-top:6px">Margen disponible: ${left} — evaluar cambio de categoría antes de superar el tope.</div>
    </div>
    ${alerts.map(a=>`
    <div class="alert-item alert-${a.lv}">
      <div class="alert-icon">${a.icon}</div>
      <div style="flex:1"><div class="alert-title">${a.title}</div><div class="alert-body">${a.body}</div></div>
      <div class="alert-right"><span class="alert-badge card-badge ${a.bc}">${a.badge}</span></div>
    </div>`).join('')}`
}
