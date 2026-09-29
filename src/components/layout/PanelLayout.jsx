import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { FaBars } from 'react-icons/fa'
import BarraLateral from './BarraLateral'

function PanelLayout({ titulo, children, ...propsBarra }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="d-lg-flex min-vh-100 bg-body-tertiary">
      <div className="flex-shrink-0 sticky-lg-top align-self-lg-start">
        <BarraLateral {...propsBarra} mostrar={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      </div>

      <main className="flex-grow-1 p-3 p-md-4 p-xl-5 overflow-hidden">
        <div className="d-flex align-items-center gap-3 mb-4">
          <Button variant="secondary" className="d-lg-none" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú del panel">
            <FaBars />
          </Button>
          <h1 className="h3 fw-bolder text-uppercase fst-italic text-secondary mb-0">{titulo}</h1>
        </div>
        {children}
      </main>
    </div>
  )
}

export default PanelLayout
