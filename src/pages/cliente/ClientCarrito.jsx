import { useState } from 'react'

export default function ClientCarrito() {
  const [carrito] = useState([])
  return (
    <div className="client-page">
      <h1>Mi carrito</h1>
      {carrito.length === 0 ? (
        <p className="client-empty">Su carrito está vacío. Agregue productos desde el catálogo.</p>
      ) : (
        <p>Carrito con {carrito.length} producto(s).</p>
      )}
    </div>
  )
}
