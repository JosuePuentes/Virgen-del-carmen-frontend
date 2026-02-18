import { useState, useEffect } from 'react'
import { apiGet, apiPut, apiPost, getAdminToken } from '../../config/api'
import { Link } from 'react-router-dom'

export default function AdminOrdenesCompra() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet('ordenes-compra/', getAdminToken())
      setOrdenes(Array.isArray(data) ? data : data?.ordenes || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
      setOrdenes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  async function totalizarOrden(orden) {
    if (!confirm('¿Totalizar esta orden? Se sumarán las cantidades al inventario.')) return
    try {
      await apiPost(`ordenes-compra/${orden._id || orden.id}/totalizar`, {}, getAdminToken())
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al totalizar')
    }
  }

  return (
    <div className="admin-page">
      <h1>Órdenes de compra</h1>
      <p className="admin-welcome">Ver órdenes, editar o totalizar. Al totalizar se suman las cantidades al inventario.</p>
      {error && <p className="auth-error">{error}</p>}

      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <div className="admin-table-wrap">
          {ordenes.length === 0 ? (
            <p className="catalogo-empty">No hay órdenes de compra.</p>
          ) : (
            <table className="admin-table admin-table-wide">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Proveedor</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o._id || o.id}>
                    <td>{String(o._id || o.id).slice(-8)}</td>
                    <td>{o.proveedor_empresa || o.proveedor?.empresa || o.proveedor_rif || '—'}</td>
                    <td>Bs. {typeof o.total === 'number' ? o.total.toFixed(2) : o.total ?? '—'}</td>
                    <td>{o.totalizada || o.estado === 'totalizada' ? 'Totalizada' : 'Pendiente'}</td>
                    <td>{o.fecha ? o.fecha.slice(0, 10) : '—'}</td>
                    <td>
                      <Link to={`/admin/ordenes-compra/${o._id || o.id}`} className="btn-aprobar btn-sm">Editar</Link>
                      {!o.totalizada && o.estado !== 'totalizada' && (
                        <button type="button" className="btn-hero btn-sm" onClick={() => totalizarOrden(o)}>Totalizar</button>
                      )}
                    </td>
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
