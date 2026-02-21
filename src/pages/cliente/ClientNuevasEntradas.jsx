import { useState, useEffect } from 'react'
import { apiGet } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function ClientNuevasEntradas() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      try {
        const data = await apiGet('inventario_maestro/')
        const lista = Array.isArray(data) ? data : data?.items || data?.productos || data?.data || []
        setProductos(lista.slice(0, 20))
      } catch { setProductos([]) }
      finally { setLoading(false) }
    }
    cargar()
  }, [])

  return (
    <div className="client-page">
      <h1>Nuevas entradas</h1>
      <p className="client-welcome">Productos recientes en inventario.</p>
      {loading && <p className="client-loading">Cargando...</p>}
      {!loading && productos.length === 0 && <p className="client-empty">No hay productos nuevos.</p>}
      {!loading && productos.length > 0 && (
        <div className="client-catalogo-grid">
          {productos.map((p) => (
            <article key={p._id || p.codigo || p.id} className="client-producto-card">
              <span className="client-producto-codigo">{p.codigo || p._id}</span>
              <h3>{p.descripcion || p.nombre || 'Sin nombre'}</h3>
              <p className="client-producto-precio"><Precio value={p.precio} /></p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
