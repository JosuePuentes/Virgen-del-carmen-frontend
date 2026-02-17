import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'

export default function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet('clientes/', getAdminToken())
        setClientes(Array.isArray(data) ? data : data?.clientes || data?.items || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar los clientes')
        setClientes([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  return (
    <div className="admin-page">
      <h1>Clientes</h1>
      {loading && <p className="catalogo-loading">Cargando clientes...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="admin-table-wrap">
          {clientes.length === 0 ? (
            <p className="catalogo-empty">No hay clientes.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>RIF</th>
                  <th>Encargado</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.rif || c._id}>
                    <td>{c.rif || '—'}</td>
                    <td>{c.encargado || '—'}</td>
                    <td>{c.email || '—'}</td>
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
