# Comercio Exterior para PyMEs Argentinas

## Contexto 2026
Argentina tiene uno de los regímenes cambiarios más complejos del mundo.
Exportar es una oportunidad real para PyMEs (dólares genuinos, beneficios fiscales)
pero requiere entender las restricciones BCRA + obligaciones ARCA simultáneamente.

---

## 1. Exportación de servicios — el camino más accesible

### 1.1 Exporta Simple (RG ARCA 5000/2021 actualizada)
**Para quién:** PyMEs que exportan bienes o servicios hasta USD 600.000/año
**Ventajas:**
- Trámite 100% online, sin despachante de aduana
- Cobro en USD en cuenta bancaria local
- Exención de IVA en la exportación
- Devolución de retenciones IVA de compras (crédito fiscal)
- Sin cupo de BCRA para importes bajo umbral

**Proceso:**
```
1. Registrarse en ARCA como exportador
2. Alta en Exporta Simple (portal ARCA)
3. Emitir factura E (exportación) desde FacturaFácil
4. Declarar cobro del exterior en 30 días desde el ingreso
5. Liquidar divisas en el MULC (tipo de cambio oficial)
```

**Conexión DashBI:**
Si el diagnóstico detecta "servicios + cliente del exterior" → recomendar Exporta Simple
y vincular con FacturaFácil para configurar facturas E.

---

### 1.2 Economía del Conocimiento (Ley 27.506)
**Para quién:** Software, servicios tech, diseño, consultoría, contenidos digitales

**Beneficios 2026:**
```
- Estabilidad fiscal por 10 años
- Reducción de alícuota Ganancias a 15% (vs 35% régimen general)
- Bono de crédito fiscal transferible (hasta 70% de cargas sociales)
- Libre disponibilidad del 30% de divisas (sin liquidar al oficial)
```

**Requisitos:**
- Inscripción en el Registro de Beneficiarios (SEPYME)
- Exportar mínimo un % de la facturación (varía por categoría)
- Inversión en I+D o capacitación documentada

**Cuándo recomendar:**
Empresa tech/software con facturación > $20M ARS → siempre analizar Economía del Conocimiento.
El beneficio de Ganancias al 15% vs 35% puede ser transformador.

---

## 2. Exportación de bienes — régimen general

### 2.1 Derechos de exportación (retenciones)
```
Soja y derivados:    33%
Trigo:               12%
Maíz:                12%
Girasol:             7%
Manufacturas industriales: 4.5%
Economía del conocimiento: 0%
Servicios:           0%
```

### 2.2 Reintegros de exportación
El Estado devuelve parte del IVA y tributos internos pagados en la cadena productiva.
Porcentaje varía por NCM (Nomenclador Común del Mercosur).
Se tramita online en ARCA post-exportación.

---

## 3. Régimen cambiario BCRA 2026

### Obligación de liquidación de divisas
```
Exportación de bienes:    liquidar en MULC a los 15-30 días del cobro
Exportación de servicios: liquidar en MULC a los 5 días hábiles
Economía del conocimiento: 30% libre disponibilidad, 70% MULC
```

### Tipo de cambio relevante
```
Tipo de cambio oficial (MULC): para liquidación obligatoria
CCL / MEP:                     para libre disponibilidad (legal vía bonos)
```

### Cuenta corriente en USD (para exportadores)
Los exportadores pueden mantener hasta el % de libre disponibilidad
en cuenta en USD sin liquidar. Esto es una ventaja vs importadores.

---

## 4. Importación — para PyMEs que compran del exterior

### Sistema SIRA (Sistema de Importaciones de la República Argentina)
```
Paso 1: Solicitar licencia SIRA en ARCA antes de importar
Paso 2: Esperar aprobación (puede tardar semanas)
Paso 3: Con SIRA aprobado: pagar al exterior y recibir mercadería
Paso 4: Declarar en Aduana (DGA)
```

**Restricciones 2026:**
- Cupos por categoría de producto
- Acceso limitado al MULC para pago de importaciones
- Estadística de importación: arancel del 3% sobre CIF

### Riesgo para PyMEs importadoras
Si el cliente tiene alta dependencia de insumos importados → riesgo de desabastecimiento
o suba de costos por restricciones SIRA. Detectar en diagnóstico dimensión financiera.

---

## 5. Incoterms relevantes para PyMEs

```
EXW (Ex Works):     el comprador se hace cargo desde la fábrica del vendedor
FOB (Free On Board): el vendedor pone la mercadería en el barco
CIF (Cost+Insurance+Freight): el vendedor paga flete y seguro hasta destino
DDP (Delivered Duty Paid): el vendedor paga todo hasta la puerta del comprador
```

**Para PyME exportadora argentina:** usar FOB → precio claro, responsabilidad limitada.
**Para PyME importadora:** negociar CIF → el proveedor gestiona el flete.

---

## 6. Integración con el ecosistema PymeStudio

### FacturaFácil — Factura E (exportación)
- Tipo de comprobante: E
- Moneda: USD (o la moneda del exterior)
- Sin IVA (exportación exenta)
- CAE requerido igual que factura A o B
- Conexión con ARCA/AfipSDK: misma pipeline que facturas domésticas

### DashBI — señales de exportación a detectar
```
"cliente del exterior" → recomendar Exporta Simple + Factura E
"software" + "usd" → Economía del Conocimiento
"importo insumos" → alertar riesgo SIRA + costo en USD
"factura en dólares" → verificar liquidación BCRA correcta
```

### Vencimientos específicos de exportación
```
Liquidación divisas servicios:  5 días hábiles desde el cobro
Liquidación divisas bienes:     15-30 días según tipo de bien
Presentación DDJJ exportación: mensual si supera umbral
```
