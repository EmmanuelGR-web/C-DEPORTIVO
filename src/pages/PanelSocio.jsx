import { useCallback, useState } from 'react'
import { useDatosEnVivo } from '../hooks/useDatosEnVivo'
import PantallaCarga from '../components/common/PantallaCarga'
import { Row, Col, Button, Alert } from 'react-bootstrap'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { useSesion } from '../hooks/useSesion'
import PanelLayout from '../components/layout/PanelLayout'
import EstadoMembresia from '../components/socio/EstadoMembresia'
import CarnetDigital from '../components/socio/CarnetDigital'
import PagosFiltrables from '../components/socio/PagosFiltrables'
import MedioPago from '../components/socio/MedioPago'
import Beneficios from '../components/socio/Beneficios'
import DatosPersonales from '../components/socio/DatosPersonales'
import FotoPerfil from '../components/socio/FotoPerfil'
import CambiarContrasena from '../components/socio/CambiarContrasena'
import InformarPago from '../components/socio/InformarPago'
import Bandeja from '../components/socio/Bandeja'
import Tarjeta from '../components/common/Tarjeta'
import { menuSocio } from '../data/menus'
import { beneficios } from '../data/socio'
import { perfilSocio, guardarCambiosSocio } from '../utils/perfilSocio'
import { leerHilos, guardarHilos } from '../utils/mensajes'
import { descargarCredencial } from '../utils/pdf'
import { guardarInforme } from '../utils/cuotas'
import { formatearPesos } from '../utils/carnet'

const titulos = { resumen: 'Mi resumen', datos: 'Datos personales', pagos: 'Facturas y pagos', bandeja: 'Bandeja de entrada' }

function ContenidoSocio({ datos: { socio, hilos }, recargar, actualizado }) {
  const [seccion, setSeccion] = useState('resumen')
  const [descargando, setDescargando] = useState(false)

  const sinLeer = hilos.filter((h) => !h.leido).length
  const items = menuSocio.map((item) => (item.id === 'bandeja' ? { ...item, contador: sinLeer } : item))
  const cuotaAbierta = socio.pagos.find((p) => ['Pendiente', 'Vencido', 'En revisión'].includes(p.estado))

  const guardarCambios = (cambios, seccionCambiada) => {
    const huboCambios = guardarCambiosSocio(socio, cambios, seccionCambiada)
    if (huboCambios) recargar()
    return huboCambios
  }

  const informarPago = (cuota, datos) => {
    const guardado = guardarInforme(socio.id, cuota.periodo, { ...datos, vence: cuota.vence, estado: 'En revisión', informadoEl: new Date().toISOString() })
    if (guardado) recargar()
    return guardado
  }

  const cambiarHilos = (nuevos) => {
    const guardado = guardarHilos(socio.id, nuevos)
    if (guardado) recargar()
    return guardado
  }

  const bajarCredencial = async () => {
    setDescargando(true)
    await descargarCredencial(socio)
    setDescargando(false)
  }

  return (
    <PanelLayout
      titulo={titulos[seccion]}
      usuario={{ nombre: socio.nombre, foto: socio.foto }}
      detalle={`Socio ${socio.categoria} · N° ${socio.numeroSocio}`}
      items={items}
      activo={seccion}
      onSeleccionar={setSeccion}
      onActualizar={recargar}
      actualizado={actualizado}
    >
      {seccion === 'resumen' && (
        <>
          {socio.debeCambiarContrasena && (
            <Alert variant="warning" className="d-flex flex-wrap align-items-center gap-2">
              Tu contraseña actual es tu número de DNI. Te recomendamos cambiarla por una propia.
              <Button size="sm" variant="secondary" className="rounded-pill ms-auto" onClick={() => setSeccion('datos')}>
                Cambiarla ahora
              </Button>
            </Alert>
          )}
          {cuotaAbierta && cuotaAbierta.estado !== 'En revisión' && (
            <Alert variant={cuotaAbierta.estado === 'Vencido' ? 'danger' : 'warning'} className="d-flex flex-wrap align-items-center gap-2">
              {cuotaAbierta.estado === 'Vencido'
                ? `Tu cuota ${cuotaAbierta.fecha} está vencida: ${formatearPesos(cuotaAbierta.monto)} con recargo por ${cuotaAbierta.diasDemora} días de demora.`
                : `Tenés la cuota ${cuotaAbierta.fecha} pendiente: ${formatearPesos(cuotaAbierta.monto)}. Vence el día 15.`}
              <Button size="sm" variant="secondary" className="rounded-pill ms-auto" onClick={() => setSeccion('pagos')}>
                Informar pago
              </Button>
            </Alert>
          )}
          <Row className="g-4 mb-4">
            <Col xl={5}>
              <EstadoMembresia socio={socio} />
            </Col>
            <Col xl={7}>
              <CarnetDigital socio={socio} />
              <Button variant="secondary" className="rounded-pill px-4 mt-3" onClick={bajarCredencial} disabled={descargando}>
                {descargando ? 'Generando…' : 'Descargar credencial para imprimir'}
              </Button>
            </Col>
          </Row>

          <Tarjeta titulo="Mis movimientos" className="mb-4">
            <PagosFiltrables socio={socio} porPagina={6} />
          </Tarjeta>

          <h2 className="h6 fw-bold text-uppercase text-center text-secondary mb-3">Beneficios exclusivos</h2>
          <Beneficios beneficios={beneficios} />
        </>
      )}

      {seccion === 'datos' && (
        <>
          <FotoPerfil socio={socio} onGuardar={guardarCambios} />
          <DatosPersonales socio={socio} onGuardar={guardarCambios} />
          <div className="mt-4">
            <CambiarContrasena socio={socio} onCambiada={recargar} />
          </div>
        </>
      )}

      {seccion === 'pagos' && (
        <>
          {cuotaAbierta && <InformarPago key={cuotaAbierta.periodo + cuotaAbierta.estado} cuota={cuotaAbierta} onInformar={informarPago} />}
          <MedioPago socio={socio} onGuardar={guardarCambios} />
          <Tarjeta titulo="Historial de pagos">
            <PagosFiltrables socio={socio} />
          </Tarjeta>
        </>
      )}

      {seccion === 'bandeja' && <Bandeja socio={socio} hilos={hilos} onCambiar={cambiarHilos} />}
    </PanelLayout>
  )
}

function PanelSocio() {
  useTituloPagina('Panel del socio')
  const { usuario, cerrarSesion } = useSesion()
  const leer = useCallback(() => {
    const perfil = perfilSocio(usuario)
    return { socio: perfil, hilos: perfil ? leerHilos(perfil) : [] }
  }, [usuario])
  const [datos, recargar, actualizado, error] = useDatosEnVivo(leer)
  if (!datos) return <PantallaCarga error={error} onReintentar={recargar} />
  if (!datos.socio) {
    return (
      <div className="min-vh-100 bg-body-tertiary d-flex align-items-center justify-content-center p-3">
        <Alert variant="warning" className="text-center" style={{ maxWidth: 420 }}>
          <p className="fw-semibold">No encontramos tu cuenta de socio.</p>
          <p className="small">Puede que se haya dado de baja. Comunicate con la secretaría del club.</p>
          <Button variant="secondary" className="rounded-pill px-4" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </Alert>
      </div>
    )
  }
  return <ContenidoSocio datos={datos} recargar={recargar} actualizado={actualizado} />
}

export default PanelSocio
