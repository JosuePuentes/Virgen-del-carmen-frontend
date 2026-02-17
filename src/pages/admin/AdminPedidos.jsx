import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('obtener_pedidos/', getAdminToken())
        setPedidos(Array.isArray(data) ? data : data?.pedidos || data?.items || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar los pedidos')
        setPedidos([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  return (
    <div className="admin-page">
      <h1>Pedidos</h1>
      {loading && <p className="catalogo-loading">Cargando pedidos...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="admin-table-wrap">
          {pedidos.length === 0 ? (
            <p className="catalogo-empty">No hay pedidos.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente / RIF</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p._id || p.id}>
                    <td>{String(p._id || p.id).slice(-8)}</td>
                    <td>{p.cliente || p.rif || '—'}</td>
                    <td><span className={`pedido-estado estado-${(p.estado || 'nuevo').toLowerCase().replace(' ', '_')}`}>{p.estado || 'nuevo'}</span></td>
                    <td>Bs. {typeof p.total === 'number' ? p.total.toFixed(2) : p.total || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
