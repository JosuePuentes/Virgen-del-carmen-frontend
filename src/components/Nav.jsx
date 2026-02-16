export default function Nav() {
  return (
    <nav className="main-nav">
      <div className="container nav-inner">
        <a href="#" className="logo">
          <img src="/assets/logo.png" alt="Droguería e Insumos Médicos Virgen del Carmen" className="logo-img" />
          <span className="logo-text">Droguería e Insumos Médicos<br />Virgen del Carmen</span>
        </a>
        <ul className="nav-links">
          <li><a href="#" className="active">Inicio</a></li>
          <li><a href="#medicamentos">Medicamentos</a></li>
          <li><a href="#insumos">Insumos</a></li>
          <li><a href="#promociones">Promociones</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <button type="button" className="btn-search" aria-label="Buscar">🔍</button>
      </div>
    </nav>
  )
}
