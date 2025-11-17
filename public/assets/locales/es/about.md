## ¿Qué es el optimizador NMS?

NMS Optimizer es una poderosa **calculadora**, **planificadora** y **constructora** basada en web para el juego No Man's Sky. Ayuda a los jugadores a diseñar diseños óptimos para su equipo al descubrir la mejor disposición de los módulos. Esta herramienta admite **diseños de naves espaciales**, **diseños de cargueros**, **diseños de corbetas**, **diseños de multiherramientas**, **diseños de exocraft** y **diseños de exotrajes**. Calcula automáticamente la **ubicación del módulo** ideal para maximizar mecánicas cruciales en el juego como **bonos de adyacencia** (al agrupar tecnologías similares) y los poderosos impulsos de **ranuras supercargadas**. Comprender cómo utilizar mejor estas funciones es clave para lograr el máximo rendimiento, y esta herramienta simplifica ese complejo proceso.

## Cómo funciona

> ¿Cómo se resuelve un problema con hasta ~8,32 × 10⁸¹ permutaciones posibles (¡es decir, 82 dígitos!) en menos de cinco segundos?

Descubrir la mejor **ubicación del módulo** con tantas permutaciones de diseño posibles para una cuadrícula completa no es tarea fácil. Esta herramienta combina patrones deterministas, aprendizaje automático y recocido simulado basado en Rust para ofrecer **construcciones de naves estelares**, **construcciones de cargueros**, **construcciones de Corvette**, **diseños de multiherramientas**, **construcciones de Exocraft** y **diseños de exotrajes** de primer nivel en aproximadamente cinco segundos. Considera todos los factores, incluidos **bonos de adyacencia** y el uso estratégico de **ranuras supercargadas**.

1. **Resolución previa basada en patrones:** Comienza con una biblioteca seleccionada de patrones de diseño probados manualmente, optimizados para obtener bonificaciones de adyacencia máximas en diferentes tipos de cuadrículas.
2. **Colocación guiada por IA (inferencia ML):** Si una configuración viable incluye ranuras supercargadas, la herramienta invoca un modelo de TensorFlow entrenado en más de 16 000 cuadrículas para predecir la ubicación óptima.
3. **Recocido simulado (refinamiento):** Refina el diseño mediante búsqueda estocástica: intercambia módulos y cambia de posiciones para aumentar la puntuación de adyacencia y evitar los óptimos locales.
4. **Presentación de resultados:** Genera la configuración con la puntuación más alta, incluidos desgloses de puntuación y recomendaciones de diseño visual para naves espaciales, cargueros, corbetas, herramientas múltiples, exocraft y exosuits.

## Características clave

- **Optimización integral de la red:** Soporte completo para ranuras estándar, **sobrealimentadas** e inactivas para encontrar el verdadero diseño óptimo.
- **Utilización estratégica de las ranuras supercargadas:** Más allá de simplemente reconocer las ranuras supercargadas, el optimizador determina de manera inteligente si colocar tecnologías centrales (como un arma principal) o sus mejores mejoras en estas ranuras de alto impulso, navegando por las complejas compensaciones para maximizar sus objetivos de construcción específicos (por ejemplo, daño, alcance o eficiencia). Esto refleja las estrategias de los jugadores expertos pero con precisión computacional.
- **Inferencia de aprendizaje automático:** Capacitado en más de 16 000 diseños de cuadrículas históricos para identificar patrones poderosos.
- **Recocido simulado avanzado:** Para un refinamiento meticuloso del diseño que garantiza que se exprima cada punto porcentual de rendimiento.

## ¿Por qué utilizar esta herramienta?

¡Deja de adivinar la ubicación de la tecnología y desbloquea el verdadero potencial de tu equipo! Ya sea que esté buscando una **construcción de nave estelar** de daño máximo, una **construcción de carguero** de largo alcance, una poderosa **construcción de Corvette**, el rango de escaneo definitivo con un perfecto **diseño de multiherramienta**, una **Exocraft** optimizada o un **Exotraje** robusto, este optimizador desmitifica las complejas reglas de las **bonificaciones de adyacencia** y las interacciones de **ranuras supercargadas**. Proporciona una manera clara y eficiente de planificar sus actualizaciones con confianza y lograr un rendimiento de primer nivel sin horas de prueba y error manual. Si alguna vez se ha preguntado cuál es la mejor manera de utilizar sus ranuras supercargadas limitadas, esta **calculadora NMS** tiene la respuesta.

## Pila de tecnología

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solver:** Implementaciones personalizadas de puntuación heurística y recocido simulado basadas en Python, Flask, TensorFlow, NumPy y Rust.
- **Pruebas:** Vitest, prueba unitaria de Python
- **Implementación:** Heroku (Hosting), Cloudflare (DNS y CDN), Docker
- **Automatización:** Acciones de GitHub (CI/CD)
- **Análisis:** Google Analytics

## Repositorios

- Interfaz de usuario web: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Servidor: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Un poco de historia divertida

He aquí un vistazo a una **primera versión** de la interfaz de usuario: funcionalmente sólida pero visualmente mínima. La versión actual es una mejora importante en diseño, usabilidad y claridad, que ayuda a los jugadores a encontrar rápidamente el **mejor diseño** para cualquier barco o herramienta.

![Prototipo inicial de la interfaz de usuario del optimizador de diseño de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)