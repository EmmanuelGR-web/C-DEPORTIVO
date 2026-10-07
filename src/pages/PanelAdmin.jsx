import { useState } from 'react'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { useDatosEnVivo } from '../hooks/useDatosEnVivo'
import PantallaCarga from '../components/common/PantallaCarga'
import PanelLayout from '../components/layout/PanelLayout'
import ResumenAdmin from '../components/admin/ResumenAdmin'
import GestionPersonal from '../components/admin/GestionPersonal'
import Facturacion from '../components/admin/Facturacion'
import ControlPersonal from '../components/admin/ControlPersonal'
import GestionNoticias from '../components/admin/GestionNoticias'
import ListaSocios from '../components/empleado/ListaSocios'
import FichaSocio from '../components/empleado/FichaSocio'
import RegistroCambios from '../components/empleado/RegistroCambios'
import MensajesInternos from '../components/common/MensajesInternos'
import { menuAdmin } from '../data/menus'
import { adminDemo } from '../data/gestion'
import { listarPerfiles } from '../utils/perfilSocio'
import { leerAuditoria } from '../utils/auditoria'
import { listarSolicitudes } from '../utils/gestion'
import { leerHilosInternos } from '../utils/mensajesInternos'
import { ausenciaVigente, fechaDeHoy, leerPersonal } from '../utils/personal'
import { leerJornadas, presenciaDe } from '../utils/jornada'

const titulos = {
  resumen: 'Panel del administrador principal',
  personal: 'Personal',
  presencia: 'Control del personal',
  socios: 'Socios',
  facturacion: 'Facturación',
  noticias: 'Noticias',
  reportes: 'Reportes',
  interno: 'Mensajes del personal',
}

const leerTodo = () => {
  const personal = leerPersonal()
  const ahora = Date.now()
  const jornadas = leerJornadas(ahora)
  const trabajando = personal.filter((e) => !ausenciaVigente(e, fechaDeHoy(new Date(ahora))))
  return {
    perfiles: listarPerfiles(),
    personal,
    enActividad: trabajando.length,
    enLinea: trabajando.filter((e) => ['linea', 'descanso'].includes(presenciaDe(e, jornadas, ahora).clave)).length,
    registros: leerAuditoria().reverse(),
    solicitudes: listarSolicitudes(),
    hilosInternos: leerHilosInternos(),
  }
}

function ContenidoAdmin({ datos, recargar, actualizado }) {
  const [seccion, setSeccion] = useState('resumen')
  const [fichaAbierta, setFichaAbierta] = useState(null)

  const ir = (id) => {
    setSeccion(id)
    setFichaAbierta(null)
  }

  const abrirFicha = (id) => {
    setSeccion('socios')
    setFichaAbierta(id)
  }

  const contadores = { interno: datos.hilosInternos.filter((h) => !h.leidoPor.admin).length }
  const items = menuAdmin.map((item) => ({ ...item, contador: contadores[item.id] }))

  return (
    <PanelLayout
      titulo={titulos[seccion]}
      usuario={{ nombre: adminDemo.nombre, foto: null }}
      detalle="Admin principal"
      items={items}
      activo={seccion}
      variante="bordo"
      onActualizar={recargar}
      actualizado={actualizado}
      onSeleccionar={ir}
    >
      {seccion === 'resumen' && <ResumenAdmin {...datos} onIr={ir} />}
      {seccion === 'presencia' && <ControlPersonal personal={datos.personal} />}
      {seccion === 'personal' && <GestionPersonal personal={datos.personal} onCambio={recargar} />}
      {seccion === 'socios' &&
        (fichaAbierta ? (
          <FichaSocio key={fichaAbierta} socioId={fichaAbierta} empleado={adminDemo} onVolver={() => setFichaAbierta(null)} onCambio={recargar} puedeDarDeBaja />
        ) : (
          <ListaSocios perfiles={datos.perfiles} onAbrir={setFichaAbierta} />
        ))}
      {seccion === 'facturacion' && <Facturacion perfiles={datos.perfiles} autor={`${adminDemo.nombre} (${adminDemo.puesto})`} onAbrirFicha={abrirFicha} />}
      {seccion === 'noticias' && <GestionNoticias />}
      {seccion === 'reportes' && <RegistroCambios registros={datos.registros} />}
      {seccion === 'interno' && <MensajesInternos rol="admin" hilos={datos.hilosInternos} onCambio={recargar} personal={datos.personal} />}
    </PanelLayout>
  )
}

function PanelAdmin() {
  useTituloPagina('Panel del administrador')
  const [datos, recargar, actualizado, error] = useDatosEnVivo(leerTodo)
  if (!datos) return <PantallaCarga error={error} onReintentar={recargar} />
  return <ContenidoAdmin datos={datos} recargar={recargar} actualizado={actualizado} />
}

export default PanelAdmin
