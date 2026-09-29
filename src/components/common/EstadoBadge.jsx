import { Badge } from 'react-bootstrap'

const estilos = {
  Aprobado: { bg: 'success' },
  Activo: { bg: 'success' },
  Autorizado: { bg: 'success' },
  Pendiente: { bg: 'warning', texto: 'dark' },
  'En validación': { bg: 'warning', texto: 'dark' },
  Rechazado: { bg: 'danger' },
  Inactivo: { bg: 'secondary' },
}

function EstadoBadge({ estado }) {
  const { bg, texto } = estilos[estado] ?? { bg: 'secondary' }
  return (
    <Badge bg={bg} text={texto} pill>
      {estado}
    </Badge>
  )
}

export default EstadoBadge
