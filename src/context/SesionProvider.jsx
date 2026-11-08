import { useState } from 'react'
import { SesionContext } from './SesionContext'
import { iniciarSesionApi } from '../services/authApi'
import { normalizarEmail } from '../utils/socios'
import { accesoRestringido, leerPersonal } from '../utils/personal'
import { adminDemo } from '../data/gestion'

const clave = 'sesionClub'

const leerSesion = () => {
  try {
    const guardada = localStorage.getItem(clave) ?? sessionStorage.getItem(clave)
    return guardada ? JSON.parse(guardada) : null
  } catch {
    return null
  }
}

const armarSesion = (usuarioApi) => {
  const { id: userId, nombre, email, rol } = usuarioApi
  if (rol === 'socio' && usuarioApi.member) {
    return { id: usuarioApi.member.id, userId, nombre, email, rol: 'socio', rolTexto: 'Socio', ruta: '/socio' }
  }
  if (rol === 'admin') {
    return { userId, nombre, email, rol: 'admin', rolTexto: adminDemo.puesto, ruta: '/admin' }
  }
  if (rol === 'personal') {
    const empleado = leerPersonal().find((e) => e.correo.toLowerCase() === email)
    return { userId, nombre, email, rol: 'empleado', rolTexto: empleado?.rol ?? 'Personal', ruta: '/empleado', empleadoId: empleado?.id }
  }
  return null
}

function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion)

  const iniciarSesion = async (email, contrasena, recordar) => {
    let usuarioApi
    try {
      usuarioApi = await iniciarSesionApi(normalizarEmail(email), contrasena)
    } catch (problema) {
      if (problema.estado === 401) return null
      return { errorConexion: problema.message }
    }

    const datos = armarSesion(usuarioApi)
    if (!datos) return { errorConexion: 'Tu usuario no tiene un panel asignado.' }
    const ausencia = datos.empleadoId && accesoRestringido(datos.empleadoId)
    if (ausencia) return { bloqueado: ausencia }

    const almacen = recordar ? localStorage : sessionStorage
    almacen.setItem(clave, JSON.stringify(datos))
    setUsuario(datos)
    return datos
  }

  const cerrarSesion = () => {
    localStorage.removeItem(clave)
    sessionStorage.removeItem(clave)
    setUsuario(null)
  }

  return <SesionContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>{children}</SesionContext.Provider>
}

export default SesionProvider
