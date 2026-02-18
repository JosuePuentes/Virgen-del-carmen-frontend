import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPostForm, getAdminToken } from '../../config/api'

export default function AdminInventario() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [creando, setCreando] = useState(false)
  const [subiendoExcel, setSubiendoExcel] = useState(false)
  const [form, setForm] = useState({
    codigo: '', descripcion: '', marca: '', costo: '', utilidad: '', precio: '', existencia: '',
  })
  const [foto, setFoto] = useState(null)

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet('inventario_maestro/', getAdminToken())
      setProductos(Array.isArray(data) ? data : data?.items || data?.productos || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar el inventario')
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

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
      const body = {
        codigo: form.codigo,
        descripcion: form.descripcion,
        marca: form.marca || undefined,
        costo: form.costo ? Number(form.costo) : undefined,
        utilidad: form.utilidad ? Number(form.utilidad) : undefined,
        precio: form.precio ? Number(form.precio) : undefined,
        existencia: form.existencia ? Number(form.existencia) : 0,
      }
      if (foto) {
        const fd = new FormData()
        Object.entries(body).forEach(([k, v]) => {
          if (v !== undefined && v !== '') fd.append(k, v)
        })
        fd.append('foto', foto)
        await apiPostForm('inventario_maestro/', fd, getAdminToken())
      } else {
        await apiPost('inventario_maestro/', body, getAdminToken())
      }
      setExito('Producto creado correctamente.')
      setForm({ codigo: '', descripcion: '', marca: '', costo: '', utilidad: '', precio: '', existencia: '' })
      setFoto(null)
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al crear producto')
    } finally {
      setCreando(false)
    }
  }

  async function handleExcel(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendoExcel(true)
    setError('')
    setExito('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      await apiPostForm('inventarios/upload-excel', fd, getAdminToken())
      setExito('Excel cargado correctamente.')
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al cargar Excel')
    } finally {
      setSubiendoExcel(false)
      e.target.value = ''
    }
  }

  return (
    <div className="admin-page">
      <h1>Inventario</h1>
      <p className="admin-welcome">Carga masiva por Excel (Codigo, Descripcion, Marca, Costo, Utilidad, Precio, Existencia) o cree productos individuales con foto opcional.</p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      <section className="admin-section inventario-acciones">
        <h2>Carga Excel</h2>
        <label className="btn-secondary" style={{ cursor: 'pointer' }}>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} disabled={subiendoExcel} style={{ display: 'none' }} />
          {subiendoExcel ? 'Subiendo…' : 'Seleccionar archivo Excel'}
        </label>
      </section>

      <section className="admin-section">
        <h2>Crear producto</h2>
        <form onSubmit={handleCrear} className="admin-form admin-form-grid">
          <input name="codigo" placeholder="Código" value={form.codigo} onChange={handleChange} required />
          <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
          <input name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} />
          <input name="costo" type="number" step="0.01" placeholder="Costo" value={form.costo} onChange={handleChange} />
          <input name="utilidad" type="number" step="0.01" placeholder="Utilidad %" value={form.utilidad} onChange={handleChange} />
          <input name="precio" type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={handleChange} />
          <input name="existencia" type="number" placeholder="Existencia" value={form.existencia} onChange={handleChange} />
          <label>
            Foto (opcional)
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} />
          </label>
          <button type="submit" className="btn-hero" disabled={creando}>
            {creando ? 'Creando…' : 'Crear producto'}
          </button>
        </form>
      </section>

      <h2>Listado</h2>
      {loading && <p className="catalogo-loading">Cargando inventario...</p>}
      {!loading && (
        <div className="admin-table-wrap">
          {productos.length === 0 ? (
            <p className="catalogo-empty">No hay productos.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Marca</th>
                  <th>Precio</th>
                  <th>Existencia</th>
                </tr>
              </thead>
              <tbody>
                {productos.slice(0, 100).map((p) => (
                  <tr key={p._id || p.codigo}>
                    <td>{p.codigo || p._id}</td>
                    <td>{p.descripcion || p.nombre || '—'}</td>
                    <td>{p.marca || p.laboratorio || '—'}</td>
                    <td>Bs. {typeof p.precio === 'number' ? p.precio.toFixed(2) : p.precio || '—'}</td>
                    <td>{p.existencia ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {productos.length > 100 && <p className="admin-more">Mostrando 100 de {productos.length} productos</p>}
        </div>
      )}
    </div>
  )
}
