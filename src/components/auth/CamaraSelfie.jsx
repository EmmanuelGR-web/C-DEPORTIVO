import { useEffect, useRef, useState } from 'react'
import { Modal, Button, Alert, Spinner } from 'react-bootstrap'
import { FaCamera, FaSyncAlt } from 'react-icons/fa'

const tamanio = 480

function CamaraSelfie({ foto, onCapturar, invalido }) {
  const [abierta, setAbierta] = useState(false)
  const [lista, setLista] = useState(false)
  const [error, setError] = useState(false)
  const video = useRef(null)
  const flujo = useRef(null)

  const apagar = () => {
    flujo.current?.getTracks().forEach((pista) => pista.stop())
    flujo.current = null
  }

  useEffect(() => {
    if (!abierta) return
    let cancelada = false
    const pedirCamara = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 720, height: 720 }, audio: false })
      : Promise.reject(new Error('Sin cámara'))

    pedirCamara
      .then((stream) => {
        if (cancelada) return stream.getTracks().forEach((pista) => pista.stop())
        flujo.current = stream
        video.current.srcObject = stream
      })
      .catch(() => setError(true))

    return () => {
      cancelada = true
      apagar()
    }
  }, [abierta])

  const cerrar = () => {
    setAbierta(false)
    setLista(false)
    setError(false)
  }

  const sacarFoto = () => {
    const v = video.current
    const lado = Math.min(v.videoWidth, v.videoHeight)
    const lienzo = document.createElement('canvas')
    lienzo.width = tamanio
    lienzo.height = tamanio
    const ctx = lienzo.getContext('2d')
    ctx.translate(tamanio, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(v, (v.videoWidth - lado) / 2, (v.videoHeight - lado) / 2, lado, lado, 0, 0, tamanio, tamanio)
    onCapturar(lienzo.toDataURL('image/jpeg', 0.85))
    cerrar()
  }

  const desdeArchivo = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    const lector = new FileReader()
    lector.onload = () => onCapturar(lector.result)
    lector.readAsDataURL(archivo)
    cerrar()
  }

  const borde = invalido ? 'border-danger' : foto ? 'border-warning' : 'border-light border-opacity-25'

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className={`position-relative d-flex flex-column align-items-center justify-content-center gap-2 mx-auto text-white small fw-semibold text-uppercase bg-white bg-opacity-10 border border-2 ${borde} rounded-circle overflow-hidden`}
        style={{ width: 150, height: 150 }}
      >
        {foto ? (
          <>
            <img src={foto} alt="Tu selfie" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
            <span className="position-absolute bottom-0 start-50 translate-middle-x mb-2 badge rounded-pill bg-dark bg-opacity-75">
              <FaSyncAlt aria-hidden="true" /> Repetir
            </span>
          </>
        ) : (
          <>
            <FaCamera className="fs-2" aria-hidden="true" />
            Sacate una selfie
          </>
        )}
      </button>

      <Modal show={abierta} onHide={cerrar} centered contentClassName="bg-dark text-white">
        <Modal.Header closeButton closeVariant="white" className="border-0">
          <Modal.Title className="h5 fw-bold">Tu foto de perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {error ? (
            <>
              <Alert variant="warning" className="text-start">
                No pudimos usar la cámara. Revisá que el navegador tenga permiso o elegí una foto tuya.
              </Alert>
              <label className="btn btn-light rounded-pill px-4">
                Elegir o sacar foto
                <input type="file" accept="image/*" capture="user" onChange={desdeArchivo} className="visually-hidden" />
              </label>
            </>
          ) : (
            <>
              <div className="position-relative ratio ratio-1x1 rounded-circle overflow-hidden mx-auto mb-3 bg-black" style={{ maxWidth: 300 }}>
                <video
                  ref={video}
                  autoPlay
                  playsInline
                  muted
                  onLoadedData={() => setLista(true)}
                  className="object-fit-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!lista && (
                  <div className="d-flex align-items-center justify-content-center">
                    <Spinner animation="border" variant="light" />
                  </div>
                )}
              </div>
              <p className="small text-white-50">Ubicá tu cara dentro del círculo, con buena luz y sin anteojos de sol.</p>
              <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={sacarFoto} disabled={!lista}>
                <FaCamera aria-hidden="true" /> Sacar foto
              </Button>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CamaraSelfie
