## Descripción general

Esta aplicación web, el **NMS Optimizer**, ayuda a los jugadores de _No Man's Sky_ a descubrir la mejor disposición de módulos para diseñar **construcciones óptimas** para naves espaciales, corbetas, multiherramientas, exocrafts y exotrajes. Calcula automáticamente la colocación ideal de los módulos para maximizar mecánicas clave del juego como **bonos de adyacencia** (logrados agrupando tecnologías similares para efectos sinérgicos) y los potentes aumentos de **ranuras sobrealimentadas**. Comprender cómo usar mejor estas características, especialmente las ranuras sobrealimentadas, es clave para lograr el máximo rendimiento; esta herramienta simplifica ese proceso complejo.

## Cómo funciona

> ¿Cómo se resuelve un problema con hasta ~8.32 × 10⁸¹ permutaciones posibles (¡eso son 82 dígitos!) en menos de cinco segundos?

Descubrir la mejor colocación de módulos con tantas permutaciones de diseño posibles para una cuadrícula completa no es una hazaña pequeña. Esta herramienta combina patrones deterministas, aprendizaje automático y recocido simulado para ofrecer sugerencias de construcción de primer nivel para naves, corbetas, multiherramientas, exocrafts y exotrajes en menos de cinco segundos. Tiene en cuenta factores como los **bonos de adyacencia** y el uso estratégico de **ranuras sobrealimentadas**.

1. **Pre-solve basado en patrones:** comienza con una biblioteca curada de patrones de diseño probados a mano, optimizando para las bonificaciones de adyacencia máximas en diferentes tipos de cuadrícula.
2. **Colocación guiada por IA (inferencia ML):** si una configuración viable incluye ranuras sobrealimentadas, la herramienta invoca un modelo TensorFlow entrenado en más de 16,000 cuadrículas para predecir una ubicación óptima.
3. **Recocido simulado (refinamiento):** refina el diseño mediante búsquedas estocásticas sobre módulos y cambios de posición para aumentar la puntuación de adyacencia mientras evita los óptimos locales.
4. **Presentación de resultados:** encuentra la configuración de mayor puntuación, incluyendo desgloses de puntuación y recomendaciones visuales de diseño para naves, corbetas, multiherramientas, exocrafts y exotrajes.

## Características clave

- **Optimización integral de la cuadrícula:** soporte completo para cuadrículas estándar, ranuras sobrealimentadas e espacios inactivos para encontrar el verdadero diseño óptimo.
- **Utilización estratégica de las ranuras sobrealimentadas:** más allá de solo reconocer las ranuras sobrealimentadas, el optimizador determina de manera inteligente si colocar tecnologías centrales (por ejemplo, el arma principal) o sus mejores mejoras en estas ranuras de alto impacto, navegando las complejidades del diseño para maximizar objetivos específicos (daño, alcance, eficiencia, etc.).
- **Inferencia de aprendizaje automático:** entrenado en más de 16,000 diseños de cuadrícula históricos para identificar patrones efectivos.
- **Recocido simulado avanzado:** refinamiento meticuloso para exprimir cada punto porcentual de rendimiento.

## ¿Por qué usar esta herramienta?

Deja de adivinar la ubicación de tus tecnologías y desbloquea el verdadero potencial de tu equipo. Ya sea que busques una construcción de daño para naves, una poderosa construcción para corbeta, el alcance de escaneo definitivo con una multiherramienta optimizada, una exocraft altamente especializada o un exotraje sólido, o si intentas encontrar la mejor manera de usar unas pocas ranuras sobrealimentadas, esta herramienta te ofrece una forma clara y eficiente de planificar tus actualizaciones con confianza y lograr un rendimiento de primer nivel sin horas de prueba y error manual.

## Pila tecnológica

**Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
**Solucionador de backend:** Python, Flask, TensorFlow, NumPy, implementación de recocido simulado personalizada y puntuación heurística
**Pruebas:** Vitest, Python unittest
**Implementación:** Heroku (hosting) y Cloudflare (DNS y CDN)
**Automatización:** GitHub Actions (CI/CD)
**Análisis:** Google Analytics

## Repositorios

- UI web: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Alguna historia divertida

Aquí hay un vistazo a una versión temprana de la interfaz de usuario: funcionalmente sólida pero visualmente mínima. La versión actual es una actualización importante en diseño, usabilidad y claridad, que ayuda a los jugadores a encontrar rápidamente el mejor diseño para cualquier nave o herramienta.

![Prototipo temprano de la interfaz de usuario del Optimizer de No Man's Sky](/src/assets/img/screenshots/screenshot_v03.png)
