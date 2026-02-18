import { useState, useEffect } from 'react'
import { apiGet, apiPut, getAdminToken, getAdminUser } from '../../config/api'

export default function AdminPedidosAdministracion() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionando, setAccionando] = useState(null)

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet('pedidos/administracion/', getAdminToken())
      setPedidos(Array.isArray(data) ? data : data?.pedidos || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  async function validarPedido(pedidoId) {
    setAccionando(pedidoId)
    try {
      await apiPut(`pedidos/actualizar_estado/${pedidoId}`, {
        nuevo_estado: 'picking',
        verificaciones: {},
        usuario: getAdminUser()?.usuario || 'admin',
      }, getAdminToken())
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al validar')
    } finally {
      setAccionando(null)
    }
  }

  return (
    <div className="admin-page">
      <h1>Pedidos – Administración</h1>
      {loading && <p className="catalogo-loading">Cargando...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="admin-table-wrap">
          {pedidos.length === 0 ? (
            <p className="catalogo-empty">No hay pedidos pendientes de validar.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente / RIF</th>
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p._id || p.id}>
                    <td>{String(p._id || p.id).slice(-8)}</td>
                    <td>{p.cliente || p.rif || '—'}</td>
                    <td>Bs. {typeof p.total === 'number' ? p.total.toFixed(2) : p.total || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-aprobar"
                        onClick={() => validarPedido(p._id || p.id)}
                        disabled={accionando === (p._id || p.id)}
                      >
                        {accionando === (p._id || p.id) ? '…' : 'Validar / Enviar a picking'}
                      </button>
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
