# Instrucciones para la IA del Backend

Copia y pega este bloque cuando trabajes con la IA de tu backend (Zas-backend-main).

---

## Contexto

El frontend **Virgen del Carmen** (Vite + React) está conectado a tu backend FastAPI en Render. Usa la variable `VITE_API_URL` para la base del API.

## Qué debe hacer la IA del backend

1. **Mantener el documento `BACKEND-ESTADO-PARA-FRONTEND.md`** en la raíz del backend. Ese archivo es la fuente de verdad de rutas, métodos y cuerpos para que el frontend se conecte correctamente.

2. **CORS**: Asegurar que el backend permita peticiones desde el dominio del frontend en Vercel (ej: `https://virgen-del-carmen-frontend.vercel.app`) y desde `localhost` en desarrollo.

3. **Rutas que usa el frontend actualmente:**
   - `POST /login/` — Login cliente
   - `POST /register/` — Registro cliente
   - `POST /contacto` — Formulario de contacto
   - `POST /api/chat` — Chatbot
   - `GET /inventario_maestro/` — Catálogo de productos
   - `GET /pedidos/por_cliente/{rif}` — Pedidos del cliente
   - `POST /reclamos/cliente` — Crear reclamo
   - `GET /reclamos/cliente/{rif}` — Listar reclamos del cliente

4. **Formato de respuestas:**
   - Login: `{ "access_token": "...", "rif": "...", "role": "client", ... }`
   - Errores: usar `detail` (string o lista) para mensajes
   - IDs de MongoDB: devolver `_id` como string

5. **Al añadir o cambiar rutas:** Actualizar `BACKEND-ESTADO-PARA-FRONTEND.md` y avisar que el frontend puede necesitar adaptarse.

## Referencia rápida

- Documento de API del backend: `Zas-backend-main/BACKEND-ESTADO-PARA-FRONTEND.md`
- Documento resumido en el frontend: `Frontend virgen del carmen/docs/BACKEND-API.md`
- URL del backend (ejemplo): `https://droclven-back.onrender.com`
