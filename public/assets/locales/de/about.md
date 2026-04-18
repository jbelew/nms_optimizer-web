# Über den NMS-Optimierer: Wie die Layout-Optimierung funktioniert

## Was Ist Das?

Der NMS-Optimierer ist ein kostenloses Tool, das berechnet, wo du deine Technologie-Module in No Man's Sky am besten platzieren solltest. Du wählst deine Ausrüstung, selektierst deine Technologien, markierst deine überladenen Slots und das Tool ermittelt das Layout mit der höchsten Punktzahl.

Es unterstützt alle Raumschiff-Typen (Standard, Wächter, Solar, Kämpfer, Lebend, Atlantid), Korvetten, Multitools, Exo-Anzüge, alle Exofahrzeuge und Frachter.

Das Tool verwaltet Adjazenzboni und die Optimierung überladener Slots automatisch. In der Praxis erzielt ein optimiertes Layout oft 15–20 % bessere Werte als eine manuelle Anordnung.

## Das Problem

No Man's Sky erklärt Adjazenzboni nur oberflächlich und bietet keinerlei Anleitung zur Strategie für überladene Slots. Module des gleichen Typs erhalten einen Stat-Bonus, wenn sie im Inventar direkt nebeneinander liegen. Überladene Slots bieten einen Multiplikator von etwa 25–30 % auf jedes darin platzierte Modul. Die beste Anordnung zu finden bedeutet, beide Systeme gleichzeitig zu balancieren – bei Millionen möglicher Kombinationen (~8,32 × 10⁸¹ für ein volles Layout).

Das ist im Kopf unmöglich zu lösen.

## Wie Der Optimierer Es Löst

Die Optimierung erfolgt in vier Schritten:

1. **Musterabgleich**: Er beginnt mit manuell getesteten Anordnungen, die für gängige Modul-Sets zuverlässig hohe Punktzahlen liefern.
2. **ML-Vorhersage**: Bei überladenen Slots prognostiziert ein TensorFlow-Modell (trainiert an über 16.000 High-Score-Layouts), welche Haupttechnologien oder Upgrades in diese Slots gehören.
3. **Simulated Annealing**: Ein in Rust geschriebener Optimierer tauscht Module aus und testet tausende Kombinationen in Millisekunden, um das absolute Maximum zu finden.
4. **Visualisierung Der Ergebnisse**: Du erhältst das beste Layout inklusive einer detaillierten Aufschlüsselung der Adjazenz-Multiplikatoren.

Jeder Schritt baut auf dem vorherigen auf. Das ML-Modell liefert einen soliden Startpunkt, den der Rust-Algorithmus anschließend perfektioniert.

## Was Der Optimierer Berücksichtigt

- Standard-Slots, überladene Slots und inaktive Slots.
- Ob die Haupttechnologie oder das beste Upgrade in einen überladenen Slot gehört.
- Abwägung zwischen konkurrierenden Stats (z. B. Manövrierbarkeit vs. Geschwindigkeit, Schaden vs. Feuerrate).
- Modulspezifische Stat-Gewichtungen und Adjazenz-Regeln.

## Technologie-Stack

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI.
- **Optimierungs-Service:** Python, Flask, TensorFlow, NumPy, Rust (Simulated Annealing und Scoring).
- **Testing:** Vitest, Python Unittest.
- **Deployment:** Heroku (Hosting), Cloudflare (Hosting/DNS/CDN), Docker.
- **CI/CD:** GitHub Actions.

## Repositories

- Web-Interface: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Häufig Gestellte Fragen (FAQ)

### Was Ist Ein Adjazenzbonus?

Wenn du kompatible Technologie-Module direkt nebeneinander im Inventar platzierst, erhalten sie einen Stat-Boost. Unterschiedliche Technologien haben unterschiedliche "Nachbarn": Waffen-Upgrades verstärken sich gegenseitig, Bewegungs-Technologien ebenso. Der Optimierer testet alle Positionen, um diese Boni zu maximieren.

### Wie Funktionieren Überladene Slots?

Überladene Slots sind seltene Inventarplätze (meist 4 pro Raster), die das darin befindliche Modul um ca. 25–30 % verstärken. Die Schwierigkeit liegt darin, zu entscheiden, was dort platziert wird: Manchmal ist es die Basistechnologie, manchmal das Upgrade mit den besten Werten. Das ML-Modell des Optimierers wurde speziell für diese Entscheidung trainiert.

### Welche Ausrüstung Wird Unterstützt?

Einfach alles:

- **Raumschiffe:** Standard, Exotisch, Wächter, Solar und Lebend.
- **Korvetten:** Inklusive einzigartiger Reaktor-Module und kosmetischer Slots.
- **Multitools:** Alle Typen, inklusive Stäben.
- **Exofahrzeuge:** Alle Fahrzeuge (Nomade, Koloss, Pilger, Streuner, Minotaurus, Nautilon).
- **Exo-Anzüge:** Alle Überlebens- und Bewegungstechnologien.
- **Frachter:** Technologie-Layouts für Großschiffe.

### Ist Es Kostenlos?

Ja. Kostenlos, werbefrei und Open Source (GPL-3.0). Keine Accounts, kein Tracking persönlicher Daten.

### Kann Ich Builds Speichern Und Teilen?

Ja. Du kannst Layouts als `.nms`-Dateien speichern, teilbare Links generieren oder sie direkt posten. Die Builds werden vor dem Teilen validiert, um Kompatibilität sicherzustellen.

## Dankeschön

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray und alle anderen Unterstützer: Eure Hilfe bedeutet mir viel. Jede Spende und jedes geteilte Tool hilft mir, die Entwicklung fortzusetzen. Danke!

## Alte Version

So sah das Interface in einer frühen Version aus: Es funktionierte, war aber sehr minimalistisch. Die aktuelle Version ist ein großer Sprung in Design und Bedienbarkeit.
![Früher Prototyp des No Man's Sky Layout-Optimierers](/assets/img/screenshots/screenshot_v03.png)
