// Mensajes internos entre el personal administrativo y el administrador principal.
// Cada hilo guarda qué rol lo leyó por última vez, así cada uno ve sus "sin leer".
const clave = 'mensajesInternos'

export const correosInternos = {
  empleado: 'pedro.diaz@clubdeportivo.com.ar',
  admin: 'direccion@clubdeportivo.com.ar',
}

export const nombresInternos = {
  empleado: 'Pedro Díaz (Personal administrativo)',
  admin: 'Laura Gómez (Administradora principal)',
}

const hilosIniciales = [
  {
    id: 'bienvenida-interna',
    asunto: 'Cierre de padrón de octubre',
    leidoPor: { empleado: false, admin: true },
    mensajes: [
      {
        id: 'bienvenida-interna-1',
        rol: 'admin',
        de: correosInternos.admin,
        para: correosInternos.empleado,
        fecha: '2026-09-26T09:30:00',
        texto: 'Pedro: antes del 5 de octubre necesito el listado de socios con cuotas vencidas para enviar los avisos. Cualquier duda me escribís por acá.',
        adjuntos: [],
      },
    ],
  },
]

export const leerHilosInternos = () => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? hilosIniciales
  } catch {
    return hilosIniciales
  }
}

const guardar = (hilos) => {
  try {
    localStorage.setItem(clave, JSON.stringify(hilos))
    return true
  } catch {
    return false
  }
}

const otroRol = (rol) => (rol === 'admin' ? 'empleado' : 'admin')

const mensaje = (rol, { texto, adjuntos }) => ({
  id: crypto.randomUUID(),
  rol,
  de: correosInternos[rol],
  para: correosInternos[otroRol(rol)],
  fecha: new Date().toISOString(),
  texto,
  adjuntos,
})

export const sinLeerInternos = (rol) => leerHilosInternos().filter((h) => !h.leidoPor[rol]).length

export const marcarLeidoInterno = (rol, hiloId) =>
  guardar(leerHilosInternos().map((h) => (h.id === hiloId ? { ...h, leidoPor: { ...h.leidoPor, [rol]: true } } : h)))

export const responderInterno = (rol, hiloId, datos) =>
  guardar(
    leerHilosInternos().map((h) =>
      h.id === hiloId ? { ...h, mensajes: [...h.mensajes, mensaje(rol, datos)], leidoPor: { [rol]: true, [otroRol(rol)]: false } } : h,
    ),
  )

export const crearHiloInterno = (rol, { asunto, ...datos }) => {
  const hilo = { id: crypto.randomUUID(), asunto, leidoPor: { [rol]: true, [otroRol(rol)]: false }, mensajes: [mensaje(rol, datos)] }
  return guardar([hilo, ...leerHilosInternos()]) ? hilo.id : null
}
