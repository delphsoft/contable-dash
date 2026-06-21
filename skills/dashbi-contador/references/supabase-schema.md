# Supabase Schema — DashBI / contable-dash

## Tabla: facturas
Comprobantes emitidos por el contribuyente.

| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| cuit_emisor | text | CUIT del contribuyente |
| cuit_receptor | text | CUIT del cliente |
| razon_social_receptor | text | Nombre del cliente |
| tipo_comprobante | text | 'A', 'B', 'C', 'M' |
| punto_venta | int | Número de PV |
| numero | int | Número de comprobante |
| fecha | date | Fecha de emisión |
| concepto | int | 1=Productos, 2=Servicios, 3=Ambos |
| neto_gravado | numeric | Base imponible |
| iva_21 | numeric | IVA al 21% |
| iva_105 | numeric | IVA al 10.5% |
| iva_27 | numeric | IVA al 27% |
| exento | numeric | Monto exento |
| total | numeric | Total del comprobante |
| cae | text | CAE emitido por ARCA |
| cae_vto | date | Vencimiento del CAE |
| created_at | timestamptz | |

**Query posición IVA ventas (período mensual)**:
```sql
SELECT
  DATE_TRUNC('month', fecha) as periodo,
  SUM(neto_gravado) as neto_total,
  SUM(iva_21 + iva_105 + iva_27) as debito_fiscal,
  COUNT(*) as cantidad_comprobantes
FROM facturas
WHERE user_id = $1
  AND fecha BETWEEN $2 AND $3
GROUP BY 1
ORDER BY 1
```

---

## Tabla: compras
Comprobantes recibidos (crédito fiscal IVA).

| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| cuit_proveedor | text | CUIT del proveedor |
| razon_social | text | Nombre del proveedor |
| tipo_comprobante | text | 'A', 'B', 'C' |
| punto_venta | int | |
| numero | int | |
| fecha | date | Fecha del comprobante |
| neto_gravado | numeric | |
| iva_21 | numeric | |
| iva_105 | numeric | |
| total | numeric | |
| padron_validado | boolean | true = proveedor válido en ARCA |
| padron_categoria | text | 'RI', 'MT', 'EX', 'NI' |
| created_at | timestamptz | |

**Nota importante**: Solo generar crédito fiscal de comprobantes con
`padron_validado = true` y `tipo_comprobante = 'A'`.

**Query crédito fiscal compras**:
```sql
SELECT
  SUM(iva_21 + iva_105) as credito_fiscal,
  COUNT(*) as cantidad,
  COUNT(*) FILTER (WHERE NOT padron_validado) as proveedores_no_validados
FROM compras
WHERE user_id = $1
  AND fecha BETWEEN $2 AND $3
  AND padron_validado = true
  AND tipo_comprobante = 'A'
```

---

## Tabla: sueldos
Liquidaciones de personal.

| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| empleado_id | uuid | FK → empleados |
| nombre_empleado | text | |
| cuil | text | |
| periodo | text | 'YYYY-MM' |
| categoria | text | Convenio/categoría |
| remuneracion_bruta | numeric | |
| aporte_jubilacion | numeric | 11% |
| aporte_obra_social | numeric | 3% |
| aporte_pami | numeric | 3% |
| otros_aportes | numeric | |
| total_aportes | numeric | Total retenciones empleado |
| contribucion_jubilacion | numeric | Empleador |
| contribucion_obra_social | numeric | Empleador |
| contribucion_art | numeric | Empleador |
| total_contribuciones | numeric | Total cargo empleador |
| remuneracion_neta | numeric | Bruto - aportes |
| created_at | timestamptz | |

---

## Tabla: vencimientos
Motor de vencimientos ARCA 2026.

| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| obligacion | text | Nombre (ej: 'IVA mensual') |
| tipo | text | 'IVA', 'F931', 'Ganancias', 'Monotributo', 'SICORE', 'BBPP' |
| periodo | text | 'YYYY-MM' |
| fecha_vencimiento | date | |
| estado | text | 'pendiente', 'cumplido', 'vencido' |
| vep_link | text | Deep link VEP para pago |
| monto_estimado | numeric | Estimación si está disponible |
| cumplido_at | timestamptz | Cuándo se marcó como cumplido |

---

## Tabla: ccma_consultas
Historial de consultas de deuda en ARCA.

| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| cuit | text | CUIT consultado |
| periodo_desde | text | 'MM/YYYY' |
| periodo_hasta | text | 'MM/YYYY' (max 12/2025) |
| resultado | jsonb | Respuesta completa AfipSDK |
| deuda_total | numeric | Suma calculada |
| consultado_at | timestamptz | |
