import { Container, Row, Col } from 'react-bootstrap'
import BarraNavegacion from '../components/layout/BarraNavegacion'
import PiePagina from '../components/layout/PiePagina'
import Telon from '../components/inicio/Telon'
import BannerVideo from '../components/inicio/BannerVideo'
import ResenaHistorica from '../components/inicio/ResenaHistorica'
import Noticias from '../components/inicio/Noticias'
import Calendario from '../components/inicio/Calendario'
import Disciplinas from '../components/inicio/Disciplinas'
import Galeria from '../components/inicio/Galeria'
import Contacto from '../components/inicio/Contacto'
import BarraProgreso from '../components/common/BarraProgreso'
import BotonVolverArriba from '../components/common/BotonVolverArriba'
import { enlacesInicio } from '../data/menus'
import { resumenResena, paginasRevista } from '../data/revista'
import { noticias } from '../data/noticias'
import { eventos } from '../data/eventos'
import { disciplinas } from '../data/disciplinas'
import { fotosGaleria } from '../data/galeria'
import { contactoClub } from '../data/club'
import { useTituloPagina } from '../hooks/useTituloPagina'

function Inicio() {
  useTituloPagina()

  return (
    <>
      <Telon imagen="/telon.jpeg" />
      <BarraProgreso />
      <BarraNavegacion enlaces={enlacesInicio} />
      <BannerVideo
        video="/videobanner.mp4"
        titulo="Club Deportivo"
        lema="Más de 100 años de historia, pasión y comunidad tucumana"
      />
      <div className="bg-body-tertiary py-5">
        <Container>
          <Row className="g-4">
            
            <Col lg={8} xl={9} className="d-flex flex-column gap-4">
              <ResenaHistorica resumen={resumenResena} paginas={paginasRevista} />
              <Calendario eventos={eventos} />
              <Row className="g-4">
                <Col xl={6}>
                  <Disciplinas disciplinas={disciplinas} />
                </Col>
                <Col xl={6}>
                  <Galeria fotos={fotosGaleria} />
                </Col>
              </Row>
            </Col>
            <Col lg={4} xl={3}>
              <Noticias noticias={noticias} />
            </Col>
          </Row>
        </Container>
      </div>
      <PiePagina>
        <Contacto datos={contactoClub} />
      </PiePagina>
      <BotonVolverArriba />
    </>
  )
}

export default Inicio
