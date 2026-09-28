import { Container } from 'react-bootstrap'
import { useTituloPagina } from '../hooks/useTituloPagina'

function Registro() {
  useTituloPagina('Asociate')

  return (
    <Container className="py-5">
      <h1>Registro de nuevo socio</h1>
    </Container>
  )
}

export default Registro
