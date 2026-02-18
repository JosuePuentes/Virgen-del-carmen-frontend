import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function AdminVentas() {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('punto-venta/ventas', getAdminToken())
        setVentas(Array.isArray(data) ? data : data?.ventas || data?.items || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar las ventas')
        setVentas([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  return (
    <div className="admin-page">
      <h1>Punto de venta</h1>
      {loading && <p className="catalogo-loading">Cargando ventas...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="admin-table-wrap">
          {ventas.length === 0 ? (
            <p className="catalogo-empty">No hay ventas registradas.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Método pago</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v._id || v.id}>
                    <td>{String(v._id || v.id).slice(-8)}</td>
                    <td>{v.cliente_nombre || v.cliente_rif || '—'}</td>
                    <td><Precio value={v.total} /></td>
                    <td>{v.metodo_pago || '—'}</td>
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
