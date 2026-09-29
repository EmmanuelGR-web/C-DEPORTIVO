import { useEffect, useState } from 'react'
import { useSesion } from '../hooks/useSesion'
import { accesoRestringido, guardarAvisoBloqueo } from '../utils/personal'
import { useDatosEnVivo } from '../hooks/useDatosEnVivo'
import MensajesInternos from '../components/common/MensajesInternos'
import { leerHilosInternos } from '../utils/mensajesInternos'
import { useTituloPagina } from '../hooks/useTituloPagina'
import PanelLayout from '../components/layout/PanelLayout'
import ResumenGestion from '../components/empleado/ResumenGestion'
import Solicitudes from '../components/empleado/Solicitudes'
import DetalleSolicitud from '../components/empleado/DetalleSolicitud'
import ListaSocios from '../components/empleado/ListaSocios'
import FichaSocio from '../components/empleado/FichaSocio'
import MensajesSocios from '../components/empleado/MensajesSocios'
import RegistroCambios from '../components/empleado/RegistroCambios'
import NuevoSocio from '../components/empleado/NuevoSocio'
import DatosEmpleado from '../components/empleado/DatosEmpleado'
import ControlJornada from '../components/empleado/ControlJornada'
import { registrarSalida } from '../utils/jornada'
import { menuEmpleado } from '../data/menus'
import { empleadoDemo } from '../data/gestion'
import { listarPerfiles } from '../utils/perfilSocio'
import { leerAuditoria } from '../utils/auditoria'
import { listarConversaciones, listarSolicitudes, resolverSolicitud, responderConversacion } from '../utils/gestion'

const titulos = {
  resumen: 'Panel administrativo',
  solicitudes: 'Solicitudes',
  socios: 'Socios',
  mensajes: 'Mensajes de socios',
  cambios: 'Registro de cambios',
  interno: 'Administración principal',
  nuevo: 'Nuevo socio',
  datos: 'Mis datos',
}

const leerTodo = () => {
  const perfiles = listarPerfiles()
  const registros = leerAuditoria().reverse()
  const haceUnaSemana = Date.now() - 7 * 24 * 3600 * 1000
  return {
    perfiles,
    registros,
    solicitudes: listarSolicitudes(),
    conversaciones: listarConversaciones(perfiles),
    cambiosSemana: registros.filter((r) => new Date(r.fecha) > haceUnaSemana).length,
    hilosInternos: leerHilosInternos().filter((h) => h.empleado.id === empleadoDemo.id),
    ausencia: accesoRestringido(empleadoDemo.id),
  }
}

function PanelEmpleado() {
  useTituloPagina('Panel administrativo')
  const [seccion, setSeccion] = useState('resumen')
  const [datos, recargar, actualizado] = useDatosEnVivo(leerTodo)
  const [revisando, setRevisando] = useState(null)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [fichaAbierta, setFichaAbierta] = useState(null)
  const { cerrarSesion } = useSesion()
  useEffect(() => {
    if (!datos.ausencia) return
    registrarSalida(empleadoDemo.id, true)
    guardarAvisoBloqueo(datos.ausencia)
    cerrarSesion()
  }, [datos.ausencia, cerrarSesion])

  const revisar = (solicitud) => {
    setRevisando(solicitud)
    setMostrarDetalle(true)
  }

  const resolver = (solicitud, estado, motivo) => {
    resolverSolicitud(solicitud, estado, empleadoDemo, motivo)
    recargar()
    setRevisando(listarSolicitudes().find((s) => s.id === solicitud.id))
  }

  const responder = (socio, hiloId, mensaje) => {
    const guardado = responderConversacion(socio, hiloId, mensaje)
    if (guardado) recargar()
    return guardado
  }

  const pendientes = datos.solicitudes.filter((s) => s.estado === 'Pendiente').length
  const sinResponder = datos.conversaciones.filter((c) => c.sinResponder).length
  const internosSinLeer = datos.hilosInternos.filter((h) => !h.leidoPor.empleado).length
  const contadores = { solicitudes: pendientes, mensajes: sinResponder, interno: internosSinLeer }
  const items = menuEmpleado.map((item) => ({ ...item, contador: contadores[item.id] }))

  return (
    <PanelLayout
      titulo={titulos[seccion]}
      usuario={{ nombre: empleadoDemo.nombre, foto: null }}
      detalle={`Código ${empleadoDemo.codigo} · ${empleadoDemo.sector}`}
      items={items}
      activo={seccion}
      onActualizar={recargar}
      actualizado={actualizado}
      extra={<ControlJornada empleado={empleadoDemo} />}
      alSalir={() => registrarSalida(empleadoDemo.id)}
      onSeleccionar={(id) => {
        setSeccion(id)
        setFichaAbierta(null)
      }}
    >
      {seccion === 'resumen' && <ResumenGestion {...datos} onIr={setSeccion} onRevisar={revisar} />}
      {seccion === 'solicitudes' && <Solicitudes solicitudes={datos.solicitudes} onRevisar={revisar} />}
      {seccion === 'socios' &&
        (fichaAbierta ? (
          <FichaSocio key={fichaAbierta} socioId={fichaAbierta} empleado={empleadoDemo} onVolver={() => setFichaAbierta(null)} onCambio={recargar} />
        ) : (
          <ListaSocios perfiles={datos.perfiles} onAbrir={setFichaAbierta} />
        ))}
      {seccion === 'mensajes' && <MensajesSocios conversaciones={datos.conversaciones} onResponder={responder} />}
      {seccion === 'cambios' && <RegistroCambios registros={datos.registros} />}
      {seccion === 'interno' && <MensajesInternos rol="empleado" hilos={datos.hilosInternos} onCambio={recargar} empleado={empleadoDemo} />}
      {seccion === 'nuevo' && <NuevoSocio empleado={empleadoDemo} onCreado={recargar} />}
      {seccion === 'datos' && <DatosEmpleado empleado={empleadoDemo} />}

      <DetalleSolicitud solicitud={revisando} mostrar={mostrarDetalle} onCerrar={() => setMostrarDetalle(false)} onResolver={resolver} />
    </PanelLayout>
  )
}

export default PanelEmpleado
