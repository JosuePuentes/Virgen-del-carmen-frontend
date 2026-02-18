import { useState, useEffect } from 'react'
import { apiGet, apiPut, apiPost, getAdminToken, getAdminUser } from '../../config/api'

export default function AdminPedidosAdministracion() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionando, setAccionando] = useState(null)
  const [pedidoConPin, setPedidoConPin] = useState(null)
  const [pin, setPin] = useState('')

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

  async function validarPedido(p, requierePin = false) {
    if (requierePin && !pin.trim()) {
      setPedidoConPin(p)
      return
    }
    setAccionando(p._id || p.id)
    try {
      if (requierePin && pin) {
        await apiPost(`pedidos/${p._id || p.id}/validar`, { pin }, getAdminToken())
      } else {
        await apiPut(`pedidos/actualizar_estado/${p._id || p.id}`, {
          nuevo_estado: 'picking',
          verificaciones: {},
          usuario: getAdminUser()?.usuario || 'admin',
        }, getAdminToken())
      }
      setPedidoConPin(null)
      setPin('')
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al validar')
    } finally {
      setAccionando(null)
    }
  }

  return (
    <div className="admin-page">
      <h1>Pedidos – Validación</h1>
      <p className="admin-welcome">Pedidos nuevos de clientes. Validar para enviar a picking. Si el cliente tiene facturas vencidas, se requiere PIN.</p>
      {loading && <p className="catalogo-loading">Cargando...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="admin-table-wrap">
          {pedidos.length === 0 ? (
            <p className="catalogo-empty">No hay pedidos pendientes de validar.</p>
          ) : (
            <table className="admin-table admin-table-wide">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Límite crédito</th>
                  <th>Límite consumido</th>
                  <th>Facturas vencidas</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => {
                  const tieneFacturasVencidas = p.tiene_facturas_vencidas ?? false
                  const esConPin = pedidoConPin?._id === p._id || pedidoConPin?.id === p.id
                  return (
                    <tr key={p._id || p.id}>
                      <td>{String(p._id || p.id).slice(-8)}</td>
                      <td>{p.cliente || p.rif || '—'}</td>
                      <td>Bs. {typeof p.total === 'number' ? p.total.toFixed(2) : p.total || '—'}</td>
                      <td>Bs. {p.limite_credito ?? '—'}</td>
                      <td>Bs. {p.limite_consumido ?? '—'}</td>
                      <td>{tieneFacturasVencidas ? 'Sí' : 'No'}</td>
                      <td>
                        {esConPin ? (
                          <div className="admin-pin-row">
                            <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="admin-pin-input" />
                            <button type="button" className="btn-aprobar" onClick={() => validarPedido(p, true)} disabled={!pin.trim() || !!accionando}>Validar</button>
                            <button type="button" className="btn-secondary" onClick={() => { setPedidoConPin(null); setPin('') }}>Cancelar</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-aprobar"
                            onClick={() => tieneFacturasVencidas ? setPedidoConPin(p) : validarPedido(p, false)}
                            disabled={!!accionando}
                          >
                            {accionando === (p._id || p.id) ? '…' : tieneFacturasVencidas ? 'Validar (requiere PIN)' : 'Validar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
