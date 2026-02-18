import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPost, getAdminToken } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function AdminCompras() {
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [proveedorSel, setProveedorSel] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const inputBusqueda = useRef(null)

  useEffect(() => {
    async function cargar() {
      try {
        const [prov, prod] = await Promise.all([
          apiGet('proveedores/', getAdminToken()),
          apiGet('inventario_maestro/', getAdminToken()),
        ])
        setProveedores(Array.isArray(prov) ? prov : prov?.proveedores || prov?.items || [])
        setProductos(Array.isArray(prod) ? prod : prod?.items || prod?.productos || [])
      } catch (err) {
        setError(err.message || 'Error al cargar')
      }
    }
    cargar()
  }, [])

  const productosFiltrados = productos.filter((p) => {
    const t = [p.codigo, p.descripcion, p.nombre, p.marca].filter(Boolean).join(' ').toLowerCase()
    return t.includes(busqueda.toLowerCase())
  })

  function agregarAlCarrito(p, cant = 1) {
    const cod = p.codigo || p._id
    const existe = carrito.find((x) => (x.codigo || x._id) === cod)
    if (existe) {
      setCarrito(carrito.map((x) => (x.codigo || x._id) === cod ? { ...x, cantidad: (x.cantidad || 0) + cant } : x))
    } else {
      setCarrito([...carrito, {
        codigo: cod,
        descripcion: p.descripcion || p.nombre,
        costo: p.costo || 0,
        cantidad: cant,
      }])
    }
  }

  function quitarDelCarrito(codigo) {
    setCarrito(carrito.filter((x) => (x.codigo || x._id) !== codigo))
  }

  function cambiarCantidad(codigo, cant) {
    setCarrito(carrito.map((x) => (x.codigo || x._id) === codigo ? { ...x, cantidad: Math.max(0, Number(cant) || 0) } : x))
  }

  const total = carrito.reduce((s, i) => s + (i.costo || 0) * (i.cantidad || 0), 0)

  async function generarOrdenCompra(e) {
    e.preventDefault()
    if (!proveedorSel) {
      setError('Seleccione un proveedor')
      return
    }
    if (carrito.length === 0) {
      setError('Agregue al menos un producto')
      return
    }
    setError('')
    setExito('')
    setLoading(true)
    try {
      await apiPost('ordenes-compra/', {
        proveedor_id: proveedorSel._id || proveedorSel.id,
        proveedor_rif: proveedorSel.rif,
        productos: carrito.map((i) => ({
          codigo: i.codigo,
          descripcion: i.descripcion,
          costo: i.costo,
          cantidad: i.cantidad,
        })),
        total,
      }, getAdminToken())
      setExito('Orden de compra creada.')
      setCarrito([])
    } catch (err) {
      setError(err.message || 'Error al crear orden')
    } finally {
      setLoading(false)
    }
  }

  async function totalizarCompra(e) {
    e.preventDefault()
    if (!proveedorSel) {
      setError('Seleccione un proveedor')
      return
    }
    if (carrito.length === 0) {
      setError('Agregue al menos un producto')
      return
    }
    setError('')
    setExito('')
    setLoading(true)
    try {
      await apiPost('compras/totalizar', {
        proveedor_id: proveedorSel._id || proveedorSel.id,
        productos: carrito.map((i) => ({
          codigo: i.codigo,
          cantidad: i.cantidad,
        })),
      }, getAdminToken())
      setExito('Compra totalizada. Inventario actualizado.')
      setCarrito([])
    } catch (err) {
      setError(err.message || 'Error al totalizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page admin-crear-pedido">
      <h1>Compras</h1>
      <p className="admin-welcome">Seleccione proveedor, busque productos y arme la compra. Genere orden de compra o totalice para sumar al inventario. <Link to="/admin/inventario">Crear producto</Link></p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      <div className="crear-pedido-grid">
        <section className="crear-pedido-cliente">
          <h3>1. Proveedor</h3>
          <select
            value={proveedorSel?.rif || ''}
            onChange={(e) => setProveedorSel(proveedores.find((p) => p.rif === e.target.value) || null)}
          >
            <option value="">-- Seleccionar --</option>
            {proveedores.map((p) => (
              <option key={p.rif || p._id} value={p.rif}>{p.empresa || p.nombre} ({p.rif})</option>
            ))}
          </select>
        </section>

        <section className="crear-pedido-buscar">
          <h3>2. Buscar productos</h3>
          <input
            ref={inputBusqueda}
            type="text"
            placeholder="Código, descripción, marca..."
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
                <span>Exist: {p.existencia ?? '—'}</span>
                <button type="button" className="btn-aprobar btn-sm" onClick={() => agregarAlCarrito(p)}>+</button>
              </div>
            ))}
          </div>
        </section>

        <section className="crear-pedido-carrito">
          <h3>3. Carrito de compra</h3>
          <div className="carrito-lista">
            {carrito.length === 0 ? (
              <p className="catalogo-empty">Vacío</p>
            ) : (
              carrito.map((i) => (
                <div key={i.codigo} className="carrito-item">
                  <span>{i.descripcion}</span>
                  <input type="number" min="1" value={i.cantidad} onChange={(e) => cambiarCantidad(i.codigo, e.target.value)} className="carrito-cant" />
                  <span><Precio value={(i.costo || 0) * (i.cantidad || 0)} /></span>
                  <button type="button" className="btn-rechazar btn-sm" onClick={() => quitarDelCarrito(i.codigo)}>×</button>
                </div>
              ))
            )}
          </div>
          <p className="carrito-total"><strong>Total: <Precio value={total} /></strong></p>
          <div className="compras-btns">
            <button type="button" className="btn-hero" onClick={generarOrdenCompra} disabled={loading || !proveedorSel || carrito.length === 0}>
              {loading ? '…' : 'Generar orden de compra'}
            </button>
            <button type="button" className="btn-aprobar" onClick={totalizarCompra} disabled={loading || !proveedorSel || carrito.length === 0}>
              {loading ? '…' : 'Totalizar compra'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
