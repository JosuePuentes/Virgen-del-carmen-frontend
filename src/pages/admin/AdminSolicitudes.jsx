import { useState, useEffect } from 'react'
import { apiGet, apiPatch, getAdminToken } from '../../config/api'

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionando, setAccionando] = useState(null)

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

  useEffect(() => {
    cargar()
  }, [])

  async function handleAprobar(rif) {
    setAccionando(rif)
    try {
      await apiPatch(`clientes/${rif}/aprobar`, {}, getAdminToken())
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
      {loading && <p className="catalogo-loading">Cargando solicitudes...</p>}
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
                  <th>Dirección</th>
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
                    <td>{s.direccion || '—'}</td>
                    <td>
                      <div className="admin-acciones">
                        <button
                          type="button"
                          className="btn-aprobar"
                          onClick={() => handleAprobar(s.rif)}
                          disabled={accionando === s.rif}
                        >
                          {accionando === s.rif ? '…' : 'Aprobar'}
                        </button>
                        <button
                          type="button"
                          className="btn-rechazar"
                          onClick={() => handleRechazar(s.rif)}
                          disabled={accionando === s.rif}
                        >
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
    </div>
  )
}
