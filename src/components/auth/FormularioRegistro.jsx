import { useState } from 'react'
import { Form, Row, Col, Button, Alert, Collapse, Spinner, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaIdCard, FaCreditCard, FaMoneyBillWave, FaCheckCircle, FaUserPlus, FaRobot, FaMagic } from 'react-icons/fa'
import SubirImagen from './SubirImagen'
import CamaraSelfie from './CamaraSelfie'
import OpcionPago from './OpcionPago'
import CampoContrasena from './CampoContrasena'
import DatosTarjeta from './DatosTarjeta'
import { contactoClub } from '../../data/club'
import { erroresTarjeta, resumirTarjeta, revisarNumeroTarjeta, tarjetaVacia } from '../../utils/tarjetas'
import { leerDni } from '../../utils/leerDni'
import { buscarDuplicado, guardarSocio } from '../../utils/socios'
import { tarjetaVidrio } from './estilosAuth'

const edadValida = (fecha) => {
  const nacimiento = new Date(`${fecha}T12:00:00`)
  const anios = (Date.now() - nacimiento) / (365.25 * 24 * 3600 * 1000)
  return anios >= 0 && anios < 110
}

const camposDni = [
  { nombre: 'nombre', etiqueta: 'Nombre completo', autoComplete: 'name', valido: (v) => v.trim().length >= 3, mensaje: 'Ingresá tu nombre y apellido.' },
  { nombre: 'dni', etiqueta: 'Número de DNI', inputMode: 'numeric', valido: (v) => /^\d{7,8}$/.test(v.replace(/\./g, '')), mensaje: 'El DNI tiene 7 u 8 números.' },
  { nombre: 'fechaNacimiento', etiqueta: 'Fecha de nacimiento', tipo: 'date', valido: edadValida, mensaje: 'Ingresá una fecha de nacimiento válida.' },
  { nombre: 'direccion', etiqueta: 'Dirección', autoComplete: 'street-address', valido: (v) => v.trim().length >= 5, mensaje: 'Ingresá tu dirección.' },
]

const camposContacto = [
  { nombre: 'telefono', etiqueta: 'Teléfono de contacto', tipo: 'tel', autoComplete: 'tel', ejemplo: '381 555-1234', valido: (v) => v.replace(/\D/g, '').length >= 8, mensaje: 'Ingresá un teléfono válido.' },
  { nombre: 'email', etiqueta: 'Correo electrónico', tipo: 'email', autoComplete: 'email', ejemplo: 'nombre@correo.com', valido: (v) => /^\S+@\S+\.\S+$/.test(v), mensaje: 'Ingresá un correo electrónico válido.' },
]

const mediosPago = [
  { valor: 'tarjeta', etiqueta: 'Tarjeta', icono: FaCreditCard },
  { valor: 'efectivo', etiqueta: 'Efectivo', icono: FaMoneyBillWave },
]

const vacio = { nombre: '', dni: '', fechaNacimiento: '', direccion: '', telefono: '', email: '', contrasena: '', repetir: '' }

function Titulo({ children }) {
  return <h2 className="h6 fw-bold text-uppercase mb-3">{children}</h2>
}

function CampoTexto({ campo, valor, onCambiar, invalido, leido, mensaje }) {
  return (
    <Form.Group className="mb-3" controlId={`registro-${campo.nombre}`}>
      <Form.Label className="d-flex align-items-center gap-2">
        {campo.etiqueta} *
        {leido !== undefined && (
          <Badge bg={valor === leido ? 'warning' : 'light'} text="dark" className="d-inline-flex align-items-center gap-1">
            <FaMagic aria-hidden="true" /> {valor === leido ? 'Leído por IA' : 'Corregido'}
          </Badge>
        )}
      </Form.Label>
      <Form.Control
        type={campo.tipo ?? 'text'}
        inputMode={campo.inputMode}
        autoComplete={campo.autoComplete}
        placeholder={campo.ejemplo}
        value={valor}
        onChange={(e) => onCambiar(campo.nombre, e.target.value)}
        isInvalid={invalido}
      />
      <Form.Control.Feedback type="invalid" className="text-warning fw-semibold">
        {mensaje ?? campo.mensaje}
      </Form.Control.Feedback>
    </Form.Group>
  )
}

function FormularioRegistro() {
  const [datos, setDatos] = useState(vacio)
  const [imagenes, setImagenes] = useState({ frente: null, dorso: null })
  const [selfie, setSelfie] = useState(null)
  const [lectura, setLectura] = useState('pendiente')
  const [leidos, setLeidos] = useState({})
  const [pago, setPago] = useState('')
  const [tarjeta, setTarjeta] = useState(tarjetaVacia)
  const [terminos, setTerminos] = useState(false)
  const [validado, setValidado] = useState(false)
  const [registrado, setRegistrado] = useState(null)
  const [duplicado, setDuplicado] = useState(null)
  const [errorGuardado, setErrorGuardado] = useState(false)

  const cambiar = (campo, valor) => {
    setDatos((actual) => ({ ...actual, [campo]: valor }))
    if (campo === duplicado) setDuplicado(null)
  }

  const leerDocumento = () => {
    setLectura('leyendo')
    leerDni().then((resultado) => {
      setLeidos(resultado)
      setDatos((actual) => ({ ...actual, ...resultado }))
      setLectura('lista')
    })
  }

  const elegirImagen = (campo) => (url) => {
    const nuevas = { ...imagenes, [campo]: url }
    setImagenes(nuevas)
    if (nuevas.frente && nuevas.dorso) leerDocumento()
  }

  const errores = {
    ...Object.fromEntries([...camposDni, ...camposContacto].map((c) => [c.nombre, !c.valido(datos[c.nombre])])),
    contrasena: datos.contrasena.length < 6,
    repetir: datos.repetir !== datos.contrasena || datos.repetir === '',
    frente: !imagenes.frente,
    dorso: !imagenes.dorso,
    selfie: !selfie,
    pago: !pago,
    terminos: !terminos,
  }
  const errorNumero = revisarNumeroTarjeta(tarjeta.numero, tarjeta.emisor)
  if (pago === 'tarjeta') Object.assign(errores, erroresTarjeta(tarjeta))
  if (duplicado) errores[duplicado] = true
  const hayErrores = Object.values(errores).some(Boolean)
  const marcar = (campo) => validado && errores[campo]

  const armarMedioPago = () => (pago === 'tarjeta' ? resumirTarjeta(tarjeta) : { tipo: 'efectivo', debitoAutomatico: false })

  const enviar = async (e) => {
    e.preventDefault()
    setValidado(true)
    setErrorGuardado(false)
    if (hayErrores) return

    const repetido = buscarDuplicado(datos)
    if (repetido) {
      setDuplicado(repetido)
      return
    }
    const { nombre, dni, fechaNacimiento, direccion, telefono, email } = datos
    const socio = await guardarSocio({ nombre, dni, fechaNacimiento, direccion, telefono, email, contrasena: datos.contrasena, foto: selfie, fotoActualizada: new Date().toISOString(), medioPago: armarMedioPago() })
    if (!socio) {
      setErrorGuardado(true)
      return
    }
    setRegistrado(nombre.trim().split(' ')[0])
  }

  if (registrado) {
    return (
      <div className={`${tarjetaVidrio} text-center p-5 mx-auto`} style={{ maxWidth: 520 }}>
        <img src={selfie} alt="Tu foto de perfil" width={110} height={110} className="rounded-circle object-fit-cover border border-3 border-warning mb-3" />
        <h2 className="fw-bold d-flex align-items-center justify-content-center gap-2">
          <FaCheckCircle className="text-warning" aria-hidden="true" /> ¡Bienvenido/a, {registrado}!
        </h2>
        <p className="text-white-50">
          Recibimos tu solicitud. El personal del club va a validar tus datos y te avisaremos por correo cuando tu carnet digital esté activo.
        </p>
        <Button as={Link} to="/login" variant="light" size="lg" className="rounded-pill px-5 fw-bold text-uppercase text-secondary">
          Ir a ingresar
        </Button>
      </div>
    )
  }

  return (
    <Form noValidate onSubmit={enviar}>
      {validado && hayErrores && (
        <Alert variant="warning" className="py-2">
          {duplicado
            ? `Ya hay un socio registrado con ese ${duplicado === 'email' ? 'correo' : 'DNI'}. Si es tuyo, ingresá con tu cuenta.`
            : 'Revisá los campos marcados antes de continuar.'}
        </Alert>
      )}
      {errorGuardado && (
        <Alert variant="danger" className="py-2">
          No pudimos guardar tu registro en este navegador. Probá liberar espacio o salir del modo privado.
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={5}>
          <div className={`${tarjetaVidrio} p-4 h-100`}>
            <Titulo>1. Verificación de identidad *</Titulo>
            <Row className="g-3 mb-2">
              <Col xs={6}>
                <SubirImagen id="dni-frente" etiqueta="Frente del DNI" icono={FaIdCard} vista={imagenes.frente} onElegir={elegirImagen('frente')} invalido={marcar('frente')} />
              </Col>
              <Col xs={6}>
                <SubirImagen id="dni-dorso" etiqueta="Dorso del DNI" icono={FaIdCard} vista={imagenes.dorso} onElegir={elegirImagen('dorso')} invalido={marcar('dorso')} />
              </Col>
            </Row>
            <p className="small text-white-50 mb-4">
              {lectura === 'lista' ? '✓ Datos leídos. Revisalos a la derecha.' : 'Con las dos fotos, la IA completa tus datos personales.'}
            </p>

            <Titulo>2. Foto de perfil *</Titulo>
            <div className="mb-2">
              <CamaraSelfie foto={selfie} onCapturar={setSelfie} invalido={marcar('selfie')} />
            </div>
            <p className="small text-white-50 text-center mb-4">Es la foto que va a aparecer en tu carnet digital.</p>

            <Titulo>3. Método de pago *</Titulo>
            <Row className="g-3">
              {mediosPago.map((medio) => (
                <Col xs={6} key={medio.valor}>
                  <OpcionPago {...medio} elegido={pago} onElegir={setPago} invalido={marcar('pago')} />
                </Col>
              ))}
            </Row>

            <Collapse in={pago === 'tarjeta'}>
              <div>
                <DatosTarjeta tarjeta={tarjeta} onCambiar={setTarjeta} marcar={marcar} mensajes={{ numero: errorNumero }} />
              </div>
            </Collapse>
            <Collapse in={pago === 'efectivo'}>
              <div>
                <p className="small text-white-50 border-top border-light border-opacity-25 pt-3 mt-3 mb-0">
                  Abonás la inscripción en la secretaría de la sede ({contactoClub.direccion}), {contactoClub.horario.toLowerCase()}.
                </p>
              </div>
            </Collapse>
          </div>
        </Col>

        <Col lg={7}>
          <div className={`${tarjetaVidrio} p-4 h-100`}>
            <Titulo>4. Datos personales</Titulo>

            {lectura === 'pendiente' && (
              <div className="text-center text-white-50 py-5">
                <FaRobot className="display-4 text-warning mb-3" aria-hidden="true" />
                <p className="mb-0">
                  Subí el <strong className="text-white">frente y el dorso de tu DNI</strong> y nuestra IA va a completar tus datos automáticamente.
                </p>
              </div>
            )}

            {lectura === 'leyendo' && (
              <div className="text-center py-5" role="status">
                <Spinner animation="grow" variant="warning" className="mb-3" />
                <p className="mb-0">Extrayendo datos …</p>
              </div>
            )}

            {lectura === 'lista' && (
              <>
                <Alert variant="light" className="small py-2 d-flex align-items-center gap-2">
                  <FaMagic className="text-warning flex-shrink-0" aria-hidden="true" />
                  Completamos estos datos con tu DNI. Si alguno está mal, podés corregirlo.
                </Alert>

                {camposDni.map((campo) => (
                  <CampoTexto key={campo.nombre} campo={campo} valor={datos[campo.nombre]} onCambiar={cambiar} invalido={marcar(campo.nombre)} leido={leidos[campo.nombre]} mensaje={duplicado === campo.nombre ? `Ya hay un socio registrado con este ${campo.etiqueta.toLowerCase()}.` : undefined} />
                ))}
                {camposContacto.map((campo) => (
                  <CampoTexto key={campo.nombre} campo={campo} valor={datos[campo.nombre]} onCambiar={cambiar} invalido={marcar(campo.nombre)} mensaje={duplicado === campo.nombre ? `Ya hay un socio registrado con este ${campo.etiqueta.toLowerCase()}.` : undefined} />
                ))}

                <Row className="g-md-3">
                  <Col md={6}>
                    <CampoContrasena
                      id="registro-contrasena"
                      etiqueta="Contraseña"
                      valor={datos.contrasena}
                      onCambiar={(v) => cambiar('contrasena', v)}
                      invalido={marcar('contrasena')}
                      mensaje="Al menos 6 caracteres."
                    />
                  </Col>
                  <Col md={6}>
                    <CampoContrasena
                      id="registro-repetir"
                      etiqueta="Repetir contraseña"
                      valor={datos.repetir}
                      onCambiar={(v) => cambiar('repetir', v)}
                      invalido={marcar('repetir')}
                      mensaje="Las contraseñas no coinciden."
                    />
                  </Col>
                </Row>

                <Form.Check
                  id="registro-terminos"
                  className={`mb-4 ${marcar('terminos') ? 'text-warning' : ''}`}
                  checked={terminos}
                  onChange={(e) => setTerminos(e.target.checked)}
                  label="Acepto los términos y condiciones del club"
                />

                <Button
                  type="submit"
                  variant="light"
                  size="lg"
                  className="w-100 rounded-pill fw-bold text-uppercase text-secondary shadow d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <FaUserPlus aria-hidden="true" /> Completar registro
                </Button>
              </>
            )}

            <p className="text-center small mt-4 mb-0">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="link-warning fw-bold text-uppercase">
                Ingresá acá
              </Link>
            </p>
          </div>
        </Col>
      </Row>
    </Form>
  )
}

export default FormularioRegistro
