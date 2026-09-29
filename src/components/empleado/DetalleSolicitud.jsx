import { useState } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import EstadoBadge from '../common/EstadoBadge'

const fechaHora = (iso) => new Date(iso).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })

function DetalleSolicitud({ solicitud, mostrar, onCerrar, onResolver }) {
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [validado, setValidado] = useState(false)
  const [ampliado, setAmpliado] = useState(false)

  const reiniciar = () => {
    setRechazando(false)
    setMotivo('')
    setValidado(false)
    setAmpliado(false)
  }

  const rechazar = () => {
    setValidado(true)
    if (motivo.trim().length < 5) return
    onResolver(solicitud, 'Rechazado', motivo.trim())
  }

  return (
    <Modal show={mostrar} onHide={onCerrar} onExited={reiniciar} centered size={ampliado ? 'xl' : 'lg'}>
      {solicitud && (
        <>
          <Modal.Header closeButton closeVariant="white" className="bg-secondary text-white">
            <Modal.Title className="h5 fw-bold">
              <span className="d-block small text-white-50 text-uppercase">{solicitud.tipo}</span>
              {solicitud.socioNombre}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-wrap gap-4 mb-3">
              {solicitud.foto && (
                <img src={solicitud.foto} alt={`Foto de ${solicitud.socioNombre}`} width={110} height={110} className="rounded-4 object-fit-cover border border-3 border-secondary" />
              )}
              <dl className="mb-0 flex-grow-1">
                {solicitud.socioDni && (
                  <>
                    <dt className="small text-uppercase text-body-secondary">DNI</dt>
                    <dd>{solicitud.socioDni}</dd>
                  </>
                )}
                <dt className="small text-uppercase text-body-secondary">Recibida</dt>
                <dd>{fechaHora(solicitud.fecha)}</dd>
                <dt className="small text-uppercase text-body-secondary">Estado</dt>
                <dd className="mb-0">
                  <EstadoBadge estado={solicitud.estado} />
                </dd>
              </dl>
            </div>

            <p>{solicitud.detalle}</p>

            {solicitud.tipo === 'Comprobante de pago' && (
              <div className="bg-body-tertiary rounded-4 p-3 mb-3">
                <div className="small fw-bold text-uppercase text-secondary mb-2">Comprobante enviado</div>
                {!solicitud.comprobante && <p className="small text-body-secondary mb-0">Solicitud de ejemplo, sin archivo adjunto.</p>}
                {solicitud.comprobante?.tipo.startsWith('image/') && (
                  <button type="button" className="d-block w-100 p-0 border-0 bg-transparent mb-2" onClick={() => setAmpliado(!ampliado)} aria-label={ampliado ? 'Achicar comprobante' : 'Ver comprobante en tamaño completo'}>
                    <img
                      src={solicitud.comprobante.dataUrl}
                      alt="Comprobante de pago"
                      className={`rounded-3 border ${ampliado ? 'w-100' : 'img-fluid'}`}
                      style={{ maxHeight: ampliado ? 'none' : 420, cursor: ampliado ? 'zoom-out' : 'zoom-in' }}
                    />
                  </button>
                )}
                {solicitud.comprobante?.tipo === 'application/pdf' && (
                  <object data={solicitud.comprobante.dataUrl} type="application/pdf" className="w-100 rounded-3 border mb-2" style={{ height: 420 }} aria-label="Comprobante en PDF">
                    <p className="small mb-0">Tu navegador no muestra PDF acá: descargalo para verlo.</p>
                  </object>
                )}
                {solicitud.comprobante && (
                  <a href={solicitud.comprobante.dataUrl} download={solicitud.comprobante.nombre} className="d-inline-block small link-secondary">
                    Descargar {solicitud.comprobante.nombre}
                  </a>
                )}
              </div>
            )}

            {solicitud.cambios.length > 0 && (
              <div className="bg-body-tertiary rounded-4 p-3 mb-3">
                <div className="small fw-bold text-uppercase text-secondary mb-2">Cambios pedidos</div>
                {solicitud.cambios.map((c) => (
                  <div key={c.campo} className="small mb-1">
                    <strong>{c.campo}:</strong> <del className="text-body-secondary">{c.anterior}</del> → {c.nuevo}
                  </div>
                ))}
              </div>
            )}

            {solicitud.revision && (
              <Alert variant={solicitud.estado === 'Autorizado' ? 'success' : 'danger'} className="small mb-0">
                {solicitud.estado} por <strong>{solicitud.revision.revisadoPor}</strong> el {fechaHora(solicitud.revision.fecha)}.
                {solicitud.revision.motivo && ` Motivo: ${solicitud.revision.motivo}`}
              </Alert>
            )}

            {rechazando && (
              <Form.Group controlId="motivo-rechazo">
                <Form.Label className="fw-semibold">Motivo del rechazo</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  isInvalid={validado && motivo.trim().length < 5}
                  placeholder="Se lo vamos a enviar al socio por su bandeja de entrada."
                />
                <Form.Control.Feedback type="invalid">Contá brevemente por qué se rechaza.</Form.Control.Feedback>
              </Form.Group>
            )}
          </Modal.Body>

          {solicitud.estado === 'Pendiente' && (
            <Modal.Footer>
              {rechazando ? (
                <>
                  <Button variant="link" className="link-secondary" onClick={() => setRechazando(false)}>
                    Volver
                  </Button>
                  <Button variant="primary" className="rounded-pill px-4" onClick={rechazar}>
                    Confirmar rechazo
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setRechazando(true)}>
                    Rechazar
                  </Button>
                  <Button variant="secondary" className="rounded-pill px-4" onClick={() => onResolver(solicitud, 'Autorizado')}>
                    Autorizar
                  </Button>
                </>
              )}
            </Modal.Footer>
          )}
        </>
      )}
    </Modal>
  )
}

export default DetalleSolicitud
