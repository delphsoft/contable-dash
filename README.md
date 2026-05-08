# FacturaFácil + Dashboard Contable — Proyecto Unificado

Una sola app que integra facturación ARCA, gestión de impuestos, dashboard contable con Google Drive y Asesor IA estratégico.

---

## Stack

- **Vite 5** — bundler, cero config
- **Chart.js 4** — todos los gráficos
- **Vanilla JS modular** — sin framework, sin dependencias pesadas
- **jose** — JWT verification en serverless functions
- **@supabase/supabase-js** — persistencia de datos (opcional, fallback a localStorage)

---

## Estructura del proyecto

```
app-unificado/
├── index.html                        ← Entry point — sidebar + todas las vistas
├── vercel.json                       ← Deploy config
├── package.json
├── vite.config.js
│
├── api/                              ← Serverless functions (Vercel)
│   ├── chat.js                       ← Proxy Anthropic API (Asesor IA)
│   ├── factura.js                    ← Emisión de facturas ARCA via AfipSDK
│   ├── arca-padron.js                ← Consulta padrón A4 ARCA (lookup CUIT)
│   ├── mercadopago.js                ← Import pagos MercadoPago
│   ├── drive.js                      ← Sincronización Google Drive (Service Account)
│   └── parse-xlsx.js                 ← Parse de archivos .xlsx subidos
│
└── src/
    ├── main.js                       ← Router SPA + lazy render
    ├── style.css                     ← Dark theme unificado
    ├── utils.js                      ← fmtM, fmtPct, sum, fmtCurrency, fmtDate
    ├── data/
    │   └── data.js                   ← Datos reales del negocio (oct-25 / feb-26)
    └── views/
        ├── contable/
        │   ├── overview.js           ← KPIs + ventas vs CMV + márgenes
        │   ├── estado-contable.js    ← Estado de resultados mensual
        │   ├── proveedores.js        ← Concentración + Pareto + mapa de riesgo
        │   ├── breakeven.js          ← Simulador interactivo con 4 escenarios
        │   ├── alertas.js            ← Diagnóstico automático + acciones
        │   ├── drive.js              ← Upload .xlsx + sincronización Google Drive
        │   ├── superadmin.js         ← Panel estratégico protegido por PIN
        │   └── (ventas.js)           ← Archivo legacy, no está en el router
        └── factura/
            ├── dashboard.js          ← Dashboard facturas + MP + Reportes (SPA interna)
            ├── facturas.js           ← Formulario de emisión con IVA, receptor, ARCA
            ├── impuestos.js          ← Monotributo, IIBB, Forecast, Simulador, Historial
            └── mercadopago.js        ← Vista standalone de movimientos MP
```

---

## Módulos

### Contable

| Vista | Descripción |
|---|---|
| **Overview** | KPIs ejecutivos, ventas vs CMV, margen bruto/neto mensual, márgenes % |
| **Estado Contable** | Estado de resultados completo — ingresos, CMV, gastos, donut de estructura |
| **Proveedores** | Curva de Pareto, mapa de riesgo por proveedor, top 8 horizontal bar |
| **Break-even** | Simulador interactivo — sliders de CMV/ventas/gastos + 4 escenarios preconfigurados |
| **Alertas** | 3 críticas + 4 advertencias + barra de monotributo + acciones priorizadas |
| **Google Drive** | Drag & drop .xlsx, sincronización via Service Account, preview de datos |
| **Super Admin** | PIN `2025` — analytics completo + Asesor IA estratégico lado a lado |

### Facturación

| Vista | Descripción |
|---|---|
| **Dashboard** | KPIs + tabla de facturas + búsqueda + PDF + origen MP |
| **Mis Facturas** | Formulario A/B/C, receptor CUIT/DNI con lookup ARCA, preview IVA en tiempo real |
| **MercadoPago** | Tabs recibidos/enviados, filtros por fuente, selección múltiple, facturación en lote |
| **Reportes** | Filtro por fechas, tabla de resultados, exportar CSV |
| **Impuestos** | Resumen · IIBB · Forecast 3 meses · Simulador · Historial · Comprobantes ARCA |

### IA

| Vista | Descripción |
|---|---|
| **Asesor IA** | Chat con contexto del negocio preloaded, 6 quick prompts, panel de alertas lateral |
| **Super Admin** | Asesor IA + analytics completo — acceso restringido por PIN |

---

## Variables de entorno — Vercel

Ir a **Vercel → tu proyecto → Settings → Environment Variables**

### Requeridas

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `ANTHROPIC_API_KEY` | API key de Claude (Asesor IA) | console.anthropic.com → API Keys |
| `AFIPSDK_ACCESS_TOKEN` | Token de AfipSDK para emitir facturas | app.afipsdk.com |
| `AFIPSDK_CUIT` | Tu CUIT sin guiones (`20123456789`) | Tu CUIT |

### Para Supabase (persistencia en base de datos)

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase | supabase.com → Project Settings → API |
| `SUPABASE_SERVICE_KEY` | Service role key (no la anon key) | supabase.com → Project Settings → API |
| `JWT_SECRET` | Debe ser igual al `JWT_SECRET` de FacturaFácil | El mismo string que usás en el proyecto Next.js |

### Para Google Drive (sincronización .xlsx)

| Variable | Descripción | Cómo configurar |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON completo de la Service Account | Ver sección "Google Drive setup" abajo |

### Opcionales

| Variable | Descripción |
|---|---|
| `AFIPSDK_ENV` | `prod` o `dev` (default: `prod`) |
| `AFIP_CERT` | Certificado AFIP (si no usás AfipSDK managed) |
| `AFIP_KEY` | Clave privada AFIP (si no usás AfipSDK managed) |
| `RESEND_API_KEY` | Para envío de facturas por email |
| `RESEND_FROM_EMAIL` | Email remitente (ej: `facturas@tudominio.com`) |
| `MP_ACCESS_TOKEN` | Token global de MercadoPago (si no viene del usuario) |

---

## Deploy en Vercel

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "init: app unificada facturafacil + contable"
gh repo create app-unificado --public --push --source=.
```

### 2. Importar en Vercel

1. Ir a **vercel.com/new**
2. Importar el repo de GitHub
3. Vite se detecta automáticamente — **no tocar nada**
4. Click **Deploy** → URL en ~30 segundos

### 3. Agregar variables de entorno

1. Vercel → tu proyecto → **Settings → Environment Variables**
2. Agregar una por una las variables de la tabla de arriba
3. Click **Save**

### 4. Redeploy

Después de agregar las variables:
- Vercel → **Deployments** → tres puntos en el último deploy → **Redeploy**

### 5. Dev local

```bash
npm install
npm run dev
# → http://localhost:5173
# Nota: /api/* no funciona en local sin Vercel CLI
```

Para probar las API localmente:
```bash
npm install -g vercel
vercel dev
# → http://localhost:3000 (con /api/* funcionando)
```

---

## Google Drive setup (Service Account)

Para sincronizar archivos .xlsx desde Google Drive:

**1. Crear proyecto en Google Cloud**
```
console.cloud.google.com → New Project → Habilitar "Google Drive API"
```

**2. Crear Service Account**
```
IAM & Admin → Service Accounts → Create Service Account
→ Descargar JSON de credenciales
```

**3. Compartir el archivo de Drive**
```
Abrí tu archivo .xlsx en Google Drive
→ Compartir → pegar el email de la service account
  (termina en @<proyecto>.iam.gserviceaccount.com)
→ Darle permiso de "Viewer"
```

**4. Agregar a Vercel**
```
Vercel → Settings → Environment Variables
→ GOOGLE_SERVICE_ACCOUNT_JSON = (pegar el contenido del JSON completo)
```

**5. Obtener el File ID**
```
Abrí el archivo en Drive → mirá la URL:
drive.google.com/file/d/[ESTE_ES_EL_FILE_ID]/view
```

**6. En la app**
```
Módulo Contable → Google Drive → pegar el File ID → Sincronizar
```

---

## Super Admin

Acceso desde el sidebar (ícono del candado, semi-transparente).

- PIN por defecto: **`2025`**
- Para cambiarlo: editar `src/views/contable/superadmin.js`, línea 4
  ```js
  const CORRECT_PIN = 'tu-nuevo-pin'
  ```
- La sesión persiste en `sessionStorage` — se cierra al cerrar el tab del browser

Dentro del Super Admin:
- Analytics completo con todos los gráficos, Pareto y mapa de riesgo de proveedores
- Asesor IA con contexto completo del negocio y quick prompts estratégicos

---

## Actualizar datos contables

Editar `src/data/data.js` — todos los gráficos se actualizan automáticamente al siguiente build.

O usar el módulo **Google Drive** para sincronizar desde un archivo .xlsx actualizado.

---

## Tablas de Supabase requeridas

Si usás Supabase, estas tablas deben existir:

```sql
-- Usuarios
create table usuarios (
  id uuid primary key default gen_random_uuid(),
  cuit text unique not null,
  razon_social text,
  email text,
  afipsdk_token text,
  afipsdk_cuit text,
  punto_venta integer default 1,
  condicion_iva text default 'monotributo',
  activo boolean default true,
  created_at timestamptz default now()
);

-- Facturas
create table facturas (
  id uuid primary key default gen_random_uuid(),
  cuit_usuario text references usuarios(cuit),
  recipient text not null,
  description text,
  amount numeric not null,
  tipo_comprobante integer default 11,
  concepto integer default 2,
  voucher_number integer,
  punto_venta integer default 1,
  cae text,
  cae_fch_vto text,
  date text,
  receptor_tipo text default 'consumidor_final',
  receptor_doc_tipo integer,
  receptor_doc_nro text,
  receptor_razon_social text,
  receptor_email text,
  payment_source text default 'manual',
  mp_payment_id text,
  created_at timestamptz default now()
);

-- Pagos de impuestos
create table impuestos_pagos (
  id uuid primary key default gen_random_uuid(),
  cuit_usuario text references usuarios(cuit),
  periodo text not null,
  concepto text not null,
  monto numeric not null,
  pagado boolean default false,
  fecha_pago date,
  comprobante text,
  created_at timestamptz default now()
);

-- Configuración fiscal por usuario
create table impuestos_config (
  id uuid primary key default gen_random_uuid(),
  cuit_usuario text unique references usuarios(cuit),
  regimen text default 'monotributo',
  provincia text default 'bsas',
  actividad text default 'servicios',
  modalidad_iibb text default 'local',
  categoria_mono text default 'H',
  updated_at timestamptz default now()
);
```

---

## Modo sin Supabase (solo localStorage)

La app funciona completamente sin Supabase — todos los datos se guardan en `localStorage`:

- Facturas emitidas → `ff_facturas`
- Config fiscal → `ff_impuestos_cfg`
- Pagos de impuestos → `ff_impuestos_pagos`
- File ID de Drive → `drive_file_id`
- Archivos cargados → `drive_files`

Ideal para uso personal / demo. Para producción con múltiples usuarios, configurar Supabase.

---

## Build

```bash
npm run build    # genera /dist listo para deploy
npm run preview  # preview local del build
```

