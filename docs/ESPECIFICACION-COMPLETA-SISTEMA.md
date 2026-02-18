# Especificación completa del sistema – Virgen del Carmen

Documento de referencia para frontend y backend. La lógica descrita debe implementarse en ambos.

---

## 1. Dashboard principal (admin)

**Qué muestra:** Historial y estado de pedidos, no solo contadores.

- Cuántos pedidos hay en **espera**
- Cuántos en **picking** (y qué cliente es cada uno)
- Cuántos en **packing** (y qué cliente es cada uno)
- Cuántos **enviados** (y qué cliente es cada uno)
- Cuántos **entregados** (y qué cliente es cada uno)

Lista/tabla por estado con cliente y datos relevantes.

---

## 2. Solicitudes de clientes

- Cuando un cliente se **registra** en la web, su solicitud llega aquí.
- El admin **aprueba** o **rechaza**.
- Al aprobar, el admin debe completar:
  - Límite de crédito
  - Monto (u otros campos según backend)
  - Días de crédito
  - RIF, nombre empresa, encargado, teléfono, etc.

---

## 3. Pedidos – Administración (validación)

- Muestra todos los **pedidos nuevos** enviados por clientes.
- Datos a mostrar por pedido:
  - **Monto** del pedido
  - **Cliente**
  - **Límite de crédito** del cliente
  - **Límite consumido**
  - Si tiene **facturas vencidas** → no permitir facturar a menos que se ingrese un **PIN**.
- Con el PIN correcto, el pedido puede pasar a picking.
- Acciones: **Validar** (pasar a picking) o **Dejar en espera**.

---

## 4. Crear pedido

- **Buscador** de productos con inventario en **tiempo real**.
- Flujo:
  1. **Seleccionar cliente** primero.
  2. Buscador de productos.
  3. **Agregar al carrito**.
  4. El pedido sigue el flujo normal: validación admin → picking → packing → facturación → enviado → entregado.
- **No mostrar** costo ni utilidad al crear pedido (solo al admin en otros módulos).
- Permitir crear pedidos **sin existencia** en inventario (para alimentar el módulo de fallas).

---

## 5. Picking

- Muestra el **pedido completo**: cliente, monto, productos.
- Escaneo por **código de barra** para ir marcando cada artículo.
- Por cada producto:
  - **Cantidad solicitada** (lo que pidió el cliente).
  - **Cantidad encontrada** (se ingresa manualmente).
- Los productos ya seleccionados **cambian de color**.
- Cuando todos están seleccionados → se habilita el botón **Pasar a packing**.
- Las cantidades se **restan del inventario** en picking (para no perder el orden).

---

## 6. Packing

- Similar al picking: verificación de productos con cantidades.
- Una vez verificado y empacado → pasa a **facturación**.

---

## 7. Facturación

- Selección de productos con **código de barra**.
- Se ingresan cantidades.
- Se **emite factura** a nombre del cliente con todo lo que lleva.
- **Imprimir** o **guardar en PDF**.

---

## 8. Formato de impresión

- Módulo para **diseñar la factura**.
- Definir qué va en la factura y qué no (campos, layout, etc.).

---

## 9. Control de fallas

- Productos donde el cliente pidió más de lo que hay en stock.
- Ejemplo: pidió 100, solo hay 50 → las 50 que faltan van a este módulo.
- Listar todas las **fallas** (productos faltantes por pedido).

---

## 10. Cliente – Ver pedidos

- El cliente ve **sus pedidos** y el **estado** de cada uno (espera, picking, packing, enviado, entregado).

---

## 11. Inventario

- **Cargar inventario en Excel** con columnas:
  - Codigo, Descripcion, Marca, Costo, Utilidad, Precio, Existencia
- **Crear productos** manualmente con toda esa información.
- **Foto opcional** por producto.

---

## 12. Clientes (admin)

- Ver **todos los clientes**.
- **Crear clientes** con:
  - RIF
  - Nombre de la empresa
  - Nombre del encargado
  - Número de teléfono
  - Días de crédito
  - Límite de crédito
- Al crear un cliente manualmente: se genera **correo** y **clave** que serán su usuario como cliente.

---

## 13. Usuarios (admin)

- Solo **usuarios administrativos**.
- Campos: **Cédula**, **nombre**, **teléfono**, **usuario**, **contraseña**.

---

## 14. Dashboard finanzas

- Cantidad de **productos vendidos**.
- Cantidad en **valores vendidos** ($).
- **Utilidad total**.
- **Top 10 productos más vendidos**.
- **Top 10 productos menos vendidos**.
- **Gráficas** de comparación con meses anteriores.
- **Gastos**.

---

## 15. Módulo de gastos

- **Agregar gastos** (registro de gastos del negocio).

---

## 16. Cierre diario

- Resumen al **terminar la jornada**.
- Productos vendidos.
- Cantidad de clientes atendidos.
- Monto en $.
- Gastos del día.
- Tipo **cierre de caja**.
- **Filtros**: por fecha, diario, semanal, mensual.
- Rango de fechas: de X día a Y día.

---

## Flujo de pedidos (resumen)

```
Cliente crea pedido → Validación admin (PIN si facturas vencidas) → Picking (escaneo, cantidades) → Packing (verificación) → Facturación (factura, PDF) → Enviado → Entregado
```

---

## Rutas de API sugeridas (para backend)

- Dashboard: contadores y listas por estado.
- Pedidos: CRUD, actualizar estado, picking, packing, facturación.
- Inventario: carga Excel, CRUD productos, foto.
- Clientes: CRUD, límite crédito, facturas vencidas.
- Usuarios admin: crear con cédula, nombre, teléfono.
- Gastos: crear, listar.
- Cierre diario: resumen por fechas.
- Formato impresión: CRUD diseño factura.
- Control fallas: listar productos faltantes por pedido.
