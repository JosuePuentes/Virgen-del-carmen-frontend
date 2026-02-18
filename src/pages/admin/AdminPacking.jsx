import { useState, useEffect, useRef } from 'react'
import { apiGet, apiPatch, apiPut, getAdminToken, getAdminUser } from '../../config/api'

export default function AdminPacking() {
  const [pedidos, setPedidos] = useState([])
  const [pedidoSel, setPedidoSel] = useState(null)
  const [productos, setProductos] = useState([])
  const [codigoBarra, setCodigoBarra] = useState('')
  const [cantidades, setCantidades] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionando, setAccionando] = useState(false)
  const inputBarra = useRef(null)

  async function cargarPedidos() {
    setLoading(true)
    try {
      const data = await apiGet('pedidos/por_estado/packing', getAdminToken())
      setPedidos(Array.isArray(data) ? data : data?.pedidos || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarPedidos() }, [])

  useEffect(() => {
    if (!pedidoSel) {
      setProductos([])
      setCantidades({})
      return
    }
    async function cargarDetalle() {
      const id = pedidoSel._id || pedidoSel.id
      if (!id) return
      try {
        const det = await apiGet(`pedidos/${id}`, getAdminToken()).catch(() => pedidoSel)
        const prods = det?.productos || pedidoSel.productos || []
        setProductos(prods)
        const ini = {}
        prods.forEach((p) => {
          const cod = p.codigo || p._id
          ini[cod] = p.cantidad_encontrada ?? p.cantidad_pedida ?? p.cantidad ?? 0
        })
        setCantidades(ini)
      } catch {
        const prods = pedidoSel.productos || []
        setProductos(prods)
        const ini = {}
        prods.forEach((p) => {
          const cod = p.codigo || p._id
          ini[cod] = p.cantidad_encontrada ?? p.cantidad_pedida ?? 0
        })
        setCantidades(ini)
      }
    }
    cargarDetalle()
  }, [pedidoSel])

  function handleBarra(e) {
    e.preventDefault()
    const cod = codigoBarra.trim()
    if (!cod) return
    const p = productos.find((x) => (x.codigo || x._id || '').toString() === cod)
    if (p) {
      inputBarra.current?.focus()
      setCodigoBarra('')
    }
  }

  function cambiarCantidad(cod, val) {
    setCantidades((prev) => ({ ...prev, [cod]: Math.max(0, Number(val) || 0) }))
  }

  async function pasarAFacturacion() {
    if (!pedidoSel) return
    setAccionando(true)
    try {
      const body = {}
      Object.keys(cantidades).forEach((cod) => {
        body[cod] = cantidades[cod] ?? 0
      })
      await apiPatch(`pedidos/actualizar_cantidades/${pedidoSel._id || pedidoSel.id}`, { cantidades: body }, getAdminToken())
      await apiPut(`pedidos/actualizar_estado/${pedidoSel._id || pedidoSel.id}`, {
        nuevo_estado: 'para_facturar',
        verificaciones: {},
        usuario: getAdminUser()?.usuario || 'admin',
      }, getAdminToken())
      setPedidoSel(null)
      await cargarPedidos()
    } catch (err) {
      setError(err.message || 'Error')
    } finally {
      setAccionando(false)
    }
  }

  return (
    <div className="admin-page">
      <h1>Packing</h1>
      <p className="admin-welcome">Verificación de productos antes de facturación. Escanee o ingrese cantidades, luego pase a facturación.</p>
      {error && <p className="auth-error">{error}</p>}

      {!pedidoSel ? (
        <>
          {loading && <p className="catalogo-loading">Cargando...</p>}
          {!loading && (
            <div className="admin-table-wrap">
              {pedidos.length === 0 ? (
                <p className="catalogo-empty">No hay pedidos en packing.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Monto</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p._id || p.id}>
                        <td>{String(p._id || p.id).slice(-8)}</td>
                        <td>{p.cliente || p.rif}</td>
                        <td>Bs. {typeof p.total === 'number' ? p.total.toFixed(2) : p.total}</td>
                        <td>
                          <button type="button" className="btn-aprobar" onClick={() => setPedidoSel(p)}>Seleccionar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="picking-activo">
          <div className="picking-header">
            <h3>Pedido #{String(pedidoSel._id || pedidoSel.id).slice(-8)} – {pedidoSel.cliente || pedidoSel.rif}</h3>
            <p>Total: Bs. {typeof pedidoSel.total === 'number' ? pedidoSel.total.toFixed(2) : pedidoSel.total}</p>
            <button type="button" className="btn-secondary" onClick={() => setPedidoSel(null)}>Cambiar pedido</button>
          </div>

          <form onSubmit={handleBarra} className="picking-barra">
            <input
              ref={inputBarra}
              type="text"
              placeholder="Código de barra..."
              value={codigoBarra}
              onChange={(e) => setCodigoBarra(e.target.value)}
              autoFocus
            />
            <button type="submit">Buscar</button>
          </form>

          <div className="picking-productos">
            {productos.map((p) => {
              const cod = p.codigo || p._id
              const cantPedida = p.cantidad_pedida ?? p.cantidad ?? 0
              const cantEncontrada = cantidades[cod] ?? 0
              const seleccionado = cantEncontrada > 0
              return (
                <div key={cod} className={`picking-producto-item ${seleccionado ? 'seleccionado' : ''}`}>
                  <span className="picking-codigo">{cod}</span>
                  <span className="picking-desc">{p.descripcion || p.nombre}</span>
                  <span className="picking-pedida">Pedida: {cantPedida}</span>
                  <input
                    type="number"
                    min="0"
                    value={cantEncontrada}
                    onChange={(e) => cambiarCantidad(cod, e.target.value)}
                    placeholder="Verificada"
                    className="picking-cant"
                  />
                </div>
              )
            })}
          </div>

          <div className="picking-footer">
            <button
              type="button"
              className="btn-hero"
              onClick={pasarAFacturacion}
              disabled={accionando || productos.length === 0}
            >
              {accionando ? '…' : 'Pasar a facturación'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
