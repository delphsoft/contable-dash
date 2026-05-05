# Dashboard Contable

Panel de control contable dark-mode con 5 vistas interactivas y datos reales.

## Vistas
- **Overview** — KPIs ejecutivos, ventas vs CMV, márgenes mensuales
- **Ventas** — Canales de cobro, categorías CMV, gastos fijos apilados
- **Proveedores** — Concentración, curva Pareto, mapa de riesgo por proveedor
- **Break-even** — Simulador interactivo con sliders en tiempo real + 4 escenarios
- **Alertas** — Diagnóstico automático, 3 críticas + 4 advertencias + acción prioritaria

## Stack
- **Vite 5** (bundler)
- **Chart.js 4** (gráficos)
- **Vanilla JS modular** (sin framework)
- **Fuentes**: Syne + DM Mono + Inter (Google Fonts)

---

## Deploy en Vercel (3 pasos)

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "init: dashboard contable"
gh repo create contable-dashboard --public --push --source=.
```
*(Si no tenés GitHub CLI: crear repo manualmente en github.com y seguir las instrucciones)*

### 2. Importar en Vercel
1. Ir a **vercel.com/new**
2. Click **"Import Git Repository"** → seleccionar `contable-dashboard`
3. Vercel detecta Vite automáticamente — **no cambiar nada**
4. Click **Deploy** → URL lista en ~30 segundos

### 3. Dev local
```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Actualizar datos
Editar **`src/data/data.js`** — todos los gráficos se actualizan automáticamente al rebuild.

## Build manual
```bash
npm run build    # genera /dist listo para deploy
npm run preview  # preview local del build
```
