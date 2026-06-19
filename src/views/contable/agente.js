import { fmtM } from '../../utils.js'

const BUSINESS_CONTEXT = `
Sos un asesor contable y estratégico experto para una empresa de venta de delicatessen y embutidos en Argentina.
Tenés acceso completo a los datos reales del negocio para el período oct-2025 a feb-2026.

=== DATOS REALES DEL NEGOCIO ===

VENTAS MENSUALES:
- Oct-25: $1.95M | Nov-25: $10.5M | Dic-25: $22.9M | Ene-26: $9.9M | Feb-26: $8.2M
- Total acumulado: $53.5M | Promedio mensual: $10.7M

CMV (Costo de Mercadería Vendida):
- Oct-25: $7.7M | Nov-25: $8.8M | Dic-25: $12.3M | Ene-26: $8.1M | Feb-26: $8.4M
- Total CMV: $45.3M | CMV promedio: 84.5% sobre ventas (CRÍTICO - óptimo ≤70%)

MARGEN BRUTO:
- Oct-25: -$5.8M (-296%) | Nov-25: +$1.7M (16.4%) | Dic-25: +$10.6M (46.2%) | Ene-26: +$1.9M (18.8%) | Feb-26: -$118K (-1.4%)
- Total: +$8.3M (15.5%)

RESULTADO NETO:
- Oct-25: -$7.3M | Nov-25: -$1.0M | Dic-25: +$6.3M | Ene-26: -$2.1M | Feb-26: -$4.1M
- TOTAL ACUMULADO: -$9.4M (-17.6% sobre ventas) ← NEGATIVO
- Solo diciembre fue rentable

GASTOS FIJOS MENSUALES:
- Alquiler: $1.0M/mes (fijo) = $5.0M total
- Sueldos: ~$1.0M/mes (creciente) = $5.1M total
- Monotributo: $57K-$164K/mes = $500K total
- Comisiones Mercado Pago: 3.8% sobre ventas MP = $1.33M total
- Otros: ~$200K/mes

CANALES DE COBRO:
- Mercado Pago: $35.4M (66.2%)
- Efectivo: $18.1M (33.8%)

CMV POR CATEGORÍA:
- Embutidos: $24.7M (54% del CMV) - CATEGORÍA DOMINANTE
- Delicatessen: $9.7M (21%)
- Bebidas: $4.8M (11%)
- Quesos: $3.6M (8%)
- Snack: $1.6M (3%)
- Encurtidos: $0.9M (2%)

TOP PROVEEDORES:
1. Francisco J. Rozzi: $21.3M (30.7%) - CONCENTRACIÓN CRÍTICA
2. LAS DINAS S R L: $11.1M (16.0%)
3. Pampa Lider: $7.1M (10.3%)
4. BARBOSA HERMANOS: $4.9M (7.2%)
5. Granjas Patagónicas: $2.8M (4.1%)
Total pagado proveedores: $69.2M | 18 proveedores activos
Top 3 = 58.3% del gasto total (RIESGO ALTO)

MONOTRIBUTO:
- Ventas acumuladas para monotributo: $64.6M
- Tope categoría H: $70.1M
- Uso: 92% del tope ← CRÍTICO, quedan solo ~$5.5M de margen

INDICADORES CLAVE:
- Punto de equilibrio: CMV debe bajar a ~60% para ser rentable al volumen actual
- Ventas mínimas para PE con CMV actual: ~$16.5M/mes
- Cada 1% de descuento negociado en proveedores = ~$692K de ahorro anual
- Reducir CMV del 84.5% al 78% = +$3.4M de margen adicional
- Diciembre fue el único mes rentable (ventas $22.9M por pico estacional)

=== CONTEXTO DEL NEGOCIO ===
- Rubro: Delicatessen y embutidos (Argentina)
- Estructura: monotributo categoría H
- Alta dependencia de ventas de diciembre (pico estacional)
- Problema principal: CMV muy alto que consume el margen bruto
- Segundo problema: volatilidad de ventas (de $1.9M a $22.9M en el mismo período)

=== TU ROL ===
Respondé siempre en español argentino natural. Sé directo, concreto y accionable.
Usá los datos reales cuando sean relevantes. Citá números específicos.
Si te preguntan algo que no está en los datos, decilo honestamente.
No uses listas con muchos puntos - preferí párrafos claros y recomendaciones puntuales.
Respondé de forma concisa pero completa (3-6 oraciones para respuestas simples, más para análisis complejos).
`

const QUICK_PROMPTS = [
  { label: '¿Cómo bajo el CMV?',          text: '¿Cuáles son las acciones más concretas para bajar el CMV del 84.5%? Dame un plan paso a paso.' },
  { label: 'Negociación con proveedores', text: 'Dame un guión de negociación con Las Dinas y Pampa Líder para conseguir un descuento del 5%.' },
  { label: 'Riesgo monotributo',          text: '¿Qué pasa si supero el tope del monotributo? ¿Qué opciones tengo?' },
  { label: 'Estrategia para diciembre',   text: '¿Cómo puedo capitalizar mejor el pico de ventas de diciembre? ¿Qué preparar con anticipación?' },
  { label: 'Punto de equilibrio',         text: '¿Cuánto tengo que vender por mes para que el negocio sea rentable con la estructura de costos actual?' },
  { label: 'Diversificar proveedores',    text: '¿Cómo diversifico proveedores de embutidos para reducir el riesgo de concentración?' },
]

let conversationHistory = []
let isLoading = false

async function sendMessage(userMsg) {
  if (isLoading || !userMsg.trim()) return
  isLoading = true

  conversationHistory.push({ role: 'user', content: userMsg })
  renderMessages()
  setLoading(true)

  try {
    const response = await fetch('/api/core?action=chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: BUSINESS_CONTEXT,
        messages: conversationHistory,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errMsg = data?.error || data?.error?.message || `Error ${response.status}`
      conversationHistory.push({ role: 'assistant', content: `⚠️ ${errMsg}` })
    } else {
      const reply = data.content?.[0]?.text || 'Error al procesar la respuesta.'
      conversationHistory.push({ role: 'assistant', content: reply })
    }
  } catch (err) {
    conversationHistory.push({ role: 'assistant', content: `⚠️ Error de red: ${err.message}. ¿La función /api/chat está deployada en Vercel?` })
  }

  isLoading = false
  setLoading(false)
  renderMessages()
}

function setLoading(on) {
  const btn = document.getElementById('ag-send')
  const inp = document.getElementById('ag-input')
  if (btn) btn.disabled = on
  if (inp) inp.disabled = on

  const typing = document.getElementById('ag-typing')
  if (typing) typing.style.display = on ? 'flex' : 'none'

  const chat = document.getElementById('ag-chat')
  if (chat) chat.scrollTop = chat.scrollHeight
}

function renderMessages() {
  const chat = document.getElementById('ag-chat')
  if (!chat) return

  const msgs = conversationHistory.map(m => {
    if (m.role === 'user') {
      return `<div class="ag-msg ag-user"><div class="ag-bubble ag-bubble-user">${escapeHtml(m.content)}</div></div>`
    } else {
      const formatted = formatAssistant(m.content)
      return `<div class="ag-msg ag-bot"><div class="ag-avatar">C</div><div class="ag-bubble ag-bubble-bot">${formatted}</div></div>`
    }
  }).join('')

  chat.innerHTML = msgs + `<div id="ag-typing" class="ag-msg ag-bot" style="display:none">
    <div class="ag-avatar">C</div>
    <div class="ag-bubble ag-bubble-bot ag-typing-bubble">
      <span class="ag-dot"></span><span class="ag-dot"></span><span class="ag-dot"></span>
    </div>
  </div>`

  chat.scrollTop = chat.scrollHeight
}

function formatAssistant(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>').replace(/$/, '</p>')
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

export function renderAgente(el) {
  el.innerHTML = `
    <div class="ag-layout">
      <!-- Left: chat -->
      <div class="ag-chat-panel">
        <div class="ag-header">
          <div class="ag-avatar-lg">C</div>
          <div>
            <div class="ag-name">Asesor Contable</div>
            <div class="ag-status"><span class="ag-online"></span>IA activa · datos oct-25/feb-26</div>
          </div>
        </div>

        <div class="ag-chat" id="ag-messages" class="ag-messages">
          <div class="ag-msg ag-bot">
            <div class="ag-avatar">C</div>
            <div class="ag-bubble ag-bubble-bot">
              <p>Hola. Soy tu asesor contable con acceso completo a los datos de tu negocio del período oct-25 a feb-26.</p>
              <p>Puedo analizar tus métricas, identificar problemas, darte estrategias de negociación con proveedores, calcular escenarios de rentabilidad y recomendarte acciones concretas.</p>
              <p>¿Por dónde empezamos?</p>
            </div>
          </div>
        </div>

        <div class="ag-input-area">
          <div class="ag-quick-row" id="ag-quick"></div>
          <div class="ag-input-row">
            <textarea id="ag-input" class="ag-textarea" placeholder="Preguntá sobre estrategia, proveedores, rentabilidad, monotributo..." rows="1"></textarea>
            <button id="ag-send" class="ag-send-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2L2 7l5 2 2 5 5-12Z" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: context panel -->
      <div class="ag-ctx-panel">
        <div class="ag-ctx-title">Contexto del negocio</div>

        <div class="ag-ctx-section">
          <div class="ag-ctx-label">Resultado neto acumulado</div>
          <div class="ag-ctx-val" style="color:var(--red)">-$9.4M</div>
          <div class="ag-ctx-sub">-17.6% sobre ventas · 5 meses</div>
        </div>

        <div class="ag-ctx-section">
          <div class="ag-ctx-label">CMV actual</div>
          <div class="ag-ctx-bar-wrap">
            <div class="ag-ctx-bar" style="width:84.5%;background:var(--red)"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt2);margin-top:4px">
            <span style="color:var(--red);font-family:'DM Mono',monospace">84.5%</span>
            <span>objetivo: 70%</span>
          </div>
        </div>

        <div class="ag-ctx-section">
          <div class="ag-ctx-label">Monotributo</div>
          <div class="ag-ctx-bar-wrap">
            <div class="ag-ctx-bar" style="width:92%;background:var(--amber)"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt2);margin-top:4px">
            <span style="color:var(--amber);font-family:'DM Mono',monospace">92%</span>
            <span>tope cat. H</span>
          </div>
        </div>

        <div class="ag-ctx-section">
          <div class="ag-ctx-label">Alertas activas</div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
            <div class="ag-alert-chip ag-alert-red">CMV 84.5% — crítico</div>
            <div class="ag-alert-chip ag-alert-red">Neto negativo -$9.4M</div>
            <div class="ag-alert-chip ag-alert-red">Concentración prov. 58%</div>
            <div class="ag-alert-chip ag-alert-amber">Monotributo al 92%</div>
            <div class="ag-alert-chip ag-alert-amber">Com. MP $1.33M</div>
          </div>
        </div>

        <div class="ag-ctx-section">
          <div class="ag-ctx-label">Métricas clave</div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
            ${[
              ['Ventas totales','$53.5M'],
              ['CMV total','$45.3M'],
              ['Margen bruto','$8.3M (15.5%)'],
              ['Mejor mes','Dic-25 ($6.3M)'],
              ['Prov. principal','Rozzi ($21.3M)'],
              ['Ventas p/equilibrio','$16.5M/mes'],
            ].map(([k,v])=>`<div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--txt2)">${k}</span><span style="color:var(--txt);font-family:'DM Mono',monospace;font-size:11px">${v}</span></div>`).join('')}
          </div>
        </div>

        <button class="ag-clear-btn" id="ag-clear">Limpiar conversación</button>
      </div>
    </div>
  `

  // Quick prompts
  const qRow = document.getElementById('ag-quick')
  QUICK_PROMPTS.forEach(q => {
    const btn = document.createElement('button')
    btn.className = 'ag-quick-btn'
    btn.textContent = q.label
    btn.addEventListener('click', () => {
      document.getElementById('ag-input').value = q.text
      handleSend()
    })
    qRow.appendChild(btn)
  })

  // Send handlers
  function handleSend() {
    const inp = document.getElementById('ag-input')
    const msg = inp.value.trim()
    if (!msg) return
    inp.value = ''
    inp.style.height = 'auto'
    sendMessage(msg)
  }

  document.getElementById('ag-send').addEventListener('click', handleSend)

  document.getElementById('ag-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  })

  document.getElementById('ag-input').addEventListener('input', function() {
    this.style.height = 'auto'
    this.style.height = Math.min(this.scrollHeight, 120) + 'px'
  })

  document.getElementById('ag-clear').addEventListener('click', () => {
    conversationHistory = []
    renderMessages()
  })
}
