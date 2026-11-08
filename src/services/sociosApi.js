import { apiClub, sinVacios } from './api'
import { aInforme, esInforme, idDelMedio, listarMediosPago } from './pagosApi'

const estadosSocio = { pendiente: 'En validación', activo: 'Activo', moroso: 'Activo', baja: 'Rechazado' }
const estadosSocioApi = { 'En validación': 'pendiente', Activo: 'activo', Rechazado: 'baja' }

const camposDelUsuario = ['nombre', 'email', 'contrasena', 'debeCambiarContrasena']
const camposDelSocio = ['dni', 'telefono', 'direccion', 'fechaNacimiento', 'foto', 'fotoActualizada', 'altaPresencial', 'lecturaIA']

const soloFecha = (fecha) => (fecha ? fecha.slice(0, 10) : '')

const aMedioPago = (socio) =>
  socio.paymentMethod?.nombre === 'Tarjeta'
    ? {
        tipo: 'tarjeta',
        emisor: socio.tarjetaEmisor,
        red: socio.tarjetaRed,
        ultimos4: socio.tarjetaUltimos4,
        debitoAutomatico: socio.debitoAutomatico,
      }
    : { tipo: 'efectivo', debitoAutomatico: false }

const aSocio = (socio, medios) => ({
  id: socio.id,
  userId: socio.userId,
  numeroSocio: socio.numeroSocio,
  nombre: socio.user.nombre,
  email: socio.user.email,
  debeCambiarContrasena: socio.user.debeCambiarContrasena,
  dni: socio.dni,
  telefono: socio.telefono ?? '',
  direccion: socio.direccion ?? '',
  fechaNacimiento: soloFecha(socio.fechaNacimiento),
  fechaAlta: `${soloFecha(socio.fechaAlta)}T12:00:00`,
  estado: estadosSocio[socio.estado],
  foto: socio.foto,
  fotoActualizada: socio.fotoActualizada,
  altaPresencial: socio.altaPresencial,
  lecturaIA: socio.lecturaIA,
  medioPago: aMedioPago(socio),
  informes: Object.fromEntries((socio.payments ?? []).filter(esInforme).map((pago) => [pago.periodo, aInforme(pago, medios)])),
})

const aDatosMedioPago = (medioPago, medios) =>
  medioPago.tipo === 'tarjeta'
    ? {
        paymentMethodId: idDelMedio(medios, 'Tarjeta'),
        tarjetaEmisor: medioPago.emisor,
        tarjetaRed: medioPago.red,
        tarjetaUltimos4: medioPago.ultimos4,
        debitoAutomatico: Boolean(medioPago.debitoAutomatico),
      }
    : {
        paymentMethodId: idDelMedio(medios, 'Efectivo'),
        tarjetaEmisor: null,
        tarjetaRed: null,
        tarjetaUltimos4: null,
        debitoAutomatico: false,
      }

const elegir = (cambios, campos) =>
  Object.fromEntries(Object.entries(cambios).filter(([campo]) => campos.includes(campo)).map(([campo, valor]) => [campo, valor === '' ? null : valor]))

const aCambiosDelSocio = (cambios, medios) => ({
  ...elegir(cambios, camposDelSocio),
  ...(cambios.estado && { estado: estadosSocioApi[cambios.estado] }),
  ...(cambios.medioPago && aDatosMedioPago(cambios.medioPago, medios)),
})

export const listarSocios = async () => {
  const [{ data }, medios] = await Promise.all([apiClub.get('/socios'), listarMediosPago()])
  return data.map((socio) => aSocio(socio, medios))
}

export const obtenerSocio = async (id) => {
  const [{ data }, medios] = await Promise.all([apiClub.get(`/socios/${id}`), listarMediosPago()])
  return aSocio(data, medios)
}

export const registrarSocio = async ({ medioPago, ...datos }) => {
  const medios = await listarMediosPago()
  const datosRegistro = sinVacios({ ...elegir(datos, [...camposDelUsuario, ...camposDelSocio]), ...aDatosMedioPago(medioPago, medios) })
  const { data } = await apiClub.post('/autenticacion/registro', datosRegistro)
  return { id: data.member.id, userId: data.id }
}

export const modificarSocio = async (socio, cambios) => {
  const medios = await listarMediosPago()
  const datosUsuario = elegir(cambios, camposDelUsuario)
  const datosSocio = aCambiosDelSocio(cambios, medios)
  if (Object.keys(datosUsuario).length > 0) await apiClub.patch(`/usuarios/${socio.userId}`, datosUsuario)
  if (Object.keys(datosSocio).length > 0) await apiClub.patch(`/socios/${socio.id}`, datosSocio)
}

export const borrarSocio = async (socio) => {
  await apiClub.delete(`/socios/${socio.id}`)
  await apiClub.delete(`/usuarios/${socio.userId}`)
}
