import { apiClub, sinVacios } from './api'

const estadosPago = { pendiente: 'En revisión', pagado: 'Aprobado', rechazado: 'Rechazado' }
const estadosPagoApi = { 'En revisión': 'pendiente', Aprobado: 'pagado', Rechazado: 'rechazado' }

let mediosPago = null

export const listarMediosPago = async () => {
  if (!mediosPago) {
    const { data } = await apiClub.get('/pagos/medios-pago')
    mediosPago = data
  }
  return mediosPago
}

export const idDelMedio = (medios, nombre) => medios.find((medio) => medio.nombre === nombre)?.id

const tipoDeArchivo = (dataUrl) => dataUrl.slice(5, dataUrl.indexOf(';'))

export const aInforme = (pago, medios) => ({
  id: pago.id,
  fechaPago: pago.fecha.slice(0, 10),
  medio: medios.find((medio) => medio.id === pago.paymentMethodId)?.nombre ?? 'Transferencia',
  monto: Number(pago.monto),
  comprobante: pago.comprobante
    ? {
        nombre: pago.comprobanteNombre ?? 'comprobante',
        tipo: tipoDeArchivo(pago.comprobante),
        tamanio: Math.round(pago.comprobante.length * 0.75),
        dataUrl: pago.comprobante,
      }
    : null,
  verificacionIA: pago.verificacionIA ?? null,
  estado: estadosPago[pago.estado],
  motivo: pago.motivo ?? '',
  informadoEl: pago.informadoEl,
})

export const esInforme = (pago) => Boolean(pago.periodo && estadosPago[pago.estado])

export const guardarPagoInformado = async (socioId, periodo, informe) => {
  const medios = await listarMediosPago()
  const datosPago = sinVacios({
    concepto: 'Cuota mensual',
    periodo,
    monto: informe.monto,
    fecha: informe.fechaPago,
    estado: estadosPagoApi[informe.estado],
    motivo: informe.motivo,
    comprobante: informe.comprobante?.dataUrl,
    comprobanteNombre: informe.comprobante?.nombre,
    verificacionIA: informe.verificacionIA,
    memberId: socioId,
    paymentMethodId: idDelMedio(medios, informe.medio),
  })
  if (informe.id) {
    const { data } = await apiClub.patch(`/pagos/${informe.id}`, datosPago)
    return aInforme(data, medios)
  }
  const { data } = await apiClub.post('/pagos', datosPago)
  return aInforme(data, medios)
}
