import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'

export default function AdminPacking() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet('pedidos/por_estado/packing', getAdminToken())
      setPedidos(Array.isArray(data) ? data : data?.pedidos || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return (
    <div className="admin-page">
      <h1>Packing</h1>
      {loading && <p className="catalogo-loading">Cargando...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="admin-table-wrap">
          {pedidos.length === 0 ? (
            <p className="catalogo-empty">No hay pedidos en packing.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente / RIF</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p._id || p.id}>
                    <td>{String(p._id || p.id).slice(-8)}</td>
                    <td>{p.cliente || p.rif || '—'}</td>
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
