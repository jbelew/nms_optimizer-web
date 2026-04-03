# Cómo funciona el optimizador NMS

## ¿Qué es esto?

NMS Optimizer es una herramienta gratuita que descubre dónde colocar sus módulos tecnológicos en No Man's Sky. Usted elige su equipo, selecciona sus tecnologías, marca sus ranuras supercargadas y calcula el diseño que obtiene la puntuación más alta.

Funciona para naves espaciales (estándar, centinela, solar, de combate, viviente, atlántida), corbetas, multiherramientas, exotrajes, todo tipo de exocraft y cargueros.

La herramienta maneja automáticamente las bonificaciones de adyacencia y la colocación de ranuras supercargadas. En la práctica, un diseño optimizado suele obtener una puntuación entre un 15 y un 20 % mayor que lo que la mayoría de los jugadores organizan a mano.

## El problema

No Man's Sky no explica bien las bonificaciones de adyacencia y no explica en absoluto la estrategia de tragamonedas sobrealimentada. Los módulos del mismo tipo obtienen un aumento de estadísticas cuando comparten una ventaja en la cuadrícula. Las tragamonedas sobrealimentadas dan un multiplicador de ~25-30% a lo que pongas en ellas. Descubrir la mejor disposición significa hacer malabarismos con ambos sistemas a la vez, en cuadrículas con millones de permutaciones posibles (~8,32 × 10⁸¹ para un diseño completo).

Nadie está resolviendo eso a mano.

## Cómo lo resuelve el optimizador

El optimizador se ejecuta en cuatro pasos:

1. **Coincidencia de patrones**: comienza con arreglos probados manualmente que obtienen buenos resultados de manera confiable para conjuntos de módulos comunes
2. **Predicción de aprendizaje automático**: si su red tiene ranuras sobrecargadas, un modelo de TensorFlow entrenado en más de 16 000 diseños de alta puntuación predice dónde colocar las tecnologías centrales frente a las actualizaciones.
3. **Recocido simulado**: un optimizador basado en Rust intercambia módulos y prueba miles de disposiciones en milisegundos, ascendiendo hacia la puntuación más alta posible.
4. **Visualización de resultados**: verá el diseño de puntuación más alta con un desglose completo del multiplicador de adyacencia.

Cada paso alimenta al siguiente. El modelo ML proporciona al recocido simulado un sólido punto de partida y el recocido se perfecciona a partir de ahí.

## Para qué sirve el optimizador

- Ranuras estándar, sobrealimentadas e inactivas
- Si una tecnología central o su mejor actualización pertenece a cada ranura sobrealimentada
- Compensaciones entre estadísticas competitivas (maniobrabilidad versus velocidad, daño versus cadencia de fuego)
- Pesos de estadísticas específicos del módulo y reglas de socios de adyacencia

## Pila de tecnología

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Solucionador de backend:** Python, Flask, TensorFlow, NumPy, Rust (recocido y puntuación simulados)
- **Pruebas:** Vitest, prueba unitaria de Python
- **Implementación:** Heroku (alojamiento), Cloudflare (DNS/CDN), Docker
- **CI/CD:** Acciones de GitHub

## Repositorios

- Interfaz de usuario web: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Servidor: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Preguntas frecuentes

### ¿Qué es un bono de adyacencia?

Cuando colocas módulos de tecnología compatibles uno al lado del otro en la cuadrícula del inventario, obtienen un aumento de estadísticas. Las diferentes tecnologías tienen diferentes socios de adyacencia: las mejoras de armas se bonifican entre sí, las tecnologías de movimiento se bonifican con otras tecnologías de movimiento, etc. El optimizador prueba todos los arreglos posibles y elige aquel en el que las bonificaciones totales de adyacencia son mayores.

### ¿Cómo funcionan las tragamonedas supercargadas?

Las ranuras sobrealimentadas son ranuras de inventario poco comunes (normalmente 4 por cuadrícula) que dan un impulso de ~25-30% a cualquier módulo que se encuentre en ellas. La parte complicada es decidir qué va allí. A veces es la tecnología central, a veces es la actualización de estadísticas más altas. El modelo ML del optimizador se entrena específicamente en esta decisión, utilizando más de 16.000 diseños reales como datos de entrenamiento.

### ¿Qué tipos de equipos son compatibles?

Todos:

- **Starships**: variantes estándar, exótica, centinela, solar, viva y atlántida.
- **Corvettes**: incluidos reactores y espacios para tecnología cosmética
- **Multiherramientas**: todos los tipos, incluidas las duelas
- **Exocraft**: nómada, peregrino, vagabundo, coloso, minotauro, nautilon
- **Exotrajes**: todas las categorías de tecnología
- **Cargueros**: diseños tecnológicos de naves capitales

### ¿Es gratis?

Sí. Gratis, sin publicidad y de código abierto (GPL-3.0). No se requiere cuenta.

### ¿Puedo guardar y compartir compilaciones?

Sí. Puede guardar compilaciones como archivos `.nms`, generar enlaces para compartir o compartir directamente en las redes sociales. Las compilaciones se validan en cuanto a integridad y compatibilidad de equipos antes de compartirlas.

## Gracias

George V, Diab, JayTee73, Boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrreally, Kevin Murray y todos los que han contribuido: su apoyo lo es todo. Cada donación, compartir y palabra amable me ayuda a seguir construyendo. Gracias.

## Versión temprana

Así es como se veía la interfaz de usuario en una de las primeras versiones: funcionó, pero el diseño era mínimo. La versión actual supone una mejora importante en diseño, usabilidad y claridad.
![Prototipo inicial de la interfaz de usuario del optimizador de diseño de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)