import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost, setToken, setRif } from '../config/api'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiPost('/login/', { email, password })
      setToken(res.access_token)
      if (res.rif) setRif(res.rif)
      navigate('/')
      window.location.reload()
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
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
          <div className="auth-card">
            <h1>Iniciar sesión</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-hero" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
            <p className="auth-link">
              ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
            </p>
            <p className="auth-link auth-link-small">
              ¿Eres administrador? <Link to="/admin/login">Acceso intranet</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
