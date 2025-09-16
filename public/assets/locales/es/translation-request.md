# Ayuda a Traducir el Optimizador de NMS

Los análisis muestran visitantes de todo el mundo y me encantaría hacerlo más accesible para la comunidad global de No Man's Sky, y ahí es donde entras tú.

## Cómo Puedes Ayudar

Estoy buscando jugadores bilingües que ayuden a traducir la aplicación, especialmente para **editar y revisar las traducciones generadas por IA en francés, alemán y español**, o para trabajar en otros idiomas con comunidades de jugadores de NMS fuertes.

No necesitas ser un traductor profesional, solo ser fluido, estar familiarizado con el juego y tener ganas de ayudar. ¡Definitivamente será mejor que este desastre de ChatGPT! Se te dará crédito (o puedes permanecer en el anonimato si lo prefieres).

La mayoría de las cadenas son etiquetas cortas de la interfaz de usuario, información sobre herramientas o mensajes de estado divertidos.

Las traducciones se gestionan con [`i18next`](https://www.i18next.com/), con archivos JSON y Markdown simples. También usamos **Crowdin** para gestionar las contribuciones de traducción colaborativa.

---

## Usando Crowdin (Recomendado)

Si quieres la forma más fácil de contribuir:

1. **Regístrate en Crowdin** en [https://crowdin.com](https://crowdin.com) y solicita acceso al proyecto NMS Optimizer.
2. Una vez aprobado, puedes **editar las traducciones existentes directamente en la interfaz de usuario web** o subir tus propias traducciones.
3. Crowdin maneja diferentes idiomas y se asegura de que tus actualizaciones se sincronicen con la aplicación automáticamente.
4. Puedes centrarte en **revisar las traducciones existentes** o añadir nuevas en tu idioma.

> Crowdin utiliza códigos de idioma [ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) estándar: `fr` para francés, `de` para alemán, `es` para español, etc.

Este es el enfoque recomendado si no estás familiarizado con GitHub o si quieres que tus cambios se reflejen inmediatamente in la aplicación.

---

## Si te Sientes Cómodo con GitHub

**Haz un fork del repositorio:**
[github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)

**Actualiza o Crea los Archivos de Traducción:**

- Las etiquetas de la interfaz de usuario de la aplicación se encuentran en `/src/i18n/locales/[language_code]/translation.json`.
- El contenido de los cuadros de diálogo más grandes se almacena como archivos Markdown puros dentro de `/public/locales/[language_code]/`.

Puedes actualizar los archivos existentes o crear una nueva carpeta para tu idioma usando el [código ISO 639-1](https://en.wikipedia.org/wiki/List_of-ISO_639-1-codes) (p. ej., `de` para alemán). Copia los archivos Markdown y JSON relevantes en esa carpeta y luego actualiza el contenido como corresponda.

> _Ejemplo:_ Crea `/public/locales/de/about.md` para el contenido del diálogo y `/src/i18n/locales/de/translation.json` para las etiquetas de la interfaz de usuario.

**Envía una pull request** cuando hayas terminado.

---

## ¿No te Gustan las Pull Requests?

No hay problema, simplemente dirígete a la [página de Discusiones de GitHub](https://github.com/jbelew/nms_optimizer-web/discussions) y comienza un nuevo hilo.

Puedes pegar tus traducciones allí o hacer preguntas si no estás seguro de por dónde empezar. Yo me encargaré a partir de ahí.

---

## Notas

`randomMessages` es justo eso, una lista de mensajes aleatorios que se muestran cuando la optimización tarda más de un par de segundos. No es necesario traducirlos todos, solo inventa algunos que tengan sentido en tu idioma.

¡Gracias por ayudar a que el Optimizador de Diseño de Tecnología de No Man's Sky sea mejor para todos! Avísame si tienes alguna pregunta, estaré encantado de ayudar.