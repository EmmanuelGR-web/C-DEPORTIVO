import { mensajes as mensajesIniciales } from '../data/socio'
import { correoAdministracion } from './perfilSocio'

const clave = (socioId) => `bandeja:${socioId}`

// Se aceptan archivos grandes, pero las imágenes se achican antes de guardarlas:
// todo vive en el localStorage del navegador, que tiene unos 5 MB en total
export const maximoOriginal = 10 * 1024 * 1024
export const maximoPdf = 1.5 * 1024 * 1024
export const textoLimite = 'Imágenes de hasta 10 MB (se optimizan solas) o PDF de hasta 1,5 MB'
const ladoMaximo = 1600
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

const leerComoDataUrl = (archivo) =>
  new Promise((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onload = () => resolver(lector.result)
    lector.onerror = () => rechazar(new Error(`No pudimos leer "${archivo.name}".`))
    lector.readAsDataURL(archivo)
  })

const bytesDe = (dataUrl) => Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75)

// Redimensiona la imagen a 1600 px de lado máximo y la guarda como JPEG: se sigue leyendo bien y pesa mucho menos
const optimizarImagen = (dataUrl) =>
  new Promise((resolver, rechazar) => {
    const imagen = new Image()
    imagen.onload = () => {
      const escala = Math.min(1, ladoMaximo / Math.max(imagen.width, imagen.height))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(imagen.width * escala)
      lienzo.height = Math.round(imagen.height * escala)
      const ctx = lienzo.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, lienzo.width, lienzo.height)
      ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
      resolver(lienzo.toDataURL('image/jpeg', 0.82))
    }
    imagen.onerror = () => rechazar(new Error('No pudimos abrir la imagen.'))
    imagen.src = dataUrl
  })

export const leerAdjunto = async (archivo) => {
  const esImagen = archivo.type.startsWith('image/')
  if (archivo.size > (esImagen ? maximoOriginal : maximoPdf)) {
    throw new Error(`"${archivo.name}" es muy pesado. ${textoLimite}.`)
  }
  const original = await leerComoDataUrl(archivo)
  if (!esImagen) return { nombre: archivo.name, tipo: archivo.type, tamanio: archivo.size, dataUrl: original }

  const dataUrl = await optimizarImagen(original)
  const nombre = archivo.name.replace(/\.[^.]+$/, '') + '.jpg'
  return { nombre, tipo: 'image/jpeg', tamanio: bytesDe(dataUrl), dataUrl }
}

export const tamanioLegible = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`)
