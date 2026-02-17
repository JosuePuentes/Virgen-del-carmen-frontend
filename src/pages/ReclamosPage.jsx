import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiGet, apiPost, getToken, getRif } from '../config/api'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function ReclamosPage() {
  const [reclamos, setReclamos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState('')
  const [form, setForm] = useState({
    pedido_id: '',
    productos: [{ id: '', descripcion: '', cantidad: 1, motivo: '' }],
    observacion: '',
  })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = getToken()
  const rif = getRif()

  const pedidoParam = searchParams.get('pedido')

  useEffect(() => {
    if (pedidoParam) setForm((f) => ({ ...f, pedido_id: pedidoParam }))
  }, [pedidoParam])

  useEffect(() => {
    if (!token || !rif) {
      navigate('/login')
      return
    }
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet(`reclamos/cliente/${rif}`)
        setReclamos(Array.isArray(data) ? data : data?.reclamos || data?.items || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar los reclamos')
        setReclamos([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [token, rif, navigate])

  function handleChange(e, idx, field) {
    if (idx !== undefined) {
      setForm((f) => ({
        ...f,
        productos: f.productos.map((p, i) =>
          i === idx ? { ...p, [field]: e.target.value } : p
        ),
      }))
    } else {
      setForm((f) => ({ ...f, [field]: e.target.value }))
    }
  }

  function addProducto() {
    setForm((f) => ({
      ...f,
      productos: [...f.productos, { id: '', descripcion: '', cantidad: 1, motivo: '' }],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!rif) return
    setEnviando(true)
    setError('')
    setExito('')
    try {
      const body = {
        pedido_id: form.pedido_id,
        rif,
        cliente: rif,
        productos: form.productos.filter((p) => p.id || p.descripcion),
        observacion: form.observacion,
        fecha: new Date().toISOString().slice(0, 10),
      }
      const res = await apiPost('reclamos/cliente', body)
      setExito(res.message || 'Reclamo registrado correctamente.')
      setForm({ pedido_id: '', productos: [{ id: '', descripcion: '', cantidad: 1, motivo: '' }], observacion: '' })
      const data = await apiGet(`reclamos/cliente/${rif}`)
      setReclamos(Array.isArray(data) ? data : data?.reclamos || data?.items || [])
    } catch (err) {
      setError(err.message || 'Error al enviar el reclamo')
    } finally {
      setEnviando(false)
    }
  }

  if (!token) return null

  return (
    <>
      <Header />
      <Nav />
      <main className="reclamos-page">
        <div className="container">
          <h1 className="section-title">Reclamos</h1>
          {!rif && (
            <p className="auth-error">
              No se encontró tu RIF. <Link to="/login">Inicia sesión</Link> de nuevo.
            </p>
          )}

          <section className="reclamos-form-section">
            <h2>Nuevo reclamo</h2>
            <form onSubmit={handleSubmit} className="reclamos-form">
              <label>
                ID del pedido
                <input
                  type="text"
                  value={form.pedido_id}
                  onChange={(e) => handleChange(e, undefined, 'pedido_id')}
                  placeholder="Ej: 507f1f77bcf86cd799439011"
                />
              </label>
              {form.productos.map((p, idx) => (
                <div key={idx} className="reclamo-producto-row">
                  <input
                    placeholder="ID producto"
                    value={p.id}
                    onChange={(e) => handleChange(e, idx, 'id')}
                  />
                  <input
                    placeholder="Descripción"
                    value={p.descripcion}
                    onChange={(e) => handleChange(e, idx, 'descripcion')}
                  />
                  <input
                    type="number"
                    placeholder="Cant."
                    value={p.cantidad}
                    onChange={(e) => handleChange(e, idx, 'cantidad')}
                    min="1"
                  />
                  <input
                    placeholder="Motivo"
                    value={p.motivo}
                    onChange={(e) => handleChange(e, idx, 'motivo')}
                  />
                </div>
              ))}
              <button type="button" onClick={addProducto} className="btn-secondary">
                + Añadir producto
              </button>
              <label>
                Observación
                <textarea
                  value={form.observacion}
                  onChange={(e) => handleChange(e, undefined, 'observacion')}
                  rows="2"
                />
              </label>
              {error && <p className="auth-error">{error}</p>}
              {exito && <p className="auth-success">{exito}</p>}
              <button type="submit" className="btn-hero" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar reclamo'}
              </button>
            </form>
          </section>

          <section className="reclamos-list-section">
            <h2>Mis reclamos</h2>
            {loading && <p className="catalogo-loading">Cargando...</p>}
            {!loading && (
              <div className="reclamos-list">
                {reclamos.length === 0 ? (
                  <p className="catalogo-empty">No tienes reclamos.</p>
                ) : (
                  reclamos.map((r) => (
                    <article key={r._id || r.id} className="reclamo-card">
                      <span className="reclamo-id">#{String(r._id || r.id).slice(-8)}</span>
                      {r.pedido_id && <span>Pedido: {r.pedido_id}</span>}
                      {r.observacion && <p>{r.observacion}</p>}
                      {r.fecha && <span className="reclamo-fecha">{r.fecha}</span>}
                    </article>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
