import { Link } from 'react-router-dom'

export default function ClientDashboard() {
  return (
    <div className="client-dashboard">
      <h1>Bienvenido a su área de cliente</h1>
      <p className="client-welcome">Desde aquí puede gestionar sus pedidos, consultar el catálogo, ver sus cuentas y más.</p>
      <div className="client-dashboard-grid">
        <Link to="/cliente/catalogo" className="client-card">
          <span className="client-card-icon">📦</span>
          <h3>Catálogo</h3>
          <p>Explore productos y precios</p>
        </Link>
        <Link to="/cliente/carrito" className="client-card">
          <span className="client-card-icon">🛒</span>
          <h3>Mi carrito</h3>
          <p>Productos pendientes de pedido</p>
        </Link>
        <Link to="/cliente/cuentas-por-pagar" className="client-card">
          <span className="client-card-icon">📋</span>
          <h3>Cuentas por pagar</h3>
          <p>Facturas pendientes</p>
        </Link>
        <Link to="/cliente/ultimas-compras" className="client-card">
          <span className="client-card-icon">🛍️</span>
          <h3>Últimas compras</h3>
          <p>Historial de pedidos</p>
        </Link>
        <Link to="/cliente/planificacion-compra" className="client-card">
          <span className="client-card-icon">📊</span>
          <h3>Planificación de compra</h3>
          <p>Sugerencias según inventario</p>
        </Link>
        <Link to="/cliente/mi-cuenta" className="client-card">
          <span className="client-card-icon">👤</span>
          <h3>Mi cuenta</h3>
          <p>Datos y perfil</p>
        </Link>
      </div>
    </div>
  )
}
