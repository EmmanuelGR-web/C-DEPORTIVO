import BarraNavegacion from '../components/layout/BarraNavegacion'
import PiePagina from '../components/layout/PiePagina'
import Telon from '../components/inicio/Telon'
import BannerVideo from '../components/inicio/BannerVideo'
import ResenaHistorica from '../components/inicio/ResenaHistorica'
import { enlacesInicio } from '../data/menus'
import { resumenResena, paginasRevista } from '../data/revista'

function Inicio() {
  return (
    <>
      <Telon imagen="/telon.jpeg" />
      <BarraNavegacion enlaces={enlacesInicio} />
      <BannerVideo video="/videobanner.mp4" />
      <ResenaHistorica resumen={resumenResena} paginas={paginasRevista} />
      <PiePagina />
    </>
  )
}

export default Inicio
