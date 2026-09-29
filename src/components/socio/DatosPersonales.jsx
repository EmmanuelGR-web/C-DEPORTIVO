import { useState } from 'react'
import { Row, Col, Form, Button, Alert } from 'react-bootstrap'
import Tarjeta from './Tarjeta'
import { formatearFechaConAnio } from '../../utils/fechas'
import { listaCampos } from '../../utils/validaciones'
import { buscarDuplicado } from '../../utils/socios'
import { leerAuditoria } from '../../utils/auditoria'

const campos = listaCampos(['nombre', 'dni', 'fechaNacimiento', 'direccion', 'telefono', 'email'])

const mostrar = (campo, valor) => (campo === 'fechaNacimiento' && valor ? formatearFechaConAnio(valor) : valor || '—')

function HistorialCambios({ socioId }) {
  const registros = leerAuditoria(socioId).reverse()
  if (registros.length === 0) return null

  return (
    <Tarjeta titulo="Historial de cambios" className="mt-4">
      <p className="small text-body-secondary">Cada modificación queda registrada con fecha y hora como constancia para administración.</p>
      <ul className="list-unstyled mb-0">
        {registros.map((registro) => (
          <li key={registro.id} className="border-top py-2 small">
            <div className="fw-semibold">
              {new Date(registro.fecha).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })} · {registro.seccion}
            </div>
            {registro.cambios.map((c) => (
              <div key={c.campo} className="text-body-secondary">
                {c.campo}: <del>{c.anterior}</del> → <span className="text-body">{c.nuevo}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </Tarjeta>
  )
}

function DatosPersonales({ socio, onGuardar }) {
  const [editando, setEditando] = useState(false)
  const [valores, setValores] = useState({})
  const [validado, setValidado] = useState(false)
  const [duplicado, setDuplicado] = useState(null)
  const [aviso, setAviso] = useState('')

  const empezar = () => {
    setValores(Object.fromEntries(campos.map((c) => [c.nombre, socio[c.nombre] ?? ''])))
    setValidado(false)
    setDuplicado(null)
    setAviso('')
    setEditando(true)
  }

  const invalido = (c) => validado && (!c.valido(valores[c.nombre]) || duplicado === c.nombre)

  const guardar = (e) => {
    e.preventDefault()
    setValidado(true)
    if (campos.some((c) => !c.valido(valores[c.nombre]))) return
    const repetido = socio.esRegistrado ? buscarDuplicado(valores, socio.id) : null
    if (repetido) {
      setDuplicado(repetido)
      return
    }
    const huboCambios = onGuardar(valores, 'Datos personales')
    setAviso(huboCambios ? 'Tus datos se actualizaron y el cambio quedó registrado.' : 'No hiciste ningún cambio.')
    setEditando(false)
  }

  return (
    <>
      <Tarjeta>
        {aviso && (
          <Alert variant="success" dismissible onClose={() => setAviso('')} className="py-2">
            {aviso}
          </Alert>
        )}

        <Row as="dl" className="g-4 mb-4">
          {[['Número de socio', socio.numeroSocio], ['Categoría', socio.categoria], ['Correo institucional', socio.correoInstitucional]].map(([etiqueta, valor]) => (
            <Col key={etiqueta} md={4}>
              <dt className="small text-uppercase text-body-secondary fw-semibold">
                {etiqueta} <span className="fw-normal text-lowercase">(no editable)</span>
              </dt>
              <dd className="fs-6 fw-semibold mb-0 text-break">{valor}</dd>
            </Col>
          ))}
        </Row>

        {editando ? (
          <Form noValidate onSubmit={guardar}>
            <Row className="g-3">
              {campos.map((c) => (
                <Col key={c.nombre} md={6}>
                  <Form.Group controlId={`editar-${c.nombre}`}>
                    <Form.Label className="small fw-semibold">{c.etiqueta}</Form.Label>
                    <Form.Control
                      type={c.tipo ?? 'text'}
                      inputMode={c.inputMode}
                      autoComplete={c.autoComplete}
                      value={valores[c.nombre]}
                      onChange={(e) => {
                        setValores({ ...valores, [c.nombre]: e.target.value })
                        if (duplicado === c.nombre) setDuplicado(null)
                      }}
                      isInvalid={invalido(c)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {duplicado === c.nombre ? `Ya hay otro socio con este ${c.etiqueta.toLowerCase()}.` : c.mensaje}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              ))}
            </Row>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button type="submit" variant="primary" className="rounded-pill px-4">
                Guardar cambios
              </Button>
              <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setEditando(false)}>
                Cancelar
              </Button>
            </div>
          </Form>
        ) : (
          <>
            <Row as="dl" className="g-4 mb-0">
              {campos.map((c) => (
                <Col key={c.nombre} md={6}>
                  <dt className="small text-uppercase text-body-secondary fw-semibold">{c.etiqueta}</dt>
                  <dd className="fs-5 mb-0 text-break">{mostrar(c.nombre, socio[c.nombre])}</dd>
                </Col>
              ))}
            </Row>
            <Button variant="secondary" className="rounded-pill px-4 mt-4" onClick={empezar}>
              Modificar mis datos
            </Button>
          </>
        )}
      </Tarjeta>

      <HistorialCambios socioId={socio.id} />
    </>
  )
}

export default DatosPersonales
