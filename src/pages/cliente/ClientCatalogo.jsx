import { useState, useEffect } from 'react'
import { apiGet, getToken, getRif, getApiUrl } from '../../config/api'
import { Precio } from '../../components/Precio'

function getFotoUrl(p) {
  if (p.foto_url) return p.foto_url
  if (typeof p.foto === 'string' && p.foto.startsWith('http')) return p.foto
  if (p._id || p.id) return getApiUrl(`inventario_maestro/${p._id || p.id}/foto`)
  return null
}

export default function ClientCatalogo() {
  const [productos, setProductos] = useState([])
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const token = getToken()
  const rif = getRif()

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const [dataInv, dataCliente] = await Promise.all([
          apiGet('inventario_maestro/', token),
          rif && token ? apiGet(`clientes/${rif}`, token).catch(() => null) : null,
        ])
        setProductos(Array.isArray(dataInv) ? dataInv : dataInv?.items || dataInv?.productos || dataInv?.data || [])
        setCliente(dataCliente)
      } catch (err) {
        setError(err.message || 'No se pudo cargar el catálogo')
        setProductos([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [rif, token])

  const descuento = cliente?.descuento_comercial ?? 0

  const filtrados = productos.filter((p) => {
    const texto = [p.codigo, p.descripcion, p.nombre, p.laboratorio, p.marca].filter(Boolean).join(' ').toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  function precioConDescuento(precio) {
    const p = parseFloat(precio) || 0
    if (descuento <= 0) return p
    return p * (1 - descuento / 100)
  }

  return (
    <div className="client-page">
      <h1>Catálogo de productos</h1>
      {descuento > 0 && <p className="client-descuento-info">Su descuento comercial: {descuento}% aplicado a los precios</p>}
      <div className="client-toolbar">
        <input type="search" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="client-search" />
      </div>
      {loading && <p className="client-loading">Cargando...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <div className="client-catalogo-grid client-catalogo-con-foto">
          {filtrados.length === 0 ? <p className="client-empty">No hay productos.</p> : filtrados.map((p) => {
            const fotoUrl = getFotoUrl(p)
            return (
              <article key={p._id || p.codigo || p.id} className="client-producto-card">
                <div className="client-producto-foto">
                  {fotoUrl ? <img src={fotoUrl} alt="" onError={(e) => { e.target.style.display = 'none' }} /> : null}
                </div>
                <span className="client-producto-codigo">{p.codigo || p._id}</span>
                <h3>{p.descripcion || p.nombre || 'Sin nombre'}</h3>
                {(p.laboratorio || p.marca) && <span className="client-producto-lab">{p.laboratorio || p.marca}</span>}
                <span className="client-producto-existencia">Existencia: {p.existencia ?? '—'}</span>
                <p className="client-producto-precio client-producto-precio-grande"><Precio value={precioConDescuento(p.precio)} /></p>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
