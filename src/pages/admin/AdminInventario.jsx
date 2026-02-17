import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'

export default function AdminInventario() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('inventario_maestro/', getAdminToken())
        setProductos(Array.isArray(data) ? data : data?.items || data?.productos || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar el inventario')
        setProductos([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  return (
    <div className="admin-page">
      <h1>Inventario</h1>
      {loading && <p className="catalogo-loading">Cargando inventario...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="admin-table-wrap">
          {productos.length === 0 ? (
            <p className="catalogo-empty">No hay productos.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Laboratorio</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {productos.slice(0, 50).map((p) => (
                  <tr key={p._id || p.codigo}>
                    <td>{p.codigo || p._id}</td>
                    <td>{p.descripcion || p.nombre || '—'}</td>
                    <td>{p.laboratorio || '—'}</td>
                    <td>Bs. {typeof p.precio === 'number' ? p.precio.toFixed(2) : p.precio || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {productos.length > 50 && <p className="admin-more">Mostrando 50 de {productos.length} productos</p>}
        </div>
      )}
    </div>
  )
}
