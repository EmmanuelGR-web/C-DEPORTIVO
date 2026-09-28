Club Deportivo 

🔗 **Sitio publicado:** [c-deportivo.vercel.app](https://c-deportivo.vercel.app/)

## Integrantes

- Emmanuel Gonzalez Rojas

## De qué se trata

La consigna era tomar el sitio que había hecho antes en HTML, CSS y JavaScript ([Repositorio N° 1](https://github.com/EmmanuelGR-web/CLUB-DEPORTIVO)) y migrarlo a React, de a poco, separándolo en componentes reutilizables que se comunican por props.

No me limité a pasar el HTML a JSX: aproveché la migración para rediseñar varias partes. El sitio ahora tiene un telón de bienvenida, un banner con video, una revista digital que se hojea como un libro, un calendario de partidos y una columna de noticias.


## Tecnologías

- **React 19** con **Vite** como entorno de desarrollo
- **React Bootstrap** y **Bootstrap 5.3** para el diseño
- **React Router** para las rutas
- **React Icons** para los íconos (redes sociales, marcas y disciplinas)
- **react-pageflip** para el efecto de pasar las hojas de la revista
- **Git y GitHub** para el control de versiones
- **Vercel** para publicar el sitio

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
