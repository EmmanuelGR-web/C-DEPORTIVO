import { actualizarSocio, leerSocios } from './socios'

export const diaVencimiento = 15
export const interesDiario = 0.001

const unDia = 24 * 3600 * 1000

export const vencimientoDe = (anio, mes) => new Date(anio, mes, diaVencimiento, 23, 59, 59)

export const vencimientoInicial = (fechaAlta) => {
  const alta = new Date(fechaAlta)
  const diezDias = new Date(alta.getTime() + 10 * unDia)
  const quince = vencimientoDe(alta.getFullYear(), alta.getMonth())
  return diezDias > quince ? diezDias : quince
}

export const diasDeDemora = (anio, mes, fechaPago = new Date(), vence = vencimientoDe(anio, mes)) => {
  return fechaPago > vence ? Math.ceil((fechaPago - vence) / unDia) : 0
}

export const calcularCuota = (base, anio, mes, fechaPago = new Date(), vence = vencimientoDe(anio, mes)) => {
  const dias = diasDeDemora(anio, mes, fechaPago, vence)
  const recargo = Math.round(base * interesDiario * dias)
  return { base, dias, recargo, total: base + recargo }
}

const claveArchivo = (socioId, periodo) => `comprobante:${socioId}:${periodo}`

const leerArchivo = (socioId, periodo) => {
  try {
    return localStorage.getItem(claveArchivo(socioId, periodo))
  } catch {
    return null
  }
}

const guardarArchivo = (socioId, periodo, dataUrl) => {
  try {
    localStorage.setItem(claveArchivo(socioId, periodo), dataUrl)
  } catch {
    return
  }
}

const conArchivo = (socioId, periodo, informe) =>
  informe.comprobante ? { ...informe, comprobante: { ...informe.comprobante, dataUrl: leerArchivo(socioId, periodo) } } : informe

export const leerInformes = (socioId) => {
  const informes = leerSocios().find((s) => s.id === socioId)?.informes ?? {}
  return Object.fromEntries(Object.entries(informes).map(([periodo, informe]) => [periodo, conArchivo(socioId, periodo, informe)]))
}

export const guardarInforme = (socioId, periodo, informe) => {
  const { comprobante } = informe
  if (comprobante?.dataUrl) guardarArchivo(socioId, periodo, comprobante.dataUrl)
  const datos = comprobante ? { ...informe, comprobante: { nombre: comprobante.nombre, tipo: comprobante.tipo, tamanio: comprobante.tamanio } } : informe
  const actuales = leerSocios().find((s) => s.id === socioId)?.informes ?? {}
  return actualizarSocio(socioId, { informes: { ...actuales, [periodo]: datos } })
}
