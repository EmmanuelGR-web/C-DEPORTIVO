import { leerSocios, actualizarSocio } from './socios'
import { leerAuditoria, marcarResuelto, registrarCambios } from './auditoria'
import { aplicarIdentidad, correoAdministracion, listarPerfiles, perfilSocio, revertirCambios } from './perfilSocio'
import { guardarHilos, leerHilos } from './mensajes'
import { diasDeDemora, guardarInforme, leerInformes } from './cuotas'
import { formatearPesos } from './carnet'

const claveEstados = 'estadosSolicitudes'

const leerEstados = () => {
  try {
    return JSON.parse(localStorage.getItem(claveEstados)) ?? {}
  } catch {
    return {}
  }
}

export const listarSolicitudes = () => {
  const estados = leerEstados()

  const altas = leerSocios()
    .filter((s) => !s.cargaInicial || s.estado !== 'Activo')
    .map((s) => ({
      id: `alta-${s.id}`,
      tipo: 'Alta de socio',
      socioId: s.id,
      socioNombre: s.nombre,
      socioDni: s.dni,
      fecha: s.fechaAlta,
      detalle: `Se registró desde la web con pago en ${s.medioPago?.tipo === 'tarjeta' ? 'tarjeta' : 'efectivo'}.`,
      cambios: [],
      foto: s.foto,
      lecturaIA: s.lecturaIA ?? null,
      estadoInicial: s.estado === 'Activo' ? 'Autorizado' : 'Pendiente',
    }))

  const perfiles = listarPerfiles()
  const actual = (socioId) => perfiles.find((p) => p.id === socioId)

  const cambios = leerAuditoria()
    .filter((r) => r.autor === 'Socio' && r.seccion !== 'Contraseña')
    .map((r) => ({
      id: `cambio-${r.id}`,
      auditoriaId: r.id,
      tipo: r.pendiente ? 'Cambio de nombre, DNI o nacimiento' : r.seccion === 'Datos personales' ? 'Cambio de contacto o domicilio' : r.seccion,
      socioId: r.socioId,
      socioNombre: actual(r.socioId)?.nombre ?? r.socioNombre,
      socioDni: actual(r.socioId)?.dni,
      fecha: r.fecha,
      detalle: r.pendiente ? detalleIdentidad(r) : 'Cambio hecho por el socio desde su panel. Si lo rechazás, la cuenta vuelve a los datos anteriores.',
      cambios: r.cambios,
      valores: r.valores,
      pendiente: r.pendiente,
      estadoInicial: { Autorizado: 'Autorizado', Rechazado: 'Rechazado' }[r.resuelto],
    }))

  const operaciones = perfiles.flatMap((perfil) =>
    Object.entries(leerInformes(perfil.id))
      .map(([periodo, informe]) => ({ clave: `${perfil.id}-${periodo}`, numero: informe.verificacionIA?.numeroOperacion?.replace(/\D/g, '') }))
      .filter((o) => o.numero),
  )
  const repetida = (clave, numero) => Boolean(numero) && operaciones.some((o) => o.numero === numero && o.clave !== clave)

  const comprobantes = perfiles.flatMap((perfil) =>
    Object.entries(leerInformes(perfil.id)).map(([periodo, informe]) => {
      const [anio, mes] = periodo.split('-')
      const fechaPago = new Date(`${informe.fechaPago}T12:00:00`)
      const demora = diasDeDemora(Number(anio), Number(mes) - 1, fechaPago, informe.vence ? new Date(informe.vence) : undefined)
      return {
        id: `pago-${perfil.id}-${periodo}-${informe.informadoEl}`,
        tipo: 'Comprobante de pago',
        socioId: perfil.id,
        socioNombre: perfil.nombre,
        socioDni: perfil.dni,
        fecha: informe.informadoEl,
        detalle: `Informó el pago de la cuota ${mes}/${anio} por ${formatearPesos(informe.monto)}, pagado el ${fechaPago.toLocaleDateString('es-AR')} (${informe.medio.toLowerCase()}).${
          demora > 0 ? ` Pagó con ${demora} ${demora === 1 ? 'día' : 'días'} de demora: el monto incluye el recargo.` : ' Pagó en término.'
        } Verificá que el comprobante coincida con la fecha y el monto.`,
        cambios: [],
        comprobante: informe.comprobante,
        verificacionIA: informe.verificacionIA ?? null,
        operacionRepetida: repetida(`${perfil.id}-${periodo}`, informe.verificacionIA?.numeroOperacion?.replace(/\D/g, '')),
        periodo,
        informe,
        estadoInicial: { Aprobado: 'Autorizado', Rechazado: 'Rechazado' }[informe.estado] ?? 'Pendiente',
      }
    }),
  )

  return [...altas, ...cambios, ...comprobantes]
    .map((s) => ({ ...s, estado: estados[s.id]?.estado ?? s.estadoInicial ?? 'Pendiente', revision: estados[s.id] ?? null }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}

const enumerar = (lista) => (lista.length > 1 ? `${lista.slice(0, -1).join(', ')} y ${lista.at(-1)}` : lista[0])

const detalleIdentidad = (registro) => {
  const campos = enumerar(registro.cambios.map((c) => `su ${c.campo === 'DNI' ? 'DNI' : c.campo.toLowerCase()}`))
  if (registro.resuelto === 'Autorizado') return `El socio pidió cambiar ${campos}. El cambio ya se aplicó en su perfil y en su carnet.`
  if (registro.resuelto === 'Rechazado') return `El socio pidió cambiar ${campos}. El pedido se rechazó y sus datos quedaron como estaban.`
  return `El socio pidió cambiar ${campos}. No se aplica hasta que lo autorices: comparalo con las fotos del DNI.`
}

const avisarAlSocio = (solicitud, estado, motivo, revertidos = []) => {
  if (!solicitud.socioId) return
  const socio = perfilSocio({ id: solicitud.socioId })
  if (!socio) return
  const texto =
    estado === 'Autorizado'
      ? `Tu solicitud "${solicitud.tipo}" fue autorizada.${solicitud.tipo === 'Alta de socio' ? ' Tu carnet digital ya está activo. ¡Bienvenido/a al club!' : ''}${solicitud.pendiente ? ' Tus datos ya se actualizaron en tu perfil y en tu carnet.' : ''}`
      : `Tu solicitud "${solicitud.tipo}" fue rechazada.${motivo ? ` Motivo: ${motivo}` : ''}${
          revertidos.length ? ` Restablecimos los datos anteriores de: ${revertidos.join(', ').toLowerCase()}.` : ''
        } Si tenés dudas, respondé este mensaje.`
  const hilo = {
    id: crypto.randomUUID(),
    asunto: `${solicitud.tipo}: ${estado.toLowerCase()}`,
    leido: false,
    mensajes: [{ id: crypto.randomUUID(), de: correoAdministracion, para: socio.correoInstitucional, fecha: new Date().toISOString(), texto, adjuntos: [] }],
  }
  guardarHilos(socio.id, [hilo, ...leerHilos(socio)])
}

export const resolverSolicitud = (solicitud, estado, empleado, motivo = '') => {
  const revision = { estado, revisadoPor: `${empleado.nombre} (${empleado.codigo})`, fecha: new Date().toISOString(), motivo }
  try {
    localStorage.setItem(claveEstados, JSON.stringify({ ...leerEstados(), [solicitud.id]: revision }))
  } catch {
    return false
  }

  if (solicitud.tipo === 'Alta de socio' && solicitud.socioId) {
    actualizarSocio(solicitud.socioId, { estado: estado === 'Autorizado' ? 'Activo' : 'Rechazado' })
  }
  if (solicitud.informe) {
    guardarInforme(solicitud.socioId, solicitud.periodo, { ...solicitud.informe, estado: estado === 'Autorizado' ? 'Aprobado' : 'Rechazado', motivo })
  }
  const autor = revision.revisadoPor
  let revertidos = []
  if (solicitud.pendiente) {
    if (estado === 'Autorizado') aplicarIdentidad(solicitud.socioId, solicitud.valores)
    marcarResuelto(solicitud.auditoriaId, estado)
  } else if (estado === 'Rechazado' && solicitud.valores) {
    revertidos = revertirCambios(solicitud.socioId, solicitud.valores, autor).revertidos ?? []
  }
  avisarAlSocio(solicitud, estado, motivo, revertidos)
  registrarCambios({
    socioId: solicitud.socioId ?? solicitud.id,
    socioNombre: solicitud.socioNombre,
    seccion: `Solicitud: ${solicitud.tipo}`,
    autor: revision.revisadoPor,
    cambios: [{ campo: 'Estado', anterior: solicitud.estado, nuevo: motivo ? `${estado} (${motivo})` : estado }],
  })
  return true
}

export const listarConversaciones = (perfiles) =>
  perfiles
    .flatMap((socio) =>
      leerHilos(socio)
        .filter((hilo) => hilo.mensajes.some((m) => m.de !== correoAdministracion))
        .map((hilo) => {
          const ultimo = hilo.mensajes.at(-1)
          return { socio, hilo, ultimo, sinResponder: ultimo.de !== correoAdministracion }
        }),
    )
    .sort((a, b) => b.ultimo.fecha.localeCompare(a.ultimo.fecha))

export const responderConversacion = (socio, hiloId, { texto, adjuntos }) => {
  const hilos = leerHilos(socio).map((h) =>
    h.id === hiloId
      ? {
          ...h,
          leido: false,
          mensajes: [
            ...h.mensajes,
            { id: crypto.randomUUID(), de: correoAdministracion, para: socio.correoInstitucional, fecha: new Date().toISOString(), texto, adjuntos },
          ],
        }
      : h,
  )
  return guardarHilos(socio.id, hilos)
}
