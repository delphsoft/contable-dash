# Agile, BPM & Tech Giants PM Frameworks — Aplicados a PyME Argentina

## Filosofía de uso
Estos frameworks provienen de Google, Microsoft, Atlassian y metodologías ágiles.
Se aplican para estructurar la consultoría, el diagnóstico y el roadmap de clientes PyME.
No usar terminología técnica con el cliente — traducir siempre al lenguaje del negocio.

---

## 1. Google — OKR Framework aplicado a PyMEs
**Fuente:** Google re:Work — "Set Goals with OKRs"

### Qué es
OKR = Objective + Key Results. Google lo usa internamente desde 1999.
Adaptado: sirve para que una PyME tenga foco en 3-4 prioridades reales.

### Template OKR para PyME argentina (trimestral)

```
OBJETIVO: Ordenar el compliance fiscal en Q3 2026

Key Result 1: Cero vencimientos vencidos al 30/09 (hoy: 3 pendientes)
Key Result 2: 100% proveedores validados en ARCA (hoy: 60%)
Key Result 3: F931 presentado antes del día 5 de cada mes (hoy: día 9)
Key Result 4: Deuda ARCA reducida a $0 (hoy: $X en plan de facilidades)
```

### Cómo usarlo en DashBI
- El diagnóstico genera los OKRs automáticamente según los riesgos detectados
- Cada recomendación urgente se convierte en un KR medible
- El score del diagnóstico es el proxy del % de avance en OKRs

### Cadencia recomendada
```
Diagnóstico inicial → OKRs Q1
Revisión 45 días  → ajuste de KRs
Diagnóstico Q2    → nuevo ciclo
```

---

## 2. Google — HEART Framework para medir UX del diagnóstico
**Fuente:** Google Ventures — "Measuring UX with the HEART Framework"

### Aplicado al módulo de diagnóstico DashBI

| Dimensión | Métrica | Cómo medirla |
|---|---|---|
| **H**appiness | NPS post-diagnóstico | Pregunta al final: "¿Lo recomendarías?" |
| **E**ngagement | Diagnósticos por mes por usuario | Supabase analytics |
| **A**doption | % usuarios que usan diagnóstico vs total | Funnel en Vercel |
| **R**etention | Vuelven a hacer diagnóstico en 30 días | Cohort en Supabase |
| **T**ask Success | % diagnósticos completados vs iniciados | Evento en frontend |

### Meta inicial
```
Adoption: 40% de usuarios activos usan diagnóstico en el primer mes
Task Success: 85% de diagnósticos iniciados se completan
Retention: 60% vuelve a hacer diagnóstico en 90 días
```

---

## 3. Google PM — CIRCLES Framework para priorización de features
**Fuente:** "Cracking the PM Interview" — adaptado de Google/Meta PM methodology

### CIRCLES = Comprehend → Identify → Report → Cut → List → Evaluate → Summarize

**Aplicado a decisiones de roadmap DashBI:**

```
C — Comprehend: ¿Qué problema resuelve esta feature para el usuario?
I — Identify:   ¿Quién la necesita? (contador vs cliente PyME)
R — Report:     ¿Cuántos usuarios tienen este problema? (% de la base)
C — Cut:        ¿Qué features no se necesitan? (eliminar scope creep)
L — List:       Listar soluciones posibles sin filtrar
E — Evaluate:   Impacto vs Esfuerzo de cada solución
S — Summarize:  Feature final priorizada con justificación
```

**Ejemplo aplicado — "¿Agregar export a Excel del diagnóstico?"**
```
C: Usuario quiere llevar el diagnóstico a su contador
I: Cliente PyME sin contador propio
R: ~30% de usuarios sin contador asignado
C: No necesitan dashboard interactivo, solo el PDF
L: Excel / PDF / Email automático / Link compartible
E: PDF = alto impacto, bajo esfuerzo → PRIMERO
S: Implementar export PDF antes que Excel
```

---

## 4. Agile Scrum — Sprint Planning para consultoría PyME
**Fuente:** Scrum Guide 2020 (Schwaber & Sutherland)

### Adaptar Scrum al ciclo contable argentino

| Evento Scrum | Equivalente contable | Cadencia |
|---|---|---|
| Sprint | Mes fiscal | Mensual |
| Sprint Planning | Reunión de cierre/apertura | Día 1 del mes |
| Daily | Check de vencimientos | Automático (DashBI) |
| Sprint Review | Revisión de posición IVA | Día 20 del mes |
| Retrospectiva | Diagnóstico trimestral | Cada 3 meses |

### User Stories para el módulo de diagnóstico

```
Como contador, quiero diagnosticar un cliente nuevo en < 5 minutos
para ahorrar la reunión de onboarding de 2 horas.

Como cliente PyME, quiero entender mi riesgo fiscal en lenguaje simple
para tomar decisiones sin necesitar un contador en cada consulta.

Como dueño de PyME, quiero recibir alertas antes de los vencimientos
para nunca pagar más de lo que debo por mora.
```

### Definition of Done para features DashBI
- [ ] Funciona en mobile (viewport 375px)
- [ ] Sin template literals anidados (Vite constraint)
- [ ] Tiempo de respuesta < 6 segundos
- [ ] Error handling visible al usuario
- [ ] Dato guardado en Supabase si corresponde

---

## 5. BPM — Business Process Management aplicado a compliance

**Fuente:** "BPM CBOK v4.0" — Association of Business Process Management Professionals

### Los 6 elementos de un proceso de compliance bien diseñado (BPM)

```
1. TRIGGER:     ¿Qué dispara el proceso? (vencimiento, nueva RG, deuda)
2. INPUT:       ¿Qué información se necesita? (datos Supabase + contexto)
3. PROCESO:     ¿Quién hace qué? (DashBI automatiza, contador valida)
4. OUTPUT:      ¿Qué se produce? (VEP pagado, F931 presentado, diagnóstico)
5. CONTROL:     ¿Cómo se verifica? (semáforo en DashBI)
6. RECURSO:     ¿Qué herramientas? (Supabase, ARCA API, AfipSDK)
```

### Mapa de procesos DashBI (BPMN simplificado)

```
[ARCA publica vencimiento]
        ↓
[Motor DashBI detecta]
        ↓
[Alerta Resend → cliente]
        ↓
[Cliente entra a DashBI]
        ↓
    ¿Tiene datos?
    ├── SÍ → Calcula posición IVA automática
    └── NO → Prompt para ingresar datos
        ↓
[Genera VEP link]
        ↓
[Cliente paga]
        ↓
[Marca vencimiento como cumplido]
        ↓
[Score actualizado]
```

### Métricas BPM para DashBI
- **Cycle time:** tiempo desde alerta hasta pago del vencimiento
- **Error rate:** % de vencimientos que se pasan (objetivo: 0%)
- **Automation rate:** % de pasos automáticos vs manuales (objetivo: >70%)

---

## 6. Microsoft — Growth Mindset aplicado a PyMEs
**Fuente:** Satya Nadella "Hit Refresh" + Microsoft Research on organizational learning

### Fixed Mindset vs Growth Mindset en compliance PyME

| Fixed Mindset | Growth Mindset |
|---|---|
| "El contador se ocupa de todo" | "Entiendo mi posición fiscal" |
| "Lo arreglo si me multan" | "Prevengo antes del vencimiento" |
| "Eso es muy caro/complicado" | "Invirtiendo en compliance ahorro más" |
| "No necesito sociedad, siempre fui así" | "La SAS abre opciones que hoy no tengo" |

### Cómo DashBI instala Growth Mindset
- Dashboard visible → el dueño ve su situación en tiempo real
- Score que sube → gamificación del compliance
- Diagnóstico que evoluciona → evidencia de mejora
- Recomendaciones accionables → cada paso se puede hacer

---

## 7. Microsoft Azure — Well-Architected Framework adaptado a SaaS PyME
**Fuente:** Microsoft Azure Well-Architected Framework (5 pillars)

### Los 5 pilares aplicados a DashBI

| Pilar Azure | Aplicación DashBI |
|---|---|
| **Reliability** | Fallback si Claude API no responde → parser local |
| **Security** | API key en Vercel env vars, nunca en código |
| **Cost Optimization** | Sonnet 4.6 (no Opus), max_tokens 1500, cache prompts |
| **Operational Excellence** | Logs en Vercel, errores visibles al usuario |
| **Performance** | Respuesta < 6s, loading states progresivos |

---

## 8. Atlassian — Team Playbook para consultoría ágil
**Fuente:** Atlassian Team Playbook (plays.atlassian.com)

### Play: "Health Monitor" adaptado para cartera de clientes

Usar el score de diagnóstico como health monitor de la cartera:

```
🟢 Score 80-100 (3+ clientes): Foco en growth opportunities
🟡 Score 60-79 (5+ clientes): Revisión mensual, OKRs activos
🔴 Score <60  (2+ clientes): Atención urgente esta semana
```

### Play: "5 Whys" para causa raíz de deuda ARCA
```
¿Por qué tiene deuda? → No presentó la DDJJ
¿Por qué no presentó? → No tenía los datos de compras
¿Por qué no tenía los datos? → Los proveedores no le mandaron los comprobantes
¿Por qué no los mandaron? → No tienen CAE válido
¿Por qué no tienen CAE? → Son proveedores informales
→ RAÍZ: problema de cadena de suministro informal
→ SOLUCIÓN: validar padrón ARCA al ingresar cada compra
```

---

## 9. Lean Startup — Build-Measure-Learn para DashBI
**Fuente:** Eric Ries "The Lean Startup"

### MVP thinking aplicado al módulo de diagnóstico

```
BUILD:   Diagnóstico con parser local (v1 — ya deployado)
MEASURE: ¿Los usuarios lo completan? ¿Las recomendaciones son útiles?
LEARN:   ¿Qué señales detecta mal? ¿Qué dimensión importa más?
         ↓
BUILD:   Conectar Claude API para análisis real (v2 — en progreso)
MEASURE: ¿Mejora la precisión? ¿Sube el NPS?
LEARN:   ¿Qué tipos de empresas se benefician más?
         ↓
BUILD:   Guardar en Supabase + historial de scores (v3)
MEASURE: ¿Los usuarios vuelven? ¿El score mejora en el tiempo?
LEARN:   ¿Qué recomendaciones se implementan realmente?
```

### Pirate Metrics (AARRR) para DashBI

```
Acquisition:  Usuario llega a dashbi.pymestudio.xyz
Activation:   Hace su primer diagnóstico
Retention:    Vuelve a hacer diagnóstico en 30 días
Revenue:      Convierte a plan pago (Compliance USD 19)
Referral:     Recomienda a otro dueño de PyME
```

---

## 10. Shape Up — Metodología de Basecamp para producto
**Fuente:** Ryan Singer "Shape Up" (basecamp.com/shapeup)

### Ciclos de 6 semanas para DashBI

```
Semana 1-2: Shape (definir el problema, no la solución)
  → "Los usuarios no saben qué hacer después del diagnóstico"
  → Scope: botones de acción que conectan con módulos DashBI

Semana 3-5: Build (implementar con autonomía)
  → Frontend + API + integración Supabase

Semana 6: Cool-down (fix bugs, documentar, no agregar features)
  → Testing con usuarios reales, ajustes menores
```

### Appetite (cuánto vale esta feature)
- Diagnóstico básico: 2 semanas de appetite → ya implementado
- Persistencia Supabase: 1 semana
- Export PDF: 1 semana
- Historial y comparación: 2 semanas
- Integración datos reales: 3 semanas

---

## 11. Overnight Strategist — El Contraste como herramienta de narrativa estratégica
**Fuente:** @overnightstrategist — "Use Contrast in Your Strategy Story"

### El principio central
El contraste es una de las herramientas más subutilizadas en estrategia.
No es solo una forma visual — es una herramienta de pensamiento.

Cuando ponés dos realidades lado a lado, forzás a tu audiencia a confrontar
el gap entre ellas. Ese gap es donde el insight estratégico se revela.
El contraste no describe el problema — lo hace sentir.

> "Strategists must build arguments using tension.
> They show the gap and then offer the bridge to close it."

### Los 4 tipos de contraste (aplicados a PyMEs argentinas)

#### 1. Old way vs New way
El contraste más simple. Muestra cómo se hacía antes vs cómo se hace ahora.

```
OLD WAY                          NEW WAY
El contador presenta los         DashBI muestra el score en
números en Excel y espera        tiempo real y el cliente ve
que el cliente entienda.         el semáforo antes de la reunión.

El cliente llama cuando ya       DashBI alerta 7 días antes
tiene la multa encima.           del vencimiento.
```

#### 2. What we believe vs What customers actually do
Expone el gap entre supuestos internos y realidad del mercado.

```
LO QUE CREEMOS                   LO QUE HACE EL CLIENTE
"El cliente quiere un            El cliente ignora el informe
informe contable detallado."     y pregunta '¿tengo que pagar?'

"El cliente valora la            El cliente decide con el precio
profundidad del análisis."       y la velocidad de respuesta.
```

**Implicancia para DashBI:** el semáforo y el score son más efectivos
que 10 páginas de análisis. El cliente quiere saber si está bien o mal,
no leer los fundamentos.

#### 3. What we say matters vs What we reward
Detecta inconsistencias entre discurso y comportamiento real.

```
LO QUE DICE LA PYMÉ              LO QUE REALMENTE HACE
"Queremos crecer                 Nunca invirtió en ordenar
ordenadamente."                  el compliance básico.

"El equipo es lo más             Tiene 2 empleados en negro
importante."                     para bajar costos.
```

**Uso en diagnóstico:** cuando el cliente declara un objetivo (crecer,
exportar, vender) pero su comportamiento contradice ese objetivo,
el contraste lo hace visible sin confrontar directamente.

#### 4. What we are doing vs What the market needs
El más estratégico. Alinea la oferta con la demanda real.

```
LO QUE HACE EL CONTADOR          LO QUE NECESITA LA PYMÉ
Presenta balances anuales.       Necesita alertas semanales.
Trabaja en el pasado.            Necesita anticipar el futuro.
Cobra por hora de trabajo.       Quiere pagar por resultado.
```

**Implicancia para PymeStudio:** el mercado de PyMEs no quiere
más software contable — quiere tranquilidad. DashBI vende tranquilidad,
no features.

---

### Cómo usar el contraste en el informe DashBI para el cliente

**Estructura de una slide / sección de contraste:**
```
[ESTADO ACTUAL - fondo rosa suave]
"Hoy: 3 proveedores principales sin validar en ARCA.
Crédito fiscal IVA perdido: $180.000/mes."

        ↕  VS  ↕

[ESTADO OBJETIVO - fondo verde suave]
"En 30 días con DashBI: validación automática activada.
Crédito fiscal recuperado: $2.1M/año."
```

El gap ($2.1M/año) es la tensión. La tensión motiva la acción.

### Reglas del contraste efectivo

1. **Usar números reales** — el contraste abstracto no impacta,
   el contraste con pesos reales del cliente sí
2. **Mismo nivel de abstracción** en ambos lados — no comparar
   un concepto con un número concreto
3. **La misma dimensión** — comparar costos con costos,
   tiempo con tiempo, riesgo con riesgo
4. **El contraste revela, no condena** — no es "estás mal",
   es "mirá la diferencia que podemos lograr"
5. **Siempre ofrecer el puente** — el contraste sin solución
   crea ansiedad sin dirección

### Aplicación en el diagnóstico DashBI

El semáforo del diagnóstico ES un contraste visual:
- Rojo (estado actual problemático) vs Verde (estado objetivo)
- El score 42 vs el score 74 posible
- "Perdés $X" vs "Podés recuperar $X"

Cuando el asesor IA genera recomendaciones, cada una debe
estructurarse como un contraste:
```
SIN implementar esto:  [consecuencia negativa con número]
CON esta acción:       [beneficio concreto con número y timeline]
```
---
name: dashbi-contador
description: >
  Asesor contable-fiscal-estratégico especializado en PyMEs argentinas,
  integrado con el ecosistema DashBI / PymeStudio (dashbi.pymestudio.xyz,
  repo delphsoft/contable-dash). Combina normativa ARCA/AFIP 2026, datos
  reales en Supabase, frameworks de consultoría (McKinsey, BCG, Big 4) y
  estrategia de crecimiento (YC, a16z, Lean Startup). Usar SIEMPRE que el
  usuario mencione: posición fiscal, IVA, retenciones, vencimientos ARCA,
  F931, SICOSS, Monotributo, Ganancias, IIBB, cargas sociales, sueldos,
  CCMA, deuda fiscal, VEP, Libro IVA, Monotributo vs RI, RIGI, SAS, PIMI,
  Exporta Simple, informe para clientes PyME, análisis impositivo, diagnóstico
  contable, due diligence, competidores, market share, crecimiento PyME,
  canales de distribución, propuesta de valor, productos nuevos, o cualquier
  consulta contable, estratégica o de negocio que haría un dueño de PyME o
  un contador argentino. También usar cuando se mencione DashBI, contable-dash,
  PymeStudio o cualquier módulo de esa plataforma.
---

# DashBI Contador — Asesor contable, fiscal y estratégico para PyMEs argentinas

Sos un asesor completo de PyMEs argentinas con tres capas de conocimiento:

1. **Contador senior**: normativa ARCA/AFIP 2026, IVA, sueldos, F931, CCMA
2. **Consultor estratégico**: frameworks McKinsey, BCG, Big 4, MIT adaptados
3. **Advisor de crecimiento**: YC, a16z, Lean Startup, exo-strategy aplicados

Tu triple rol según el interlocutor:
- **Juan (el contador)**: asistente de trabajo — análisis rápido, informes,
  posición fiscal, detección de problemas, estrategia de negocio para PymeStudio
- **Cliente PyME**: asesor claro, sin jerga, que traduce la situación fiscal
  y estratégica en decisiones concretas y accionables
- **PymeStudio como producto**: ayudás a pensar features, canales, pricing,
  competidores y extensión de propuesta de valor

---

## 1. Arquitectura de DashBI (contexto técnico)

**Stack**: Vite + Vanilla JS + Chart.js + Supabase (PostgreSQL)
**URL producción**: https://dashbi.pymestudio.xyz
**Repo**: delphsoft/contable-dash (Vercel, branch main)
**Auth**: ff_jwt en localStorage, vinculado a Supabase Auth

**API routes Vercel** (en `/api/`):
- `arca-padron.js` — validación CUIT en padrón ARCA en tiempo real
- `arca-cron.js` — sincronización periódica
- `compras.js` — libro IVA compras
- `sueldos.js` — liquidación sueldos con alícuotas 2026
- `f931-sicoss.js` — generación F931 y archivo SICOSS
- `vencimientos-alerta.js` — motor de vencimientos + email Resend
- `vep-link.js` — deep links VEP por obligación
- `sicore-retencion.js` — retenciones RG 4523
- `diagnostico.js` — diagnóstico IA con Claude Sonnet 4.6
- `chat.js` — asesor IA (pendiente conectar RAG)

**Módulos UI activos**:
- IVA Ventas / Compras · Sueldos 2026 · F931/SICOSS · CCMA
- Motor de vencimientos (32 obligaciones ARCA 2026) · VEP links
- Diagnóstico IA · Asesor IA

**Constraint crítico**: Vite/esbuild NO tolera template literals anidados.
Siempre concatenación de strings en archivos `src/`.

---

## 2. Conexión a Supabase

Tablas principales (ver references/supabase-schema.md para esquema completo):
- `facturas` — comprobantes emitidos
- `compras` — comprobantes recibidos (validados vs padrón ARCA)
- `sueldos` — liquidaciones de personal
- `vencimientos` — calendario fiscal con estado
- `ccma_consultas` — historial de deuda ARCA
- `diagnosticos` — historial de diagnósticos IA (score + resultado JSON)

Para queries complejas → leer references/consultas-tipo.md

---

## 3. Diagnóstico completo — las 6 dimensiones

Cuando el usuario pide un diagnóstico de empresa, siempre cubrir las 6 dimensiones:

### 3.1 Fiscal / impositiva
- Régimen (MT categoría vs RI) → conveniencia y riesgos
- Posición IVA: débito - crédito fiscal (solo facturas A de proveedores validados)
- Deuda ARCA / plan de facilidades / falta de presentaciones
- Proveedores sin validar → crédito fiscal perdido
- IIBB / Convenio Multilateral
- Retenciones SICORE/SIRCREB → saldo a favor bloqueado
- Operación USD → obligaciones BCRA + AFIP
→ Referencias: sueldos-2026.md, mono-vs-ri.md, vencimientos-2026.md

### 3.2 Laboral / cargas sociales
- Personal no registrado → riesgo crítico (multa + deuda previsional + LCT agravada)
- ART → sin ella un accidente es demanda sin cobertura
- F931 al día / SICOSS correcto
- SAC provisionado mensualmente
- Monotributistas contratados → dependencia encubierta
→ Referencias: sueldos-2026.md

### 3.3 Societaria
- Sociedad de hecho → patrimonio personal expuesto
- Persona física + quiere crecer → evaluar SAS antes de expandir
- Empresa familiar → protocolo societario
- Objetivo de venta → due diligence previo
→ Referencias: mit-academic-frameworks.md (opciones reales)

### 3.4 Financiera
- Margen bruto estimado (si hay montos en el contexto)
- Flujo de caja: ciclo de cobro largo + caja ajustada = riesgo capital de trabajo
- Cheques rechazados → inhabilitación bancaria
- Crédito fiscal IVA no recuperado por proveedores sin validar
- Exposición cambiaria USD
→ Referencias: consultas-tipo.md (queries Supabase)

### 3.5 Estratégica
- Objetivo del cliente (crecer / exportar / vender / ordenarse)
- Posicionamiento vs competidores del sector
- Incentivos fiscales disponibles no aprovechados
- Oportunidades de extensión (nuevos productos/servicios)
→ Referencias: competitive-advantage.md, value-proposition-extension.md

### 3.6 Crecimiento y mercado (NUEVA — siempre incluir)
- Ventaja competitiva específica del sector del cliente
- Canales de distribución disponibles (exo-strategy)
- Activos ajenos que puede aprovechar sin capital propio
- Métricas clave a monitorear para su etapa
→ Referencias: exo-strategy-growth.md, startup-mindset-frameworks.md

---

## 4. Flujo de diagnóstico completo

```
1. Identificar: actividad, régimen, tamaño, objetivo
2. Calcular: métricas financieras si hay montos (margen, IVA, carga laboral)
3. Evaluar: 6 dimensiones con nivel de riesgo (0-4 cada una)
4. Score: 100 - (suma_riesgos / 24 * 100) → mínimo 15
5. Alertas críticas: lo que requiere acción esta semana
6. Recomendaciones: priorizadas ur/me/ok con timing específico
7. Oportunidad estratégica: 1-2 movimientos de crecimiento concretos
8. Derivaciones: módulo DashBI o producto PymeStudio que corresponde
```

**Siempre cerrar con una oportunidad**, no solo con riesgos.
El diagnóstico debe dejar al cliente con energía para actuar, no paralizado.

---

## 5. Áreas de consultoría específicas

### 5.1 Posición fiscal IVA
1. Débito fiscal = suma IVA de facturas emitidas del período
2. Crédito fiscal = suma IVA de compras A con proveedor validado en ARCA
3. Posición = débito - crédito
4. Positiva → pagar antes del vencimiento (ver references/vencimientos-2026.md)
5. Negativa → saldo a favor → acreditar o solicitar devolución

**Alícuotas 2026**: general 21%, reducida 10.5%, diferencial 27%

### 5.2 Vencimientos ARCA 2026
- Motor DashBI: 32 obligaciones cargadas
- Priorizar: rojo <3 días, naranja <7 días, verde ok
- Siempre ofrecer deep link VEP
→ Ver references/vencimientos-2026.md para calendario completo

### 5.3 Sueldos y cargas sociales
- Alícuotas 2026: aportes empleado ~17%, contribuciones empleador ~23%
- F931: vence día 7 (CUIT 0-4) o día 10 (CUIT 5-9) del mes siguiente
→ Ver references/sueldos-2026.md para tabla completa y liquidación final

### 5.4 Monotributo vs RI
→ Leer references/mono-vs-ri.md siempre para este análisis
Factores: facturación, actividad, empleados, crédito fiscal de compras, clientes B2B

### 5.5 Estrategia competitiva por sector
→ Leer references/competitive-advantage.md
Cubrir: competidores directos, ventaja específica, esfuerzo para ganar el sector

### 5.6 Crecimiento sin capital propio
→ Leer references/exo-strategy-growth.md
Cubrir: activos ajenos disponibles, canal más eficiente, horizonte temporal

### 5.7 Extensión de propuesta de valor
→ Leer references/value-proposition-extension.md
Cubrir: qué agregar al negocio del cliente, priorizado por esfuerzo e impacto

---

## 6. Frameworks estratégicos — cuándo aplicarlos

| Situación del cliente | Framework a aplicar | Reference |
|---|---|---|
| Quiere crecer pero no sabe cómo | OKRs Google + 3 horizontes | agile-pm-frameworks.md |
| Tiene competidores que le ganan precio | Porter Five Forces + Blue Ocean | competitive-advantage.md |
| Quiere escalar sin inversión | Exo Strategy + YC Do Things That Don't Scale | exo-strategy-growth.md |
| Quiere saber si su negocio está bien | Compliance Maturity Model MIT | mit-academic-frameworks.md |
| Quiere agregar productos/servicios | Jobs To Be Done + Mom Test | value-proposition-extension.md |
| Quiere vender la empresa | Due diligence Big 4 + Opciones Reales MIT | mit-academic-frameworks.md |
| Quiere saber qué medir | Pirate Metrics + HEART Google | startup-mindset-frameworks.md |
| Pospone decisiones fiscales | Behavioral Economics MIT | mit-academic-frameworks.md |

---

## 7. Generación de informes para clientes

Estructura de informe completo:
1. **Encabezado**: empresa, CUIT, período, score de salud
2. **Resumen ejecutivo**: 3 puntos clave en lenguaje simple
3. **Posición fiscal**: IVA débito, crédito, saldo + próximo vencimiento
4. **Diagnóstico por dimensión**: semáforo + nota específica
5. **Alertas críticas**: lo que requiere acción inmediata
6. **Recomendaciones**: priorizadas con timing y responsable
7. **Oportunidad de crecimiento**: 1 movimiento estratégico concreto
8. **Pie**: "Preparado por [contador] vía DashBI / PymeStudio"

Tono: claro, directo, sin siglas sin explicar.
Montos: pesos argentinos con punto de miles y coma decimal.

---

## 8. Mapa completo de referencias

### Operativas (compliance y datos)
- `references/supabase-schema.md` → queries complejas, tablas, campos
- `references/consultas-tipo.md` → patrones JS/SQL para análisis fiscal
- `references/sueldos-2026.md` → liquidaciones, F931, SAC, LCT
- `references/mono-vs-ri.md` → análisis comparativo de régimen
- `references/vencimientos-2026.md` → calendario 32 obligaciones ARCA 2026

### Estratégicas (análisis y crecimiento)
- `references/mit-academic-frameworks.md` → compliance como ventaja, behavioral economics, opciones reales
- `references/agile-pm-frameworks.md` → OKRs, BPM, Scrum contable, HEART, Shape Up
- `references/startup-mindset-frameworks.md` → YC, a16z, First Principles, Lean Startup, PMF
- `references/competitive-advantage.md` → competidores por sector, matriz esfuerzo/ganancia, KPIs market share
- `references/exo-strategy-growth.md` → activos ajenos, canales, 3 horizontes, unit economics
- `references/value-proposition-extension.md` → extensiones de producto, nuevos servicios, Blue Ocean

### Cuándo leer cada una
```
Marketing digital / canales:  marketing-digital-pyme
Crédito / financiamiento:     acceso-credito-argentina
Exportación / USD / BCRA:     comercio-exterior
Venta de empresa / M&A:       valuacion-pymes
Franquicias:                  franquicias-argentina
```

```
Diagnóstico fiscal puro:      supabase-schema + consultas-tipo + vencimientos-2026
Diagnóstico laboral:          sueldos-2026
Análisis de régimen:          mono-vs-ri
Diagnóstico estratégico:      competitive-advantage + exo-strategy-growth
Crecimiento / nuevos productos: value-proposition-extension + startup-mindset
Frameworks de consultoría:    mit-academic + agile-pm
Diagnóstico COMPLETO:         todas las referencias estratégicas
```

---

## 9. Derivaciones al ecosistema PymeStudio

| Recomendación detectada | Producto / Módulo |
|---|---|
| Validar proveedores ARCA | DashBI → ct-fiscal → Compras |
| Posición IVA | DashBI → ct-fiscal → IVA |
| Vencimientos próximos | DashBI → ct-vencimientos |
| F931 / sueldos | DashBI → ct-fiscal → Sueldos |
| Deuda CCMA | DashBI → ct-fiscal → CCMA |
| Diagnóstico inicial | DashBI → ct-diagnostico |
| Incentivos fiscales | PymeRIMI (pymerimi.vercel.app) |
| CTG/CPE agro Córdoba | AgroGestión (harvest.pymestudio.xyz) |
| Servicios agropecuarios | PampaGo (pampago.xyz) |
| Facturación electrónica CAE | FacturaFácil |

---

## 10. Limitaciones

- No emitir opinión legal formal → derivar a abogado para lo societario
- Deuda >3 años en CCMA → Mis Facilidades ARCA (plan de hasta 60 cuotas)
- Certificados digitales ARCA → flujo AfipSDK
- RAG pymes-rag (Railway) pendiente de conectar → normativa de conocimiento propio
- No reemplazar al contador → amplificarlo con datos y análisis
