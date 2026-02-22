import { useState, useEffect } from 'react'
import { apiGetPublic } from '../config/api'
import Header from '../components/Header'
import { Precio } from '../components/Precio'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function CatalogoPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGetPublic('catalogo/')
        setProductos(data?.productos || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar el catálogo')
        setProductos([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const filtrados = productos.filter((p) => {
    const texto = [p.codigo, p.descripcion, p.nombre, p.marca].filter(Boolean).join(' ').toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  return (
    <>
      <Header />
      <Nav />
      <main className="catalogo-page">
        <div className="container">
          <h1 className="section-title">Catálogo de productos</h1>
          <div className="catalogo-toolbar">
            <input
              type="search"
              placeholder="Buscar por código, descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="catalogo-search"
            />
          </div>

          {loading && <p className="catalogo-loading">Cargando catálogo...</p>}
          {error && <p className="auth-error">{error}</p>}

          {!loading && !error && (
            <div className="catalogo-grid">
              {filtrados.length === 0 ? (
                <p className="catalogo-empty">No hay productos para mostrar.</p>
              ) : (
                filtrados.map((p) => {
                  const tieneDescuento = (p.descuento || 0) > 0
                  const precioFinal = p.precio_con_descuento ?? p.precio
                  return (
                    <article key={p._id || p.codigo || p.id} className="producto-card">
                      <div className="producto-info">
                        <span className="producto-codigo">{p.codigo || p._id}</span>
                        <h3 className="producto-nombre">{p.descripcion || p.nombre || 'Sin nombre'}</h3>
                        {p.marca && <span className="producto-lab">{p.marca}</span>}
                        <p className="producto-precio">
                          {tieneDescuento ? (
                            <><span className="tachado"><Precio value={p.precio} /></span> <Precio value={precioFinal} /> ({p.descuento}% off)</>
                          ) : (
                            <Precio value={precioFinal} />
                          )}
                        </p>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
