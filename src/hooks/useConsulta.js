import { useCallback, useEffect, useState } from 'react'
import { alertaError } from '../utils/alertas'

export function useConsulta(consultar, tituloError = 'No pudimos cargar los datos') {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: '' })

  useEffect(() => {
    let vigente = true

    const cargarDatos = async () => {
      try {
        const datos = await consultar()
        if (vigente) setEstado({ datos, cargando: false, error: '' })
      } catch (problema) {
        if (!vigente) return
        setEstado({ datos: null, cargando: false, error: problema.message })
        alertaError(problema.message, tituloError)
      }
    }

    cargarDatos()
    return () => {
      vigente = false
    }
  }, [consultar, tituloError])

  const recargar = useCallback(async () => {
    setEstado((actual) => ({ ...actual, cargando: true, error: '' }))
    try {
      const datos = await consultar()
      setEstado({ datos, cargando: false, error: '' })
    } catch (problema) {
      setEstado({ datos: null, cargando: false, error: problema.message })
      alertaError(problema.message, tituloError)
    }
  }, [consultar, tituloError])

  return { ...estado, recargar }
}
