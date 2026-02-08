# Guía del optimizador de NMS: bonificación de adyacencia y optimización del diseño

## Uso básico

- **Haga clic o toque** el ícono ⚙️ para seleccionar su **Plataforma** (naves espaciales, multiherramientas, corbetas, etc.).
- **Haga clic o toque dos veces** (en dispositivos móviles) para marcar una celda como **Supercargada**.
- **Ctrl-clic** (Windows) / **⌘-clic** (Mac) o **un solo toque** (en dispositivos móviles) para alternar el estado **activo** de una celda.
- Utilice los **botones de alternancia de fila** para habilitar o deshabilitar filas enteras. Los cambios de fila están **deshabilitados una vez que se colocan los módulos**.

> 💡 **Nota:** Los Exosuits y Exocraft tienen configuraciones de cuadrícula fija. Las células Exocraft no se pueden modificar en absoluto. En Exosuits, sólo puedes alternar celdas activas o inactivas; No se admite cambiar el diseño sobrealimentado.

## Antes de comenzar

Esta herramienta está diseñada para **jugadores de finales** que optimizan el diseño tecnológico de su plataforma para lograr la máxima eficiencia. Funciona mejor cuando:

- Has desbloqueado **la mayoría o todas las celdas** en tu plataforma (Starship, Exosuit, Exocraft o Multi-Tool).
- Tienes acceso a **todas las tecnologías relevantes**.
- Posees un **conjunto completo de tres módulos de actualización** por tecnología aplicable.

Si todavía estás desbloqueando celdas o recopilando módulos, la herramienta aún puede brindarte información, pero está diseñada principalmente para **plataformas completamente actualizadas**.

## Etiquetas Theta / Tau / Sigma

Estas etiquetas clasifican las actualizaciones de procedimientos **por calidad de estadísticas**, no por clase. Son **términos heredados de versiones anteriores del juego**, mantenidos para mantener la coherencia en el tema y el estilo.

- **Theta** — mejor actualización de procedimiento _(se muestra como **1** en la cuadrícula)_
- **Tau** — medio _(se muestra como **2** en la cuadrícula)_
- **Sigma** — peor _(se muestra como **3** en la cuadrícula)_

No verás estos nombres en tu inventario. Se asignan **comparando las estadísticas reales de las actualizaciones para la misma tecnología**.

### Cómo usar esto en el juego

Ignore la letra de clase (S, X, etc.). En su lugar, compare las estadísticas directamente:

- Mejores estadísticas → **Theta (1)**
- Segundo mejor → **Tau (2)**
- Peores estadísticas → **Sigma (3)**

### Clase S frente a Clase X

La clase **no** determina el rango. Las actualizaciones de la Clase X pueden ser superiores o inferiores a las de la Clase S.

- Si una Clase X tiene las mejores estadísticas, es **Theta (1)**
- Si una Clase S es más débil, se convierte en **Tau (2)** o **Sigma (3)**

**En pocas palabras:** Theta/Tau/Sigma simplemente significa **mejor/medio/peor**, basándose únicamente en las estadísticas.

## Información sobre Corbetas

Los Corvettes funcionan de manera un poco diferente a otras plataformas: en lugar de solo un conjunto de actualizaciones, pueden tener hasta tres.

- **Las mejoras cosméticas** se muestran como "Cn".
- **Las actualizaciones del reactor** se muestran como `Rn`.

El solucionador también sugerirá las mejores actualizaciones cosméticas si prefiere priorizar el rendimiento sobre la apariencia, aunque en la práctica, las compensaciones son mínimas la mayor parte del tiempo.

## Construcciones recomendadas

Para plataformas como **Exosuits** y **Exocraft**, donde las celdas sobrealimentadas son fijas, la cantidad de diseños viables es **extremadamente limitada**.
Esto permite que la herramienta ofrezca **compilaciones recomendadas**: diseños cuidadosamente seleccionados y altamente obstinados que reflejan las mejores combinaciones disponibles.

Si tiene comentarios o desea sugerir configuraciones alternativas, no dude en [iniciar una discusión](https://github.com/jbelew/nms_optimizer-web/discussions): estas compilaciones están seleccionadas, no generadas automáticamente, y los aportes de la comunidad ayudan a mejorarlas.

## Guardar, cargar y compartir compilaciones

Puede guardar sus diseños optimizados, recargarlos más tarde o compartirlos con amigos, lo que facilita la administración de múltiples configuraciones para la misma plataforma.

- **Guardar compilación**: haga clic en el ícono de guardar para descargar su diseño actual como un archivo `.nms`. Se te pedirá que pongas un nombre a tu compilación; la herramienta también genera automáticamente nombres temáticos como `"Corvette - Crusade of the Starfall.nms"`, que puedes personalizar.
- **Cargar compilación**: haga clic en el icono de carga para cargar un archivo `.nms` previamente guardado. Su cuadrícula se actualizará inmediatamente para coincidir con el diseño guardado, incluidas todas las ubicaciones de los módulos y las posiciones de las celdas supercargadas.
- **Compartir compilación**: haga clic en el ícono de compartir para generar un enlace que se pueda compartir para su diseño actual. Los amigos pueden usar este enlace para cargar su compilación directamente en su optimizador sin necesidad del archivo.

## Consejos de uso

Las celdas sobrealimentadas ofrecen importantes ventajas, pero son limitadas: cada ubicación es importante. **Evita hacer coincidir ciegamente el diseño supercargado del juego.** Para obtener mejores resultados:

- **Comienza con una tecnología de alto impacto**, una que se adapte a tu estilo de juego y se beneficie de dos o tres celdas supercargadas, como _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_ o _Neutron Cannon_.
  Marca esas celdas como supercargadas y luego resuelve.
- **Usa las celdas supercargadas restantes** para una tecnología de segunda prioridad como _Hyperdrive_, _Scanner_ o _Mining Beam_, y resuelve de nuevo. Los bonos de distribución generalmente son mejores que acumularlos todos en una sola tecnología.
- Una vez resueltas tus tecnologías principales, cambia el enfoque a aquellas con **números de módulos más grandes** (por ejemplo, _Hyperdrive_, _Starship Trails_) antes de quedarte sin espacio contiguo.
- El solucionador hace el trabajo pesado: tu trabajo es **priorizar las tecnologías** según tu forma de jugar.

A medida que el espacio de la cuadrícula se reduce, es posible que tengas que **restablecer algunas tecnologías** y resolverlas en un orden diferente para evitar la temida **Alerta de optimización**. Con una nave estelar completamente mejorada, a menudo tendrás una cuadrícula completamente llena.

## Consejo profesional

Hay verdaderas matemáticas detrás de la ubicación. El solucionador busca ventanas fijas que coincidan con la cantidad de módulos que necesita una tecnología y, por lo general, encuentra el diseño que ahorra más espacio. Si algo no está alineado, intenta **deshabilitar temporalmente algunas celdas** para dirigirlo hacia un mejor lugar en la cuadrícula.