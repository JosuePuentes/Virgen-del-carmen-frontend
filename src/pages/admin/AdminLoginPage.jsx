import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost, setAdminToken, setAdminUser, setAdminModulos, isAdminLoggedIn } from '../../config/api'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  useEffect(() => {
    if (isAdminLoggedIn()) navigate('/admin', { replace: true })
  }, [navigate])
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiPost('login/admin/', { usuario, password })
      setAdminToken(res.access_token)
      setAdminUser({ usuario: res.usuario })
      setAdminModulos(res.modulos || [])
      navigate('/admin')
      window.location.reload()
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>Área administrativa</h1>
        <p className="admin-login-subtitle">Acceso para personal interno</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-hero" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="admin-login-link">
          ¿Eres cliente? <Link to="/login">Iniciar sesión como cliente</Link>
        </p>
      </div>
    </div>
  )
}
