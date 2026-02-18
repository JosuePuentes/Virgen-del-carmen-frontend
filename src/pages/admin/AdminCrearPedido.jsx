import { useState, useEffect } from 'react'
import { apiGet, apiPost, getAdminToken } from '../../config/api'

export default function AdminCrearPedido() {
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    rif: '',
    cliente: '',
    observacion: '',
    productos: [],
    subtotal: 0,
    total: 0,
  })

  useEffect(() => {
    async function cargar() {
      try {
        const [c, p] = await Promise.all([
          apiGet('clientes/', getAdminToken()),
          apiGet('inventario_maestro/', getAdminToken()),
        ])
        setClientes(Array.isArray(c) ? c : c?.items || [])
        setProductos(Array.isArray(p) ? p : p?.items || [])
      } catch (err) {
        setError(err.message || 'Error al cargar datos')
      }
    }
    cargar()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiPost('pedidos/', {
        rif: form.rif,
        cliente: form.cliente,
        observacion: form.observacion,
        total: Number(form.total) || 0,
        subtotal: Number(form.subtotal) || 0,
        productos: form.productos.length ? form.productos : [],
      }, getAdminToken())
      alert('Pedido creado correctamente.')
      setForm({ rif: '', cliente: '', observacion: '', productos: [], subtotal: 0, total: 0 })
    } catch (err) {
      setError(err.message || 'Error al crear pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <h1>Crear pedido</h1>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          RIF cliente
          <input name="rif" value={form.rif} onChange={handleChange} required />
        </label>
        <label>
          Nombre cliente
          <input name="cliente" value={form.cliente} onChange={handleChange} />
        </label>
        <label>
          Observación
          <textarea name="observacion" value={form.observacion} onChange={handleChange} rows="2" />
        </label>
        <label>
          Subtotal
          <input type="number" name="subtotal" value={form.subtotal} onChange={handleChange} step="0.01" />
        </label>
        <label>
          Total
          <input type="number" name="total" value={form.total} onChange={handleChange} step="0.01" required />
        </label>
        <button type="submit" className="btn-hero" disabled={loading}>
          {loading ? 'Creando…' : 'Crear pedido'}
        </button>
      </form>
    </div>
  )
}
