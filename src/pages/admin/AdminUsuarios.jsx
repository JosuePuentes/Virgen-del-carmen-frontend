import { useState } from 'react'
import { apiGet, apiPost, getAdminToken } from '../../config/api'
import { MODULOS_PERMISOS } from '../../config/modulos'

export default function AdminUsuarios() {
  const [form, setForm] = useState({
    cedula: '', nombre: '', telefono: '', usuario: '', password: '',
    rol: 'admin',
    modulos: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  function handleChange(e) {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const mod = value
      setForm((f) => ({
        ...f,
        modulos: f.modulos.includes(mod) ? f.modulos.filter((m) => m !== mod) : [...f.modulos, mod],
      }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  function toggleTodos(checked) {
    setForm((f) => ({
      ...f,
      modulos: checked ? MODULOS_PERMISOS.map((m) => m.key) : [],
    }))
  }

  const todosSeleccionados = MODULOS_PERMISOS.every((m) => form.modulos.includes(m.key))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setLoading(true)
    try {
      await apiPost('register/admin/', {
        cedula: form.cedula,
        nombre: form.nombre,
        telefono: form.telefono,
        usuario: form.usuario,
        password: form.password,
        rol: form.rol,
        modulos: form.modulos,
      }, getAdminToken())
      setExito('Usuario administrativo creado correctamente.')
      setForm({
        cedula: '', nombre: '', telefono: '', usuario: '', password: '',
        rol: 'admin',
        modulos: [],
      })
    } catch (err) {
      setError(err.message || 'Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <h1>Crear usuario admin</h1>
      <p className="admin-welcome">Registra un nuevo usuario. Seleccione los permisos (módulos) que tendrá cada usuario.</p>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Cédula
          <input name="cedula" value={form.cedula} onChange={handleChange} placeholder="V-12345678" />
        </label>
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>
          Teléfono
          <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="04141234567" />
        </label>
        <label>
          Usuario
          <input name="usuario" value={form.usuario} onChange={handleChange} required />
        </label>
        <label>
          Contraseña
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Rol
          <input name="rol" value={form.rol} onChange={handleChange} />
        </label>
        <div className="admin-form-modulos admin-form-modulos-grid">
          <div className="modulos-header">
            <span>Permisos (módulos)</span>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={todosSeleccionados}
                onChange={(e) => toggleTodos(e.target.checked)}
              />
              Seleccionar todos
            </label>
          </div>
          {MODULOS_PERMISOS.map((m) => (
            <label key={m.key} className="admin-checkbox">
              <input
                type="checkbox"
                value={m.key}
                checked={form.modulos.includes(m.key)}
                onChange={handleChange}
              />
              {m.label}
            </label>
          ))}
        </div>
        {error && <p className="auth-error">{error}</p>}
        {exito && <p className="auth-success">{exito}</p>}
        <button type="submit" className="btn-hero" disabled={loading}>
          {loading ? 'Creando…' : 'Crear usuario'}
        </button>
      </form>
    </div>
  )
}
