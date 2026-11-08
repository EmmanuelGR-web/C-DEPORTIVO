import { apiClub } from './api'

export const iniciarSesionApi = async (email, contrasena) => {
  const { data } = await apiClub.post('/autenticacion/login', { email, contrasena })
  return data
}
