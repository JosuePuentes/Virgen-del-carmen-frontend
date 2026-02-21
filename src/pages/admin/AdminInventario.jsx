import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPostForm, getAdminToken } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function AdminInventario() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [creando, setCreando] = useState(false)
  const [subiendoExcel, setSubiendoExcel] = useState(false)
  const [form, setForm] = useState({
    codigo: '', descripcion: '', marca: '', costo: '', utilidad: '', precio: '', existencia: '',
    stock_minimo: '', stock_maximo: '',
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
    setForm((f) => {
      const next = { ...f, [name]: value }
      if ((name === 'costo' || name === 'utilidad') && (next.costo || next.utilidad)) {
        const costo = parseFloat(next.costo) || 0
        const utilidad = parseFloat(next.utilidad) || 0
        if (costo > 0 && utilidad >= 0) {
          next.precio = (costo * (1 + utilidad / 100)).toFixed(2)
        }
      }
      return next
    })
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
        stock_minimo: form.stock_minimo ? Number(form.stock_minimo) : undefined,
        stock_maximo: form.stock_maximo ? Number(form.stock_maximo) : undefined,
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
      setForm({ codigo: '', descripcion: '', marca: '', costo: '', utilidad: '', precio: '', existencia: '', stock_minimo: '', stock_maximo: '' })
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
      <p className="admin-welcome">Carga masiva por Excel (Codigo, Descripcion, Marca, Costo, Utilidad, Precio, Existencia, Stock_minimo, Stock_maximo) o cree productos individuales. El precio se calcula automáticamente: Costo × (1 + Utilidad%).</p>
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
          <input name="costo" type="number" step="0.01" placeholder="Costo ($)" value={form.costo} onChange={handleChange} />
          <input name="utilidad" type="number" step="0.01" placeholder="Utilidad %" value={form.utilidad} onChange={handleChange} />
          <input name="precio" type="number" step="0.01" placeholder="Precio (auto)" value={form.precio} onChange={handleChange} title="Se calcula: Costo × (1 + Utilidad/100)" />
          <input name="existencia" type="number" placeholder="Existencia" value={form.existencia} onChange={handleChange} />
          <input name="stock_minimo" type="number" placeholder="Stock mínimo" value={form.stock_minimo} onChange={handleChange} />
          <input name="stock_maximo" type="number" placeholder="Stock máximo" value={form.stock_maximo} onChange={handleChange} />
          <label>
            Foto (opcional)
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} />
          </label>
          <button type="submit" className="btn-hero" disabled={creando}>
            {creando ? 'Creando…' : 'Crear producto'}
          </button>
        </form>
      </section>

      {/* Sugerencias de stock */}
      {!loading && productos.length > 0 && (() => {
        const conSugerencia = productos.filter((p) => {
          const ex = Number(p.existencia) || 0
          const min = Number(p.stock_minimo) || 0
          const max = Number(p.stock_maximo) || 0
          return (min > 0 && ex < min) || (max > 0 && ex > max)
        })
        if (conSugerencia.length === 0) return null
        return (
          <section className="admin-section inventario-sugerencias">
            <h2>Sugerencias de stock</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Existencia</th>
                    <th>Mín</th>
                    <th>Máx</th>
                    <th>Sugerencia</th>
                  </tr>
                </thead>
                <tbody>
                  {conSugerencia.map((p) => {
                    const ex = Number(p.existencia) || 0
                    const min = Number(p.stock_minimo) || 0
                    const max = Number(p.stock_maximo) || 0
                    let sug = '—'
                    if (min > 0 && ex < min) sug = `Comprar ${min - ex} unidades`
                    else if (max > 0 && ex > max) sug = `Stock alto (${ex - max} sobre máximo)`
                    return (
                      <tr key={p._id || p.codigo} className={ex < min ? 'sugerencia-bajo' : 'sugerencia-alto'}>
                        <td>{p.codigo || p._id}</td>
                        <td>{p.descripcion || p.nombre || '—'}</td>
                        <td>{ex}</td>
                        <td>{min || '—'}</td>
                        <td>{max || '—'}</td>
                        <td>{sug}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      })()}

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
                  <th>Stock mín</th>
                  <th>Stock máx</th>
                </tr>
              </thead>
              <tbody>
                {productos.slice(0, 100).map((p) => (
                  <tr key={p._id || p.codigo}>
                    <td>{p.codigo || p._id}</td>
                    <td>{p.descripcion || p.nombre || '—'}</td>
                    <td>{p.marca || p.laboratorio || '—'}</td>
                    <td><Precio value={p.precio} /></td>
                    <td>{p.existencia ?? '—'}</td>
                    <td>{p.stock_minimo ?? '—'}</td>
                    <td>{p.stock_maximo ?? '—'}</td>
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
