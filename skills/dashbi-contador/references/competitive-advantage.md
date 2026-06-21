# Ventaja Competitiva por Sector — PymeStudio vs Competidores Locales

## Marco de análisis
Competidor local = cualquier solución que hoy tiene el dinero o la atención
del cliente PyME argentino. No solo software — también contadores, ERPs,
gestores de turno, Excel, WhatsApp con el contador.

---

## 1. Mapa de competidores por categoría

### Categoría A — Software de gestión contable
| Competidor | Fortaleza | Debilidad | Ventaja PymeStudio |
|---|---|---|---|
| Tango Gestión | Market share histórico, integración Ganancias | Caro, complejo, sin IA | Diagnóstico en 5 min vs onboarding de semanas |
| Bejerman | Robusto para medianas empresas | No PyME, precio alto | Precio 10x más bajo, UX moderno |
| Colppy | Cloud, precio accesible | Sin IA, sin ARCA proactivo | Motor de vencimientos + Claude |
| Xubio | Facturación electrónica simple | Solo facturación, no compliance | Suite completa vs herramienta puntual |
| Alegra Argentina | UX moderno, bien conocido | Genérico, sin adaptación ARCA 2026 | Especialización local profunda |

**Ventaja vs Categoría A:** PymeStudio no es un ERP — es un sistema de compliance
inteligente. El ERP registra lo que pasó. DashBI alerta antes de que pase.

---

### Categoría B — Contadores y estudios contables tradicionales
| Competidor | Fortaleza | Debilidad | Ventaja PymeStudio |
|---|---|---|---|
| Estudio contable barrio | Relación personal, confianza | Reactivo, sin datos en tiempo real | DashBI amplifica al contador — no lo reemplaza |
| Contador junior freelance | Precio bajo | Sin metodología, sin sistema | Sistema + metodología + IA incluidos |
| Big 4 (Deloitte, PwC) | Metodología world class | Inaccessible para PyMEs (USD 5.000+) | Misma metodología a USD 19/mes |
| Consejerías AFIP gratuitas | Cero costo | Solo orientación básica, sin seguimiento | Seguimiento continuo + datos reales |

**Ventaja vs Categoría B:** El contador que usa DashBI puede atender 5x más clientes
con el mismo tiempo. El contador que no usa DashBI pierde clientes ante el que sí usa.

---

### Categoría C — Soluciones IA genéricas
| Competidor | Fortaleza | Debilidad | Ventaja PymeStudio |
|---|---|---|---|
| ChatGPT / Claude directo | Potente, conocido | Sin datos reales del cliente, sin ARCA 2026 específico | Datos Supabase + normativa local + skill especializado |
| Gemini / Copilot | Integrado en Office | Sin contexto contable argentino | Especialización > generalismo |
| IA para contadores (genérica) | Emergentes | Sin integración ARCA/AfipSDK | Integración técnica real, no solo chatbot |

**Ventaja vs Categoría C:** La IA genérica no sabe que el `periodoHasta` de CCMA
no puede superar `12/2025`. PymeStudio sí. Ese detalle es el moat.

---

## 2. Ventaja competitiva por sector/actividad

### Sector Agropecuario
**Competidores:** Gestión Campo, FieldView (datos agronómicos), AgroTop
**Ventaja PymeStudio:**
- Único sistema que combina CTG/CPE (ARCA) + compliance fiscal + cashflow agro
- AgroGestión + PampaGo + DashBI = suite completa que ningún competidor ofrece
- Conocimiento específico: WSCTG, WSCPE, WSLPGv1.6, RG 5017/2021
- El productor no necesita 3 sistemas — PymeStudio lo cubre todo

**Effort para ganar este sector:** MEDIO
- Canal: agronomías, acopios, cooperativas (multiplicadores naturales)
- Ya tenés el producto (AgroGestión deployado)
- Falta: presencia en Bolsa de Cereales Córdoba, ExpoAgro

---

### Sector Servicios Profesionales (estudios, consultoras, ingenieros)
**Competidores:** Sistema de gestión propio (Excel), TimeBilling, un contador
**Ventaja PymeStudio:**
- Facturación de honorarios + SICORE + IVA servicios = combo frecuente
- Diagnóstico en minutos para recomendarse entre colegas (efecto viral)
- Monotributo categoría alta = riesgo de exclusión recurrente → DashBI alerta

**Effort para ganar este sector:** BAJO
- Canal: colegios profesionales (CPCE Córdoba, CPCECABA)
- Caso de uso claro: "sabé si tu Monotributo está en riesgo"
- CAC bajo: el profesional se autodiagnostica y se convierte

---

### Sector Gastronomía / Retail / Kioscos
**Competidores:** Tiendanube (e-commerce), sistemas de punto de venta locales
**Ventaja PymeStudio:**
- Alta rotación de personal → F931 frecuente → DashBI automatiza
- Proveedores múltiples → validación ARCA masiva
- Márgenes ajustados → el análisis de breakeven tiene valor inmediato

**Effort para ganar este sector:** ALTO
- Muchos actores, precio muy sensible
- Canal: asociaciones de comerciantes, cámaras de comercio
- Estrategia: partner con proveedor de POS (integración vs competencia)

---

### Sector Construcción
**Competidores:** Sistemas de obra (Obra Manager), planillas Excel
**Ventaja PymeStudio:**
- Alta informalidad laboral → riesgo legal crítico → diagnóstico detecta
- Obra con subcontratistas → complejidad de SICORE retenciones
- Sociedad de hecho frecuente → SAS como recomendación natural

**Effort para ganar este sector:** MEDIO
- Canal: CAMARCO (Cámara Argentina de la Construcción), colegios de arquitectos
- Pain point claro: empleados en negro en obra → multas AFIP

---

### Sector Tecnología / Software / Startups
**Competidores:** Deel (nómina global), Gusto, herramientas US-centric
**Ventaja PymeStudio:**
- Economía del Conocimiento (Decreto 1399/2001) → beneficio específico
- Facturación en USD → complejidad BCRA + AFIP
- Exporta Simple → recomendación natural de DashBI

**Effort para ganar este sector:** BAJO
- Canal: comunidades tech (Meetup, Discord, developers argentinos)
- El cliente tech valora UX moderno y API — PymeStudio tiene ambos
- Usan Claude.ai → confían en Anthropic → confían en DashBI

---

## 3. Framework de priorización de sectores

### Matriz Esfuerzo vs Ganancia

```
                    GANANCIA ALTA
                         │
    Construcción         │    Agro ★
    (medio esfuerzo)     │    (medio esfuerzo)
                         │
  ───────────────────────┼───────────────────────
  ESFUERZO ALTO          │              ESFUERZO BAJO
                         │
    Retail/Gastronomía   │    Servicios Profesionales ★★
    (alto esfuerzo)      │    Tech/Software ★★
                         │    (bajo esfuerzo)
                         │
                    GANANCIA BAJA
```

**Prioridad 1 (hacer ahora):** Servicios Profesionales + Tech
**Prioridad 2 (próximo trimestre):** Agro (ya tenés el producto)
**Prioridad 3 (2027):** Construcción + Retail

---

## 4. Medición de ventaja competitiva — KPIs por sector

### Métricas de penetración de mercado

```sql
-- Win rate por sector en Supabase
SELECT actividad, COUNT(*) as clientes, AVG(score) as score_promedio
FROM diagnosticos
GROUP BY actividad
ORDER BY clientes DESC

-- Churn por sector (quién se va)
SELECT actividad, COUNT(*) as churned
FROM usuarios WHERE estado = 'cancelado'
GROUP BY actividad
```

### NPS por sector (objetivo)
```
Agro:                  NPS > 60 (pain point muy alto)
Servicios prof.:       NPS > 50 (adopción fácil)
Tech:                  NPS > 55 (valoran UX)
Construcción:          NPS > 40 (más resistencia)
Retail/Gastronomía:    NPS > 35 (precio sensible)
```

### Market share objetivo a 24 meses
```
Servicios prof. Córdoba: 3% de ~15.000 estudios = 450 clientes
Agro Córdoba:            2% de ~8.000 productores = 160 clientes
Tech Argentina:          1% de ~12.000 software cos = 120 clientes
Total año 2:             ~730 clientes × $24 USD avg = $17.520 ARR
```
