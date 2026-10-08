import { useEffect, useState } from 'react'
import { Form, FloatingLabel, Button } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useSesion } from '../../hooks/useSesion'
import { usuariosDemo } from '../../data/usuarios'
import RecuperarContrasena from './RecuperarContrasena'
import UsuariosPrueba from './UsuariosPrueba'
import { borrarAvisoBloqueo, leerAvisoBloqueo, textoAusencia, textoRegreso } from '../../utils/personal'
import { tomarAvisoSalida } from '../../utils/jornada'
import { alertaAviso, alertaBienvenida, alertaError, alertaExito } from '../../utils/alertas'

const avisarBloqueo = (bloqueo) =>
  alertaAviso(`${textoAusencia(bloqueo)}. ${textoRegreso(bloqueo).replace('Vuelve', 'Vas a poder ingresar')}.`, 'Tu acceso está pausado')

function FormularioLogin() {
  const { iniciarSesion } = useSesion()
  const navegar = useNavigate()
  const ubicacion = useLocation()

  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [recordar, setRecordar] = useState(false)
  const [verContrasena, setVerContrasena] = useState(false)
  const [validado, setValidado] = useState(false)
  const [recuperar, setRecuperar] = useState(false)
  const [avisoInicial] = useState(() => ({ bloqueo: leerAvisoBloqueo(), despedida: tomarAvisoSalida() }))

  useEffect(() => {
    if (avisoInicial.despedida) alertaExito(avisoInicial.despedida, 'Jornada terminada')
    else if (avisoInicial.bloqueo) avisarBloqueo(avisoInicial.bloqueo)
    borrarAvisoBloqueo()
  }, [avisoInicial])

  const emailInvalido = validado && !/^\S+@\S+\.\S+$/.test(email)
  const contrasenaInvalida = validado && contrasena.length < 6

  const enviar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (!/^\S+@\S+\.\S+$/.test(email) || contrasena.length < 6) return

    const usuario = await iniciarSesion(email, contrasena, recordar)
    if (!usuario) {
      alertaError('Revisá el correo y la contraseña e intentá de nuevo.', 'Datos incorrectos')
      return
    }
    if (usuario.errorConexion) {
      alertaError(usuario.errorConexion, 'No pudimos verificar tu cuenta')
      return
    }
    if (usuario.bloqueado) {
      avisarBloqueo(usuario.bloqueado)
      return
    }
    alertaBienvenida(`¡Hola, ${usuario.nombre.split(' ')[0]}!`)
    navegar(ubicacion.state?.desde ?? usuario.ruta, { replace: true })
  }

  const usarUsuario = (usuario) => {
    setEmail(usuario.email)
    setContrasena(usuario.contrasena)
  }

  return (
    <>
      <Form noValidate onSubmit={enviar}>
        <FloatingLabel controlId="login-email" label="Correo electrónico" className="text-body mb-3">
          <Form.Control
            type="email"
            placeholder="nombre@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={emailInvalido}
            autoComplete="email"
          />
          <Form.Control.Feedback type="invalid" className="text-warning fw-semibold">
            Ingresá un correo electrónico válido.
          </Form.Control.Feedback>
        </FloatingLabel>

        <FloatingLabel controlId="login-contrasena" label="Contraseña" className="text-body mb-3">
          <Form.Control
            type={verContrasena ? 'text' : 'password'}
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            isInvalid={contrasenaInvalida}
            autoComplete="current-password"
            className="pe-5"
            style={{ backgroundImage: 'none' }}
          />
          <Button
            variant="link"
            className="position-absolute top-0 end-0 link-secondary mt-2 me-2"
            onClick={() => setVerContrasena(!verContrasena)}
            aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {verContrasena ? <FaEyeSlash /> : <FaEye />}
          </Button>
          <Form.Control.Feedback type="invalid" className="text-warning fw-semibold">
            La contraseña tiene al menos 6 caracteres.
          </Form.Control.Feedback>
        </FloatingLabel>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 small">
          <Form.Check
            id="login-recordar"
            label="Mantener sesión iniciada"
            checked={recordar}
            onChange={(e) => setRecordar(e.target.checked)}
          />
          <Button variant="link" className="link-light p-0 small" onClick={() => setRecuperar(true)}>
            ¿Olvidaste tu contraseña?
          </Button>
        </div>

        <Button type="submit" variant="light" size="lg" className="w-100 rounded-pill fw-bold text-uppercase text-secondary shadow">
          Ingresar
        </Button>

        <p className="text-center small mt-4 mb-0">
          ¿No tenés tu cuenta club?{' '}
          <Link to="/registro" className="link-warning fw-bold text-uppercase">
            Registrate acá
          </Link>
        </p>
      </Form>

      <UsuariosPrueba usuarios={usuariosDemo} onElegir={usarUsuario} />
      <RecuperarContrasena mostrar={recuperar} onCerrar={() => setRecuperar(false)} />
    </>
  )
}

export default FormularioLogin
