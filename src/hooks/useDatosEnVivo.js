import { useCallback, useEffect, useState } from 'react'

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
