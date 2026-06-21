# Acceso a Crédito en Argentina para PyMEs

## Contexto 2026
El crédito para PyMEs argentinas es escaso, caro y burocrático.
La tasa de interés real suele ser negativa en períodos de alta inflación,
lo que hace que el crédito sea una herramienta de financiamiento genuina
si se obtiene en el momento correcto.

---

## 1. Instrumentos disponibles por tipo

### 1.1 SGR — Sociedades de Garantía Recíproca
**Qué es:** Una SGR avala la deuda de la PyME ante el banco. Sin el aval,
el banco no presta. Con el aval, la PyME accede a tasas preferenciales.

**SGRs principales en Argentina:**
```
Garantizar SGR:    la más grande, respaldada por BICE
Afianzar SGR:      foco en producción y agro
Caución SGR:       comercio e industria
Don Mario SGR:     sector agropecuario
```

**Requisitos típicos:**
- 2 años de antigüedad del negocio
- DDJJ presentadas al día (ARCA verifica)
- Sin deuda en CCMA
- Socio partícipe: aporte del 2.5% del monto avalado

**Conexión con DashBI:**
El score DashBI + historial de vencimientos cumplidos = carpeta de crédito lista.
Una empresa con score > 70 y 6 meses de historial tiene todo para presentarse a una SGR.

---

### 1.2 Banco Nación — Líneas PyME
**Líneas activas 2026:**
```
Línea 400:        capital de trabajo, tasa subsidiada
PyME Plus:        inversión en bienes de capital
Construcción:     obra y ampliación de local
Agro:             prefinanciación de cosecha
```

**Documentación requerida:**
- Últimos 3 años de DDJJ Ganancias
- Últimos 6 meses de F931
- Balance o estado de resultados (si tiene contador)
- Extractos bancarios 6 meses
- Sin deuda ARCA (o plan de facilidades activo)

**Tip:** El diagnóstico DashBI puede pre-evaluar si la empresa está en condiciones
de presentarse antes de que pierda tiempo con el banco.

---

### 1.3 FOGAR — Fondo de Garantías Argentino
**Qué es:** Garantía estatal para PyMEs que no califican en SGR privada.
**Tope:** hasta USD 200.000 equivalente
**Ventaja:** más flexible en requisitos que SGR privada
**Dónde:** a través de bancos adheridos (Nación, Provincia, BBVA, Santander)

---

### 1.4 Fintech lending — alternativa al banco
```
Mercado Crédito:  basado en historial de ventas en MP/ML (sin DDJJ)
Ualá Bis:         crédito para comercios con terminal de pago Ualá
Naranja X:        para comercios adheridos a la red
Pomelo/Bind:      para empresas tech con facturación en USD
Afluenta:         crowdlending, tasas competitivas, sin aval
```

**Ventaja fintech:** aprobación en 24-48hs sin burocracia bancaria.
**Desventaja:** tasas más altas que banco + SGR.

**Cuándo recomendar fintech:**
- Necesidad urgente de capital de trabajo
- Empresa sin historial formal suficiente para banco
- Monto pequeño (< $5M ARS)

---

### 1.5 Leasing — para bienes de capital
**Cuándo conviene sobre el crédito:**
- La empresa necesita maquinaria, vehículos, equipamiento
- El bien queda fuera del balance hasta la opción de compra
- Las cuotas son deducibles de Ganancias (ventaja fiscal)

**Entidades:** BBVA Leasing, Itaú, HSBC, Banco Galicia

---

### 1.6 Factoring / Descuento de cheques
**Qué es:** Anticipar el cobro de facturas o cheques a cambio de una comisión.
**Cuándo usar:** ciclo de cobro largo (60-90 días) + caja ajustada.

```
Cheques de pago diferido:  descontados en Bolsa (tasa más baja)
Facturas de crédito MiPyME: negociables en SISCAAV (BYMA)
Descuento bancario:         rápido pero tasa más alta
```

**Conexión DashBI:** si el diagnóstico detecta "ciclo de cobro largo + caja ajustada",
recomendar factoring como solución inmediata antes que crédito bancario.

---

## 2. Carpeta de crédito — qué debe tener

### Checklist que DashBI puede pre-validar
```
✓ DDJJ IVA últimos 12 meses presentadas (tabla vencimientos)
✓ F931 últimos 6 meses presentados (módulo sueldos)
✓ Sin deuda en CCMA (o plan activo con cuotas al día)
✓ Proveedores principales validados en ARCA
✓ Facturas emitidas consistentes con la facturación declarada
✓ Score DashBI > 65 (señal de orden para el banco)
```

### Lo que el banco verifica que DashBI no tiene (aún)
```
- Extractos bancarios (integración futura con open banking)
- Bienes inmuebles / garantías reales
- Referencias comerciales de proveedores/clientes
```

---

## 3. Estrategia de crédito por etapa de la empresa

### Etapa 1 — Arranque (0-2 años)
```
Opción:  Fintech (Mercado Crédito, Ualá) + tarjeta corporativa
Monto:   $500k - $3M ARS
Uso:     capital de trabajo, stock inicial
```

### Etapa 2 — Crecimiento (2-5 años)
```
Opción:  SGR + Banco Nación Línea 400
Monto:   $3M - $30M ARS
Uso:     ampliación, equipamiento, segundo local
```

### Etapa 3 — Consolidación (5+ años)
```
Opción:  Leasing + Factoring + Líneas exportación
Monto:   $30M+ ARS o USD equivalente
Uso:     expansión, inversión productiva, capital de trabajo estructural
```

---

## 4. El DashBI Score como herramienta de crédito

### Propuesta de valor futura (v2.0)
```
Score DashBI > 70 + 6 meses historial
→ Generar "Carpeta de Crédito DashBI" en PDF
→ Incluye: historial de vencimientos, posición IVA, empleados registrados
→ El banco / SGR la recibe como pre-due diligence
→ PymeStudio cobra comisión por cada crédito aprobado (partnership SGR)
```

**Por qué esto funciona:**
El banco hoy tarda 3-4 semanas en recopilar la misma información que DashBI
tiene en tiempo real. El que agiliza ese proceso tiene una ventaja enorme.
