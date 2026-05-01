# Instrucciones del NMS Optimizer: Módulos y Ranuras Potenciadas

## Primeros Pasos con la Cuadrícula

- Selecciona una **Plataforma** (Nave espacial, Multiherramienta, Corbeta, etc.) usando el icono <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Haz clic** o **pulsa dos veces** (móvil) en una ranura para marcarla como **Potenciada**.
- **Ctrl-clic (Windows) / ⌘-clic (Mac) / pulsar (móvil)** para alternar entre una ranura **activa** o **inactiva**.
- Usa los **interruptores de fila** para activar o desactivar filas enteras. _(Los interruptores de fila se desactivan una vez colocados los módulos)._
- Usa el botón de **selección de módulos** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> para añadir o quitar módulos individuales dentro de un grupo tecnológico.

> 💡 **Nota:**
> Los exotrajes y las exonaves tienen cuadrículas fijas. Las ranuras de las exonaves no se pueden modificar. En los exotrajes, solo se pueden cambiar los estados activo/inactivo; los diseños de las ranuras potenciadas son fijos.

## Antes de Empezar

Esta herramienta está pensada para la **optimización al final del juego** y funciona mejor cuando:

- La mayoría o todas las ranuras de la cuadrícula están desbloqueadas.
- Todas las tecnologías relevantes están disponibles.
- Tienes **tres módulos de mejora** por tecnología.

Se admiten configuraciones parciales, pero los resultados están optimizados para plataformas totalmente mejoradas.

## Consejos de Uso

Las ranuras potenciadas son limitadas; su ubicación importa.

- **No asignes todas las ranuras potenciadas a la primera tecnología que coloques.** Esto suele bloquear diseños generales más potentes más adelante.
- Empieza asignando **2 o 3 ranuras potenciadas a una tecnología de alto impacto**, no todas ellas.
- Reserva al menos **una o más ranuras potenciadas** para una **segunda tecnología prioritaria** para mejorar la efectividad total.
- Una vez que hayas usado todas tus ranuras potenciadas, prioriza las tecnologías con **mayor número de módulos** antes de que el espacio se vea limitado.
- Deja que el optimizador se encargue de la ubicación; tu función es **establecer las prioridades y la distribución**.

Si el espacio se vuelve escaso, es posible que debas reiniciar y optimizar las tecnologías en un orden diferente para evitar una **Alerta de Optimización**.

## Consejo Profesional

El optimizador utiliza ventanas fijas dimensionadas según el recuento de módulos de cada tecnología para encontrar ubicaciones eficientes en cuanto a espacio.
Si los resultados no son ideales, **desactiva ranuras temporalmente** para guiar al optimizador hacia un mejor diseño.

## Etiquetas Theta / Tau / Sigma

Estas etiquetas clasifican las mejoras procedimentales **por estadísticas**, no por clase. Son términos antiguos que se conservan por coherencia.

- **Theta (1)** — mejores estadísticas
- **Tau (2)** — intermedias
- **Sigma (3)** — más débiles

No verás estas etiquetas en el juego. Se asignan comparando directamente las estadísticas de las mejoras.

### Comparación en el Juego

Ignora las letras de clase (S, X, etc.) y compara las estadísticas:

- Mejor → **Theta**
- Segunda → **Tau**
- Peor → **Sigma**

**La clase no determina el rango.** Las mejoras de clase X pueden ser mejores o peores que las de clase S.

## Corbetas

Las corbetas se diferencian de otras plataformas: pueden tener **hasta tres conjuntos de mejoras distintos**.

- Las **mejoras cosméticas** se muestran como `Cn`.
- Las **mejoras del reactor** se muestran como `Rn`.

El optimizador puede sugerir mejoras cosméticas por rendimiento en lugar de por apariencia, aunque las diferencias suelen ser mínimas.

## Diseños Recomendados

Para los **exotrajes** y las **exonaves**, las ranuras potenciadas son fijas y los diseños viables son limitados.
La herramienta proporciona **diseños recomendados seleccionados a mano** que reflejan las combinaciones óptimas.

Las sugerencias y diseños alternativos son bienvenidos a través de las discusiones del proyecto:
https://github.com/jbelew/nms_optimizer-web/discussions

## Guardar, Cargar y Compartir

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Cargar** — Sube un archivo `.nms` guardado para restaurar un diseño.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Guardar** — Descarga el diseño actual como un archivo `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Compartir** — Generia un enlace que otros pueden abrir directamente en el optimizador.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Capturar Pantalla** — Genera una captura de pantalla del diseño actual.
