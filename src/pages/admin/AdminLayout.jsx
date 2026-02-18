import { useState, useMemo } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { getAdminUser, hasModulo, logoutAdmin } from '../../config/api'
import { useBcv } from '../../context/BcvContext'

const ITEMS_MENU = [
  { to: '/admin', label: 'Dashboard', modulo: null },
  { to: '/admin/solicitudes', label: 'Solicitudes', modulo: 'solicitudes_clientes' },
  { to: '/admin/pedidos/administracion', label: 'Pedidos – Admin', modulo: 'pedidos' },
  { to: '/admin/pedidos/picking', label: 'Picking', modulo: 'pedidos' },
  { to: '/admin/pedidos/packing', label: 'Packing', modulo: 'pedidos' },
  { to: '/admin/pedidos/envios', label: 'Envíos', modulo: 'pedidos' },
  { to: '/admin/pedidos/crear', label: 'Crear pedido', modulo: 'pedidos' },
  { to: '/admin/pedidos/facturacion', label: 'Facturación', modulo: 'pedidos' },
  { to: '/admin/pedidos/fallas', label: 'Control fallas', modulo: 'pedidos' },
  { to: '/admin/finanzas', label: 'Finanzas', modulo: 'finanzas' },
  { to: '/admin/cuentas-por-cobrar', label: 'Cuentas por cobrar', modulo: 'cuentas_por_cobrar' },
  { to: '/admin/cuentas-por-pagar', label: 'Cuentas por pagar', modulo: 'cuentas_por_pagar' },
  { to: '/admin/facturas-finalizadas', label: 'Facturas finalizadas', modulo: 'facturas_finalizadas' },
  { to: '/admin/gastos', label: 'Gastos', modulo: 'gastos' },
  { to: '/admin/cierre-diario', label: 'Cierre diario', modulo: 'cierre_diario' },
  { to: '/admin/proveedores', label: 'Proveedores', modulo: 'proveedores' },
  { to: '/admin/compras', label: 'Compras', modulo: 'compras' },
  { to: '/admin/ordenes-compra', label: 'Órdenes de compra', modulo: 'ordenes_compra' },
  { to: '/admin/lista-comparativa', label: 'Lista comparativa', modulo: 'lista_comparativa' },
  { to: '/admin/formatos-impresion', label: 'Formato impresión', modulo: 'formatos_impresion' },
  { to: '/admin/inventario', label: 'Inventario', modulo: 'inventario' },
  { to: '/admin/clientes', label: 'Clientes', modulo: 'clientes' },
  { to: '/admin/usuarios', label: 'Usuarios', modulo: 'usuarios' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getAdminUser()
  const { bcv } = useBcv()
  const [busqueda, setBusqueda] = useState('')

  const itemsVisibles = useMemo(() => {
    const conPermiso = ITEMS_MENU.filter((item) => !item.modulo || hasModulo(item.modulo))
    const q = busqueda.trim().toLowerCase()
    if (!q) return conPermiso
    return conPermiso.filter((item) => item.label.toLowerCase().includes(q))
  }, [busqueda])

  function handleLogout() {
    logoutAdmin()
    navigate('/login')
    window.location.reload()
  }

  function isActive(item) {
    if (item.to === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(item.to) || location.pathname.includes(item.to)
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-logo">⚕</span>
          <span>Panel Admin</span>
          <span className="admin-bcv-badge" title="Tasa BCV">$ = Bs. {bcv.toFixed(4)}</span>
        </div>
        <div className="admin-sidebar-search">
          <input
            type="text"
            placeholder="Buscar módulo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <nav className="admin-nav">
          {itemsVisibles.map((item) => (
            <Link
              key={item.to + item.label}
              to={item.to}
              className={isActive(item) ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
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
