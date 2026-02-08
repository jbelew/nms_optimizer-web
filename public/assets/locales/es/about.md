# Cómo funciona NMS Optimizer: optimización del diseño tecnológico impulsada por ML

## ¿Qué es el optimizador NMS?

NMS Optimizer es la mejor calculadora de diseño técnico gratuita basada en web para jugadores de No Man's Sky que desean encontrar la ubicación óptima de los módulos para su equipo. Esta herramienta le ayuda a diseñar y visualizar diseños ideales para:

- **Diseños tecnológicos de naves espaciales** y construcciones de naves espaciales
- **Diseños de cargueros** y colocación de tecnología de cargueros
- **Diseños de tecnología Corvette** y construcciones de Corvette
- **Diseños multiherramienta** y compilaciones multiherramienta
- **Diseños de Exocraft** y construcciones de exocraft.
- **Diseños de exotraje** y colocación de tecnología de exotraje

La herramienta maneja los cálculos automáticamente, teniendo en cuenta **bonos de adyacencia** (el aumento de rendimiento que se obtiene al colocar tecnologías compatibles una al lado de la otra en la cuadrícula de tu inventario) y **espacios supercargados** (los raros espacios de alto valor que dan aumentos de ~25-30%). Calcula y encuentra la disposición que le brinda la puntuación más alta posible para su construcción.

## ¿Cómo funciona?

El problema es matemáticamente enorme: ~8,32 × 10⁸¹ posibles permutaciones (82 dígitos de longitud). Lo solucionamos mediante reconocimiento de patrones, aprendizaje automático y optimización. La herramienta funciona en cuatro pasos:

1. **Compruebe los patrones seleccionados:** Comience con patrones probados manualmente que brinden sólidas bonificaciones de adyacencia
2. **Predecir con ML:** Si su configuración incluye ranuras supercargadas, un modelo de TensorFlow, entrenado en más de 16 000 redes del mundo real, predice la mejor ubicación para las tecnologías centrales.
3. **Refinar con recocido simulado:** Un optimizador basado en Rust intercambia módulos y cambia de posición para alcanzar la mejor puntuación posible
4. **Mostrarle el resultado:** La herramienta muestra su configuración de puntuación más alta con desgloses de puntuación.

## Qué puede hacer

- **Administra todos los tipos de ranuras:** Ranuras estándar, sobrealimentadas e inactivas
- **Comprende las ranuras supercargadas:** El optimizador decide si una tecnología central o su mejor actualización debe incluirse en estas ranuras de alto valor. Navega por las compensaciones para maximizar su objetivo
- **Utiliza patrones de aprendizaje automático:** Capacitado en más de 16 000 diseños reales para identificar arreglos de alto rendimiento
- **Refina a la perfección:** El recocido simulado extrae cada punto porcentual de rendimiento posible

## ¿Por qué usarlo?

Evite las interminables pruebas y errores. Obtenga el diseño matemáticamente óptimo para su Starship de máximo daño, su carguero de mayor alcance, su potente Corvette o su robusto Exosuit. La herramienta explica los bonos de adyacencia y las tragamonedas sobrecargadas en lugar de dejarte adivinando. Si alguna vez te has preguntado cómo aprovechar mejor tus limitadas ranuras supercargadas, esto te da la respuesta.

## ¿Por qué elegir el optimizador NMS en lugar de la planificación manual?

**El problema:** Los equipos de No Man's Sky pueden tener millones de disposiciones tecnológicas posibles, y encontrar el diseño óptimo mediante prueba y error lleva horas.

**La solución:** NMS Optimizer utiliza aprendizaje automático y algoritmos avanzados para:
- Encuentra tu mejor diseño tecnológico en segundos
- Maximizar las bonificaciones de adyacencia automáticamente
- Optimice la ubicación de la ranura sobrealimentada
- Mostrarte el desglose exacto de la puntuación.
- Trabajo para todo tipo de equipos (naves espaciales, corbetas, multiherramientas, exotrajes, exocraft, cargueros)
- Actualiza en tiempo real a medida que ajustas tus selecciones de tecnología

En lugar de adivinar, obtienes siempre la disposición matemáticamente óptima.

## Pila de tecnología

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solver:** Python, Flask, TensorFlow, NumPy, recocido y puntuación simulados basados en Rust
- **Pruebas:** Vitest, prueba unitaria de Python
- **Implementación:** Heroku (Hosting), Cloudflare (DNS y CDN), Docker
- **Automatización:** Acciones de GitHub (CI/CD)
- **Análisis:** Google Analytics

## Repositorios

- Interfaz de usuario web: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Servidor: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Preguntas frecuentes

### P: ¿Qué es un bono de adyacencia?

R: Una **bonificación de adyacencia** en No Man's Sky es el aumento de rendimiento que recibes al colocar módulos de tecnología compatibles uno al lado del otro en tu cuadrícula de inventario. Las diferentes tecnologías tienen diferentes socios de adyacencia; por ejemplo, las mejoras de armas a menudo otorgan bonificaciones cuando se colocan cerca unas de otras. NMS Optimizer analiza las tecnologías seleccionadas y encuentra la disposición que maximiza todas las bonificaciones de adyacencia en toda su red, lo que garantiza que obtenga los mejores multiplicadores de rendimiento posibles.

### P: ¿Cómo funcionan las ranuras supercargadas?

R: **Las ranuras supercargadas** son ranuras de inventario raras y de alto valor (normalmente 4 por cuadrícula) que proporcionan un aumento de ~25 a 30 % a cualquier cosa que se coloque en ellas. Son uno de los bienes inmuebles más valiosos de su red. El desafío es decidir qué tecnologías deberían incluirse en estos espacios limitados. El optimizador utiliza aprendizaje automático entrenado en más de 16 000 diseños reales para decidir si colocar una tecnología central o su mejor actualización en cada ranura supercargada, maximizando su rendimiento general.

### P: ¿Cómo funciona el optimizador de ubicación de tecnología NMS?

R: NMS Optimizer utiliza tres métodos que funcionan juntos:
1. **Coincidencia de patrones**: comienza con patrones de diseño de tecnología comprobada y probados manualmente que ofrecen sólidas bonificaciones de adyacencia.
2. **Predicción de aprendizaje automático**: una red neuronal TensorFlow entrenada en más de 16 000 redes del mundo real predice la mejor ubicación para sus tecnologías principales
3. **Refinamiento del recocido simulado**: un optimizador basado en Rust afina el diseño probando miles de intercambios de posiciones para alcanzar la mejor puntuación posible.

Este enfoque de tres capas resuelve lo que de otro modo sería un problema increíblemente complejo (~8,32 × 10⁸¹ permutaciones).

### P: ¿Qué equipo de No Man's Sky admite el optimizador?

R: El Optimizador NMS es compatible con todos los principales equipos de No Man's Sky:

- **Naves estelares:** variantes estándar, exótica, centinela, solar, viva y MT (enfocada en múltiples herramientas)
- **Corbetas:** Incluye módulos de reactor únicos y ranuras para tecnología cosmética.
- **Multiherramientas:** Todos los tipos, incluidas duelas
- **Exocraft:** Todos los tipos de vehículos (Nomad, Pilgrim, Roamer, Minotaur, Nautilon)
- **Exotrajes:** Todo tipo de tecnología
- **Cargueros:** Diseños de tecnología de naves capitales

### P: ¿Qué tan preciso es el optimizador?

R: Muy preciso. NMS Optimizer combina patrones de diseño probados manualmente, aprendizaje automático entrenado en más de 16 000 cuadrículas del mundo real y un algoritmo de recocido simulado basado en Rust para encontrar el diseño tecnológico matemáticamente óptimo para su configuración exacta. Tiene en cuenta todas las bonificaciones de adyacencia, las compensaciones de las ranuras supercargadas y las ranuras inactivas para maximizar el rendimiento de su configuración.

### P: ¿Puedo encontrar el mejor diseño de nave estelar, diseño de corbeta o diseño de exotraje con esta herramienta?

R: Sí. El Optimizador NMS encuentra el **mejor diseño tecnológico** para cualquier tipo de equipo:
- **Los mejores diseños de naves espaciales** teniendo en cuenta tus opciones de armas y tecnología de servicios públicos.
- **Mejores diseños de corbetas** Equilibrio de reactores y tecnologías de combate.
- **Los mejores diseños de exotrajes** que optimizan la tecnología de utilidad, defensa y movimiento.
- **Los mejores diseños de multiherramienta** para máximo daño o utilidad
- **Mejores diseños de carguero** para almacenamiento y servicios públicos

Simplemente seleccione su tipo de equipo, elija sus tecnologías, marque sus ranuras supercargadas y el optimizador calculará la disposición matemáticamente óptima.

### P: ¿El Optimizador NMS es gratuito?

R: Sí. NMS Optimizer es completamente gratuito, sin publicidad y de código abierto (licencia GPL-3.0). No se requiere registro ni pago. Toda la optimización ocurre instantáneamente en su navegador o en nuestros servidores sin costo alguno.

### P: ¿Puedo guardar y compartir mis compilaciones?

R: Sí. Puedes:
- **Guarde las compilaciones** como archivos `.nms` en su computadora y vuelva a cargarlas más tarde
- **Genere enlaces para compartir** para enviar su diseño tecnológico a amigos
- **Comparte tu compilación directamente** a través de las redes sociales o mensajes
Todas las compilaciones se validan en cuanto a integridad y compatibilidad de equipos antes de compartirlas.

## Gracias

George V, Diab, JayTee73, Boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrreally, Kevin Murray y todos los que han contribuido: su apoyo lo es todo. Cada donación, compartir y palabra amable me ayuda a seguir construyendo. Gracias.

## Versión temprana

Así es como se veía la interfaz de usuario en una de las primeras versiones: funcionó, pero el diseño era mínimo. La versión actual supone una mejora importante en diseño, usabilidad y claridad.

![Prototipo inicial de la interfaz de usuario del optimizador de diseño de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)