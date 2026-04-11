# Optimizador de NMS: Diseños tecnológicos y calculadora de bonificación de adyacencia para No Man's Sky

![Captura de pantalla de la aplicación Optimizador de NMS que muestra una cuadrícula de tecnología de nave espacial con ubicación de módulos optimizada](/assets/img/screenshots/screenshot.png)

El Optimizador de NMS descubre dónde colocar tus módulos de tecnología para que no tengas que hacerlo tú. Elige tu plataforma, selecciona tus módulos, marca tus ranuras potenciadas y el optimizador calculará el diseño que aproveche al máximo tus bonificaciones de adyacencia. Funciona para naves espaciales, corbetas, multiherramientas, exotrajes, exonaves y cargueros.

## ¿Qué es una bonificación de adyacencia?

Cuando colocas módulos de tecnología compatibles uno al lado del otro en No Man's Sky, obtienen un aumento de estadísticas. El juego no explica mucho sobre cómo funciona esto, pero la versión corta es: los módulos del mismo tipo que comparten un borde obtienen un aumento porcentual en sus estadísticas. Cuantos más bordes compartan, mayor será la bonificación. Determinar la disposición correcta a mano es tedioso, especialmente en cuadrículas grandes con ranuras potenciadas que tener en cuenta.

## ¿Qué son las ranuras potenciadas?

Algunas ranuras de inventario en No Man's Sky están potenciadas. Cualquier módulo de tecnología colocado en una de ellas obtiene un gran multiplicador de estadísticas además de las bonificaciones de adyacencia normales. Se colocan aleatoriamente en cada pieza de equipo, por lo que el diseño óptimo cambia dependiendo de dónde hayan caído las ranuras potenciadas. Esa es la parte difícil, y es para lo que se ha diseñado esta herramienta.

## Cómo funciona

El optimizador utiliza una combinación de coincidencia de patrones determinista y recocido simulado. Para conjuntos de módulos pequeños, puede encontrar exactamente el mejor diseño. Para cuadrículas más grandes o complejas, el recocido simulado explora miles de disposiciones para encontrar una que obtenga la puntuación más alta posible. La puntuación tiene en cuenta las bonificaciones de adyacencia, la ubicación de las ranuras potenciadas y los pesos de las estadísticas específicos de cada módulo. El backend se ejecuta en Rust para mayor velocidad.

## Plataformas compatibles

- Naves espaciales (estándar, centinela, solar, luchadora, orgánica, atlante)
- Corbetas
- Multiherramientas (estándar y centinela)
- Exotrajes
- Exonaves (roamer, pilgrim, nomad, colossus, minotaur, nautilon)
- Cargueros
