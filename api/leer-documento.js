const modelosGratis = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite']
const reintentables = [404, 429, 500, 503]
const tamanioMaximo = 4 * 1024 * 1024
const tiposPermitidos = /^data:(image\/(jpeg|png|webp|gif)|application\/pdf);base64,/

const esquemas = {
  dni: {
    type: 'OBJECT',
    properties: {
      esDni: { type: 'BOOLEAN', description: 'true si las imágenes son de un DNI argentino' },
      legible: { type: 'BOOLEAN', description: 'true si los datos principales se pueden leer con seguridad' },
      apellido: { type: 'STRING' },
      nombres: { type: 'STRING' },
      numeroDni: { type: 'STRING', description: 'Solo los dígitos, sin puntos' },
      fechaNacimiento: { type: 'STRING', description: 'Formato AAAA-MM-DD' },
      fechaVencimiento: { type: 'STRING', description: 'Formato AAAA-MM-DD, vacío si no figura' },
      domicilio: { type: 'STRING', description: 'Calle y número, localidad y provincia, tal como figura en el dorso' },
      observaciones: { type: 'STRING', description: 'Problemas encontrados (foto borrosa, reflejo, falta un lado), en español y breve' },
    },
    required: ['esDni', 'legible'],
  },
  comprobante: {
    type: 'OBJECT',
    properties: {
      esComprobante: { type: 'BOOLEAN', description: 'true si es un comprobante de pago, transferencia o depósito' },
      legible: { type: 'BOOLEAN' },
      monto: { type: 'NUMBER', description: 'Importe pagado en pesos, sin separadores de miles' },
      fecha: { type: 'STRING', description: 'Fecha del pago, formato AAAA-MM-DD' },
      medio: { type: 'STRING', enum: ['Transferencia', 'Billetera virtual', 'Depósito', 'Efectivo', 'Otro'] },
      numeroOperacion: { type: 'STRING', description: 'Número de operación, transacción o comprobante' },
      origen: { type: 'STRING', description: 'Quién pagó y desde qué banco o billetera' },
      destino: { type: 'STRING', description: 'A quién se pagó' },
      observaciones: { type: 'STRING', description: 'Algo raro o que no se pudo leer, en español y breve' },
    },
    required: ['esComprobante', 'legible'],
  },
}

const instrucciones = {
  dni: 'Leé este DNI argentino. La primera imagen es el frente y la segunda el dorso. Copiá los datos exactamente como figuran. Si un dato no se lee con seguridad, dejalo vacío en lugar de adivinar.',
  comprobante: (hoy) =>
    `Leé este comprobante de pago de una cuota social. Hoy es ${hoy}: si la fecha no trae año, usá el de hoy. Si un dato no se lee con seguridad, dejalo vacío en lugar de adivinar.`,
}

const responder = (res, estado, datos) => {
  res.statusCode = estado
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(datos))
}

const leerCuerpo = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  let texto = ''
  for await (const parte of req) texto += parte
  return JSON.parse(texto || '{}')
}

const parteDe = ({ dataUrl }) => {
  const [cabecera, datos] = dataUrl.split(',')
  return { inline_data: { mime_type: cabecera.slice(5, cabecera.indexOf(';')), data: datos } }
}

const capitalizar = (texto = '') =>
  texto
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((palabra) => (['de', 'del', 'la', 'y'].includes(palabra) ? palabra : palabra[0].toUpperCase() + palabra.slice(1)))
    .join(' ')

const ordenarDni = (d) => ({
  esDni: Boolean(d.esDni),
  legible: Boolean(d.legible),
  nombre: capitalizar(`${d.nombres ?? ''} ${d.apellido ?? ''}`.trim()),
  dni: (d.numeroDni ?? '').replace(/\D/g, ''),
  fechaNacimiento: /^\d{4}-\d{2}-\d{2}$/.test(d.fechaNacimiento ?? '') ? d.fechaNacimiento : '',
  vencimiento: /^\d{4}-\d{2}-\d{2}$/.test(d.fechaVencimiento ?? '') ? d.fechaVencimiento : '',
  direccion: d.domicilio ?? '',
  observaciones: d.observaciones ?? '',
})

const ordenarComprobante = (d) => ({
  esComprobante: Boolean(d.esComprobante),
  legible: Boolean(d.legible),
  monto: typeof d.monto === 'number' && d.monto > 0 ? Math.round(d.monto * 100) / 100 : null,
  fecha: /^\d{4}-\d{2}-\d{2}$/.test(d.fecha ?? '') ? d.fecha : '',
  medio: d.medio ?? '',
  numeroOperacion: (d.numeroOperacion ?? '').trim(),
  origen: d.origen ?? '',
  destino: d.destino ?? '',
  observaciones: d.observaciones ?? '',
})

export default async function leerDocumento(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { error: 'Método no permitido.' })

  const clave = process.env.GEMINI_API_KEY
  if (!clave) return responder(res, 503, { error: 'La lectura con IA no está configurada en este servidor.' })

  let cuerpo
  try {
    cuerpo = await leerCuerpo(req)
  } catch {
    return responder(res, 400, { error: 'El pedido no es válido.' })
  }

  const { tipo, archivos, contexto = {} } = cuerpo
  const cantidad = tipo === 'dni' ? 2 : 1
  if (!esquemas[tipo] || !Array.isArray(archivos) || archivos.length !== cantidad) {
    return responder(res, 400, { error: 'Faltan las imágenes del documento.' })
  }
  if (archivos.some((a) => typeof a?.dataUrl !== 'string' || !tiposPermitidos.test(a.dataUrl))) {
    return responder(res, 400, { error: 'Solo se aceptan imágenes o PDF.' })
  }
  if (archivos.reduce((total, a) => total + a.dataUrl.length, 0) > tamanioMaximo) {
    return responder(res, 413, { error: 'Los archivos son demasiado pesados.' })
  }

  const texto = tipo === 'dni' ? instrucciones.dni : instrucciones.comprobante(contexto.hoy ?? new Date().toISOString().slice(0, 10))

  try {
    const modelos = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL, ...modelosGratis] : modelosGratis
    let respuesta
    for (const modelo of modelos) {
      respuesta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': clave },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [...archivos.map(parteDe), { text: texto }] }],
          generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: esquemas[tipo] },
        }),
      })
      if (!reintentables.includes(respuesta.status)) break
    }
    const datos = await respuesta.json()
    if (respuesta.status === 429) return responder(res, 429, { error: 'Se alcanzó el límite gratuito de lecturas por minuto. Probá de nuevo en un rato.' })
    if (respuesta.status === 503) return responder(res, 503, { error: 'El servicio de IA está saturado en este momento. Probá de nuevo en unos minutos.' })
    if (!respuesta.ok) return responder(res, 502, { error: 'El servicio de IA no pudo leer el documento. Probá de nuevo.' })

    let lectura
    try {
      lectura = JSON.parse(datos.candidates?.[0]?.content?.parts?.find((parte) => parte.text)?.text ?? '')
    } catch {
      return responder(res, 502, { error: 'La IA no devolvió datos.' })
    }
    return responder(res, 200, tipo === 'dni' ? ordenarDni(lectura) : ordenarComprobante(lectura))
  } catch {
    return responder(res, 502, { error: 'No pudimos conectar con el servicio de IA.' })
  }
}
