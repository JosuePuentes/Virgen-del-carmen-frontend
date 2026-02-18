import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { getAdminUser, getAdminModulos, logoutAdmin } from '../../config/api'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getAdminUser()
  const modulos = getAdminModulos()
  const hasModulo = (m) => !modulos?.length || modulos.includes(m)

  function handleLogout() {
    logoutAdmin()
    navigate('/login')
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
            Dashboard
          </Link>
          {hasModulo('solicitudes_clientes') && (
            <Link to="/admin/solicitudes" className={location.pathname.startsWith('/admin/solicitudes') ? 'active' : ''}>
              Solicitudes
            </Link>
          )}
          {hasModulo('pedidos') && (
            <>
              <Link to="/admin/pedidos/administracion" className={location.pathname.includes('/pedidos/administracion') ? 'active' : ''}>
                Pedidos – Admin
              </Link>
              <Link to="/admin/pedidos/picking" className={location.pathname.includes('/pedidos/picking') ? 'active' : ''}>
                Picking
              </Link>
              <Link to="/admin/pedidos/packing" className={location.pathname.includes('/pedidos/packing') ? 'active' : ''}>
                Packing
              </Link>
              <Link to="/admin/pedidos/envios" className={location.pathname.includes('/pedidos/envios') ? 'active' : ''}>
                Envíos
              </Link>
              <Link to="/admin/pedidos/crear" className={location.pathname.includes('/pedidos/crear') ? 'active' : ''}>
                Crear pedido
              </Link>
              <Link to="/admin/pedidos/facturacion" className={location.pathname.includes('/pedidos/facturacion') ? 'active' : ''}>
                Facturación
              </Link>
              <Link to="/admin/pedidos/fallas" className={location.pathname.includes('/pedidos/fallas') ? 'active' : ''}>
                Control fallas
              </Link>
            </>
          )}
          <Link to="/admin/finanzas" className={location.pathname.startsWith('/admin/finanzas') ? 'active' : ''}>
            Finanzas
          </Link>
          <Link to="/admin/gastos" className={location.pathname.startsWith('/admin/gastos') ? 'active' : ''}>
            Gastos
          </Link>
          <Link to="/admin/cierre-diario" className={location.pathname.startsWith('/admin/cierre-diario') ? 'active' : ''}>
            Cierre diario
          </Link>
          {hasModulo('inventario') && (
            <Link to="/admin/inventario" className={location.pathname.startsWith('/admin/inventario') ? 'active' : ''}>
              Inventario
            </Link>
          )}
          {hasModulo('clientes') && (
            <Link to="/admin/clientes" className={location.pathname.startsWith('/admin/clientes') ? 'active' : ''}>
              Clientes
            </Link>
          )}
          <Link to="/admin/usuarios" className={location.pathname.startsWith('/admin/usuarios') ? 'active' : ''}>
            Usuarios
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
