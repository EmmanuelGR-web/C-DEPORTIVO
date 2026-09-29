import { socioDemo } from '../data/socio'
import { leerSocios, actualizarSocio } from './socios'
import { categoriaPorAntiguedad, cuotaPorCategoria } from './categorias'
import { registrarCambios } from './auditoria'

const claveDemo = 'socioDemoEditado'
const aniosEntre = (desde, hasta) => (hasta - desde) / (365.25 * 24 * 3600 * 1000)
const mediosHistoricos = ['Transferencia', 'Tarjeta', 'Efectivo']

const quitarAcentos = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const correoAdministracion = 'administracion@clubdeportivo.com.ar'

export const correoInstitucional = (nombre) => {
  const partes = quitarAcentos(nombre).toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean)
  return `${partes.slice(0, 2).join('.')}@socios.clubdeportivo.com.ar`
}

export const textoMedio = (medio) => (medio.tipo === 'tarjeta' ? 'Tarjeta' : 'Efectivo')

const leerDemo = () => {
  try {
    return { ...socioDemo, ...JSON.parse(localStorage.getItem(claveDemo)) }
  } catch {
    return socioDemo
  }
}

const datosBase = (usuario) => {
  const registrado = usuario.id && leerSocios().find((s) => s.id === usuario.id)
  if (!registrado) return { ...leerDemo(), esDemo: true }
  return {
    ...registrado,
    numeroSocio: String(new Date(registrado.fechaAlta).getTime()).slice(-8),
    medioPago: registrado.medioPago ?? { tipo: registrado.pago ?? 'efectivo', debitoAutomatico: false },
    esRegistrado: true,
  }
}

// Una cuota por mes desde el alta hasta hoy. El mes actual queda pendiente salvo que tenga débito automático
const generarPagos = (base, hoy) => {
  const alta = new Date(base.fechaAlta)
  const pagos = []
  const mes = new Date(alta.getFullYear(), alta.getMonth(), 1)
  let indice = 0
  while (mes <= hoy) {
    const esActual = mes.getFullYear() === hoy.getFullYear() && mes.getMonth() === hoy.getMonth()
    const recientes = aniosEntre(mes, hoy) < 0.5
    const debita = base.medioPago.tipo === 'tarjeta' && base.medioPago.debitoAutomatico
    pagos.push({
      id: `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`,
      fecha: `${String(mes.getMonth() + 1).padStart(2, '0')}/${mes.getFullYear()}`,
      anio: mes.getFullYear(),
      concepto: indice === 0 ? 'Inscripción y cuota' : 'Cuota mensual',
      medio: recientes || base.esRegistrado ? textoMedio(base.medioPago) : mediosHistoricos[indice % 3],
      monto: cuotaPorCategoria[categoriaPorAntiguedad(aniosEntre(alta, mes))] * (indice === 0 ? 2 : 1),
      estado: esActual && !debita ? 'Pendiente' : 'Aprobado',
    })
    mes.setMonth(mes.getMonth() + 1)
    indice += 1
  }
  return pagos.reverse()
}

export const perfilSocio = (usuario, hoy = new Date()) => {
  const base = datosBase(usuario)
  const anios = aniosEntre(new Date(base.fechaAlta), hoy)
  return {
    ...base,
    anioIngreso: new Date(base.fechaAlta).getFullYear(),
    fotoActualizada: base.fotoActualizada ?? (base.foto ? base.fechaAlta : null),
    antiguedadAnios: anios,
    categoria: categoriaPorAntiguedad(anios),
    estado: base.esRegistrado ? 'En validación' : 'Activo',
    correoInstitucional: correoInstitucional(base.nombre),
    pagos: generarPagos(base, hoy),
  }
}

const nombresCampo = {
  nombre: 'Nombre',
  dni: 'DNI',
  fechaNacimiento: 'Fecha de nacimiento',
  direccion: 'Dirección',
  telefono: 'Teléfono',
  email: 'Correo electrónico',
  medioPago: 'Medio de pago',
  foto: 'Foto de perfil',
}

const describir = (campo, valor) => {
  if (campo === 'foto') return valor ? 'Foto cargada' : 'Sin foto'
  if (campo === 'medioPago') {
    const tarjeta = valor.ultimos4 ? ` terminada en ${valor.ultimos4}` : ''
    return `${textoMedio(valor)}${tarjeta} · débito automático ${valor.debitoAutomatico ? 'sí' : 'no'}`
  }
  return valor
}

// Guarda los cambios del socio y deja constancia en la auditoría
export const guardarCambiosSocio = (perfil, cambios, seccion) => {
  const diferencias = Object.entries(cambios)
    .filter(([campo, valor]) => nombresCampo[campo] && JSON.stringify(perfil[campo]) !== JSON.stringify(valor))
    .map(([campo, valor]) => ({ campo: nombresCampo[campo], anterior: describir(campo, perfil[campo]), nuevo: describir(campo, valor) }))
  if (diferencias.length === 0) return false

  if (perfil.esRegistrado) {
    actualizarSocio(perfil.id, cambios)
  } else {
    try {
      const guardados = JSON.parse(localStorage.getItem(claveDemo)) ?? {}
      localStorage.setItem(claveDemo, JSON.stringify({ ...guardados, ...cambios }))
    } catch {
      return false
    }
  }
  registrarCambios({ socioId: perfil.id, socioNombre: perfil.nombre, seccion, cambios: diferencias })
  return true
}

export const mesesEntreCambiosDeFoto = 6

// Devuelve la fecha desde la que se puede volver a cambiar la foto, o null si ya se puede
export const proximoCambioDeFoto = (perfil, hoy = new Date()) => {
  if (!perfil.foto || !perfil.fotoActualizada) return null
  const habilitada = new Date(perfil.fotoActualizada)
  habilitada.setMonth(habilitada.getMonth() + mesesEntreCambiosDeFoto)
  return habilitada > hoy ? habilitada : null
}
