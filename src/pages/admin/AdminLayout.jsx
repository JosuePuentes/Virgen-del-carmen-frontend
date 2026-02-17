import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { getAdminUser, logoutAdmin } from '../../config/api'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getAdminUser()

  function handleLogout() {
    logoutAdmin()
    navigate('/admin/login')
    window.location.reload()
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-logo">⚕</span>
          <span>Panel Admin</span>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
            Inicio
          </Link>
          <Link to="/admin/solicitudes" className={location.pathname.startsWith('/admin/solicitudes') ? 'active' : ''}>
            Solicitudes
          </Link>
          <Link to="/admin/pedidos" className={location.pathname.startsWith('/admin/pedidos') ? 'active' : ''}>
            Pedidos
          </Link>
          <Link to="/admin/inventario" className={location.pathname.startsWith('/admin/inventario') ? 'active' : ''}>
            Inventario
          </Link>
          <Link to="/admin/clientes" className={location.pathname.startsWith('/admin/clientes') ? 'active' : ''}>
            Clientes
          </Link>
          <Link to="/admin/ventas" className={location.pathname.startsWith('/admin/ventas') ? 'active' : ''}>
            Punto de venta
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          {user?.usuario && <span className="admin-user">{user.usuario}</span>}
          <button type="button" onClick={handleLogout} className="admin-logout-btn">
            Cerrar sesión
          </button>
          <Link to="/" className="admin-site-link">Ir al sitio</Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
