import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'

export default function AdminCuentasPorCobrar() {
  const [facturasVigentes, setFacturasVigentes] = useState([])
  const [facturasVencidas, setFacturasVencidas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const [vigentes, vencidas] = await Promise.all([
          apiGet('cuentas-por-cobrar/vigentes', getAdminToken()).catch(() => []),
          apiGet('cuentas-por-cobrar/vencidas', getAdminToken()).catch(() => []),
        ])
        setFacturasVigentes(Array.isArray(vigentes) ? vigentes : vigentes?.facturas || vigentes?.items || [])
        setFacturasVencidas(Array.isArray(vencidas) ? vencidas : vencidas?.facturas || vencidas?.items || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  return (
    <div className="admin-page">
      <h1>Cuentas por cobrar</h1>
      <p className="admin-welcome">Facturas emitidas a clientes con días de crédito restantes y facturas vencidas.</p>
      {error && <p className="auth-error">{error}</p>}

      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <>
          <section className="admin-section">
            <h2>Facturas vigentes (con días de crédito)</h2>
            <div className="admin-table-wrap">
              {facturasVigentes.length === 0 ? (
                <p className="catalogo-empty">No hay facturas vigentes.</p>
              ) : (
                <table className="admin-table admin-table-wide">
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>Cliente</th>
                      <th>RIF</th>
                      <th>Monto</th>
                      <th>Fecha emisión</th>
                      <th>Días crédito restantes</th>
                      <th>Vence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasVigentes.map((f) => (
                      <tr key={f._id || f.id}>
                        <td>{f.numero || f._id || '—'}</td>
                        <td>{f.cliente || f.empresa || '—'}</td>
                        <td>{f.rif || '—'}</td>
                        <td>Bs. {typeof f.monto === 'number' ? f.monto.toFixed(2) : f.total ?? '—'}</td>
                        <td>{f.fecha_emision ? f.fecha_emision.slice(0, 10) : '—'}</td>
                        <td className="dias-ok">{f.dias_restantes ?? f.dias_credito_restantes ?? '—'}</td>
                        <td>{f.fecha_vencimiento ? f.fecha_vencimiento.slice(0, 10) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="admin-section">
            <h2>Facturas vencidas</h2>
            <div className="admin-table-wrap">
              {facturasVencidas.length === 0 ? (
                <p className="catalogo-empty">No hay facturas vencidas.</p>
              ) : (
                <table className="admin-table admin-table-wide">
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>Cliente</th>
                      <th>RIF</th>
                      <th>Monto</th>
                      <th>Fecha vencimiento</th>
                      <th>Días vencidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasVencidas.map((f) => (
                      <tr key={f._id || f.id} className="fila-vencida">
                        <td>{f.numero || f._id || '—'}</td>
                        <td>{f.cliente || f.empresa || '—'}</td>
                        <td>{f.rif || '—'}</td>
                        <td>Bs. {typeof f.monto === 'number' ? f.monto.toFixed(2) : f.total ?? '—'}</td>
                        <td>{f.fecha_vencimiento ? f.fecha_vencimiento.slice(0, 10) : '—'}</td>
                        <td className="dias-vencido">{f.dias_vencidos ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
