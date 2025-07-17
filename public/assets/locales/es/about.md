## Resumen

Esta aplicación web proporciona una interfaz interactiva para optimizar los diseños de tecnología en el juego _No Man's Sky_, específicamente para naves estelares, multiherramientas y cargueros. La herramienta se centra en identificar los **mejores diseños de tecnología** maximizando las bonificaciones de adyacencia y aprovechando las ranuras sobrecargadas, estrategias centrales para lograr el **mejor diseño de nave estelar**, el **mejor diseño de multiherramienta** o el **mejor diseño de carguero**.

## Cómo funciona

> ¿Cómo se resuelve un problema con 479 millones de posibles permutaciones en menos de 5 segundos?

El proceso de optimización combina patrones deterministas con algoritmos adaptativos adaptados a las cuadrículas de módulos de tecnología de No Man's Sky:

1. **Pre-solución basada en patrones:** Comienza con una biblioteca curada de patrones de diseño probados a mano, optimizando para obtener la máxima bonificación de adyacencia en diferentes tipos de cuadrícula.
2. **Colocación guiada por IA (Inferencia ML):** Si una configuración viable incluye ranuras sobrecargadas, la herramienta invoca un modelo de TensorFlow entrenado en más de 16,000 cuadrículas para predecir la ubicación óptima.
3. **Recocido simulado (Refinamiento):** Refina el diseño a través de la búsqueda estocástica: intercambiando módulos y cambiando posiciones para aumentar la puntuación de adyacencia mientras evita los óptimos locales.
4. **Presentación de resultados:** Genera la configuración de mayor puntuación, incluyendo desgloses de puntuación y recomendaciones de diseño visual para naves estelares, multiherramientas y cargueros.

## Características

- **Resolución consciente de la cuadrícula:** Tiene en cuenta las ranuras sobrecargadas e inactivas al determinar la **mejor configuración de diseño**.
- **Inferencia de ML de TensorFlow:** Predice la ubicación óptima de la tecnología basándose en datos históricos de la cuadrícula.
- **Recocido simulado:** Mejora la calidad del diseño explorando cambios de configuración e intercambios basados en la adyacencia.

## Pila tecnológica

**Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI  
**Backend Solver:** Python, Flask, TensorFlow, NumPy, implementación personalizada de recocido simulado y puntuación heurística  
**Pruebas:** Vitest, Python Unittest  
**Implementación:** Heroku (Alojamiento) y Cloudflare (DNS y CDN)  
**Automatización:** GitHub Actions (CI/CD)  
**Análisis:** Google Analytics

## Repositorios

- Interfaz de usuario web: [nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Algo de historia divertida

Aquí hay un vistazo a una **versión temprana** de la interfaz de usuario, funcionalmente sólida pero visualmente mínima. La versión actual es una mejora importante en diseño, usabilidad y claridad, lo que ayuda a los jugadores a encontrar rápidamente el **mejor diseño** para cualquier nave o herramienta.

![Prototipo temprano de la interfaz de usuario del optimizador de diseño de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)
