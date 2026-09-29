import { empleadoDemo } from '../data/gestion'

const clave = 'mensajesInternos'

export const correoDireccion = 'direccion@clubdeportivo.com.ar'
export const nombreDireccion = 'Laura Gómez (Administradora principal)'

const pedro = { id: empleadoDemo.id, nombre: empleadoDemo.nombre, correo: empleadoDemo.correo }

const hilosIniciales = [
  {
    id: 'bienvenida-interna',
    asunto: 'Cierre de padrón de octubre',
    empleado: pedro,
    leidoPor: { empleado: false, admin: true },
    mensajes: [
      {
        id: 'bienvenida-interna-1',
        rol: 'admin',
        de: correoDireccion,
        para: pedro.correo,
        fecha: '2026-09-26T09:30:00',
        texto: 'Pedro: antes del 5 de octubre necesito el listado de socios con cuotas vencidas para enviar los avisos. Cualquier duda me escribís por acá.',
        adjuntos: [],
      },
    ],
  },
]

export const leerHilosInternos = () => {
  try {
    return (JSON.parse(localStorage.getItem(clave)) ?? hilosIniciales).map((h) => ({ ...h, empleado: h.empleado ?? pedro }))
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

const mensaje = (rol, empleado, { texto, adjuntos }) => ({
  id: crypto.randomUUID(),
  rol,
  de: rol === 'admin' ? correoDireccion : empleado.correo,
  para: rol === 'admin' ? empleado.correo : correoDireccion,
  fecha: new Date().toISOString(),
  texto,
  adjuntos,
})

export const marcarLeidoInterno = (rol, hiloId) =>
  guardar(leerHilosInternos().map((h) => (h.id === hiloId ? { ...h, leidoPor: { ...h.leidoPor, [rol]: true } } : h)))

export const responderInterno = (rol, hiloId, datos) =>
  guardar(
    leerHilosInternos().map((h) =>
      h.id === hiloId ? { ...h, mensajes: [...h.mensajes, mensaje(rol, h.empleado, datos)], leidoPor: { [rol]: true, [otroRol(rol)]: false } } : h,
    ),
  )

export const crearHilosInternos = (rol, { asunto, ...datos }, destinatarios) => {
  const nuevos = destinatarios.map(({ id, nombre, correo }) => {
    const empleado = { id, nombre, correo }
    return { id: crypto.randomUUID(), asunto, empleado, leidoPor: { [rol]: true, [otroRol(rol)]: false }, mensajes: [mensaje(rol, empleado, datos)] }
  })
  return guardar([...nuevos, ...leerHilosInternos()]) ? nuevos[0].id : null
}
