// Simula el servicio de IA que lee el frente y el dorso del DNI.
// En producción, acá se enviarían las dos fotos a una API de lectura de documentos.
const datosLeidos = {
  nombre: 'Juan Pérez García',
  dni: '20.123.456',
  fechaNacimiento: '1995-04-12',
  direccion: 'Av. Mate de Luna 2345, San Miguel de Tucumán',
}

export const leerDni = () => new Promise((resolver) => setTimeout(() => resolver(datosLeidos), 2200))
