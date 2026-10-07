import axios from 'axios'

const mensajesPorEstado = {
  400: 'Los datos enviados no son válidos.',
  404: 'No se encontró el dato pedido.',
  413: 'Los datos son demasiado pesados para el servidor.',
  429: 'Demasiados pedidos seguidos. Probá de nuevo en un momento.',
  500: 'El servidor tuvo un problema. Probá de nuevo.',
}

const traducirError = (error) => {
  const estado = error.response?.status
  const mensaje = !error.response
    ? 'No hay conexión con el servidor. Revisá tu internet.'
    : (mensajesPorEstado[estado] ?? `El servidor respondió con un error (${estado}).`)
  return Promise.reject(Object.assign(new Error(mensaje, { cause: error }), { estado }))
}

export const quitarCampos = (objeto, campos) => Object.fromEntries(Object.entries(objeto).filter(([clave]) => !campos.includes(clave)))

export const crearCliente = (baseURL) => {
  const cliente = axios.create({ baseURL, timeout: 15000 })
  cliente.interceptors.response.use((respuesta) => respuesta, traducirError)
  return cliente
}

export const apiClub = crearCliente(import.meta.env.VITE_API_URL)

export const apiDeportes = crearCliente(import.meta.env.VITE_DEPORTES_URL)
