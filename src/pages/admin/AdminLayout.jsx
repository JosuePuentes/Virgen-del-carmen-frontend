import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { getAdminUser, hasModulo, logoutAdmin } from '../../config/api'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getAdminUser()

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
          {hasModulo('finanzas') && (
            <Link to="/admin/finanzas" className={location.pathname.startsWith('/admin/finanzas') ? 'active' : ''}>
              Finanzas
            </Link>
          )}
          {hasModulo('cuentas_por_cobrar') && (
            <Link to="/admin/cuentas-por-cobrar" className={location.pathname.startsWith('/admin/cuentas-por-cobrar') ? 'active' : ''}>
              Cuentas por cobrar
            </Link>
          )}
          {hasModulo('cuentas_por_pagar') && (
            <Link to="/admin/cuentas-por-pagar" className={location.pathname.startsWith('/admin/cuentas-por-pagar') ? 'active' : ''}>
              Cuentas por pagar
            </Link>
          )}
          {hasModulo('facturas_finalizadas') && (
            <Link to="/admin/facturas-finalizadas" className={location.pathname.startsWith('/admin/facturas-finalizadas') ? 'active' : ''}>
              Facturas finalizadas
            </Link>
          )}
          {hasModulo('gastos') && (
            <Link to="/admin/gastos" className={location.pathname.startsWith('/admin/gastos') ? 'active' : ''}>
              Gastos
            </Link>
          )}
          {hasModulo('cierre_diario') && (
            <Link to="/admin/cierre-diario" className={location.pathname.startsWith('/admin/cierre-diario') ? 'active' : ''}>
              Cierre diario
            </Link>
          )}
          {hasModulo('proveedores') && (
            <Link to="/admin/proveedores" className={location.pathname.startsWith('/admin/proveedores') ? 'active' : ''}>
              Proveedores
            </Link>
          )}
          {hasModulo('compras') && (
            <Link to="/admin/compras" className={location.pathname.startsWith('/admin/compras') ? 'active' : ''}>
              Compras
            </Link>
          )}
          {hasModulo('ordenes_compra') && (
            <Link to="/admin/ordenes-compra" className={location.pathname.startsWith('/admin/ordenes-compra') ? 'active' : ''}>
              Órdenes de compra
            </Link>
          )}
          {hasModulo('lista_comparativa') && (
            <Link to="/admin/lista-comparativa" className={location.pathname.startsWith('/admin/lista-comparativa') ? 'active' : ''}>
              Lista comparativa
            </Link>
          )}
          {hasModulo('formatos_impresion') && (
            <Link to="/admin/formatos-impresion" className={location.pathname.startsWith('/admin/formatos-impresion') ? 'active' : ''}>
              Formato impresión
            </Link>
          )}
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
          {hasModulo('usuarios') && (
            <Link to="/admin/usuarios" className={location.pathname.startsWith('/admin/usuarios') ? 'active' : ''}>
              Usuarios
            </Link>
          )}
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
