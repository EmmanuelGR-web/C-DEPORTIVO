import { socioDemo } from '../data/socio'
import { leerSocios, actualizarSocio, normalizarDni } from './socios'
import { categoriaPorAntiguedad, cuotaPorCategoria } from './categorias'
import { leerAuditoria, registrarCambios } from './auditoria'
import { calcularCuota, leerInformes, vencimientoDe, vencimientoInicial } from './cuotas'

const claveDemo = 'socioDemoEditado'
const aniosEntre = (desde, hasta) => (hasta - desde) / (365.25 * 24 * 3600 * 1000)
const mediosHistoricos = ['Transferencia', 'Tarjeta', 'Efectivo']

const quitarAcentos = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const correoAdministracion = 'administracion@clubdeportivo.com.ar'

// Nombre y apellido más los últimos 4 números de socio, así dos socios con el mismo nombre no comparten correo
export const correoInstitucional = (nombre, numeroSocio = '') => {
  const partes = quitarAcentos(nombre).toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean)
  const sufijo = numeroSocio ? `.${numeroSocio.slice(-4)}` : ''
  return `${partes.slice(0, 2).join('.')}${sufijo}@socios.clubdeportivo.com.ar`
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

// Una cuota por mes desde el alta hasta hoy. Los meses anteriores figuran pagos en término.
// El mes actual: con débito automático se cobra solo; si no, queda pendiente (o vencido después del 15)
// hasta que el socio informe el pago y el personal apruebe el comprobante.
const generarPagos = (base, hoy) => {
  const alta = new Date(base.fechaAlta)
  const informes = leerInformes(base.id)
  const debita = base.medioPago.tipo === 'tarjeta' && base.medioPago.debitoAutomatico
  const pagos = []
  const mes = new Date(alta.getFullYear(), alta.getMonth(), 1)
  let indice = 0
  while (mes <= hoy) {
    const anio = mes.getFullYear()
    const numeroMes = mes.getMonth()
    const periodo = `${anio}-${String(numeroMes + 1).padStart(2, '0')}`
    const esActual = anio === hoy.getFullYear() && numeroMes === hoy.getMonth()
    const recientes = aniosEntre(mes, hoy) < 0.5
    const vence = indice === 0 ? vencimientoInicial(base.fechaAlta) : vencimientoDe(anio, numeroMes)
    const montoBase = cuotaPorCategoria[categoriaPorAntiguedad(aniosEntre(alta, mes))] * (indice === 0 ? 2 : 1)
    const pago = {
      id: periodo,
      periodo,
      fecha: `${String(numeroMes + 1).padStart(2, '0')}/${anio}`,
      anio,
      concepto: indice === 0 ? 'Inscripción y cuota' : 'Cuota mensual',
      medio: recientes || base.esRegistrado ? textoMedio(base.medioPago) : mediosHistoricos[indice % 3],
      base: montoBase,
      recargo: 0,
      diasDemora: 0,
      monto: montoBase,
      estado: 'Aprobado',
      vence: vence.toISOString(),
    }

    if (esActual && !debita) {
      const informe = informes[periodo]
      const informado = informe && informe.estado !== 'Rechazado'
      const cuota = calcularCuota(montoBase, anio, numeroMes, informado ? new Date(`${informe.fechaPago}T12:00:00`) : hoy, vence)
      Object.assign(pago, {
        recargo: cuota.recargo,
        diasDemora: cuota.dias,
        monto: cuota.total,
        estado: informado ? (informe.estado === 'Aprobado' ? 'Aprobado' : 'En revisión') : cuota.dias > 0 ? 'Vencido' : 'Pendiente',
        medio: informado ? informe.medio : pago.medio,
        comprobante: informe?.comprobante ?? null,
        informe: informe ?? null,
      })
    }
    pagos.push(pago)
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
    estado: base.esRegistrado ? (base.estado ?? 'En validación') : 'Activo',
    correoInstitucional: correoInstitucional(base.nombre, base.esRegistrado ? base.numeroSocio : ''),
    pagos: generarPagos(base, hoy),
    identidadPendiente: leerAuditoria(base.id).find((r) => r.pendiente && !r.resuelto) ?? null,
  }
}

// Nombre, DNI y fecha de nacimiento son datos de identidad: si los cambia el socio,
// quedan pendientes hasta que el personal los apruebe comparándolos con el DNI
export const camposIdentidad = ['nombre', 'dni', 'fechaNacimiento']

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
// Devuelve false si no hubo cambios, true si se aplicaron y 'pendiente' si hay datos de identidad esperando aprobación
export const guardarCambiosSocio = (perfil, cambiosPedidos, seccion, autor = 'Socio') => {
  const cambios = cambiosPedidos.dni ? { ...cambiosPedidos, dni: normalizarDni(cambiosPedidos.dni) } : cambiosPedidos
  const distintos = Object.entries(cambios).filter(([campo, nuevo]) => JSON.stringify(perfil[campo] ?? null) !== JSON.stringify(nuevo))
  const esIdentidad = ([campo]) => autor === 'Socio' && camposIdentidad.includes(campo)
  const inmediatos = distintos.filter((c) => !esIdentidad(c))
  const aAprobar = distintos.filter(esIdentidad)

  const registrar = (lista, extra) => {
    const visibles = lista.filter(([campo]) => nombresCampo[campo])
    if (visibles.length === 0) return
    registrarCambios({
      socioId: perfil.id,
      socioNombre: perfil.nombre,
      autor,
      cambios: visibles.map(([campo, nuevo]) => ({ campo: nombresCampo[campo], anterior: describir(campo, perfil[campo]), nuevo: describir(campo, nuevo) })),
      valores: Object.fromEntries(lista.map(([campo, nuevo]) => [campo, { anterior: perfil[campo] ?? null, nuevo }])),
      ...extra,
    })
  }

  if (inmediatos.filter(([campo]) => nombresCampo[campo]).length > 0) {
    if (!aplicarCambios(perfil, Object.fromEntries(inmediatos))) return false
    registrar(inmediatos, { seccion })
  }
  if (aAprobar.length > 0) registrar(aAprobar, { seccion: 'Datos de identidad', pendiente: true })

  if (aAprobar.length > 0) return 'pendiente'
  return inmediatos.some(([campo]) => nombresCampo[campo])
}

// El personal aprobó un cambio de identidad pedido por el socio: recién ahí se aplica
export const aplicarIdentidad = (socioId, valores) => {
  const perfil = perfilSocio(socioId === socioDemo.id ? {} : { id: socioId })
  return aplicarCambios(perfil, Object.fromEntries(Object.entries(valores).map(([campo, v]) => [campo, v.nuevo])))
}

const aplicarCambios = (perfil, cambios) => {
  if (perfil.esRegistrado) return actualizarSocio(perfil.id, cambios)
  try {
    const guardados = JSON.parse(localStorage.getItem(claveDemo)) ?? {}
    localStorage.setItem(claveDemo, JSON.stringify({ ...guardados, ...cambios }))
    return true
  } catch {
    return false
  }
}

// Vuelve a poner los valores anteriores de un cambio rechazado. Si el socio ya volvió a modificar
// ese dato después, no lo pisa: solo revierte los campos que siguen con el valor rechazado.
export const revertirCambios = (socioId, valores, autor) => {
  const perfil = perfilSocio(socioId === socioDemo.id ? {} : { id: socioId })
  const aRevertir = Object.fromEntries(
    Object.entries(valores)
      .filter(([, v]) => JSON.stringify(v.anterior) !== JSON.stringify(v.nuevo))
      .filter(([campo, v]) => campo === 'fotoActualizada' || JSON.stringify(perfil[campo] ?? null) === JSON.stringify(v.nuevo))
      .map(([campo, v]) => [campo, v.anterior]),
  )
  const visibles = Object.keys(aRevertir).filter((campo) => nombresCampo[campo])
  if (visibles.length === 0) return { revertidos: [] }
  if (!aplicarCambios(perfil, aRevertir)) return { revertidos: [], error: true }

  registrarCambios({
    socioId: perfil.id,
    socioNombre: perfil.nombre,
    seccion: 'Cambio revertido',
    autor,
    cambios: visibles.map((campo) => ({ campo: nombresCampo[campo], anterior: describir(campo, perfil[campo]), nuevo: describir(campo, aRevertir[campo]) })),
  })
  return { revertidos: visibles.map((campo) => nombresCampo[campo]) }
}

export const mesesEntreCambiosDeFoto = 6

// Devuelve la fecha desde la que se puede volver a cambiar la foto, o null si ya se puede
export const proximoCambioDeFoto = (perfil, hoy = new Date()) => {
  if (!perfil.foto || !perfil.fotoActualizada) return null
  const habilitada = new Date(perfil.fotoActualizada)
  habilitada.setMonth(habilitada.getMonth() + mesesEntreCambiosDeFoto)
  return habilitada > hoy ? habilitada : null
}

// Todos los socios de este navegador (el de prueba y los registrados), con su perfil completo
export const listarPerfiles = () => [perfilSocio({}), ...leerSocios().map((s) => perfilSocio({ id: s.id }))]
