import { Container, Image, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { useTituloPagina } from '../hooks/useTituloPagina'
import FormularioRegistro from '../components/auth/FormularioRegistro'
import PiePagina from '../components/layout/PiePagina'
import { fondoElectrico } from '../components/auth/estilosAuth'

function Registro() {
  useTituloPagina('Asociate')

  return (
    <div className="bg-black min-vh-100 d-flex flex-column">
      <main className="flex-grow-1 text-white py-4" style={fondoElectrico}>
        <Container style={{ maxWidth: 1080 }}>
          <Button
            as={Link}
            to="/"
            variant="outline-light"
            size="sm"
            className="rounded-pill px-3 d-inline-flex align-items-center gap-2 border-opacity-25 mb-4"
          >
            <FaArrowLeft aria-hidden="true" /> Volver al inicio
          </Button>

          <header className="d-flex align-items-center gap-3 mb-4">
            <Image src="/logo.png" alt="Escudo del Club Deportivo" width={72} height={72} className="object-fit-cover flex-shrink-0" />
            <div>
              <span className="d-block fw-bolder text-uppercase fs-4 lh-1">Club Deportivo</span>
              <h1 className="h5 fw-semibold text-uppercase text-white-50 mb-0">Registro de nuevo socio</h1>
            </div>
          </header>

          <FormularioRegistro />
        </Container>
      </main>
      <PiePagina />
    </div>
  )
}

export default Registro
