# Exo Strategy — Apalancarse en Activos Ajenos para Crecer

## El principio
Las empresas que crecen más rápido no construyen todo propio.
Usan los activos, la distribución, la confianza y el capital de otros.
Para una PyME como PymeStudio, esto es más importante aún porque los recursos son limitados.

**Fuentes:** Exponential Organizations (Salim Ismail), Platform Strategy (MIT),
Open Innovation (Chesbrough), Ecosistema de Negocios (Iansiti & Levien)

---

## 1. Apalancarse en la distribución ajena

### 1.1 Contadores como canal de distribución
**El activo ajeno:** La cartera de clientes de cada contador
**El modelo:** El contador usa DashBI → recomienda a sus clientes → PymeStudio crece sin marketing

```
Estructura del programa:
- Contador se registra en plan Pro (USD 149/mes)
- Cada cliente que onboardea bajo su cuenta: descuento al cliente
- El contador factura la consultoría + PymeStudio la cobra por él (modelo white-label light)
- Beneficio para el contador: posicionarse como "contador con tecnología"
```

**Métricas objetivo:**
```
50 contadores × 10 clientes promedio = 500 PyMEs
CAC por este canal: ~$0 (el contador hace la venta)
LTV por cliente: USD 19 × 12 = USD 228/año
```

**Acción inmediata:**
- Crear programa "DashBI para Contadores" con landing page
- Primer 10 contadores beta: gratis 3 meses a cambio de feedback

---

### 1.2 Colegios profesionales como amplificadores
**El activo ajeno:** Lista de miembros + credibilidad + newsletter + eventos
**Targets en Córdoba:**
- CPCE Córdoba (Consejo Profesional de Ciencias Económicas)
- Colegio de Ingenieros
- Colegio de Arquitectos (sector construcción)

**Propuesta de valor para el colegio:**
> "Ofrecemos diagnóstico fiscal gratuito para tus matriculados durante 30 días.
> Vos les avisás, nosotros les damos valor, ellos confían en vos."

**Costo:** USD 0 — el colegio pone la distribución, PymeStudio pone el producto.

---

### 1.3 Proveedores de POS / facturación como integradores
**El activo ajeno:** Base instalada de clientes de sistemas de facturación
**Targets:**
- Tiendanube (e-commerce): 130.000+ tiendas en Argentina
- Bling (facturación): distribuido en Latam
- MercadoPago (pagos): millones de comercios

**Modelo de integración:**
```
Tiendanube detecta PyME con alta facturación → sugiere DashBI para compliance
MercadoPago ve actividad de cobros → alerta si el volumen supera tope MT
→ PymeStudio paga comisión por cliente referido (20-30% primer mes)
```

**Esfuerzo:** ALTO (requiere acuerdo comercial)
**Impacto:** MUY ALTO (acceso a base masiva)
**Horizonte:** 6-12 meses

---

## 2. Apalancarse en la infraestructura ajena

### 2.1 ARCA/AfipSDK como fuente de datos gratuita
**El activo ajeno:** Toda la normativa, padrón y datos fiscales de ARCA
**Cómo PymeStudio lo usa:**
- AfipSDK → consulta CCMA, padrón, CAE sin construir la integración desde cero
- ARCA publica RGs → PymeStudio las procesa y genera alertas antes que los competidores
- El dato fiscal es gratuito — el valor está en interpretarlo

**Moat resultante:**
Ningún competidor sin conocimiento técnico de AfipSDK puede replicar
la integración de datos reales que ya tiene DashBI.

---

### 2.2 Anthropic (Claude) como motor de IA sin inversión en ML
**El activo ajeno:** Billones de dólares invertidos por Anthropic en entrenar Claude
**PymeStudio paga:** USD 0.002 por diagnóstico

```
Costo de construir un modelo propio: USD 10M+
Costo de usar Claude vía API: USD 2 por 1.000 diagnósticos
ROI: infinito
```

**Estrategia:** Ir siempre a la API más nueva (Sonnet 4.6 hoy, lo que sea mejor mañana).
No hay lock-in del modelo — el sistema es el prompt + los datos, no el modelo.

---

### 2.3 Vercel + Supabase + Railway como infraestructura sin CapEx
**El activo ajeno:** Infraestructura cloud de clase mundial
**Costo actual PymeStudio:**
```
Vercel Hobby:    USD 0/mes
Supabase Free:   USD 0/mes
Railway (RAG):   USD 5/mes
Total infra:     USD 5/mes para soportar cientos de usuarios
```

**Punto de quiebre:**
- Vercel Pro necesario cuando se superen 100GB bandwidth o 100 serverless functions
- Supabase Pro cuando se superen 500MB database
- Ambos ocurren aproximadamente con 500-1.000 usuarios activos → momento de upgrade

---

## 3. Apalancarse en la confianza ajena

### 3.1 Clientes satisfechos como fuerza de ventas
**El activo ajeno:** La credibilidad del cliente que ya confía
**Modelo:** Referral program estructurado

```
Esquema:
- Cliente refiere a otro PyME → ambos reciben 1 mes gratis
- Contador refiere a 5 clientes → 1 mes gratis por cada uno
- Top referrer del trimestre → plan Pro gratis por 6 meses
```

**Mecánica técnica:**
- Link de referido con código único por usuario
- Tracking en Supabase: `referidos` table con `referrer_id`, `referred_id`, `status`
- Pago automático de crédito cuando el referido paga primer mes

---

### 3.2 Casos de éxito como contenido de ventas
**El activo ajeno:** La historia de éxito del cliente
**Formato:**
```
"[Nombre] tenía score 42 en enero. Implementó 3 recomendaciones de DashBI.
En abril su score es 78. Recuperó $X de crédito fiscal y evitó $Y en multas."
```

**Canales:** LinkedIn (para el contador), Instagram (para el dueño PyME),
CPCE newsletter, boca en boca en cámaras de comercio.

---

## 4. Apalancarse en el capital ajeno (sin levantar VC)

### 4.1 Subsidios y programas públicos
**Activos disponibles en Argentina 2026:**
```
FONTAR (CONICET/ANPCYT): subsidios para desarrollo tecnológico PyME
Primer empleo digital:    subsidio de sueldos para primer empleado tech
FONDEP:                   financiamiento para modernización de PyMEs
Programa Exporta Simple:  para empresas que facturen al exterior
Córdoba Innova:           programa provincial para startups tecnológicas
```

**Acción:** Presentar DashBI como "herramienta de modernización contable"
en la convocatoria FONTAR — el sistema ya está deployado, lo que falta
es la documentación técnica del impacto (312 horas → 48 horas/año).

---

### 4.2 Revenue-Based Financing en lugar de VC
**El concepto:** Prestarse contra MRR futuro en vez de diluir equity

```
Con USD 500/mes de MRR:
→ Clearco / Capchase ofrecen 3-6x MRR = USD 1.500-3.000
→ Se devuelve como % de los ingresos (10-20%)
→ Sin dilución, sin board, sin presión de exit
```

**Cuándo activarlo:** cuando el MRR supere USD 500 y haya churn < 5%.

---

### 4.3 Partnerships con clientes ancla como financiamiento implícito
**El modelo:** Un cliente grande paga por adelantado features que después
se convierten en producto para todos.

```
Ejemplo:
Estudio contable con 50 clientes paga USD 500/mes por:
- Panel de cartera (ver score de todos sus clientes)
- Batch de diagnósticos
- Informes PDF branded con su logo

PymeStudio cobra adelantado → financia el desarrollo → lo lanza para todos
El estudio tiene exclusiva de 3 meses → todos ganan
```

---

## 5. Estrategia de market share — Los 3 horizontes

### Horizonte 1 (0-6 meses): Dominar Córdoba Ciudad
**Objetivo:** 50 clientes pagos
**Táctica:**
- CPCE Córdoba: 1 charla = potencial 200 contadores en sala
- Cámaras de comercio barrio: diagnóstico gratuito presencial
- LinkedIn Juan: postear 1 caso de uso por semana con números reales
- Precio ancla: 1 mes gratis con diagnóstico incluido

**Inversión:** USD 0 en ads, solo tiempo de Juan
**Métrica clave:** 50 MRR en 6 meses = USD 950/mes

---

### Horizonte 2 (6-18 meses): Escalar a Córdoba + Buenos Aires
**Objetivo:** 300 clientes pagos
**Táctica:**
- Programa de contadores (canal × 50 contadores × 6 clientes c/u)
- Integración Tiendanube o MercadoPago (1 acuerdo = acceso masivo)
- SEO para "diagnóstico fiscal PyME Argentina" (contenido + posicionamiento)
- Primer empleado: developer o growth → financiado con MRR

**Inversión:** USD 500/mes en growth (ads + tools)
**Métrica clave:** USD 5.700/mes MRR = ~$57.000 ARR

---

### Horizonte 3 (18-36 meses): Latam — Chile, Uruguay, Colombia
**Objetivo:** Expansión regional con modelo validado en Argentina
**Táctica:**
- Adaptar el skill a normativa de cada país (Chile: SII, Colombia: DIAN)
- Partner local en cada país (contador o estudio que hace de distribuidor)
- El producto core no cambia — cambia la capa de normativa

**Por qué es viable:**
El moat real de PymeStudio no es la tecnología (replicable) sino
la **velocidad de ejecución + conocimiento local + datos acumulados**.
En Chile no hay nadie con AfipSDK (SII tiene su equivalente pero sin la integración IA).

---

## 6. Métricas de market share y esfuerzo

### Unit Economics objetivo

```
CAC (Costo de Adquisición):
  Canal directo (content + CPCE):  USD 15-25
  Canal contador (referido):       USD 5-10
  Canal partnership:               USD 2-5

LTV (Lifetime Value):
  Plan Compliance (USD 19):    LTV = USD 19 × 24 meses = USD 456
  Plan Campo (USD 29):         LTV = USD 29 × 24 = USD 696
  Plan Empresa (USD 79):       LTV = USD 79 × 24 = USD 1.896

LTV:CAC ratio objetivo: > 10x (SaaS saludable = 3x, excelente = 10x+)

Payback period objetivo: < 3 meses
```

### Esfuerzo por canal (1-5, donde 5 = máximo esfuerzo)

```
Canal                    Esfuerzo  Volumen   Velocidad
────────────────────────────────────────────────────
Content + SEO            3         Alto      Lento (6-12m)
CPCE / colegios          2         Medio     Rápido (1-3m)
Programa contadores      3         Alto      Medio (3-6m)
Ads Google/Meta          4         Alto      Rápido pero caro
Partnership Tiendanube   5         Muy alto  Muy lento (12m+)
Referral clientes        1         Medio     Rápido (si hay PMF)
LinkedIn Juan (personal) 2         Medio     Rápido (1-2m)
```

**Conclusión de esfuerzo:** El canal de menor esfuerzo + mayor velocidad es
**LinkedIn de Juan** + **programa de contadores vía CPCE Córdoba**.
Empezar ahí antes de invertir en cualquier otra cosa.
