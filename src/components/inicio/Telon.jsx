import { useEffect, useState } from 'react'


let yaSeMostro = false

function Telon({ imagen, demora = 1200, duracion = 1400 }) {
  const [visible] = useState(() => !yaSeMostro && window.scrollY === 0)
  const [imagenLista, setImagenLista] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [terminado, setTerminado] = useState(false)

  useEffect(() => {
    if (visible) yaSeMostro = true
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const subir = () => setSubiendo(true)
    const temporizador = imagenLista ? setTimeout(subir, demora) : null
    window.addEventListener('scroll', subir, { once: true })

    return () => {
      clearTimeout(temporizador)
      window.removeEventListener('scroll', subir)
    }
  }, [visible, imagenLista, demora])

  if (!visible || terminado) return null

  return (
    <div
      aria-hidden="true"
      className="position-fixed top-0 start-0 w-100 vh-100 overflow-hidden bg-secondary shadow-lg"
      style={{
        zIndex: 1060,
        transform: subiendo ? 'translateY(-100%)' : 'none',
        transition: `transform ${duracion}ms ease-in-out`,
      }}
      onTransitionEnd={() => setTerminado(true)}
    >
      
      <img
        src={imagen}
        alt=""
        onLoad={() => setImagenLista(true)}
        onError={() => setSubiendo(true)}
        className="w-100 h-100 object-fit-cover"
        style={{ transform: 'scale(1.13)' }}
      />
    </div>
  )
}

export default Telon
