# Wie NMS Optimizer funktioniert

## Was ist das?

NMS Optimizer ist ein kostenloses Tool, das herausfindet, wo Sie Ihre Technologiemodule in No Man's Sky platzieren können. Sie wählen Ihre Ausrüstung aus, wählen Ihre Technologien aus, markieren Ihre aufgeladenen Steckplätze und es berechnet das Layout, das die höchste Punktzahl erzielt.

Es funktioniert für Raumschiffe (Standard, Sentinel, Solar, Fighter, Living, Atlantis), Korvetten, Multitools, Exosuits, alle Exocraft-Typen und Frachter.

Das Tool verarbeitet Adjacency-Boni und die Platzierung von Super-Slots automatisch. In der Praxis erzielt ein optimiertes Layout in der Regel 15–20 % bessere Ergebnisse als das, was die meisten Spieler von Hand arrangieren.

## Das Problem

No Man's Sky erklärt Adjacency-Boni nicht gut und erklärt überhaupt nicht die Supercharged-Slot-Strategie. Module desselben Typs erhalten einen Stat-Boost, wenn sie sich eine Kante im Raster teilen. Supercharged-Slots bieten einen Multiplikator von ca. 25–30 % für alles, was Sie hineinstecken. Um die beste Anordnung herauszufinden, müssen beide Systeme gleichzeitig über Raster mit Millionen möglicher Permutationen (~8,32 × 10⁸¹ für ein vollständiges Layout) jongliert werden.

Niemand löst das von Hand.

## Wie der Optimierer es löst

Der Optimierer durchläuft vier Schritte:

1. **Mustervergleich** – es beginnt mit handgetesteten Anordnungen, die bei gängigen Modulsätzen zuverlässig gut abschneiden
2. **ML-Vorhersage** – Wenn Ihr Grid über aufgeladene Slots verfügt, sagt ein TensorFlow-Modell, das auf mehr als 16.000 Layouts mit hoher Punktzahl trainiert wurde, voraus, wo Kerntechnologien im Vergleich zu Upgrades platziert werden sollten
3. **Simuliertes Ausglühen** – ein Rust-basierter Optimierer tauscht Module aus und testet Tausende von Anordnungen in Millisekunden, um die höchstmögliche Punktzahl zu erreichen
4. **Ergebnisanzeige** – Sie sehen das Layout mit der höchsten Punktzahl und einer vollständigen Aufschlüsselung der Adjazenzmultiplikatoren

Jeder Schritt geht in den nächsten über. Das ML-Modell gibt dem simulierten Glühen einen starken Ausgangspunkt und das Glühen wird von dort aus verfeinert.

## Was der Optimierer berücksichtigt

- Standard-, Supercharged- und inaktive Slots
- Ob eine Kerntechnologie oder ihr bestes Upgrade in jeden aufgeladenen Slot gehört
- Kompromisse zwischen konkurrierenden Statistiken (Manövrierfähigkeit vs. Geschwindigkeit, Schaden vs. Feuerrate)
- Modulspezifische Statistikgewichtungen und Regeln für Adjazenzpartner

## Tech-Stack

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend-Löser:** Python, Flask, TensorFlow, NumPy, Rust (simuliertes Annealing und Scoring)
- **Testen:** Vitest, Python Unittest
- **Bereitstellung:** Heroku (Hosting), Cloudflare (DNS/CDN), Docker
- **CI/CD:** GitHub-Aktionen

## Repositorys

- Web-Benutzeroberfläche: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## FAQ

### Was ist ein Adjacency-Bonus?

Wenn Sie kompatible Technologiemodule nebeneinander im Inventarraster platzieren, erhalten sie einen Stat-Boost. Unterschiedliche Technologien haben unterschiedliche Nachbarschaftspartner – Waffen-Upgrades erhalten gegenseitige Boni, Bewegungstechnologie-Boni von anderen Bewegungstechnologien und so weiter. Der Optimierer testet alle möglichen Anordnungen und wählt diejenige aus, bei der die gesamten Adjazenzboni am höchsten sind.

### Wie funktionieren Supercharged-Slots?

Supercharged-Slots sind seltene Inventarslots (normalerweise 4 pro Raster), die dem darin enthaltenen Modul einen Boost von ca. 25–30 % verleihen. Der schwierige Teil besteht darin, zu entscheiden, was dorthin gehört. Manchmal ist es die Kerntechnologie, manchmal ist es das Upgrade mit dem höchsten Status. Das ML-Modell des Optimierers wird speziell auf diese Entscheidung trainiert und verwendet dabei mehr als 16.000 reale Layouts als Trainingsdaten.

### Welche Gerätetypen werden unterstützt?

Alle von ihnen:

- **Raumschiffe** – Standard-, Exoten-, Sentinel-, Solar-, Wohn- und Atlantischen-Varianten
- **Korvetten** – inklusive Reaktor- und kosmetischen Technologie-Slots
- **Multitools** – alle Arten, einschließlich Dauben
- **Exocraft** – Nomade, Pilger, Wanderer, Koloss, Minotaurus, Nautilon
- **Exosuits** – alle Technologiekategorien
- **Frachter** – technische Layouts für Großschiffe

### Ist es kostenlos?

Ja. Kostenlos, werbefrei, Open Source (GPL-3.0). Kein Konto erforderlich.

### Kann ich Builds speichern und teilen?

Ja. Sie können Builds als „.nms“-Dateien speichern, gemeinsam nutzbare Links generieren oder direkt in sozialen Medien teilen. Builds werden vor der Freigabe auf Integrität und Gerätekompatibilität überprüft.

## Danke

George V, Diab, JayTee73, Boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray und alle anderen, die dazu beigetragen haben – Ihre Unterstützung bedeutet alles. Jede Spende, jeder Anteil und jedes freundliche Wort hilft mir, weiter aufzubauen. Danke schön.

## Frühe Version

So sah die Benutzeroberfläche in einer frühen Version aus: Sie funktionierte, aber das Design war minimal. Die aktuelle Version stellt eine wesentliche Verbesserung in Design, Benutzerfreundlichkeit und Übersichtlichkeit dar.
![Früher Prototyp der Benutzeroberfläche für die Layoutoptimierung von No Man's Sky](/assets/img/screenshots/screenshot_v03.png)