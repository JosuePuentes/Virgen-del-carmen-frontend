import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, getToken } from '../../config/api'
import { Precio } from '../../components/Precio'
import { useCart } from '../../context/CartContext'

function getFotoUrl(p) {
  return p.foto_url || p.foto || null
}

export default function ClientCatalogo() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [modalProducto, setModalProducto] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const token = getToken()
  const { addToCart } = useCart()

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('catalogo/', token)
        setProductos(data?.productos || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar el catálogo')
        setProductos([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [token])

  const filtrados = productos.filter((p) => {
    const texto = [p.codigo, p.descripcion, p.nombre, p.marca].filter(Boolean).join(' ').toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  function abrirModal(p) {
    setModalProducto(p)
    setCantidad(1)
  }

  function cerrarModal() {
    setModalProducto(null)
    setCantidad(1)
  }

  function handleAgregar() {
    if (!modalProducto || cantidad < 1) return
    const max = modalProducto.existencia ?? 999
    const cant = Math.min(Math.max(1, Math.floor(cantidad)), max)
    addToCart(modalProducto, cant)
    cerrarModal()
  }

  return (
    <div className="client-page">
      <h1>Catálogo de productos</h1>
      <div className="client-toolbar">
        <input type="search" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="client-search" />
        <Link to="/cliente/carrito" className="client-btn client-btn-primary">Ver mi carrito</Link>
      </div>
      {loading && <p className="client-loading">Cargando...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="client-catalogo-tabla-wrap">
          {filtrados.length === 0 ? (
            <p className="client-empty">No hay productos.</p>
          ) : (
            <table className="client-catalogo-tabla">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Marca</th>
                  <th>Existencia</th>
                  <th>Precio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const fotoUrl = getFotoUrl(p)
                  const tieneDescuento = (p.descuento || 0) > 0
                  const precioFinal = p.precio_con_descuento ?? p.precio
                  const existencia = p.existencia ?? 0
                  const disponible = existencia > 0
                  return (
                    <tr key={p._id || p.codigo || p.id} className={!disponible ? 'agotado' : ''}>
                      <td>
                        <div className="client-catalogo-foto-mini">
                          {fotoUrl ? (
                            <img src={fotoUrl} alt="" onError={(e) => { e.target.style.display = 'none' }} />
                          ) : (
                            <span className="client-catalogo-sin-foto">—</span>
                          )}
                        </div>
                      </td>
                      <td className="client-catalogo-codigo">{p.codigo || p._id}</td>
                      <td className="client-catalogo-desc">{p.descripcion || p.nombre || 'Sin nombre'}</td>
                      <td className="client-catalogo-marca">{p.marca || '—'}</td>
                      <td>
                        <span className={`client-catalogo-existencia ${disponible ? 'disponible' : 'agotado'}`}>
                          {disponible ? 'Disponible' : 'Agotado'}
                        </span>
                      </td>
                      <td className="client-catalogo-precio">
                        {tieneDescuento && (
                          <span className="tachado"><Precio value={p.precio} /></span>
                        )}
                        {tieneDescuento && <span className="client-catalogo-descuento">{p.descuento}%</span>}
                        <span className={tieneDescuento ? 'destacado' : ''}><Precio value={precioFinal} /></span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="client-btn client-btn-sm client-btn-primary"
                          onClick={() => disponible && abrirModal(p)}
                          disabled={!disponible}
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modalProducto && (
        <div className="client-modal-overlay" onClick={cerrarModal}>
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar al carrito</h3>
            <p className="client-modal-producto">{modalProducto.descripcion || modalProducto.nombre}</p>
            <p className="client-modal-precio"><Precio value={modalProducto.precio_con_descuento ?? modalProducto.precio} /></p>
            <label>
              Cantidad:
              <input
                type="number"
                min={1}
                max={modalProducto.existencia ?? 999}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value) || 1)}
              />
            </label>
            <div className="client-modal-actions">
              <button type="button" className="client-btn client-btn-secondary" onClick={cerrarModal}>Cancelar</button>
              <button type="button" className="client-btn client-btn-primary" onClick={handleAgregar}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
