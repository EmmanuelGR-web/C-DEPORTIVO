import { personalInicial } from '../data/gestion'
import { formatearFechaConAnio } from './fechas'

const clave = 'personalClub'

const horarioBase = { dias: 'Lunes a viernes', entrada: '09:00', salida: '17:00' }

// La situación "Activo/Inactivo" de versiones anteriores ya no se usa: ahora cuenta la ausencia con fechas
const normalizar = (e) => ({ ...horarioBase, ausencia: null, ...Object.fromEntries(Object.entries(e).filter(([campo]) => campo !== 'estado')) })

export const leerPersonal = () => {
  try {
    return (JSON.parse(localStorage.getItem(clave)) ?? personalInicial).map(normalizar)
  } catch {
    return personalInicial.map(normalizar)
  }
}

export const textoTurno = (e) => `${e.dias}, de ${e.entrada} a ${e.salida} h`

const guardar = (lista) => {
  try {
    localStorage.setItem(clave, JSON.stringify(lista))
    return true
  } catch {
    return false
  }
}

const siguienteCodigo = (lista) => {
  const mayor = Math.max(0, ...lista.map((e) => Number(e.codigo.slice(1)) || 0))
  return `A${String(mayor + 1).padStart(2, '0')}`
}

export const agregarEmpleado = (datos) => {
  const lista = leerPersonal()
  return guardar([...lista, { ...datos, id: crypto.randomUUID(), codigo: siguienteCodigo(lista) }])
}

export const actualizarEmpleados = (ids, cambios) => guardar(leerPersonal().map((e) => (ids.includes(e.id) ? { ...e, ...cambios } : e)))

export const eliminarEmpleados = (ids) => guardar(leerPersonal().filter((e) => !ids.includes(e.id)))

export const correoRepetido = (correo, excluirId) => leerPersonal().some((e) => e.id !== excluirId && e.correo.toLowerCase() === correo.trim().toLowerCase())

// Ausencias: mientras duran, la persona no trabaja y no puede entrar al portal.
// `hasta` es el último día de la ausencia; al día siguiente vuelve sola a estar en actividad.
export const motivosAusencia = ['Vacaciones', 'Licencia médica', 'Licencia personal', 'Suspensión']

export const enActividadTexto = 'En actividad'
export const sinCambiosTexto = 'Sin cambios'

// Revisa que la ausencia tenga fechas válidas. Devuelve el texto del error o null.
export const errorAusencia = (ausencia) => {
  if (!ausencia) return null
  if (!ausencia.desde || !ausencia.hasta) return 'Indicá desde y hasta qué día.'
  if (ausencia.hasta < ausencia.desde) return 'El último día no puede ser anterior al primero.'
  return null
}

export const fechaDeHoy = (fecha = new Date()) => fecha.toLocaleDateString('en-CA')

export const diaSiguiente = (dia) => {
  const fecha = new Date(`${dia}T12:00:00`)
  fecha.setDate(fecha.getDate() + 1)
  return fechaDeHoy(fecha)
}

export const ausenciaVigente = (empleado, hoy) => {
  const a = empleado.ausencia
  return a && a.desde <= hoy && hoy <= a.hasta ? a : null
}

export const ausenciaProgramada = (empleado, hoy) => (empleado.ausencia && empleado.ausencia.desde > hoy ? empleado.ausencia : null)

export const enActividad = (empleado, hoy) => !ausenciaVigente(empleado, hoy)

export const textoRegreso = (ausencia) => `Vuelve el ${formatearFechaConAnio(diaSiguiente(ausencia.hasta))}`

export const textoAusencia = (ausencia) => `${ausencia.motivo} del ${formatearFechaConAnio(ausencia.desde)} al ${formatearFechaConAnio(ausencia.hasta)}`

// Para el login: si la persona está ausente hoy, devuelve el motivo y desde cuándo puede volver a entrar
export const accesoRestringido = (empleadoId) => {
  const empleado = leerPersonal().find((e) => e.id === empleadoId)
  return empleado ? ausenciaVigente(empleado, fechaDeHoy()) : null
}

// Aviso para mostrar en el login cuando el panel saca a alguien porque empezó su ausencia
const claveAviso = 'avisoAccesoPausado'

export const guardarAvisoBloqueo = (ausencia) => {
  try {
    sessionStorage.setItem(claveAviso, JSON.stringify(ausencia))
  } catch {
    return
  }
}

export const leerAvisoBloqueo = () => {
  try {
    return JSON.parse(sessionStorage.getItem(claveAviso))
  } catch {
    return null
  }
}

export const borrarAvisoBloqueo = () => {
  try {
    sessionStorage.removeItem(claveAviso)
  } catch {
    return
  }
}
