import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Panel administrativo</h1>
      <p className="admin-welcome">Bienvenido al área de administración.</p>
      <div className="admin-cards">
        <Link to="/admin/pedidos" className="admin-card">
          <span className="admin-card-icon">📦</span>
          <h3>Pedidos</h3>
          <p>Gestión de pedidos, picking, packing y facturación</p>
        </Link>
        <Link to="/admin/inventario" className="admin-card">
          <span className="admin-card-icon">📋</span>
          <h3>Inventario</h3>
          <p>Inventario maestro y cargas</p>
        </Link>
        <Link to="/admin/clientes" className="admin-card">
          <span className="admin-card-icon">👥</span>
          <h3>Clientes</h3>
          <p>Listado y gestión de clientes</p>
        </Link>
        <Link to="/admin/ventas" className="admin-card">
          <span className="admin-card-icon">💰</span>
          <h3>Punto de venta</h3>
          <p>Registro y listado de ventas</p>
        </Link>
      </div>
    </div>
  )
}
