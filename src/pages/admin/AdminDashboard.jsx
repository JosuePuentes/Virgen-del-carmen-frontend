import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, getAdminToken, getAdminModulos } from '../../config/api'
import { useBcv } from '../../context/BcvContext'
import { Precio } from '../../components/Precio'

const ESTADOS = [
  { key: 'nuevo', label: 'En espera', ruta: 'administracion' },
  { key: 'picking', label: 'Picking', ruta: 'picking' },
  { key: 'packing', label: 'Packing', ruta: 'packing' },
  { key: 'enviado', label: 'Enviados', ruta: 'envios' },
  { key: 'entregado', label: 'Entregados', ruta: 'envios' },
]

export default function AdminDashboard() {
  const { bcv, setBcvLocal, guardarBcv, loading: bcvLoading } = useBcv()
  const [pedidosPorEstado, setPedidosPorEstado] = useState({})
  const [loading, setLoading] = useState(true)
  const [bcvEdit, setBcvEdit] = useState('')
  const [bcvExito, setBcvExito] = useState('')
  const modulos = getAdminModulos()
  const hasModulo = (m) => !modulos?.length || modulos.includes(m)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      try {
        const token = getAdminToken()
        const resultados = {}
        for (const e of ESTADOS) {
          try {
            const data = e.key === 'nuevo'
              ? await apiGet('pedidos/administracion/', token)
              : await apiGet(`pedidos/por_estado/${e.key}`, token)
            resultados[e.key] = Array.isArray(data) ? data : data?.pedidos || data?.items || []
          } catch {
            resultados[e.key] = []
          }
        }
        setPedidosPorEstado(resultados)
      } catch {
        setPedidosPorEstado({})
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-bcv-card">
        <h3>💵 Tasa BCV (Dólar)</h3>
        <div className="dashboard-bcv-valor">
          <span className="bcv-actual">1 USD = Bs. {bcv.toFixed(4)}</span>
          <div className="bcv-editar">
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              placeholder={bcv.toFixed(4)}
              value={bcvEdit}
              onChange={(e) => setBcvEdit(e.target.value)}
              onBlur={async () => {
                const v = parseFloat(bcvEdit)
                if (Number.isFinite(v) && v > 0) {
                  const ok = await guardarBcv(v)
                  setBcvEdit('')
                  if (ok) { setBcvExito('Tasa BCV actualizada'); setTimeout(() => setBcvExito(''), 3000) }
                }
              }}
            />
            <button
              type="button"
              disabled={bcvLoading || !bcvEdit}
              onClick={async () => {
                const v = parseFloat(bcvEdit)
                if (Number.isFinite(v) && v > 0) {
                  const ok = await guardarBcv(v)
                  setBcvEdit('')
                  if (ok) { setBcvExito('Tasa BCV actualizada'); setTimeout(() => setBcvExito(''), 3000) }
                }
              }}
            >
              {bcvLoading ? 'Guardando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        <p className="bcv-hint">Todos los precios se muestran en $ USD y Bs (Bs = $ × BCV)</p>
        {bcvExito && <p className="auth-success">{bcvExito}</p>}
      </div>
      <p className="admin-welcome">Historial de pedidos por estado.</p>
      {loading ? (
        <p className="catalogo-loading">Cargando...</p>
      ) : (
        <div className="dashboard-estados">
          {ESTADOS.filter((e) => e.key !== 'nuevo' || hasModulo('pedidos')).map((e) => {
            const lista = pedidosPorEstado[e.key] || []
            return (
              <section key={e.key} className="dashboard-estado-card">
                <h3>
                  {e.label} ({lista.length})
                  {hasModulo('pedidos') && (
                    <Link to={`/admin/pedidos/${e.ruta}`} className="dashboard-link">Ver</Link>
                  )}
                </h3>
                <div className="dashboard-lista">
                  {lista.length === 0 ? (
                    <p className="catalogo-empty">Ninguno</p>
                  ) : (
                    lista.slice(0, 5).map((p) => (
                      <div key={p._id || p.id} className="dashboard-pedido-item">
                        <span className="pedido-id">#{String(p._id || p.id).slice(-6)}</span>
                        <span>{p.cliente || p.rif || '—'}</span>
                        <span><Precio value={p.total} /></span>
                      </div>
                    ))
                  )}
                  {lista.length > 5 && <p className="dashboard-more">+{lista.length - 5} más</p>}
                </div>
              </section>
            )
          })}
        </div>
      )}
      <div className="admin-cards">
        {hasModulo('solicitudes_clientes') && (
          <Link to="/admin/solicitudes" className="admin-card">
            <span className="admin-card-icon">📝</span>
            <h3>Solicitudes</h3>
            <p>Aprobar o rechazar nuevos clientes</p>
          </Link>
        )}
        {hasModulo('pedidos') && (
          <>
            <Link to="/admin/pedidos/administracion" className="admin-card">
              <span className="admin-card-icon">📦</span>
              <h3>Validación</h3>
              <p>Pedidos por validar</p>
            </Link>
            <Link to="/admin/pedidos/crear" className="admin-card">
              <span className="admin-card-icon">➕</span>
              <h3>Crear pedido</h3>
              <p>Nuevo pedido manual</p>
            </Link>
          </>
        )}
        {hasModulo('inventario') && (
          <Link to="/admin/inventario" className="admin-card">
            <span className="admin-card-icon">📋</span>
            <h3>Inventario</h3>
            <p>Productos y cargas</p>
          </Link>
        )}
        {hasModulo('clientes') && (
          <Link to="/admin/clientes" className="admin-card">
            <span className="admin-card-icon">👥</span>
            <h3>Clientes</h3>
            <p>Listar y crear</p>
          </Link>
        )}
        <Link to="/admin/usuarios" className="admin-card">
          <span className="admin-card-icon">👤</span>
          <h3>Usuarios</h3>
          <p>Crear usuario admin</p>
        </Link>
        <Link to="/admin/finanzas" className="admin-card">
          <span className="admin-card-icon">💰</span>
          <h3>Finanzas</h3>
          <p>Ventas y utilidad</p>
        </Link>
        <Link to="/admin/gastos" className="admin-card">
          <span className="admin-card-icon">📉</span>
          <h3>Gastos</h3>
          <p>Registrar gastos</p>
        </Link>
        <Link to="/admin/cierre-diario" className="admin-card">
          <span className="admin-card-icon">📊</span>
          <h3>Cierre diario</h3>
          <p>Resumen por fechas</p>
        </Link>
      </div>
    </div>
  )
}
