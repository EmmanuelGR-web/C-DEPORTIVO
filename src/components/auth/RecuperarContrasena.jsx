import { useState } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'

function RecuperarContrasena({ mostrar, onCerrar }) {
  const [email, setEmail] = useState('')
  const [validado, setValidado] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const enviar = (e) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) {
      setValidado(true)
      return
    }
    setEnviado(true)
  }

  const reiniciar = () => {
    setEmail('')
    setValidado(false)
    setEnviado(false)
  }

  return (
    <Modal show={mostrar} onHide={onCerrar} onExited={reiniciar} centered>
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white">
        <Modal.Title className="h5 fw-bold">Recuperar contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {enviado ? (
          <Alert variant="success" className="mb-0">
            Si <strong>{email}</strong> está registrado, vas a recibir un correo con los pasos para crear una contraseña nueva.
          </Alert>
        ) : (
          <Form noValidate validated={validado} onSubmit={enviar}>
            <p className="text-body-secondary">Escribí el correo con el que te registraste y te enviamos un enlace para cambiarla.</p>
            <Form.Group className="mb-3" controlId="recuperar-email">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              <Form.Control.Feedback type="invalid">Ingresá un correo electrónico válido.</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" variant="primary" className="rounded-pill px-4">
              Enviar enlace
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default RecuperarContrasena
