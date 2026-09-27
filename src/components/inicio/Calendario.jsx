import { useEffect, useRef, useState } from 'react'
import { Row, Col, Button, Modal } from 'react-bootstrap'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaMapMarkerAlt, FaTicketAlt, FaTv } from 'react-icons/fa'
import TarjetaEvento from './TarjetaEvento'
import { formatearFechaLarga } from '../../utils/fechas'

function DatoEvento({ icono: Icono, children }) {
  return (
    <p className="d-flex align-items-start gap-2 mb-2">
      <Icono className="text-primary mt-1 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

function Calendario({ eventos }) {
  const cinta = useRef(null)
  const [enInicio, setEnInicio] = useState(true)
  const [enFinal, setEnFinal] = useState(false)
  const [abierto, setAbierto] = useState(null)
  const [mostrar, setMostrar] = useState(false)

  const actualizarFlechas = () => {
    const { scrollLeft, scrollWidth, clientWidth } = cinta.current
    setEnInicio(scrollLeft <= 1)
    setEnFinal(scrollLeft + clientWidth >= scrollWidth - 1)
  }

  useEffect(() => {
    actualizarFlechas()
    window.addEventListener('resize', actualizarFlechas)
    return () => window.removeEventListener('resize', actualizarFlechas)
  }, [])

  const mover = (sentido) => {
    const anchoTarjeta = cinta.current.firstElementChild.offsetWidth
    cinta.current.scrollBy({ left: sentido * anchoTarjeta, behavior: 'smooth' })
  }

  const abrir = (evento) => {
    setAbierto(evento)
    setMostrar(true)
  }

  return (
    <section id="calendario" className="bg-white rounded-4 shadow-sm p-4">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <span className="d-none d-sm-inline-flex align-items-center justify-content-center rounded-circle bg-secondary text-white p-3 fs-4">
          <FaCalendarAlt aria-hidden="true" />
        </span>
        <div>
          <span className="text-uppercase fw-bold text-primary small">Agenda</span>
          <h2 className="fw-bolder text-uppercase fst-italic mb-0">Calendario</h2>
        </div>
        <div className="ms-auto d-flex gap-2">
          <Button variant="outline-secondary" className="rounded-circle" onClick={() => mover(-1)} disabled={enInicio} aria-label="Eventos anteriores">
            <FaChevronLeft />
          </Button>
          <Button variant="secondary" className="rounded-circle" onClick={() => mover(1)} disabled={enFinal} aria-label="Eventos siguientes">
            <FaChevronRight />
          </Button>
        </div>
      </div>

      <Row
        ref={cinta}
        onScroll={actualizarFlechas}
        className="flex-nowrap overflow-auto g-3 pb-2"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {eventos.map((evento) => (
          <Col key={evento.id} xs={10} sm={6} md={4} xl={3} style={{ scrollSnapAlign: 'start' }}>
            <TarjetaEvento evento={evento} onAbrir={abrir} />
          </Col>
        ))}
      </Row>

      <Modal show={mostrar} onHide={() => setMostrar(false)} centered>
        {abierto && (
          <>
            <Modal.Header closeButton closeVariant="white" className="bg-secondary text-white">
              <Modal.Title className="h5 fw-bold">
                <span className="d-block text-uppercase small text-white-50">{abierto.disciplina}</span>
                {abierto.titulo}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <DatoEvento icono={FaCalendarAlt}>{formatearFechaLarga(abierto.fecha)}</DatoEvento>
              <DatoEvento icono={FaClock}>{abierto.hora} h</DatoEvento>
              <DatoEvento icono={FaMapMarkerAlt}>{abierto.lugar}</DatoEvento>
              {abierto.entradas && <DatoEvento icono={FaTicketAlt}>{abierto.entradas}</DatoEvento>}
              {abierto.transmision && <DatoEvento icono={FaTv}>{abierto.transmision}</DatoEvento>}
              <hr />
              {abierto.descripcion.map((parrafo) => (
                <p key={parrafo} className="mb-2">
                  {parrafo}
                </p>
              ))}
            </Modal.Body>
          </>
        )}
      </Modal>
    </section>
  )
}

export default Calendario
