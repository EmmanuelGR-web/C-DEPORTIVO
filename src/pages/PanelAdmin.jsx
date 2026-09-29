import { Container } from 'react-bootstrap'
import { useTituloPagina } from '../hooks/useTituloPagina'
import SesionActiva from '../components/auth/SesionActiva'

function PanelAdmin() {
  useTituloPagina('Panel del administrador')

  return (
    <Container className="py-5">
      <SesionActiva />
      <h1>Panel administrador principal</h1>
    </Container>
  )
}

export default PanelAdmin
