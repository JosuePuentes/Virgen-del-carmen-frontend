import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUnificado, setToken, setRif, setAdminToken, setAdminUser, setAdminModulos } from '../config/api'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function LoginPage() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await loginUnificado(usuario.trim(), password)
      if (result.ok && result.data) {
        if (result.rol === 'admin') {
          setAdminToken(result.data.access_token)
          setAdminUser({ usuario: result.data.usuario, rol: result.data.rol })
          const modulosBackend = result.data.modulos || []
          const basicos = ['solicitudes_clientes', 'pedidos', 'inventario', 'clientes']
          const tieneBasicosCompletos = modulosBackend.length > 0 && basicos.every((b) => modulosBackend.includes(b))
          const esMaster = String(result.data.rol || '').toLowerCase() === 'master' ||
            modulosBackend.includes('master') ||
            modulosBackend.includes('*') ||
            modulosBackend.length === 0 ||
            tieneBasicosCompletos
          setAdminModulos(esMaster ? ['master'] : modulosBackend)
          navigate('/admin')
        } else {
          setToken(result.data.access_token)
          if (result.data.rif) setRif(result.data.rif)
          navigate('/cliente')
        }
        window.location.reload()
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
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
                type="text"
                placeholder="Usuario o correo"
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
              <p className="auth-link">
                ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
