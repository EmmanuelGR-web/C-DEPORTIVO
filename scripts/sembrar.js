import axios from 'axios'
import { informesIniciales, noticiasIniciales, sociosIniciales } from './datosIniciales.js'

const api = axios.create({ baseURL: process.env.VITE_API_URL, timeout: 20000 })

const sinArchivos = (informes = {}) =>
  Object.fromEntries(
    Object.entries(informes).map(([periodo, informe]) => [
      periodo,
      informe.comprobante
        ? { ...informe, comprobante: { nombre: informe.comprobante.nombre, tipo: informe.comprobante.tipo, tamanio: informe.comprobante.tamanio } }
        : informe,
    ]),
  )

const vaciar = async (recurso) => {
  const { data } = await api.get(`/${recurso}`)
  for (const item of data) await api.delete(`/${recurso}/${item.id}`)
  console.log(`- ${recurso}: se borraron ${data.length} registros`)
}

const cargar = async (recurso, registros) => {
  for (const registro of registros) await api.post(`/${recurso}`, registro)
  console.log(`- ${recurso}: se cargaron ${registros.length} registros`)
}

const sembrar = async () => {
  if (!process.env.VITE_API_URL) throw new Error('Falta VITE_API_URL en el archivo .env')
  console.log(`Cargando datos iniciales en ${process.env.VITE_API_URL}`)
  await vaciar('socios')
  await vaciar('noticias')
  await cargar(
    'socios',
    sociosIniciales.map(({ id, ...socio }) => ({ ...socio, informes: sinArchivos(informesIniciales[id]) })),
  )
  await cargar(
    'noticias',
    noticiasIniciales.map((noticia) => Object.fromEntries(Object.entries(noticia).filter(([clave]) => clave !== 'id'))),
  )
  console.log('Listo.')
}

sembrar().catch((problema) => {
  console.error('No se pudieron cargar los datos:', problema.response?.status ?? '', problema.message)
  process.exit(1)
})
