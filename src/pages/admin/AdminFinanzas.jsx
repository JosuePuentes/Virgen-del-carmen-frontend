import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'

export default function AdminFinanzas() {
  const [resumen, setResumen] = useState(null)
  const [topMas, setTopMas] = useState([])
  const [topMenos, setTopMenos] = useState([])
  const [graficas, setGraficas] = useState([])
  const [gastos, setGastos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const r = await apiGet('finanzas/resumen', getAdminToken()).catch(() => ({}))
        const mas = await apiGet('finanzas/top-productos?tipo=mas', getAdminToken()).catch(() => [])
        const menos = await apiGet('finanzas/top-productos?tipo=menos', getAdminToken()).catch(() => [])
        const g = await apiGet('finanzas/graficas', getAdminToken()).catch(() => [])
        const gast = await apiGet('finanzas/gastos', getAdminToken()).catch(() => ({ total: 0 }))
        setResumen(r)
        setTopMas(Array.isArray(mas) ? mas : mas?.productos || mas?.items || [])
        setTopMenos(Array.isArray(menos) ? menos : menos?.productos || menos?.items || [])
        setGraficas(Array.isArray(g) ? g : g?.meses || g?.data || [])
        setGastos(typeof gast === 'number' ? gast : gast?.total ?? 0)
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
      <h1>Dashboard finanzas</h1>
      <p className="admin-welcome">Productos vendidos, valor vendido, utilidad, top 10, gráficas y gastos.</p>
      {error && <p className="auth-error">{error}</p>}
      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <>
          <div className="admin-cards finanzas-cards">
            <div className="admin-card">
              <h3>Productos vendidos</h3>
              <p className="admin-card-valor">{resumen?.productos_vendidos ?? resumen?.cantidad ?? '—'}</p>
            </div>
            <div className="admin-card">
              <h3>Valor vendido</h3>
              <p className="admin-card-valor">Bs. {typeof resumen?.valor_vendido === 'number' ? resumen.valor_vendido.toFixed(2) : resumen?.valor_vendido ?? '—'}</p>
            </div>
            <div className="admin-card">
              <h3>Utilidad</h3>
              <p className="admin-card-valor">Bs. {typeof resumen?.utilidad === 'number' ? resumen.utilidad.toFixed(2) : resumen?.utilidad ?? '—'}</p>
            </div>
            <div className="admin-card">
              <h3>Gastos</h3>
              <p className="admin-card-valor">Bs. {typeof gastos === 'number' ? gastos.toFixed(2) : gastos}</p>
            </div>
          </div>
          <section className="admin-section">
            <h2>Top 10 más vendidos</h2>
            <div className="admin-table-wrap">
              {topMas.length === 0 ? <p className="catalogo-empty">Sin datos</p> : (
                <table className="admin-table">
                  <thead><tr><th>Código</th><th>Descripción</th><th>Cantidad</th><th>Monto</th></tr></thead>
                  <tbody>
                    {topMas.slice(0, 10).map((p, i) => (
                      <tr key={p._id || p.codigo || i}>
                        <td>{p.codigo || '—'}</td>
                        <td>{p.descripcion || p.nombre || '—'}</td>
                        <td>{p.cantidad ?? p.vendidos ?? '—'}</td>
                        <td>Bs. {typeof p.monto === 'number' ? p.monto.toFixed(2) : p.monto ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          <section className="admin-section">
            <h2>Top 10 menos vendidos</h2>
            <div className="admin-table-wrap">
              {topMenos.length === 0 ? <p className="catalogo-empty">Sin datos</p> : (
                <table className="admin-table">
                  <thead><tr><th>Código</th><th>Descripción</th><th>Cantidad</th><th>Monto</th></tr></thead>
                  <tbody>
                    {topMenos.slice(0, 10).map((p, i) => (
                      <tr key={p._id || p.codigo || i}>
                        <td>{p.codigo || '—'}</td>
                        <td>{p.descripcion || p.nombre || '—'}</td>
                        <td>{p.cantidad ?? p.vendidos ?? '—'}</td>
                        <td>Bs. {typeof p.monto === 'number' ? p.monto.toFixed(2) : p.monto ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          {graficas.length > 0 && (
            <section className="admin-section">
              <h2>Ventas por mes</h2>
              <div className="graficas-simple">
                {graficas.map((g, i) => (
                  <div key={g.mes || g.fecha || i} className="grafica-item">
                    <span>{g.mes || g.fecha || g.label || `Mes ${i + 1}`}</span>
                    <span>Bs. {typeof g.valor === 'number' ? g.valor.toFixed(2) : g.valor ?? '—'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
