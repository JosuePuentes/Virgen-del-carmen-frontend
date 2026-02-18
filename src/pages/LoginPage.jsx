import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loginCliente, setToken, setRif, apiPost, setAdminToken, setAdminUser, setAdminModulos } from '../config/api'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const [modo, setModo] = useState(() => searchParams.get('modo') === 'admin' ? 'admin' : 'cliente')

  useEffect(() => {
    if (searchParams.get('modo') === 'admin') setModo('admin')
  }, [searchParams])
  const [email, setEmail] = useState('')
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmitCliente(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await loginCliente(email, password)
      if (result.ok && result.data?.access_token) {
        setToken(result.data.access_token)
        if (result.data.rif) setRif(result.data.rif)
        navigate('/')
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

  async function handleSubmitAdmin(e) {
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
    <>
      <Header />
      <Nav />
      <main className="auth-page">
        <div className="container">
          <div className="auth-card auth-card-wide">
            <h1>Iniciar sesión</h1>
            <div className="login-tabs">
              <button
                type="button"
                className={modo === 'cliente' ? 'active' : ''}
                onClick={() => { setModo('cliente'); setError('') }}
              >
                Cliente
              </button>
              <button
                type="button"
                className={modo === 'admin' ? 'active' : ''}
                onClick={() => { setModo('admin'); setError('') }}
              >
                Administrador
              </button>
            </div>

            {modo === 'cliente' ? (
              <form onSubmit={handleSubmitCliente}>
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
                <p className="auth-link">
                  ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSubmitAdmin}>
                <input
                  type="text"
                  placeholder="Usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
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
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
