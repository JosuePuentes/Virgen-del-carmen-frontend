# Instrucciones Frontend: Módulo "Mi cuenta" en el área cliente

Este documento describe cómo implementar el módulo **Mi cuenta** (o **Datos del cliente** / **Perfil**) en el área cliente del frontend.

---

## 1. Contexto

Cuando el usuario inicia sesión como **cliente** (`role === "client"`), debe ver en el menú una opción **"Mi cuenta"** para ver y editar sus propios datos. Esta opción **no depende de módulos** (el array `modulos` solo viene en el login admin).

---

## 2. Login cliente: guardar RIF

Tras el login cliente (`POST /login/`), el backend devuelve:

```json
{
  "access_token": "...",
  "rif": "J-12345678-9",
  "role": "client"
}
```

**Acción:** Guardar el `rif` además del `access_token` (por ejemplo en `localStorage` o estado global). El frontend ya tiene `setRif()` en `src/config/api.js`; asegurarse de que se llame al hacer login cliente.

---

## 3. Menú del área cliente

En el menú de navegación cuando el usuario está logueado como cliente, incluir **siempre**:

- Catálogo
- Mis pedidos
- Reclamos
- **Mi cuenta** (o "Datos del cliente" / "Perfil")
- Cerrar sesión

La opción "Mi cuenta" no depende de ningún array de módulos; es fija para todos los clientes.

---

## 4. Pantalla "Mi cuenta"

### 4.1 Ver datos

Al cargar la pantalla, llamar a:

- **GET** `/clientes/{rif}`

Usar el `rif` guardado en la sesión (el del usuario logueado). La respuesta contiene los datos del cliente (empresa, encargado, direccion, telefono, email, etc.).

Mostrar los datos en un formulario de solo lectura o editable según el diseño.

### 4.2 Actualizar datos

Al guardar cambios, llamar a:

- **PATCH** `/clientes/{rif}`

**Body:** Solo los campos editados (parcial). Ejemplo:

```json
{
  "encargado": "Juan Pérez",
  "direccion": "Calle X, Edificio Y",
  "telefono": "04141234567",
  "email": "nuevo@correo.com"
}
```

Para cambiar contraseña, incluir `password` en el body (el backend validará según su lógica).

**Headers:** `Authorization: Bearer <access_token>` (token del cliente).

---

## 5. Rutas

| Método | Ruta | Descripción |
|--------|------|-------------|
| **GET** | `/clientes/{rif}` | Obtener datos del cliente (usar rif de la sesión) |
| **PATCH** | `/clientes/{rif}` | Actualizar datos del cliente (body parcial) |

---

## 6. Texto para copiar/pegar (IA del frontend)

> Módulo "Mi cuenta" en el área cliente
>
> Cuando el usuario inicia sesión como cliente (role: "client"), debe ver en el menú una opción "Mi cuenta" (o "Datos del cliente" / "Perfil") para ver y editar sus propios datos. No debe depender de módulos (ese array solo viene en el login admin).
>
> - Guardar el rif que devuelve POST /login/.
> - Pantalla "Mi cuenta": al cargar, llamar a GET /clientes/{rif} (con el rif del usuario) y mostrar los datos en un formulario.
> - Al guardar cambios: PATCH /clientes/{rif} con el body solo con los campos editados (ej. encargado, direccion, telefono, email).
>
> Detalle completo: `docs/INSTRUCCIONES-FRONTEND-MODULO-CLIENTE-AREA-CLIENTE.md`
