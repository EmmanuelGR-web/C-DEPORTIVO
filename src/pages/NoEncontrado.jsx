import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function NoEncontrado() {
  return (
    <Container className="py-5 text-center">
      <h1>404</h1>
      <p>Pagina inexistente</p>
      <Button as={Link} to="/" variant="primary">Volver al inicio</Button>
    </Container>
  )
}

export default NoEncontrado
