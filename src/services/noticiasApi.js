import { apiClub, quitarCampos } from './api'

const limpiar = (noticia) => quitarCampos(noticia, ['name', 'avatar', 'createdAt'])

export const listarNoticias = async () => {
  const { data } = await apiClub.get('/noticias')
  return data.map(limpiar).sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export const crearNoticia = async (noticia) => {
  const { data } = await apiClub.post('/noticias', noticia)
  return limpiar(data)
}

export const modificarNoticia = async (id, cambios) => {
  const { data } = await apiClub.put(`/noticias/${id}`, cambios)
  return limpiar(data)
}

export const borrarNoticia = async (id) => {
  await apiClub.delete(`/noticias/${id}`)
}
