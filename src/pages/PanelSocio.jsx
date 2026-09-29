import { useState } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
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
import Bandeja from '../components/socio/Bandeja'
import Tarjeta from '../components/socio/Tarjeta'
import { menuSocio } from '../data/menus'
import { beneficios } from '../data/socio'
import { perfilSocio, guardarCambiosSocio } from '../utils/perfilSocio'
import { leerHilos, guardarHilos } from '../utils/mensajes'
import { descargarCredencial } from '../utils/pdf'

const titulos = { resumen: 'Mi resumen', datos: 'Datos personales', pagos: 'Facturas y pagos', bandeja: 'Bandeja de entrada' }

function PanelSocio() {
  useTituloPagina('Panel del socio')
  const { usuario } = useSesion()
  const [socio, setSocio] = useState(() => perfilSocio(usuario))
  const [hilos, setHilos] = useState(() => leerHilos(socio))
  const [seccion, setSeccion] = useState('resumen')
  const [descargando, setDescargando] = useState(false)

  const sinLeer = hilos.filter((h) => !h.leido).length
  const items = menuSocio.map((item) => (item.id === 'bandeja' ? { ...item, contador: sinLeer } : item))

  const guardarCambios = (cambios, seccionCambiada) => {
    const huboCambios = guardarCambiosSocio(socio, cambios, seccionCambiada)
    if (huboCambios) setSocio(perfilSocio(usuario))
    return huboCambios
  }

  const cambiarHilos = (nuevos) => {
    const guardado = guardarHilos(socio.id, nuevos)
    if (guardado) setHilos(nuevos)
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
    >
      {seccion === 'resumen' && (
        <>
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
        </>
      )}

      {seccion === 'pagos' && (
        <>
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

export default PanelSocio
