import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../config/api'

export default function Footer() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const data = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      mensaje: form.mensaje.value.trim(),
    }

    setLoading(true)
    try {
      await apiPost('/contacto', data)
      alert('Gracias por tu mensaje. Te contactaremos pronto.')
      form.reset()
    } catch (err) {
      alert('No se pudo enviar. Revisa que la URL del backend sea correcta y que permita CORS.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="footer" id="contacto">
      <div className="container footer-grid">
        <div className="footer-col">
          <h3>Mapa del sitio</h3>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/catalogo">Catálogo</Link></li>
            <li><Link to="/chat">Chat</Link></li>
            <li><Link to="/login">Intranet / Login</Link></li>
            <li><Link to="/#contacto">Contacto</Link></li>
          </ul>
          <p className="footer-address">
            Dirección: Av. Principal 123<br />
            Tel: 0247-VIRGENCARMEN<br />
            contacto@virgencarmen.com
          </p>
        </div>
        <div className="footer-col footer-center">
          <h3>Políticas y avisos</h3>
          <ul>
            <li><Link to="/#contacto">Políticas de privacidad</Link></li>
            <li><Link to="/#contacto">Aviso legal</Link></li>
            <li><Link to="/#contacto">Términos y condiciones</Link></li>
          </ul>
          <div className="footer-logo">
            <span className="logo-icon">⚕</span>
            <span>Droguería e Insumos Médicos Virgen del Carmen</span>
          </div>
        </div>
        <div className="footer-col">
          <h3>¿Tienes alguna consulta?</h3>
          <form className="footer-form" onSubmit={handleSubmit}>
            <input type="text" name="nombre" placeholder="Nombre" required />
            <input type="email" name="email" placeholder="Correo electrónico" required />
            <input type="tel" name="telefono" placeholder="Teléfono" />
            <textarea name="mensaje" placeholder="Tu mensaje" rows="3" />
            <button type="submit" className="btn-footer" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 Droguería Virgen del Carmen. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
