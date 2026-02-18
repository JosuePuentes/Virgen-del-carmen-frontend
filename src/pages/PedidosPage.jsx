import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGet, apiPost, getToken, getRif } from '../config/api'
import Header from '../components/Header'
import { Precio } from '../components/Precio'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const token = getToken()
  const rif = getRif()

  useEffect(() => {
    if (!token || !rif) {
      navigate('/login')
      return
    }
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet(`pedidos/por_cliente/${rif}`)
        setPedidos(Array.isArray(data) ? data : data?.pedidos || data?.items || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar los pedidos')
        setPedidos([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [token, rif, navigate])

  if (!token) return null

  return (
    <>
      <Header />
      <Nav />
      <main className="pedidos-page">
        <div className="container">
          <h1 className="section-title">Mis pedidos</h1>
          {!rif && (
            <p className="auth-error">
              No se encontró tu RIF. <Link to="/login">Inicia sesión</Link> de nuevo.
            </p>
          )}

          {loading && <p className="catalogo-loading">Cargando pedidos...</p>}
          {error && <p className="auth-error">{error}</p>}

          {!loading && !error && (
            <div className="pedidos-list">
              {pedidos.length === 0 ? (
                <p className="catalogo-empty">No tienes pedidos registrados.</p>
              ) : (
                pedidos.map((p) => (
                  <article key={p._id || p.id} className="pedido-card">
                    <div className="pedido-header">
                      <span className="pedido-id">Pedido #{String(p._id || p.id).slice(-8)}</span>
                      <span className={`pedido-estado estado-${(p.estado || 'nuevo').toLowerCase()}`}>
                        {p.estado || 'nuevo'}
                      </span>
                    </div>
                    <div className="pedido-body">
                      <p>Total: <Precio value={p.total} /></p>
                      {p.observacion && <p className="pedido-obs">{p.observacion}</p>}
                      {p.fecha && <p className="pedido-fecha">{p.fecha}</p>}
                    </div>
                    <Link to={`/reclamos?pedido=${p._id || p.id}`} className="link-reclamo">
                      Hacer reclamo
                    </Link>
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
