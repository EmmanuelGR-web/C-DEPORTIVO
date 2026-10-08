Club Deportivo 

🔗 **Sitio publicado:** [c-deportivo.vercel.app](https://c-deportivo.vercel.app/)

## Integrantes

- Emmanuel Gonzalez Rojas

## De qué se trata

La consigna era tomar el sitio que había hecho antes en HTML, CSS y JavaScript ([Repositorio N° 1](https://github.com/EmmanuelGR-web/CLUB-DEPORTIVO)) y migrarlo a React, de a poco, separándolo en componentes reutilizables que se comunican por props.

En este nuevo repositorio proveché la migración para rediseñar varias partes. El sitio ahora tiene un telón de bienvenida, un banner con video, una revista digital que se hojea como un libro, un calendario de partidos, una columna de noticias, las disciplinas en forma de mazo de cartas y una galería de fotos que pasa sola.


## Funcionalidades

- **Inicio:** telón de bienvenida, banner con video, reseña histórica con revista digital, calendario con los partidos de San Martín de Tucumán y la tabla completa de la Primera Nacional (API de ESPN), noticias cargadas desde la API del club, disciplinas, galería de fotos y formulario de contacto.
- **Menú lateral** con enlaces a cada sección y botón para ingresar al portal.
- **Login con acceso por roles:** cada usuario entra a su propio panel y las rutas de los paneles están protegidas.
- **Recuperar contraseña** y opción de **mantener la sesión iniciada**.
- **Registro de nuevo socio:** al subir las fotos del DNI, la IA de Gemini (Google) lee el documento y completa nombre, DNI, fecha de nacimiento y domicilio, que el socio puede corregir; el personal ve qué leyó la IA y qué se corrigió. La selfie se saca con la cámara del dispositivo y queda guardada para el carnet digital. El pago puede ser en efectivo o con tarjeta (Banco Nación, Banco Macro, Mercado Pago o Ualá), validando la marca, el número, el vencimiento y el código según cada emisor.
- **Datos desde una API con axios:** los socios (con sus pagos) y las noticias se leen y se guardan en una API REST (MockAPI) usando **axios** con sus cuatro métodos: `get` (padrón, fichas, noticias), `post` (registro, alta en la sede, nueva noticia), `put` (editar datos, informar y aprobar pagos, editar noticia) y `delete` (dar de baja un socio, borrar una noticia). Las contraseñas se guardan cifradas (SHA-256). Los servicios están en `src/services/`.
- **Carga, errores y avisos:** cada consulta a la API se hace dentro de un `useEffect` (hook `useConsulta`) y guarda los datos, el estado de carga y el error con `useState`. Mientras carga se ve un spinner; si falla, **SweetAlert2** avisa el error y queda un botón para reintentar. SweetAlert2 también confirma los borrados (noticias, baja de socios) y avisa cuando algo se guardó.
- **Fútbol en vivo:** el calendario consume la API pública de ESPN: los últimos resultados y los próximos partidos de San Martín de Tucumán, y la tabla de posiciones completa de la Primera Nacional, por zona.
- **Panel del socio:** estado de la membresía y categoría automática según la antigüedad (Bronce hasta 2 años, Plata hasta 10, Oro más de 10); carnet digital con foto, QR y código de barras, descargable en PDF para imprimir; historial de pagos con filtros, orden por columna y descarga del estado de cuenta en PDF; edición de datos personales y del medio de pago (con o sin débito automático), con cada cambio registrado para administración; y bandeja de entrada con correo institucional, respuestas y archivos adjuntos.
- **Panel del personal administrativo:** resumen de gestión con indicadores; solicitudes (altas de socios, cambios de datos, comprobantes) con búsqueda y filtros, que se autorizan o rechazan con motivo y le avisan al socio por su bandeja; padrón de socios; mensajes de socios respondidos desde el correo de administración; registro de cambios como constancia; y alta presencial de socios con contraseña inicial.
- **Cuota social:** vence el 15 de cada mes; después se suma un recargo del 0,1 % por día de demora. El socio informa su pago con el comprobante (imagen o PDF) y el personal lo verifica y aprueba o rechaza. El personal también puede abrir la ficha de cada socio, corregir sus datos, medio de pago y ver sus movimientos, y restablecer su contraseña al número de DNI; el socio puede cambiarla desde su panel.
- **Panel del administrador principal:** resumen general; gestión del personal (alta, edición, baja, filtros por rol y estado, y acciones sobre varios a la vez); control en vivo del personal conectado y del tiempo de descanso de cada jornada; mensajes internos eligiendo el destinatario; padrón y fichas de socios, con baja de socios; gestión de las noticias de Inicio (crear, editar, borrar); facturación del mes con los comprobantes enviados; un **resumen económico** (ingresos cobrados, cuotas impagas, socios morosos y activos, cobros por medio de pago y evolución de los últimos meses) que se descarga en PDF para contaduría; y reportes con el registro de cambios.
- **Paneles en vivo:** los paneles vuelven a consultar la API cada 10 segundos y se actualizan solos cuando otro usuario hace un cambio (se puede probar con el socio y el personal en dos pestañas) y tienen un botón para actualizar a mano. El personal y el administrador principal tienen un canal de mensajes interno.
- **Comprobantes leídos con IA:** al adjuntar un comprobante, la IA lee el monto, la fecha, el medio y el número de operación, completa el formulario y lo compara con la cuota. El personal ve si coincide y un aviso si el número de operación ya se usó en otro comprobante.
- **Diseño responsive** para celular, tablet y computadora.

### Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Socio | `socio@club.com` | `socio123` |
| Personal administrativo | `administrativo@club.com` | `admin123` |
| Administrador principal | `administrador@club.com` | `principal123` |

## Tecnologías

- **React 19** con **Vite** como entorno de desarrollo
- **React Bootstrap** y **Bootstrap 5.3** para el diseño
- **React Router** para las rutas
- **axios** para consumir las APIs (instancias con URL base, `params` e interceptores para traducir los errores)
- **MockAPI** como API REST de los socios y las noticias, y la **API pública de ESPN** para el fútbol
- **SweetAlert2** para los mensajes de error, éxito y confirmación (con botones de Bootstrap y los colores del club)
- **React Icons** para los íconos (redes sociales, marcas y disciplinas)
- **react-pageflip** para el efecto de pasar las hojas de la revista
- **qrcode.react** para el código QR del carnet digital
- **API de Gemini (Google, plan gratuito)** para leer DNI y comprobantes, desde una función serverless de Vercel (`api/leer-documento.js`)
- **jsPDF** y **jspdf-autotable** para descargar la credencial, el estado de cuenta y el resumen económico en PDF
- **Git y GitHub** para el control de versiones
- **Vercel** para publicar el sitio

## Instalación y ejecución

Hace falta tener [Node.js](https://nodejs.org/) instalado.

```bash
git clone https://github.com/EmmanuelGR-web/C-DEPORTIVO.git
cd C-DEPORTIVO
npm install
npm run dev
```

Antes de `npm run dev`, copiá `.env.example` como `.env` y completá las variables:

| Variable | Para qué sirve |
|---|---|
| `VITE_API_URL` | URL de la API del club (proyecto de MockAPI con los recursos `socios` y `noticias`) |
| `VITE_DEPORTES_URL`, `VITE_DEPORTES_EQUIPO`, `VITE_DEPORTES_LIGA`, `VITE_DEPORTES_NOMBRE_LIGA` | API pública de ESPN (equipo 17814 = San Martín de Tucumán, liga `arg.2` = Primera Nacional). Cambiando estos valores se muestra cualquier otro equipo y liga |
| `GEMINI_API_KEY` | Clave gratuita de [Google AI Studio](https://aistudio.google.com/apikey) para leer DNI y comprobantes (opcional: sin ella se completan a mano) |

Para cargar los datos iniciales en la API (socios de prueba y noticias) se usa `npm run sembrar`.

Después abrí el link que muestra la terminal (normalmente `http://localhost:5173`). Para generar la versión final se usa `npm run build`. En Vercel, las mismas variables se cargan en *Settings → Environment Variables*.

## Estructura

```
├── public/                  
│   └── revista/           
├── src/
│   ├── components/
│   │   ├── common/          
│   │   ├── layout/          
│   │   └── inicio/          
│   ├── data/                
│   ├── hooks/               
│   ├── pages/               
│   ├── routes/              
│   ├── styles/              
│   └── utils/               
├── index.html               
└── vercel.json              
```

## Estrategias SEO

1. **Palabras clave donde importan.** El título de la pestaña, la descripción y los encabezados usan palabras que la gente realmente busca ("club deportivo", "fútbol", "básquet", "vóley", "hockey", "Tucumán", "asociate"), en lugar de frases genéricas como "Bienvenidos a nuestro sitio".

2. **Un título y un `<h1>` por página.** Inicio tiene su `<h1>` con el nombre del club en el banner. Las demás páginas tienen el suyo, y cada una cambia el título de la pestaña (por ejemplo, "Iniciar sesión | Club Deportivo") gracias al hook `useTituloPagina`. Debajo del `<h1>` los encabezados siguen un orden lógico: `<h2>` para cada sección y `<h3>` para las tarjetas.

3. **HTML semántico.** Uso `<section>`, `<aside>`, `<footer>` y `<figure>` con `<figcaption>`, y botones de verdad para todo lo que se puede tocar. Eso ayuda a los buscadores y a los lectores de pantalla a entender la estructura.

4. **Metadatos en `index.html`.** Tiene `meta description`, idioma en español (`lang="es"`), `canonical` y color de tema. También tiene las etiquetas **Open Graph**, que arman la vista previa con título, descripción e imagen cuando alguien comparte el link por WhatsApp o redes.

5. **`robots.txt` y `sitemap.xml`.** Le indican a Google qué páginas puede indexar y cuáles no, como los paneles internos del socio, del personal y del administrador.

6. **Imágenes optimizadas.** Todas tienen nombres que describen lo que muestran (`fundacion.jpeg`, `campeones.jpeg`) y un texto `alt`. Las que no se ven al entrar, como las de la revista y las noticias, usan `loading="lazy"` para que la página cargue más rápido.

7. **Contenido propio y útil.** La revista, las noticias y el calendario tienen información concreta sobre el club (historia, horarios, lugares, cómo sacar entradas), que es lo que valoran los buscadores.

8. **Enlaces internos.** El menú lleva a cada sección de Inicio, y los botones "Asociate" y "Anotate acá" llevan al registro. Así el usuario y los buscadores pueden recorrer todo el sitio.

9. **Responsive y rápido.** Google prioriza los sitios que se ven bien en el celular. Además, Vite genera archivos livianos y Vercel los sirve desde servidores cercanos al usuario.


## Sobre el contenido

El club, su historia, los jugadores, los rivales y las noticias son **ficticios**, inventados para el proyecto. Las imágenes del telón, la revista y el video del banner fueron generadas con inteligencia artificial. Los logos de los sponsors son marcas reales que se usan solo como ejemplo, sin ninguna relación con el club.
