import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { getToken, getRif, setToken, setRif, apiGet } from '../../config/api'

const ITEMS_MENU = [
  { to: '/cliente', label: 'Inicio', icon: '🏠' },
  { to: '/cliente/carrito', label: 'Mi carrito', icon: '🛒' },
  { to: '/cliente/catalogo', label: 'Catálogo', icon: '📦' },
  { to: '/cliente/cuentas-por-pagar', label: 'Mis cuentas por pagar', icon: '📋' },
  { to: '/cliente/cuentas-pagadas', label: 'Mis cuentas pagadas', icon: '✅' },
  { to: '/cliente/promociones', label: 'Promociones', icon: '🏷️' },
  { to: '/cliente/nuevas-entradas', label: 'Nuevas entradas', icon: '🆕' },
  { to: '/cliente/precios-bajaron', label: 'Precios que bajaron', icon: '📉' },
  { to: '/cliente/planificacion-compra', label: 'Planificación de compra', icon: '📊' },
  { to: '/cliente/ultimas-compras', label: 'Últimas compras', icon: '🛍️' },
  { to: '/cliente/pedidos', label: 'Mis pedidos', icon: '📄' },
  { to: '/cliente/reclamos', label: 'Reclamos', icon: '📢' },
  { to: '/cliente/mi-cuenta', label: 'Mi cuenta', icon: '👤' },
]

export default function ClientLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = getToken()
  const rif = getRif()
  const [cliente, setCliente] = useState(null)
  const [loadingCliente, setLoadingCliente] = useState(true)

  useEffect(() => {
    if (!rif || !token) return
    async function cargar() {
      setLoadingCliente(true)
      try {
        const data = await apiGet(`clientes/${rif}`, token)
        setCliente(data)
      } catch {
        setCliente(null)
      } finally {
        setLoadingCliente(false)
      }
    }
    cargar()
  }, [rif, token])

  function handleLogout() {
    setToken(null)
    setRif(null)
    navigate('/')
    window.location.reload()
  }

  function isActive(item) {
    if (item.to === '/cliente') return location.pathname === '/cliente'
    return location.pathname.startsWith(item.to)
  }

  const empresa = cliente?.empresa || cliente?.encargado || 'Mi empresa'
  const condiciones = cliente?.condiciones_comerciales || cliente?.dias_credito
    ? `${cliente.dias_credito || 0} días de crédito`
    : 'Consulte condiciones'

  return (
    <div className="client-layout">
      <aside className="client-sidebar">
        <div className="client-sidebar-header">
          <span className="client-logo">🏪</span>
          <span>Área cliente</span>
        </div>
        <nav className="client-nav">
          {ITEMS_MENU.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={isActive(item) ? 'active' : ''}
            >
              <span className="client-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="client-sidebar-footer">
          <button type="button" onClick={handleLogout} className="client-logout-btn">
            Cerrar sesión
          </button>
          <Link to="/" className="client-site-link">Ir al sitio público</Link>
        </div>
      </aside>
      <div className="client-right">
        <header className="client-top-bar">
          <div className="client-top-info">
            <h1 className="client-empresa">{loadingCliente ? 'Cargando…' : empresa}</h1>
            <span className="client-condiciones">{condiciones}</span>
          </div>
        </header>
        <main className="client-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
