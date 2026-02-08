# So funktioniert NMS Optimizer: ML-gestützte Tech-Layout-Optimierung

## Was ist der NMS-Optimierer?

Der NMS Optimizer ist der beste kostenlose, webbasierte Tech-Layout-Rechner für No Man's Sky-Spieler, die die optimale Modulplatzierung für ihre Ausrüstung finden möchten. Mit diesem Tool können Sie ideale Layouts entwerfen und visualisieren für:

- **Raumschiff-Tech-Layouts** und Raumschiff-Builds
- **Frachter-Layouts** und Platzierung der Frachter-Technologie
- **Corvette-Technologie-Layouts** und Corvette-Builds
- **Multitool-Layouts** und Multitool-Builds
- **Exocraft-Layouts** und Exocraft-Builds
- **Exosuit-Layouts** und Platzierung der Exosuit-Technologie

Das Tool übernimmt die Berechnung automatisch und berücksichtigt **Adjazenzboni** (die Leistungssteigerung, die Sie durch die Platzierung kompatibler Technologien nebeneinander in Ihrem Inventarraster erhalten) und **Supercharged-Slots** (die seltenen hochwertigen Slots, die ~25–30 % Boosts bieten). Es berechnet und findet die Anordnung, die Ihnen die höchstmögliche Punktzahl für Ihren Build gibt.

## Wie funktioniert es?

Das Problem ist mathematisch enorm: ~8,32 × 10⁸¹ mögliche Permutationen (82 Ziffern lang). Wir lösen es mithilfe von Mustererkennung, maschinellem Lernen und Optimierung. Das Tool funktioniert in vier Schritten:

1. **Überprüfen Sie kuratierte Muster:** Beginnen Sie mit handgetesteten Mustern, die solide Nachbarschaftsboni bieten
2. **Vorhersage mit ML:** Wenn Ihr Setup aufgeladene Slots umfasst, sagt ein TensorFlow-Modell – trainiert auf über 16.000 realen Gittern – die beste Platzierung für Kerntechnologien voraus
3. **Verfeinern mit simuliertem Tempern:** Ein Rust-basierter Optimierer tauscht Module und verschiebt Positionen, um die bestmögliche Punktzahl zu erreichen
4. **Zeigen Sie das Ergebnis:** Das Tool zeigt Ihre Konfiguration mit der höchsten Punktzahl mit Aufschlüsselung der Punktzahlen an

## Was es kann

- **Verwaltet alle Slot-Typen:** Standard-, Supercharged- und inaktive Slots
- **Versteht Supercharged-Slots:** Der Optimierer entscheidet, ob eine Kerntechnologie oder ihr bestes Upgrade in diese hochwertigen Slots gesteckt werden soll. Es navigiert durch die Kompromisse, um Ihr Ziel zu maximieren
- **Verwendet ML-Muster:** Auf über 16.000 realen Layouts trainiert, um leistungsstarke Arrangements zu identifizieren
- **Verfeinert bis zur Perfektion:** Simuliertes Tempern extrahiert jeden möglichen Prozentpunkt der Leistung

## Warum es verwenden?

Überspringen Sie das endlose Ausprobieren. Holen Sie sich das mathematisch optimale Layout für Ihr Raumschiff mit maximalem Schaden, Ihren Frachter mit der größten Reichweite, Ihre leistungsstarke Corvette oder Ihren robusten Exosuit. Das Tool erklärt Nachbarschaftsboni und aufgeladene Slots, anstatt Sie im Ungewissen zu lassen. Wenn Sie sich jemals gefragt haben, wie Sie Ihre begrenzten Supercharger-Slots am besten nutzen können, finden Sie hier die Antwort.

## Warum den NMS-Optimierer der manuellen Planung vorziehen?

**Das Problem:** Die Ausrüstung von No Man's Sky kann Millionen möglicher Technologieanordnungen aufweisen, und es dauert Stunden, durch Versuch und Irrtum die optimale Anordnung zu finden.

**Die Lösung:** Der NMS Optimizer nutzt maschinelles Lernen und fortschrittliche Algorithmen, um:
- Finden Sie in Sekundenschnelle Ihr bestes Technologie-Layout
- Adjazenzboni automatisch maximieren
- Optimieren Sie die Platzierung der aufgeladenen Steckplätze
- Zeigen Sie die genaue Punkteaufschlüsselung an
- Arbeiten für alle Ausrüstungstypen (Raumschiffe, Korvetten, Multitools, Exosuits, Exocraft, Frachter)
- Aktualisieren Sie in Echtzeit, während Sie Ihre Technologieauswahl anpassen

Anstatt zu raten, erhalten Sie jedes Mal die mathematisch optimale Anordnung.

## Tech-Stack

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend-Solver:** Python, Flask, TensorFlow, NumPy, Rust-basiertes simuliertes Tempern und Scoring
- **Testen:** Vitest, Python Unittest
- **Bereitstellung:** Heroku (Hosting), Cloudflare (DNS und CDN), Docker
- **Automatisierung:** GitHub-Aktionen (CI/CD)
- **Analytics:** Google Analytics

## Repositorys

- Web-Benutzeroberfläche: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Häufig gestellte Fragen

### F: Was ist ein Adjazenzbonus?

A: Ein **Nachbarschaftsbonus** in No Man's Sky ist die Leistungssteigerung, die Sie erhalten, wenn Sie kompatible Technologiemodule nebeneinander in Ihrem Inventarraster platzieren. Unterschiedliche Technologien haben unterschiedliche Nachbarschaftspartner – Waffen-Upgrades bringen beispielsweise häufig Boni, wenn sie nahe beieinander platziert werden. Der NMS Optimizer analysiert Ihre ausgewählten Technologien und findet die Anordnung, die alle Adjazenzboni in Ihrem gesamten Raster maximiert und so sicherstellt, dass Sie die bestmöglichen Leistungsmultiplikatoren erhalten.

### F: Wie funktionieren Supercharged-Slots?

A: **Supercharged-Slots** sind seltene, hochwertige Inventar-Slots (normalerweise 4 pro Raster), die alles, was darin platziert wird, um ca. 25–30 % steigern. Sie gehören zu den wertvollsten Immobilien in Ihrem Netz. Die Herausforderung besteht darin, zu entscheiden, welche Technologien in diese begrenzten Slots passen sollen. Der Optimierer nutzt maschinelles Lernen, das auf mehr als 16.000 realen Layouts trainiert wurde, um zu entscheiden, ob in jedem aufgeladenen Steckplatz eine Kerntechnologie oder das beste Upgrade platziert werden soll, um so Ihre Gesamtleistung zu maximieren.

### F: Wie funktioniert der NMS-Technologieplatzierungsoptimierer?

A: Der NMS-Optimierer verwendet drei zusammenarbeitende Methoden:
1. **Musterabgleich** – Es beginnt mit handgetesteten, bewährten Technologie-Layoutmustern, die solide Nachbarschaftsvorteile bieten
2. **Vorhersage durch maschinelles Lernen** – Ein neuronales TensorFlow-Netzwerk, das auf über 16.000 realen Gittern trainiert wurde, sagt die beste Platzierung für Ihre Kerntechnologien voraus
3. **Simulierte Glühverfeinerung** – Ein Rust-basierter Optimierer optimiert das Layout, indem er Tausende von Positionswechseln testet, um die absolut bestmögliche Punktzahl zu erreichen

Dieser dreischichtige Ansatz löst ein ansonsten unmöglich komplexes Problem (~8,32 × 10⁸¹ Permutationen).

### F: Welche No Man's Sky-Geräte unterstützt der Optimierer?

A: Der NMS Optimizer unterstützt alle wichtigen No Man's Sky-Geräte:

- **Raumschiffe:** Standard-, Exotic-, Sentinel-, Solar-, Living- und MT-Varianten (Multitool-fokussiert).
- **Korvetten:** Einschließlich einzigartiger Reaktormodule und kosmetischer Technologie-Slots
- **Multitools:** Alle Arten, einschließlich Dauben
- **Exocraft:** Alle Fahrzeugtypen (Nomad, Pilgrim, Roamer, Minotaur, Nautilon)
- **Exoanzüge:** Alle Technologietypen
- **Frachter:** Technologielayouts für Großschiffe

### F: Wie genau ist der Optimierer?

A: Sehr genau. Der NMS Optimizer kombiniert handgetestete Layoutmuster, maschinelles Lernen, das auf über 16.000 realen Gittern trainiert wurde, und einen Rust-basierten simulierten Glühalgorithmus, um das mathematisch optimale Technologielayout für Ihre genaue Konfiguration zu finden. Es berücksichtigt alle Adjazenzboni, Kompromisse bei aufgeladenen Slots und inaktive Slots, um die Leistung Ihres Builds zu maximieren.

### F: Kann ich mit diesem Tool das beste Raumschiff-, Korvetten- oder Exosuit-Layout finden?

A: Ja. Der NMS Optimizer findet für jeden Gerätetyp das **beste Technologielayout**:
- **Beste Raumschiff-Layouts** unter Berücksichtigung Ihrer Waffen- und Versorgungstechnologieauswahl
- **Beste Korvetten-Layouts**, die Reaktor- und Kampftechnologien ausgleichen
- **Beste Exosuit-Layouts** zur Optimierung von Nutzen, Verteidigung und Bewegungstechnologie
- **Beste Multitool-Layouts** für maximalen Schaden oder Nutzen
- **Beste Frachter-Layouts** für Lagerung und Versorgung

Wählen Sie einfach Ihren Gerätetyp, wählen Sie Ihre Technologien aus, markieren Sie Ihre aufgeladenen Steckplätze und der Optimierer berechnet die mathematisch optimale Anordnung.

### F: Ist der NMS Optimizer kostenlos?

A: Ja. Der NMS Optimizer ist völlig kostenlos, werbefrei und Open Source (GPL-3.0-Lizenz). Keine Registrierung oder Zahlung erforderlich. Die gesamte Optimierung erfolgt sofort und kostenlos in Ihrem Browser oder auf unseren Servern.

### F: Kann ich meine Builds speichern und teilen?

A: Ja. Sie können:
- **Speichern Sie Builds** als „.nms“-Dateien auf Ihrem Computer und laden Sie sie später erneut
- **Generieren Sie gemeinsam nutzbare Links**, um Ihr Technologielayout an Freunde zu senden
- **Teilen Sie Ihren Build direkt** über soziale Medien oder Messaging
Alle Builds werden vor der Freigabe auf Integrität und Gerätekompatibilität überprüft.

## Danke

George V, Diab, JayTee73, Boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray und alle anderen, die dazu beigetragen haben – Ihre Unterstützung bedeutet alles. Jede Spende, jeder Anteil und jedes freundliche Wort hilft mir, weiter aufzubauen. Danke schön.

## Frühe Version

So sah die Benutzeroberfläche in einer frühen Version aus: Sie funktionierte, aber das Design war minimal. Die aktuelle Version stellt eine wesentliche Verbesserung in Design, Benutzerfreundlichkeit und Übersichtlichkeit dar.

![Früher Prototyp der Benutzeroberfläche für die Layoutoptimierung von No Man's Sky](/assets/img/screenshots/screenshot_v03.png)