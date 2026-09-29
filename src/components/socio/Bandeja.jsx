import { useState } from 'react'
import { Row, Col, Button, Badge, ListGroup } from 'react-bootstrap'
import Redactor from './Redactor'
import { correoAdministracion } from '../../utils/perfilSocio'
import { tamanioLegible } from '../../utils/mensajes'

const fechaHora = (iso) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function Mensaje({ mensaje, propio }) {
  return (
    <div className={`d-flex ${propio ? 'justify-content-end' : ''}`}>
      <div className={`rounded-4 p-3 mb-3 ${propio ? 'bg-primary-subtle' : 'bg-body-tertiary'}`} style={{ maxWidth: '85%' }}>
        <div className="small text-body-secondary text-break mb-1">
          <strong className="text-body">{propio ? 'Vos' : 'Administración'}</strong> · {mensaje.de} → {mensaje.para}
        </div>
        <p className="mb-2 text-break" style={{ whiteSpace: 'pre-line' }}>
          {mensaje.texto}
        </p>
        {mensaje.adjuntos.map((a) => (
          <a key={a.nombre} href={a.dataUrl} download={a.nombre} className="d-inline-block small link-secondary me-3">
            Adjunto: {a.nombre} ({tamanioLegible(a.tamanio)})
          </a>
        ))}
        <div className="small text-body-secondary text-end">{fechaHora(mensaje.fecha)}</div>
      </div>
    </div>
  )
}

function Bandeja({ socio, hilos, onCambiar }) {
  const [abierto, setAbierto] = useState(null)
  const [redactando, setRedactando] = useState(false)
  const hilo = hilos.find((h) => h.id === abierto)
  const verDetalle = Boolean(hilo) || redactando

  const nuevoMensaje = ({ texto, adjuntos }) => ({
    id: crypto.randomUUID(),
    de: socio.correoInstitucional,
    para: correoAdministracion,
    fecha: new Date().toISOString(),
    texto,
    adjuntos,
  })

  const abrir = (id) => {
    setRedactando(false)
    setAbierto(id)
    onCambiar(hilos.map((h) => (h.id === id ? { ...h, leido: true } : h)))
  }

  const responder = (datos) => onCambiar(hilos.map((h) => (h.id === abierto ? { ...h, mensajes: [...h.mensajes, nuevoMensaje(datos)] } : h)))

  const crear = (datos) => {
    const id = crypto.randomUUID()
    const guardado = onCambiar([{ id, asunto: datos.asunto, leido: true, mensajes: [nuevoMensaje(datos)] }, ...hilos])
    if (guardado) {
      setRedactando(false)
      setAbierto(id)
    }
    return guardado
  }

  return (
    <>
      <div className="bg-white rounded-4 shadow-sm p-3 mb-3 small d-flex flex-wrap gap-3">
        <span>
          Tu correo institucional: <strong className="text-break">{socio.correoInstitucional}</strong>
        </span>
        <span>
          Administración: <strong>{correoAdministracion}</strong>
        </span>
      </div>

      <Row className="g-3">
        <Col lg={5} className={verDetalle ? 'd-none d-lg-block' : ''}>
          <Button variant="secondary" className="w-100 rounded-pill mb-3" onClick={() => { setAbierto(null); setRedactando(true) }}>
            Nuevo mensaje a administración
          </Button>
          <ListGroup className="shadow-sm rounded-4">
            {hilos.map((h) => {
              const ultimo = h.mensajes.at(-1)
              return (
                <ListGroup.Item key={h.id} action active={h.id === abierto} onClick={() => abrir(h.id)} className="py-3">
                  <div className="d-flex align-items-center gap-2">
                    {!h.leido && <Badge bg="warning" text="dark">Nuevo</Badge>}
                    <span className={`text-truncate ${h.leido ? '' : 'fw-bold'}`}>{h.asunto}</span>
                    <small className="ms-auto text-nowrap opacity-75">{fechaHora(ultimo.fecha)}</small>
                  </div>
                  <small className="d-block text-truncate opacity-75">
                    {h.mensajes.length > 1 && `(${h.mensajes.length}) `}
                    {ultimo.texto}
                  </small>
                </ListGroup.Item>
              )
            })}
          </ListGroup>
        </Col>

        <Col lg={7} className={verDetalle ? '' : 'd-none d-lg-block'}>
          <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100">
            {verDetalle && (
              <Button variant="link" className="d-lg-none p-0 mb-3 link-secondary" onClick={() => { setAbierto(null); setRedactando(false) }}>
                ← Volver a la bandeja
              </Button>
            )}

            {redactando && (
              <>
                <h2 className="h5 fw-bold text-secondary mb-1">Nuevo mensaje</h2>
                <p className="small text-body-secondary">Para: {correoAdministracion}</p>
                <Redactor id="nuevo" conAsunto onEnviar={crear} onCancelar={() => setRedactando(false)} />
              </>
            )}

            {hilo && (
              <>
                <h2 className="h5 fw-bold text-secondary mb-3">{hilo.asunto}</h2>
                {hilo.mensajes.map((m) => (
                  <Mensaje key={m.id} mensaje={m} propio={m.de !== correoAdministracion} />
                ))}
                <div className="border-top pt-3">
                  <Redactor id={`responder-${hilo.id}`} textoBoton="Responder" onEnviar={responder} />
                </div>
              </>
            )}

            {!verDetalle && (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center text-body-secondary py-5">
                Elegí un mensaje para leerlo y responder.
              </div>
            )}
          </div>
        </Col>
      </Row>
    </>
  )
}

export default Bandeja
