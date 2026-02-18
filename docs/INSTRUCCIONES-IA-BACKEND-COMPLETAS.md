# Instrucciones para la IA del Backend – Sistema completo Virgen del Carmen

Copia y pega este documento cuando trabajes con la IA de tu backend (Zas-backend-main).

---

## Contexto

El frontend Virgen del Carmen necesita un backend que soporte toda la lógica de negocio descrita. El frontend está en Vite + React y se conecta vía `VITE_API_URL`. Todas las peticiones admin llevan `Authorization: Bearer <token>`.

---

## 1. Dashboard principal

**Necesita:** Endpoints que devuelvan pedidos agrupados por estado con datos del cliente.

- `GET /pedidos/por_estado/espera` (o `nuevo`) – pedidos en espera
- `GET /pedidos/por_estado/picking` – pedidos en picking
- `GET /pedidos/por_estado/packing` – pedidos en packing
- `GET /pedidos/por_estado/enviado` – pedidos enviados
- `GET /pedidos/por_estado/entregado` – pedidos entregados

Cada respuesta debe incluir: `_id`, `cliente`, `rif`, `total`, `estado`, y datos del cliente asociado.

---

## 2. Solicitudes de clientes

- `GET /clientes/solicitudes/pendientes` – listar solicitudes pendientes
- `PATCH /clientes/{rif}/aprobar` – al aprobar, el body debe aceptar: `limite_credito`, `dias_credito`, `monto` (o campos que definas para crédito)
- `PATCH /clientes/{rif}/rechazar`

---

## 3. Pedidos – Validación admin

- `GET /pedidos/administracion/` – pedidos nuevos para validar
- Por cada pedido el frontend necesita:
  - `monto`, `cliente`, `rif`
  - `limite_credito` del cliente
  - `limite_consumido` del cliente
  - `tiene_facturas_vencidas` (boolean)
- Si `tiene_facturas_vencidas` → el frontend pedirá PIN antes de validar
- `PUT /pedidos/actualizar_estado/{id}` – body: `{ "nuevo_estado": "picking", "pin": "..." }` (pin opcional si hay facturas vencidas)
- `POST /pedidos/{id}/validar` – body: `{ "pin": "..." }` para validar con PIN cuando hay facturas vencidas

---

## 4. Crear pedido

- `POST /pedidos/` – crear pedido con `cliente`, `rif`, `productos[]`, `total`, `subtotal`
- Permitir crear pedidos **sin verificar existencia** (para control de fallas)
- `GET /inventario_maestro/` – para buscador en tiempo real (no incluir `costo` ni `utilidad` en la respuesta para ese endpoint si se usa en crear pedido, o crear endpoint específico)
- `GET /clientes/` o `/clientes/all` – para selector de cliente

---

## 5. Picking

- `GET /pedidos/picking/` – pedidos en picking (o `GET /pedidos/por_estado/picking`)
- `GET /pedidos/{id}` – detalle del pedido con productos (cantidad_pedida, cantidad_encontrada)
- `PATCH /pedidos/actualizar_cantidades/{id}` – body: `{ "cantidades": { "CODIGO": cantidad_encontrada } }`
- Al actualizar cantidades, **restar del inventario** las cantidades encontradas
- `PATCH /pedidos/actualizar_picking/{id}` – info de picking
- Cuando todo listo: `PUT /pedidos/actualizar_estado/{id}` con `nuevo_estado: "packing"`

---

## 6. Packing

- `GET /pedidos/por_estado/packing`
- Verificación similar a picking
- Al finalizar: pasar a estado `para_facturar` o `facturando`

---

## 7. Facturación

- `GET /pedidos/para_facturar/` – pedidos listos para facturar
- `PUT /pedidos/actualizar_facturacion/{id}`
- `PUT /pedidos/finalizar_facturacion/{id}` – emite la factura
- Generar **factura** (HTML/PDF) con diseño configurable
- El frontend espera una URL para descargar/ver el PDF: `{API_BASE}/pedidos/{id}/factura-pdf` o similar

---

## 8. Formato de impresión

- `GET /formatos-impresion/` – listar formatos
- `GET /formatos-impresion/{tipo}` – obtener diseño
- `POST /formatos-impresion/` – crear
- `PUT /formatos-impresion/{tipo}` – actualizar
- Definir qué campos lleva la factura (layout, logo, etc.)

---

## 9. Control de fallas

- `GET /fallas/` – listar productos faltantes (cantidad_pedida > cantidad_encontrada)
- Cada item: `pedido_id`, `codigo`, `descripcion`, `cantidad_pedida`, `cantidad_encontrada`, `proveedor_id`, `proveedor_empresa`, `precio_venta`
- `PATCH /fallas/{id}` – body: `{ proveedor_id, precio_venta }` para marcar proveedor y precio de venta
- Opcional: `GET /fallas/?pedido_id=...` para filtrar por pedido

---

## 10. Clientes – Ver pedidos (área cliente)

- `GET /pedidos/por_cliente/{rif}` – ya existe
- Incluir `estado` en cada pedido para que el cliente vea en qué etapa está

---

## 11. Inventario

- `POST /inventarios/upload-excel` – carga Excel (FormData con `file`). Columnas: Codigo, Descripcion, Marca, Costo, Utilidad, Precio, Existencia
- `POST /inventario_maestro/` – crear producto con: codigo, descripcion, marca, costo, utilidad, precio, existencia. Si incluye `foto` (FormData), aceptar multipart
- `GET /inventario_maestro/` – listar
- `PUT /inventario_maestro/{id}` – actualizar

---

## 12. Clientes (admin)

- `GET /clientes/all` – todos los clientes
- `POST /clientes/` – crear con: rif, empresa, encargado, telefono, dias_credito, limite_credito
- Al crear: generar **email** y **password** que serán las credenciales del cliente
- `PATCH /clientes/{rif}` – editar
- `GET /clientes/{rif}` – detalle con limite_credito, limite_consumido, facturas_vencidas

---

## 13. Usuarios administrativos

- `POST /register/admin/` – body: `{ "cedula", "nombre", "telefono", "usuario", "password", "rol", "modulos" }`
- No exponer `costo` ni `utilidad` en endpoints usados por crear pedido

---

## 14. Cuentas por cobrar

- `GET /cuentas-por-cobrar/vigentes` – facturas con días de crédito restantes. Cada item: numero, cliente, rif, monto/total, fecha_emision, dias_restantes, fecha_vencimiento
- `GET /cuentas-por-cobrar/vencidas` – facturas vencidas. Cada item: numero, cliente, rif, monto/total, fecha_vencimiento, dias_vencidos
- `GET /cuentas-por-cobrar/total` – { total } monto total por cobrar (para dashboard finanzas)

---

## 15. Cuentas por pagar

- `GET /cuentas-por-pagar/` – obligaciones con proveedores. Cada item: proveedor_empresa, proveedor_rif, concepto, monto, fecha_vencimiento, dias_credito
- `GET /cuentas-por-pagar/total` – { total } monto total por pagar (para dashboard finanzas)

---

## 16. Facturas finalizadas

- `GET /facturas/top-clientes` – top 10 mejores clientes. Cada item: cliente/empresa, rif, total, cantidad_pedidos
- `GET /facturas/clientes-poco-frecuentes` – clientes que no compran frecuentemente. Cada item: cliente, rif, ultimo_pedido, dias_sin_comprar
- `GET /facturas/pagadas` – facturas ya pagadas. Cada item: numero, cliente, rif, monto/total, fecha_pago

---

## 17. Proveedores

- `GET /proveedores/` – listar proveedores
- `POST /proveedores/` – crear con: rif, empresa, dias_credito, condiciones_comerciales (%), pronto_pago_porcentaje (%)
- `PUT /proveedores/{id}` – actualizar
- `DELETE /proveedores/{id}` – eliminar

---

## 18. Compras

- `POST /compras/totalizar` – body: { proveedor_id, productos: [{ codigo, cantidad }] }. Suma cantidades al inventario directamente (sin crear orden)
- Ver sección Órdenes de compra para generar orden

---

## 19. Lista comparativa

- `GET /listas-comparativas/` – listar listas de precio cargadas por proveedor
- `GET /listas-comparativas/productos` – todos los productos de todas las listas (con precio_final ya con descuento de condiciones comerciales aplicado)
- `POST /listas-comparativas/upload` – FormData: `file` (Excel), `proveedor_id`. Columnas Excel: codigo, descripcion, marca, precio, existencia. Aplicar descuento de `condiciones_comerciales` del proveedor al precio
- Cada producto en la respuesta: `proveedor_id`, `proveedor_empresa`, `codigo`, `descripcion`, `marca`, `precio` (original), `precio_final` (con descuento), `existencia`

---

## 20. Órdenes de compra

- `GET /ordenes-compra/` – listar órdenes. Cada item: _id, proveedor_empresa, proveedor_rif, total, totalizada/estado, fecha
- `POST /ordenes-compra/` – crear orden. Body: { proveedor_id, proveedor_rif, productos: [{ codigo, descripcion, costo, cantidad }], total }
- `GET /ordenes-compra/{id}` – detalle con productos
- `PUT /ordenes-compra/{id}` – actualizar productos y total
- `POST /ordenes-compra/{id}/totalizar` – marcar como totalizada y sumar cantidades al inventario

---

## 21. Dashboard finanzas

- `GET /finanzas/resumen` – { productos_vendidos, valor_vendido, utilidad }
- `GET /finanzas/top-productos?tipo=mas` – top 10 más vendidos
- `GET /finanzas/top-productos?tipo=menos` – top 10 menos vendidos
- `GET /finanzas/graficas` – array de { mes, valor } por mes
- `GET /finanzas/gastos` – { total } o número con total de gastos
- El dashboard también llama a `cuentas-por-cobrar/total` y `cuentas-por-pagar/total` para el resumen financiero

---

## 22. Gastos

- `POST /gastos/` – registrar gasto (monto, descripcion, fecha, categoria)
- `GET /gastos/?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` – listar con filtros por fecha
- `DELETE /gastos/{id}` – eliminar gasto

---

## 23. Cierre diario

- `GET /cierre-diario/?fecha=YYYY-MM-DD` – resumen del día
- `GET /cierre-diario/?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` – rango de fechas
- Respuesta: productos vendidos, cantidad clientes, monto total, gastos, utilidad
- Filtros: diario, semanal, mensual

---

## Resumen de endpoints nuevos o a ajustar

| Módulo | Endpoints clave |
|--------|-----------------|
| Dashboard | Pedidos por estado con cliente |
| Solicitudes | Aprobar con limite_credito, dias_credito |
| Validación | Límite crédito, facturas vencidas, PIN |
| Picking | Actualizar cantidades, restar inventario |
| Facturación | Factura PDF, formato impresión |
| Fallas | Productos faltantes por pedido |
| Inventario | Carga Excel, crear producto con foto |
| Clientes | Crear con email/password auto |
| Usuarios | Cedula, nombre, telefono |
| Finanzas | Resumen, top productos, gráficas |
| Gastos | CRUD gastos |
| Cierre diario | Resumen por fecha/rango |
| Cuentas por cobrar | Facturas vigentes, vencidas, total |
| Cuentas por pagar | Obligaciones con proveedores |
| Facturas finalizadas | Top clientes, poco frecuentes, pagadas |
| Proveedores | CRUD con RIF, días crédito, condiciones %, pronto pago % |
| Compras | Totalizar directo o generar orden |
| Órdenes de compra | CRUD, editar, totalizar (suma a inventario) |
| Lista comparativa | Cargar Excel por proveedor, buscar, comparar precios, mi existencia |
| Control fallas | Incluir proveedor y precio_venta por producto faltante |

---

**Referencia:** Documento completo en `docs/PANEL-ADMIN-PARA-FRONTEND.md` (backend) y `docs/ESPECIFICACION-COMPLETA-SISTEMA.md` (frontend).
