// Noticias de la columna derecha de Inicio. imagen y enlace son opcionales.
export const noticias = [
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
