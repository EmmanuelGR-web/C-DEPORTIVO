import { useEffect, useRef, useState } from 'react'

function TarjetaSponsor({ nombre, url, icono: Icono, copia }) {
  const [encima, setEncima] = useState(false)

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={nombre}
      aria-hidden={copia}
      tabIndex={copia ? -1 : undefined}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      className={`d-inline-flex align-items-center gap-2 border rounded px-4 py-2 me-3 text-decoration-none text-nowrap fw-semibold ${
        encima ? 'border-warning text-warning bg-dark' : 'border-white text-white'
      }`}
    >
      <Icono className="fs-3" />
      <span className="small">{nombre}</span>
    </a>
  )
}

function Sponsors({ sponsors, segundosPorVuelta = 40 }) {
  const cinta = useRef(null)
  const animacion = useRef(null)

  // La lista se repite dos veces: al llegar a la mitad, la animación vuelve al inicio sin que se note el salto
  useEffect(() => {
    animacion.current = cinta.current.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
      { duration: segundosPorVuelta * 1000, iterations: Infinity },
    )
    return () => animacion.current.cancel()
  }, [segundosPorVuelta])

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => animacion.current?.pause()}
      onMouseLeave={() => animacion.current?.play()}
    >
      <div ref={cinta} className="d-flex" style={{ width: 'max-content' }}>
        {[false, true].map((copia) =>
          sponsors.map((sponsor) => <TarjetaSponsor key={`${sponsor.id}-${copia}`} {...sponsor} copia={copia} />),
        )}
      </div>
    </div>
  )
}

export default Sponsors
