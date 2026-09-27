export const formatearFecha = (fecha) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
