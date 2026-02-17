import { useState, useRef, useEffect } from 'react'
import { apiPost } from '../config/api'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function ChatPage() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    const userMsg = prompt.trim()
    setPrompt('')
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)
    setError('')

    try {
      const res = await apiPost('/api/chat', { prompt: userMsg })
      setMessages((prev) => [...prev, { role: 'assistant', text: res.response || '' }])
    } catch (err) {
      setError(err.message || 'Error al enviar el mensaje')
      setMessages((prev) => [...prev, { role: 'assistant', text: 'No se pudo obtener respuesta. Revisa la conexión con el backend.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <Nav />
      <main className="chat-page">
        <div className="container">
          <h1 className="section-title">Asistente virtual</h1>
          <p className="chat-intro">Pregunta sobre productos, pedidos o cualquier consulta.</p>

          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 && (
                <p className="chat-placeholder">Escribe un mensaje para comenzar...</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="chat-message assistant">Pensando...</div>
              )}
              <div ref={bottomRef} />
            </div>

            <form className="chat-form" onSubmit={handleSubmit}>
              {error && <p className="auth-error">{error}</p>}
              <input
                type="text"
                placeholder="Escribe tu pregunta..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="btn-hero" disabled={loading}>
                Enviar
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
