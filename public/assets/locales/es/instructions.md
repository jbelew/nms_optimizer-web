# Instrucciones de NMS Optimizer: módulos y ranuras potenciadas

## Primeros pasos con la cuadrícula

- Selecciona un **Tipo de plataforma** (nave, multiherramienta, corbeta, etc.) con el botón <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Haz clic** o **pulsa dos veces** (móvil) en una ranura vacía para alternar su estado **Potenciado**.
- **Ctrl-clic** (Windows) / **⌘-clic** (Mac) / **un toque** (móvil) en una ranura para alternar su estado **activo** o **inactivo**.
- **Controles de teclado:** Pulsa las **teclas de flecha** (↑, ↓, ←, →) e **Inicio** / **Fin** para mover el foco. Pulsa **S** o **Shift+Enter** para alternar el estado **Potenciado**. Pulsa **Espacio** o **Enter** para alternar el estado **activo** o **inactivo**.
- Usa los **interruptores de fila** para activar o desactivar una fila entera. _(Los interruptores de fila se bloquean después de colocar módulos en la cuadrícula.)_
- Haz clic en el botón de **Selección de módulos** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> de una **Categoría de tecnología** para activar o desactivar módulos individuales y ver las dimensiones requeridas de la **Ventana de cálculo**.
- Alterna el **Modo de enfoque** <radix-icon name="EyeOpenIcon" size="20" color="var(--accent-11)"></radix-icon> para reducir las distracciones visuales y mejorar la legibilidad del texto.

> 💡 **Nota:**
> A los exotrajes y las exonaves se les aplican **Restricciones de ranuras**. Las exonaves usan un **Diseño de cuadrícula predeterminado** fijo en el que las ranuras no se pueden modificar. Los exotrajes tienen ubicaciones fijas para las ranuras potenciadas, por lo que solo puedes cambiar el estado activo o inactivo de las ranuras.

## Antes de empezar

Esta herramienta está pensada para la **optimización al final del juego** y ofrece los mejores resultados cuando:

- La mayoría o la totalidad de las ranuras de la cuadrícula están activas.
- Todos los módulos de cada **Categoría de tecnología** están desbloqueados.
- Tienes **tres módulos de mejora procedimentales** por cada **Categoría de tecnología**.

Puedes optimizar configuraciones parciales, pero el motor de cálculo está orientado a **Tipos de plataforma** mejorados al máximo.

## Consejos de uso

Las ranuras potenciadas son limitadas. Repártelas entre varias **Categorías de tecnología** para conseguir la mayor bonificación total:

- **No asignes todas las ranuras potenciadas a la primera Categoría de tecnología.** Hacerlo reduce la bonificación disponible para otros sistemas.
- Asigna **de 2 a 3 ranuras potenciadas** a tu **Categoría de tecnología** de máxima prioridad.
- Reserva **1 o más ranuras potenciadas** para una segunda **Categoría de tecnología**.
- Una vez ocupadas todas las ranuras potenciadas, optimiza primero las **Categorías de tecnología** que requieran mayores dimensiones de **Ventana de cálculo**.
- Define tus prioridades y deja que el optimizador calcule la ubicación óptima de los módulos.

### Ventana de cálculo y alertas de optimización

Cada **Categoría de tecnología** requiere una **Ventana de cálculo** (`ancho × alto`) determinada por su **Selección de módulos** activa.

- Si ninguna región contigua de ranuras activas coincide con la **Ventana de cálculo** requerida, aparece una **Alerta de optimización** (**Patrón sin espacio**).
- Desde la alerta puedes ejecutar una **Resolución forzada** (recocido simulado completo sobre las ranuras disponibles) o cancelar, aplicar **Reiniciar** a las categorías ya colocadas y optimizarlas en otro orden.
- **Consejo experto:** Desactiva temporalmente ranuras concretas antes de optimizar para orientar dónde se coloca la **Ventana de cálculo**.

## Orden de rango de módulos (Theta / Tau / Sigma)

El **Orden de rango de módulos** (`Theta → Tau → Sigma`) clasifica los módulos de mejora procedimentales **según el valor de sus estadísticas**, no según su clase:

- **Theta (1)** — estadísticas más altas
- **Tau (2)** — estadísticas intermedias
- **Sigma (3)** — estadísticas más bajas

Estas etiquetas no aparecen dentro del juego. Compara directamente los valores de estadísticas de tus mejoras procedimentales:

- Estadísticas más altas → **Theta**
- Segundas estadísticas más altas → **Tau**
- Estadísticas más bajas → **Sigma**

**La clase de mejora no determina el Orden de rango de módulos.** Una mejora de clase X puede tener estadísticas superiores o inferiores a una mejora de clase S.

## Corbetas

Las corbetas admiten hasta **tres Grupos de módulos de mejora independientes** dentro de una misma **Categoría de tecnología**:

- Los **módulos cosméticos** usan la etiqueta `Cn`.
- Los **módulos de reactor** usan la etiqueta `Rn`.

Al colocar módulos cosméticos, el optimizador prioriza las bonificaciones de estadísticas sobre la apariencia visual.

## Diseños recomendados

Los exotrajes y las exonaves tienen ranuras potenciadas fijas y menos permutaciones posibles. Usa el menú **Diseños recomendados** para cargar distribuciones seleccionadas para las configuraciones más habituales.

Envía sugerencias de diseños o comentarios en los debates del proyecto:
<https://github.com/jbelew/nms_optimizer-web/discussions>

## Guardar, cargar y compartir

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Cargar diseño** — Abre desde el disco un **Archivo de diseño** `.nms` guardado.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Guardar diseño** — Descarga la distribución actual como un **Archivo de diseño** `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Compartir diseño** — Genera una URL de **Cuadrícula compartida** que abre tu diseño en el optimizador.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Capturar pantalla del diseño** — Guarda una imagen PNG del diseño actual de la cuadrícula.
