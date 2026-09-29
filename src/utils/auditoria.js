const clave = 'auditoriaCambios'

export const leerAuditoria = (socioId) => {
  try {
    const todos = JSON.parse(localStorage.getItem(clave)) ?? []
    return socioId ? todos.filter((r) => r.socioId === socioId) : todos
  } catch {
    return []
  }
}

export const registrarCambios = ({ socioId, socioNombre, seccion, cambios, autor = 'Socio', valores = null, pendiente = false }) => {
  if (cambios.length === 0) return
  const registro = { id: crypto.randomUUID(), fecha: new Date().toISOString(), socioId, socioNombre, seccion, autor, cambios, valores, pendiente }
  try {
    localStorage.setItem(clave, JSON.stringify([...leerAuditoria(), registro]))
  } catch {
    return
  }
}

export const marcarResuelto = (id, resultado) => {
  try {
    localStorage.setItem(clave, JSON.stringify(leerAuditoria().map((r) => (r.id === id ? { ...r, resuelto: resultado } : r))))
  } catch {
    return
  }
}
