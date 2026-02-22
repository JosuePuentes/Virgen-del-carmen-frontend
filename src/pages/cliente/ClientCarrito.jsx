import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPost, getToken, getRif } from '../../config/api'
import { Precio } from '../../components/Precio'
import { useCart } from '../../context/CartContext'

export default function ClientCarrito() {
  const { carrito, removeFromCart, updateCantidad, clearCart, total } = useCart()
  const [cliente, setCliente] = useState(null)
  const [observacion, setObservacion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const token = getToken()
  const rif = getRif()

  useEffect(() => {
    if (!rif || !token) return
    async function cargar() {
      try {
        const data = await apiGet(`clientes/${rif}`, token)
        setCliente(data)
      } catch {
        setCliente(null)
      }
    }
    cargar()
  }, [rif, token])

  const subtotal = total

  async function handleEnviarPedido(e) {
    e.preventDefault()
    if (carrito.length === 0) {
      setError('Agregue al menos un producto al carrito')
      return
    }
    if (!rif) {
      setError('No se encontró el RIF del cliente')
      return
    }
    setError('')
    setLoading(true)
    try {
      const productosPayload = carrito.map((i) => {
        const p = i.producto
        const precio = p.precio_con_descuento ?? p.precio ?? 0
        return {
          codigo: p.codigo || p._id,
          descripcion: p.descripcion || p.nombre || 'Sin nombre',
          precio,
          cantidad_pedida: i.cantidad,
          descuento1: 0,
          descuento2: 0,
          descuento3: 0,
          descuento4: 0,
        }
      })
      await apiPost(
        'pedidos/',
        {
          rif,
          cliente: cliente?.empresa || cliente?.encargado || rif,
          observacion: observacion.trim() || undefined,
          total,
          subtotal,
          productos: productosPayload,
        },
        token
      )
      setEnviado(true)
      clearCart()
    } catch (err) {
      setError(err.message || 'Error al enviar el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div className="client-page">
        <h1>Pedido enviado</h1>
        <p className="client-success">Su pedido ha sido enviado correctamente. Puede ver el estado en Mis pedidos.</p>
        <Link to="/cliente/catalogo" className="client-btn client-btn-primary">Seguir comprando</Link>
      </div>
    )
  }

  return (
    <div className="client-page">
      <h1>Mi carrito</h1>
      {carrito.length === 0 ? (
        <>
          <p className="client-empty">Su carrito está vacío. Agregue productos desde el catálogo.</p>
          <Link to="/cliente/catalogo" className="client-btn client-btn-primary">Ir al catálogo</Link>
        </>
      ) : (
        <>
          <div className="client-carrito-lista">
            {carrito.map((item) => {
              const p = item.producto
              const precio = p.precio_con_descuento ?? p.precio ?? 0
              const subtotalItem = precio * item.cantidad
              const id = p._id || p.codigo
              return (
                <div key={id} className="client-carrito-item">
                  <div className="client-carrito-item-info">
                    <span className="client-carrito-codigo">{p.codigo || p._id}</span>
                    <h4>{p.descripcion || p.nombre || 'Sin nombre'}</h4>
                    <span className="client-carrito-precio-unit"><Precio value={precio} /> c/u</span>
                  </div>
                  <div className="client-carrito-item-cant">
                    <label>
                      Cant:
                      <input
                        type="number"
                        min={1}
                        value={item.cantidad}
                        onChange={(e) => updateCantidad(id, Math.max(1, Number(e.target.value) || 1))}
                      />
                    </label>
                  </div>
                  <div className="client-carrito-item-subtotal">
                    <Precio value={subtotalItem} />
                  </div>
                  <button
                    type="button"
                    className="client-carrito-quitar"
                    onClick={() => removeFromCart(id)}
                    title="Quitar"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>

          <div className="client-carrito-total">
            <strong>Total: <Precio value={total} /></strong>
          </div>

          <form onSubmit={handleEnviarPedido} className="client-carrito-form">
            <label>
              Observaciones (opcional):
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Notas para el pedido..."
                rows={2}
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="client-btn client-btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar mi pedido'}
            </button>
          </form>

          <Link to="/cliente/catalogo" className="client-btn client-btn-secondary">Seguir comprando</Link>
        </>
      )}
    </div>
  )
}
