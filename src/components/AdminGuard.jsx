import { Navigate, useLocation } from 'react-router-dom'
import { isAdminLoggedIn } from '../config/api'

export default function AdminGuard({ children }) {
  const location = useLocation()
  if (!isAdminLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}
