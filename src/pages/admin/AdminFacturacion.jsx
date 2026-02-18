import { useState, useEffect } from 'react'
import { apiGet, apiPut, getAdminToken } from '../../config/api'

const API_BASE = import.meta.env.VITE_API_URL || 'https://droclven-back.onrender.com'

export default function AdminFacturacion() {
  const [pedidos, setPedidos] = useState([])
  const [pedidoSel, setPedidoSel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accionando, setAccionando] = useState(false)
  const [facturaUrl, setFacturaUrl] = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet('pedidos/para_facturar/', getAdminToken())
      setPedidos(Array.isArray(data) ? data : data?.pedidos || data?.items || [])
    } catch (err) {
      setError(err.message || 'No se pudo cargar')
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  async function emitirFactura(pedido) {
    setAccionando(true)
    setFacturaUrl('')
    try {
      const id = pedido._id || pedido.id
      await apiPut(`pedidos/finalizar_facturacion/${id}`, {}, getAdminToken())
      const url = `${API_BASE}/pedidos/${id}/factura-pdf`
      setFacturaUrl(url)
      setPedidoSel(pedido)
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al emitir factura')
    } finally {
      setAccionando(false)
    }
  }

  function imprimirFactura() {
    if (!facturaUrl) return
    window.open(facturaUrl, '_blank', 'width=800,height=600')
  }

  function descargarPDF() {
    if (!facturaUrl) return
    const a = document.createElement('a')
    a.href = facturaUrl
    a.download = `factura-${pedidoSel?._id || pedidoSel?.id || 'factura'}.pdf`
    a.target = '_blank'
    a.click()
  }

  return (
    <div className="admin-page">
      <h1>Facturación</h1>
      <p className="admin-welcome">Pedidos listos para facturar. Emita la factura y descargue o imprima el PDF.</p>
      {error && <p className="auth-error">{error}</p>}

      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <div className="admin-table-wrap">
          {pedidos.length === 0 ? (
            <p className="catalogo-empty">No hay pedidos para facturar.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p._id || p.id}>
                    <td>{String(p._id || p.id).slice(-8)}</td>
                    <td>{p.cliente || p.rif}</td>
                    <td>Bs. {typeof p.total === 'number' ? p.total.toFixed(2) : p.total}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-aprobar"
                        onClick={() => emitirFactura(p)}
                        disabled={accionando}
                      >
                        {accionando ? '…' : 'Emitir factura'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {facturaUrl && (
        <div className="facturacion-acciones">
          <h3>Factura emitida</h3>
          <div className="facturacion-btns">
            <button type="button" className="btn-hero" onClick={imprimirFactura}>
              Imprimir / Ver PDF
            </button>
            <button type="button" className="btn-secondary" onClick={descargarPDF}>
              Descargar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
