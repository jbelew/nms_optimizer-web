# Acerca del NMS Optimizer: La Calculadora Definitiva de Diseños de Tecnología para No Man's Sky

**NMS Optimizer** es una herramienta 100% gratuita y sin anuncios diseñada para descifrar exactamente dónde colocar tus módulos de tecnología en _No Man's Sky_. Tú eliges tu equipo, seleccionas tus módulos de actualización de Clase S o Clase X, marcas tus ranuras potenciadas (Supercharged Slots) y nuestra calculadora genera casi al instante el diseño que maximiza tus estadísticas dentro del juego.

Al equilibrar perfectamente las mecánicas del juego, un diseño optimizado normalmente obtiene una puntuación **15-20% mayor** que lo que la mayoría de los jugadores pueden organizar a mano.

## El Problema: Maximizar las Bonificaciones de Adyacencia (Adjacency Bonuses) y las Ranuras Potenciadas

_No Man's Sky_ no explica explícitamente las bonificaciones de adyacencia y no ofrece ninguna guía sobre la estrategia de las ranuras potenciadas. Maximizar la maniobrabilidad de tu nave o el daño de tu multiherramienta significa hacer malabares con dos complejos sistemas:

- **Bonificaciones de Adyacencia:** Cuando colocas módulos de tecnología compatibles uno al lado del otro en la cuadrícula de inventario, obtienen un aumento de estadísticas. Diferentes tecnologías tienen diferentes compañeros de adyacencia: las actualizaciones de armas se potencian entre sí, la tecnología de movimiento potencia otra tecnología de movimiento, y cuantos más bordes compartidos crees, mayor será la bonificación acumulativa.
- **Ranuras Potenciadas:** Estas raras ranuras de inventario (normalmente hasta 4 por cuadrícula) otorgan un multiplicador masivo de ~25-30% a cualquier módulo que se coloque dentro de ellas.

Descubrir el mejor arreglo absoluto significa probar combinaciones a lo largo de millones de posibles permutaciones, hasta aproximadamente 8.32 × 10⁸¹ para una cuadrícula completamente expandida. Nadie está resolviendo eso a mano.

## Cómo Funciona el Motor de Optimización de Diseños

No dependemos de conjeturas. El motor del NMS Optimizer utiliza un sofisticado flujo de trabajo de cuatro pasos para encontrar automáticamente tu mejor construcción:

1.  **Reconocimiento de Patrones:** El solucionador comienza con arreglos probados a mano y comprobados por la comunidad que de manera confiable obtienen buenas puntuaciones para conjuntos de módulos comunes.
2.  **Aprendizaje Automático (IA):** Si tu cuadrícula tiene ranuras potenciadas únicas, un modelo de aprendizaje automático de TensorFlow, entrenado en más de 16,000 diseños de alta puntuación, predice las colocaciones más inteligentes para tus tecnologías principales frente a tus módulos de actualización.
3.  **Recocido Simulado (Simulated Annealing):** Nuestro motor principal de optimización, construido en Rust, intercambia módulos rápidamente y prueba miles de arreglos en milisegundos para escalar hacia la puntuación más alta absoluta posible.
4.  **Visualización de Resultados:** Inmediatamente ves el diseño ganador junto con un desglose completo de los multiplicadores de adyacencia.

## Equipos Compatibles

El NMS Optimizer proporciona resolución dinámica para cada plataforma principal del juego:

- **Naves (Starships):** Naves Estándar, Exóticas (Exotic), Interceptores Centinela (Sentinel Interceptor), Solares, de Combate (Fighter), Vivas (Living) y Atlantid.
- **Multiherramientas (Multi-Tools):** Todas las variantes de armas y minería, incluidos los Báculos (Staves).
- **Exotrajes (Exosuits) y Exovehículos (Exocraft):** Todas las tecnologías de Exotraje y tipos de vehículos (Nómada, Coloso, Peregrino, Roamer, Minotauro, Nautilon).
- **Cargueros (Freighters):** Tecnología de hiperimpulso y coordinación de la flota de naves capitales.
- **Corbetas (Corvettes):** Soporte para diseños complejos, incluyendo módulos reactores únicos y ranuras de tecnología cosmética.

## Preguntas Frecuentes (FAQ)

**¿Qué debería poner en mis ranuras potenciadas?**
¡Depende de tu diseño! A veces es mejor potenciar tu tecnología principal y otras veces es mejor potenciar tu actualización con los números más altos. Nuestro modelo de IA fue entrenado en más de 16,000 diseños reales específicamente para tomar esta decisión por ti.

**¿Es gratuito el NMS Optimizer?**
Sí. Es 100% gratuito, sin anuncios y de código abierto (GPL-3.0). No necesitas crear una cuenta ni proporcionar un correo electrónico.

**¿Puedo guardar y compartir mis diseños?**
¡Sí! Puedes guardar tus construcciones favoritas localmente como archivos `.nms`, generar enlaces para enviar a amigos o compartir capturas de pantalla de diseños de alta calidad directamente en redes sociales. La integridad de las construcciones es validada antes de compartir.

**¿Por qué la herramienta no muestra las estadísticas dentro del juego?**
La herramienta evita intencionalmente calcular métricas estándar dentro del juego como DPS o Rango en Años Luz. Debido a que los números exactos requieren semillas de nave ocultas que son inaccesibles sin un editor de guardado, el optimizador confía en un puntaje de "porcentaje del máximo" en su lugar.

**¿Por qué el diseño optimizado no incluye mi módulo específico de Expedición?**
El NMS Optimizer apoya completamente todas las **Recompensas de Expedición y Redux de Expedición** ofrecidas tras la actualización _Worlds Part I_. Sin embargo, debido a que no todos los jugadores poseen estos artículos raros, estos módulos opcionales no se incluyen por defecto en tus soluciones. Puedes activarlos fácilmente para tu construcción abriendo la <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> **interfaz de Selección de Módulos**.

## Bajo el Capó: Nuestra Pila Tecnológica

Para los desarrolladores y fanáticos de los datos, aquí está la tecnología que impulsa el NMS Optimizer:

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solucionador:** Python, Flask, TensorFlow, NumPy, Rust (impulsa el recocido simulado y el motor de puntuación)
- **Pruebas:** Vitest, Python Unittest
- **Despliegue y Alojamiento:** Heroku (alojamiento de API), Cloudflare (DNS/CDN), Docker
- **CI/CD:** GitHub Actions

### Repositorios de Código Abierto

¿Quieres contribuir? El NMS Optimizer es completamente de código abierto.

- Interfaz Web: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Un Enorme Agradecimiento a la Comunidad

Este proyecto no sería posible sin la increíble comunidad de _No Man's Sky_. Un agradecimiento especial a George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray y todos los demás que han contribuido. Su apoyo, donaciones, compartidos y palabras amables significan todo y ayudan a mantener vivo este proyecto.

## Mirando Atrás: Primeras Versiones

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
Si estuviste con nosotros desde el principio, podrías recordar cómo lucía la interfaz de usuario en sus primeras fases alfa. Funcionaba, pero el diseño era mínimo. La versión actual representa una mejora importante y continua en diseño, usabilidad móvil y claridad general.
