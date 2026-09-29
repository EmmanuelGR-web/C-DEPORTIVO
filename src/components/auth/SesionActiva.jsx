import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaSignOutAlt } from 'react-icons/fa'
import { useSesion } from '../../hooks/useSesion'

function SesionActiva() {
  const { usuario, cerrarSesion } = useSesion()
  const navegar = useNavigate()

  const salir = () => {
    cerrarSesion()
    navegar('/login', { replace: true })
  }

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 bg-body-tertiary rounded-4 p-3 mb-4">
      <p className="mb-0">
        Hola, <strong>{usuario.nombre}</strong> · <span className="text-body-secondary">{usuario.rolTexto}</span>
      </p>
      <Button variant="primary" className="rounded-pill d-inline-flex align-items-center gap-2" onClick={salir}>
        <FaSignOutAlt aria-hidden="true" /> Cerrar sesión
      </Button>
    </div>
  )
}

export default SesionActiva
