const clave = 'auditoriaCambios'

export const leerAuditoria = (socioId) => {
  try {
    const todos = JSON.parse(localStorage.getItem(clave)) ?? []
    return socioId ? todos.filter((r) => r.socioId === socioId) : todos
  } catch {
    return []
  }
}

// Cada cambio queda con fecha, quién lo hizo, el valor anterior y el nuevo, para que administración tenga constancia
export const registrarCambios = ({ socioId, socioNombre, seccion, cambios, autor = 'Socio' }) => {
  if (cambios.length === 0) return
  const registro = { id: crypto.randomUUID(), fecha: new Date().toISOString(), socioId, socioNombre, seccion, autor, cambios }
  try {
    localStorage.setItem(clave, JSON.stringify([...leerAuditoria(), registro]))
  } catch {
    return
  }
}
