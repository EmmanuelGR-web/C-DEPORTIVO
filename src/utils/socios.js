import { borrarSocio, listarSocios, modificarSocio, obtenerSocio, registrarSocio } from '../services/sociosApi'
import { guardarPagoInformado } from '../services/pagosApi'
import { iniciarSesionApi } from '../services/authApi'
import { alertaError } from './alertas'

let padron = []
let escriturasPendientes = 0

export const avisarErrorApi = (mensaje) => alertaError(mensaje, 'Servidor del club')

export const normalizarEmail = (email) => email.trim().toLowerCase()
export const normalizarDni = (dni) => dni.replace(/\D/g, '')

export const leerSocios = () => padron

export const cargarSocios = async () => {
  if (escriturasPendientes > 0) return padron
  padron = await listarSocios()
  return padron
}

const cambiarEnPadron = (id, cambios) => {
  padron = padron.map((s) => (s.id === id ? { ...s, ...cambios } : s))
}

const escribirEnSegundoPlano = async (escritura, mensajeError) => {
  escriturasPendientes += 1
  try {
    return await escritura()
  } catch (problema) {
    avisarErrorApi(`${mensajeError} ${problema.message}`)
    return null
  } finally {
    escriturasPendientes -= 1
  }
}

export const buscarDuplicado = ({ email, dni }, excluirId) => {
  const socios = padron.filter((s) => s.id !== excluirId)
  if (socios.some((s) => s.email === normalizarEmail(email))) return 'email'
  if (socios.some((s) => s.dni === normalizarDni(dni))) return 'dni'
  return null
}

export const guardarSocio = async ({ estado, debeCambiarContrasena, ...datos }) => {
  try {
    const socio = await registrarSocio({ ...datos, email: normalizarEmail(datos.email), dni: normalizarDni(datos.dni) })
    if (estado === 'Activo' || debeCambiarContrasena) {
      await modificarSocio(socio, { ...(estado && { estado }), ...(debeCambiarContrasena && { debeCambiarContrasena }) })
    }
    const nuevo = await obtenerSocio(socio.id)
    padron = [...padron, nuevo]
    return nuevo
  } catch (problema) {
    avisarErrorApi(problema.message)
    return null
  }
}

export const actualizarSocio = (id, cambios) => {
  const socio = padron.find((s) => s.id === id)
  if (!socio) return false
  cambiarEnPadron(id, cambios)
  escribirEnSegundoPlano(() => modificarSocio(socio, cambios), 'No se pudo guardar el cambio en el servidor.')
  return true
}

export const actualizarInforme = (id, periodo, informe) => {
  const socio = padron.find((s) => s.id === id)
  if (!socio) return false
  const anterior = socio.informes?.[periodo]
  const nuevo = { ...informe, id: informe.id ?? anterior?.id }
  cambiarEnPadron(id, { informes: { ...socio.informes, [periodo]: nuevo } })
  escribirEnSegundoPlano(async () => {
    const guardado = await guardarPagoInformado(id, periodo, nuevo)
    const actual = padron.find((s) => s.id === id)
    if (actual) cambiarEnPadron(id, { informes: { ...actual.informes, [periodo]: guardado } })
  }, 'No se pudo guardar el pago en el servidor.')
  return true
}

export const eliminarSocio = async (id) => {
  const socio = padron.find((s) => s.id === id)
  if (!socio) return
  await borrarSocio(socio)
  padron = padron.filter((s) => s.id !== id)
}

export const restablecerContrasena = async (perfil) => {
  try {
    await modificarSocio(perfil, { contrasena: normalizarDni(perfil.dni), debeCambiarContrasena: true })
    cambiarEnPadron(perfil.id, { debeCambiarContrasena: true })
    return true
  } catch (problema) {
    avisarErrorApi(problema.message)
    return false
  }
}

export const cambiarContrasena = async (perfil, actual, nueva) => {
  try {
    await iniciarSesionApi(perfil.email, actual)
  } catch (problema) {
    if (problema.estado === 401) return 'actual'
    avisarErrorApi(problema.message)
    return 'error'
  }
  try {
    await modificarSocio(perfil, { contrasena: nueva, debeCambiarContrasena: false })
    cambiarEnPadron(perfil.id, { debeCambiarContrasena: false })
    return 'ok'
  } catch (problema) {
    avisarErrorApi(problema.message)
    return 'error'
  }
}
