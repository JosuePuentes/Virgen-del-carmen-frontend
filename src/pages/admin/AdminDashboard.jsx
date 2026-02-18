import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, getAdminToken, getAdminModulos } from '../../config/api'

export default function AdminDashboard() {
  const [solicitudes, setSolicitudes] = useState(0)
  const [pedidosAdmin, setPedidosAdmin] = useState(0)
  const [pedidosPicking, setPedidosPicking] = useState(0)
  const [loading, setLoading] = useState(true)
  const modulos = getAdminModulos()
  const hasModulo = (m) => !modulos?.length || modulos.includes(m)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      try {
        const token = getAdminToken()
        const [sol, admin, picking] = await Promise.all([
          apiGet('clientes/solicitudes/pendientes', token).catch(() => []),
          apiGet('pedidos/administracion/', token).catch(() => []),
          apiGet('pedidos/picking/', token).catch(() => []),
        ])
        setSolicitudes(Array.isArray(sol) ? sol.length : sol?.length ?? 0)
        setPedidosAdmin(Array.isArray(admin) ? admin.length : admin?.length ?? 0)
        setPedidosPicking(Array.isArray(picking) ? picking.length : picking?.length ?? 0)
      } catch {
        setSolicitudes(0)
        setPedidosAdmin(0)
        setPedidosPicking(0)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      <p className="admin-welcome">Resumen del panel.</p>
      {loading ? (
        <p className="catalogo-loading">Cargando...</p>
      ) : (
        <div className="admin-dashboard-stats">
          {hasModulo('solicitudes_clientes') && (
            <Link to="/admin/solicitudes" className="admin-stat-card">
              <span className="admin-stat-num">{solicitudes}</span>
              <span>Solicitudes pendientes</span>
            </Link>
          )}
          {hasModulo('pedidos') && (
            <>
              <Link to="/admin/pedidos/administracion" className="admin-stat-card">
                <span className="admin-stat-num">{pedidosAdmin}</span>
                <span>Pedidos por validar</span>
              </Link>
              <Link to="/admin/pedidos/picking" className="admin-stat-card">
                <span className="admin-stat-num">{pedidosPicking}</span>
                <span>En picking</span>
              </Link>
            </>
          )}
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
              <h3>Pedidos – Admin</h3>
              <p>Validar y enviar a picking</p>
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
            <p>Productos y existencias</p>
          </Link>
        )}
        {hasModulo('clientes') && (
          <Link to="/admin/clientes" className="admin-card">
            <span className="admin-card-icon">👥</span>
            <h3>Clientes</h3>
            <p>Listar, crear y editar</p>
          </Link>
        )}
        <Link to="/admin/usuarios" className="admin-card">
          <span className="admin-card-icon">👤</span>
          <h3>Usuarios</h3>
          <p>Crear usuario admin</p>
        </Link>
      </div>
    </div>
  )
}
