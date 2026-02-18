import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function AdminFacturasFinalizadas() {
  const [topClientes, setTopClientes] = useState([])
  const [clientesPocoFrecuentes, setClientesPocoFrecuentes] = useState([])
  const [facturasPagadas, setFacturasPagadas] = useState([])
  const [totalPagado, setTotalPagado] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const top = await apiGet('facturas/top-clientes', getAdminToken()).catch(() => [])
        const poco = await apiGet('facturas/clientes-poco-frecuentes', getAdminToken()).catch(() => [])
        const pagadas = await apiGet('facturas/pagadas', getAdminToken()).catch(() => [])
        setTopClientes(Array.isArray(top) ? top : top?.clientes || top?.items || [])
        setClientesPocoFrecuentes(Array.isArray(poco) ? poco : poco?.clientes || poco?.items || [])
        const lista = Array.isArray(pagadas) ? pagadas : pagadas?.facturas || pagadas?.items || []
        setFacturasPagadas(lista)
        setTotalPagado(lista.reduce((s, f) => s + (Number(f.monto) || Number(f.total) || 0), 0))
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
      <h1>Facturas finalizadas</h1>
      <p className="admin-welcome">Top 10 mejores clientes, clientes poco frecuentes y facturas pagadas.</p>
      {error && <p className="auth-error">{error}</p>}
      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <>
          <section className="admin-section">
            <h2>Top 10 mejores clientes</h2>
            <div className="admin-table-wrap">
              {topClientes.length === 0 ? <p className="catalogo-empty">Sin datos</p> : (
                <table className="admin-table">
                  <thead><tr><th>Cliente</th><th>RIF</th><th>Total comprado</th><th>Pedidos</th></tr></thead>
                  <tbody>
                    {topClientes.slice(0, 10).map((c, i) => (
                      <tr key={c.rif || c._id || i}>
                        <td>{c.cliente || c.empresa || c.encargado || '—'}</td>
                        <td>{c.rif || '—'}</td>
                        <td><Precio value={c.total} /></td>
                        <td>{c.cantidad_pedidos ?? c.pedidos ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          <section className="admin-section">
            <h2>Clientes poco frecuentes</h2>
            <div className="admin-table-wrap">
              {clientesPocoFrecuentes.length === 0 ? <p className="catalogo-empty">Sin datos</p> : (
                <table className="admin-table">
                  <thead><tr><th>Cliente</th><th>RIF</th><th>Último pedido</th><th>Días sin comprar</th></tr></thead>
                  <tbody>
                    {clientesPocoFrecuentes.map((c, i) => (
                      <tr key={c.rif || c._id || i}>
                        <td>{c.cliente || c.empresa || c.encargado || '—'}</td>
                        <td>{c.rif || '—'}</td>
                        <td>{c.ultimo_pedido ? c.ultimo_pedido.slice(0, 10) : '—'}</td>
                        <td>{c.dias_sin_comprar ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          <section className="admin-section">
            <h2>Facturas pagadas</h2>
            <p className="admin-total">Total pagado: <strong><Precio value={totalPagado} /></strong></p>
            <div className="admin-table-wrap">
              {facturasPagadas.length === 0 ? <p className="catalogo-empty">No hay facturas pagadas.</p> : (
                <table className="admin-table admin-table-wide">
                  <thead><tr><th>Factura</th><th>Cliente</th><th>RIF</th><th>Monto</th><th>Fecha pago</th></tr></thead>
                  <tbody>
                    {facturasPagadas.map((f) => (
                      <tr key={f._id || f.id}>
                        <td>{f.numero || f._id || '—'}</td>
                        <td>{f.cliente || f.empresa || '—'}</td>
                        <td>{f.rif || '—'}</td>
                        <td><Precio value={f.monto ?? f.total} /></td>
                        <td>{f.fecha_pago ? f.fecha_pago.slice(0, 10) : '—'}</td>
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
