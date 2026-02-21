import { Navigate, useLocation } from 'react-router-dom'
import { getToken, getRif } from '../config/api'

export default function ClientGuard({ children }) {
  const location = useLocation()
  const token = getToken()
  const rif = getRif()
  if (!token || !rif) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}
