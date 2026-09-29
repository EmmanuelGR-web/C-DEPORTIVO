import { useState } from 'react'
import { Row, Col, Form, Button, Alert, Collapse } from 'react-bootstrap'
import Tarjeta from '../common/Tarjeta'
import { formatearPesos } from '../../utils/carnet'
import { calcularCuota, diaVencimiento, interesDiario } from '../../utils/cuotas'
import { leerAdjunto, tamanioLegible, textoLimite } from '../../utils/mensajes'

const hoyISO = () => new Date().toISOString().slice(0, 10)
const nombreMes = (periodo) => new Date(`${periodo}-01T12:00:00`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

function InformarPago({ cuota, onInformar }) {
  const [abierto, setAbierto] = useState(false)
  const [fechaPago, setFechaPago] = useState(hoyISO)
  const [medio, setMedio] = useState('Transferencia')
  const [comprobante, setComprobante] = useState(null)
  const [error, setError] = useState('')
  const [validado, setValidado] = useState(false)

  const [anio, mes] = cuota.periodo.split('-').map(Number)
  const segunFecha = calcularCuota(cuota.base, anio, mes - 1, new Date(`${fechaPago}T12:00:00`), new Date(cuota.vence))
  const enRevision = cuota.estado === 'En revisión'

  const elegirArchivo = async (e) => {
    setError('')
    const archivo = e.target.files[0]
    if (!archivo) return
    if (!/^image\/|application\/pdf/.test(archivo.type)) {
      setError('El comprobante tiene que ser una imagen o un PDF.')
      return
    }
    try {
      setComprobante(await leerAdjunto(archivo))
    } catch (problema) {
      setError(problema.message)
    }
  }

  const enviar = (e) => {
    e.preventDefault()
    setValidado(true)
    if (!comprobante || !fechaPago || fechaPago > hoyISO()) return
    const guardado = onInformar(cuota, { fechaPago, medio, comprobante, monto: segunFecha.total })
    if (!guardado) setError('No pudimos guardar el comprobante en este navegador.')
  }

  return (
    <Tarjeta titulo={`Cuota de ${nombreMes(cuota.periodo)}`} className="mb-4">
      <Row className="g-3 align-items-center">
        <Col md>
          <div className="font-credencial fw-bold text-secondary lh-1" style={{ fontSize: '2.6rem' }}>
            {formatearPesos(cuota.monto)}
          </div>
          {cuota.recargo > 0 ? (
            <p className="small text-danger mb-0">
              Cuota {formatearPesos(cuota.base)} + {formatearPesos(cuota.recargo)} de recargo por {cuota.diasDemora} {cuota.diasDemora === 1 ? 'día' : 'días'} de demora.
            </p>
          ) : (
            <p className="small text-body-secondary mb-0">Sin recargo si pagás hasta el {diaVencimiento} de este mes.</p>
          )}
        </Col>
        <Col md="auto">
          {enRevision ? (
            <Alert variant="info" className="small mb-0">
              Informaste el pago el {new Date(`${cuota.informe.fechaPago}T12:00:00`).toLocaleDateString('es-AR')}. El personal está revisando tu comprobante.
            </Alert>
          ) : (
            <Button variant="secondary" className="rounded-pill px-4" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
              Informar pago
            </Button>
          )}
        </Col>
      </Row>

      {cuota.informe?.estado === 'Rechazado' && !abierto && (
        <Alert variant="danger" className="small mt-3 mb-0">
          El comprobante que enviaste fue rechazado{cuota.informe.motivo ? `: ${cuota.informe.motivo}` : '.'} Podés informar el pago de nuevo.
        </Alert>
      )}

      <p className="small text-body-secondary border-top pt-3 mt-3 mb-0">
        La cuota vence el {diaVencimiento} de cada mes. Después se suma un recargo del {(interesDiario * 100).toLocaleString('es-AR')} % por día de demora.
      </p>

      <Collapse in={abierto && !enRevision}>
        <div>
          <Form noValidate onSubmit={enviar} className="bg-body-tertiary rounded-4 p-3 mt-3">
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="pago-fecha">
                  <Form.Label className="small fw-semibold">Fecha en que pagaste</Form.Label>
                  <Form.Control
                    type="date"
                    max={hoyISO()}
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                    isInvalid={validado && (!fechaPago || fechaPago > hoyISO())}
                  />
                  <Form.Control.Feedback type="invalid">Elegí una fecha que no sea futura.</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="pago-medio">
                  <Form.Label className="small fw-semibold">Cómo pagaste</Form.Label>
                  <Form.Select value={medio} onChange={(e) => setMedio(e.target.value)}>
                    <option>Transferencia</option>
                    <option>Efectivo</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="pago-comprobante">
                  <Form.Label className="small fw-semibold">Comprobante</Form.Label>
                  <Form.Control type="file" accept="image/*,application/pdf" onChange={elegirArchivo} isInvalid={validado && !comprobante} />
                  <Form.Control.Feedback type="invalid">Adjuntá el comprobante. {textoLimite}.</Form.Control.Feedback>
                  {comprobante && (
                    <Form.Text>
                      {comprobante.nombre} ({tamanioLegible(comprobante.tamanio)})
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
            {error && (
              <Alert variant="warning" className="small mt-3 mb-0">
                {error}
              </Alert>
            )}
            <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
              <span className="small">
                Monto a esa fecha: <strong>{formatearPesos(segunFecha.total)}</strong>
                {segunFecha.recargo > 0 && ` (incluye ${formatearPesos(segunFecha.recargo)} de recargo)`}
              </span>
              <Button type="submit" variant="secondary" className="rounded-pill px-4 ms-auto">
                Enviar comprobante
              </Button>
            </div>
          </Form>
        </div>
      </Collapse>
    </Tarjeta>
  )
}

export default InformarPago
