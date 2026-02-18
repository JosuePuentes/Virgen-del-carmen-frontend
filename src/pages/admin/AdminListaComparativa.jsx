import { useState, useEffect, useMemo } from 'react'
import { apiGet, apiPostForm, getAdminToken } from '../../config/api'

export default function AdminListaComparativa() {
  const [proveedores, setProveedores] = useState([])
  const [listasCargadas, setListasCargadas] = useState([])
  const [productosListas, setProductosListas] = useState([])
  const [inventarioPropio, setInventarioPropio] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [proveedorSel, setProveedorSel] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const [prov, listas, prod, inv] = await Promise.all([
        apiGet('proveedores/', getAdminToken()),
        apiGet('listas-comparativas/', getAdminToken()).catch(() => []),
        apiGet('listas-comparativas/productos', getAdminToken()).catch(() => []),
        apiGet('inventario_maestro/', getAdminToken()),
      ])
      setProveedores(Array.isArray(prov) ? prov : prov?.proveedores || prov?.items || [])
      setListasCargadas(Array.isArray(listas) ? listas : listas?.listas || listas?.items || [])
      setProductosListas(Array.isArray(prod) ? prod : prod?.productos || prod?.items || [])
      setInventarioPropio(Array.isArray(inv) ? inv : inv?.items || inv?.productos || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  async function handleUploadExcel(e) {
    const file = e.target.files?.[0]
    if (!file || !proveedorSel) return
    setSubiendo(true)
    setError('')
    setExito('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('proveedor_id', proveedorSel._id || proveedorSel.id)
      await apiPostForm('listas-comparativas/upload', fd, getAdminToken())
      setExito('Lista cargada. Se aplicó el descuento de condiciones comerciales.')
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al cargar')
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  const resultados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return []
    return productosListas.filter((p) => {
      const t = [p.codigo, p.descripcion, p.nombre, p.marca].filter(Boolean).join(' ').toLowerCase()
      return t.includes(q)
    })
  }, [busqueda, productosListas])

  const porProducto = useMemo(() => {
    const map = {}
    resultados.forEach((r) => {
      const cod = r.codigo || r._id
      if (!map[cod]) map[cod] = []
      map[cod].push(r)
    })
    Object.keys(map).forEach((cod) => {
      map[cod].sort((a, b) => (a.precio_final ?? a.precio ?? 999999) - (b.precio_final ?? b.precio ?? 999999))
    })
    return map
  }, [resultados])

  function getExistenciaPropia(codigo) {
    const p = inventarioPropio.find((x) => (x.codigo || x._id) === codigo)
    return p?.existencia ?? '—'
  }

  const totalProveedores = proveedores.length
  const totalListas = listasCargadas.length

  return (
    <div className="admin-page lista-comparativa">
      <h1>Lista comparativa</h1>
      <p className="admin-welcome">
        Cargue listas de precio por proveedor (Excel: codigo, descripcion, marca, precio, existencia).
        Se aplica el descuento de condiciones comerciales al precio. Busque productos y compare precios.
      </p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      <div className="lista-comparativa-resumen">
        <div className="resumen-item">
          <span>Proveedores</span>
          <strong>{totalProveedores}</strong>
        </div>
        <div className="resumen-item">
          <span>Listas cargadas</span>
          <strong>{totalListas}</strong>
        </div>
      </div>

      <section className="admin-section">
        <h2>Cargar lista de precio</h2>
        <div className="lista-comparativa-upload">
          <select
            value={proveedorSel?.rif || ''}
            onChange={(e) => setProveedorSel(proveedores.find((p) => p.rif === e.target.value) || null)}
          >
            <option value="">-- Seleccionar proveedor --</option>
            {proveedores.map((p) => (
              <option key={p.rif || p._id} value={p.rif}>{p.empresa || p.nombre} ({p.rif})</option>
            ))}
          </select>
          <label className="btn-secondary" style={{ cursor: proveedorSel ? 'pointer' : 'not-allowed', opacity: proveedorSel ? 1 : 0.6 }}>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUploadExcel}
              disabled={!proveedorSel || subiendo}
              style={{ display: 'none' }}
            />
            {subiendo ? 'Subiendo…' : 'Cargar Excel'}
          </label>
        </div>
      </section>

      <section className="admin-section">
        <h2>Buscador comparativo</h2>
        <input
          type="text"
          placeholder="Buscar por código, descripción, marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="crear-pedido-search lista-comparativa-search"
        />

        {loading && <p className="catalogo-loading">Cargando...</p>}
        {!loading && busqueda.trim() && (
          <div className="lista-comparativa-resultados">
            {resultados.length === 0 ? (
              <p className="catalogo-empty">No se encontraron productos.</p>
            ) : (
              <div className="lista-comparativa-grid">
                <div className="lista-comparativa-tabla-wrap">
                  <table className="admin-table admin-table-wide">
                    <thead>
                      <tr>
                        <th>Proveedor</th>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Marca</th>
                        <th>Precio (con desc.)</th>
                        <th>Existencia</th>
                        <th>Mejor precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(porProducto).flatMap(([cod, items]) =>
                        items.map((r, idx) => (
                          <tr
                            key={`${r.proveedor_id || r.proveedor}_${cod}_${idx}`}
                            className={idx === 0 ? 'mejor-precio' : ''}
                          >
                            <td>{r.proveedor_empresa || r.proveedor_nombre || '—'}</td>
                            <td>{r.codigo || cod}</td>
                            <td>{r.descripcion || r.nombre || '—'}</td>
                            <td>{r.marca || '—'}</td>
                            <td>Bs. {typeof r.precio_final === 'number' ? r.precio_final.toFixed(2) : (r.precio ?? '—')}</td>
                            <td>{r.existencia ?? '—'}</td>
                            <td>{idx === 0 ? '✓' : ''}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="lista-comparativa-inventario">
                  <h3>Mi existencia</h3>
                  <div className="inventario-lista">
                    {Object.keys(porProducto).map((cod) => {
                      const items = porProducto[cod]
                      const primero = items[0]
                      const existencia = getExistenciaPropia(cod)
                      return (
                        <div key={cod} className="inventario-item">
                          <span className="inv-codigo">{cod}</span>
                          <span className="inv-desc">{primero?.descripcion || primero?.nombre || '—'}</span>
                          <span className="inv-exist">{existencia}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
