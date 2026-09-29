Club Deportivo 

🔗 **Sitio publicado:** [c-deportivo.vercel.app](https://c-deportivo.vercel.app/)

## Integrantes

- Emmanuel Gonzalez Rojas

## De qué se trata

La consigna era tomar el sitio que había hecho antes en HTML, CSS y JavaScript ([Repositorio N° 1](https://github.com/EmmanuelGR-web/CLUB-DEPORTIVO)) y migrarlo a React, de a poco, separándolo en componentes reutilizables que se comunican por props.

En este nuevo repositorio proveché la migración para rediseñar varias partes. El sitio ahora tiene un telón de bienvenida, un banner con video, una revista digital que se hojea como un libro, un calendario de partidos, una columna de noticias, las disciplinas en forma de mazo de cartas y una galería de fotos que pasa sola.


## Funcionalidades

- **Inicio:** telón de bienvenida, banner con video, reseña histórica con revista digital, calendario de eventos, noticias, disciplinas, galería de fotos y formulario de contacto.
- **Menú lateral** con enlaces a cada sección y botón para ingresar al portal.
- **Login con acceso por roles** (simulado, sin backend): cada usuario entra a su propio panel y las rutas de los paneles están protegidas.
- **Recuperar contraseña** y opción de **mantener la sesión iniciada**.
- **Registro de nuevo socio:** al subir las fotos del DNI, una lectura con IA (simulada) completa los datos personales, que el socio puede corregir. La selfie se saca con la cámara del dispositivo y queda guardada para el carnet digital. El pago puede ser en efectivo o con tarjeta (Banco Nación, Banco Macro, Mercado Pago o Ualá), validando la marca, el número, el vencimiento y el código según cada emisor.
- **Los socios registrados pueden iniciar sesión:** se guardan en el navegador (`localStorage`) con la contraseña cifrada (SHA-256), sin repetir correo ni DNI. Como no hay backend, cada navegador tiene su propia lista.
- **Panel del socio:** estado de la membresía y categoría automática según la antigüedad (Bronce hasta 2 años, Plata hasta 10, Oro más de 10); carnet digital con foto, QR y código de barras, descargable en PDF para imprimir; historial de pagos con filtros, orden por columna y descarga del estado de cuenta en PDF; edición de datos personales y del medio de pago (con o sin débito automático), con cada cambio registrado para administración; y bandeja de entrada con correo institucional, respuestas y archivos adjuntos.
- **Panel del personal administrativo:** resumen de gestión con indicadores; solicitudes (altas de socios, cambios de datos, comprobantes) con búsqueda y filtros, que se autorizan o rechazan con motivo y le avisan al socio por su bandeja; padrón de socios; mensajes de socios respondidos desde el correo de administración; registro de cambios como constancia; y alta presencial de socios con contraseña inicial.
- **Cuota social:** vence el 15 de cada mes; después se suma un recargo del 0,1 % por día de demora. El socio informa su pago con el comprobante (imagen o PDF) y el personal lo verifica y aprueba o rechaza. El personal también puede abrir la ficha de cada socio, corregir sus datos, medio de pago y ver sus movimientos, y restablecer su contraseña al número de DNI; el socio puede cambiarla desde su panel.
- **Paneles en vivo:** los paneles se actualizan solos cuando otro usuario hace un cambio (se puede probar con el socio y el personal en dos pestañas) y tienen un botón para actualizar a mano. El personal y el administrador principal tienen un canal de mensajes interno.
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
- **React Icons** para los íconos (redes sociales, marcas y disciplinas)
- **react-pageflip** para el efecto de pasar las hojas de la revista
- **qrcode.react** para el código QR del carnet digital
- **jsPDF** y **jspdf-autotable** para descargar la credencial y el estado de cuenta en PDF
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

Después abrí el link que muestra la terminal (normalmente `http://localhost:5173`). Para generar la versión final se usa `npm run build`.

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
