import { Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'

function RutaProtegida({ rol, children }) {
  const { usuario } = useSesion()
  const ubicacion = useLocation()

  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  if (usuario.rol !== rol) return <Navigate to={usuario.ruta} replace />
  return children
}

export default RutaProtegida
