import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function AdminCuentasPorPagar() {
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('cuentas-por-pagar/', getAdminToken())
        setCuentas(Array.isArray(data) ? data : data?.cuentas || data?.items || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar')
        setCuentas([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const total = cuentas.reduce((s, c) => s + (Number(c.monto) || Number(c.total) || 0), 0)

  return (
    <div className="admin-page">
      <h1>Cuentas por pagar</h1>
      <p className="admin-welcome">Facturas y obligaciones con proveedores pendientes de pago.</p>
      {error && <p className="auth-error">{error}</p>}

      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <>
          <p className="admin-total">Total por pagar: <strong><Precio value={total} /></strong></p>
          <div className="admin-table-wrap">
            {cuentas.length === 0 ? (
              <p className="catalogo-empty">No hay cuentas por pagar.</p>
            ) : (
              <table className="admin-table admin-table-wide">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>RIF</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Vence</th>
                    <th>Días crédito</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentas.map((c) => (
                    <tr key={c._id || c.id}>
                      <td>{c.proveedor_empresa || c.proveedor?.empresa || '—'}</td>
                      <td>{c.proveedor_rif || c.rif || '—'}</td>
                      <td>{c.concepto || c.descripcion || '—'}</td>
                      <td><Precio value={c.monto ?? c.total} /></td>
                      <td>{c.fecha_vencimiento ? c.fecha_vencimiento.slice(0, 10) : '—'}</td>
                      <td>{c.dias_credito ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
