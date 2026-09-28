import { Container } from 'react-bootstrap'
import { useTituloPagina } from '../hooks/useTituloPagina'

function PanelEmpleado() {
  useTituloPagina('Panel administrativo')

  return (
    <Container className="py-5">
      <h1>Panel administrativo</h1>
    </Container>
  )
}

export default PanelEmpleado
