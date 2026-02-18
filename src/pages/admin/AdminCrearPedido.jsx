import { useState, useEffect, useRef } from 'react'
import { apiGet, apiPost, getAdminToken } from '../../config/api'
import { Precio } from '../../components/Precio'

export default function AdminCrearPedido() {
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [clienteSel, setClienteSel] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])
  const [observacion, setObservacion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputBusqueda = useRef(null)

  useEffect(() => {
    async function cargar() {
      try {
        const [c, p] = await Promise.all([
          apiGet('clientes/all', getAdminToken()).catch(() => apiGet('clientes/', getAdminToken())),
          apiGet('inventario_maestro/', getAdminToken()),
        ])
        setClientes(Array.isArray(c) ? c : c?.clientes || c?.items || [])
        setProductos(Array.isArray(p) ? p : p?.items || p?.productos || [])
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
    const existe = carrito.find((x) => (x.codigo || x._id) === (p.codigo || p._id))
    if (existe) {
      setCarrito(carrito.map((x) => x.codigo === p.codigo ? { ...x, cantidad_pedida: (x.cantidad_pedida || 0) + cant } : x))
    } else {
      setCarrito([...carrito, {
        codigo: p.codigo || p._id,
        descripcion: p.descripcion || p.nombre,
        precio: p.precio || 0,
        cantidad_pedida: cant,
        descuento1: 0, descuento2: 0, descuento3: 0, descuento4: 0,
      }])
    }
  }

  function quitarDelCarrito(codigo) {
    setCarrito(carrito.filter((x) => (x.codigo || x._id) !== codigo))
  }

  function cambiarCantidad(codigo, cant) {
    setCarrito(carrito.map((x) => (x.codigo || x._id) === codigo ? { ...x, cantidad_pedida: Math.max(0, Number(cant) || 0) } : x))
  }

  const subtotal = carrito.reduce((s, i) => s + (i.precio || 0) * (i.cantidad_pedida || 0), 0)
  const total = subtotal

  async function handleCrear(e) {
    e.preventDefault()
    if (!clienteSel) {
      setError('Seleccione un cliente')
      return
    }
    if (carrito.length === 0) {
      setError('Agregue al menos un producto')
      return
    }
    setError('')
    setLoading(true)
    try {
      await apiPost('pedidos/', {
        rif: clienteSel.rif,
        cliente: clienteSel.encargado || clienteSel.empresa || clienteSel.rif,
        observacion: observacion,
        total,
        subtotal,
        productos: carrito.map((i) => ({
          codigo: i.codigo,
          descripcion: i.descripcion,
          precio: i.precio,
          cantidad_pedida: i.cantidad_pedida,
          descuento1: i.descuento1 || 0,
          descuento2: i.descuento2 || 0,
          descuento3: i.descuento3 || 0,
          descuento4: i.descuento4 || 0,
        })),
      }, getAdminToken())
      alert('Pedido creado. Irá a validación.')
      setCarrito([])
      setObservacion('')
    } catch (err) {
      setError(err.message || 'Error al crear')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page admin-crear-pedido">
      <h1>Crear pedido</h1>
      <p className="admin-welcome">Seleccione cliente, busque productos y agregue al carrito. No se muestra costo ni utilidad.</p>
      {error && <p className="auth-error">{error}</p>}

      <div className="crear-pedido-grid">
        <section className="crear-pedido-cliente">
          <h3>1. Cliente</h3>
          <select value={clienteSel?.rif || ''} onChange={(e) => setClienteSel(clientes.find((c) => c.rif === e.target.value) || null)}>
            <option value="">-- Seleccionar --</option>
            {clientes.map((c) => (
              <option key={c.rif || c._id} value={c.rif}>{c.empresa || c.encargado || c.rif} ({c.rif})</option>
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
                <span><Precio value={p.precio} /></span>
                <span>Exist: {p.existencia ?? '—'}</span>
                <button type="button" className="btn-aprobar btn-sm" onClick={() => agregarAlCarrito(p)}>+</button>
              </div>
            ))}
          </div>
        </section>

        <section className="crear-pedido-carrito">
          <h3>3. Carrito</h3>
          <div className="carrito-lista">
            {carrito.length === 0 ? (
              <p className="catalogo-empty">Vacío</p>
            ) : (
              carrito.map((i) => (
                <div key={i.codigo} className="carrito-item">
                  <span>{i.descripcion}</span>
                  <input type="number" min="1" value={i.cantidad_pedida} onChange={(e) => cambiarCantidad(i.codigo, e.target.value)} className="carrito-cant" />
                  <span><Precio value={(i.precio || 0) * (i.cantidad_pedida || 0)} /></span>
                  <button type="button" className="btn-rechazar btn-sm" onClick={() => quitarDelCarrito(i.codigo)}>×</button>
                </div>
              ))
            )}
          </div>
          <p className="carrito-total"><strong>Total: <Precio value={total} /></strong></p>
          <label>
            Observación
            <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} rows="2" />
          </label>
          <button type="button" className="btn-hero" onClick={handleCrear} disabled={loading || !clienteSel || carrito.length === 0}>
            {loading ? 'Creando…' : 'Crear pedido'}
          </button>
        </section>
      </div>
    </div>
  )
}
