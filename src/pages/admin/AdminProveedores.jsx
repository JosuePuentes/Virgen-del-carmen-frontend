import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, getAdminToken } from '../../config/api'

export default function AdminProveedores() {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creando, setCreando] = useState(false)
  const [exito, setExito] = useState('')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({
    rif: '', empresa: '', dias_credito: '', condiciones_comerciales: '', pronto_pago_porcentaje: '',
  })

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet('proveedores/', getAdminToken())
      setProveedores(Array.isArray(data) ? data : data?.proveedores || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
      setProveedores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function abrirEditar(p) {
    setEditando(p)
    setForm({
      rif: p.rif || '',
      empresa: p.empresa || p.nombre || '',
      dias_credito: p.dias_credito ?? '',
      condiciones_comerciales: p.condiciones_comerciales ?? p.condiciones ?? '',
      pronto_pago_porcentaje: p.pronto_pago_porcentaje ?? p.pronto_pago ?? '',
    })
  }

  function cerrarEditar() {
    setEditando(null)
    setForm({ rif: '', empresa: '', dias_credito: '', condiciones_comerciales: '', pronto_pago_porcentaje: '' })
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setCreando(true)
    try {
      if (editando) {
        await apiPut(`proveedores/${editando._id || editando.id}`, {
          rif: form.rif,
          empresa: form.empresa,
          dias_credito: form.dias_credito ? Number(form.dias_credito) : undefined,
          condiciones_comerciales: form.condiciones_comerciales || undefined,
          pronto_pago_porcentaje: form.pronto_pago_porcentaje ? Number(form.pronto_pago_porcentaje) : undefined,
        }, getAdminToken())
        setExito('Proveedor actualizado.')
      } else {
        await apiPost('proveedores/', {
          rif: form.rif,
          empresa: form.empresa,
          dias_credito: form.dias_credito ? Number(form.dias_credito) : 0,
          condiciones_comerciales: form.condiciones_comerciales || undefined,
          pronto_pago_porcentaje: form.pronto_pago_porcentaje ? Number(form.pronto_pago_porcentaje) : undefined,
        }, getAdminToken())
        setExito('Proveedor creado.')
      }
      cerrarEditar()
      await cargar()
    } catch (err) {
      setError(err.message || 'Error')
    } finally {
      setCreando(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este proveedor?')) return
    try {
      await apiDelete(`proveedores/${id}`, getAdminToken())
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al eliminar')
    }
  }

  return (
    <div className="admin-page">
      <h1>Proveedores</h1>
      <p className="admin-welcome">RIF, nombre empresa, días de crédito que otorga, condiciones comerciales (ej. 5%, 10%) y pronto pago (%).</p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      <section className="admin-section">
        <h2>{editando ? 'Editar proveedor' : 'Crear proveedor'}</h2>
        <form onSubmit={handleCrear} className="admin-form admin-form-grid">
          <input name="rif" placeholder="RIF" value={form.rif} onChange={handleChange} required />
          <input name="empresa" placeholder="Nombre empresa" value={form.empresa} onChange={handleChange} required />
          <input name="dias_credito" type="number" placeholder="Días de crédito" value={form.dias_credito} onChange={handleChange} />
          <input name="condiciones_comerciales" placeholder="Condiciones comerciales % (ej. 5, 10)" value={form.condiciones_comerciales} onChange={handleChange} />
          <input name="pronto_pago_porcentaje" type="number" step="0.01" placeholder="Pronto pago %" value={form.pronto_pago_porcentaje} onChange={handleChange} />
          <button type="submit" className="btn-hero" disabled={creando}>
            {creando ? 'Guardando…' : editando ? 'Actualizar' : 'Crear'}
          </button>
          {editando && (
            <button type="button" className="btn-secondary" onClick={cerrarEditar}>Cancelar</button>
          )}
        </form>
      </section>

      <h2>Listado</h2>
      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <div className="admin-table-wrap">
          {proveedores.length === 0 ? (
            <p className="catalogo-empty">No hay proveedores.</p>
          ) : (
            <table className="admin-table admin-table-wide">
              <thead>
                <tr>
                  <th>RIF</th>
                  <th>Empresa</th>
                  <th>Días crédito</th>
                  <th>Condiciones %</th>
                  <th>Pronto pago %</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p._id || p.id}>
                    <td>{p.rif || '—'}</td>
                    <td>{p.empresa || p.nombre || '—'}</td>
                    <td>{p.dias_credito ?? '—'}</td>
                    <td>{p.condiciones_comerciales ?? p.condiciones ?? '—'}</td>
                    <td>{p.pronto_pago_porcentaje ?? p.pronto_pago ?? '—'}</td>
                    <td>
                      <button type="button" className="btn-aprobar btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
                      <button type="button" className="btn-rechazar btn-sm" onClick={() => handleEliminar(p._id || p.id)}>Eliminar</button>
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
