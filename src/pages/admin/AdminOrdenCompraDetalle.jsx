import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiGet, apiPost, apiPut, getAdminToken } from '../../config/api'

export default function AdminOrdenCompraDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orden, setOrden] = useState(null)
  const [productos, setProductos] = useState([])
  const [proveedorSel, setProveedorSel] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    async function cargar() {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const [o, prod] = await Promise.all([
          apiGet(`ordenes-compra/${id}`, getAdminToken()),
          apiGet('inventario_maestro/', getAdminToken()),
        ])
        setOrden(o)
        setProveedorSel(o?.proveedor || { rif: o?.proveedor_rif, empresa: o?.proveedor_empresa })
        setProductos(Array.isArray(prod) ? prod : prod?.items || prod?.productos || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  const items = orden?.productos || orden?.items || []
  const productosFiltrados = productos.filter((p) => {
    const t = [p.codigo, p.descripcion, p.nombre, p.marca].filter(Boolean).join(' ').toLowerCase()
    return t.includes(busqueda.toLowerCase())
  })

  function agregarAlCarrito(p, cant = 1) {
    const cod = p.codigo || p._id
    const existe = items.find((x) => (x.codigo || x._id) === cod)
    if (existe) {
      setOrden({
        ...orden,
        productos: items.map((x) => (x.codigo || x._id) === cod ? { ...x, cantidad: (x.cantidad || 0) + cant } : x),
      })
    } else {
      setOrden({
        ...orden,
        productos: [...items, { codigo: cod, descripcion: p.descripcion || p.nombre, costo: p.costo || 0, cantidad: cant }],
      })
    }
  }

  function quitarDelCarrito(codigo) {
    setOrden({ ...orden, productos: items.filter((x) => (x.codigo || x._id) !== codigo) })
  }

  function cambiarCantidad(codigo, cant) {
    setOrden({
      ...orden,
      productos: items.map((x) => (x.codigo || x._id) === codigo ? { ...x, cantidad: Math.max(0, Number(cant) || 0) } : x),
    })
  }

  const total = items.reduce((s, i) => s + (i.costo || 0) * (i.cantidad || 0), 0)

  async function guardarCambios(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setGuardando(true)
    try {
      await apiPut(`ordenes-compra/${id}`, {
        productos: items,
        total,
      }, getAdminToken())
      setExito('Orden actualizada.')
      setOrden({ ...orden, productos: items, total })
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function totalizarCompra(e) {
    e.preventDefault()
    if (!confirm('¿Totalizar esta orden? Se sumarán las cantidades al inventario.')) return
    setError('')
    setExito('')
    setGuardando(true)
    try {
      await apiPost(`ordenes-compra/${id}/totalizar`, {}, getAdminToken())
      setExito('Orden totalizada. Inventario actualizado.')
      navigate('/admin/ordenes-compra')
    } catch (err) {
      setError(err.message || 'Error al totalizar')
    } finally {
      setGuardando(false)
    }
  }

  if (loading || !orden) {
    return <div className="admin-page"><p className="catalogo-loading">Cargando...</p></div>
  }

  if (orden.totalizada || orden.estado === 'totalizada') {
    return (
      <div className="admin-page">
        <h1>Orden #{String(id).slice(-8)}</h1>
        <p className="catalogo-empty">Esta orden ya fue totalizada.</p>
        <Link to="/admin/ordenes-compra" className="btn-secondary">Volver</Link>
      </div>
    )
  }

  return (
    <div className="admin-page admin-crear-pedido">
      <h1>Editar orden de compra #{String(id).slice(-8)}</h1>
      <p className="admin-welcome">Proveedor: {orden.proveedor_empresa || orden.proveedor_rif || '—'}</p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      <div className="crear-pedido-grid">
        <section className="crear-pedido-buscar">
          <h3>Agregar productos</h3>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="crear-pedido-search"
          />
          <div className="crear-pedido-lista">
            {productosFiltrados.slice(0, 15).map((p) => (
              <div key={p.codigo || p._id} className="crear-pedido-item">
                <span>{p.codigo}</span>
                <span>{p.descripcion || p.nombre}</span>
                <span>Costo: {typeof p.costo === 'number' ? p.costo.toFixed(2) : p.costo ?? '—'}</span>
                <button type="button" className="btn-aprobar btn-sm" onClick={() => agregarAlCarrito(p)}>+</button>
              </div>
            ))}
          </div>
        </section>

        <section className="crear-pedido-carrito">
          <h3>Productos en la orden</h3>
          <div className="carrito-lista">
            {items.length === 0 ? (
              <p className="catalogo-empty">Vacío</p>
            ) : (
              items.map((i) => (
                <div key={i.codigo} className="carrito-item">
                  <span>{i.descripcion}</span>
                  <input type="number" min="1" value={i.cantidad} onChange={(e) => cambiarCantidad(i.codigo, e.target.value)} className="carrito-cant" />
                  <span>Bs. {((i.costo || 0) * (i.cantidad || 0)).toFixed(2)}</span>
                  <button type="button" className="btn-rechazar btn-sm" onClick={() => quitarDelCarrito(i.codigo)}>×</button>
                </div>
              ))
            )}
          </div>
          <p className="carrito-total"><strong>Total: Bs. {total.toFixed(2)}</strong></p>
          <div className="compras-btns">
            <button type="button" className="btn-hero" onClick={guardarCambios} disabled={guardando || items.length === 0}>
              {guardando ? '…' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn-aprobar" onClick={totalizarCompra} disabled={guardando || items.length === 0}>
              {guardando ? '…' : 'Totalizar compra'}
            </button>
          </div>
        </section>
      </div>

      <p><Link to="/admin/ordenes-compra" className="btn-secondary">← Volver a órdenes</Link></p>
    </div>
  )
}
