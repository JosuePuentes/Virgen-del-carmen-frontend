# Estado del Backend – Guía para el frontend (Vite)

Este documento describe la API del backend (FastAPI en Render) para conectar el frontend correctamente.

---

## 1. Configuración base

| Concepto | Valor |
|----------|--------|
| **Base URL** | `VITE_API_URL` (ej: `https://droclven-back.onrender.com`) |
| **Content-Type** | `application/json` en POST/PUT/PATCH |
| **Autenticación** | JWT: `Authorization: Bearer <token>` |

---

## 2. Autenticación

- **POST** `/login/` — Body: `{ "email", "password" }` → `access_token`, `rif`, `role`
- **POST** `/register/` — Body: `UserRegister` (email, password, rif, direccion, telefono, encargado, activo, descuento1–3)
- **POST** `/login/admin/` — Body: `{ "usuario", "password" }`
- **POST** `/register/admin/` — Body: `{ "usuario", "password", "rol", "modulos" }`

---

## 3. Contacto y reclamos (públicos)

- **POST** `/contacto` — Body: `{ "nombre", "email", "telefono", "mensaje" }`
- **POST** `/reclamos/cliente` — Crear reclamo
- **GET** `/reclamos/cliente/{rif}` — Reclamos del cliente

---

## 4. Inventario / Catálogo

- **GET** `/inventario/` — Listar inventario
- **GET** `/inventario_maestro/` — Inventario maestro
- **GET** `/inventario_maestro/{id}` — Producto por ID

---

## 5. Pedidos

- **POST** `/pedidos/` — Crear pedido
- **GET** `/obtener_pedidos/` — Listar (query: estados[], fecha_desde, fecha_hasta)
- **GET** `/pedidos/por_cliente/{rif}` — Pedidos del cliente

---

## 6. Chatbot

- **POST** `/api/chat` — Body: `{ "prompt": "string" }` → `{ "response": "string" }`

---

## 7. Resumen

- Guardar `access_token` en localStorage y enviarlo en `Authorization: Bearer <token>`
- Los `_id` vienen como string
- Errores: `response.ok` y `response.json()` para mensajes
