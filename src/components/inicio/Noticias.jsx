import { useState } from 'react'
import { Modal, Badge, Button, Image } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import TarjetaNoticia from './TarjetaNoticia'
import { formatearFecha } from '../../utils/fechas'

function Noticias({ noticias }) {
 
  const [abierta, setAbierta] = useState(null)
  const [mostrar, setMostrar] = useState(false)
  const abrir = (noticia) => {
    setAbierta(noticia)
    setMostrar(true)
  }
  const cerrar = () => setMostrar(false)

  return (
    <aside id="noticias" className="sticky-lg-top" style={{ top: '1rem' }}>
      <span className="text-uppercase fw-bold text-primary small">Actualidad</span>
      <h2 className="fw-bolder text-uppercase fst-italic mb-3">Noticias</h2>

      <div className="d-flex flex-column gap-3">
        {noticias.map((noticia) => (
          <TarjetaNoticia key={noticia.id} noticia={noticia} onAbrir={abrir} />
        ))}
      </div>

      <Modal show={mostrar} onHide={cerrar} centered>
        {abierta && (
          <>
            <Modal.Header closeButton className="bg-secondary text-white" closeVariant="white">
              <Modal.Title className="h5 fw-bold">{abierta.titulo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Badge bg="primary" className="text-uppercase">
                  {abierta.categoria}
                </Badge>
                <small className="text-body-secondary">{formatearFecha(abierta.fecha)}</small>
              </div>
              {abierta.imagen && <Image src={abierta.imagen} alt={abierta.titulo} fluid rounded className="mb-3" />}
              {abierta.cuerpo.map((parrafo) => (
                <p key={parrafo}>{parrafo}</p>
              ))}
              {abierta.enlace && (
                <Button as={Link} to={abierta.enlace.ruta} variant="primary" className="rounded-pill px-4" onClick={cerrar}>
                  {abierta.enlace.texto}
                </Button>
              )}
            </Modal.Body>
          </>
        )}
      </Modal>
    </aside>
  )
}

export default Noticias
