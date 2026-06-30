# DashBI / PymeStudio — Features.md
**Sistema de compliance inteligente y consultoría estratégica para PyMEs argentinas**

Versión: 2.0 · Junio 2026 · Repos: `delphsoft/contable-dash` · `delphsoft/pymes-rag` (deprecado)

---

## Resumen ejecutivo

DashBI combina tres capas que ningún competidor argentino tiene juntas:
normativa ARCA 2026 específica, datos reales del cliente en Supabase, e
inteligencia estratégica de clase mundial (McKinsey, BCG, MIT, YC, XPLANE)
adaptada al tamaño PyME. El sistema diagnostica, alerta, recomienda y
ahora también razona con un RAG propio sin dependencias externas.

> *"PymeStudio es el primer sistema de compliance inteligente para PyMEs
> argentinas. Te avisa antes de los vencimientos, valida tus proveedores
> en ARCA automáticamente, detecta riesgos fiscales, y cuando necesitás
> un contador, ya tiene todo el contexto de tu empresa cargado."*

---

## 1. Arquitectura general

```
Frontend:    Vite + Vanilla JS + CSS custom (sin frameworks)
Backend:     Vercel Serverless Functions (Node.js)
IA:          Anthropic Claude Sonnet 4.6 vía API
Base datos:  Supabase (PostgreSQL + Auth)
RAG:         JSON estático + keyword scoring — corre dentro de Vercel,
             sin servicio externo (reemplazó a pymes-rag/Railway)
Deploy:      Vercel (Hobby plan)
```

### Constraint crítico de código
Vite/esbuild no tolera template literals anidados en `src/`. Toda
concatenación de HTML dinámico se hace con `+`, nunca `${...${...}}`.

### Diagrama de flujo — diagnóstico completo

```
Usuario escribe contexto libre + adjunta archivos (opcional)
        ↓
Frontend (src/diagnostico.js) — validación mínima (20+ caracteres)
        ↓
POST /api/diagnostico
        ↓
RAG inline busca 5 chunks relevantes en data/chunks.json (keyword scoring)
        ↓
Chunks + contexto del usuario → prompt a Claude Sonnet 4.6
        ↓
Claude responde JSON estructurado fundamentado en el conocimiento del RAG
        ↓
Frontend renderiza: score, alertas, semáforo, métricas, recomendaciones
```

---

## 2. Módulo de Diagnóstico IA

### 2.1 Descripción
Reemplaza la reunión de onboarding de 2 horas por un análisis de 5
minutos en texto libre. Analiza una PyME en 5 dimensiones y devuelve
score, alertas críticas, métricas calculadas y recomendaciones
priorizadas por urgencia.

### 2.2 Archivos
```
src/diagnostico.js      → módulo frontend (render + eventos + fetch)
src/diagnostico.css     → estilos
api/diagnostico.js      → serverless function (RAG + Claude API)
data/chunks.json        → corpus de conocimiento (50 chunks)
```

### 2.3 Las 5 dimensiones analizadas

| Dimensión | Detecta |
|---|---|
| Fiscal / impositiva | Régimen (MT/RI), deuda ARCA, proveedores sin validar, exclusión MT, IIBB, retenciones |
| Laboral | Personal no registrado, falta de ART, dependencia encubierta, SAC no provisionado |
| Societaria | Sociedad de hecho, riesgo patrimonial, oportunidad SAS, due diligence pre-venta |
| Financiera | Margen bruto estimado, cheques rechazados, ciclo de cobro, exposición cambiaria |
| Estratégica | Objetivo del cliente, incentivos no aprovechados, posicionamiento competitivo |

### 2.4 Sistema de scoring
```
Score = 100 − (suma_riesgos / 20 × 100), mínimo 15
≥80 verde · 60-79 naranja · 40-59 naranja · <40 rojo
```

### 2.5 API — `POST /api/diagnostico`
```json
Request:  { "contexto": "string (min 20 chars)", "archivos": ["string"] }
Response: {
  "ok": true,
  "diagnostico": { empresa, score, alertas_criticas, dimensiones[5], recomendaciones[] },
  "rag_chunks_used": ["chunk_id", ...]
}
```
Modelo: `claude-sonnet-4-6` · Max tokens: 1800 · Latencia típica: 3-6s
Costo por diagnóstico: ~USD 0.002

---

## 3. RAG interno — sin Railway, sin Python

### 3.1 Por qué se migró
El servicio original (`delphsoft/pymes-rag`) corría FastAPI en Railway.
Con 50 chunks de corpus —muy lejos del umbral de ~500 que justifica un
vector store— mantener un microservicio aparte era sobre-ingeniería.
Se migró a JSON estático + scoring por keyword corriendo dentro de la
misma function de Vercel que ya usa `contable-dash`.

### 3.2 Arquitectura nueva
```
data/chunks.json     → corpus completo (50 chunks normalizados)
api/rag-query.js     → endpoint standalone de búsqueda
api/diagnostico.js   → consulta el RAG inline antes de llamar a Claude
```

### 3.3 Motor de scoring
Búsqueda por tokens (sin acentos, sin stopwords) con ponderación:
```
Match en preguntas pre-cargadas del chunk  → +5 por token
Match en el nombre de la fuente            → +3 por token
Ocurrencias en el cuerpo del texto         → +1.5 por ocurrencia
Match parcial (substring)                  → +0.5
Resultado final × multiplicador por quality_score del chunk (0.8–1.2)
```
Validado con 5 queries reales — cada una retornó el chunk correcto
como primer resultado (ver sección 9, pruebas realizadas).

### 3.4 API — `POST /api/rag-query`
```json
Request:  { "query": "string", "top_k": 4, "category": "opcional" }
Response: { "ok": true, "results": [{ chunk_id, source_name, text, relevance_score }] }
```
`GET /api/rag-query?health` → `{ status, indexed_chunks: 50, categories: [...] }`

### 3.5 Cuándo migrar a vector search
Si el corpus supera ~300-500 chunks, migrar a Supabase pgvector
(ya disponible en el proyecto) o un índice externo. Hasta ese punto,
keyword scoring es instantáneo (<5ms) y sin costo de infraestructura.

---

## 4. Skill `dashbi-contador` — base de conocimiento

### 4.1 Ubicación
`skills/dashbi-contador/SKILL.md` + 17 archivos en `references/`

### 4.2 Triple rol
```
Contador (Juan):     asistente de trabajo, análisis rápido, informes
Cliente PyME:        asesor claro, sin jerga, decisiones accionables
PymeStudio producto: ayuda a pensar features, canales, pricing
```

### 4.3 Mapa completo de 17 references

**Operativas (compliance y datos)**
| Archivo | Contenido |
|---|---|
| `supabase-schema.md` | Tablas, campos, queries complejas |
| `consultas-tipo.md` | 7 patrones JS/SQL para análisis fiscal |
| `sueldos-2026.md` | Alícuotas, F931, SAC, liquidación final |
| `mono-vs-ri.md` | Comparativa de régimen con fórmula y checklist |
| `vencimientos-2026.md` | Calendario de 32 obligaciones ARCA |

**Estratégicas (frameworks)**
| Archivo | Contenido |
|---|---|
| `mit-academic-frameworks.md` | Compliance Maturity Model, Behavioral Economics, Opciones Reales |
| `agile-pm-frameworks.md` | OKRs, BPM, Scrum contable, Shape Up, **Contraste (Overnight Strategist)** |
| `startup-mindset-frameworks.md` | YC, a16z, First Principles, Lean Startup, PMF |
| `competitive-advantage.md` | Competidores por sector, matriz esfuerzo/ganancia |
| `exo-strategy-growth.md` | Activos ajenos, 3 horizontes de crecimiento |
| `value-proposition-extension.md` | Extensiones de producto, Blue Ocean |
| `soft-skills-pyme.md` | 8 frameworks XPLANE — Vision Map, Force Field, Activation Curve, etc. |

**De negocio (vertical-específico)**
| Archivo | Contenido |
|---|---|
| `marketing-digital-pyme.md` | Canales, SEO, LinkedIn thought leadership |
| `acceso-credito-argentina.md` | SGR, Banco Nación, fintech, factoring |
| `comercio-exterior.md` | Exporta Simple, Economía del Conocimiento, BCRA |
| `valuacion-pymes.md` | Múltiplos EBITDA, due diligence, M&A |
| `franquicias-argentina.md` | Estructura legal, fiscal, modelo de expansión |

### 4.4 Tabla de routing — situación del cliente → framework
```
"Quiero crecer pero no sé cómo"        → OKRs + 3 horizontes
"Tengo competidores que ganan precio"   → Porter + Blue Ocean
"Quiero escalar sin inversión"          → Exo Strategy
"No implementan mis recomendaciones"    → Force Field + Activation Curve
"Quiero vender la empresa"              → Due diligence + Opciones Reales
"Necesito presentar esto a un cliente"  → Contraste (Overnight Strategist)
```

---

## 5. Frameworks de habilidades blandas (XPLANE)

### 5.1 Los 8 frameworks adaptados
```
1. Vision Map            → estado actual / futuro / el puente
2. Empathy Map            → cliente y empleado, qué piensa/siente/dice/hace
3. Force Field Analysis   → por qué los cambios no se implementan
4. Activation Curve       → 5 etapas de adopción (Awareness → Reinforcement)
5. Modern Leadership      → 6 dimensiones del liderazgo PyME
6. Culture Map             → 4 niveles, cultura real vs declarada
7. 30-60-90 Day Roadmap   → implementación del diagnóstico en 90 días
8. Ways of Working         → 6 conversaciones que todo equipo necesita
```

### 5.2 Extensión de producto — DashBI Academia Soft Skills
```
1. "Liderá sin agotarte" (45 min)
2. "Por qué tu equipo no implementa lo que pedís" (30 min)
3. "Clarificá a dónde va tu empresa en 90 minutos" (90 min)
4. "Entendé a tu cliente de verdad" (45 min)
5. "Construí una cultura que no dependa de vos" (60 min)
```
Pricing: incluido en plan Empresa+, taller presencial USD 89/persona,
certificación para contadores USD 299.

---

## 6. Framework de Contraste (Overnight Strategist)

Integrado en `agile-pm-frameworks.md` sección 11 + chunk RAG `os-008`.

### Los 4 tipos aplicados a PyMEs argentinas
```
Old way vs New way                    → cómo se hacía antes vs ahora
Lo que creemos vs lo que hace el cliente → expone gaps de supuestos
Lo que decimos vs lo que premiamos     → detecta incongruencias
Lo que hacemos vs lo que el mercado necesita → alinea oferta/demanda
```

### Aplicación directa en el informe DashBI
```
[ESTADO ACTUAL] "Hoy: 3 proveedores sin validar.
                 Crédito fiscal perdido: $180.000/mes."
       VS
[ESTADO OBJETIVO] "En 30 días: validación activa.
                    Crédito recuperado: $2.1M/año."
```
El semáforo del diagnóstico ES un contraste visual — rojo (actual) vs
verde (objetivo). Cada recomendación se estructura como contraste con
números reales del cliente.

---

## 7. Ecosistema PymeStudio — derivaciones

| Recomendación detectada | Producto / Módulo |
|---|---|
| Validar proveedores ARCA | DashBI → Fiscal → Compras |
| Posición IVA | DashBI → Fiscal → IVA |
| Vencimientos próximos | DashBI → Vencimientos |
| F931 / sueldos | DashBI → Fiscal → Sueldos |
| Deuda CCMA | DashBI → Fiscal → CCMA |
| Diagnóstico inicial | DashBI → Diagnóstico IA |
| Incentivos fiscales | PymeRIMI (pymerimi.vercel.app) |
| CTG/CPE agro Córdoba | AgroGestión (harvest.pymestudio.xyz) |
| Servicios agropecuarios | PampaGo (pampago.xyz) |
| Facturación electrónica | FacturaFácil |

---

## 8. Modelo de negocio — resumen

### 8.1 Planes
```
Compliance  USD 19/mes
Campo       USD 29/mes
Empresa     USD 79/mes
Pro         USD 149/mes (contadores con cartera de clientes)
```

### 8.2 Unit economics
```
LTV (24 meses): Compliance USD 456 · Campo USD 696 · Empresa USD 1.896
CAC: directo USD 15-25 · referido contador USD 5-10 · partnership USD 2-5
LTV:CAC objetivo > 10x
ROI para el contador: 22 hs/mes liberadas × USD 12/h × 15 clientes
                       = USD 3.960 valor liberado vs USD 149 de costo → 26x
```

### 8.3 Los 3 horizontes de crecimiento
```
H1 (0-6m):   Dominar Córdoba Ciudad — 50 clientes, USD 0 en ads
H2 (6-18m):  Córdoba + Buenos Aires — 300 clientes, canal contadores
H3 (18-36m): Expansión Latam (Chile, Uruguay, Colombia)
```

---

## 9. Validación técnica realizada esta sesión

### 9.1 Test del motor RAG
5 queries reales ejecutadas contra el corpus de 50 chunks — los 5
retornaron el chunk correcto como primer resultado:
```
"por qué mi cliente no implementa recomendaciones" → ss-002 Force Field [29.0]
"como exportar servicios y cobrar en dolares"      → cx-001 Exporta Simple [28.3]
"necesito credito para mi pyme"                     → cred-001 SGR [25.3]
"como vender mi empresa y cuanto vale"              → val-001 Valuación [17.6]
"monotributo vs responsable inscripto"              → v1-004/v1-005 [31.4/30.0]
```

### 9.2 Integridad de datos verificada
```
Chunks v1 (originales reconstruidos): 15
Chunks v2 (sesión actual):             35
Total corpus:                          50 — IDs únicos confirmados
```

### 9.3 Auditoría de repo (vía Claude Code)
Confirmado que existen y están correctamente integrados:
- `skills/dashbi-contador/` completo con 17 references
- `src/diagnostico.js` + `.css`
- `api/diagnostico.js` (versión previa, sin RAG)
- `ct-diagnostico` en `VIEWS` de `src/main.js`
- Botón + vista en `index.html`

---

## 10. Pendiente de subir (esta sesión)

```
api/diagnostico.js   → REEMPLAZAR (ahora incluye RAG inline + contraste)
api/rag-query.js      → NUEVO — endpoint standalone de búsqueda
data/chunks.json      → NUEVO — corpus de 50 chunks
```

Repo `delphsoft/pymes-rag` → deprecado, puede archivarse. Ya no hay
dependencia de Railway en el ecosistema PymeStudio.

---

## 11. Roadmap

### v2.1 — Persistencia
- [ ] Guardar diagnóstico en `supabase.diagnosticos` (user_id, score, fecha)
- [ ] Historial de scores con gráfico de evolución

### v2.2 — Informes y comunicación
- [ ] Export PDF con logo del estudio
- [ ] WhatsApp alertas de vencimiento (Twilio)

### v2.3 — RAG ampliado
- [ ] Ingesta de normativa ARCA actualizada automáticamente (ex-crawler)
- [ ] Si supera 300 chunks → evaluar pgvector en Supabase

### v2.4 — Monetización de conocimiento
- [ ] DashBI Academia (5 micro-cursos soft skills)
- [ ] DashBI Crédito (partnership SGR)
- [ ] Marketplace de proveedores verificados

---

## 12. Variables de entorno

```bash
ANTHROPIC_API_KEY=sk-ant-...     # Claude API — diagnóstico + RAG
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
AFIPSDK_TOKEN=...
AFIPSDK_ENV=prod                 # NUNCA "production"
RESEND_API_KEY=re_...
```
Ya no se requiere `RAG_API_URL` (Railway) — el RAG es parte del mismo
deployment de Vercel.
