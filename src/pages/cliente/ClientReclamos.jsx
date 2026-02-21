import { useState, useEffect } from 'react'
import { apiGet, apiPost, getToken, getRif } from '../../config/api'

export default function ClientReclamos() {
  const [reclamos, setReclamos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState({ asunto: '', mensaje: '' })
  const token = getToken()
  const rif = getRif()

  useEffect(() => {
    if (!rif || !token) return
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet(`reclamos/cliente/${rif}`, token)
        setReclamos(Array.isArray(data) ? data : data?.reclamos || data?.items || data?.data || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar')
        setReclamos([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [rif, token])

  async function handleEnviar(e) {
    e.preventDefault()
    if (!rif || !token) return
    setEnviando(true)
    setError('')
    try {
      await apiPost('reclamos/cliente', { rif, cliente: rif, asunto: form.asunto, mensaje: form.mensaje }, token)
      setForm({ asunto: '', mensaje: '' })
      const data = await apiGet(`reclamos/cliente/${rif}`, token)
      setReclamos(Array.isArray(data) ? data : data?.reclamos || data?.items || data?.data || [])
    } catch (err) {
      setError(err.message || 'Error al enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="client-page">
      <h1>Reclamos</h1>
      <form onSubmit={handleEnviar} className="client-form">
        <input name="asunto" placeholder="Asunto" value={form.asunto} onChange={(e) => setForm((f) => ({ ...f, asunto: e.target.value }))} required />
        <textarea name="mensaje" placeholder="Mensaje" value={form.mensaje} onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))} required rows={4} />
        <button type="submit" className="btn-hero" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar reclamo'}</button>
      </form>
      {error && <p className="auth-error">{error}</p>}
      <h2>Mis reclamos</h2>
      {loading && <p className="client-loading">Cargando...</p>}
      {!loading && reclamos.length === 0 && <p className="client-empty">No tiene reclamos.</p>}
      {!loading && reclamos.length > 0 && (
        <ul className="client-list">
          {reclamos.map((r) => (
            <li key={r._id || r.id}><strong>{r.asunto || r.tema || '—'}</strong> — {r.mensaje || r.descripcion || ''} ({r.fecha || r.createdAt || ''})</li>
          ))}
        </ul>
      )}
    </div>
  )
}
