import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([])

  const addToCart = useCallback((producto, cantidad) => {
    if (!cantidad || cantidad < 1) return
    setCarrito((prev) => {
      const idx = prev.findIndex((i) => (i.producto._id || i.producto.codigo) === (producto._id || producto.codigo))
      const nuevo = [...prev]
      if (idx >= 0) {
        nuevo[idx] = { ...nuevo[idx], cantidad: nuevo[idx].cantidad + cantidad }
      } else {
        nuevo.push({ producto, cantidad })
      }
      return nuevo
    })
  }, [])

  const removeFromCart = useCallback((productoId) => {
    setCarrito((prev) => prev.filter((i) => (i.producto._id || i.producto.codigo) !== productoId))
  }, [])

  const updateCantidad = useCallback((productoId, cantidad) => {
    if (cantidad < 1) return removeFromCart(productoId)
    setCarrito((prev) =>
      prev.map((i) =>
        (i.producto._id || i.producto.codigo) === productoId ? { ...i, cantidad } : i
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => setCarrito([]), [])

  const total = carrito.reduce((s, i) => {
    const precio = i.producto.precio_con_descuento ?? i.producto.precio ?? 0
    return s + precio * i.cantidad
  }, 0)

  return (
    <CartContext.Provider value={{ carrito, addToCart, removeFromCart, updateCantidad, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
