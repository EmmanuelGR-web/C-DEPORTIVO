import { useCallback, useEffect, useState } from 'react'

export function useConsulta(consultar) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: '' })

  useEffect(() => {
    let vigente = true
    consultar()
      .then((datos) => vigente && setEstado({ datos, cargando: false, error: '' }))
      .catch((problema) => vigente && setEstado({ datos: null, cargando: false, error: problema.message }))
    return () => {
      vigente = false
    }
  }, [consultar])

  const recargar = useCallback(async () => {
    setEstado((actual) => ({ ...actual, cargando: true, error: '' }))
    try {
      setEstado({ datos: await consultar(), cargando: false, error: '' })
    } catch (problema) {
      setEstado({ datos: null, cargando: false, error: problema.message })
    }
  }, [consultar])

  return { ...estado, recargar }
}
