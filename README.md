# FacturaFácil + Dashboard Contable — Proyecto Unificado

Una sola app que integra facturación ARCA, gestión de impuestos, dashboard contable con Google Drive y Asesor IA.

## Vistas

### Facturación
- **Dashboard** — Resumen de facturas y métricas
- **Mis Facturas** — Emitir comprobantes con CAE real via ARCA/AfipSDK
- **MercadoPago** — Importar y clasificar movimientos
- **Impuestos** — Monotributo, IIBB, simulador fiscal

### Contable
- **Overview** — KPIs, ventas vs CMV, márgenes
- **Ventas** — Canales, categorías, gastos
- **Proveedores** — Concentración, Pareto, riesgo
- **Break-even** — Simulador interactivo
- **Google Drive** — Actualizar datos desde .xlsx

### IA
- **Asesor IA** — Chat con contexto completo del negocio

## Deploy en Vercel

### 1. GitHub
```bash
git init && git add . && git commit -m "init"
gh repo create app-unificado --public --push --source=.
```

### 2. Vercel → import repo → Deploy

### 3. Variables de entorno (Settings → Environment Variables)

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | Para el Asesor IA |
| `AFIPSDK_ACCESS_TOKEN` | Para facturas reales con ARCA |
| `AFIPSDK_CUIT` | Tu CUIT sin guiones |
| `MP_ACCESS_TOKEN` | Token de MercadoPago (opcional) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON de Service Account de Google |

## Dev local
```bash
npm install
npm run dev
```
