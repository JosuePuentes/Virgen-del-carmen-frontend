# Instrucciones Backend: Descuentos en clientes

Al crear o editar un cliente desde el admin, el frontend envía:

- **descuento_comercial** — Porcentaje (0-100) que se aplica al precio en el catálogo del cliente
- **descuento_pronto_pago** — Porcentaje adicional por pronto pago

El catálogo del área cliente muestra: precio_final = precio × (1 - descuento_comercial/100).

El backend debe:
1. Aceptar `descuento_comercial` y `descuento_pronto_pago` en POST/PATCH de clientes
2. Devolverlos en GET /clientes/{rif} para que el frontend aplique el descuento en el catálogo
