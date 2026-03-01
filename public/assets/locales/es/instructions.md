# Ayuda del optimizador NMS

## Uso básico

- Seleccione una **Plataforma** (Starship, Multi-Tool, Corvette, etc.) usando el ícono <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Haga clic** o **toque dos veces** (móvil) en una celda para marcarla como **Supercargada**.
- **Ctrl y clic (Windows) / ⌘ y clic (Mac) / toque único (móvil)** para alternar una celda **activa** o **inactiva**.
- Utilice **cambios de fila** para habilitar o deshabilitar filas enteras. *(El cambio de filas se desactiva una vez que se colocan los módulos).*
- Utilice el botón **selección de módulo** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> para agregar o eliminar módulos individuales dentro de un grupo de tecnología.

> 💡 **Nota:**
> Exosuits y Exocraft tienen rejillas fijas. Las células de Exocraft no se pueden modificar. En los Exosuits, solo se pueden cambiar los estados activo/inactivo; los diseños sobrealimentados son fijos.

## Antes de comenzar

Esta herramienta está diseñada para **optimizar el final del juego** y funciona mejor cuando:

- La mayoría o todas las celdas de la cuadrícula están desbloqueadas.
- Todas las tecnologías relevantes están disponibles.
- Tienes **tres módulos de actualización** por tecnología.

Se admiten configuraciones parciales, pero los resultados se optimizan para plataformas completamente actualizadas.

## Theta/Tau/Sigma

Estas etiquetas clasifican las actualizaciones de procedimientos **por estadísticas**, no por clase. Son términos heredados que se conservan por motivos de coherencia.

- **Theta (1)** — mejores estadísticas
- **Tau (2)** — medio
- **Sigma (3)** — más débil

No verás estas etiquetas en el juego. Se asignan comparando directamente las estadísticas de actualización.

### Comparación en el juego

Ignora las letras de clase (S, X, etc.) y compara estadísticas:

- Mejor → **Theta**
- Segundo → **Tau**
- Peor → **Sigma**

**La clase no determina el rango.** Las mejoras del Clase X pueden superar o superar al Clase S.

## Corbetas

Los Corvettes se diferencian de otras plataformas: pueden tener **hasta tres conjuntos de mejoras independientes**.

- **Las mejoras cosméticas** se muestran como `Cn`.
- **Las actualizaciones del reactor** se muestran como `Rn`.

El solucionador puede sugerir mejoras cosméticas para mejorar el rendimiento sobre la apariencia, aunque las diferencias suelen ser menores.

## Construcciones recomendadas

Para **Exosuits** y **Exocraft**, las celdas sobrealimentadas son fijas y los diseños viables son limitados.
La herramienta proporciona **compilaciones recomendadas cuidadosamente seleccionadas** que reflejan combinaciones óptimas.

Se aceptan sugerencias y diseños alternativos a través de las discusiones del proyecto:
https://github.com/jbelew/nms_optimizer-web/discussions

## Guardar, cargar y compartir

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Cargar**: cargue un archivo `.nms` guardado para restaurar un diseño.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Guardar**: descargue el diseño actual como un archivo `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Compartir**: genera un enlace que otros pueden abrir directamente en el optimizador.

## Consejos de uso

Las celdas sobrealimentadas son limitadas: la ubicación es importante.

- Comience con **una tecnología de alto impacto** que se beneficia de múltiples celdas supercargadas.
- Asigne las celdas supercargadas restantes a una **tecnología de segunda prioridad** en lugar de apilar todo en un solo lugar.
- Priorice las tecnologías con **números de módulos más grandes** antes de que el espacio se vea limitado.
- Deje que el solucionador se encargue de la colocación; su función es **establecer prioridades**.

Si hay poco espacio, es posible que tengas que restablecer y resolver las tecnologías en un orden diferente para evitar una **Alerta de optimización**.

## Consejo profesional

El solucionador utiliza ventanas fijas dimensionadas según el número de módulos de cada tecnología para encontrar ubicaciones que aprovechen el espacio.
Si los resultados no son ideales, **deshabilite temporalmente las celdas** para guiar al solucionador hacia un mejor diseño.
