import { mensajes as mensajesIniciales } from '../data/socio'
import { correoAdministracion } from './perfilSocio'

const clave = (socioId) => `bandeja:${socioId}`

export const maximoAdjunto = 1024 * 1024
export const maximoAdjuntos = 3

const hilosIniciales = (socio) =>
  mensajesIniciales.map((m) => ({
    id: String(m.id),
    asunto: m.asunto,
    leido: m.leido,
    mensajes: [{ id: `${m.id}-1`, de: correoAdministracion, para: socio.correoInstitucional, fecha: `${m.fecha}T10:00:00`, texto: m.texto, adjuntos: [] }],
  }))

export const leerHilos = (socio) => {
  try {
    return JSON.parse(localStorage.getItem(clave(socio.id))) ?? hilosIniciales(socio)
  } catch {
    return hilosIniciales(socio)
  }
}

export const guardarHilos = (socioId, hilos) => {
  try {
    localStorage.setItem(clave(socioId), JSON.stringify(hilos))
    return true
  } catch {
    return false
  }
}

export const leerAdjunto = (archivo) =>
  new Promise((resolver, rechazar) => {
    if (archivo.size > maximoAdjunto) return rechazar(new Error(`"${archivo.name}" supera 1 MB.`))
    const lector = new FileReader()
    lector.onload = () => resolver({ nombre: archivo.name, tipo: archivo.type, tamanio: archivo.size, dataUrl: lector.result })
    lector.onerror = () => rechazar(new Error(`No pudimos leer "${archivo.name}".`))
    lector.readAsDataURL(archivo)
  })

export const tamanioLegible = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`)
