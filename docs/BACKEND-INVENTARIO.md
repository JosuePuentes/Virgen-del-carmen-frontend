# Instrucciones Backend: Módulo Inventario Maestro

El frontend tiene un módulo **Inventario** en el panel admin que permite crear, listar y editar productos. El backend debe implementar los siguientes endpoints.

---

## Endpoints requeridos

| Método | Ruta | Descripción |
|--------|------|-------------|
| **GET** | `/inventario_maestro/` | Listar todos los productos |
| **POST** | `/inventario_maestro/` | Crear producto (JSON o FormData si hay foto) |
| **PUT** | `/inventario_maestro/{id}` | Actualizar producto existente |

---

## Autenticación

Todas las peticiones requieren token de administrador:

```
Authorization: Bearer <admin_token>
```

---

## 1. GET /inventario_maestro/ — Listar productos

**Respuesta esperada:** Un array de productos o un objeto con una propiedad array.

Formatos aceptados por el frontend:

- Array directo: `[{ ... }, { ... }]`
- `{ "items": [...] }`
- `{ "productos": [...] }`
- `{ "data": [...] }`
- `{ "results": [...] }`

**Campos por producto:**

| Campo | Tipo | Notas |
|-------|------|-------|
| `_id` o `id` | string | Obligatorio (identificador) |
| `codigo` | string | Código del producto |
| `descripcion` o `nombre` | string | Nombre/descripción |
| `marca` o `laboratorio` | string | Opcional |
| `costo` | number | Costo en USD |
| `utilidad` | number | Porcentaje de utilidad |
| `precio` | number | Precio de venta |
| `existencia` | number | Cantidad en stock |
| `stock_minimo` | number | Opcional |
| `stock_maximo` | number | Opcional |

---

## 2. POST /inventario_maestro/ — Crear producto

**Content-Type:** `application/json` (sin foto) o `multipart/form-data` (con foto).

**Body (JSON):**

```json
{
  "codigo": "PROD-001",
  "descripcion": "Producto ejemplo",
  "marca": "Marca X",
  "costo": 10.50,
  "utilidad": 25,
  "precio": 13.13,
  "existencia": 100,
  "stock_minimo": 5,
  "stock_maximo": 200
}
```

**Body (FormData con foto):** Los mismos campos como strings/numbers + archivo en campo `foto`.

**Respuesta esperada:** El producto creado con `_id` o `id` para que el frontend lo muestre de inmediato en el listado.

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "codigo": "PROD-001",
  "descripcion": "Producto ejemplo",
  "marca": "Marca X",
  "costo": 10.5,
  "utilidad": 25,
  "precio": 13.13,
  "existencia": 100,
  "stock_minimo": 5,
  "stock_maximo": 200
}
```

---

## 3. PUT /inventario_maestro/{id} — Actualizar producto

**Content-Type:** `application/json`

**Body:** Mismos campos que POST (todos opcionales excepto los que se quieran actualizar):

```json
{
  "codigo": "PROD-001",
  "descripcion": "Producto actualizado",
  "marca": "Marca X",
  "costo": 11.00,
  "utilidad": 30,
  "precio": 14.30,
  "existencia": 95,
  "stock_minimo": 10,
  "stock_maximo": 250
}
```

**Respuesta:** 200 OK (o el producto actualizado). El frontend recarga el listado tras guardar.

---

## Resumen para la IA del backend

1. Implementar `GET /inventario_maestro/` que devuelva un **array** o `{ items/data/productos/results: [...] }`.
2. Implementar `POST /inventario_maestro/` que acepte JSON o FormData y devuelva el producto creado con `_id`.
3. Implementar `PUT /inventario_maestro/{id}` para actualizar productos.
4. Todas las rutas requieren token admin en `Authorization: Bearer <token>`.
5. Actualizar `BACKEND-ESTADO-PARA-FRONTEND.md` con estas rutas.
