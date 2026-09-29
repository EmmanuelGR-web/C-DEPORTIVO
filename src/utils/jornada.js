import { diasLaborales, empleadoDemo } from '../data/gestion'

// Jornada del día de cada empleado: cuándo ingresó, sus descansos y su última actividad en el portal.
// El panel del personal avisa que sigue abierto cada 20 segundos; si pasa más de un minuto y medio
// sin avisar (cerró la pestaña sin salir), figura "Sin conexión".
const minuto = 60 * 1000
export const descansoPermitido = 30 * minuto
export const intervaloActividad = 20 * 1000
const limiteConexion = 90 * 1000

// Solo el usuario de prueba del personal entra al portal; la jornada del resto se simula con su horario
const conPortal = [empleadoDemo.id]

const fechaLocal = (ms) => {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const clave = (ahora) => `jornadas:${fechaLocal(ahora)}`

export const leerJornadas = (ahora = Date.now()) => {
  try {
    return JSON.parse(localStorage.getItem(clave(ahora))) ?? {}
  } catch {
    return {}
  }
}

const guardar = (id, jornada, ahora) => {
  try {
    localStorage.setItem(clave(ahora), JSON.stringify({ ...leerJornadas(ahora), [id]: jornada }))
    return true
  } catch {
    return false
  }
}

const cerrarAbiertos = (lista, ahora) => lista.map((x) => (x.fin ? x : { ...x, fin: ahora }))

export const marcarActividad = (id, ahora = Date.now()) => {
  const j = leerJornadas(ahora)[id]
  if (!j) return guardar(id, { inicio: ahora, ultimaActividad: ahora, estado: 'trabajando', descansos: [], ausencias: [], fin: null }, ahora)
  if (j.estado === 'fuera') return guardar(id, { ...j, estado: 'trabajando', terminada: false, fin: null, ultimaActividad: ahora, ausencias: cerrarAbiertos(j.ausencias, ahora) }, ahora)
  const hueco = ahora - j.ultimaActividad > limiteConexion
  return guardar(id, { ...j, ultimaActividad: ahora, ausencias: hueco ? [...j.ausencias, { inicio: j.ultimaActividad, fin: ahora }] : j.ausencias }, ahora)
}

export const iniciarDescanso = (id, ahora = Date.now()) => {
  const j = leerJornadas(ahora)[id]
  if (!j || j.estado !== 'trabajando') return false
  return guardar(id, { ...j, estado: 'descanso', ultimaActividad: ahora, descansos: [...j.descansos, { inicio: ahora, fin: null }] }, ahora)
}

export const terminarDescanso = (id, ahora = Date.now()) => {
  const j = leerJornadas(ahora)[id]
  if (!j || j.estado !== 'descanso') return false
  return guardar(id, { ...j, estado: 'trabajando', ultimaActividad: ahora, descansos: cerrarAbiertos(j.descansos, ahora) }, ahora)
}

// Cerrar sesión deja la jornada abierta ("Salió del portal"); terminar la jornada marca el fin del día
export const registrarSalida = (id, terminada = false, ahora = Date.now()) => {
  const j = leerJornadas(ahora)[id]
  if (!j || j.estado === 'fuera') return false
  return guardar(id, { ...j, estado: 'fuera', terminada, fin: ahora, ultimaActividad: ahora, descansos: cerrarAbiertos(j.descansos, ahora), ausencias: [...j.ausencias, { inicio: ahora, fin: null }] }, ahora)
}

const aMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}
const semilla = (texto) => [...texto].reduce((total, letra) => total + letra.charCodeAt(0), 0)

// Jornada inventada a partir del horario: llega unos minutos antes o después, hace un descanso
// de 20 a 40 minutos a mitad de turno (algunos se pasan de los 30) y se va al terminar.
const jornadaSimulada = (empleado, ahora) => {
  const hoy = new Date(ahora)
  if (!diasLaborales[empleado.dias]?.includes(hoy.getDay())) return { franco: true }
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()
  const s = semilla(empleado.id)
  const llegada = base + (aMinutos(empleado.entrada) + (s % 9) - 4) * minuto
  const salida = base + (aMinutos(empleado.salida) + (s % 7)) * minuto
  if (ahora < llegada) return null
  const inicioDescanso = (llegada + salida) / 2 + ((s % 21) - 10) * minuto
  const finDescanso = inicioDescanso + (20 + (s % 21)) * minuto
  const descansos = ahora >= inicioDescanso ? [{ inicio: inicioDescanso, fin: ahora < finDescanso ? null : finDescanso }] : []
  const termino = ahora >= salida
  return {
    inicio: llegada,
    ultimaActividad: termino ? salida : ahora,
    estado: termino ? 'fuera' : descansos[0]?.fin === null ? 'descanso' : 'trabajando',
    descansos,
    ausencias: [],
    fin: termino ? salida : null,
    terminada: termino,
    simulada: true,
  }
}

const etiquetas = {
  linea: 'En línea',
  descanso: 'En descanso',
  sinConexion: 'Sin conexión',
  termino: 'Terminó su jornada',
  fuera: 'Salió del portal',
  sinIngresar: 'Aún no ingresó',
  franco: 'Franco hoy',
}

export const estadoJornada = (jornada, ahora) => {
  if (!jornada || jornada.franco) {
    const clave = jornada?.franco ? 'franco' : 'sinIngresar'
    return { clave, etiqueta: etiquetas[clave], trabajado: 0, descanso: 0, descansoActual: 0, excedido: false }
  }
  const sinConexion = jornada.estado !== 'fuera' && ahora - jornada.ultimaActividad > limiteConexion
  const referencia = jornada.estado === 'fuera' ? jornada.fin : sinConexion ? jornada.ultimaActividad : ahora
  const sumar = (lista) => lista.reduce((total, x) => total + Math.max(0, Math.min(x.fin ?? referencia, referencia) - x.inicio), 0)
  const descanso = sumar(jornada.descansos)
  const clave = jornada.estado === 'fuera' ? (jornada.terminada ? 'termino' : 'fuera') : sinConexion ? 'sinConexion' : jornada.estado === 'descanso' ? 'descanso' : 'linea'
  return {
    clave,
    etiqueta: etiquetas[clave],
    inicio: jornada.inicio,
    fin: jornada.fin,
    ultimaActividad: jornada.ultimaActividad,
    trabajado: Math.max(0, referencia - jornada.inicio - descanso - sumar(jornada.ausencias)),
    descanso,
    descansoActual: clave === 'descanso' ? Math.max(0, referencia - jornada.descansos.at(-1).inicio) : 0,
    excedido: descanso - descansoPermitido >= minuto,
    simulada: Boolean(jornada.simulada),
  }
}

export const presenciaDe = (empleado, jornadas, ahora) =>
  estadoJornada(conPortal.includes(empleado.id) ? jornadas[empleado.id] : jornadaSimulada(empleado, ahora), ahora)

export const textoDuracion = (ms) => {
  const total = Math.max(0, Math.floor(ms / minuto))
  const horas = Math.floor(total / 60)
  return horas ? `${horas} h ${String(total % 60).padStart(2, '0')} min` : `${total} min`
}

export const reloj = (ms) => {
  const segundos = Math.max(0, Math.floor(ms / 1000))
  return `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`
}

export const horaCorta = (ms) => new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

export const hace = (ms, ahora) => {
  const minutos = Math.floor((ahora - ms) / minuto)
  if (minutos < 1) return 'ahora'
  return minutos < 60 ? `hace ${minutos} min` : `hace ${textoDuracion(ahora - ms)}`
}

// Colores del punto de estado: verde en línea, dorado en descanso, gris el resto
export const colorEstado = { linea: 'success', descanso: 'warning', sinConexion: 'danger', fuera: 'secondary', termino: 'secondary', sinIngresar: 'secondary', franco: 'secondary' }

// Resumen que ve el empleado en el login después de terminar su jornada
const claveAviso = 'avisoFinJornada'

export const guardarAvisoSalida = (texto) => {
  try {
    sessionStorage.setItem(claveAviso, texto)
  } catch {
    return
  }
}

export const tomarAvisoSalida = () => {
  try {
    const texto = sessionStorage.getItem(claveAviso)
    sessionStorage.removeItem(claveAviso)
    return texto
  } catch {
    return null
  }
}
