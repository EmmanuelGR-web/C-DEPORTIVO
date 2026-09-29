import { usuariosDemo } from '../data/usuarios'
import { sociosEjemplo } from '../data/sociosEjemplo'

const clave = 'sociosRegistrados'

export const normalizarEmail = (email) => email.trim().toLowerCase()
export const normalizarDni = (dni) => dni.replace(/\D/g, '')

// Los socios de ejemplo se suman a los registrados. Si alguno se modifica, se guarda junto con los demás
// y a partir de ahí manda la versión guardada.
export const leerSocios = () => {
  try {
    const guardados = JSON.parse(localStorage.getItem(clave)) ?? []
    return [...sociosEjemplo.filter((e) => !guardados.some((s) => s.id === e.id)), ...guardados]
  } catch {
    return sociosEjemplo
  }
}

// La contraseña nunca se guarda tal cual: se guarda su huella SHA-256
export const cifrarContrasena = async (contrasena) => {
  const bytes = new TextEncoder().encode(contrasena)
  const huella = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(huella)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const buscarDuplicado = ({ email, dni }, excluirId) => {
  const socios = leerSocios().filter((s) => s.id !== excluirId)
  if (socios.some((s) => s.email === normalizarEmail(email))) return 'email'
  if (socios.some((s) => s.dni === normalizarDni(dni))) return 'dni'
  return null
}

export const guardarSocio = async ({ contrasena, ...datos }) => {
  const socio = {
    ...datos,
    id: crypto.randomUUID(),
    email: normalizarEmail(datos.email),
    dni: normalizarDni(datos.dni),
    contrasenaCifrada: await cifrarContrasena(contrasena),
    fechaAlta: new Date().toISOString(),
  }
  try {
    localStorage.setItem(clave, JSON.stringify([...leerSocios(), socio]))
    return socio
  } catch {
    return null
  }
}

export const validarSocio = async (email, contrasena) => {
  const socio = leerSocios().find((s) => s.email === normalizarEmail(email))
  if (!socio) return null
  return socio.contrasenaCifrada === (await cifrarContrasena(contrasena)) ? socio : null
}

// Los usuarios de prueba tienen su contraseña fija en el código; si se cambia o restablece,
// la nueva huella se guarda aparte y tiene prioridad sobre la fija
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

// El socio de prueba entra siempre con el correo de usuarios de prueba, aunque cambie el de contacto
const usuarioSocioDemo = () => usuariosDemo.find((u) => u.rol === 'socio')

const guardarContrasena = async (perfil, nueva, extra = {}) => {
  const contrasenaCifrada = await cifrarContrasena(nueva)
  if (perfil.esRegistrado) return actualizarSocio(perfil.id, { contrasenaCifrada, ...extra })
  try {
    localStorage.setItem(claveDemo, JSON.stringify({ ...leerContrasenasDemo(), [usuarioSocioDemo().email]: contrasenaCifrada }))
    const guardados = JSON.parse(localStorage.getItem('socioDemoEditado')) ?? {}
    localStorage.setItem('socioDemoEditado', JSON.stringify({ ...guardados, ...extra }))
    return true
  } catch {
    return false
  }
}

// El personal restablece la contraseña al número de DNI; el socio después la puede cambiar
export const restablecerContrasena = (perfil) => guardarContrasena(perfil, normalizarDni(perfil.dni), { debeCambiarContrasena: true })

export const cambiarContrasena = async (perfil, actual, nueva) => {
  const correcta = perfil.esRegistrado
    ? leerSocios().find((s) => s.id === perfil.id)?.contrasenaCifrada === (await cifrarContrasena(actual))
    : await validarContrasenaDemo(usuarioSocioDemo(), actual)
  if (!correcta) return 'actual'
  return (await guardarContrasena(perfil, nueva, { debeCambiarContrasena: false })) ? 'ok' : 'error'
}

export const actualizarSocio = (id, cambios) => {
  const socios = leerSocios()
  const nuevos = socios.map((s) => (s.id === id ? { ...s, ...cambios } : s))
  try {
    localStorage.setItem(clave, JSON.stringify(nuevos))
    return true
  } catch {
    return false
  }
}
