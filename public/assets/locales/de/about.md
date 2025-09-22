## Übersicht

Diese Webanwendung, der **NMS Optimizer**, hilft Spielern von _No Man’s Sky_, das beste Modul-Arrangement zu finden, um optimale **Starship-Layouts**, **Corvette-Layouts**, **Multitool-Builds**, **Exocraft-Layouts** und **Exosuit-Builds** zu erstellen. Sie berechnet automatisch die ideale Platzierung der **Module**, um zentrale Spielmechaniken wie **Adjazenzboni** (erzielt durch Gruppieren ähnlicher Technologien für synergetische Effekte) und die leistungsstarken **aufgeladenen Slots** zu maximieren. Das Verständnis, wie man diese Features – insbesondere aufgeladene Slots – am besten nutzt, ist der Schlüssel zu Spitzenleistung. Dieses Tool vereinfacht diesen komplexen Prozess.

## Wie es funktioniert

> Wie löst man ein Problem mit bis zu ~8,32 × 10⁸¹ möglichen Permutationen (das sind 82 Stellen!) in weniger als fünf Sekunden?

Die absolut beste **Modulplatzierung** bei so vielen möglichen Layout-Permutationen für ein volles Gitter ist keine kleine Leistung. Dieses Tool kombiniert deterministische Muster, maschinelles Lernen und simuliertes Annealing, um **Top-Tier-Builds** für Starships, Corvettes, Multitools, Exocrafts und Exosuits in weniger als fünf Sekunden zu liefern. Es berücksichtigt alle Faktoren, einschließlich **Adjazenzboni** und die strategische Nutzung von **aufgeladenen Slots**.

1. **Musterbasierte Vorlösungen:** beginnt mit einer kuratierten Bibliothek handgeprüfter Layout-Muster und optimiert für maximale Adjazenzboni über verschiedene Gittertypen hinweg.
2. **KI-gesteuerte Platzierung (ML-Inferenz):** wenn eine mögliche Konfiguration aufgeladene Slots enthält, verwendet das Tool ein TensorFlow-Modell, das auf mehr als 16.000 Grids trainiert wurde, um eine optimale Platzierung vorherzusagen.
3. **Simuliertes Annealing (Verfeinerung):** verfeinert das Layout durch stochastische Suche – Module vertauschen und Positionen verschieben – um die Adjazenzbewertung zu verbessern und lokale Optima zu vermeiden.
4. **Ergebnispräsentation:** liefert die Konfiguration mit der höchsten Punktzahl, inklusive Bewertung und visuellen Layout-Empfehlungen für Starships, Corvettes, Multitools, Exocrafts und Exosuits.

## Schlüsselfunktionen

- **Umfassende Gitteroptimierung:** voller Support für Standard-, **aufgeladene** und inaktive Slots, um das wirklich optimale Layout zu finden.
- **Strategische Nutzung von aufgeladenen Slots:** über die Erkennung hinaus bestimmt der Optimierer intelligent, ob Kerntechnologien (z. B. Hauptwaffen) oder deren beste Upgrades in diese High-Impact-Slots gehören. Er navigiert komplexe Kompromisse, um Bauziele wie Schaden, Reichweite oder Effizienz zu maximieren – präzise wie bei Experten, aber mit Rechenpower.
- **ML-Inferenz:** trainiert auf mehr als 16.000 historischen Layouts, um starke Muster zu identifizieren.
- **Fortgeschrittenes simuliertes Annealing:** für sorgfältige Layout-Verfeinerung, sodass jede Prozentpunktleistung genutzt wird.

## Warum dieses Tool verwenden?

Hör auf, die Platzierung von Technologien zu raten, und schalte das wahre Potenzial deiner Ausrüstung frei! Egal ob du auf einen maximalen **Starship-Damage-Build**, einen leistungsstarken **Corvette-Build**, die ultimative Scan-Reichweite mit einem perfekten **Multitool-Layout**, ein optimiertes **Exocraft** oder ein robustes **Exosuit** abzielst – oder ob du einfach die beste Nutzung deiner begrenzten **aufgeladenen Slots** suchst: Dieses Tool bietet eine klare und effiziente Möglichkeit, deine Upgrades zu planen und Spitzenleistung zu erreichen, ohne stundenlang manuell herumprobieren zu müssen.

## Tech Stack

**Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
**Backend-Solver:** Python, Flask, TensorFlow, NumPy, benutzerdefinierte simulierte Annealing-Implementierung und heuristische Bewertung
**Tests:** Vitest, Python Unittest
**Deployment:** Heroku (Hosting) und Cloudflare (DNS/CDN)
**Automatisierung:** GitHub Actions (CI/CD)
**Analytics:** Google Analytics

## Repositories

- UI-Web: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Eine lustige Geschichte

Hier ein Blick auf eine **frühe Version** der Benutzeroberfläche – funktional solide, aber visuell minimal. Die aktuelle Version ist ein großes Upgrade in Design, Benutzerfreundlichkeit und Klarheit und hilft Spielern, schnell das beste Layout für jedes Schiff oder Werkzeug zu finden.

![Früher Prototyp der Benutzeroberfläche des No Man’s Sky Layout-Optimierers](/src/assets/img/screenshots/screenshot_v03.png)
