export const empleadoDemo = {
  nombre: 'Pedro Díaz',
  codigo: 'A01',
  puesto: 'Personal administrativo',
  sector: 'Atención al socio',
  correo: 'pedro.diaz@clubdeportivo.com.ar',
  interno: 'Interno 214',
  turno: 'Lunes a viernes, de 9 a 17 h',
  ingreso: '2019-03-01',
}

// Solicitudes de ejemplo, para que el panel no arranque vacío
export const solicitudesDemo = [
  {
    id: 'demo-maria',
    tipo: 'Modificación de datos',
    socioNombre: 'María López',
    socioDni: '28456789',
    fecha: '2026-09-26T11:20:00',
    detalle: 'Pidió cambiar su dirección por mudanza.',
    cambios: [{ campo: 'Dirección', anterior: 'San Martín 450, San Miguel de Tucumán', nuevo: 'Av. Perón 1200, Yerba Buena' }],
  },
  {
    id: 'demo-ana',
    tipo: 'Comprobante de pago',
    socioNombre: 'Ana Gómez',
    socioDni: '33102987',
    fecha: '2026-09-27T16:05:00',
    detalle: 'Envió el comprobante de la transferencia de la cuota de septiembre ($ 15.000).',
    cambios: [],
  },
  {
    id: 'demo-carlos',
    tipo: 'Alta de socio',
    socioNombre: 'Carlos Ruiz',
    socioDni: '40555123',
    fecha: '2026-09-28T09:40:00',
    detalle: 'Se registró desde la web. Falta validar la identidad con las fotos del DNI.',
    cambios: [],
  },
]
