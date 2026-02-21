import { useState, useEffect } from 'react'
import { apiGet, apiPatch, getAdminToken } from '../../config/api'

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionando, setAccionando] = useState(null)
  const [modalAprobar, setModalAprobar] = useState(null)
  const [confirmarAprobar, setConfirmarAprobar] = useState(false)
  const [modalRechazar, setModalRechazar] = useState(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
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

  function solicitarConfirmarAprobar() {
    setConfirmarAprobar(true)
  }

  async function handleAprobar(e) {
    e?.preventDefault()
    if (!modalAprobar) return
    setAccionando(modalAprobar.rif)
    try {
      await apiPatch(`clientes/${modalAprobar.rif}/aprobar`, {
        limite_credito: Number(formAprobar.limite_credito) || 0,
        dias_credito: Number(formAprobar.dias_credito) || 0,
        monto: Number(formAprobar.monto) || 0,
      }, getAdminToken())
      setModalAprobar(null)
      setConfirmarAprobar(false)
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al aprobar')
    } finally {
      setAccionando(null)
    }
  }

  function abrirRechazar(s) {
    setModalRechazar(s)
    setMotivoRechazo('')
  }

  async function handleRechazar(e) {
    e?.preventDefault()
    if (!modalRechazar) return
    const motivo = motivoRechazo.trim()
    if (!motivo) {
      setError('Indique el motivo del rechazo')
      return
    }
    setAccionando(modalRechazar.rif)
    setError('')
    try {
      await apiPatch(`clientes/${modalRechazar.rif}/rechazar`, { motivo }, getAdminToken())
      setModalRechazar(null)
      setMotivoRechazo('')
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
                        <button type="button" className="btn-rechazar" onClick={() => abrirRechazar(s)} disabled={!!accionando}>
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
            <form onSubmit={(e) => { e.preventDefault(); solicitarConfirmarAprobar(); }}>
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
                <button type="submit" className="btn-hero" disabled={!!accionando}>Aprobar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmarAprobar && modalAprobar && (
        <div className="modal-overlay" onClick={() => setConfirmarAprobar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar aprobación</h3>
            <p>¿Está seguro de aprobar a <strong>{modalAprobar.empresa || modalAprobar.rif}</strong> con límite ${formAprobar.limite_credito}, {formAprobar.dias_credito} días de crédito?</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setConfirmarAprobar(false)}>Cancelar</button>
              <button type="button" className="btn-hero" onClick={handleAprobar} disabled={!!accionando}>
                {accionando ? '…' : 'Confirmar aprobación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalRechazar && (
        <div className="modal-overlay" onClick={() => setModalRechazar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rechazar solicitud: {modalRechazar.empresa || modalRechazar.rif}</h3>
            <form onSubmit={handleRechazar}>
              <label>
                Motivo del rechazo <span className="required">*</span>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Indique el motivo del rechazo..."
                  rows="4"
                  required
                />
              </label>
              <p className="modal-hint">El motivo se guardará para los informes de solicitudes.</p>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalRechazar(null)}>Cancelar</button>
                <button type="submit" className="btn-rechazar" disabled={!!accionando || !motivoRechazo.trim()}>
                  {accionando ? '…' : 'Confirmar rechazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
