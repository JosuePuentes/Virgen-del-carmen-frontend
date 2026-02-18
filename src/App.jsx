import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import CatalogoPage from './pages/CatalogoPage'
import PedidosPage from './pages/PedidosPage'
import ReclamosPage from './pages/ReclamosPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPedidos from './pages/admin/AdminPedidos'
import AdminPedidosAdministracion from './pages/admin/AdminPedidosAdministracion'
import AdminPicking from './pages/admin/AdminPicking'
import AdminPacking from './pages/admin/AdminPacking'
import AdminEnvios from './pages/admin/AdminEnvios'
import AdminCrearPedido from './pages/admin/AdminCrearPedido'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminInventario from './pages/admin/AdminInventario'
import AdminClientes from './pages/admin/AdminClientes'
import AdminVentas from './pages/admin/AdminVentas'
import AdminSolicitudes from './pages/admin/AdminSolicitudes'
import AdminGuard from './components/AdminGuard'

function ScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      el?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

function AppRoutes() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/reclamos" element={<ReclamosPage />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="solicitudes" element={<AdminSolicitudes />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="pedidos/administracion" element={<AdminPedidosAdministracion />} />
          <Route path="pedidos/picking" element={<AdminPicking />} />
          <Route path="pedidos/packing" element={<AdminPacking />} />
          <Route path="pedidos/envios" element={<AdminEnvios />} />
          <Route path="pedidos/crear" element={<AdminCrearPedido />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="inventario" element={<AdminInventario />} />
          <Route path="clientes" element={<AdminClientes />} />
          <Route path="ventas" element={<AdminVentas />} />
        </Route>
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
