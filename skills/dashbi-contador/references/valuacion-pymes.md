# Valuación de PyMEs Argentinas

## Contexto
Valuar una PyME argentina es distinto a valuar una empresa en mercados desarrollados.
La inestabilidad macro, la inflación y la informalidad histórica hacen que los métodos
estándar necesiten ajustes significativos.

---

## 1. Cuándo aparece la necesidad de valuación

```
Venta total del negocio              → el dueño quiere salir
Venta parcial / ingreso de socio     → necesita fijar precio de la participación
Acceso a inversión (angel / VC)      → el inversor pide el valuation
Sucesión familiar                    → distribución equitativa entre herederos
Garantía para crédito                → el banco pide valor del negocio
Fusión o absorción                   → precio de la transacción
```

---

## 2. Métodos de valuación — cuál usar cuándo

### 2.1 Múltiplos de EBITDA (el más usado en PyMEs)
**Fórmula:** Valor = EBITDA ajustado × Múltiplo del sector

**EBITDA ajustado para PyME:**
```
Resultado neto
+ Amortizaciones y depreciaciones
+ Intereses financieros
+ Impuesto a las Ganancias
+ Sueldo del dueño (si es excesivo o insuficiente vs mercado)
- Gastos no recurrentes (reparación extraordinaria, multa, etc.)
= EBITDA ajustado
```

**Múltiplos por sector en Argentina (2026 estimado):**
```
Software / Tech:        4x - 8x EBITDA
Servicios profesionales: 2x - 4x EBITDA
Comercio / Retail:      1.5x - 3x EBITDA
Gastronomía:            1x - 2x EBITDA
Industria / manufactura: 2x - 4x EBITDA
Agropecuario:           3x - 6x EBITDA (por activos tierra)
```

**Ajuste por riesgo argentino:** aplicar descuento del 20-30% vs múltiplos de Chile
o Brasil por prima de riesgo país.

---

### 2.2 DCF — Flujo de caja descontado
**Cuándo usar:** empresa con flujos predecibles (SaaS, contratos recurrentes)
**Problema en Argentina:** la tasa de descuento es altísima por la inflación
y el riesgo país → el DCF suele subvaluar empresas locales.

**Fórmula simplificada:**
```
Valor = FCL año 1 / (1+r) + FCL año 2 / (1+r)² + ... + Valor terminal / (1+r)^n

Donde:
FCL = Flujo de Caja Libre (EBITDA - Capex - Variación de capital de trabajo)
r   = Tasa de descuento (WACC + prima de riesgo país ~15-25% en USD)
n   = período de proyección (3-5 años)
```

---

### 2.3 Valor de activos netos (para empresas con activos tangibles)
**Cuándo usar:** inmobiliarias, agro (con tierra), industria con maquinaria
**Fórmula:** Activo total - Pasivo total = Patrimonio neto ajustado a valores de mercado

**Ajustes necesarios:**
- Revaluar inmuebles a precio de mercado (no valor contable)
- Revaluar maquinaria a valor de reposición
- Descontar deuda fiscal no registrada (CCMA)
- Incluir contingencias laborales (empleados no registrados)

---

### 2.4 Revenue múltiple (para SaaS y tech)
**Fórmula:** Valor = ARR × Múltiplo
```
ARR (Annual Recurring Revenue) × múltiplo:
  < USD 100k ARR:     1x - 2x ARR
  USD 100k - 500k:    2x - 4x ARR
  > USD 500k ARR:     4x - 8x ARR (con churn < 5%)
```

**Para PymeStudio:**
Si DashBI llega a USD 50k ARR → valor indicativo USD 100k - 200k
Si llega a USD 200k ARR → valor indicativo USD 400k - 800k

---

## 3. Due diligence fiscal — lo que el comprador va a pedir

### Red flags que destruyen valor
```
🔴 Deuda ARCA no declarada (CCMA)
🔴 Empleados no registrados (contingencia LCT)
🔴 Sociedad de hecho (responsabilidad ilimitada del vendedor)
🔴 Proveedores clave sin validar (crédito fiscal cuestionable)
🔴 DDJJ no presentadas o con errores
🔴 Juicios laborales o comerciales activos
```

### Lo que DashBI puede certificar antes de la venta
```
✓ Historial de vencimientos cumplidos (score de compliance)
✓ Proveedores validados en padrón ARCA
✓ F931 presentado sin gaps
✓ Posición IVA sin irregularidades
✓ Score DashBI > 70 = empresa "vendible" sin descuentos por riesgo
```

### Checklist de due diligence para el vendedor (prepararse 6 meses antes)
```
Mes 1-2: Regularizar empleados no registrados
Mes 2-3: Saldar deuda ARCA o activar plan de facilidades
Mes 3-4: Constituir SAS/SRL si está en sociedad de hecho
Mes 4-5: Limpiar proveedores sin validar
Mes 5-6: Tener 6 meses de historial limpio en DashBI
```

---

## 4. Estructura de la transacción

### Opciones de venta
```
Asset deal:   se venden los activos (más común en PyMEs, el comprador no hereda pasivos)
Share deal:   se venden las participaciones societarias (el comprador hereda todo)
Earn-out:     parte del precio se paga según performance futura (reduce riesgo comprador)
```

### Impuesto a la transferencia
```
Personas físicas: Impuesto a las Ganancias sobre la ganancia de capital
Sociedades:       Impuesto a las Ganancias societario
Inmuebles:        ITBI provincial + Ganancias si es empresa unipersonal
```

---

## 5. Cómo DashBI aumenta el valor de venta

### El argumento
Una empresa con DashBI activo y score > 70 durante 12 meses vale más porque:
1. El comprador tiene visibilidad real del negocio (reduce incertidumbre)
2. El riesgo fiscal está cuantificado (no hay sorpresas post-cierre)
3. La gestión es transferible (el sistema no depende del dueño)
4. El historial en Supabase es la carpeta de due diligence lista

### Frase para usar con el cliente que quiere vender
> "Empezá a usar DashBI hoy. En 12 meses tenés el historial que el comprador
> va a pedir. Ese historial limpio puede ser la diferencia entre vender a 2x
> o a 4x el EBITDA."
