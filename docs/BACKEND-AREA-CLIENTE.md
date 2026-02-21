# Instrucciones Backend: Área Cliente

**Texto para copiar/pegar a la IA del backend:**

> El frontend tiene un panel de área cliente (`/cliente`) tras el login de un cliente aprobado. Necesita estos endpoints (token cliente en `Authorization: Bearer`):
> - `GET /clientes/{rif}` — Datos del cliente (empresa, encargado, direccion, telefono, email, dias_credito, condiciones_comerciales)
> - `PATCH /clientes/{rif}` — Actualizar datos (body parcial)
> - `GET /cuentas-por-cobrar/cliente/{rif}` — Facturas pendientes de pago
> - `GET /facturas/pagadas/cliente/{rif}` — Facturas ya pagadas
> Detalle completo en este documento.

---

El frontend tiene un **panel de área cliente** (`/cliente`) que se muestra tras el login cuando el usuario está aprobado. Incluye header con nombre de empresa y condiciones comerciales, y menú lateral.

---

## Endpoints utilizados

| Ruta | Método | Descripción |
|------|--------|-------------|
| `GET /clientes/{rif}` | GET | Datos del cliente (empresa, encargado, direccion, telefono, email, dias_credito, condiciones_comerciales, limite_credito) |
| `PATCH /clientes/{rif}` | PATCH | Actualizar datos del cliente (body parcial) |
| `GET /pedidos/por_cliente/{rif}` | GET | Pedidos del cliente |
| `GET /reclamos/cliente/{rif}` | GET | Reclamos del cliente |
| `POST /reclamos/cliente` | POST | Crear reclamo |
| `GET /inventario_maestro/` | GET | Catálogo de productos |

---

## Endpoints sugeridos (para funcionalidad completa)

| Ruta | Método | Descripción |
|------|--------|-------------|
| `GET /cuentas-por-cobrar/cliente/{rif}` | GET | Facturas pendientes de pago del cliente |
| `GET /facturas/pagadas/cliente/{rif}` | GET | Facturas ya pagadas del cliente |
| `GET /promociones/` o `GET /promociones/cliente/{rif}` | GET | Promociones vigentes |
| `GET /inventario_maestro/nuevos` | GET | Productos nuevos (ordenados por fecha de alta) |
| `GET /precios-bajaron/cliente/{rif}` | GET | Productos con precio reducido vs compras anteriores del cliente |
| `GET /planificacion-compra/cliente/{rif}` | GET | Sugerencias de compra según inventario y historial del cliente |

---

## Campos del cliente (GET /clientes/{rif})

El header del panel muestra:

- **empresa** o **encargado** — Nombre de la empresa
- **condiciones_comerciales** — Texto libre (ej: "30 días de crédito")
- **dias_credito** — Si no hay condiciones_comerciales, se muestra "X días de crédito"

---

## Autenticación

Todas las peticiones del área cliente usan el token del cliente:

```
Authorization: Bearer <access_token>
```

El cliente solo puede acceder a sus propios datos (usar el `rif` de la sesión).
