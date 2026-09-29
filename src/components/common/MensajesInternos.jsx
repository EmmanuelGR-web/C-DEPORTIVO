import { useState } from 'react'
import { Row, Col, Badge, ListGroup, Button } from 'react-bootstrap'
import MensajeHilo from './MensajeHilo'
import Redactor from '../socio/Redactor'
import { correosInternos, crearHiloInterno, marcarLeidoInterno, nombresInternos, responderInterno } from '../../utils/mensajesInternos'

const fechaCorta = (iso) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Bandeja interna entre el personal administrativo y el administrador principal.
// La usan los dos paneles: `rol` indica desde qué lado se está escribiendo.
function MensajesInternos({ rol, hilos, onCambio }) {
  const [abierto, setAbierto] = useState(null)
  const [redactando, setRedactando] = useState(false)
  const otro = rol === 'admin' ? 'empleado' : 'admin'
  const hilo = hilos.find((h) => h.id === abierto)
  const verDetalle = Boolean(hilo) || redactando

  const abrir = (id) => {
    setRedactando(false)
    setAbierto(id)
    marcarLeidoInterno(rol, id)
    onCambio()
  }

  const responder = (datos) => {
    const ok = responderInterno(rol, abierto, datos)
    if (ok) onCambio()
    return ok
  }

  const crear = (datos) => {
    const id = crearHiloInterno(rol, datos)
    if (!id) return false
    setRedactando(false)
    setAbierto(id)
    onCambio()
    return true
  }

  return (
    <>
      <div className="bg-white rounded-4 shadow-sm p-3 mb-3 small">
        Canal interno con <strong>{nombresInternos[otro]}</strong> · {correosInternos[otro]}
      </div>

      <Row className="g-3">
        <Col lg={5} className={verDetalle ? 'd-none d-lg-block' : ''}>
          <Button
            variant="secondary"
            className="w-100 rounded-pill mb-3"
            onClick={() => {
              setAbierto(null)
              setRedactando(true)
            }}
          >
            Nuevo mensaje
          </Button>
          <ListGroup className="shadow-sm rounded-4">
            {hilos.map((h) => {
              const ultimo = h.mensajes.at(-1)
              return (
                <ListGroup.Item key={h.id} action active={h.id === abierto} onClick={() => abrir(h.id)} className="py-3">
                  <div className="d-flex align-items-center gap-2">
                    {!h.leidoPor[rol] && (
                      <Badge bg="warning" text="dark">
                        Nuevo
                      </Badge>
                    )}
                    <span className={`text-truncate ${h.leidoPor[rol] ? '' : 'fw-bold'}`}>{h.asunto}</span>
                    <small className="ms-auto text-nowrap opacity-75">{fechaCorta(ultimo.fecha)}</small>
                  </div>
                  <small className="d-block text-truncate opacity-75">{ultimo.texto}</small>
                </ListGroup.Item>
              )
            })}
          </ListGroup>
        </Col>

        <Col lg={7} className={verDetalle ? '' : 'd-none d-lg-block'}>
          <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100">
            {verDetalle && (
              <Button
                variant="link"
                className="d-lg-none p-0 mb-3 link-secondary"
                onClick={() => {
                  setAbierto(null)
                  setRedactando(false)
                }}
              >
                ← Volver
              </Button>
            )}
            {redactando && (
              <>
                <h2 className="h5 fw-bold text-secondary mb-1">Nuevo mensaje</h2>
                <p className="small text-body-secondary">Para: {correosInternos[otro]}</p>
                <Redactor id={`interno-nuevo-${rol}`} conAsunto onEnviar={crear} onCancelar={() => setRedactando(false)} />
              </>
            )}
            {hilo && (
              <>
                <h2 className="h5 fw-bold text-secondary mb-3">{hilo.asunto}</h2>
                {hilo.mensajes.map((m) => (
                  <MensajeHilo key={m.id} mensaje={m} propio={m.rol === rol} nombreOtro={nombresInternos[otro]} />
                ))}
                <div className="border-top pt-3">
                  <Redactor id={`interno-${hilo.id}`} textoBoton="Responder" onEnviar={responder} />
                </div>
              </>
            )}
            {!verDetalle && <div className="h-100 d-flex align-items-center justify-content-center text-center text-body-secondary py-5">Elegí un mensaje para leerlo y responder.</div>}
          </div>
        </Col>
      </Row>
    </>
  )
}

export default MensajesInternos
