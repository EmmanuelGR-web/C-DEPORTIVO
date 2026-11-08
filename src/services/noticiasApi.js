import { apiClub, sinVacios } from './api'

let categorias = null

export const listarCategorias = async () => {
  if (!categorias) {
    const { data } = await apiClub.get('/noticias/categorias')
    categorias = data
  }
  return categorias
}

const aNoticia = (noticia) => ({
  id: noticia.id,
  titulo: noticia.titulo,
  resumen: noticia.resumen,
  cuerpo: noticia.cuerpo.split(/\n\s*\n/).filter(Boolean),
  fecha: noticia.fecha.slice(0, 10),
  imagen: noticia.imagen ?? undefined,
  categoria: noticia.newsCategory?.nombre ?? '',
  autor: noticia.user?.nombre ?? '',
})

const aDatosNoticia = async (noticia) => {
  const lista = await listarCategorias()
  return {
    ...sinVacios({
      titulo: noticia.titulo,
      resumen: noticia.resumen,
      cuerpo: noticia.cuerpo.join('\n\n'),
      fecha: noticia.fecha,
      newsCategoryId: lista.find((categoria) => categoria.nombre === noticia.categoria)?.id,
    }),
    imagen: noticia.imagen ?? null,
  }
}

export const listarNoticias = async () => {
  const { data } = await apiClub.get('/noticias')
  return data.map(aNoticia).sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export const crearNoticia = async (noticia, userId) => {
  const datosNoticia = await aDatosNoticia(noticia)
  const { data } = await apiClub.post('/noticias', { ...datosNoticia, userId })
  return aNoticia(data)
}

export const modificarNoticia = async (id, cambios) => {
  const datosNoticia = await aDatosNoticia(cambios)
  const { data } = await apiClub.patch(`/noticias/${id}`, datosNoticia)
  return aNoticia(data)
}

export const borrarNoticia = async (id) => {
  await apiClub.delete(`/noticias/${id}`)
}
