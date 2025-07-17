## Ayuda a traducir el Optimizador de NMS

La aplicación actualmente solo está en inglés, pero los análisis muestran visitantes de todo el mundo. Me encantaría hacerla más accesible para la comunidad global de _No Man's Sky_, y ahí es donde entras tú.

## Cómo puedes ayudar

Busco jugadores bilingües que ayuden a traducir la aplicación, especialmente para editar y revisar las traducciones generadas por IA en **francés**, **alemán** y **español**, o para trabajar en otros idiomas con comunidades de jugadores de NMS fuertes.

No necesitas ser un traductor profesional, solo tener fluidez, estar familiarizado con el juego y estar dispuesto a ayudar. ¡Definitivamente será mejor que este desastre de ChatGPT! Se te dará crédito (o puedes permanecer en el anonimato si lo prefieres).

La mayoría de las cadenas son etiquetas cortas de la interfaz de usuario, descripciones emergentes o mensajes de estado divertidos.

Las traducciones se gestionan utilizando [`i18next`](https://www.i18next.com/), con archivos JSON y Markdown sencillos.

## Si te sientes cómodo con GitHub

**Haz un fork del repositorio:**
[github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)

**Actualiza o crea los archivos de traducción:**

- Las etiquetas de la interfaz de usuario de la aplicación se encuentran en `/src/i18n/locales/[language_code]/translation.json`.
- El contenido de los cuadros de diálogo más grandes se almacena como archivos Markdown puros dentro de `/public/locales/[language_code]/`.

Puedes actualizar los archivos existentes o crear una nueva carpeta para tu idioma utilizando el [código ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) (por ejemplo, `es` para español). Copia los archivos Markdown y JSON relevantes a esa carpeta y luego actualiza el contenido en consecuencia.

> _Ejemplo:_ Crea `/public/locales/es/about.md` para el contenido del diálogo y `/src/i18n/locales/es/translation.json` para las etiquetas de la interfaz de usuario.

**Envía una solicitud de extracción (pull request)** cuando hayas terminado.

## ¿No te gustan las solicitudes de extracción?

No hay problema, simplemente dirígete a la [página de Discusiones de GitHub](https://github.com/jbelew/nms_optimizer-web/discussions) y crea un nuevo hilo.

Puedes pegar tus traducciones allí o hacer preguntas si no estás seguro de por dónde empezar. Yo me encargaré desde ese punto.

## Notas

`randomMessages` es justo eso: una lista de mensajes aleatorios que se muestran cuando la optimización tarda más de un par de segundos. No es necesario traducirlos todos, solo piensa en algunos que tengan sentido en tu idioma.

¡Gracias por ayudar a que el Optimizador de Diseños de Tecnología de No Man's Sky sea mejor para todos! Avísame si tienes alguna pregunta; estaré encantado de ayudarte.
