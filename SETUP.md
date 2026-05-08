# Setup Guide — FacturaFácil + Dashboard Contable

Guía completa de configuración, acceso a servicios externos y variables de entorno.

---

## Índice

1. [Deploy en Vercel](#1-deploy-en-vercel)
2. [Anthropic — Asesor IA](#2-anthropic--asesor-ia)
3. [AfipSDK — Facturas ARCA](#3-afipsdk--facturas-arca)
4. [Supabase — Base de datos](#4-supabase--base-de-datos)
5. [MercadoPago — Import de pagos](#5-mercadopago--import-de-pagos)
6. [Google Drive — Sincronización .xlsx](#6-google-drive--sincronización-xlsx)
7. [Resend — Envío de facturas por email](#7-resend--envío-de-facturas-por-email)
8. [Super Admin — Acceso y PIN](#8-super-admin--acceso-y-pin)
9. [Variables de entorno — referencia rápida](#9-variables-de-entorno--referencia-rápida)
10. [Modo sin servicios externos](#10-modo-sin-servicios-externos)

---

## 1. Deploy en Vercel

### Subir a GitHub

```bash
git init
git add .
git commit -m "init: app unificada"
gh repo create app-unificado --public --push --source=.
```

> Si no tenés GitHub CLI, creá el repo manualmente en github.com y seguí las instrucciones de "push existing repository".

### Conectar con Vercel

1. Ir a **vercel.com/new**
2. Click **Import Git Repository** → seleccionar el repo
3. Vite se detecta automáticamente → **no cambiar nada**
4. Click **Deploy**
5. URL activa en ~30 segundos

### Agregar variables de entorno

1. Vercel → tu proyecto → **Settings → Environment Variables**
2. Agregar cada variable (ver sección 9)
3. Click **Save** en cada una

### Aplicar variables (redeploy)

Las variables solo aplican después de un nuevo deploy:
- Vercel → **Deployments** → tres puntos en el último → **Redeploy**
- O hacer cualquier push al repo

### Dev local

```bash
npm install
npm run dev       # → http://localhost:5173 (solo frontend)
```

Para probar las funciones `/api/*` en local:

```bash
npm install -g vercel
vercel dev        # → http://localhost:3000 (frontend + API)
```

Crear `.env.local` con las variables (ver `.env.example`).

---

## 2. Anthropic — Asesor IA

El Asesor IA usa Claude Sonnet via la API de Anthropic.

### Obtener API Key

1. Ir a **console.anthropic.com**
2. Crear cuenta si no tenés
3. Menú izquierdo → **API Keys**
4. Click **Create Key** → ponerle nombre (`app-unificada`)
5. Copiar la key — **solo se muestra una vez**

La key tiene el formato `sk-ant-api03-...`

### Agregar a Vercel

```
Variable:  ANTHROPIC_API_KEY
Valor:     sk-ant-api03-xxxxxxxxxxxx
```

### Costos

El modelo `claude-sonnet-4-5` cobra por tokens. Para uso personal (dashboard + preguntas estratégicas) el costo es de centavos por conversación. Anthropic da créditos gratis al crear la cuenta.

### Cómo funciona en la app

El browser **nunca** ve la API key. El flujo es:

```
Browser → POST /api/chat (Vercel serverless) → Anthropic API
                         ↑
               lee ANTHROPIC_API_KEY del entorno
```

---

## 3. AfipSDK — Facturas ARCA

AfipSDK es el middleware que conecta con los web services de ARCA (ex-AFIP) para emitir facturas con CAE real.

### Crear cuenta en AfipSDK

1. Ir a **app.afipsdk.com**
2. Registrarse → crear cuenta
3. Dashboard → **Access Tokens** → crear nuevo token
4. Copiar el token

### Configurar tu CUIT en AfipSDK

En el dashboard de AfipSDK podés gestionar los CUITs autorizados y los certificados digitales.

Para entorno de **producción** necesitás:
- Un certificado digital emitido por AFIP para tu CUIT
- La clave privada correspondiente

AfipSDK puede manejar los certificados por vos (recomendado) o podés cargar los tuyos propios.

### Variables

```
AFIPSDK_ACCESS_TOKEN=tu-token-de-afipsdk
AFIPSDK_CUIT=20123456789       # sin guiones
AFIPSDK_ENV=prod               # prod | dev
```

Para usar certificados propios (avanzado):
```
AFIP_CERT=-----BEGIN CERTIFICATE-----...
AFIP_KEY=-----BEGIN RSA PRIVATE KEY-----...
```

### Modo demo

Si `AFIPSDK_ACCESS_TOKEN` no está configurado, la app funciona en **modo demo**: genera un CAE simulado (`75116759xxxxxxxx`) que no es válido ante AFIP pero permite probar el flujo completo.

---

## 4. Supabase — Base de datos

Supabase provee la base de datos PostgreSQL y la autenticación JWT. Es **opcional** — sin Supabase la app guarda todo en `localStorage`.

### Crear proyecto

1. Ir a **supabase.com** → **New project**
2. Elegir nombre, contraseña y región (recomendado: South America)
3. Esperar ~2 minutos a que el proyecto esté listo

### Obtener credenciales

1. Supabase → tu proyecto → **Settings → API**
2. Copiar:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (no la `anon` key) → `SUPABASE_SERVICE_KEY`

### Variables

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
JWT_SECRET=facturafacil-secret-2026
```

> `JWT_SECRET` debe ser el mismo string que usás en el proyecto FacturaFácil Next.js para que los tokens sean compatibles.

### Crear las tablas

Supabase → tu proyecto → **SQL Editor** → pegar y ejecutar:

```sql
-- Usuarios
create table if not exists usuarios (
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
create table if not exists facturas (
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
create table if not exists impuestos_pagos (
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

-- Configuración fiscal
create table if not exists impuestos_config (
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

### Row Level Security (recomendado para producción)

```sql
-- Habilitar RLS
alter table facturas enable row level security;
alter table impuestos_pagos enable row level security;
alter table impuestos_config enable row level security;

-- Política: cada usuario solo ve sus propios datos
create policy "own_facturas" on facturas
  using (cuit_usuario = current_setting('app.current_cuit', true));
```

---

## 5. MercadoPago — Import de pagos

### Obtener Access Token

1. Ir a **mercadopago.com.ar/developers**
2. Login con tu cuenta de MercadoPago
3. Crear una aplicación (si no tenés)
4. **Credenciales de producción** → copiar **Access Token**

El token tiene el formato `APP_USR-...`

### Variable global (opcional)

```
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx
```

Si esta variable está configurada, el botón "Importar MP" del dashboard usará este token automáticamente. Si no está, el usuario puede ingresarlo manualmente en la interfaz.

### Uso en la app

1. Módulo **Facturación → Dashboard → tab MercadoPago**
2. Click **↺ Actualizar**
3. La app carga los últimos 100 pagos
4. Seleccionar los pagos a facturar con los checkboxes
5. Click **Facturar N →** — genera una factura por cada pago seleccionado

---

## 6. Google Drive — Sincronización .xlsx

Permite sincronizar la planilla contable desde Google Drive para actualizar los datos del dashboard sin modificar código.

### Paso 1 — Crear proyecto en Google Cloud

1. Ir a **console.cloud.google.com**
2. Crear nuevo proyecto (ej: `app-contable`)
3. Menú → **APIs & Services → Library**
4. Buscar **Google Drive API** → Habilitar

### Paso 2 — Crear Service Account

1. Menú → **IAM & Admin → Service Accounts**
2. Click **Create Service Account**
3. Nombre: `contable-sync` → Crear
4. No asignar roles → Continuar → Listo
5. Click en la service account creada → **Keys → Add Key → Create new key → JSON**
6. Se descarga un archivo `.json` — guardarlo en lugar seguro

### Paso 3 — Compartir el archivo de Drive

1. Abrir el archivo `.json` descargado → copiar el campo `client_email`
   (tiene el formato `contable-sync@proyecto.iam.gserviceaccount.com`)
2. Abrir el archivo `.xlsx` en Google Drive
3. Click **Compartir** → pegar el email de la service account
4. Permiso: **Viewer** → Enviar

### Paso 4 — Agregar a Vercel

1. Abrir el archivo `.json` de credenciales en un editor de texto
2. Copiar **todo el contenido** (es un JSON de ~10 líneas)
3. Vercel → Settings → Environment Variables:

```
Variable:  GOOGLE_SERVICE_ACCOUNT_JSON
Valor:     {"type":"service_account","project_id":"...","private_key":"..."}
```

> Pegar el JSON completo en una sola línea como valor de la variable.

### Paso 5 — Obtener el File ID

Abrir el archivo en Google Drive y copiar el ID de la URL:

```
https://drive.google.com/file/d/[FILE_ID_AQUÍ]/view
                                 ↑ copiar esto
```

### Paso 6 — Sincronizar en la app

1. Módulo **Contable → Google Drive**
2. Pegar el File ID en el campo
3. Click **Sincronizar desde Drive**
4. Una vez procesado, click **Aplicar** para actualizar el dashboard

---

## 7. Resend — Envío de facturas por email

Resend envía las facturas por email al receptor y/o al emisor cuando se genera un CAE.

### Crear cuenta

1. Ir a **resend.com**
2. Crear cuenta gratuita (100 emails/día en el plan free)
3. Dashboard → **API Keys → Create API Key**
4. Copiar la key

### Verificar dominio (recomendado)

Para usar tu propio dominio como remitente:
1. Resend → **Domains → Add Domain**
2. Agregar los registros DNS indicados
3. Una vez verificado podés usar `facturas@tudominio.com`

Sin dominio verificado podés usar `onboarding@resend.dev` (solo para testing).

### Variables

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=facturas@tudominio.com
```

### Comportamiento

Cuando se emite una factura con CAE, la app envía automáticamente un email con:
- Número de comprobante
- CAE y fecha de vencimiento
- Monto total

Destinatarios: el email del receptor (si fue ingresado) y el email del usuario emisor (de Supabase).

---

## 8. Super Admin — Acceso y PIN

### Acceso

El Super Admin está en el sidebar debajo de todos los módulos, con opacidad reducida para no destacarlo. Click en el ícono del candado.

### PIN por defecto

```
PIN: 2025
```

### Cambiar el PIN

Editar `src/views/contable/superadmin.js`, línea 4:

```js
const CORRECT_PIN = 'tu-nuevo-pin'
```

Luego hacer build y deploy:

```bash
npm run build
git add . && git commit -m "update: cambiar PIN admin" && git push
```

### Sesión

La sesión del Super Admin vive en `sessionStorage` — se cierra automáticamente al:
- Cerrar el tab del browser
- Hacer click en "Cerrar sesión" dentro del panel
- Abrir la app en una nueva ventana/tab

### Qué tiene adentro

- Gráfico de ventas vs CMV vs margen bruto vs neto combinado
- Donut de CMV por categoría + curva de Pareto de proveedores
- Línea de márgenes % mensuales
- Tabla completa de riesgo de todos los proveedores (con badges Crítico/Alto/Medio/Bajo)
- Asesor IA con quick prompts estratégicos avanzados

---

## 9. Variables de entorno — referencia rápida

| Variable | Requerida | Descripción |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Para IA | API key de Claude — console.anthropic.com |
| `AFIPSDK_ACCESS_TOKEN` | ✅ Para facturas reales | Token de AfipSDK |
| `AFIPSDK_CUIT` | ✅ Para facturas reales | Tu CUIT sin guiones |
| `AFIPSDK_ENV` | ⚪ Opcional | `prod` (default) o `dev` |
| `SUPABASE_URL` | ⚪ Para multi-usuario | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | ⚪ Para multi-usuario | Service role key de Supabase |
| `JWT_SECRET` | ⚪ Con Supabase | Mismo string que en FacturaFácil Next.js |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ⚪ Para Drive sync | JSON completo de la Service Account |
| `MP_ACCESS_TOKEN` | ⚪ Opcional | Token global de MercadoPago |
| `RESEND_API_KEY` | ⚪ Para emails | API key de Resend |
| `RESEND_FROM_EMAIL` | ⚪ Para emails | Email remitente verificado |
| `AFIP_CERT` | ⚪ Avanzado | Certificado AFIP propio |
| `AFIP_KEY` | ⚪ Avanzado | Clave privada AFIP propia |

---

## 10. Modo sin servicios externos

La app funciona completamente sin configurar ninguna variable de entorno:

| Feature | Con variables | Sin variables |
|---|---|---|
| Asesor IA | Claude real via API | ❌ No disponible |
| Emitir facturas | CAE real de ARCA | CAE demo (simulado) |
| Guardar facturas | Supabase + localStorage | Solo localStorage |
| Impuestos / config | Supabase | Solo localStorage |
| Importar MP | API real de MercadoPago | Token manual del usuario |
| Sincronizar Drive | Service Account automático | Solo upload manual de .xlsx |
| Email de facturas | Resend | ❌ No se envía |

**El modo localStorage es ideal para:** uso personal, testing, demo, o para un solo usuario sin necesidad de persistencia en servidor.

Los datos se guardan en estas keys de `localStorage`:

| Key | Contenido |
|---|---|
| `ff_facturas` | Facturas emitidas |
| `ff_impuestos_cfg` | Configuración fiscal (provincia, régimen, etc.) |
| `ff_impuestos_pagos` | Historial de pagos de impuestos |
| `ff_jwt` | Token JWT de sesión |
| `ff_razon_social` | Nombre del usuario |
| `ff_condicion_iva` | `monotributo` o `responsable_inscripto` |
| `drive_file_id` | File ID del último archivo de Drive usado |
| `drive_files` | Archivos .xlsx cargados |
| `ff_mp_token` | Token de MercadoPago ingresado manualmente |
