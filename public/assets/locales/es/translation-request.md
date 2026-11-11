# Ayuda a traducir NMS Optimizer: únete a nuestra localización comunitaria

## Ayuda a traducir NMS Optimizer

Las estadísticas muestran visitantes de todo el mundo y me encantaría hacer el optimizador más accesible para la comunidad global de _No Man's Sky_; ahí es donde entras tú.

## Cómo puedes ayudar

Busco jugadores bilingües que ayuden a revisar y pulir las localizaciones al **español, francés, alemán, portugués e italiano**, o a aportar nuevos idiomas con comunidades activas de jugadores de NMS.

No hace falta ser traductor profesional: basta con tener fluidez en el idioma, conocer _No Man's Sky_ en tu lengua y tener ganas de echar una mano. Aunque las traducciones asistidas por IA ofrecen una cobertura amplia, los jugadores bilingües son insustituibles para detectar matices de redacción o verificar la terminología exacta del juego. Aparecerás en los créditos (o podrás mantener el anonimato si lo prefieres).

La mayoría de los textos son etiquetas breves de la interfaz, descripciones emergentes o mensajes de estado con humor.

## Cómo colaborar

La forma más sencilla de colaborar es directamente desde GitHub. No necesitas saber programar para proponer una traducción mejor:

1. **Localiza el archivo**: Todos los archivos de localización se encuentran en `/public/assets/locales/[language_code]/`:
    - `translation.json`: **Paquete de idioma** con etiquetas de la interfaz, nombres del catálogo, descripciones emergentes y metadatos de página.
    - `*.md`: **Documentos de ruta localizados** para guías completas y cuadros de diálogo (Acerca de, Instrucciones, etc.).
2. **Edita directamente en GitHub**:
    - Abre el archivo de tu idioma (por ejemplo, `/public/assets/locales/es/translation.json`).
    - Haz clic en el **icono del lápiz (Edit this file)**.
    - Realiza tus cambios.
    - Haz clic en **Commit changes...** y GitHub te guiará para abrir una Pull Request.

## Idiomas admitidos

Actualmente admitimos:

- `en` (inglés - origen)
- `es` (español)
- `fr` (francés)
- `de` (alemán)
- `pt` (portugués)
- `it` (italiano)

Si quieres añadir un **nuevo idioma**, abre una incidencia o una Pull Request con una carpeta que utilice su [código ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

## Notas

- **Términos canónicos del juego**: Los nombres de plataformas, tecnologías y módulos deben coincidir con el texto oficial localizado de Hello Games dentro del juego, en lugar de traducciones literales del inglés.
- **Interpolación**: Conserva intactas las etiquetas como `<1></1>`, `<strong></strong>`, `<icon/>` y los marcadores como `{{techName}}` para que el formato dinámico de la interfaz siga funcionando.

¡Gracias por ayudar a que el optimizador de diseños de tecnología de No Man's Sky sea mejor para todo el mundo!
