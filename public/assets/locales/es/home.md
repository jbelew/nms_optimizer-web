# Optimizador de NMS: Calculadora de bonificación de adyacencia y diseño tecnológico para No Man's Sky

![Captura de pantalla de la aplicación NMS Optimizer que muestra una cuadrícula de tecnología de nave espacial con ubicación optimizada del módulo](/assets/img/screenshots/screenshot.png)

NMS Optimizer descubre dónde colocar sus módulos tecnológicos para que usted no tenga que hacerlo. Elija su plataforma, seleccione sus módulos, marque sus espacios supercargados y el optimizador calculará el diseño que aprovecha al máximo sus bonificaciones de adyacencia. Funciona para naves espaciales, corbetas, multiherramientas, exotrajes, exocrafts y cargueros.

## ¿Qué es un bono de adyacencia?

Cuando colocas módulos de tecnología compatibles uno al lado del otro en No Man's Sky, obtienen un aumento de estadísticas. El juego no te dice mucho sobre cómo funciona esto, pero la versión corta: los módulos del mismo tipo que comparten una ventaja obtienen un aumento porcentual en sus estadísticas. Cuantas más ventajas se compartan, mayor será la bonificación. Determinar a mano la disposición correcta es tedioso, especialmente en rejillas más grandes con ranuras sobrealimentadas que tener en cuenta.

## ¿Qué son las tragamonedas sobrealimentadas?

Algunas ranuras del inventario en No Man's Sky están sobrecargadas. Cualquier módulo de tecnología colocado en uno obtiene un gran multiplicador de estadísticas además de las bonificaciones de adyacencia normales. Se colocan aleatoriamente en cada pieza de equipo, por lo que el diseño óptimo cambia dependiendo de dónde aterrizaron las ranuras supercargadas. Esa es la parte difícil y para eso está diseñada esta herramienta.

## Cómo funciona

El optimizador utiliza una combinación de coincidencia de patrones determinista y recocido simulado. Para conjuntos de módulos más pequeños, puede encontrar exactamente el mejor diseño. Para rejillas más grandes o más complejas, el recocido simulado explora miles de disposiciones para encontrar una que obtenga la puntuación más alta posible. La puntuación tiene en cuenta las bonificaciones de adyacencia, la ubicación de las ranuras sobrealimentadas y los pesos de estadísticas específicos del módulo. El backend se ejecuta en Rust para mayor velocidad.

## Plataformas compatibles

- Naves espaciales (estándar, centinela, solar, de combate, viviente, atlántida)
- Corbetas
- Multiherramientas (estándar y centinela)
- Exotrajes
- Exocraft (vagabundo, peregrino, nómada, coloso, minotauro, nautilon)
- cargueros