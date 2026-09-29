import { useState } from 'react'
import { Row, Col, Form, Button, Alert, Collapse } from 'react-bootstrap'
import Tarjeta from '../common/Tarjeta'
import CamaraSelfie from '../auth/CamaraSelfie'
import OpcionPago from '../auth/OpcionPago'
import DatosTarjeta from '../auth/DatosTarjeta'
import { listaCampos } from '../../utils/validaciones'
import { buscarDuplicado, guardarSocio, actualizarSocio, normalizarDni } from '../../utils/socios'
import { registrarCambios } from '../../utils/auditoria'
import { erroresTarjeta, resumirTarjeta, revisarNumeroTarjeta, tarjetaVacia } from '../../utils/tarjetas'

const campos = listaCampos(['nombre', 'dni', 'fechaNacimiento', 'direccion', 'telefono', 'email'])
const vacio = Object.fromEntries(campos.map((c) => [c.nombre, '']))
const opcionesPago = [
  { valor: 'efectivo', etiqueta: 'Efectivo en la sede' },
  { valor: 'tarjeta', etiqueta: 'Tarjeta' },
]

// La contraseña inicial es el DNI, igual que cuando se restablece; el socio la cambia desde su panel
const contrasenaInicial = (dni) => normalizarDni(dni)

function NuevoSocio({ empleado, onCreado }) {
  const [valores, setValores] = useState(vacio)
  const [foto, setFoto] = useState(null)
  const [validado, setValidado] = useState(false)
  const [duplicado, setDuplicado] = useState(null)
  const [creado, setCreado] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [pago, setPago] = useState('efectivo')
  const [tarjeta, setTarjeta] = useState(tarjetaVacia)

  const invalido = (c) => validado && (!c.valido(valores[c.nombre]) || duplicado === c.nombre)
  const erroresPago = pago === 'tarjeta' ? erroresTarjeta(tarjeta) : {}
  const marcarTarjeta = (campo) => validado && erroresPago[campo]

  const guardar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (campos.some((c) => !c.valido(valores[c.nombre])) || Object.values(erroresPago).some(Boolean)) return
    const repetido = buscarDuplicado(valores)
    if (repetido) {
      setDuplicado(repetido)
      return
    }

    setGuardando(true)
    const contrasena = contrasenaInicial(valores.dni)
    const socio = await guardarSocio({
      ...valores,
      contrasena,
      foto,
      fotoActualizada: foto ? new Date().toISOString() : null,
      debeCambiarContrasena: true,
      medioPago: pago === 'tarjeta' ? resumirTarjeta(tarjeta) : { tipo: 'efectivo', debitoAutomatico: false },
    })
    setGuardando(false)
    if (!socio) return

    actualizarSocio(socio.id, { estado: 'Activo', altaPresencial: true })
    registrarCambios({
      socioId: socio.id,
      socioNombre: socio.nombre,
      seccion: 'Alta presencial',
      autor: `${empleado.nombre} (${empleado.codigo})`,
      cambios: [{ campo: 'Estado', anterior: 'Sin cuenta', nuevo: 'Activo' }],
    })
    setCreado({ nombre: socio.nombre, email: socio.email, contrasena })
    setValores(vacio)
    setFoto(null)
    setPago('efectivo')
    setTarjeta(tarjetaVacia)
    setValidado(false)
    onCreado()
  }

  return (
    <Tarjeta titulo="Alta presencial de socio">
      <p className="text-body-secondary">
        Para personas que se acercan a la sede. Verificá el DNI en persona: el socio queda <strong>activo</strong> al instante, sin pasar por la validación online.
      </p>

      {creado && (
        <Alert variant="success" dismissible onClose={() => setCreado(null)}>
          <strong>{creado.nombre}</strong> ya es socio. Entregale estos datos para ingresar al portal:
          <div className="font-numeros mt-2">
            Correo: {creado.email}
            <br />
            Contraseña inicial: {creado.contrasena}
          </div>
        </Alert>
      )}

      <Form noValidate onSubmit={guardar}>
        <Row className="g-4">
          <Col lg={3} className="text-center">
            <div className="small fw-semibold mb-2">Foto (opcional)</div>
            <CamaraSelfie foto={foto} onCapturar={setFoto} variante="clara" textoVacio="Sacar foto" />
          </Col>
          <Col lg={9}>
            <Row className="g-3">
              {campos.map((c) => (
                <Col key={c.nombre} md={6}>
                  <Form.Group controlId={`nuevo-${c.nombre}`}>
                    <Form.Label className="small fw-semibold">{c.etiqueta}</Form.Label>
                    <Form.Control
                      type={c.tipo ?? 'text'}
                      inputMode={c.inputMode}
                      value={valores[c.nombre]}
                      onChange={(e) => {
                        setValores({ ...valores, [c.nombre]: e.target.value })
                        if (duplicado === c.nombre) setDuplicado(null)
                      }}
                      isInvalid={invalido(c)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {duplicado === c.nombre ? `Ya hay un socio con este ${c.etiqueta.toLowerCase()}.` : c.mensaje}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              ))}
            </Row>
            <div className="bg-secondary text-white rounded-4 p-3 p-md-4 mt-4 mb-3">
              <div className="small fw-bold text-uppercase mb-3">Medio de pago de la cuota social</div>
              <Row className="g-3">
                {opcionesPago.map((opcion) => (
                  <Col xs={6} key={opcion.valor}>
                    <OpcionPago {...opcion} elegido={pago} onElegir={setPago} />
                  </Col>
                ))}
              </Row>
              <Collapse in={pago === 'tarjeta'}>
                <div>
                  <DatosTarjeta tarjeta={tarjeta} onCambiar={setTarjeta} marcar={marcarTarjeta} mensajes={{ numero: revisarNumeroTarjeta(tarjeta.numero, tarjeta.emisor) }} />
                </div>
              </Collapse>
              {pago === 'efectivo' && <p className="small text-white-50 mt-3 mb-0">Paga cada mes en la secretaría de la sede, hasta el día 15.</p>}
            </div>
            <Button type="submit" variant="secondary" className="rounded-pill px-4" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Dar de alta'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Tarjeta>
  )
}

export default NuevoSocio
