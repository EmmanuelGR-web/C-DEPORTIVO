import { useState } from 'react'
import { Row, Col, Button, Alert, Modal, Image } from 'react-bootstrap'
import Tarjeta from '../common/Tarjeta'
import EstadoBadge from '../common/EstadoBadge'
import DatosPersonales from '../socio/DatosPersonales'
import MedioPago from '../socio/MedioPago'
import PagosFiltrables from '../socio/PagosFiltrables'
import { perfilSocio, guardarCambiosSocio } from '../../utils/perfilSocio'
import { eliminarSocio, restablecerContrasena, normalizarDni } from '../../utils/socios'
import { alertaExito, confirmarBorrado } from '../../utils/alertas'
import { registrarCambios } from '../../utils/auditoria'
import { categorias } from '../../utils/categorias'
import { formatearPesos } from '../../utils/carnet'

function FichaSocio({ socioId, empleado, onVolver, onCambio, puedeDarDeBaja = false }) {
  const [perfil, setPerfil] = useState(() => perfilSocio({ id: socioId }))
  const [confirmar, setConfirmar] = useState(false)
  const [aviso, setAviso] = useState('')
  const autor = `${empleado.nombre} (${empleado.codigo})`

  const recargar = () => {
    setPerfil(perfilSocio({ id: socioId }))
    onCambio()
  }

  const guardar = (cambios, seccion) => {
    const huboCambios = guardarCambiosSocio(perfil, cambios, seccion, autor)
    if (huboCambios) recargar()
    return huboCambios
  }

  const restablecer = async () => {
    setConfirmar(false)
    const ok = await restablecerContrasena(perfil)
    if (!ok) {
      setAviso('No se pudo restablecer la contraseña en este navegador.')
      return
    }
    registrarCambios({
      socioId: perfil.id,
      socioNombre: perfil.nombre,
      seccion: 'Contraseña',
      autor,
      cambios: [{ campo: 'Contraseña', anterior: '••••••', nuevo: 'Restablecida al DNI' }],
    })
    setAviso(`Listo. ${perfil.nombre} ya puede ingresar con su DNI (${normalizarDni(perfil.dni)}) como contraseña. Al entrar se le va a sugerir cambiarla.`)
    recargar()
  }

  const darDeBaja = async () => {
    const confirmada = await confirmarBorrado({
      titulo: `¿Dar de baja a ${perfil.nombre}?`,
      texto: `Se borra del padrón del club (N° ${perfil.numeroSocio}). No se puede deshacer.`,
      boton: 'Sí, dar de baja',
      accion: () => eliminarSocio(perfil.id),
    })
    if (!confirmada) return
    registrarCambios({
      socioId: perfil.id,
      socioNombre: perfil.nombre,
      seccion: 'Baja de socio',
      autor,
      cambios: [{ campo: 'Estado', anterior: perfil.estado, nuevo: 'Dado de baja' }],
    })
    alertaExito(`${perfil.nombre} ya no figura en el padrón.`, 'Baja registrada')
    onCambio()
    onVolver()
  }

  if (!perfil) {
    return (
      <Alert variant="warning">
        Este socio ya no está en el padrón.{' '}
        <Button variant="link" className="link-secondary p-0" onClick={onVolver}>
          Volver al padrón
        </Button>
      </Alert>
    )
  }

  const deuda = perfil.pagos.filter((p) => ['Pendiente', 'Vencido'].includes(p.estado)).reduce((total, p) => total + p.monto, 0)
  const estilo = categorias[perfil.categoria]

  return (
    <>
      <Button variant="link" className="link-secondary p-0 mb-3" onClick={onVolver}>
        ← Volver al padrón
      </Button>

      <Tarjeta className="mb-4">
        <Row className="g-3 align-items-center">
          <Col xs="auto">
            {perfil.foto ? (
              <Image src={perfil.foto} alt={`Foto de ${perfil.nombre}`} width={84} height={84} roundedCircle className="object-fit-cover border border-3 border-secondary" />
            ) : (
              <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center font-credencial fw-bold fs-3" style={{ width: 84, height: 84 }}>
                {perfil.nombre
                  .split(' ')
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')}
              </div>
            )}
          </Col>
          <Col>
            <h2 className="h4 fw-bold text-secondary mb-1">{perfil.nombre}</h2>
            <div className="d-flex flex-wrap align-items-center gap-2 small">
              <span className="font-numeros">N° {perfil.numeroSocio}</span>
              <span className={`badge rounded-pill text-${estilo.texto}`} style={{ backgroundImage: estilo.degradado }}>
                {perfil.categoria}
              </span>
              <EstadoBadge estado={perfil.estado} />
              <span className="text-body-secondary text-break">{perfil.correoInstitucional}</span>
            </div>
          </Col>
          <Col md="auto" className="text-md-end">
            <div className="small text-body-secondary">Deuda actual</div>
            <div className={`font-credencial fw-bold fs-3 ${deuda ? 'text-danger' : 'text-success'}`}>{deuda ? formatearPesos(deuda) : 'Al día'}</div>
          </Col>
        </Row>
      </Tarjeta>

      {aviso && (
        <Alert variant="success" dismissible onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      )}

      <Tarjeta titulo="Acceso al portal" className="mb-4">
        <p className="small text-body-secondary">
          Si el socio no recuerda su contraseña, restablecela: pasa a ser su número de DNI y después la puede cambiar desde su panel.
        </p>
        {perfil.debeCambiarContrasena && <p className="small text-danger">La contraseña está restablecida al DNI y el socio todavía no la cambió.</p>}
        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setConfirmar(true)}>
          Restablecer contraseña
        </Button>
      </Tarjeta>

      {puedeDarDeBaja && (
        <Tarjeta titulo="Baja del socio" className="mb-4">
          <p className="small text-body-secondary">Borra al socio del padrón del club. Sus movimientos dejan de figurar en la facturación. No se puede deshacer.</p>
          <Button variant="outline-danger" className="rounded-pill px-4" onClick={darDeBaja}>
            Dar de baja
          </Button>
        </Tarjeta>
      )}

      <div className="mb-4">
        <DatosPersonales socio={perfil} onGuardar={guardar} textoEditar="Corregir datos" textoGuardado="Datos del socio corregidos. El cambio quedó registrado con tu nombre." vistaPersonal />
      </div>
      <MedioPago socio={perfil} onGuardar={guardar} />
      <Tarjeta titulo="Movimientos">
        <PagosFiltrables socio={perfil} />
      </Tarjeta>

      <Modal show={confirmar} onHide={() => setConfirmar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-secondary">Restablecer contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          La contraseña de <strong>{perfil.nombre}</strong> va a pasar a ser su DNI (<span className="font-numeros">{normalizarDni(perfil.dni)}</span>). La anterior deja de
          funcionar. ¿Confirmás?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setConfirmar(false)}>
            Cancelar
          </Button>
          <Button variant="secondary" className="rounded-pill px-4" onClick={restablecer}>
            Restablecer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default FichaSocio
