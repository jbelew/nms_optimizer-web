# NMS-Optimierer: Technologie-Layout-Planer und Adjazenz-Rechner

![Screenshot der NMS Optimizer-Anwendung, der ein Raumschiff-Technologiegitter mit optimierter Modulplatzierung zeigt](/assets/img/screenshots/screenshot.png)

NMS Optimizer findet heraus, wo Sie Ihre Technologie-Module platzieren müssen, damit Sie es nicht tun müssen. Wählen Sie Ihre Plattform, wählen Sie Ihre Module aus, markieren Sie Ihre Supercharged Slots, und der Optimierer berechnet das Layout, das das Maximum aus Ihren Adjacency Bonuses herausholt. Er funktioniert für Starships, Corvettes, Multitools, Exosuits, Exocraft und Freighters.

## Was ist ein Adjacency Bonus?

Wenn Sie kompatible Technologie-Module in No Man's Sky nebeneinander platzieren, erhalten sie einen Stat-Boost. Das Spiel verrät nicht viel darüber, wie das funktioniert, aber kurz gesagt: Module desselben Typs, die eine Kante teilen, erhalten eine prozentuale Steigerung ihrer Stats. Je mehr Kanten geteilt werden, desto größer ist der Bonus. Die richtige Anordnung von Hand herauszufinden, ist mühsam, besonders bei größeren Gittern, bei denen Supercharged Slots berücksichtigt werden müssen.

## Was sind Supercharged Slots?

Einige Inventar-Slots in No Man's Sky sind supercharged. Jedes Technologie-Modul, das in einem platziert wird, erhält einen großen Stat-Multiplikator zusätzlich zu den normalen Adjacency Bonuses. Sie sind zufällig auf jedem Ausrüstungsgegenstand platziert, daher ändert sich das optimale Layout je nachdem, wo Ihre Supercharged Slots gelandet sind. Das ist der schwierige Teil, und genau das soll dieses Tool lösen.

## Wie es funktioniert

Der Optimierer verwendet eine Kombination aus deterministischer Mustererkennung und simulierter Abkühlung (Simulated Annealing). Für kleinere Modul-Sets kann er das exakt beste Layout finden. Für größere oder komplexere Gitter erforscht die simulierte Abkühlung Tausende von Anordnungen, um eine zu finden, die so hoch wie möglich punktet. Die Bewertung berücksichtigt Adjacency Bonuses, die Platzierung von Supercharged Slots und modul-spezifische Stat-Gewichtungen. Das Backend läuft in Rust für Geschwindigkeit.

## Unterstützte Plattformen

- **Starships:** Standard, Exotic, Sentinel, Solar und Living
- **Corvettes:** Einschließlich einzigartiger Reaktor-Module und kosmetischer Technologie-Slots
- **Multitools:** Alle Typen, einschließlich Staves
- **Exocraft:** Alle Fahrzeugtypen (Nomad, Colossus, Pilgrim, Roamer, Minotaur, Nautilon)
- **Exosuits:** Alle Technologie-Typen
- **Freighters:** Technologie-Layouts für Großkampfschiffe