const tiempoMaximo = 45000

export const leerConIA = async (tipo, archivos, contexto = {}) => {
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), tiempoMaximo)
  try {
    const respuesta = await fetch('/api/leer-documento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, archivos, contexto }),
      signal: control.signal,
    })
    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) throw new Error(datos.error ?? 'No pudimos leer el documento.')
    return datos
  } catch (problema) {
    if (problema.name === 'AbortError') throw new Error('La lectura tardó demasiado. Probá de nuevo.', { cause: problema })
    if (problema instanceof TypeError) throw new Error('No pudimos conectar con el servicio de lectura.', { cause: problema })
    throw problema
  } finally {
    clearTimeout(temporizador)
  }
}

export const montosCoinciden = (leido, esperado) => leido !== null && Math.abs(leido - esperado) <= 1

export const camposCorregidos = (leidos, finales) =>
  Object.entries(leidos)
    .filter(([campo, valor]) => valor && String(finales[campo] ?? '').trim() !== String(valor).trim())
    .map(([campo]) => campo)
