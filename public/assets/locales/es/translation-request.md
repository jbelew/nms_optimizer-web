# Ayuda a Traducir el NMS Optimizer: Únete a Nuestra Localización Comunitaria

## Ayuda a Traducir el NMS Optimizer

Las estadísticas muestran visitantes de todo el mundo y me encantaría hacerlo más accesible para la comunidad global de No Man's Sky, y ahí es donde entras tú.

## Cómo Puedes Ayudar

Busco jugadores bilingües que ayuden a traducir la aplicación, especialmente para **revisar y corregir las traducciones en francés, alemán, español y portugués generadas por IA**, o para trabajar en otros idiomas con comunidades de jugadores de NMS activas.

No necesitas ser un traductor profesional, solo tener fluidez, estar familiarizado con el juego y tener ganas de ayudar. Aunque las traducciones generadas por IA son un buen punto de partida, a menudo pierden el contexto o los matices específicos del juego. Se te darán créditos (o puedes permanecer en el anonimato si lo prefieres).

La mayoría de las cadenas son etiquetas de interfaz cortas, descripciones emergentes o mensajes de estado divertidos.

## El Flujo de Trabajo

El NMS Optimizer utiliza ahora un **flujo de trabajo de traducción basado en IA** mediante la API de Gemini 2.5 Flash. Esto garantiza que cada vez que se actualiza el contenido en inglés, todos los demás idiomas admitidos se actualicen automáticamente en cuestión de minutos.

Sin embargo, la IA no es perfecta. Confiamos en la comunidad para identificar y corregir "alucinaciones" o terminología incorrecta de NMS.

## Cómo Contribuir

La forma más fácil de contribuir es directamente a través de GitHub. No necesitas saber programar para sugerir una traducción mejor.

1. **Encuentra el Archivo**: Todos los archivos de localización se encuentran en `/public/assets/locales/[código_de_idioma]/`.
    - `translation.json`: Etiquetas de la interfaz, descripciones emergentes y mensajes de estado.
    - `*.md`: Contenido para los diálogos más extensos (Acerca de, Instrucciones, etc.).
2. **Edita Directamente en GitHub**:
    - Navega hasta el archivo de tu idioma (por ejemplo, `/public/assets/locales/es/translation.json`).
    - Haz clic en el **icono del lápiz (Editar este archivo)**.
    - Realiza tus cambios.
    - Haz clic en **Commit changes...** (Confirmar cambios) y GitHub creará automáticamente un Pull Request (solicitud de extracción) por ti.
3. **Espera a la Fusión**: Una vez que fusione tu PR, el script de IA detectará automáticamente tus ediciones humanas y se asegurará de que se conserven en futuras actualizaciones.

## Idiomas Admitidos

Actualmente admitimos:

- `en` (Inglés - Fuente)
- `es` (Español)
- `fr` (Francés)
- `de` (Alemán)
- `pt` (Portugués)

Si quieres añadir un **nuevo idioma**, solo tienes que crear una nueva carpeta con el [código ISO 639-1](https://es.wikipedia.org/wiki/ISO_639-1) correspondiente y lo añadiré a la rotación de la IA.

## Notas

- **Interpolación**: Verás etiquetas como `<1></1>` o `{{techName}}`. **Por favor, mantén estas etiquetas exactamente como están**, ya que la aplicación las utiliza para insertar contenido dinámico o estilos.
- **Prioridad Humana**: El script de traducción está diseñado para respetar las ediciones humanas. Si cambias un valor en un archivo JSON, la IA no lo sobrescribirá durante la próxima ejecución automática.

¡Gracias por ayudar a que el Optimizador de Diseño de Tecnología de No Man's Sky sea mejor para todos! No dudes en preguntarme si tienes cualquier duda, estaré encantado de ayudarte.
