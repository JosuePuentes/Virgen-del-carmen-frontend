# Instrucciones Backend: Endpoints BCV (Tasa del dólar)

El frontend Virgen del Carmen usa **dólares ($)** como moneda principal. La tasa BCV se usa solo para mostrar el equivalente en bolívares (Bs = $ × BCV) como referencia.

---

## Endpoints requeridos

### 1. GET /bcv/

Obtiene la tasa actual del dólar BCV.

- **Auth:** Opcional (puede ser público para que el catálogo y clientes vean precios en $ y Bs)
- **Respuesta:** `{ "tasa": 36.50 }` o `{ "rate": 36.50 }`
- El frontend acepta `tasa`, `rate` o `valor` como clave

**Ejemplo:**
```json
{ "tasa": 36.50 }
```

---

### 2. PUT /bcv/

Actualiza la tasa BCV.

- **Auth:** Requerido (token admin)
- **Body:** `{ "tasa": 36.50 }` (número, obligatorio)
- **Respuesta:** Cualquier JSON de éxito (ej: `{ "ok": true }` o `{ "tasa": 36.50 }`)

**Ejemplo request:**
```json
PUT /bcv/
Content-Type: application/json
Authorization: Bearer <admin_token>

{ "tasa": 37.00 }
```

---

## Notas

- Los valores en BD (inventario, finanzas, cuentas por cobrar/pagar, etc.) deben estar en **USD ($)**.
- La tasa BCV solo se usa para mostrar el equivalente en Bs en la UI.
- El frontend guarda la tasa en `localStorage` como respaldo si el backend no responde.
