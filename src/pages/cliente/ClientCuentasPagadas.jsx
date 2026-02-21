import { useState, useEffect } from 'react'
import { apiGet, getToken, getRif } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function ClientCuentasPagadas() {
  const [facturas, setFacturas] = useState([])
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
        const data = await apiGet(`facturas/pagadas/cliente/${rif}`, token)
        setFacturas(Array.isArray(data) ? data : data?.facturas || data?.items || data?.data || [])
      } catch {
        setFacturas([])
        setError('No se pudo cargar. El endpoint puede no estar disponible aún.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [rif, token])

  return (
    <div className="client-page">
      <h1>Mis cuentas pagadas</h1>
      {loading && <p className="client-loading">Cargando...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        facturas.length === 0 ? (
          <p className="client-empty">No hay facturas pagadas para mostrar.</p>
        ) : (
          <table className="client-table">
            <thead>
              <tr>
                <th>Factura</th>
                <th>Fecha pago</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f._id || f.numero || f.id}>
                  <td>{f.numero || f.factura || f._id}</td>
                  <td>{f.fecha_pago || f.fecha || '—'}</td>
                  <td><Precio value={f.monto || f.total} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  )
}
