## Uso Básico

- **Haga clic o toque** el ícono ⚙️ para seleccionar su **Tecnología**.
- **Haga clic o doble toque** en una celda para marcarla como **Supercargada** (hasta 4 por cuadrícula).
- **Ctrl-clic** (Windows) / **⌘-clic** (Mac) o **un solo toque** (en el móvil) para alternar el estado **activo** de una celda — las celdas activas pueden contener módulos.
- Use los **botones de alternancia de fila** para habilitar o deshabilitar filas enteras. Los alternadores de fila se **desactivan una vez que se colocan los módulos** y se vuelven a habilitar cuando presiona **Restablecer Cuadrícula**.

> 💡 **Nota:** Los Exotrajes y Exocrafts tienen configuraciones de cuadrícula fijas. Las celdas de Exocraft no se pueden modificar en absoluto. En los Exotrajes, solo puede alternar el estado de las celdas entre activo o inactivo; no se admite el cambio del diseño supercargado.

## Antes de Empezar

Esta herramienta es para **jugadores de final de partida** que optimizan el diseño de la tecnología de su plataforma para obtener la máxima eficiencia. Funciona mejor cuando:

- Ha desbloqueado **la mayoría o todas las celdas** en su plataforma (Nave Estelar, Exotraje, Exocraft o Multiherramienta).
- Tiene acceso a **todas las tecnologías relevantes**.
- Posee un **juego completo de tres módulos de actualización** por tecnología aplicable.

Si todavía está desbloqueando celdas o recolectando módulos, la herramienta aún puede proporcionar información, pero está diseñada principalmente para **plataformas completamente actualizadas**.

## Información sobre Corbetas

Las corbetas funcionan de manera un poco diferente a otras plataformas: en lugar de un solo conjunto de actualizaciones, pueden tener hasta tres.

- Las **actualizaciones cosméticas** se muestran como `Cn`.
- Las **actualizaciones del reactor** se muestran como `Rn`.

El solucionador también sugerirá las mejores actualizaciones cosméticas si prefiere priorizar el rendimiento sobre la apariencia, aunque en la práctica, las compensaciones son mínimas la mayor parte del tiempo.

Tenga en cuenta que un subsistema tecnológico de corbeta completamente actualizado ocupa **mucho** espacio. Los interruptores a la derecha de cada tecnología de corbeta le permiten elegir entre una **solución cosmética**, organizando los elementos colocados automáticamente en la ranura de tecnología con ajustes y adiciones mínimas, o una **solución min/max** totalmente optimizada para el rendimiento.

Con 60 ranuras de tecnología completas, normalmente solo tendrá espacio para tres o cuatro **soluciones min/max**, así que elija sabiamente.

## Construcciones Recomendadas

Para plataformas como **Exotrajes** y **Exocrafts**, donde las celdas supercargadas son fijas, el número de diseños viables es **extremadamente limitado**. En lugar de lidiar con miles de millones de permutaciones como lo hacemos para las naves estelares o las multiherramientas, estamos trabajando con solo un puñado de las mejores posibilidades.

Esto permite que la herramienta ofrezca **construcciones recomendadas** — diseños cuidadosamente seleccionados y muy opinados que reflejan las mejores combinaciones disponibles. El sistema también admite **múltiples construcciones por plataforma**, adaptadas a diferentes casos de uso. Por ejemplo:

- El **Minotauro** incluye tanto una **construcción de propósito general** (para cuando lo está pilotando activamente) como una **construcción de soporte de IA dedicada** (optimizada para el despliegue remoto).

Otras plataformas pueden incluir **variantes especializadas en el futuro** — como una **configuración de carreras de Pilgrim** o un **Exotraje mejorado con escáner** — dependiendo de los comentarios y la demanda de los usuarios.

Si tiene comentarios o desea sugerir configuraciones alternativas, no dude en [iniciar una discusión](https://github.com/jbelew/nms_optimizer-web/discussions) — estas construcciones son seleccionadas, no generadas automáticamente, y la contribución de la comunidad ayuda a mejorarlas.

## Consejos de Uso

Las celdas supercargadas proporcionan bonificaciones importantes, pero son limitadas — cada ubicación importa. **Evite igualar ciegamente su diseño supercargado en el juego.** Para obtener los mejores resultados:

- **Comience con una tecnología de alto impacto** — una que se adapte a su estilo de juego y se beneficie de dos o tres celdas supercargadas, como el _Motor de Pulso_, el _Lanzador de Pulsos_, el _Acelerador de Infra-Cuchillo_ o el _Cañón de Neutrones_.
  Marque esas celdas como supercargadas y luego resuelva.
- **Use sus celdas supercargadas restantes** para una segunda tecnología prioritaria como el _Hiperimpulsor_, el _Escáner_ o el _Rayo de Minería_, y resuelva de nuevo. Repartir las bonificaciones suele ser mejor que apilarlas todas en una sola tecnología.
- Una vez que sus tecnologías principales estén resueltas, cambie el enfoque a aquellas con **mayor número de módulos** (p. ej., _Hiperimpulsor_, _Rastros de Nave Estelar_) antes de quedarse sin espacio contiguo.
- El solucionador hace el trabajo pesado — su trabajo es **priorizar las tecnologías** según su forma de jugar.

A medida que el espacio en la cuadrícula se vuelve escaso, es posible que deba **restablecer algunas tecnologías** y resolverlas en un orden diferente para evitar la temida **Alerta de Optimización**. Con una nave estelar completamente actualizada, a menudo se quedará con una sola celda abierta, o ninguna si está optimizando un **Interceptor**.

## Consejo Profesional

Hay matemáticas reales detrás de la ubicación. El solucionador funciona dentro de ventanas fijas basadas en cuántos módulos requiere una tecnología y, en general, elige el diseño más eficiente sin desperdiciar espacio. Pero si las cosas no se alinean:

- Intente **desactivar algunas celdas** para guiar al solucionador hacia una mejor ventana.
- Un pequeño ajuste puede liberar zonas de ubicación clave y mejorar su diseño final.