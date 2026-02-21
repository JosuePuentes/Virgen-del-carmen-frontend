import { useState, useEffect } from 'react'
import { apiGet, getToken, getRif } from '../../config/api'

export default function ClientPlanificacionCompra() {
  const [sugerencias, setSugerencias] = useState([])
  const [loading, setLoading] = useState(true)
  const token = getToken()
  const rif = getRif()

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      try {
        const [inv, pedidos] = await Promise.all([
          apiGet('inventario_maestro/'),
          rif && token ? apiGet(`pedidos/por_cliente/${rif}`, token).catch(() => []) : [],
        ])
        const lista = Array.isArray(inv) ? inv : inv?.items || inv?.productos || inv?.data || []
        const pedidosList = Array.isArray(pedidos) ? pedidos : pedidos?.pedidos || []
        setSugerencias(lista.slice(0, 10))
      } catch {
        setSugerencias([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [rif, token])

  return (
    <div className="client-page">
      <h1>Planificación de compra</h1>
      <p className="client-welcome">Sugerencias basadas en inventario disponible y su historial de compras.</p>
      {loading && <p className="client-loading">Cargando...</p>}
      {!loading && sugerencias.length === 0 && <p className="client-empty">No hay sugerencias disponibles.</p>}
      {!loading && sugerencias.length > 0 && (
        <p className="client-empty">El backend puede ofrecer un endpoint específico para planificación según inventario y compras del cliente.</p>
      )}
    </div>
  )
}
