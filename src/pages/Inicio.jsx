import BarraNavegacion from '../components/layout/BarraNavegacion'
import PiePagina from '../components/layout/PiePagina'
import Telon from '../components/inicio/Telon'
import BannerVideo from '../components/inicio/BannerVideo'
import { enlacesInicio } from '../data/menus'

function Inicio() {
  return (
    <>
      <Telon imagen="/telon.jpeg" />
      <BarraNavegacion enlaces={enlacesInicio} />
      <BannerVideo video="/videobanner.mp4" />
      <PiePagina />
    </>
  )
}

export default Inicio
