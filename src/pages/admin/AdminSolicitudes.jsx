import { useState, useEffect } from 'react'
import { apiGet, apiPatch, getAdminToken } from '../../config/api'

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionando, setAccionando] = useState(null)
  const [modalAprobar, setModalAprobar] = useState(null)
  const [formAprobar, setFormAprobar] = useState({
    limite_credito: '',
    dias_credito: '',
    monto: '',
  })

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet('clientes/solicitudes/pendientes', getAdminToken())
      setSolicitudes(Array.isArray(data) ? data : data?.solicitudes || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar las solicitudes')
      setSolicitudes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  function abrirAprobar(s) {
    setModalAprobar(s)
    setFormAprobar({ limite_credito: '', dias_credito: '', monto: '' })
  }

  async function handleAprobar(e) {
    e.preventDefault()
    if (!modalAprobar) return
    setAccionando(modalAprobar.rif)
    try {
      await apiPatch(`clientes/${modalAprobar.rif}/aprobar`, {
        limite_credito: Number(formAprobar.limite_credito) || 0,
        dias_credito: Number(formAprobar.dias_credito) || 0,
        monto: Number(formAprobar.monto) || 0,
      }, getAdminToken())
      setModalAprobar(null)
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al aprobar')
    } finally {
      setAccionando(null)
    }
  }

  async function handleRechazar(rif) {
    setAccionando(rif)
    try {
      await apiPatch(`clientes/${rif}/rechazar`, {}, getAdminToken())
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al rechazar')
    } finally {
      setAccionando(null)
    }
  }

  return (
    <div className="admin-page">
      <h1>Solicitudes de nuevos clientes</h1>
      <p className="admin-welcome">Cuando un cliente se registra, su solicitud aparece aquí. Al aprobar, complete límite de crédito y días.</p>
      {loading && <p className="catalogo-loading">Cargando...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="admin-table-wrap">
          {solicitudes.length === 0 ? (
            <p className="catalogo-empty">No hay solicitudes pendientes.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>RIF</th>
                  <th>Teléfono</th>
                  <th>Encargado</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.rif || s._id}>
                    <td>{s.empresa || s.nombre_empresa || '—'}</td>
                    <td>{s.rif || '—'}</td>
                    <td>{s.telefono || '—'}</td>
                    <td>{s.encargado || '—'}</td>
                    <td>{s.email || '—'}</td>
                    <td>
                      <div className="admin-acciones">
                        <button type="button" className="btn-aprobar" onClick={() => abrirAprobar(s)} disabled={!!accionando}>
                          Aprobar
                        </button>
                        <button type="button" className="btn-rechazar" onClick={() => handleRechazar(s.rif)} disabled={!!accionando}>
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modalAprobar && (
        <div className="modal-overlay" onClick={() => setModalAprobar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Aprobar cliente: {modalAprobar.empresa || modalAprobar.rif}</h3>
            <form onSubmit={handleAprobar}>
              <label>
                Límite de crédito ($)
                <input type="number" step="0.01" value={formAprobar.limite_credito} onChange={(e) => setFormAprobar((f) => ({ ...f, limite_credito: e.target.value }))} required />
              </label>
              <label>
                Días de crédito
                <input type="number" value={formAprobar.dias_credito} onChange={(e) => setFormAprobar((f) => ({ ...f, dias_credito: e.target.value }))} required />
              </label>
              <label>
                Monto inicial
                <input type="number" step="0.01" value={formAprobar.monto} onChange={(e) => setFormAprobar((f) => ({ ...f, monto: e.target.value }))} />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalAprobar(null)}>Cancelar</button>
                <button type="submit" className="btn-hero" disabled={!!accionando}>{accionando ? '…' : 'Aprobar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
