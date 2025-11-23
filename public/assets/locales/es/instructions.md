## Uso básico

- **Haga clic o toque** el ícono ⚙️ para seleccionar su **Plataforma** (naves espaciales, multiherramientas, corbetas, etc.).
- **Haga clic o toque dos veces** una celda para marcarla como **Supercargada** (hasta 4 por cuadrícula).
- **Ctrl-clic** (Windows) / **⌘-clic** (Mac) o **un solo toque** (en dispositivos móviles) para alternar el estado **activo** de una celda: las celdas activas pueden contener módulos.
- Utilice los **botones de alternancia de fila** para habilitar o deshabilitar filas enteras. Los cambios de fila se **deshabilitan una vez que se colocan los módulos** y se vuelven a habilitar cuando presiona **Restablecer cuadrícula**.

> 💡 **Nota:** Los Exosuits y Exocraft tienen configuraciones de cuadrícula fija. Las células Exocraft no se pueden modificar en absoluto. En Exosuits, sólo puedes alternar celdas activas o inactivas; No se admite cambiar el diseño sobrealimentado.

## Guardar y cargar compilaciones

Puede guardar sus diseños optimizados en un archivo y recargarlos más tarde, lo que facilita la administración de múltiples configuraciones para la misma plataforma o compartir compilaciones con amigos.

- **Guardar compilación**: haga clic en el ícono de guardar para descargar su diseño actual como un archivo `.nms`. Se te pedirá que pongas un nombre a tu compilación; la herramienta genera automáticamente nombres temáticos como `"Corvette - Crusade of the Starfall.nms"` que puedes personalizar.
- **Cargar compilación**: haga clic en el icono de carga para cargar un archivo `.nms` previamente guardado. Su cuadrícula se actualizará inmediatamente para coincidir con el diseño guardado, incluidas todas las ubicaciones de los módulos y las posiciones de las celdas supercargadas.

Los archivos de compilación se validan para determinar su integridad y compatibilidad: si una compilación se guardó desde un tipo de plataforma diferente o está dañada, la herramienta se lo informará.

## Antes de comenzar

Esta herramienta es para **jugadores finales** que optimizan el diseño tecnológico de su plataforma para lograr la máxima eficiencia. Funciona mejor cuando:

- Has desbloqueado **la mayoría o todas las celdas** en tu plataforma (Starship, Exosuit, Exocraft o Multi-Tool).
- Tienes acceso a **todas las tecnologías relevantes**.
- Posees un **conjunto completo de tres módulos de actualización** por tecnología aplicable.

Si todavía estás desbloqueando celdas o recopilando módulos, la herramienta aún puede brindarte información, pero está diseñada principalmente para **plataformas completamente actualizadas**.

## Información sobre Corbetas

Los Corvettes funcionan de manera un poco diferente a otras plataformas: en lugar de solo un conjunto de actualizaciones, pueden tener hasta tres.

- **Las mejoras cosméticas** se muestran como "Cn".
- **Las actualizaciones del reactor** se muestran como `Rn`.

El solucionador también sugerirá las mejores actualizaciones cosméticas si prefiere priorizar el rendimiento sobre la apariencia, aunque en la práctica, las compensaciones son mínimas la mayor parte del tiempo.

Tenga en cuenta que un subsistema tecnológico de Corvette completamente actualizado ocupa **mucho** espacio. Con un total de 60 espacios tecnológicos, normalmente solo tendrás espacio para tres o cuatro **soluciones mínimas/máximas**, así que elige sabiamente.

## Construcciones recomendadas

Para plataformas como **Exosuits** y **Exocraft**, donde las celdas sobrealimentadas son fijas, la cantidad de diseños viables es **extremadamente limitada**. En lugar de lidiar con miles de millones de permutaciones como lo hacemos con las naves espaciales o las herramientas múltiples, estamos trabajando solo con un puñado de posibilidades en el mejor de los casos.

Esto permite que la herramienta ofrezca **compilaciones recomendadas**: diseños cuidadosamente seleccionados y altamente obstinados que reflejan las mejores combinaciones disponibles. El sistema también admite **múltiples compilaciones por plataforma**, adaptadas a diferentes casos de uso. Por ejemplo:

- El **Minotauro** incluye una **compilación de propósito general** (para cuando lo estés pilotando activamente) y una **compilación de soporte de IA dedicada** (optimizada para implementación remota).

Otras plataformas pueden incluir **variantes especializadas en el futuro**, como una **configuración de carrera de Pilgrim** o un **Exotraje potenciado por escáner**, dependiendo de los comentarios y la demanda de los usuarios.

Si tiene comentarios o desea sugerir configuraciones alternativas, no dude en [iniciar una discusión](https://github.com/jbelew/nms_optimizer-web/discussions): estas compilaciones están seleccionadas, no generadas automáticamente, y los aportes de la comunidad ayudan a mejorarlas.

## Consejos de uso

Las celdas sobrealimentadas ofrecen importantes ventajas, pero son limitadas: cada ubicación es importante. **Evita hacer coincidir ciegamente el diseño supercargado del juego.** Para obtener mejores resultados:

- **Comienza con una tecnología de alto impacto**, una que se adapte a tu estilo de juego y se beneficie de dos o tres celdas supercargadas, como _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_ o _Neutron Cannon_.
  Marca esas celdas como supercargadas y luego resuelve.
- **Usa las celdas supercargadas restantes** para una tecnología de segunda prioridad como _Hyperdrive_, _Scanner_ o _Mining Beam_, y resuelve de nuevo. Los bonos de distribución generalmente son mejores que acumularlos todos en una sola tecnología.
- Una vez resueltas tus tecnologías principales, cambia el enfoque a aquellas con **números de módulos más grandes** (por ejemplo, _Hyperdrive_, _Starship Trails_) antes de quedarte sin espacio contiguo.
- El solucionador hace el trabajo pesado: tu trabajo es **priorizar las tecnologías** según tu forma de jugar.

A medida que el espacio de la cuadrícula se reduce, es posible que tengas que **restablecer algunas tecnologías** y resolverlas en un orden diferente para evitar la temida **Alerta de optimización**. Con una nave espacial completamente mejorada, a menudo te quedarás solo con una celda abierta, o ninguna si estás optimizando un **Interceptor**.

## Consejo profesional

Hay verdaderas matemáticas detrás de la ubicación. El solucionador funciona dentro de ventanas fijas según la cantidad de módulos que requiere una tecnología y, por lo general, elige el diseño más eficiente sin desperdiciar espacio. Pero si las cosas no van bien:

- Intente **deshabilitar algunas celdas** para guiar al solucionador hacia una ventana mejor.
- Un pequeño ajuste puede liberar zonas de ubicación clave y mejorar el diseño final.