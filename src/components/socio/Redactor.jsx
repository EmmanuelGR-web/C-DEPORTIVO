import { useState } from 'react'
import { Form, Button, Alert, Badge } from 'react-bootstrap'
import { leerAdjunto, maximoAdjuntos, tamanioLegible, textoLimite } from '../../utils/mensajes'

function Redactor({ id, conAsunto = false, textoBoton = 'Enviar', onEnviar, onCancelar }) {
  const [asunto, setAsunto] = useState('')
  const [texto, setTexto] = useState('')
  const [adjuntos, setAdjuntos] = useState([])
  const [error, setError] = useState('')
  const [validado, setValidado] = useState(false)

  const adjuntar = async (e) => {
    const archivos = [...e.target.files]
    e.target.value = ''
    setError('')
    if (adjuntos.length + archivos.length > maximoAdjuntos) {
      setError(`Podés adjuntar hasta ${maximoAdjuntos} archivos por mensaje.`)
      return
    }
    try {
      const leidos = await Promise.all(archivos.map(leerAdjunto))
      setAdjuntos((actuales) => [...actuales, ...leidos])
    } catch (problema) {
      setError(problema.message)
    }
  }

  const enviar = (e) => {
    e.preventDefault()
    setValidado(true)
    if (!texto.trim() || (conAsunto && !asunto.trim())) return
    const enviado = onEnviar({ asunto: asunto.trim(), texto: texto.trim(), adjuntos })
    if (typeof enviado === 'string') {
      setError(enviado)
      return
    }
    if (!enviado) {
      setError('No pudimos guardar el mensaje: los adjuntos ocupan demasiado espacio en este navegador.')
      return
    }
    setAsunto('')
    setTexto('')
    setAdjuntos([])
    setValidado(false)
  }

  return (
    <Form noValidate onSubmit={enviar}>
      {conAsunto && (
        <Form.Group className="mb-2" controlId={`${id}-asunto`}>
          <Form.Label className="small fw-semibold">Asunto</Form.Label>
          <Form.Control value={asunto} onChange={(e) => setAsunto(e.target.value)} isInvalid={validado && !asunto.trim()} maxLength={80} />
          <Form.Control.Feedback type="invalid">Escribí un asunto.</Form.Control.Feedback>
        </Form.Group>
      )}
      <Form.Group className="mb-2" controlId={`${id}-texto`}>
        <Form.Label className={conAsunto ? 'small fw-semibold' : 'visually-hidden'}>Mensaje</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Escribí tu mensaje…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          isInvalid={validado && !texto.trim()}
          maxLength={1000}
        />
        <Form.Control.Feedback type="invalid">El mensaje no puede estar vacío.</Form.Control.Feedback>
      </Form.Group>

      {adjuntos.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {adjuntos.map((a, i) => (
            <Badge key={a.nombre + i} bg="light" text="dark" className="border d-inline-flex align-items-center gap-2 fw-normal">
              {a.nombre} ({tamanioLegible(a.tamanio)})
              <button type="button" className="btn btn-sm p-0 lh-1" aria-label={`Quitar ${a.nombre}`} onClick={() => setAdjuntos(adjuntos.filter((_, j) => j !== i))}>
                ✕
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="warning" className="py-2 small">
          {error}
        </Alert>
      )}

      <div className="d-flex flex-wrap align-items-center gap-2">
        <label className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-2 mb-0">
          Adjuntar archivo
          <input type="file" multiple onChange={adjuntar} className="visually-hidden" />
        </label>
        <small className="text-body-secondary">Hasta {maximoAdjuntos} archivos · {textoLimite}</small>
        {onCancelar && (
          <Button variant="link" size="sm" className="ms-auto" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" className={`rounded-pill px-4 ${onCancelar ? '' : 'ms-auto'}`}>
          {textoBoton}
        </Button>
      </div>
    </Form>
  )
}

export default Redactor
