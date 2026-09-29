const clave = 'sociosRegistrados'

export const normalizarEmail = (email) => email.trim().toLowerCase()
export const normalizarDni = (dni) => dni.replace(/\D/g, '')

export const leerSocios = () => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? []
  } catch {
    return []
  }
}

// La contraseña nunca se guarda tal cual: se guarda su huella SHA-256
export const cifrarContrasena = async (contrasena) => {
  const bytes = new TextEncoder().encode(contrasena)
  const huella = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(huella)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const buscarDuplicado = ({ email, dni }) => {
  const socios = leerSocios()
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
