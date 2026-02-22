# Instrucciones Frontend: Catálogo en área cliente

## Endpoint

En el área cliente (catálogo para el cliente logueado) **y en el catálogo público** (ruta `/catalogo`):

- **No usar:** `GET /inventario_maestro/` (pide token admin → 401 sin token o con token de cliente)
- **Usar:** `GET /catalogo/`

Ejemplo: `GET https://droclven-back.onrender.com/catalogo/`

- **Catálogo público:** Sin header `Authorization`
- **Área cliente:** Con o sin `Authorization: Bearer <token_cliente>`

---

## Respuesta

```json
{
  "productos": [
    {
      "_id": "...",
      "codigo": "X001",
      "descripcion": "Nombre del producto",
      "marca": "Marca o laboratorio",
      "foto": "https://...",
      "foto_url": "https://...",
      "precio": 10.50,
      "descuento": 5,
      "precio_con_descuento": 9.98,
      "existencia": 100
    }
  ]
}
```

---

## Qué mostrar en cada producto

| Dato | Campo | Nota |
|------|-------|------|
| Foto | `foto` o `foto_url` | Si viene vacío, mostrar placeholder/cuadro en blanco |
| Código | `codigo` | |
| Descripción | `descripcion` | |
| Marca | `marca` | |
| Precio base | `precio` | Opcional: tachado cuando hay descuento |
| Descuento | `descuento` | En % (ej. 5 = 5%). Mostrar como "5% off" o similar |
| Precio final | `precio_con_descuento` | Precio a pagar; destacar cuando descuento > 0 |
| Stock | `existencia` | Mostrar "Disponible" / "Agotado" según corresponda |

No mostrar costo ni utilidad (no vienen en este endpoint).

---

## Texto para la IA del frontend

> Catálogo público y área cliente: Llamar a GET /catalogo/ (no a /inventario_maestro/). Catálogo público: sin Authorization. Área cliente: con o sin token. La respuesta es { "productos": [ ... ] }. Por producto: id, codigo, descripcion, marca, foto/foto_url, precio, descuento (%), precio_con_descuento, existencia. En la UI mostrar: foto (o placeholder si no hay), código, descripción, marca, precio, descuento y precio con descuento, y existencia. No mostrar costo.
>
> El detalle completo está en `docs/INSTRUCCIONES-FRONTEND-CATALOGO-CLIENTE.md`.
