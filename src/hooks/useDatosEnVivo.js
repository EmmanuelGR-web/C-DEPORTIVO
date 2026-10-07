import { useCallback, useEffect, useState } from 'react'
import { cargarSocios } from '../utils/socios'

const cadaCuanto = 10000

export function useDatosEnVivo(leer) {
  const [datos, setDatos] = useState(null)
  const [actualizado, setActualizado] = useState(null)
  const [error, setError] = useState('')

  const actualizar = useCallback(async () => {
    try {
      await cargarSocios()
      setDatos(leer())
      setActualizado(new Date())
      setError('')
    } catch (problema) {
      setError(problema.message)
    }
  }, [leer])

  useEffect(() => {
    let vigente = true
    const consultar = () =>
      cargarSocios()
        .then(() => {
          if (!vigente) return
          setDatos(leer())
          setActualizado(new Date())
          setError('')
        })
        .catch((problema) => vigente && setError(problema.message))

    consultar()
    const intervalo = setInterval(consultar, cadaCuanto)
    const alCambiar = (e) => {
      if (e.storageArea === localStorage) setDatos(leer())
    }
    window.addEventListener('storage', alCambiar)
    window.addEventListener('focus', consultar)
    return () => {
      vigente = false
      clearInterval(intervalo)
      window.removeEventListener('storage', alCambiar)
      window.removeEventListener('focus', consultar)
    }
  }, [leer])

  return [datos, actualizar, actualizado, error]
}
