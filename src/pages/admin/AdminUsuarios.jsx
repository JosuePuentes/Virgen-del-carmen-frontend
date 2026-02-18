import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPatch, getAdminToken } from '../../config/api'
import { MODULOS_PERMISOS } from '../../config/modulos'

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({
    cedula: '', nombre: '', telefono: '', usuario: '', password: '',
    rol: 'admin',
    modulos: [],
  })
  const [loading, setLoading] = useState(false)
  const [loadingLista, setLoadingLista] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  async function cargarUsuarios() {
    setLoadingLista(true)
    setError('')
    try {
      const data = await apiGet('usuarios/admin/', getAdminToken())
        .catch(() => apiGet('admin/usuarios/', getAdminToken()))
        .catch(() => [])
      setUsuarios(Array.isArray(data) ? data : data?.usuarios || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar usuarios')
      setUsuarios([])
    } finally {
      setLoadingLista(false)
    }
  }

  useEffect(() => { cargarUsuarios() }, [])

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

  function abrirEditar(u) {
    const mods = u.modulos || []
    const esMaster = mods.includes('master') || mods.includes('*') || String(u.rol || '').toLowerCase() === 'master'
    setEditando(u)
    setForm({
      cedula: u.cedula || '',
      nombre: u.nombre || '',
      telefono: u.telefono || '',
      usuario: u.usuario || '',
      password: '',
      rol: u.rol || 'admin',
      modulos: esMaster ? MODULOS_PERMISOS.map((m) => m.key) : mods,
    })
  }

  function cerrarEditar() {
    setEditando(null)
    setForm({
      cedula: '', nombre: '', telefono: '', usuario: '', password: '',
      rol: 'admin',
      modulos: [],
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setLoading(true)
    try {
      if (editando) {
        const body = { modulos: form.modulos, rol: form.rol }
        if (form.nombre) body.nombre = form.nombre
        if (form.telefono) body.telefono = form.telefono
        if (form.password) body.password = form.password
        await apiPatch(`usuarios/admin/${editando._id || editando.id}`, body, getAdminToken())
          .catch(() => apiPatch(`admin/usuarios/${editando._id || editando.id}`, body, getAdminToken()))
        setExito('Permisos actualizados.')
        cerrarEditar()
        await cargarUsuarios()
      } else {
        await apiPost('register/admin/', {
          cedula: form.cedula,
          nombre: form.nombre,
          telefono: form.telefono,
          usuario: form.usuario,
          password: form.password,
          rol: form.rol,
          modulos: form.modulos,
        }, getAdminToken())
        setExito('Usuario creado correctamente.')
        setForm({
          cedula: '', nombre: '', telefono: '', usuario: '', password: '',
          rol: 'admin',
          modulos: [],
        })
        await cargarUsuarios()
      }
    } catch (err) {
      setError(err.message || (editando ? 'Error al actualizar' : 'Error al crear usuario'))
    } finally {
      setLoading(false)
    }
  }

  function textoModulos(u) {
    const m = u.modulos || []
    if (m.includes('master') || m.includes('*')) return 'Todos'
    if (m.length === 0) return '—'
    return m.length <= 3 ? m.join(', ') : `${m.length} módulos`
  }

  return (
    <div className="admin-page">
      <h1>Usuarios admin</h1>
      <p className="admin-welcome">Crear usuarios y gestionar permisos. Lista todos los usuarios para activar o desactivar módulos.</p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      <section className="admin-section">
        <h2>{editando ? 'Editar permisos' : 'Crear usuario'}</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          {editando ? (
            <>
              <p className="usuario-editando">Editando: <strong>{editando.usuario}</strong></p>
              <label>Nombre <input name="nombre" value={form.nombre} onChange={handleChange} /></label>
              <label>Teléfono <input name="telefono" value={form.telefono} onChange={handleChange} /></label>
              <label>Nueva contraseña (opcional) <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Dejar vacío para no cambiar" /></label>
            </>
          ) : (
            <>
              <label>Cédula <input name="cedula" value={form.cedula} onChange={handleChange} placeholder="V-12345678" /></label>
              <label>Nombre <input name="nombre" value={form.nombre} onChange={handleChange} required /></label>
              <label>Teléfono <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="04141234567" /></label>
              <label>Usuario <input name="usuario" value={form.usuario} onChange={handleChange} required /></label>
              <label>Contraseña <input type="password" name="password" value={form.password} onChange={handleChange} required /></label>
            </>
          )}
          <label>Rol <input name="rol" value={form.rol} onChange={handleChange} /></label>
          <div className="admin-form-modulos admin-form-modulos-grid">
            <div className="modulos-header">
              <span>Permisos (módulos)</span>
              <label className="admin-checkbox">
                <input type="checkbox" checked={todosSeleccionados} onChange={(e) => toggleTodos(e.target.checked)} />
                Seleccionar todos
              </label>
            </div>
            {MODULOS_PERMISOS.map((m) => (
              <label key={m.key} className="admin-checkbox">
                <input type="checkbox" value={m.key} checked={form.modulos.includes(m.key)} onChange={handleChange} />
                {m.label}
              </label>
            ))}
          </div>
          <div className="form-btns">
            <button type="submit" className="btn-hero" disabled={loading}>
              {loading ? 'Guardando…' : editando ? 'Guardar permisos' : 'Crear usuario'}
            </button>
            {editando && (
              <button type="button" className="btn-secondary" onClick={cerrarEditar}>Cancelar</button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-section">
        <h2>Usuarios creados</h2>
        {loadingLista && <p className="catalogo-loading">Cargando...</p>}
        {!loadingLista && (
          <div className="admin-table-wrap">
            {usuarios.length === 0 ? (
              <p className="catalogo-empty">No hay usuarios. Cree uno arriba. Si el backend no tiene endpoint de listado, aparecerán aquí cuando lo implemente.</p>
            ) : (
              <table className="admin-table admin-table-wide">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Permisos</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u._id || u.id}>
                      <td>{u.usuario || u.username || '—'}</td>
                      <td>{u.nombre || u.name || '—'}</td>
                      <td>{u.rol || '—'}</td>
                      <td>{textoModulos(u)}</td>
                      <td>
                        <button type="button" className="btn-aprobar btn-sm" onClick={() => abrirEditar(u)}>Editar permisos</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
