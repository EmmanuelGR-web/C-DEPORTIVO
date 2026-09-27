import { Container } from 'react-bootstrap'
import BarraNavegacion from '../components/layout/BarraNavegacion'
import PiePagina from '../components/layout/PiePagina'
import Telon from '../components/inicio/Telon'
import { enlacesInicio } from '../data/menus'

function Inicio() {
  return (
    <>
      <Telon imagen="/telon.jpeg" />
      <BarraNavegacion enlaces={enlacesInicio} />
      <Container className="py-5 text-center">
        <h1>Club Deportivo</h1>
        <img src="/logo.png" alt="Club Deportivo" className="img-fluid" />
      </Container>
      <PiePagina />
    </>
  )
}

export default Inicio
