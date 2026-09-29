import { Container } from 'react-bootstrap'
import { useTituloPagina } from '../hooks/useTituloPagina'
import SesionActiva from '../components/auth/SesionActiva'

function PanelSocio() {
  useTituloPagina('Panel del socio')

  return (
    <Container className="py-5">
      <SesionActiva />
      <h1>Panel del socio</h1>
    </Container>
  )
}

export default PanelSocio
