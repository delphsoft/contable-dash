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
