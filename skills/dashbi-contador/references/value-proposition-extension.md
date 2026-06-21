# Extensión de Propuesta de Valor — Productos y Servicios a Agregar

## Marco de decisión
Antes de agregar cualquier producto: ¿aumenta el LTV del cliente actual
o abre un segmento nuevo? Los mejores movimientos hacen las dos cosas.

**Fuentes:** Jobs To Be Done (Christensen), Blue Ocean Strategy (Kim & Mauborgne),
Product-Led Growth (Wes Bush), Ecosystem Plays (a16z)

---

## 1. Extensiones de producto inmediatas (0-3 meses)

### 1.1 DashBI PDF Report — Informe para entregar al cliente
**Job to be done:** El contador necesita algo profesional para mostrarle al cliente
**Descripción:** Exportar el diagnóstico como PDF branded con logo del estudio
**Stack:** jsPDF o @react-pdf/renderer (ya usado en FacturaFácil)
**Precio:** Incluido en plan Pro / USD 3 por PDF en plan Compliance
**Esfuerzo:** 1 semana
**Impacto:** El contador lo justifica con un solo cliente → sube el plan

```
Template del PDF:
- Cover: logo del estudio + nombre cliente + fecha
- Página 1: Score y resumen ejecutivo (3 bullets)
- Página 2: Semáforo por dimensión con notas
- Página 3: Recomendaciones priorizadas con timeline
- Página 4: Próximos vencimientos (30 días)
- Footer: "Preparado con DashBI · PymeStudio · dashbi.pymestudio.xyz"
```

---

### 1.2 DashBI Historial — Score evolutivo en el tiempo
**Job to be done:** Ver si la empresa está mejorando o empeorando
**Descripción:** Guardar cada diagnóstico en Supabase + gráfico de score mensual
**Stack:** Supabase tabla `diagnosticos` + Chart.js (ya en el proyecto)
**Precio:** Incluido en todos los planes pagos
**Esfuerzo:** 3 días (schema + query + gráfico)
**Impacto:** Retención — el cliente no se va porque pierde el historial (switching cost)

```sql
CREATE TABLE diagnosticos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  cuit text,
  score int,
  contexto text,
  resultado jsonb,
  created_at timestamptz DEFAULT now()
);
```

---

### 1.3 DashBI Alertas WhatsApp — Vencimientos por WhatsApp
**Job to be done:** Recibir la alerta donde el cliente realmente está
**Descripción:** Integración Twilio o WhatsApp Business API para alertas de vencimiento
**Stack:** Twilio (ya usado en LastMile/ParcelMVP) o Meta WhatsApp Cloud API
**Precio:** USD 3/mes adicional o incluido en planes Empresa+
**Esfuerzo:** 1 semana
**Impacto:** El cliente que recibe el WhatsApp renueva — el que no, se olvida

**Mensaje tipo:**
```
🟡 DashBI Alerta — Vencimiento en 5 días
IVA mensual período 05/2026
Monto estimado: $84.000
→ Pagar VEP: [link directo]
→ Ver detalle: dashbi.pymestudio.xyz
```

---

## 2. Extensiones de servicio (1-6 meses)

### 2.1 Sesión de diagnóstico 1:1 con Juan
**Job to be done:** El cliente quiere que un contador real le explique el diagnóstico
**Descripción:** Sesión de 45 minutos vía Zoom después del diagnóstico IA
**Precio:** USD 49 por sesión (o incluido en plan Pro)
**Esfuerzo:** Cero desarrollo — solo agenda (Calendly)
**Impacto:** Alto margen, alta satisfacción, convierte a clientes pagos

**Funnel:**
```
Diagnóstico gratis → "Hablá con un contador → USD 49" → sesión → upgrade a plan pago
```

**Esto es lo que hace Doola:** el SaaS da la herramienta, el humano cierra.

---

### 2.2 Plan Retención Contable — Suscripción mensual con contador
**Job to be done:** Tener un contador disponible sin pagar un estudio tradicional
**Descripción:** USD 99/mes = DashBI Empresa + 1 hora de consultoría mensual con Juan
**Esfuerzo:** Cero desarrollo — operacional
**Impacto:** LTV altísimo, bajo churn (tiene relación personal con Juan)
**Capacidad:** Juan puede atender 20 clientes en este plan = USD 1.980/mes estable

---

### 2.3 Liquidación de sueldos como servicio
**Job to be done:** El dueño PyME no quiere hacer el F931, quiere que alguien lo haga
**Descripción:** Juan liquida sueldos usando DashBI + entrega F931 y recibos
**Precio:** USD 30-60/mes por empleado (depende de convenio)
**Esfuerzo:** Cero desarrollo — DashBI ya tiene el módulo de sueldos
**Impacto:** Ingreso recurrente predecible + dato de nómina en Supabase

---

## 3. Nuevos productos (3-12 meses)

### 3.1 DashBI Proveedores — Marketplace de servicios confiables
**Job to be done:** El PyME necesita un buen contador/abogado/asesor impositivo
**Descripción:** Directorio de profesionales verificados por PymeStudio, con reviews
**Modelo:** Comisión del 15% por primera sesión referida / listing fee USD 9/mes
**Esfuerzo:** 4 semanas
**Impacto:** Nuevo revenue stream + más valor para el cliente que no tiene contador

**Por qué funciona:**
- PymeStudio ya tiene la confianza del cliente PyME
- El profesional paga por el acceso a clientes ya calificados (vienen con su diagnóstico)
- El cliente llega al profesional con contexto completo → menos tiempo de onboarding

---

### 3.2 DashBI Crédito — Conexión con SGR / Fintech lending
**Job to be done:** El PyME quiere crédito y no sabe cómo demostrarlo al banco
**Descripción:** El score de DashBI + historial fiscal = carpeta de crédito lista
**Partners:** Garantizar (SGR), Afluenta, Mercado Crédito, Banco Nación PyME
**Modelo:** Comisión por lead calificado (USD 10-30 por cliente que toma crédito)
**Esfuerzo:** 2 semanas de desarrollo + acuerdo comercial
**Impacto:** El cliente que obtiene crédito gracias a DashBI nunca se va

**Flujo:**
```
Score DashBI > 70 + 6 meses de historial
→ "Sos elegible para crédito PyME hasta $X"
→ [Solicitar crédito con tu carpeta DashBI]
→ Partner procesa, DashBI cobra comisión
```

---

### 3.3 DashBI Contratos — Generación de contratos con IA
**Job to be done:** El PyME necesita un contrato de locación de servicios / proveedor
**Descripción:** Claude genera contratos básicos adaptados a la actividad y jurisdicción
**Stack:** Claude API + pdf generado (ya tenemos el pipeline)
**Precio:** USD 9 por contrato / incluido en plan Pro
**Esfuerzo:** 2 semanas
**Impacto:** Extiende el valor de Claude más allá de lo fiscal

**Templates prioritarios:**
- Contrato de locación de servicios (el más pedido)
- Contrato de provisión de mercadería
- Acuerdo de confidencialidad (NDA)
- Contrato de trabajo (con convenio colectivo)

**Disclaimer claro:** "Este documento es orientativo. Consultá con un abogado para firma."

---

### 3.4 DashBI Benchmark — Comparación vs sector
**Job to be done:** Saber si mi empresa está bien o mal vs el promedio del sector
**Descripción:** Con los diagnósticos acumulados, mostrar percentil por actividad
**Ejemplo:** "Tu score fiscal de 74 está en el percentil 68 de panaderías argentinas"
**Stack:** Supabase analytics + Chart.js
**Precio:** Incluido en plan Empresa+
**Esfuerzo:** 2 semanas (necesita masa crítica de datos primero)
**Impacto:** Crea competencia entre empresas → engagement + retención

---

### 3.5 DashBI Academia — Educación fiscal para dueños PyME
**Job to be done:** Entender por qué hago lo que hago (no solo que alguien lo haga)
**Descripción:** Micro-cursos de 5-10 minutos sobre temas del diagnóstico
**Ejemplos:**
- "Cómo funciona el IVA para tu negocio" (5 min)
- "Diferencias entre Monotributo y RI con ejemplos reales" (8 min)
- "Qué es el F931 y por qué importa" (5 min)
- "Cómo prepararte para una inspección ARCA" (10 min)
**Precio:** Gratis para clientes pagos / USD 9 por curso para no clientes
**Esfuerzo:** 1 semana por curso (texto + quiz + certificado)
**Impacto:** SEO orgánico potente + posicionamiento de autoridad + conversión

---

## 4. Blue Ocean — Crear mercado nuevo (12-24 meses)

### 4.1 PymeScore — Score público de salud empresarial
**La idea:** Como el score crediticio pero para la salud operativa de la empresa
**Propuesta disruptiva:** Una PyME puede compartir su PymeScore con un proveedor
o un banco como prueba de confiabilidad — sin mostrar sus números privados.

```
PyME A tiene score 82 en DashBI
→ Genera un "PymeScore público" verificado
→ Lo muestra al proveedor que le quiere dar crédito comercial
→ Proveedor confía → le da 30 días de plazo en vez de pago anticipado
```

**Esto crea un network effect:** cuantas más empresas tienen PymeScore,
más vale el score (más proveedores y bancos lo aceptan como referencia).

---

### 4.2 DashBI para Franquicias — Compliance en red
**La idea:** Una franquicia necesita que todos sus franquiciados cumplan
**Propuesta:** El franquiciador paga DashBI para monitorear la salud fiscal
de toda su red de franquiciados desde un panel central.

```
Franquicia con 30 locales → 1 contrato DashBI Franquicia
→ Panel central con score de cada local
→ Alerta cuando un local tiene riesgo (para que el franquiciador intervenga)
→ Precio: USD 15/local/mes × 30 = USD 450/mes por un solo cliente
```

---

## 5. Priorización final de extensiones

```
Esfuerzo bajo + Impacto alto (HACER YA):
  ✓ PDF Report (1 semana)
  ✓ Historial de score (3 días)
  ✓ Sesión 1:1 con Juan (0 desarrollo - Calendly)
  ✓ Plan retención contable (0 desarrollo - operacional)

Esfuerzo medio + Impacto alto (PRÓXIMO SPRINT):
  → WhatsApp alertas (1 semana)
  → Liquidación sueldos como servicio (0 desarrollo)
  → DashBI Contratos (2 semanas)

Esfuerzo alto + Impacto muy alto (ROADMAP 6-12 meses):
  → DashBI Crédito (partnership SGR)
  → DashBI Proveedores (marketplace)
  → DashBI Benchmark (necesita datos)

Blue Ocean (validar concepto primero):
  → PymeScore público
  → DashBI para Franquicias
```

---

## 6. Extensión de propuesta de valor — Resumen ejecutivo

```
HOY (v1):
"Te digo cómo está tu empresa fiscalmente"

v2 (3 meses):
"Te digo cómo está, te aviso antes de que sea problema,
 y te genero el informe para tu contador o tu banco"

v3 (6 meses):
"Te digo, te aviso, y también lo resuelvo:
 liquido tus sueldos, genero tus contratos, te consigo el crédito"

v4 (12 meses):
"El sistema operativo contable de tu PyME —
 compliance, crédito, proveedores, equipo, todo en un lugar"
```

Esta progresión es exactamente la que siguieron Gusto (EEUU),
Xero (Australia) y Alegra (Colombia) para dominar sus mercados.
La diferencia: ninguno de ellos tiene la integración ARCA + IA de PymeStudio.
