import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function BannerVideo({ video, textoBoton = 'Asociate', altura = '70vh' }) {
  return (
    <section
      id="inicio"
      className="position-relative overflow-hidden bg-dark"
      style={{ height: altura, minHeight: 360 }}
    >
      <video
        src={video}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="position-absolute start-0 w-100 object-fit-cover"
        // El video trae franjas negras arriba (con la marca de agua) y abajo: se agranda y se centra para dejarlas afuera
        style={{ height: '131%', top: '-15.5%' }}
      />

    
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />

      <div className="position-relative h-100 d-flex align-items-center justify-content-center">
        <Button
          as={Link}
          to="/registro"
          variant="primary"
          size="lg"
          className="rounded-pill px-5 py-3 fw-bold text-uppercase shadow"
        >
          {textoBoton}
        </Button>
      </div>
    </section>
  )
}

export default BannerVideo
