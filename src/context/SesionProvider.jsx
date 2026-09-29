import { useState } from 'react'
import { SesionContext } from './SesionContext'
import { usuariosDemo } from '../data/usuarios'
import { normalizarEmail, validarContrasenaDemo, validarSocio } from '../utils/socios'
import { accesoRestringido } from '../utils/personal'

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

  const iniciarSesion = async (email, contrasena, recordar) => {
    const candidato = usuariosDemo.find((u) => u.email === normalizarEmail(email))
    const demo = candidato && (await validarContrasenaDemo(candidato, contrasena)) ? candidato : null
    const socio = demo ? null : await validarSocio(email, contrasena)
    if (!demo && !socio) return null
    const ausencia = demo?.empleadoId && accesoRestringido(demo.empleadoId)
    if (ausencia) return { bloqueado: ausencia }

    const datos = demo
      ? { nombre: demo.nombre, email: demo.email, rol: demo.rol, rolTexto: demo.rolTexto, ruta: demo.ruta, empleadoId: demo.empleadoId }
      : { id: socio.id, nombre: socio.nombre, email: socio.email, rol: 'socio', rolTexto: 'Socio', ruta: '/socio' }
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
