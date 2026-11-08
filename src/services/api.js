import axios from 'axios'

const mensajesPorEstado = {
  400: 'Los datos enviados no son válidos.',
  401: 'El correo o la contraseña no son correctos.',
  403: 'No tenés permiso para hacer esto.',
  404: 'No se encontró el dato pedido.',
  409: 'Ese dato ya está registrado.',
  413: 'Los datos son demasiado pesados para el servidor.',
  429: 'Demasiados pedidos seguidos. Probá de nuevo en un momento.',
  500: 'El servidor tuvo un problema. Probá de nuevo.',
}

const mensajeDelServidor = (respuesta) => {
  const mensaje = respuesta?.data?.message
  if (Array.isArray(mensaje)) return mensaje.join(' ')
  return typeof mensaje === 'string' ? mensaje : null
}

const traducirError = (error) => {
  const estado = error.response?.status
  const mensaje = !error.response
    ? 'No hay conexión con el servidor. Revisá tu internet o que la API esté prendida.'
    : (mensajeDelServidor(error.response) ?? mensajesPorEstado[estado] ?? `El servidor respondió con un error (${estado}).`)
  return Promise.reject(Object.assign(new Error(mensaje, { cause: error }), { estado }))
}

export const sinVacios = (objeto) => Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== undefined && valor !== null && valor !== ''))

export const crearCliente = (baseURL) => {
  const cliente = axios.create({ baseURL, timeout: 20000 })
  cliente.interceptors.response.use((respuesta) => respuesta, traducirError)
  return cliente
}

export const apiClub = crearCliente(import.meta.env.VITE_API_URL)

export const apiDeportes = crearCliente(import.meta.env.VITE_DEPORTES_URL)
