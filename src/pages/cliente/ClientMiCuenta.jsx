import { useState, useEffect } from 'react'
import { apiGet, apiPatch, getToken, getRif } from '../../config/api'

export default function ClientMiCuenta() {
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [form, setForm] = useState({
    encargado: '', direccion: '', telefono: '', email: '', password: '',
  })
  const token = getToken()
  const rif = getRif()

  useEffect(() => {
    if (!rif || !token) return
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet(`clientes/${rif}`, token)
        setCliente(data)
        setForm({
          encargado: data.encargado || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          email: data.email || '',
          password: '',
        })
      } catch (err) {
        setError(err.message || 'No se pudo cargar')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [rif, token])

  async function handleGuardar(e) {
    e.preventDefault()
    if (!rif || !token) return
    setGuardando(true)
    setError('')
    setExito('')
    try {
      const body = {}
      if (form.encargado) body.encargado = form.encargado
      if (form.direccion) body.direccion = form.direccion
      if (form.telefono) body.telefono = form.telefono
      if (form.email) body.email = form.email
      if (form.password) body.password = form.password
      await apiPatch(`clientes/${rif}`, body, token)
      setExito('Datos actualizados.')
      setForm((f) => ({ ...f, password: '' }))
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <div className="client-page"><p className="client-loading">Cargando...</p></div>

  return (
    <div className="client-page">
      <h1>Mi cuenta</h1>
      <form onSubmit={handleGuardar} className="client-form client-form-grid">
        <label>RIF</label>
        <input value={rif || ''} readOnly disabled />
        <label>Empresa</label>
        <input value={cliente?.empresa || ''} readOnly disabled />
        <label>Encargado</label>
        <input name="encargado" value={form.encargado} onChange={(e) => setForm((f) => ({ ...f, encargado: e.target.value }))} />
        <label>Dirección</label>
        <input name="direccion" value={form.direccion} onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))} />
        <label>Teléfono</label>
        <input name="telefono" value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <label>Nueva contraseña (dejar vacío para no cambiar)</label>
        <input type="password" name="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
        <div style={{ gridColumn: '1 / -1' }}>
          {error && <p className="auth-error">{error}</p>}
          {exito && <p className="auth-success">{exito}</p>}
          <button type="submit" className="btn-hero" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </form>
    </div>
  )
}
