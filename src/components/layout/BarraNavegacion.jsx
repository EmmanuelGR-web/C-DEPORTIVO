import { useState } from 'react'
import { Offcanvas, Nav, Button, Fade, Image, CloseButton } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaBars } from 'react-icons/fa'
import { useSesion } from '../../hooks/useSesion'

function BarraNavegacion({ enlaces }) {
  const { usuario } = useSesion()
  const [mostrar, setMostrar] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [esMobile, setEsMobile] = useState(false)

  
  const abrir = () => {
    setEsMobile(window.matchMedia('(max-width: 767.98px)').matches)
    setMostrar(true)
  }
  const cerrar = () => setMostrar(false)

  return (
    <>
      <Button
        variant="secondary"
        size="lg"
        className="position-fixed top-0 start-0 m-3 z-3 shadow"
        aria-label="Abrir menú"
        onClick={abrir}
      >
        <FaBars />
      </Button>

      <Offcanvas
        show={mostrar}
        onHide={cerrar}
        onEntered={() => setMenuAbierto(true)}
        onExited={() => setMenuAbierto(false)}
        placement="start"
        className={`bg-secondary text-white ${esMobile ? 'rounded-bottom shadow' : ''}`}
        style={{ width: 220, bottom: esMobile ? 'auto' : undefined }}
      >
        <Offcanvas.Header className="justify-content-center position-relative pt-4">
          <CloseButton
            variant="white"
            aria-label="Cerrar menú"
            onClick={cerrar}
            className="position-absolute top-0 end-0 m-3"
          />
          <Image src="/logo.png" alt="Escudo del club" width={110} height={110} className="object-fit-cover" />
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column">
          <Nav
            className="flex-column gap-1"
            style={{ '--bs-nav-link-color': '#fff', '--bs-nav-link-hover-color': 'var(--club-dorado)' }}
          >
            {enlaces.map((enlace, indice) => (
              <Fade
                in={menuAbierto}
                key={enlace.href}
                style={{
                  transition: `opacity 400ms ease ${indice * 120}ms, transform 400ms ease ${indice * 120}ms`,
                  transform: menuAbierto ? 'none' : 'translateY(-12px)',
                }}
              >
                <Nav.Link href={enlace.href} onClick={cerrar} className="fw-semibold">
                  {enlace.etiqueta}
                </Nav.Link>
              </Fade>
            ))}
          </Nav>

          <Button as={Link} to={usuario ? usuario.ruta : '/login'} variant="primary" className={esMobile ? 'mt-4' : 'mt-auto'}>
            {usuario ? 'Mi panel' : 'Ingresar'}
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default BarraNavegacion
