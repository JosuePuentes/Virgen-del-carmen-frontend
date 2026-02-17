import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getToken, setToken, setRif } from '../config/api'

export default function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const token = getToken()

  function handleLogout() {
    setToken(null)
    setRif(null)
    navigate('/')
    window.location.reload()
  }

  return (
    <nav className="main-nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <img src="/assets/logo.png" alt="Droguería e Insumos Médicos Virgen del Carmen" className="logo-img" />
          <span className="logo-text">Droguería e Insumos Médicos<br />Virgen del Carmen</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Inicio</Link></li>
          <li><Link to="/catalogo" className={location.pathname === '/catalogo' ? 'active' : ''}>Catálogo</Link></li>
          <li><Link to="/#contacto">Contacto</Link></li>
          <li><Link to="/chat" className={location.pathname === '/chat' ? 'active' : ''}>Chat</Link></li>
          {token ? (
            <>
              <li><Link to="/pedidos" className={location.pathname === '/pedidos' ? 'active' : ''}>Mis pedidos</Link></li>
              <li><Link to="/reclamos" className={location.pathname === '/reclamos' ? 'active' : ''}>Reclamos</Link></li>
              <li><button type="button" onClick={handleLogout} className="nav-link-btn">Cerrar sesión</button></li>
            </>
          ) : (
            <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Iniciar sesión</Link></li>
          )}
        </ul>
        <button type="button" className="btn-search" aria-label="Buscar">🔍</button>
      </div>
    </nav>
  )
}
