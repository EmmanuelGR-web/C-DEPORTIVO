import { Container } from 'react-bootstrap'
import { useTituloPagina } from '../hooks/useTituloPagina'

function PanelSocio() {
  useTituloPagina('Panel del socio')

  return (
    <Container className="py-5">
      <h1>Panel del socio</h1>
    </Container>
  )
}

export default PanelSocio
