import { useState, useEffect } from 'react'
import { apiGet, apiPatch, getAdminToken } from '../../config/api'

export default function AdminControlFallas() {
  const [fallas, setFallas] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [pedidoFiltro, setPedidoFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const [dataFallas, dataProv] = await Promise.all([
        apiGet('fallas/', getAdminToken()).catch(() => []),
        apiGet('proveedores/', getAdminToken()).catch(() => []),
      ])
      setFallas(Array.isArray(dataFallas) ? dataFallas : dataFallas?.fallas || dataFallas?.items || [])
      setProveedores(Array.isArray(dataProv) ? dataProv : dataProv?.proveedores || dataProv?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
      setFallas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const fallasFiltradas = pedidoFiltro
    ? fallas.filter((f) => String(f.pedido_id || f.pedido).includes(pedidoFiltro))
    : fallas

  async function actualizarFalla(fallaId, proveedorId, precioVenta) {
    setError('')
    setExito('')
    try {
      await apiPatch(`fallas/${fallaId}`, {
        proveedor_id: proveedorId || undefined,
        precio_venta: precioVenta !== '' ? Number(precioVenta) : undefined,
      }, getAdminToken())
      setExito('Actualizado.')
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al actualizar')
    }
  }

  return (
    <div className="admin-page">
      <h1>Control de fallas</h1>
      <p className="admin-welcome">Productos donde cantidad pedida &gt; cantidad encontrada. Marque proveedor y precio de venta.</p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      <div className="admin-filtro">
        <label>
          Filtrar por pedido:
          <input
            type="text"
            placeholder="ID pedido..."
            value={pedidoFiltro}
            onChange={(e) => setPedidoFiltro(e.target.value)}
          />
        </label>
      </div>

      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <div className="admin-table-wrap">
          {fallasFiltradas.length === 0 ? (
            <p className="catalogo-empty">No hay fallas registradas.</p>
          ) : (
            <table className="admin-table admin-table-wide">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Pedida</th>
                  <th>Encontrada</th>
                  <th>Faltante</th>
                  <th>Proveedor</th>
                  <th>Precio venta</th>
                </tr>
              </thead>
              <tbody>
                {fallasFiltradas.map((f, i) => {
                  const ped = f.cantidad_pedida ?? f.pedida ?? 0
                  const enc = f.cantidad_encontrada ?? f.encontrada ?? 0
                  const falt = Math.max(0, ped - enc)
                  const fallaId = f._id || f.id
                  return (
                    <tr key={fallaId || i}>
                      <td>{String(f.pedido_id || f.pedido || '—').slice(-8)}</td>
                      <td>{f.codigo || f.producto_codigo || '—'}</td>
                      <td>{f.descripcion || f.producto_desc || '—'}</td>
                      <td>{ped}</td>
                      <td>{enc}</td>
                      <td className="falla-faltante">{falt}</td>
                      <td>
                        <select
                          value={f.proveedor_id || ''}
                          onChange={(e) => actualizarFalla(fallaId, e.target.value || null, f.precio_venta)}
                          className="falla-select"
                        >
                          <option value="">-- Seleccionar --</option>
                          {proveedores.map((p) => (
                            <option key={p._id || p.id} value={p._id || p.id}>{p.empresa || p.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Precio"
                          value={f.precio_venta ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setFallas((prev) => prev.map((x) => (x._id || x.id) === fallaId ? { ...x, precio_venta: val } : x))
                          }}
                          onBlur={(e) => actualizarFalla(fallaId, f.proveedor_id, e.target.value)}
                          className="falla-precio-input"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
