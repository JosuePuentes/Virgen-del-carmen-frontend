# Instrucciones Backend: Módulo de Informes

El frontend tiene un módulo **Informes** que genera reportes a partir de los datos existentes. Usa los endpoints actuales del backend; no requiere endpoints nuevos si ya existen los listados.

---

## Endpoints utilizados por cada informe

| Informe | Endpoint(s) | Notas |
|---------|-------------|-------|
| **General de ventas** | `GET /facturas/pagadas` o `GET /facturas/` | Facturas con: numero, cliente, rif, monto, fecha_pago, total |
| **Inventario** | `GET /inventario_maestro/` | Productos con: codigo, descripcion, costo, utilidad, precio, existencia |
| **Cuentas por cobrar** | `GET /cuentas-por-cobrar/vigentes`, `GET /cuentas-por-cobrar/vencidas` | Factura, cliente, rif, monto, fecha_vencimiento |
| **Cuentas por pagar** | `GET /cuentas-por-pagar/` | Proveedor, concepto, monto, fecha_vencimiento |
| **Clientes** | `GET /clientes/all` o `GET /clientes/` | rif, empresa, encargado, email, telefono, limite_credito |
| **Gastos** | `GET /gastos/?desde=&hasta=` | fecha, descripcion, categoria, monto. Soporta query params desde/hasta |
| **Proveedores** | `GET /proveedores/` | rif, empresa, contacto, telefono |
| **Compras** | `GET /ordenes-compra/` | _id, proveedor_empresa, total, fecha, estado |
| **Picking** | `GET /pedidos/picking/` o `GET /pedidos/por_estado/picking` | _id, cliente, rif, total, estado |
| **Packing** | `GET /pedidos/por_estado/packing` | _id, cliente, rif, total, estado |
| **Solicitudes** | `GET /clientes/solicitudes/pendientes` | rif, empresa, encargado, fecha |
| **Finanzas** | `GET /finanzas/resumen`, `GET /finanzas/gastos`, `GET /cuentas-por-cobrar/total`, `GET /cuentas-por-pagar/total` | Resumen con valor_vendido, utilidad, cuentas_cobrar, cuentas_pagar, gastos |

---

## Formato de respuesta esperado

Todos los endpoints deben devolver un **array** o un objeto con una propiedad que sea array:

- `[{ ... }, { ... }]` 
- `{ "facturas": [...] }`
- `{ "items": [...] }`
- `{ "clientes": [...] }`
- `{ "pedidos": [...] }`
- etc.

El frontend acepta: `data`, `items`, `facturas`, `clientes`, `pedidos`, `gastos`, `cuentas`, `ordenes`, `proveedores`, `solicitudes`.

---

## Filtros por informe

### Ventas
- Fechas: `desde`, `hasta` (filtrado en frontend si el backend no las soporta)

### Gastos
- Query params: `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`

### Inventario
- Sin filtros de backend; el frontend filtra "solo con existencia" y columnas visibles.

---

## Autenticación

Todas las peticiones llevan `Authorization: Bearer <admin_token>`.

---

## Valores en USD

Los montos deben estar en **dólares ($)**. El frontend muestra el equivalente en Bs usando la tasa BCV.
