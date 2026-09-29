import { informesEjemplo } from '../data/sociosEjemplo'

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

const clave = (socioId) => `pagosInformados:${socioId}`

export const leerInformes = (socioId) => {
  try {
    return { ...informesEjemplo[socioId], ...JSON.parse(localStorage.getItem(clave(socioId))) }
  } catch {
    return informesEjemplo[socioId] ?? {}
  }
}

export const guardarInforme = (socioId, periodo, informe) => {
  try {
    localStorage.setItem(clave(socioId), JSON.stringify({ ...leerInformes(socioId), [periodo]: informe }))
    return true
  } catch {
    return false
  }
}
