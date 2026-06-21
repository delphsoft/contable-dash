# Startup Mindset — YC, a16z, First Principles aplicados a PyME Argentina

## Filosofía de uso
Estos frameworks vienen del ecosistema de venture capital y startups de Silicon Valley.
Aplicados no para convertir a las PyMEs en startups, sino para que el contador
piense con mentalidad de producto y el cliente PyME piense con mentalidad de fundador.

---

## 1. Y Combinator — Do Things That Don't Scale (Paul Graham)
**Fuente:** paulgraham.com/ds.html

### El principio
En la etapa inicial, hacer manualmente lo que después se automatiza.
No esperar el sistema perfecto para empezar a dar valor.

### Aplicación para PymeStudio en etapa actual
```
❌ Esperar a tener RAG + IA perfecta + Supabase integrado
✅ Dar diagnóstico con parser local YA + mejorar iterando

❌ Esperar a tener 100 clientes para construir el panel de cartera
✅ Atender 5 clientes manualmente, entender qué necesitan, luego automatizar
```

### Para el contador que usa DashBI
- Empezar con 3 clientes beta
- Hacer el diagnóstico con ellos en persona
- Anotar qué preguntas hacen que el sistema no responde
- Esas preguntas se convierten en la próxima feature

### Threshold de automatización
```
Si hacés lo mismo manualmente 3+ veces → automatizarlo en DashBI
Si un cliente pregunta lo mismo 3+ veces → agregarlo al skill
```

---

## 2. YC — The Mom Test aplicado a discovery de features
**Fuente:** Rob Fitzpatrick "The Mom Test"

### El problema
Los usuarios mienten (sin querer) cuando les preguntás "¿te gustaría esta feature?"
Siempre dicen que sí para no herir sentimientos.

### Las preguntas correctas para validar features DashBI

```
❌ "¿Te gustaría tener un historial de diagnósticos?"
✅ "¿Cuándo fue la última vez que quisiste comparar la situación de
   un cliente con un mes anterior? ¿Cómo lo resolviste?"

❌ "¿Usarías un PDF del diagnóstico?"
✅ "¿Alguna vez tuviste que explicarle a un cliente su situación fiscal?
   ¿Qué usaste? ¿Cuánto tiempo te llevó?"

❌ "¿Pagarías $19 USD por esto?"
✅ "¿Cuánto pagás actualmente por el software de gestión?
   ¿Qué te frustra de ese sistema?"
```

### Discovery insights probables para DashBI
- El dolor real del contador no es el análisis sino la **comunicación al cliente**
- El dolor real del cliente PyME no es no saber sino **no saber qué hacer**
- El PDF para entregar al cliente probablemente tiene más valor que el score

---

## 3. a16z — Software is Eating the World aplicado a contabilidad
**Fuente:** Marc Andreessen "Why Software Is Eating the World" (2011)

### La tesis aplicada a servicios profesionales argentinos
```
2010: El contador hace todo manualmente
2015: Software de gestión reemplaza planillas
2020: Facturación electrónica automatiza la emisión
2025: IA diagnostica, alerta y recomienda
2026: El contador que no usa IA pierde clientes ante el que sí usa
```

### El rol del contador en la era de la IA (a16z framework)
No desaparece — se eleva:
- **Antes:** ingresa datos, controla vencimientos, presenta DDJJ
- **Después:** interpreta diagnósticos, toma decisiones estratégicas, asesora

DashBI hace la capa operativa → el contador hace la capa estratégica.

### Implicancia de pricing
El valor no es el software — es el tiempo del contador liberado:
```
Tiempo liberado por DashBI: ~22 horas/mes
Hora de contador: ~$15.000 ARS = ~$12 USD
Valor mensual liberado: ~$264 USD
Precio DashBI Compliance: $19 USD/mes
ROI para el contador: 13x
```

---

## 4. First Principles Thinking (Elon Musk / Aristóteles)
**Fuente:** "First Principles: Elon Musk on the Power of Thinking for Yourself"

### Aplicado al compliance argentino

**Razonamiento por analogía (cómo NO pensar):**
"Usamos este formulario porque siempre lo hicimos así"
"El Monotributo porque mi contador anterior me lo puso"

**First Principles (cómo SÍ pensar):**
```
Pregunta 1: ¿Cuál es el objetivo real de pagar impuestos?
→ Cumplir la obligación legal al menor costo posible

Pregunta 2: ¿Qué determina cuánto pago?
→ Régimen × base imponible × alícuota - créditos

Pregunta 3: ¿Qué puedo controlar yo?
→ Régimen (MT vs RI), deducciones, timing, incentivos

Pregunta 4: ¿Qué estoy dejando de controlar hoy?
→ Crédito fiscal de proveedores, incentivos no aprovechados
```

### Template de First Principles para diagnóstico DashBI
Cuando una empresa tiene alta carga fiscal:
1. ¿Es el régimen correcto? (MT vs RI)
2. ¿Se están computando todos los créditos posibles?
3. ¿Hay incentivos no aprovechados? (RIGI, PIMI, Exporta Simple)
4. ¿La estructura societaria es la más eficiente?
5. ¿El timing de compras/gastos está optimizado?

---

## 5. Paul Graham — Maker vs Manager Schedule
**Fuente:** paulgraham.com/makersschedule.html

### El problema del dueño de PyME
```
Manager Schedule: reuniones, llamadas, administración fragmentada
Maker Schedule:   bloques largos para crear, vender, producir
```

Los dueños de PyMEs argentinas pasan demasiado tiempo en **Manager Schedule
obligatorio** (ir al banco, ir al contador, buscar papeles, responder ARCA).

### DashBI como liberador del Maker Schedule
```
❌ Sin DashBI:
  Lunes: ir al contador (2hs) + buscar comprobantes (1hs)
  Jueves: pagar vencimiento que casi se olvida (30 min de stress)

✅ Con DashBI:
  Lunes: notificación automática → 5 min para revisar → VEP link
  Jueves: vencimiento ya pagado hace 3 días
```

**Argumento de venta:** DashBI no vende software — vende tiempo de Maker Schedule.

---

## 6. Sequoia Capital — RFS (Request for Startups) adaptado
**Fuente:** Sequoia Capital "Sequoia Arc" program frameworks

### Los criterios de Sequoia para evaluar oportunidades — adaptados a DashBI

```
1. LARGE MARKET:
   PyMEs argentinas: 650.000+ formales
   Compliance obligatorio para todas
   → Mercado: grande y cautivo ✓

2. HAIR ON FIRE:
   ¿El problema duele lo suficiente?
   Multa ARCA: sí duele ✓
   Deuda acumulada: sí duele ✓
   Proveedor sin validar → crédito perdido: duele cuando se enteran ✓

3. UNIQUE INSIGHT:
   DashBI conecta datos reales (Supabase) + normativa específica (ARCA 2026)
   + IA (Claude) — ningún competidor tiene las tres ✓

4. TEAM:
   Juan: contador + developer + dominio argentino
   → Raro y valioso: entiende los dos lados ✓

5. PRODUCT:
   Ya deployado, ya tiene usuarios, ya tiene API key funcionando ✓
```

---

## 7. Stripe — Payments thinking aplicado a monetización DashBI
**Fuente:** Stripe "Building a Business" documentation

### El modelo mental de Stripe para pricing
"Cobrar por valor entregado, no por features"

### Aplicado a los planes PymeStudio

```
Compliance USD 19/mes
→ Valor: tranquilidad de no tener multas
→ Equivale a: 1 hora de contador evitada

Campo USD 29/mes
→ Valor: trazabilidad agro (CTG/CPE) + compliance
→ Equivale a: evitar 1 multa SENASA por año

Empresa USD 79/mes
→ Valor: compliance + sueldos + diagnóstico IA + asesor
→ Equivale a: 6 horas de contador evitadas por mes

Pro USD 149/mes
→ Valor: todo + cartera de clientes + informes para entregar
→ Para contadores con 5+ clientes: se paga solo con 1 cliente
```

### Freemium como adquisición (Stripe model)
```
Free tier: 1 diagnóstico por mes
→ Objetivo: capturar CUIT + email + datos de empresa
→ Trigger de upgrade: "hacé el diagnóstico completo con datos reales"
```

---

## 8. Lenny Rachitsky — Product-Market Fit para B2B
**Fuente:** Lenny's Newsletter "How to know if you have PMF"

### El test de PMF para DashBI

**Pregunta de Sean Ellis (PMF Survey):**
"¿Cómo te sentirías si no pudieras usar DashBI mañana?"
- Muy decepcionado → PMF ✓ (objetivo: >40% de usuarios)
- Un poco decepcionado → near-PMF
- No decepcionado → no hay PMF

### Señales de PMF que buscar en DashBI
```
✓ Usuarios que lo recomiendan sin que se los pidamos
✓ Clientes que se enojan cuando algo no funciona (síntoma de dependencia)
✓ Contador que le da acceso a sus clientes (distribuidor involuntario)
✓ Uso repetido del diagnóstico (vuelven cada mes)
✓ Preguntan cuándo llega la siguiente feature
```

### Qué medir en Supabase para detectar PMF
```sql
-- Retención a 30 días
SELECT COUNT(DISTINCT user_id) FROM diagnosticos
WHERE created_at > NOW() - INTERVAL '30 days'
AND user_id IN (
  SELECT user_id FROM diagnosticos
  WHERE created_at < NOW() - INTERVAL '30 days'
)

-- Frecuencia de uso
SELECT user_id, COUNT(*) as diagnosticos_por_mes
FROM diagnosticos
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY 2 DESC
```

---

## 9. Amazon — Working Backwards / PR-FAQ para nuevas features
**Fuente:** Amazon "Working Backwards" methodology (Colin Bryar & Bill Carr)

### Antes de construir cualquier feature nueva en DashBI: escribir el PR-FAQ

**Template para "Historial de diagnósticos":**

```
PRESS RELEASE (ficticio, fecha futura):

"DashBI lanza historial de salud empresarial para PyMEs argentinas.
Los dueños de PyMEs ahora pueden ver cómo evolucionó su score fiscal
en el tiempo, con comparación mes a mes y alertas de regresión."

FAQ:

P: ¿Para qué sirve ver el historial?
R: Para demostrar mejora al banco cuando pedís un crédito.

P: ¿Cuánto tiempo guarda el historial?
R: 24 meses — suficiente para un ciclo fiscal completo.

P: ¿Lo puede ver el contador y el cliente?
R: Sí, con distintos niveles de detalle por rol.
```

Si el PR-FAQ no suena emocionante → la feature no vale la pena construir.

---

## 10. Startup Mindset — Los 10 principios para el contador PyME moderno

Sintetizando todos los frameworks anteriores:

```
1. VELOCIDAD:     Un diagnóstico en 5 minutos > una reunión de 2 horas
2. DATOS:         Las decisiones se toman con números, no con intuición
3. ITERACIÓN:     El sistema mejora con cada cliente, cada diagnóstico
4. DISTRIBUCIÓN:  El cliente que trae a otro cliente es el mejor marketing
5. LEVERAGE:      1 contador + DashBI = capacidad de 5 contadores
6. PROACTIVIDAD:  Alertar antes > resolver después de la multa
7. FOCO:          Menos features, mejor ejecutadas > todo a medias
8. MÉTRICAS:      Si no se mide, no se mejora (score de salud)
9. EMPATÍA:       El cliente no quiere software — quiere tranquilidad
10. COMPUESTO:    Cada cliente bien atendido construye reputación duradera
```
