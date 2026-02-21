import { useState, useEffect } from 'react'
import { apiGet } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function ClientCatalogo() {
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
        setProductos(Array.isArray(data) ? data : data?.items || data?.productos || data?.data || [])
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
    const texto = [p.codigo, p.descripcion, p.nombre, p.laboratorio, p.marca].filter(Boolean).join(' ').toLowerCase()
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
        <div className="client-catalogo-grid">
          {filtrados.length === 0 ? <p className="client-empty">No hay productos.</p> : filtrados.map((p) => (
            <article key={p._id || p.codigo || p.id} className="client-producto-card">
              <span className="client-producto-codigo">{p.codigo || p._id}</span>
              <h3>{p.descripcion || p.nombre || 'Sin nombre'}</h3>
              {(p.laboratorio || p.marca) && <span className="client-producto-lab">{p.laboratorio || p.marca}</span>}
              <p className="client-producto-precio"><Precio value={p.precio} /></p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
