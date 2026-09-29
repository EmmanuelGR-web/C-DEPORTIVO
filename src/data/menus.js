import { FaThLarge, FaUser, FaFileInvoiceDollar, FaInbox } from 'react-icons/fa'

export const enlacesInicio = [
  { etiqueta: 'Inicio', href: '#inicio' },
  { etiqueta: 'Reseña histórica', href: '#resena' },
  { etiqueta: 'Noticias', href: '#noticias' },
  { etiqueta: 'Calendario', href: '#calendario' },
  { etiqueta: 'Disciplinas', href: '#disciplinas' },
  { etiqueta: 'Contacto', href: '#contacto' },
]

export const menuSocio = [
  { id: 'resumen', etiqueta: 'Resumen', icono: FaThLarge },
  { id: 'datos', etiqueta: 'Datos personales', icono: FaUser },
  { id: 'pagos', etiqueta: 'Facturas y pagos', icono: FaFileInvoiceDollar },
  { id: 'bandeja', etiqueta: 'Bandeja de entrada', icono: FaInbox },
]
