# Instrucciones Backend: Clientes (crear, editar, descuentos)

## Editar cliente (admin)

El módulo **Clientes** en el área admin tiene un botón **Editar** por cada cliente. Al guardar, el frontend llama:

- **PATCH** `/clientes/{rif}`

**Body (todos los campos editables):**

```json
{
  "empresa": "string",
  "encargado": "string",
  "direccion": "string",
  "telefono": "string",
  "email": "string",
  "password": "string (opcional, solo si se cambia)",
  "dias_credito": 0,
  "limite_credito": 0,
  "descuento_comercial": 0,
  "descuento_pronto_pago": 0
}
```

- **Autenticación:** Token admin en `Authorization: Bearer <token>`
- **RIF:** No se envía en el body (es el identificador en la URL). El backend no debe permitir cambiar el RIF.

---

## Descuentos

Al crear o editar un cliente desde el admin, el frontend envía:

- **descuento_comercial** — Porcentaje (0-100) que se aplica al precio en el catálogo del cliente
- **descuento_pronto_pago** — Porcentaje adicional por pronto pago

El catálogo del área cliente muestra: precio_final = precio × (1 - descuento_comercial/100).

El backend debe:
1. Aceptar `descuento_comercial` y `descuento_pronto_pago` en POST y PATCH de clientes
2. Devolverlos en GET /clientes/{rif} para que el frontend aplique el descuento en el catálogo
