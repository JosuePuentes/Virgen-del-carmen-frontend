# Instrucciones para la IA del Backend

Copia y pega este bloque cuando trabajes con la IA de tu backend (Zas-backend-main).

---

## Contexto

El frontend **Virgen del Carmen** (Vite + React) está conectado a tu backend FastAPI en Render. Usa la variable `VITE_API_URL` para la base del API.

## Qué debe hacer la IA del backend

1. **Mantener el documento `BACKEND-ESTADO-PARA-FRONTEND.md`** en la raíz del backend. Ese archivo es la fuente de verdad de rutas, métodos y cuerpos para que el frontend se conecte correctamente.

2. **CORS**: Asegurar que el backend permita peticiones desde el dominio del frontend en Vercel (ej: `https://virgen-del-carmen-frontend.vercel.app`) y desde `localhost` en desarrollo.

3. **Rutas que usa el frontend actualmente:**
   - `POST /login/` — Login cliente (email + password)
   - `POST /login/admin/` — Login admin (usuario + password)
   - `POST /register/` — Registro cliente
   - `POST /contacto` — Formulario de contacto
   - `POST /api/chat` — Chatbot
   - `GET /inventario_maestro/` — Catálogo de productos (debe devolver array o `{ items/data/productos/results }`)
   - `POST /inventario_maestro/` — Crear producto (JSON o FormData con foto)
   - `PUT /inventario_maestro/{id}` — Actualizar producto
   - `GET /pedidos/por_cliente/{rif}` — Pedidos del cliente
   - `POST /reclamos/cliente` — Crear reclamo
   - `GET /reclamos/cliente/{rif}` — Listar reclamos del cliente
   - `GET /clientes/solicitudes/pendientes` — Solicitudes pendientes (token admin)
   - `PATCH /clientes/{rif}/aprobar` — Aprobar cliente (token admin)
   - `PATCH /clientes/{rif}/rechazar` — Rechazar cliente (token admin)
   - `GET /obtener_pedidos/` — Listar pedidos (token admin)
   - `GET /clientes/` — Listar clientes (token admin)
   - `GET /punto-venta/ventas` — Listar ventas (token admin)
   - **Área cliente** (token cliente): `GET /clientes/{rif}`, `PATCH /clientes/{rif}`, `GET /cuentas-por-cobrar/cliente/{rif}`, `GET /facturas/pagadas/cliente/{rif}`. Detalle: `docs/BACKEND-AREA-CLIENTE.md`

4. **Login unificado:**
   - El frontend tiene una sola página `/login` con pestañas Cliente vs Administrador.
   - Cliente: email + password → `/login/` → redirige a área cliente.
   - Admin: usuario + password → `/login/admin/` → redirige a `/admin`.
   - Al crear usuarios en el backend, marcar si es admin o cliente.
   - Si login cliente devuelve 403: `detail` puede ser "Pendiente de aprobación..." o "Solicitud rechazada...".

5. **Formato de respuestas:**
   - Login cliente: `{ "access_token": "...", "rif": "...", "role": "client" }`
   - Login admin: `{ "access_token": "...", "usuario": "...", "modulos": [] }`
   - Errores: usar `detail` (string o lista) para mensajes
   - IDs de MongoDB: devolver `_id` como string

6. **Al añadir o cambiar rutas:** Actualizar `BACKEND-ESTADO-PARA-FRONTEND.md` y avisar que el frontend puede necesitar adaptarse.

## Referencia rápida

- **Área cliente:** `docs/BACKEND-AREA-CLIENTE.md` — Rutas para el panel `/cliente` (Mi cuenta, cuentas por pagar, etc.)
- Documento de API del backend: `Zas-backend-main/BACKEND-ESTADO-PARA-FRONTEND.md`
- Documento resumido en el frontend: `Frontend virgen del carmen/docs/BACKEND-API.md`
- URL del backend (ejemplo): `https://droclven-back.onrender.com`
