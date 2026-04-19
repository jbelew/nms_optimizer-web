# Über NMS Optimizer: Wie die Layout-Optimierung funktioniert

## Was ist das?

NMS Optimizer ist ein kostenloses Tool, das herausfindet, wo Sie Ihre Technologie-Module in No Man's Sky platzieren sollten. Sie wählen Ihre Ausrüstung, Ihre Technologien, markieren Ihre Supercharged Slots, und es berechnet das Layout, das die höchste Punktzahl erzielt.

Es funktioniert für Raumschiffe (Standard, Sentinel, Solar, Fighter, Living, Atlantid), Korvetten, Multitools, Exosuits, alle Exocraft-Typen und Frachter.

Das Tool handhabt Adjacency Bonuses und die Platzierung von Supercharged Slots automatisch. In der Praxis erzielt ein optimiertes Layout typischerweise 15-20% höhere Werte als das, was die meisten Spieler von Hand anordnen.

## Das Problem

No Man's Sky erklärt Adjacency Bonuses nicht gut und die Strategie für Supercharged Slots überhaupt nicht. Module desselben Typs erhalten einen Statistik-Boost, wenn sie eine Kante auf dem Raster teilen. Supercharged Slots geben einen Multiplikator von ~25-30% auf alles, was Sie darin platzieren. Die beste Anordnung zu finden, bedeutet, beide Systeme gleichzeitig zu jonglieren, über Raster mit Millionen möglicher Permutationen (~8.32 × 10⁸¹ für ein vollständiges Layout).

Das löst niemand von Hand.

## Wie der Optimizer es löst

Der Optimizer durchläuft vier Schritte:

1.  **Mustererkennung** — Er beginnt mit handgetesteten Anordnungen, die für gängige Modul-Sets zuverlässig gut abschneiden.
2.  **ML-Vorhersage** — Wenn Ihr Raster Supercharged Slots hat, sagt ein `TensorFlow`-Modell, das mit über 16.000 hoch bewerteten Layouts trainiert wurde, voraus, wo Kerntechnologien im Vergleich zu Upgrades platziert werden sollen.
3.  **Simulated Annealing** — Ein `Rust`-basierter Optimizer tauscht Module aus und testet Tausende von Anordnungen in Millisekunden, um die höchstmögliche Punktzahl zu erreichen.
4.  **Ergebnisanzeige** — Sie sehen das Layout mit der höchsten Punktzahl und einer vollständigen Aufschlüsselung des Adjacency Multipliers.

Jeder Schritt speist den nächsten. Das ML-Modell gibt `Simulated Annealing` einen starken Ausgangspunkt, und `Annealing` verfeinert von dort aus.

## Was der Optimizer berücksichtigt

-   Standard-, Supercharged- und inaktive Slots
-   Ob eine Kerntechnologie oder ihr bestes Upgrade in jeden Supercharged Slot gehört
-   Kompromisse zwischen konkurrierenden Statistiken (Manövrierfähigkeit vs. Geschwindigkeit, Schaden vs. Feuerrate)
-   Modulspezifische Statistik-Gewichtungen und Adjacency Partner-Regeln

## Tech Stack

-   **Frontend:** `TypeScript`, `React`, `Zustand`, `Vite`, `Tailwind CSS`, `Radix UI`
-   **Backend-Solver:** `Python`, `Flask`, `TensorFlow`, `NumPy`, `Rust` (`Simulated Annealing` und Scoring)
-   **Testing:** `Vitest`, `Python Unittest`
-   **Deployment:** `Heroku` (Hosting), `Cloudflare` (Hosting/DNS/CDN), `Docker`
-   **CI/CD:** `GitHub Actions`

## Repositories

-   Web-UI: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
-   Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## FAQ

### Was ist ein Adjacency Bonus?

Wenn Sie kompatible Technologie-Module nebeneinander auf dem Inventarraster platzieren, erhalten sie einen Statistik-Boost. Verschiedene Technologien haben unterschiedliche Adjacency Partner – Waffen-Upgrades profitieren voneinander, Bewegungstechnologien profitieren von anderen Bewegungstechnologien und so weiter. Der Optimizer testet alle möglichen Anordnungen und wählt diejenige aus, bei der die gesamten Adjacency Bonuses am höchsten sind.

### Wie funktionieren Supercharged Slots?

Supercharged Slots sind seltene Inventar-Slots (normalerweise 4 pro Raster), die einen Boost von ~25-30% auf jedes Modul geben, das sich darin befindet. Der knifflige Teil ist die Entscheidung, was dorthin gehört. Manchmal ist es die Kerntechnologie, manchmal das Upgrade mit den höchsten Statistiken. Das ML-Modell des Optimizers ist speziell auf diese Entscheidung trainiert und verwendet über 16.000 reale Layouts als Trainingsdaten.

### Welche Ausrüstungstypen werden unterstützt?

Alle davon:

-   **Raumschiffe:** Standard, Exotisch, Sentinel, Solar und Living
-   **Korvetten:** Einschließlich einzigartiger Reaktormodule und kosmetischer Technologie-Slots
-   **Multitools:** Alle Typen einschließlich Stäbe
-   **Exocraft:** Alle Fahrzeugtypen (Nomad, Colossus, Pilgrim, Roamer, Minotaur, Nautilon)
-   **Exosuits:** Alle Technologie-Typen
-   **Frachter:** Technologie-Layouts für Großkampfschiffe

### Ist es kostenlos?

Ja. Kostenlos, werbefrei, Open Source (GPL-3.0). Keine Konten oder E-Mail erforderlich.

### Kann ich Builds speichern und teilen?

Ja. Sie können Builds als `.nms`-Dateien speichern, teilbare Links generieren oder direkt in sozialen Medien teilen. Builds werden vor dem Teilen auf Integrität und Ausrüstungskompatibilität überprüft.

## Vielen Dank

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray und alle anderen, die beigetragen haben – Ihre Unterstützung bedeutet alles. Jede Spende, jeder Share und jedes nette Wort hilft mir, weiter zu entwickeln. Vielen Dank.

## Frühe Version

So sah die Benutzeroberfläche in einer frühen Version aus – sie funktionierte, aber das Design war minimalistisch. Die aktuelle Version ist eine wesentliche Verbesserung in Design, Benutzerfreundlichkeit und Klarheit.
![Früher Prototyp der Benutzeroberfläche des No Man's Sky Layout-Optimierers](/assets/img/screenshots/screenshot_v03.png)