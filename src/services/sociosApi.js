import { apiClub, quitarCampos } from './api'

const sinCamposDeMockApi = (socio) => quitarCampos(socio, ['name', 'avatar'])

export const listarSocios = async () => {
  const { data } = await apiClub.get('/socios')
  return data.map(sinCamposDeMockApi)
}

export const obtenerSocio = async (id) => {
  const { data } = await apiClub.get(`/socios/${id}`)
  return sinCamposDeMockApi(data)
}

export const buscarSocioPorEmail = async (email) => {
  const { data } = await apiClub.get('/socios', { params: { email } })
  return data.map(sinCamposDeMockApi).find((s) => s.email === email) ?? null
}

export const crearSocio = async (socio) => {
  const { data } = await apiClub.post('/socios', socio)
  return sinCamposDeMockApi(data)
}

export const modificarSocio = async (id, cambios) => {
  const { data } = await apiClub.put(`/socios/${id}`, cambios)
  return sinCamposDeMockApi(data)
}

export const borrarSocio = async (id) => {
  await apiClub.delete(`/socios/${id}`)
}
