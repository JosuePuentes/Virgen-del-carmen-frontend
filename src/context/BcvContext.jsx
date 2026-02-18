import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiGet, apiPut, getAdminToken } from '../config/api'

const BcvContext = createContext(null)

export function BcvProvider({ children }) {
  const [bcv, setBcv] = useState(() => {
    try {
      const v = localStorage.getItem('bcv_rate')
      return v ? parseFloat(v) : 36.5
    } catch {
      return 36.5
    }
  })
  const [loading, setLoading] = useState(false)

  const cargarBcv = useCallback(async () => {
    try {
      const data = await apiGet('bcv/').catch(() => apiGet('bcv/', getAdminToken())).catch(() => null)
      const rate = data?.tasa ?? data?.rate ?? data?.valor
      if (typeof rate === 'number' && rate > 0) {
        setBcv(rate)
        localStorage.setItem('bcv_rate', String(rate))
      }
    } catch {
      // keep localStorage value
    }
  }, [])

  useEffect(() => {
    cargarBcv()
  }, [cargarBcv])

  const guardarBcv = useCallback(async (valor) => {
    const num = parseFloat(valor)
    if (!Number.isFinite(num) || num <= 0) return false
    setLoading(true)
    try {
      await apiPut('bcv/', { tasa: num, rate: num }, getAdminToken())
      setBcv(num)
      localStorage.setItem('bcv_rate', String(num))
      return true
    } catch {
      setBcv(num)
      localStorage.setItem('bcv_rate', String(num))
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  const setBcvLocal = useCallback((valor) => {
    const num = parseFloat(valor)
    if (Number.isFinite(num) && num > 0) {
      setBcv(num)
      localStorage.setItem('bcv_rate', String(num))
    }
  }, [])

  return (
    <BcvContext.Provider value={{ bcv, setBcvLocal, guardarBcv, cargarBcv, loading }}>
      {children}
    </BcvContext.Provider>
  )
}

export function useBcv() {
  const ctx = useContext(BcvContext)
  return ctx || { bcv: 36.5, setBcvLocal: () => {}, guardarBcv: async () => false, cargarBcv: () => {} }
}

/** Formatea precio en USD: "$X.XX (Bs Y.YY)" */
export function formatPrecio(usd, bcv) {
  if (usd == null || usd === '' || usd === '—') return '—'
  const n = Number(usd)
  if (!Number.isFinite(n)) return String(usd)
  const tasa = Number(bcv) || 36.5
  const bs = n * tasa
  return `$${n.toFixed(2)} (Bs. ${bs.toFixed(2)})`
}

/** Solo $ */
export function formatUsd(usd) {
  if (usd == null || usd === '' || usd === '—') return '—'
  const n = Number(usd)
  if (!Number.isFinite(n)) return String(usd)
  return `$${n.toFixed(2)}`
}
