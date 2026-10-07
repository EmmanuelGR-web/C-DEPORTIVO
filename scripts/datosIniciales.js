const contrasenaCifrada = '637e7c5f2e791200a1688142f4fe61e137d9876fb52767286dd6355587ac870e'
const tarjeta = (emisor, red, ultimos4, debitoAutomatico) => ({ tipo: 'tarjeta', emisor, red, ultimos4, debitoAutomatico })
const efectivo = { tipo: 'efectivo', debitoAutomatico: false }

const socio = (datos) => ({ estado: 'Activo', contrasenaCifrada, cargaInicial: true, ...datos })

export const sociosIniciales = [
  socio({
    id: 'juan',
    nombre: 'Juan Pérez',
    dni: '12345678',
    fechaNacimiento: '1990-06-15',
    direccion: 'Av. Aconquija 1450, Yerba Buena',
    telefono: '381 555-7788',
    email: 'socio@club.com',
    fechaAlta: '2020-03-10T12:00:00',
    medioPago: tarjeta('macro', 'visa', '4242', true),
  }),
  socio({
    id: 'ejemplo-ricardo',
    nombre: 'Ricardo Álvarez',
    dni: '20145879',
    fechaNacimiento: '1968-04-02',
    direccion: 'Av. Mate de Luna 2150, San Miguel de Tucumán',
    telefono: '381 421-5566',
    email: 'ricardo.alvarez@mail.com',
    fechaAlta: '2009-04-18T10:00:00',
    medioPago: tarjeta('nacion', 'visa', '4410', true),
  }),
  socio({
    id: 'ejemplo-marta',
    nombre: 'Marta Giménez',
    dni: '23987451',
    fechaNacimiento: '1974-09-21',
    direccion: 'Crisóstomo Álvarez 870, San Miguel de Tucumán',
    telefono: '381 430-1122',
    email: 'marta.gimenez@mail.com',
    fechaAlta: '2013-08-05T11:30:00',
    medioPago: efectivo,
  }),
  socio({
    id: 'ejemplo-lucas',
    nombre: 'Lucas Herrera',
    dni: '36214578',
    fechaNacimiento: '1992-01-15',
    direccion: 'Santiago del Estero 1540, San Miguel de Tucumán',
    telefono: '381 512-7788',
    email: 'lucas.herrera@mail.com',
    fechaAlta: '2017-02-22T09:15:00',
    medioPago: efectivo,
  }),
  socio({
    id: 'ejemplo-sofia',
    nombre: 'Sofía Romero',
    dni: '39874512',
    fechaNacimiento: '1996-06-30',
    direccion: 'Aconquija 3200, Yerba Buena',
    telefono: '381 655-9021',
    email: 'sofia.romero@mail.com',
    fechaAlta: '2019-11-10T16:40:00',
    medioPago: tarjeta('macro', 'mastercard', '5588', false),
  }),
  socio({
    id: 'ejemplo-tomas',
    nombre: 'Tomás Acosta',
    dni: '42563987',
    fechaNacimiento: '2000-03-08',
    direccion: 'Las Piedras 640, San Miguel de Tucumán',
    telefono: '381 587-3344',
    email: 'tomas.acosta@mail.com',
    fechaAlta: '2022-06-30T12:00:00',
    medioPago: tarjeta('mercadopago', 'visa', '7731', true),
  }),
  socio({
    id: 'ejemplo-valentina',
    nombre: 'Valentina Ruiz',
    dni: '44125896',
    fechaNacimiento: '2003-11-12',
    direccion: 'Bernabé Aráoz 300, San Miguel de Tucumán',
    telefono: '381 699-4455',
    email: 'valentina.ruiz@mail.com',
    fechaAlta: '2025-01-15T18:20:00',
    medioPago: efectivo,
  }),
  socio({
    id: 'ejemplo-joaquin',
    nombre: 'Joaquín Molina',
    dni: '46987123',
    fechaNacimiento: '2006-08-19',
    direccion: 'Perú 1100, Yerba Buena',
    telefono: '381 700-8812',
    email: 'joaquin.molina@mail.com',
    fechaAlta: '2026-03-02T10:45:00',
    medioPago: tarjeta('uala', 'mastercard', '2044', true),
  }),
  socio({
    id: 'ejemplo-camila',
    nombre: 'Camila Sosa',
    dni: '45321789',
    fechaNacimiento: '2004-02-27',
    direccion: 'Lamadrid 455, San Miguel de Tucumán',
    telefono: '381 622-1098',
    email: 'camila.sosa@mail.com',
    fechaAlta: '2026-09-22T15:10:00',
    medioPago: efectivo,
    estado: 'En validación',
  }),
]

const imagenComprobante = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="480" height="300" fill="#fbf5ea"/><rect x="0" y="0" width="480" height="56" fill="#7a0f2e"/><text x="24" y="36" font-family="Arial" font-size="20" fill="#fff">Comprobante de transferencia</text><text x="24" y="104" font-family="Arial" font-size="16" fill="#1e1b24">Origen: Sofía Romero · Banco Macro</text><text x="24" y="136" font-family="Arial" font-size="16" fill="#1e1b24">Destino: Club Deportivo · CBU 0000003100012345678901</text><text x="24" y="168" font-family="Arial" font-size="16" fill="#1e1b24">Concepto: cuota social</text><text x="24" y="220" font-family="Arial" font-size="28" font-weight="bold" fill="#7a0f2e">$ 18.000</text><text x="24" y="270" font-family="Arial" font-size="13" fill="#6b6475">Operación N° 88412037 · Transferencia inmediata</text></svg>',
)}`

const hoy = new Date()
const periodo = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
const diaDelMes = (dia) => `${periodo}-${String(Math.min(dia, hoy.getDate())).padStart(2, '0')}`

export const informesIniciales = {
  'ejemplo-marta': {
    [periodo]: {
      fechaPago: diaDelMes(20),
      medio: 'Efectivo',
      monto: 21105,
      comprobante: null,
      estado: 'Aprobado',
      informadoEl: `${diaDelMes(20)}T11:00:00`,
      vence: new Date(hoy.getFullYear(), hoy.getMonth(), 15, 23, 59, 59).toISOString(),
    },
  },
  'ejemplo-sofia': {
    [periodo]: {
      fechaPago: diaDelMes(14),
      medio: 'Transferencia',
      monto: 18000,
      comprobante: { nombre: 'comprobante-sofia-romero.svg', tipo: 'image/svg+xml', dataUrl: imagenComprobante, tamanio: 1400 },
      estado: 'En revisión',
      informadoEl: `${diaDelMes(14)}T19:30:00`,
      verificacionIA: {
        leido: true,
        esComprobante: true,
        monto: 18000,
        fecha: diaDelMes(14),
        numeroOperacion: '88412037',
        origen: 'Sofía Romero · Banco Macro',
        destino: 'Club Deportivo',
        observaciones: '',
        montoEsperado: 18000,
        coincideMonto: true,
        coincideFecha: true,
      },
      vence: new Date(hoy.getFullYear(), hoy.getMonth(), 15, 23, 59, 59).toISOString(),
    },
  },
}

export const noticiasIniciales = [
  {
    id: 'partido-local',
    categoria: 'Fútbol',
    fecha: '2026-09-25',
    titulo: 'Próximo partido de local',
    resumen: 'El primer equipo recibe este domingo a las 17 h en La Caldera.',
    cuerpo: [
      'El primer equipo de fútbol vuelve a jugar de local este domingo a las 17 h en La Caldera, por la fecha 12 del torneo.',
      'Las entradas anticipadas para socios se retiran en la sede de lunes a viernes de 9 a 20 h presentando el carnet y la cuota al día.',
    ],
  },
  {
    id: 'inscripciones-2027',
    categoria: 'Institucional',
    fecha: '2026-09-22',
    titulo: 'Abrieron las inscripciones 2027',
    resumen: 'Ya podés anotarte en las escuelas deportivas y categorías formativas.',
    cuerpo: [
      'Están abiertas las inscripciones 2027 para las escuelas deportivas de fútbol, básquet, vóley y hockey, desde los 5 años.',
      'Los socios tienen prioridad de cupo hasta el 31 de octubre. Después se abre la inscripción general.',
    ],
    enlace: { texto: 'Anotate acá', ruta: '/registro' },
  },
  {
    id: 'camiseta-oficial',
    categoria: 'Tienda',
    fecha: '2026-09-18',
    titulo: 'Nueva camiseta oficial',
    resumen: 'Ya está disponible en la tienda del club la nueva indumentaria.',
    imagen: '/jugadores.jpeg',
    cuerpo: [
      'La nueva camiseta titular mantiene los bastones rojos y blancos de siempre y suma detalles en bordó en el cuello y las mangas.',
      'Ya está a la venta en la tienda del club, con 15 % de descuento para socios.',
    ],
  },
  {
    id: 'clasico-basquet',
    categoria: 'Básquet',
    fecha: '2026-09-15',
    titulo: 'Triunfo en el clásico',
    resumen: 'El equipo de básquet ganó 78 a 71 en un estadio cubierto repleto.',
    cuerpo: [
      'En un partido parejo hasta el último cuarto, el equipo de básquet se quedó con el clásico por 78 a 71 ante un estadio cubierto repleto.',
      'Con este resultado, el club quedó segundo en la tabla de la Liga Tucumana.',
    ],
  },
]
