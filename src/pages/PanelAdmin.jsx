import { Container } from 'react-bootstrap'
import { useTituloPagina } from '../hooks/useTituloPagina'

function PanelAdmin() {
  useTituloPagina('Panel del administrador')

  return (
    <Container className="py-5">
      <h1>Panel administrador principal</h1>
    </Container>
  )
}

export default PanelAdmin
