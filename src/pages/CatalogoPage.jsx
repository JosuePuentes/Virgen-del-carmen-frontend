import { useState, useEffect } from 'react'
import { apiGet } from '../config/api'
import Header from '../components/Header'
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
        const data = await apiGet('inventario_maestro/')
        setProductos(Array.isArray(data) ? data : data?.items || data?.productos || [])
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
    const texto = [p.codigo, p.descripcion, p.nombre, p.laboratorio].filter(Boolean).join(' ').toLowerCase()
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
                filtrados.map((p) => (
                  <article key={p._id || p.codigo || p.id} className="producto-card">
                    <div className="producto-info">
                      <span className="producto-codigo">{p.codigo || p._id}</span>
                      <h3 className="producto-nombre">{p.descripcion || p.nombre || 'Sin nombre'}</h3>
                      {p.laboratorio && <span className="producto-lab">{p.laboratorio}</span>}
                      <p className="producto-precio">
                        {typeof p.precio === 'number' ? `Bs. ${p.precio.toFixed(2)}` : p.precio || '—'}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
