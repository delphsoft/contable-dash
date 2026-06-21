# Consultas tipo — Supabase / DashBI

## 1. Posición IVA completa de un período

```javascript
// Débito fiscal (ventas)
const { data: ventas } = await supabase
  .from('facturas')
  .select('neto_gravado, iva_21, iva_105, iva_27, fecha, tipo_comprobante')
  .eq('user_id', userId)
  .gte('fecha', `${year}-${month}-01`)
  .lte('fecha', `${year}-${month}-31`)
  .in('tipo_comprobante', ['A', 'B', 'C'])

const debitoFiscal = ventas.reduce((acc, f) => 
  acc + (f.iva_21 || 0) + (f.iva_105 || 0) + (f.iva_27 || 0), 0)

// Crédito fiscal (compras tipo A validadas)
const { data: compras } = await supabase
  .from('compras')
  .select('iva_21, iva_105, padron_validado, tipo_comprobante')
  .eq('user_id', userId)
  .eq('padron_validado', true)
  .eq('tipo_comprobante', 'A')
  .gte('fecha', `${year}-${month}-01`)
  .lte('fecha', `${year}-${month}-31`)

const creditoFiscal = compras.reduce((acc, c) =>
  acc + (c.iva_21 || 0) + (c.iva_105 || 0), 0)

const posicion = debitoFiscal - creditoFiscal
// > 0 → saldo a favor del fisco (pagar)
// < 0 → saldo a favor del contribuyente
```

---

## 2. Ranking de proveedores por monto compras

```javascript
const { data } = await supabase
  .from('compras')
  .select('razon_social, cuit_proveedor, total, padron_validado')
  .eq('user_id', userId)
  .gte('fecha', desde)
  .lte('fecha', hasta)
  .order('total', { ascending: false })

// Agrupar por proveedor
const porProveedor = data.reduce((acc, c) => {
  acc[c.cuit_proveedor] = acc[c.cuit_proveedor] || 
    { razon_social: c.razon_social, total: 0, validado: c.padron_validado }
  acc[c.cuit_proveedor].total += c.total
  return acc
}, {})
```

---

## 3. Vencimientos próximos (próximos 30 días)

```javascript
const hoy = new Date().toISOString().split('T')[0]
const en30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

const { data } = await supabase
  .from('vencimientos')
  .select('*')
  .eq('user_id', userId)
  .eq('estado', 'pendiente')
  .gte('fecha_vencimiento', hoy)
  .lte('fecha_vencimiento', en30)
  .order('fecha_vencimiento', { ascending: true })

// Calcular urgencia
const conUrgencia = data.map(v => {
  const dias = Math.ceil(
    (new Date(v.fecha_vencimiento) - new Date()) / 86400000
  )
  return { ...v, dias_restantes: dias, 
    urgencia: dias <= 3 ? 'rojo' : dias <= 7 ? 'naranja' : 'verde' }
})
```

---

## 4. Resumen de sueldos por período (para F931)

```javascript
const { data } = await supabase
  .from('sueldos')
  .select(`
    nombre_empleado, cuil, periodo,
    remuneracion_bruta, total_aportes, total_contribuciones, 
    remuneracion_neta
  `)
  .eq('user_id', userId)
  .eq('periodo', `${year}-${month}`)
  .order('nombre_empleado')

const totales = data.reduce((acc, s) => ({
  masa_salarial: acc.masa_salarial + s.remuneracion_bruta,
  total_aportes: acc.total_aportes + s.total_aportes,
  total_contribuciones: acc.total_contribuciones + s.total_contribuciones,
  empleados: acc.empleados + 1
}), { masa_salarial: 0, total_aportes: 0, total_contribuciones: 0, empleados: 0 })
```

---

## 5. Evolución mensual de facturación (para gráfico)

```javascript
const { data } = await supabase
  .rpc('facturacion_mensual', { 
    p_user_id: userId, 
    p_year: year 
  })
// Requiere función RPC en Supabase:
// CREATE OR REPLACE FUNCTION facturacion_mensual(p_user_id uuid, p_year int)
// RETURNS TABLE(mes int, total numeric, cantidad int) AS $$
//   SELECT EXTRACT(MONTH FROM fecha)::int, SUM(total), COUNT(*)
//   FROM facturas WHERE user_id = p_user_id 
//   AND EXTRACT(YEAR FROM fecha) = p_year
//   GROUP BY 1 ORDER BY 1
// $$ LANGUAGE sql;
```

---

## 6. Alerta proveedores no validados en ARCA

```javascript
const { data } = await supabase
  .from('compras')
  .select('cuit_proveedor, razon_social, fecha, total')
  .eq('user_id', userId)
  .eq('padron_validado', false)
  .gte('fecha', desde)
  .order('total', { ascending: false })

// Estos comprobantes NO generan crédito fiscal IVA
// Informar al cliente para que gestione la situación con el proveedor
```

---

## 7. Última consulta CCMA

```javascript
const { data } = await supabase
  .from('ccma_consultas')
  .select('*')
  .eq('user_id', userId)
  .order('consultado_at', { ascending: false })
  .limit(1)
  .single()

// data.deuda_total → deuda total al momento de la consulta
// data.resultado → JSON completo con detalle por período
// data.consultado_at → cuándo fue la última consulta
```
