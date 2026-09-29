import { useState } from 'react'
import { Row, Col, Form, Button, Collapse, Badge, CloseButton } from 'react-bootstrap'
import Tarjeta from '../common/Tarjeta'
import { coincide } from '../../utils/texto'

const fechaHora = (iso) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Cada tipo de cambio tiene su color, para distinguirlos de un vistazo
const tipos = [
  { id: 'datos', etiqueta: 'Datos personales', color: 'primary', coincide: (s) => s === 'Datos personales' },
  { id: 'identidad', etiqueta: 'Datos de identidad', color: 'secondary', coincide: (s) => s === 'Datos de identidad' },
  { id: 'pago', etiqueta: 'Medio de pago', color: 'warning', coincide: (s) => s === 'Medio de pago' },
  { id: 'foto', etiqueta: 'Foto de perfil', color: 'info', coincide: (s) => s === 'Foto de perfil' },
  { id: 'clave', etiqueta: 'Contraseña', color: 'dark', coincide: (s) => s === 'Contraseña' },
  { id: 'revertido', etiqueta: 'Cambios revertidos', color: 'danger', coincide: (s) => s === 'Cambio revertido' },
  { id: 'solicitud', etiqueta: 'Solicitudes resueltas', color: 'success', coincide: (s) => s.startsWith('Solicitud') },
  { id: 'alta', etiqueta: 'Altas presenciales', color: 'secondary', coincide: (s) => s === 'Alta presencial' },
]
const tipoDe = (seccion) => tipos.find((t) => t.coincide(seccion)) ?? { id: 'otro', etiqueta: seccion, color: 'secondary' }
const esDelSocio = (r) => r.autor === 'Socio'
const filtroVacio = { tipo: '', autor: '', desde: '', hasta: '' }

function RegistroCambios({ registros }) {
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [filtro, setFiltro] = useState(filtroVacio)

  const cambiar = (campo) => (valor) => setFiltro((actual) => ({ ...actual, [campo]: valor }))
  const activos = Object.entries(filtro).filter(([, v]) => v)
  const nombresFiltro = {
    tipo: (v) => tipos.find((t) => t.id === v)?.etiqueta,
    autor: (v) => (v === 'socio' ? 'Hecho por el socio' : 'Hecho por el personal'),
    desde: (v) => `Desde ${new Date(`${v}T12:00:00`).toLocaleDateString('es-AR')}`,
    hasta: (v) => `Hasta ${new Date(`${v}T12:00:00`).toLocaleDateString('es-AR')}`,
  }

  const filtrados = registros.filter((r) => {
    const dia = r.fecha.slice(0, 10)
    return (
      (!filtro.tipo || tipoDe(r.seccion).id === filtro.tipo) &&
      (!filtro.autor || (filtro.autor === 'socio') === esDelSocio(r)) &&
      (!filtro.desde || dia >= filtro.desde) &&
      (!filtro.hasta || dia <= filtro.hasta) &&
      coincide(`${r.socioNombre} ${r.seccion} ${r.autor} ${r.cambios.map((c) => `${c.campo} ${c.anterior} ${c.nuevo}`).join(' ')}`, busqueda)
    )
  })

  return (
    <>
      <Row className="g-2 mb-4">
        {tipos.map((t) => {
          const cantidad = registros.filter((r) => tipoDe(r.seccion).id === t.id).length
          const elegido = filtro.tipo === t.id
          return (
            <Col key={t.id} xs={6} md={3} xxl>
              <button
                type="button"
                onClick={() => cambiar('tipo')(elegido ? '' : t.id)}
                aria-pressed={elegido}
                className={`w-100 h-100 text-start rounded-4 border-0 border-start border-4 border-${t.color} p-3 shadow-sm ${elegido ? `bg-${t.color}-subtle` : 'bg-white'}`}
              >
                <div className={`font-credencial fw-bold fs-2 lh-1 text-${t.color}-emphasis`}>{cantidad}</div>
                <div className="small fw-semibold">{t.etiqueta}</div>
              </button>
            </Col>
          )
        })}
      </Row>

      <Tarjeta titulo="Registro de cambios">
        <p className="small text-body-secondary">
          Todo lo que se modificó en las cuentas de los socios, con fecha, autor y el valor anterior. Sirve como constancia ante cualquier reclamo.
        </p>

        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Button
            variant={abierto || activos.length ? 'primary' : 'outline-secondary'}
            className="rounded-pill px-4 fw-bold text-uppercase"
            onClick={() => setAbierto(!abierto)}
            aria-expanded={abierto}
            aria-controls="filtros-cambios"
          >
            Filtrar
            {activos.length > 0 && (
              <Badge bg="light" text="dark" pill className="ms-2">
                {activos.length}
              </Badge>
            )}
          </Button>
          {activos.map(([campo, valor]) => (
            <Badge key={campo} bg="secondary" pill className="d-inline-flex align-items-center gap-2 py-2 px-3 fw-normal">
              {nombresFiltro[campo](valor)}
              <CloseButton variant="white" aria-label="Quitar filtro" onClick={() => cambiar(campo)('')} style={{ fontSize: '0.6rem' }} />
            </Badge>
          ))}
          <Form.Control
            type="search"
            size="sm"
            className="ms-md-auto"
            style={{ maxWidth: 320 }}
            placeholder="Buscar por socio, autor o dato"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar en el registro de cambios"
          />
        </div>

        <Collapse in={abierto}>
          <div id="filtros-cambios">
            <Row className="g-2 bg-body-tertiary rounded-4 p-3 mx-0 mb-3">
              <Col xs={6} md={3}>
                <Form.Label className="small fw-semibold mb-1" htmlFor="filtro-tipo-cambio">
                  Tipo de cambio
                </Form.Label>
                <Form.Select id="filtro-tipo-cambio" size="sm" value={filtro.tipo} onChange={(e) => cambiar('tipo')(e.target.value)}>
                  <option value="">Todos</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.etiqueta}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} md={3}>
                <Form.Label className="small fw-semibold mb-1" htmlFor="filtro-autor">
                  Hecho por
                </Form.Label>
                <Form.Select id="filtro-autor" size="sm" value={filtro.autor} onChange={(e) => cambiar('autor')(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="socio">El socio</option>
                  <option value="personal">El personal</option>
                </Form.Select>
              </Col>
              <Col xs={6} md={3}>
                <Form.Label className="small fw-semibold mb-1" htmlFor="filtro-desde">
                  Desde
                </Form.Label>
                <Form.Control id="filtro-desde" type="date" size="sm" value={filtro.desde} onChange={(e) => cambiar('desde')(e.target.value)} />
              </Col>
              <Col xs={6} md={3}>
                <Form.Label className="small fw-semibold mb-1" htmlFor="filtro-hasta">
                  Hasta
                </Form.Label>
                <Form.Control id="filtro-hasta" type="date" size="sm" value={filtro.hasta} onChange={(e) => cambiar('hasta')(e.target.value)} />
              </Col>
            </Row>
          </div>
        </Collapse>

        <p className="small text-body-secondary mb-2">
          {filtrados.length} {filtrados.length === 1 ? 'cambio' : 'cambios'}
          {activos.length > 0 && (
            <Button variant="link" size="sm" className="link-secondary p-0 ms-2" onClick={() => setFiltro(filtroVacio)}>
              Limpiar filtros
            </Button>
          )}
        </p>

        {filtrados.length === 0 && <p className="text-center text-body-secondary py-4 mb-0">No hay cambios que coincidan.</p>}

        <ul className="list-unstyled mb-0">
          {filtrados.map((r) => {
            const tipo = tipoDe(r.seccion)
            return (
              <li key={r.id} className={`border-start border-4 border-${tipo.color} bg-${tipo.color}-subtle bg-opacity-50 rounded-3 px-3 py-2 mb-2`}>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <Badge bg={tipo.color} text={tipo.color === 'warning' || tipo.color === 'info' ? 'dark' : undefined} pill>
                    {r.seccion}
                  </Badge>
                  <strong>{r.socioNombre}</strong>
                  <small className="text-body-secondary ms-auto">{fechaHora(r.fecha)}</small>
                </div>
                {r.cambios.map((c) => (
                  <div key={c.campo} className="small">
                    {c.campo}: <del className="text-body-secondary">{c.anterior}</del> → <strong>{c.nuevo}</strong>
                  </div>
                ))}
                <div className="small mt-1">
                  <Badge bg={esDelSocio(r) ? 'light' : 'secondary'} text={esDelSocio(r) ? 'dark' : undefined} className="border fw-normal">
                    {esDelSocio(r) ? 'Hecho por el socio' : r.autor}
                  </Badge>
                </div>
              </li>
            )
          })}
        </ul>
      </Tarjeta>
    </>
  )
}

export default RegistroCambios
