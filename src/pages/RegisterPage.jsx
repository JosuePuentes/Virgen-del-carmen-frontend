import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../config/api'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    rif: '',
    empresa: '',
    direccion: '',
    telefono: '',
    encargado: '',
    activo: true,
    descuento1: 0,
    descuento2: 0,
    descuento3: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiPost('/register/', form)
      alert('Cliente registrado exitosamente. Ya puedes iniciar sesión.')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <Nav />
      <main className="auth-page">
        <div className="container">
          <div className="auth-card auth-card-wide">
            <h1>Registro de cliente</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="rif"
                placeholder="RIF"
                value={form.rif}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="empresa"
                placeholder="Nombre de la empresa"
                value={form.empresa}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="encargado"
                placeholder="Nombre del encargado"
                value={form.encargado}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={form.direccion}
                onChange={handleChange}
              />
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={handleChange}
              />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-hero" disabled={loading}>
                {loading ? 'Registrando…' : 'Registrarse'}
              </button>
            </form>
            <p className="auth-link">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
