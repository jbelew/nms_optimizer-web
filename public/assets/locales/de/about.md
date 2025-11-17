## Was ist der NMS-Optimierer?

Der NMS Optimizer ist ein leistungsstarker webbasierter **Rechner**, **Planer** und **Builder** für das Spiel No Man's Sky. Es hilft Spielern, optimale Layouts für ihre Ausrüstung zu entwerfen, indem es die beste Modulanordnung ermittelt. Dieses Tool unterstützt **Raumschiff-Layouts**, **Frachter-Layouts**, **Corvette-Layouts**, **Multitool-Builds**, **Exocraft-Layouts** und **Exosuit-Builds**. Es berechnet automatisch die ideale **Modulplatzierung**, um wichtige Spielmechaniken wie **Nachbarschaftsboni** (aus der Gruppierung ähnlicher Technologien) und die leistungsstarken Boosts von **aufgeladenen Slots** zu maximieren. Um Spitzenleistungen zu erzielen, ist es wichtig zu verstehen, wie diese Funktionen optimal genutzt werden können, und dieses Tool vereinfacht diesen komplexen Prozess.

## Wie es funktioniert

> Wie löst man ein Problem mit bis zu ~8,32 × 10⁸¹ möglichen Permutationen (das sind 82 Ziffern!) in weniger als fünf Sekunden?

Die absolut beste **Modulplatzierung** bei so vielen möglichen Layout-Permutationen für ein vollständiges Raster herauszufinden, ist keine leichte Aufgabe. Dieses Tool kombiniert deterministische Muster, maschinelles Lernen und Rust-basiertes simuliertes Tempern, um erstklassige **Raumschiff-Builds**, **Frachter-Builds**, **Corvette-Builds**, **Multitool-Layouts**, **Exocraft-Builds** und **Exosuit-Layouts** in etwa fünf Sekunden zu liefern. Es berücksichtigt alle Faktoren, einschließlich **Nachbarschaftsboni** und den strategischen Einsatz von **Supercharger-Slots**.

1. **Musterbasierte Vorlösung:** Beginnt mit einer kuratierten Bibliothek handgetesteter Layoutmuster und optimiert für maximale Adjazenzboni über verschiedene Rastertypen hinweg.
2. **KI-gesteuerte Platzierung (ML-Inferenz):** Wenn eine praktikable Konfiguration aufgeladene Slots umfasst, ruft das Tool ein TensorFlow-Modell auf, das auf mehr als 16.000 Gittern trainiert wurde, um die optimale Platzierung vorherzusagen.
3. **Simuliertes Annealing (Verfeinerung):** Verfeinert das Layout durch stochastische Suche – Austausch von Modulen und Verschiebung von Positionen, um die Adjazenzbewertung zu verbessern und gleichzeitig lokale Optima zu vermeiden.
4. **Ergebnispräsentation:** Gibt die Konfiguration mit der höchsten Punktzahl aus, einschließlich Punkteaufschlüsselung und visuellen Layoutempfehlungen für Raumschiffe, Frachter, Korvetten, Multitools, Exocraft und Exosuits.

## Hauptmerkmale

- **Umfassende Netzoptimierung:** Volle Unterstützung für Standard-, **Supercharged**- und inaktive Slots, um das wirklich optimale Layout zu finden.
- **Strategische Supercharged-Slot-Nutzung:** Der Optimierer erkennt nicht nur Supercharged-Slots, sondern bestimmt auch intelligent, ob Kerntechnologien (wie eine Hauptwaffe) oder ihre besten Upgrades auf diesen High-Boost-Slots platziert werden sollen, und steuert dabei die komplexen Kompromisse, um Ihre spezifischen Build-Ziele (z. B. Schaden, Reichweite oder Effizienz) zu maximieren. Dies spiegelt die Strategien erfahrener Spieler wider, jedoch mit rechnerischer Präzision.
- **Inferenz durch maschinelles Lernen:** Auf über 16.000 historischen Rasterlayouts trainiert, um wirkungsvolle Muster zu identifizieren.
- **Erweitertes Simulated Annealing:** Zur sorgfältigen Verfeinerung des Layouts, um sicherzustellen, dass jeder Prozentpunkt der Leistung herausgeholt wird.

## Warum dieses Tool verwenden?

Hören Sie auf, bei der Platzierung der Technik zu raten, und entfalten Sie das wahre Potenzial Ihrer Ausrüstung! Egal, ob Sie einen **Raumschiff-Build** mit maximalem Schaden, einen **Frachter-Build** mit großer Reichweite, einen leistungsstarken **Corvette-Build**, die ultimative Scan-Reichweite mit einem perfekten **Multitool-Layout**, ein optimiertes **Exocraft** oder einen robusten **Exosuit** anstreben, dieser Optimierer entmystifiziert die komplexen Regeln von **Adjacency-Boni** und **Supercharged-Slot-Interaktionen**. Es bietet eine klare und effiziente Möglichkeit, Ihre Upgrades sicher zu planen und erstklassige Leistung zu erzielen, ohne stundenlanges manuelles Ausprobieren. Wenn Sie sich jemals gefragt haben, wie Sie Ihre begrenzten Supercharger-Slots am besten nutzen können, hat dieser **NMS-Rechner** die Antwort.

## Tech-Stack

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend-Solver:** Python-, Flask-, TensorFlow-, NumPy- und Rust-basierte benutzerdefinierte simulierte Annealing- und heuristische Scoring-Implementierungen.
- **Testen:** Vitest, Python Unittest
- **Bereitstellung:** Heroku (Hosting), Cloudflare (DNS und CDN), Docker
- **Automatisierung:** GitHub-Aktionen (CI/CD)
- **Analytics:** Google Analytics

## Repositorys

- Web-Benutzeroberfläche: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Eine lustige Geschichte

Hier ist ein Blick auf eine **frühe Version** der Benutzeroberfläche – funktional solide, aber optisch minimalistisch. Die aktuelle Version stellt eine wesentliche Verbesserung in Design, Benutzerfreundlichkeit und Klarheit dar und hilft Spielern, schnell das **beste Layout** für jedes Schiff oder Werkzeug zu finden.

![Früher Prototyp der Benutzeroberfläche für die Layoutoptimierung von No Man's Sky](/assets/img/screenshots/screenshot_v03.png)