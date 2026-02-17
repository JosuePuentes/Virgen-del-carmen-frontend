import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import CatalogoPage from './pages/CatalogoPage'
import PedidosPage from './pages/PedidosPage'
import ReclamosPage from './pages/ReclamosPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/reclamos" element={<ReclamosPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
