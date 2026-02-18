import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function AdminCierreDiario() {
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('diario')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      let path = 'cierre-diario/'
      if (filtro === 'diario') {
        path += `?fecha=${fecha}`
      } else if (filtro === 'rango' && desde && hasta) {
        path += `?desde=${desde}&hasta=${hasta}`
      } else {
        const hoy = new Date().toISOString().slice(0, 10)
        path += `?fecha=${hoy}`
      }
      const data = await apiGet(path, getAdminToken())
      setResumen(data)
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
      setResumen(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filtro === 'diario' && fecha) cargar()
    else if (filtro === 'rango' && desde && hasta) cargar()
  }, [filtro, fecha, desde, hasta])

  function handleConsultar(e) {
    e?.preventDefault()
    cargar()
  }

  return (
    <div className="admin-page">
      <h1>Cierre diario</h1>
      <p className="admin-welcome">Resumen por fecha o rango. Filtros: diario, semanal, mensual.</p>
      {error && <p className="auth-error">{error}</p>}

      <section className="admin-section cierre-filtros">
        <div className="admin-form-modulos">
          <label className="admin-checkbox">
            <input type="radio" name="filtro" value="diario" checked={filtro === 'diario'} onChange={() => setFiltro('diario')} />
            Diario
          </label>
          <label className="admin-checkbox">
            <input type="radio" name="filtro" value="rango" checked={filtro === 'rango'} onChange={() => setFiltro('rango')} />
            Rango
          </label>
        </div>
        {filtro === 'diario' && (
          <label>
            Fecha:
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </label>
        )}
        {filtro === 'rango' && (
          <>
            <label>
              Desde:
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </label>
            <label>
              Hasta:
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </label>
          </>
        )}
        <button type="button" className="btn-hero" onClick={handleConsultar} disabled={loading}>
          {loading ? 'Cargando…' : 'Consultar'}
        </button>
      </section>

      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && resumen && (
        <div className="admin-cards finanzas-cards">
          <div className="admin-card">
            <h3>Productos vendidos</h3>
            <p className="admin-card-valor">{resumen.productos_vendidos ?? resumen.cantidad ?? '—'}</p>
          </div>
          <div className="admin-card">
            <h3>Cantidad clientes</h3>
            <p className="admin-card-valor">{resumen.clientes ?? resumen.cantidad_clientes ?? '—'}</p>
          </div>
          <div className="admin-card">
            <h3>Monto total</h3>
            <p className="admin-card-valor"><Precio value={resumen.monto_total} /></p>
          </div>
          <div className="admin-card">
            <h3>Gastos</h3>
            <p className="admin-card-valor"><Precio value={resumen.gastos} /></p>
          </div>
          <div className="admin-card">
            <h3>Utilidad</h3>
            <p className="admin-card-valor"><Precio value={resumen.utilidad} /></p>
          </div>
        </div>
      )}
    </div>
  )
}
