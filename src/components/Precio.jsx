import { useBcv } from '../context/BcvContext'
import { formatPrecio, formatUsd } from '../context/BcvContext'

/** Muestra precio en $ y Bs (o solo $ si soloUsd). Valor en USD. */
export function Precio({ value, soloUsd = false }) {
  const { bcv } = useBcv()
  if (soloUsd) return <>{formatUsd(value)}</>
  return <>{formatPrecio(value, bcv)}</>
}
