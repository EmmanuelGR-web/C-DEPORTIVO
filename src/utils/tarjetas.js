import { redesTarjeta } from '../data/pagos'

export const soloNumeros = (texto) => texto.replace(/\D/g, '')

export const detectarRed = (numero) => {
  const n = soloNumeros(numero)
  if (/^3[47]/.test(n)) return 'amex'
  if (/^4/.test(n)) return 'visa'
  const prefijo = Number(n.slice(0, 4))
  if (/^5[1-5]/.test(n) || (prefijo >= 2221 && prefijo <= 2720)) return 'mastercard'
  return null
}

// Agrupa de a 4 (Visa y Mastercard) o 4-6-5 (American Express), como viene impreso
export const formatearNumero = (numero) => {
  const n = soloNumeros(numero)
  const red = detectarRed(n)
  const largo = red ? redesTarjeta[red].largo : 16
  const recortado = n.slice(0, largo)
  const grupos = red === 'amex' ? [4, 6, 5] : [4, 4, 4, 4]
  const partes = []
  let inicio = 0
  for (const tamanio of grupos) {
    if (inicio >= recortado.length) break
    partes.push(recortado.slice(inicio, inicio + tamanio))
    inicio += tamanio
  }
  return partes.join(' ')
}

// Algoritmo de Luhn: el dígito verificador que usan todas las tarjetas
export const pasaLuhn = (numero) => {
  const n = soloNumeros(numero)
  let suma = 0
  for (let i = 0; i < n.length; i++) {
    let digito = Number(n[n.length - 1 - i])
    if (i % 2 === 1) {
      digito *= 2
      if (digito > 9) digito -= 9
    }
    suma += digito
  }
  return n.length > 0 && suma % 10 === 0
}

export const formatearVencimiento = (texto) => {
  const n = soloNumeros(texto).slice(0, 4)
  return n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n
}

export const vencimientoValido = (texto, hoy = new Date()) => {
  const partes = /^(\d{2})\/(\d{2})$/.exec(texto)
  if (!partes) return false
  const mes = Number(partes[1])
  const anio = 2000 + Number(partes[2])
  if (mes < 1 || mes > 12) return false
  const actual = hoy.getFullYear() * 12 + hoy.getMonth()
  const vence = anio * 12 + (mes - 1)
  return vence >= actual && vence <= actual + 12 * 10
}
