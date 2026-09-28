import { useEffect } from 'react'

const tituloInicio = 'Club Deportivo | Fútbol, básquet, vóley y hockey en Tucumán'

export function useTituloPagina(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | Club Deportivo` : tituloInicio
  }, [titulo])
}
