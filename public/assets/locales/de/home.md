# NMS Optimizer: Tech-Layout-Builder & Adjacency-Rechner

![Screenshot der NMS Optimizer Anwendung, die ein Technologie-Raster eines Raumschiffs mit optimierter Modulplatzierung zeigt](/assets/img/screenshots/screenshot.png)

Der NMS Optimizer findet heraus, wo Sie Ihre Technologie-Module platzieren müssen, damit Sie es nicht tun müssen. Wählen Sie Ihre Plattform, Ihre Module, markieren Sie Ihre Supercharged Slots, und der Optimizer berechnet das Layout, das das Maximum aus Ihren Adjacency Bonuses herausholt. Er funktioniert für Starships, Corvettes, Multitools, Exosuits, Exocraft und Freighters.

## Was ist ein Adjacency Bonus?

Wenn Sie kompatible Technologie-Module in No Man's Sky nebeneinander platzieren, erhalten sie einen Statistik-Boost. Das Spiel verrät nicht viel darüber, wie das funktioniert, aber kurz gesagt: Module desselben Typs, die eine Kante teilen, erhalten eine prozentuale Erhöhung ihrer Werte. Je mehr Kanten geteilt werden, desto größer der Bonus. Die richtige Anordnung manuell herauszufinden, ist mühsam, besonders bei größeren Rastern, bei denen Supercharged Slots berücksichtigt werden müssen.

## Was sind Supercharged Slots?

Einige Inventar-Slots in No Man's Sky sind Supercharged. Jedes Technologie-Modul, das in einem platziert wird, erhält einen großen Statistik-Multiplikator zusätzlich zu den normalen Adjacency Bonuses. Sie sind zufällig auf jedem Ausrüstungsgegenstand platziert, daher ändert sich das optimale Layout je nachdem, wo Ihre Supercharged Slots gelandet sind. Das ist der schwierige Teil, und genau das soll dieses Tool lösen.

## Wie es funktioniert

Der Optimizer verwendet eine Kombination aus deterministischer Mustererkennung und simulierter Abkühlung (Simulated Annealing). Für kleinere Modul-Sets kann er das exakt beste Layout finden. Für größere oder komplexere Raster erkundet die simulierte Abkühlung Tausende von Anordnungen, um eine zu finden, die so hoch wie möglich punktet. Die Bewertung berücksichtigt Adjacency Bonuses, die Platzierung von Supercharged Slots und modul-spezifische Statistik-Gewichtungen. Das Backend läuft in Rust für Geschwindigkeit.

## Unterstützte Plattformen

- **Starships:** Standard, Exotic, Sentinel, Solar und Living
- **Corvettes:** Einschließlich einzigartiger Reaktor-Module und kosmetischer Technologie-Slots
- **Multitools:** Alle Typen, einschließlich Staves
- **Exocraft:** Alle Fahrzeugtypen (Nomad, Colossus, Pilgrim, Roamer, Minotaur, Nautilon)
- **Exosuits:** Alle Technologie-Typen
- **Freighters:** Capital Ship Technologie-Layouts