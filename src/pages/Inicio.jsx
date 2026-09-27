import { Container, Row, Col } from 'react-bootstrap'
import BarraNavegacion from '../components/layout/BarraNavegacion'
import PiePagina from '../components/layout/PiePagina'
import Telon from '../components/inicio/Telon'
import BannerVideo from '../components/inicio/BannerVideo'
import ResenaHistorica from '../components/inicio/ResenaHistorica'
import Noticias from '../components/inicio/Noticias'
import { enlacesInicio } from '../data/menus'
import { resumenResena, paginasRevista } from '../data/revista'
import { noticias } from '../data/noticias'

function Inicio() {
  return (
    <>
      <Telon imagen="/telon.jpeg" />
      <BarraNavegacion enlaces={enlacesInicio} />
      <BannerVideo video="/videobanner.mp4" />
      <div className="bg-body-tertiary py-5">
        <Container>
          <Row className="g-4">
            
            <Col lg={8} xl={9} className="d-flex flex-column gap-4">
              <ResenaHistorica resumen={resumenResena} paginas={paginasRevista} />
            </Col>
            <Col lg={4} xl={3}>
              <Noticias noticias={noticias} />
            </Col>
          </Row>
        </Container>
      </div>
      <PiePagina />
    </>
  )
}

export default Inicio
