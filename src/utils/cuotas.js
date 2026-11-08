import { actualizarInforme, leerSocios } from './socios'

export const cuotaMensual = 15000
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

export const leerInformes = (socioId) => leerSocios().find((s) => s.id === socioId)?.informes ?? {}

export const guardarInforme = (socioId, periodo, informe) => actualizarInforme(socioId, periodo, informe)
