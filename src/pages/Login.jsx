import { Container } from 'react-bootstrap'
import { useTituloPagina } from '../hooks/useTituloPagina'

function Login() {
  useTituloPagina('Iniciar sesión')

  return (
    <Container className="py-5">
      <h1>Iniciar sesión</h1>
    </Container>
  )
}

export default Login
