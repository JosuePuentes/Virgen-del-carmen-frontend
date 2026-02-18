import { useState, useEffect } from 'react'
import { apiGet, apiPost, getAdminToken } from '../../config/api'

export default function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creando, setCreando] = useState(false)
  const [exito, setExito] = useState('')
  const [form, setForm] = useState({
    rif: '', empresa: '', encargado: '', direccion: '', telefono: '', email: '', password: '',
    activo: true, descuento1: 0, descuento2: 0, descuento3: 0,
  })

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

  useEffect(() => { cargar() }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }))
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setCreando(true)
    try {
      await apiPost('clientes/', form, getAdminToken())
      setExito('Cliente creado correctamente.')
      setForm({ rif: '', empresa: '', encargado: '', direccion: '', telefono: '', email: '', password: '', activo: true, descuento1: 0, descuento2: 0, descuento3: 0 })
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
      <section className="admin-section">
        <h2>Crear cliente</h2>
        <form onSubmit={handleCrear} className="admin-form admin-form-inline">
          <input name="rif" placeholder="RIF" value={form.rif} onChange={handleChange} required />
          <input name="empresa" placeholder="Empresa" value={form.empresa} onChange={handleChange} />
          <input name="encargado" placeholder="Encargado" value={form.encargado} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
          <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} />
          <button type="submit" className="btn-hero" disabled={creando}>{creando ? 'Creando…' : 'Crear'}</button>
        </form>
        {exito && <p className="auth-success">{exito}</p>}
      </section>
      <h2>Listado</h2>
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
