import { useEffect, useState } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'

function AvisoConexion() {
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const mostrar = (e) => setMensaje(e.detail)
    window.addEventListener('club:error-api', mostrar)
    return () => window.removeEventListener('club:error-api', mostrar)
  }, [])

  return (
    <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 1080 }}>
      <Toast show={Boolean(mensaje)} onClose={() => setMensaje('')} delay={8000} autohide bg="warning">
        <Toast.Header closeButton>
          <strong className="me-auto">Servidor del club</strong>
        </Toast.Header>
        <Toast.Body className="text-dark">{mensaje}</Toast.Body>
      </Toast>
    </ToastContainer>
  )
}

export default AvisoConexion
