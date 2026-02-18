import { useState } from 'react'
import { apiPost, getAdminToken } from '../../config/api'

const MODULOS_OPCIONES = ['solicitudes_clientes', 'pedidos', 'inventario', 'clientes']

export default function AdminUsuarios() {
  const [form, setForm] = useState({
    usuario: '',
    password: '',
    rol: 'admin',
    modulos: ['solicitudes_clientes', 'pedidos', 'inventario', 'clientes'],
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

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setLoading(true)
    try {
      await apiPost('register/admin/', form, getAdminToken())
      setExito('Usuario administrativo creado correctamente.')
      setForm({ usuario: '', password: '', rol: 'admin', modulos: MODULOS_OPCIONES })
    } catch (err) {
      setError(err.message || 'Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <h1>Crear usuario admin</h1>
      <p className="admin-welcome">Registra un nuevo usuario administrativo.</p>
      <form onSubmit={handleSubmit} className="admin-form">
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
        <div className="admin-form-modulos">
          <span>Módulos:</span>
          {MODULOS_OPCIONES.map((m) => (
            <label key={m} className="admin-checkbox">
              <input
                type="checkbox"
                value={m}
                checked={form.modulos.includes(m)}
                onChange={handleChange}
              />
              {m}
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
