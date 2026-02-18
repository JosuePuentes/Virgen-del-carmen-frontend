import { useState, useEffect } from 'react'
import { apiGet, apiPost, getAdminToken } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creando, setCreando] = useState(false)
  const [exito, setExito] = useState('')
  const [form, setForm] = useState({
    rif: '', empresa: '', encargado: '', direccion: '', telefono: '',
    dias_credito: 0, limite_credito: 0,
  })

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet('clientes/all', getAdminToken()).catch(() => apiGet('clientes/', getAdminToken()))
      setClientes(Array.isArray(data) ? data : data?.clientes || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar los clientes')
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  function handleChange(e) {
    const { name, value, type } = e.target
    setForm((f) => ({ ...f, [name]: type === 'number' ? Number(value) : value }))
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setCreando(true)
    try {
      await apiPost('clientes/', {
        rif: form.rif,
        empresa: form.empresa,
        encargado: form.encargado,
        direccion: form.direccion,
        telefono: form.telefono,
        dias_credito: form.dias_credito || 0,
        limite_credito: form.limite_credito || 0,
      }, getAdminToken())
      setExito('Cliente creado. El backend generará email y contraseña automáticamente.')
      setForm({ rif: '', empresa: '', encargado: '', direccion: '', telefono: '', dias_credito: 0, limite_credito: 0 })
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al crear cliente')
    } finally {
      setCreando(false)
    }
  }

  return (
    <div className="admin-page">
      <h1>Clientes</h1>
      <p className="admin-welcome">Crear cliente con RIF, empresa, encargado, teléfono, días de crédito y límite de crédito. Al crear, el backend genera email y contraseña.</p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      <section className="admin-section">
        <h2>Crear cliente</h2>
        <form onSubmit={handleCrear} className="admin-form admin-form-grid">
          <input name="rif" placeholder="RIF" value={form.rif} onChange={handleChange} required />
          <input name="empresa" placeholder="Empresa" value={form.empresa} onChange={handleChange} required />
          <input name="encargado" placeholder="Encargado" value={form.encargado} onChange={handleChange} />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
          <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} />
          <input name="dias_credito" type="number" placeholder="Días de crédito" value={form.dias_credito || ''} onChange={handleChange} />
          <input name="limite_credito" type="number" step="0.01" placeholder="Límite de crédito ($)" value={form.limite_credito || ''} onChange={handleChange} />
          <button type="submit" className="btn-hero" disabled={creando}>
            {creando ? 'Creando…' : 'Crear cliente'}
          </button>
        </form>
      </section>

      <h2>Listado</h2>
      {loading && <p className="catalogo-loading">Cargando clientes...</p>}
      {!loading && (
        <div className="admin-table-wrap">
          {clientes.length === 0 ? (
            <p className="catalogo-empty">No hay clientes.</p>
          ) : (
            <table className="admin-table admin-table-wide">
              <thead>
                <tr>
                  <th>RIF</th>
                  <th>Empresa</th>
                  <th>Encargado</th>
                  <th>Teléfono</th>
                  <th>Días crédito</th>
                  <th>Límite crédito</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.rif || c._id}>
                    <td>{c.rif || '—'}</td>
                    <td>{c.empresa || '—'}</td>
                    <td>{c.encargado || '—'}</td>
                    <td>{c.telefono || '—'}</td>
                    <td>{c.dias_credito ?? '—'}</td>
                    <td><Precio value={c.limite_credito} /></td>
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
