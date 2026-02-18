import { useState, useEffect } from 'react'
import { apiGet, getAdminToken } from '../../config/api'

export default function AdminControlFallas() {
  const [fallas, setFallas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [pedidoFiltro, setPedidoFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const [dataFallas, dataPedidos] = await Promise.all([
        apiGet('fallas/', getAdminToken()).catch(() => []),
        apiGet('pedidos/', getAdminToken()).catch(() => []),
      ])
      setFallas(Array.isArray(dataFallas) ? dataFallas : dataFallas?.fallas || dataFallas?.items || [])
      const peds = Array.isArray(dataPedidos) ? dataPedidos : dataPedidos?.pedidos || dataPedidos?.items || []
      setPedidos(peds)
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

  return (
    <div className="admin-page">
      <h1>Control de fallas</h1>
      <p className="admin-welcome">Productos donde cantidad pedida &gt; cantidad encontrada.</p>
      {error && <p className="auth-error">{error}</p>}

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
                </tr>
              </thead>
              <tbody>
                {fallasFiltradas.map((f, i) => {
                  const ped = f.cantidad_pedida ?? f.pedida ?? 0
                  const enc = f.cantidad_encontrada ?? f.encontrada ?? 0
                  const falt = Math.max(0, ped - enc)
                  return (
                    <tr key={f._id || f.id || i}>
                      <td>{String(f.pedido_id || f.pedido || '—').slice(-8)}</td>
                      <td>{f.codigo || f.producto_codigo || '—'}</td>
                      <td>{f.descripcion || f.producto_desc || '—'}</td>
                      <td>{ped}</td>
                      <td>{enc}</td>
                      <td className="falla-faltante">{falt}</td>
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
