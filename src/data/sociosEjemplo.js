const contrasenaCifrada = '637e7c5f2e791200a1688142f4fe61e137d9876fb52767286dd6355587ac870e'
const tarjeta = (emisor, red, ultimos4, debitoAutomatico) => ({ tipo: 'tarjeta', emisor, red, ultimos4, debitoAutomatico })
const efectivo = { tipo: 'efectivo', debitoAutomatico: false }

const socio = (datos) => ({ estado: 'Activo', contrasenaCifrada, ejemplo: true, ...datos })

export const sociosEjemplo = [
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

export const informesEjemplo = {
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
      vence: new Date(hoy.getFullYear(), hoy.getMonth(), 15, 23, 59, 59).toISOString(),
    },
  },
}
