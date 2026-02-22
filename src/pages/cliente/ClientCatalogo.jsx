import { useState, useEffect } from 'react'
import { apiGet, getToken } from '../../config/api'
import { Precio } from '../../components/Precio'

function getFotoUrl(p) {
  return p.foto_url || p.foto || null
}

export default function ClientCatalogo() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const token = getToken()

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

  return (
    <div className="client-page">
      <h1>Catálogo de productos</h1>
      <div className="client-toolbar">
        <input type="search" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="client-search" />
      </div>
      {loading && <p className="client-loading">Cargando...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="client-catalogo-grid client-catalogo-con-foto">
          {filtrados.length === 0 ? (
            <p className="client-empty">No hay productos.</p>
          ) : (
            filtrados.map((p) => {
              const fotoUrl = getFotoUrl(p)
              const tieneDescuento = (p.descuento || 0) > 0
              const precioFinal = p.precio_con_descuento ?? p.precio
              const existencia = p.existencia ?? 0
              return (
                <article key={p._id || p.codigo || p.id} className="client-producto-card">
                  <div className="client-producto-foto">
                    {fotoUrl ? <img src={fotoUrl} alt="" onError={(e) => { e.target.style.display = 'none' }} /> : null}
                  </div>
                  <span className="client-producto-codigo">{p.codigo || p._id}</span>
                  <h3>{p.descripcion || p.nombre || 'Sin nombre'}</h3>
                  {p.marca && <span className="client-producto-lab">{p.marca}</span>}
                  <span className={`client-producto-existencia ${existencia > 0 ? 'disponible' : 'agotado'}`}>
                    {existencia > 0 ? 'Disponible' : 'Agotado'}
                  </span>
                  <div className="client-producto-precios">
                    {tieneDescuento && (
                      <span className="client-producto-precio-base tachado"><Precio value={p.precio} /></span>
                    )}
                    {tieneDescuento && (
                      <span className="client-producto-descuento">{p.descuento}% off</span>
                    )}
                    <p className={`client-producto-precio client-producto-precio-grande ${tieneDescuento ? 'destacado' : ''}`}>
                      <Precio value={precioFinal} />
                    </p>
                  </div>
                </article>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
