import { useCallback, useEffect, useState } from 'react'

// Lee los datos con `leer` y los vuelve a leer solos cuando otra pestaña (otro usuario del club
// en esta simulación) cambia algo guardado. También devuelve `actualizar` para hacerlo a mano.
export function useDatosEnVivo(leer) {
  const [datos, setDatos] = useState(leer)
  const [actualizado, setActualizado] = useState(() => new Date())

  const actualizar = useCallback(() => {
    setDatos(leer())
    setActualizado(new Date())
  }, [leer])

  useEffect(() => {
    const alCambiar = (e) => {
      if (e.storageArea === localStorage) actualizar()
    }
    window.addEventListener('storage', alCambiar)
    window.addEventListener('focus', actualizar)
    return () => {
      window.removeEventListener('storage', alCambiar)
      window.removeEventListener('focus', actualizar)
    }
  }, [actualizar])

  return [datos, actualizar, actualizado]
}
