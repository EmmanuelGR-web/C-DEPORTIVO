export const idQrCarnet = 'qr-carnet'

// Barras decorativas armadas a partir del número de socio (no es un código de barras estándar)
export const barrasCarnet = (numero) =>
  [...numero.repeat(3)].flatMap((digito, i) => [
    { ancho: 1 + (Number(digito) % 3), color: i % 2 ? 'primary' : 'dark' },
    { ancho: 1 + ((Number(digito) + i) % 2), color: 'white' },
  ])

export const textoQr = (socio) => `CLUB-DEPORTIVO|SOCIO|${socio.numeroSocio}|${socio.dni}|${socio.categoria}`

export const formatearPesos = (monto) =>
  monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
