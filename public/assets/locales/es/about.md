# Cómo Funciona el Optimizador de NMS

## ¿Qué Es Esto?

El Optimizador de NMS es una herramienta gratuita que descubre dónde colocar tus módulos de tecnología en No Man's Sky. Eliges tu equipo, seleccionas tus tecnologías, marcas tus ranuras potenciadas y la herramienta calcula el diseño que obtiene la mayor puntuación.

Funciona para naves espaciales (estándar, centinela, solar, luchadora, orgánica, atlante), corbetas, multiherramientas, exotrajes, todos los tipos de exonaves y cargueros.

La herramienta gestiona automáticamente las bonificaciones de adyacencia y la ubicación de las ranuras potenciadas. En la práctica, un diseño optimizado suele puntuar entre un 15 y un 20 % más que lo que la mayoría de los jugadores organizan a mano.

## El Problema

No Man's Sky no explica bien las bonificaciones de adyacencia y no explica en absoluto la estrategia de las ranuras potenciadas. Los módulos del mismo tipo obtienen un aumento de estadísticas cuando comparten un borde en la cuadrícula. Las ranuras potenciadas dan un multiplicador de aproximadamente un 25-30 % a cualquier cosa que pongas en ellas. Descubrir la mejor disposición significa hacer malabarismos con ambos sistemas a la vez, a través de cuadrículas con millones de permutaciones posibles (~8,32 × 10⁸¹ para un diseño completo).

Nadie puede resolver eso a mano.

## Cómo Lo Resuelve el Optimizador

El optimizador se ejecuta en cuatro pasos:

1. **Coincidencia de Patrones**: Comienza con disposiciones probadas a mano que puntúan bien de forma fiable para conjuntos de módulos comunes.
2. **Predicción por ML**: Si tu cuadrícula tiene ranuras potenciadas, un modelo de TensorFlow entrenado con más de 16.000 diseños de alta puntuación predice dónde colocar las tecnologías principales frente a las mejoras.
3. **Recocido Simulado**: Un optimizador basado en Rust intercambia módulos y prueba miles de disposiciones en milisegundos, buscando la puntuación más alta posible.
4. **Visualización de Resultados**: Verás el diseño con la puntuación más alta con un desglose completo del multiplicador de adyacencia.

Cada paso alimenta al siguiente. El modelo de ML le da al recocido simulado un punto de partida sólido, y el recocido se encarga de refinar a partir de ahí.

## Qué Tiene en Cuenta el Optimizador

- Ranuras estándar, potenciadas e inactivas.
- Si una tecnología principal o su mejor mejora debe ir en cada ranura potenciada.
- Compensaciones entre estadísticas que compiten (maniobrabilidad frente a velocidad, daño frente a cadencia de tiro).
- Pesos de estadísticas específicos de cada módulo y reglas de compañeros de adyacencia.

## Pila Tecnológica

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI.
- **Servicio de Optimización:** Python, Flask, TensorFlow, NumPy, Rust (recocido simulado y puntuación).
- **Pruebas:** Vitest, Python Unittest.
- **Despliegue:** Heroku (alojamiento), Cloudflare (Hosting/DNS/CDN), Docker.
- **CI/CD:** GitHub Actions.

## Repositorios

- Interfaz web: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Preguntas Frecuentes (FAQ)

### ¿Qué es una bonificación de adyacencia?

Cuando colocas módulos de tecnología compatibles uno al lado del otro en la cuadrícula de inventario, obtienen un aumento de estadísticas. Diferentes tecnologías tienen diferentes compañeros de adyacencia: las mejoras de armas se bonifican entre sí, la tecnología de movimiento se bonifica con otra tecnología de movimiento, y así sucesivamente. El optimizador prueba todas las disposiciones posibles y elige aquella en la que las bonificaciones de adyacencia totales sean más altas.

### ¿Cómo funcionan las ranuras potenciadas?

Las ranuras potenciadas son ranuras de inventario raras (normalmente 4 por cuadrícula) que dan un impulso de aproximadamente el 25-30 % a cualquier módulo que se coloque en ellas. La parte difícil es decidir qué va allí. A veces es la tecnología principal, a veces es la mejora con mejores estadísticas. El modelo de ML del optimizador está entrenado específicamente para esta decisión, utilizando más de 16.000 diseños reales como datos de entrenamiento.

### ¿Qué tipos de equipo son compatibles?

Todos ellos:

- **Naves espaciales:** Estándar, Exótica, Centinela, Solar y Orgánica.
- **Corbetas:** Incluyendo módulos de reactor únicos y ranuras de tecnología cosmética.
- **Multiherramientas:** Todos los tipos, incluidos los Báculos.
- **Exonaves:** Todos los tipos de vehículos (Nomad, Colossus, Pilgrim, Roamer, Minotaur, Nautilon).
- **Exotrajes:** Todos los tipos de tecnología.
- **Cargueros:** Diseños de tecnología de naves capitales.

### ¿Es gratis?

Sí. Gratis, sin anuncios, de código abierto (GPL-3.0). Sin cuentas ni correos electrónicos.

### ¿Puedo guardar y compartir diseños?

Sí. Puedes guardar diseños como archivos `.nms`, generar enlaces compartibles o compartirlos directamente en redes sociales. Los diseños se validan para asegurar su integridad y compatibilidad con el equipo antes de compartirlos.

## Gracias

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray y todos los demás que han contribuido: vuestro apoyo lo significa todo. Cada donación, cada vez que compartís la herramienta y cada palabra de aliento me ayuda a seguir construyendo. Gracias.

## Versión Antigua

Así es como se veía la interfaz en una versión temprana: funcionaba, pero el diseño era mínimo. La versión actual es una gran mejora en diseño, usabilidad y claridad.
![Prototipo inicial de la interfaz de usuario del optimizador de diseños de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)
