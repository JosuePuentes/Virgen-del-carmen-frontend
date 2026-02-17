import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay" />
      <div className="hero-content container">
        <h1>Tu Aliado en Salud y Bienestar</h1>
        <p className="hero-subtitle">Distribución mayorista de confianza</p>
        <Link to="/catalogo" className="btn-hero">Ver Catálogo 2026</Link>
      </div>
    </section>
  )
}
