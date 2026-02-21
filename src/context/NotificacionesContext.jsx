import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiGet, getAdminToken, hasModulo } from '../config/api'

const NotificacionesContext = createContext(null)

const NOTIF_CONFIG = [
  { key: 'pedidos_admin', to: '/admin/pedidos/administracion', label: 'Pedidos por validar', endpoint: 'pedidos/administracion/', modulo: 'pedidos' },
  { key: 'picking', to: '/admin/pedidos/picking', label: 'Picking pendiente', endpoint: 'pedidos/picking/', endpointAlt: 'pedidos/por_estado/picking', modulo: 'pedidos' },
  { key: 'packing', to: '/admin/pedidos/packing', label: 'Packing pendiente', endpoint: 'pedidos/por_estado/packing', modulo: 'pedidos' },
  { key: 'facturacion', to: '/admin/pedidos/facturacion', label: 'Pedidos por facturar', endpoint: 'pedidos/para_facturar/', modulo: 'pedidos' },
  { key: 'fallas', to: '/admin/pedidos/fallas', label: 'Control de fallas', endpoint: 'fallas/', modulo: 'pedidos' },
  { key: 'cuentas_pagar', to: '/admin/cuentas-por-pagar', label: 'Cuentas por pagar', endpoint: 'cuentas-por-pagar/', modulo: 'cuentas_por_pagar' },
  { key: 'cuentas_cobrar_vencidas', to: '/admin/cuentas-por-cobrar', label: 'Facturas vencidas (por cobrar)', endpoint: 'cuentas-por-cobrar/vencidas', modulo: 'cuentas_por_cobrar' },
  { key: 'solicitudes', to: '/admin/solicitudes', label: 'Solicitudes pendientes', endpoint: 'clientes/solicitudes/pendientes', modulo: 'solicitudes_clientes' },
]

export function NotificacionesProvider({ children }) {
  const [conteos, setConteos] = useState({})
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(async () => {
    const token = getAdminToken()
    if (!token) return
    setLoading(true)
    try {
      const resultados = {}
      for (const c of NOTIF_CONFIG) {
        if (c.modulo && !hasModulo(c.modulo)) continue
        try {
          const data = await apiGet(c.endpoint, token).catch(() => c.endpointAlt ? apiGet(c.endpointAlt, token) : null)
          const arr = Array.isArray(data) ? data : data?.pedidos || data?.facturas || data?.items || data?.cuentas || data?.solicitudes || []
          resultados[c.key] = arr.length
        } catch {
          resultados[c.key] = 0
        }
      }
      setConteos(resultados)
    } catch {
      setConteos({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 60000)
    return () => clearInterval(id)
  }, [cargar])

  const total = Object.values(conteos).reduce((s, n) => s + (n || 0), 0)
  const mensajes = NOTIF_CONFIG
    .filter((c) => (conteos[c.key] || 0) > 0)
    .map((c) => ({ ...c, count: conteos[c.key] }))

  return (
    <NotificacionesContext.Provider value={{ conteos, total, mensajes, cargar, loading }}>
      {children}
    </NotificacionesContext.Provider>
  )
}

export function useNotificaciones() {
  const ctx = useContext(NotificacionesContext)
  return ctx || { conteos: {}, total: 0, mensajes: [], cargar: () => {}, loading: false }
}

export function getConteoParaRuta(conteos, to) {
  const m = NOTIF_CONFIG.find((c) => c.to === to)
  return m ? (conteos[m.key] || 0) : 0
}
