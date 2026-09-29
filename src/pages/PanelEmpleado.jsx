import { Container } from 'react-bootstrap'
import { useTituloPagina } from '../hooks/useTituloPagina'
import SesionActiva from '../components/auth/SesionActiva'

function PanelEmpleado() {
  useTituloPagina('Panel administrativo')

  return (
    <Container className="py-5">
      <SesionActiva />
      <h1>Panel administrativo</h1>
    </Container>
  )
}

export default PanelEmpleado
