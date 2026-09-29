import { useState } from 'react'
import { Alert } from 'react-bootstrap'
import Tarjeta from '../common/Tarjeta'
import CamaraSelfie from '../auth/CamaraSelfie'
import { mesesEntreCambiosDeFoto, proximoCambioDeFoto } from '../../utils/perfilSocio'
import { formatearFechaConAnio } from '../../utils/fechas'

function FotoPerfil({ socio, onGuardar }) {
  const [aviso, setAviso] = useState('')
  const bloqueadaHasta = proximoCambioDeFoto(socio)

  const cambiar = (foto) => {
    const guardado = onGuardar({ foto, fotoActualizada: new Date().toISOString() }, 'Foto de perfil')
    setAviso(guardado ? 'Tu foto se actualizó. Ya aparece en tu carnet digital.' : 'No pudimos guardar la foto en este navegador.')
  }

  return (
    <Tarjeta titulo="Foto de perfil" className="mb-4">
      {aviso && (
        <Alert variant="success" dismissible onClose={() => setAviso('')} className="py-2">
          {aviso}
        </Alert>
      )}

      <div className="d-flex flex-wrap align-items-center gap-4">
        <CamaraSelfie
          foto={socio.foto}
          onCapturar={cambiar}
          variante="clara"
          deshabilitado={Boolean(bloqueadaHasta)}
          textoVacio="Cargar foto"
        />

        <div className="flex-grow-1" style={{ minWidth: 220 }}>
          {!socio.foto && (
            <p className="mb-2">
              Todavía no tenés foto. <strong>Cargá una</strong> desde la cámara o desde tus archivos: es la que va a aparecer en tu carnet digital.
            </p>
          )}
          {socio.foto && !bloqueadaHasta && <p className="mb-2">Podés cambiar tu foto ahora. Tocá la imagen para sacarte una nueva.</p>}
          {bloqueadaHasta && (
            <p className="mb-2">
              Vas a poder cambiarla a partir del <strong>{formatearFechaConAnio(bloqueadaHasta.toISOString().slice(0, 10))}</strong>.
            </p>
          )}
          <p className="small text-body-secondary mb-0">
            Por seguridad, la foto del carnet se puede cambiar una vez cada {mesesEntreCambiosDeFoto} meses. Cada cambio queda registrado.
          </p>
        </div>
      </div>
    </Tarjeta>
  )
}

export default FotoPerfil
