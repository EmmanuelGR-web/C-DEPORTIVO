export const empleadoDemo = {
  id: 'emp-a01',
  nombre: 'Pedro Díaz',
  codigo: 'A01',
  puesto: 'Personal administrativo',
  sector: 'Atención al socio',
  correo: 'pedro.diaz@clubdeportivo.com.ar',
  interno: 'Interno 214',
  turno: 'Lunes a viernes, de 9 a 17 h',
  ingreso: '2019-03-01',
}

export const adminDemo = {
  nombre: 'Laura Gómez',
  codigo: 'D01',
  puesto: 'Administradora principal',
  correo: 'direccion@clubdeportivo.com.ar',
}

export const rolesPersonal = ['Administrativo', 'Tesorería', 'Recepción', 'Mantenimiento']

export const diasLaborales = { 'Lunes a viernes': [1, 2, 3, 4, 5], 'Lunes a sábado': [1, 2, 3, 4, 5, 6], 'Fines de semana': [0, 6] }

export const personalInicial = [
  { id: 'emp-a01', codigo: 'A01', nombre: 'Pedro Díaz', dni: '30125478', rol: 'Administrativo', correo: 'pedro.diaz@clubdeportivo.com.ar', telefono: 'Interno 214', dias: 'Lunes a viernes', entrada: '09:00', salida: '17:00', ingreso: '2019-03-01' },
  { id: 'emp-a02', codigo: 'A02', nombre: 'Ana García', dni: '32874105', rol: 'Administrativo', correo: 'ana.garcia@clubdeportivo.com.ar', telefono: 'Interno 215', dias: 'Lunes a viernes', entrada: '13:00', salida: '21:00', ingreso: '2021-07-12' },
  { id: 'emp-a03', codigo: 'A03', nombre: 'Roberto Díaz', dni: '27455890', rol: 'Tesorería', correo: 'roberto.diaz@clubdeportivo.com.ar', telefono: 'Interno 230', dias: 'Lunes a viernes', entrada: '08:00', salida: '16:00', ingreso: '2016-02-01' },
  { id: 'emp-a04', codigo: 'A04', nombre: 'Silvia Fernández', dni: '25698741', rol: 'Recepción', correo: 'silvia.fernandez@clubdeportivo.com.ar', telefono: 'Interno 201', dias: 'Fines de semana', entrada: '08:00', salida: '14:00', ingreso: '2018-05-20', ausencia: { motivo: 'Licencia médica', desde: '2026-09-14', hasta: '2026-10-12', nota: 'Reposo por cirugía de rodilla.' } },
  { id: 'emp-a05', codigo: 'A05', nombre: 'Martín Suárez', dni: '35987412', rol: 'Mantenimiento', correo: 'martin.suarez@clubdeportivo.com.ar', telefono: 'Interno 250', dias: 'Lunes a sábado', entrada: '06:00', salida: '14:00', ingreso: '2022-10-03' },
]
