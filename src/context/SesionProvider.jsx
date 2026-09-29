import { useState } from 'react'
import { SesionContext } from './SesionContext'
import { usuariosDemo } from '../data/usuarios'

const clave = 'sesionClub'

const leerSesion = () => {
  try {
    const guardada = localStorage.getItem(clave) ?? sessionStorage.getItem(clave)
    return guardada ? JSON.parse(guardada) : null
  } catch {
    return null
  }
}

function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion)

  const iniciarSesion = (email, contrasena, recordar) => {
    const encontrado = usuariosDemo.find(
      (u) => u.email === email.trim().toLowerCase() && u.contrasena === contrasena,
    )
    if (!encontrado) return null

    const { nombre, rol, rolTexto, ruta } = encontrado
    const datos = { nombre, email: encontrado.email, rol, rolTexto, ruta }
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
