import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiDelete, getAdminToken } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function AdminGastos() {
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creando, setCreando] = useState(false)
  const [exito, setExito] = useState('')
  const [form, setForm] = useState({
    monto: '', descripcion: '', fecha: '', categoria: '',
  })
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      let path = 'gastos/'
      const params = []
      if (filtroDesde) params.push(`desde=${filtroDesde}`)
      if (filtroHasta) params.push(`hasta=${filtroHasta}`)
      if (params.length) path += '?' + params.join('&')
      const data = await apiGet(path, getAdminToken())
      setGastos(Array.isArray(data) ? data : data?.gastos || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
      setGastos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [filtroDesde, filtroHasta])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setCreando(true)
    try {
      await apiPost('gastos/', {
        monto: Number(form.monto),
        descripcion: form.descripcion,
        fecha: form.fecha || new Date().toISOString().slice(0, 10),
        categoria: form.categoria || undefined,
      }, getAdminToken())
      setExito('Gasto registrado.')
      setForm({ monto: '', descripcion: '', fecha: new Date().toISOString().slice(0, 10), categoria: '' })
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al registrar')
    } finally {
      setCreando(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este gasto?')) return
    try {
      await apiDelete(`gastos/${id}`, getAdminToken())
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al eliminar')
    }
  }

  return (
    <div className="admin-page">
      <h1>Gastos</h1>
      <p className="admin-welcome">CRUD de gastos. Filtre por fecha.</p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      <section className="admin-section">
        <h2>Registrar gasto</h2>
        <form onSubmit={handleCrear} className="admin-form admin-form-grid">
          <input name="monto" type="number" step="0.01" placeholder="Monto ($)" value={form.monto} onChange={handleChange} required />
          <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
          <input name="fecha" type="date" value={form.fecha || new Date().toISOString().slice(0, 10)} onChange={handleChange} />
          <input name="categoria" placeholder="Categoría" value={form.categoria} onChange={handleChange} />
          <button type="submit" className="btn-hero" disabled={creando}>
            {creando ? 'Guardando…' : 'Registrar'}
          </button>
        </form>
      </section>

      <div className="admin-filtro">
        <label>
          Desde:
          <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} />
        </label>
        <label>
          Hasta:
          <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} />
        </label>
      </div>

      <h2>Listado</h2>
      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <div className="admin-table-wrap">
          {gastos.length === 0 ? (
            <p className="catalogo-empty">No hay gastos.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr key={g._id || g.id}>
                    <td>{g.fecha ? g.fecha.slice(0, 10) : '—'}</td>
                    <td>{g.descripcion || '—'}</td>
                    <td>{g.categoria || '—'}</td>
                    <td><Precio value={g.monto} /></td>
                    <td>
                      <button type="button" className="btn-rechazar btn-sm" onClick={() => handleEliminar(g._id || g.id)}>Eliminar</button>
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
