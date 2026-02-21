import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, getToken, getRif } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function ClientPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const token = getToken()
  const rif = getRif()

  useEffect(() => {
    if (!rif || !token) return
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet(`pedidos/por_cliente/${rif}`, token)
        setPedidos(Array.isArray(data) ? data : data?.pedidos || data?.items || data?.data || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar')
        setPedidos([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [rif, token])

  return (
    <div className="client-page">
      <h1>Mis pedidos</h1>
      {loading && <p className="client-loading">Cargando...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && pedidos.length === 0 && (
        <p className="client-empty">No tiene pedidos. <Link to="/cliente/catalogo">Ir al catálogo</Link></p>
      )}
      {!loading && !error && pedidos.length > 0 && (
        <table className="client-table">
          <thead>
            <tr><th>Pedido</th><th>Fecha</th><th>Estado</th><th>Total</th></tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p._id || p.id}>
                <td>#{String(p._id || p.id).slice(-8)}</td>
                <td>{p.fecha || p.createdAt || '—'}</td>
                <td>{p.estado || p.status || '—'}</td>
                <td><Precio value={p.total} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
