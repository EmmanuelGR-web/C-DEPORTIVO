import { borrarSocio, buscarSocioPorEmail, crearSocio, listarSocios, modificarSocio } from '../services/sociosApi'

let padron = []
let escriturasPendientes = 0

export const avisarErrorApi = (mensaje) => window.dispatchEvent(new CustomEvent('club:error-api', { detail: mensaje }))

export const normalizarEmail = (email) => email.trim().toLowerCase()
export const normalizarDni = (dni) => dni.replace(/\D/g, '')

export const leerSocios = () => padron

export const cargarSocios = async () => {
  if (escriturasPendientes > 0) return padron
  padron = await listarSocios()
  return padron
}

export const cifrarContrasena = async (contrasena) => {
  const bytes = new TextEncoder().encode(contrasena)
  const huella = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(huella)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const buscarDuplicado = ({ email, dni }, excluirId) => {
  const socios = padron.filter((s) => s.id !== excluirId)
  if (socios.some((s) => s.email === normalizarEmail(email))) return 'email'
  if (socios.some((s) => s.dni === normalizarDni(dni))) return 'dni'
  return null
}

export const guardarSocio = async ({ contrasena, ...datos }) => {
  const nuevo = {
    ...datos,
    email: normalizarEmail(datos.email),
    dni: normalizarDni(datos.dni),
    contrasenaCifrada: await cifrarContrasena(contrasena),
    fechaAlta: new Date().toISOString(),
  }
  try {
    const socio = await crearSocio(nuevo)
    padron = [...padron, socio]
    return socio
  } catch (problema) {
    avisarErrorApi(problema.message)
    return null
  }
}

export const validarSocio = async (email, contrasena) => {
  const socio = await buscarSocioPorEmail(normalizarEmail(email))
  if (!socio) return null
  return socio.contrasenaCifrada === (await cifrarContrasena(contrasena)) ? socio : null
}

export const actualizarSocio = (id, cambios) => {
  padron = padron.map((s) => (s.id === id ? { ...s, ...cambios } : s))
  escriturasPendientes += 1
  modificarSocio(id, cambios)
    .catch((problema) => avisarErrorApi(`No se pudo guardar el cambio en el servidor. ${problema.message}`))
    .finally(() => {
      escriturasPendientes -= 1
    })
  return true
}

export const eliminarSocio = async (id) => {
  await borrarSocio(id)
  padron = padron.filter((s) => s.id !== id)
}

const claveDemo = 'contrasenasDemo'

const leerContrasenasDemo = () => {
  try {
    return JSON.parse(localStorage.getItem(claveDemo)) ?? {}
  } catch {
    return {}
  }
}

export const validarContrasenaDemo = async (usuario, contrasena) => {
  const guardada = leerContrasenasDemo()[usuario.email]
  return guardada ? guardada === (await cifrarContrasena(contrasena)) : usuario.contrasena === contrasena
}

const guardarContrasena = async (perfil, nueva, extra = {}) => actualizarSocio(perfil.id, { contrasenaCifrada: await cifrarContrasena(nueva), ...extra })

export const restablecerContrasena = (perfil) => guardarContrasena(perfil, normalizarDni(perfil.dni), { debeCambiarContrasena: true })

export const cambiarContrasena = async (perfil, actual, nueva) => {
  const correcta = padron.find((s) => s.id === perfil.id)?.contrasenaCifrada === (await cifrarContrasena(actual))
  if (!correcta) return 'actual'
  return (await guardarContrasena(perfil, nueva, { debeCambiarContrasena: false })) ? 'ok' : 'error'
}
