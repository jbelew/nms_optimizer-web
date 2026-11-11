# Acerca de NMS Optimizer: la calculadora definitiva de diseños de tecnología para No Man's Sky

**NMS Optimizer** es una herramienta 100 % gratuita y sin anuncios diseñada para calcular con exactitud dónde colocar tus módulos de tecnología en _No Man's Sky_. Eliges tu equipo, seleccionas tus módulos de mejora de clase S o clase X, marcas tus ranuras potenciadas y nuestra calculadora genera casi al instante la distribución que maximiza tus estadísticas dentro del juego.

Al equilibrar con precisión las mecánicas del juego, un diseño optimizado suele obtener una puntuación entre un **15 y un 20 % superior** a la que la mayoría de los jugadores logran organizar a mano.

## El problema: maximizar las bonificaciones por adyacencia y las ranuras potenciadas

_No Man's Sky_ no explica de forma explícita las bonificaciones por adyacencia ni ofrece indicaciones sobre cómo aprovechar las ranuras potenciadas. Maximizar la maniobrabilidad de tu nave o el daño de tu multiherramienta exige combinar dos sistemas complejos:

- **Bonificaciones por adyacencia:** Cuando colocas módulos de tecnología compatibles juntos en la cuadrícula de inventario, reciben un aumento de estadísticas. Cada tecnología tiene sus propios compañeros de adyacencia: las mejoras de armas se potencian entre sí, las tecnologías de movimiento potencian otras tecnologías de movimiento y, cuantos más bordes compartidos crees, mayor será la bonificación acumulada.
- **Ranuras potenciadas:** Estas escasas ranuras de inventario (normalmente hasta 4 por cuadrícula) otorgan un enorme multiplicador de ~25-30 % a las estadísticas de cualquier módulo que coloques en ellas.

Encontrar la mejor disposición posible requiere probar combinaciones entre millones de permutaciones —hasta aproximadamente 8,32 × 10⁸¹ en una cuadrícula ampliada al máximo—. Nadie puede resolver eso a mano.

## Cómo funciona el motor de optimización de diseños

No nos basamos en conjeturas. El motor de NMS Optimizer utiliza un proceso de cuatro fases para encontrar automáticamente tu mejor diseño:

1. **Reconocimiento de patrones:** El motor de cálculo parte de disposiciones probadas a mano y validadas por la comunidad que obtienen puntuaciones altas de forma fiable en los conjuntos de módulos más habituales.
2. **Aprendizaje automático (IA):** Si tu cuadrícula tiene ranuras potenciadas en posiciones concretas, un modelo de aprendizaje automático en TensorFlow —entrenado con más de 16 000 diseños de alta puntuación— predice las ubicaciones más inteligentes para tus tecnologías principales frente a tus módulos de mejora.
3. **Recocido simulado:** Nuestro motor principal de optimización, programado en Rust, intercambia módulos con rapidez y evalúa miles de combinaciones en milisegundos hasta alcanzar la puntuación más alta posible.
4. **Visualización de resultados:** Al instante ves la distribución ganadora junto con el desglose completo de multiplicadores por adyacencia.

## Equipos compatibles

NMS Optimizer ofrece cálculo dinámico para todas las plataformas principales del juego:

- **Naves:** Naves estándar, exóticas, interceptores centinela, solares, cazas y vivientes.
- **Multiherramientas:** Todas las variantes de armas y extracción, incluidos los bastones.
- **Exotrajes y exonaves:** Todas las tecnologías de exotraje y todos los tipos de vehículos (Nómada, Coloso, Peregrino, Vagabundo, Minotauro y Nautilo).
- **Cargueros:** Tecnología de hiperturbo de naves capitales y coordinación de flota.
- **Corbetas:** Compatibilidad con cuadrículas complejas, incluidos módulos de reactor únicos y ranuras de tecnología cosmética.

## Preguntas frecuentes (FAQ)

**¿Qué debo colocar en mis ranuras potenciadas?**
¡Depende de tu cuadrícula! A veces conviene potenciar la tecnología principal y otras veces resulta mejor potenciar el módulo de mejora con mejores estadísticas. Nuestro modelo de IA se entrenó con más de 16 000 diseños reales específicamente para tomar esta decisión por ti.

**¿Es gratuito NMS Optimizer?**
Sí. Es 100 % gratuito, sin anuncios y de código abierto (GPL-3.0). No necesitas crear una cuenta ni facilitar un correo electrónico.

**¿Puedo guardar y compartir mis diseños?**
¡Sí! Puedes guardar tus diseños favoritos localmente como archivos `.nms`, generar enlaces para enviarlos a tus amigos o compartir capturas de pantalla de alta calidad en redes sociales. La integridad de los diseños se valida antes de compartirlos.

**¿Por qué la herramienta no muestra las estadísticas exactas del juego?**
La herramienta evita de forma deliberada calcular métricas internas como el DPS exacto o el alcance en años luz. Como las cifras exactas dependen de semillas ocultas de cada nave a las que no se puede acceder sin un editor de partidas guardadas, el optimizador utiliza en su lugar una puntuación de «porcentaje respecto al máximo».

**¿Por qué el diseño optimizado no incluye mi módulo concreto de expedición?**
NMS Optimizer es totalmente compatible con todas las **recompensas de expedición y expediciones Redux** publicadas tras la actualización _Worlds Part I_. Sin embargo, como no todos los jugadores cuentan con estos objetos poco comunes, estos módulos opcionales no se activan por defecto en los cálculos. Puedes activarlos fácilmente para tu diseño abriendo la <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> **interfaz de Selección de módulos**.

## Bajo el capó: nuestra pila tecnológica

Para desarrolladores y entusiastas de los datos, esta es la pila tecnológica que impulsa NMS Optimizer:

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Motor de cálculo (backend):** Python, Flask, TensorFlow, NumPy, Rust (impulsa el recocido simulado y el motor de puntuación)
- **Pruebas:** Vitest, Python Unittest
- **Despliegue y alojamiento:** Heroku (alojamiento de la API), Cloudflare (DNS/CDN), Docker
- **CI/CD:** GitHub Actions

### Repositorios de código abierto

¿Quieres colaborar? NMS Optimizer es íntegramente de código abierto.

- Interfaz web: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Un enorme agradecimiento a la comunidad

Este proyecto no sería posible sin la increíble comunidad de _No Man's Sky_. Un agradecimiento muy especial a **George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, jayriley, arratikbehavior, Someone, Cal Abunga** y a todas las demás personas que han contribuido. Tu apoyo, tus donaciones, las veces que compartes la herramienta y tus amables palabras lo significan todo y ayudan a mantener vivo este proyecto.

## Mirando atrás: primeras versiones

![Prototipo inicial de la interfaz de usuario del optimizador de diseños de No Man's Sky](/assets/img/screenshots/screenshot_v03.webp)
Si estuviste con nosotros desde el principio, quizá recuerdes cómo era la interfaz en sus primeras fases alfa. Funcionaba, pero su aspecto era mínimo. La versión actual supone una mejora constante y profunda en diseño, usabilidad móvil y claridad general.
