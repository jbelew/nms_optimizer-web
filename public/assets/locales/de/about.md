# Wie NMS Optimizer Funktioniert: ML-gesteuerte Layout-Optimierung

## Was ist der NMS-Optimierer?

Verlassen Sie sich nicht mehr auf Vermutungen! Der **NMS Optimizer** ist der ultimative, kostenlose, webbasierte **Rechner**, **Planer** und **Builder** für **No Man's Sky**-Spieler, die das absolut maximale Potenzial ihrer Ausrüstung freischalten möchten.

Es handelt sich um ein intelligentes Tool, mit dem Sie die **optimale Modulplatzierung** für Ihre gesamte Ausrüstung entwerfen und visualisieren können. Holen Sie sich das perfekte **Layout** für Ihr:

* **Raumschiff-Builds** (alle Klassen)
* **Frachterlayouts**
* **Corvette-Builds**
* **Multitool-Layouts**
* **Exocraft-Builds**
* **Exosuit-Builds**

Der Optimierer verarbeitet automatisch die komplexe Mathematik und berechnet die ideale Anordnung, um wichtige Spielmechaniken wie **Adjazenzboni** (der Boost durch die Gruppierung ähnlicher Technologien) und die immense Leistung von **aufgeladenen Slots** zu maximieren. Höchstleistungen zu erzielen ist jetzt ganz einfach.

## Wie löst es das unmögliche Problem?

> Wie löst man ein Problem mit bis zu ~8,32 × 10⁸¹ möglichen Permutationen (das sind 82 Ziffern!) in nur wenigen Sekunden?

Wir kombinieren modernste Technologie, um erstklassige **Raumschiff-Layouts**, **Frachter-Builds**, **Multitool-Layouts** und **Exosuit-Builds** zu liefern. Das Tool berücksichtigt jeden Faktor, einschließlich aller **Adjacency-Boni** und der strategischen Nutzung von **Supercharged Slots**, mithilfe eines vierstufigen Prozesses:

1. **Beginnen Sie mit den besten Mustern:** Der Prozess beginnt mit der sofortigen Überprüfung einer kuratierten Bibliothek handgetesteter Muster, um einen Ausgangspunkt mit hoher Punktzahl für **Adjazenzboni** zu schaffen.
2. **KI-gesteuerte Platzierung (maschinelles Lernen):** Wenn Ihr Setup aufgeladene Slots umfasst, greift ein spezielles TensorFlow-Modell – trainiert auf über 16.000 realen Gittern – ein, um die optimale Platzierung für Kerntechnologien vorherzusagen.
3. **Verfeinerung durch Simulated Annealing:** Ein hochoptimierter, Rust-basierter stochastischer Suchprozess tauscht sorgfältig Module und verschiebt Positionen. Diese letzte Verfeinerung stellt sicher, dass das Layout an seine absolute Leistungsgrenze gebracht wird, und vermeidet häufige Fehler (lokale Optima), die menschliche Spieler häufig machen.
4. **Visualisieren Sie den perfekten Build:** Der **NMS-Rechner** präsentiert dann die Konfiguration mit der höchsten Punktzahl, komplett mit Punkteaufschlüsselung und visuellen Empfehlungen für Ihre gesamte Ausrüstung.

---

## ✨Hauptfunktionen, die die Leistung steigern

* **Umfassende Optimierung:** Volle Unterstützung für Standard-, **Supercharged**- und inaktive Slots, um sicherzustellen, dass Sie das mathematisch korrekte optimale **Layout** finden.
* **Intelligente Supercharged-Slot-Auslastung:** Der Optimierer erkennt nicht nur Supercharged-Slots – er verhält sich wie ein erfahrener Spieler und bestimmt intelligent, ob eine Kerntechnologie (wie eine Haupt-Pulse Engine) oder ihr leistungsstärkstes Upgrade-Modul diese High-Boost-Slots belegen soll. Es navigiert durch die komplexen Kompromisse, um Ihr spezifisches Ziel perfekt zu maximieren (z. B. Sprungreichweite, Waffenschaden oder Mobilität).
* **Fortgeschrittenes KI-Lernen:** Basierend auf **Machine-Learning-Inferenz** aus über 16.000 historischen Rasterlayouts.
* **Sorgfältige Layout-Verfeinerung:** Der **Advanced Simulated Annealing**-Prozess stellt sicher, dass jeder mögliche Prozentpunkt der Leistung aus Ihrer Ausrüstung herausgeholt wird.

## Warum diesen **NMS-Rechner** verwenden?

Schluss mit dem endlosen manuellen Ausprobieren! Schöpfen Sie das wahre Potenzial Ihrer Ausrüstung aus, egal ob Sie einen **Raumschiff-Build** mit maximalem Schaden, den **Frachter-Layout mit der größten Reichweite**, einen leistungsstarken **Corvette-Build**, die ultimative Scan-Reichweite mit einem perfekten **Multitool-Layout**, ein optimiertes **Exocraft** oder einen robusten **Exosuit** bauen.

Dieser **Optimierer** entmystifiziert die komplexen Regeln von **Adjazenzboni** und **Supercharged-Slot-Interaktionen**. Es bietet eine klare und effiziente Möglichkeit, jedes Upgrade sicher zu planen. Wenn Sie sich jemals gefragt haben, wie Sie Ihre begrenzten **supergeladenen Slots** am besten nutzen können, bietet dieses Tool die endgültige Antwort.

---

## Tech-Stack

* **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
* **Backend-Solver:** Python-, Flask-, TensorFlow-, NumPy- und Rust-basierte benutzerdefinierte simulierte Annealing- und heuristische Scoring-Implementierungen.
* **Testen:** Vitest, Python Unittest
* **Bereitstellung:** Heroku (Hosting), Cloudflare (DNS und CDN), Docker
* **Automatisierung:** GitHub-Aktionen (CI/CD)
* **Analytics:** Google Analytics

## Repositorys

* Web-Benutzeroberfläche: [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
* Backend: [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

---

## ❓Häufig gestellte Fragen

### Was ist ein Adjazenzbonus in No Man's Sky?

Ein **Nachbarschaftsbonus** ist eine deutliche Leistungssteigerung, die Sie erhalten, wenn kompatible Technologiemodule in Ihrem Inventarraster direkt nebeneinander platziert werden. Der NMS Optimizer berechnet die optimale Anordnung, um diese Boni für alle Ihre Technologien zu maximieren und so eine maximale Wirkung zu erzielen.

### Wie funktionieren Supercharged-Slots?

**Supercharged-Slots** sind selten (auf den meisten Plattformen auf 4 pro Raster begrenzt) und bieten jedem darin platzierten Technologiemodul einen enormen Schub von ca. 25–30 %. Sie sind von strategischer Bedeutung. Der Optimierer hilft Ihnen bei der Entscheidung, ob Sie eine Kerntechnologie oder ihre besten Upgrades in diesen Slots platzieren, um Ihre Gesamtleistung zu maximieren.

### Welche Geräte unterstützt der Optimierer?

Der Optimierer unterstützt alle wichtigen **No Man's Sky**-Geräte:

* **Raumschiffe** (Standard, Exotisch, Sentinel, Solar, Living)
* **Korvetten** (einschließlich einzigartiger Reaktor- und Kosmetikmodule)
* **Multitools** (Standard, Exotic, Atlantid, Sentinel, Staves)
* **Exocraft** (alle Typen einschließlich Minotaurus)
* **Exoanzüge**
* **Frachter**

### Wie genau ist der Optimierer?

Es ist **extrem genau**. Das Tool nutzt eine Kombination aus bewährten Mustern, maschinellem Lernen, das auf mehr als 16.000 Layouts trainiert wurde, und einer Verfeinerung durch simuliertes Tempern. Es berücksichtigt jeden Faktor – einschließlich **Adjacency-Boni**, **Supercharged-Slots** und Modulplatzierungsregeln –, um das mathematisch **optimale Layout** für Ihre spezifische Konfiguration zu finden.

### Ist die Nutzung des Optimierers kostenlos?

Ja! Der **NMS Optimizer** ist völlig kostenlos, werbefrei und Open Source. Es ist keine Registrierung oder Zahlung erforderlich.

### Kann ich meine Builds speichern und teilen?

Absolut! Sie können Ihre optimierten Layouts als „.nms“-Dateien speichern, sie später erneut laden oder gemeinsam nutzbare Links generieren, um sie an Freunde zu senden. Alle Builds werden auf Integrität und Kompatibilität validiert.

---

## Eine lustige Geschichte

Hier ist ein Blick auf eine **frühe Version** der Benutzeroberfläche – funktional solide, aber optisch minimalistisch. Die aktuelle Version stellt eine gewaltige Verbesserung in Design, Benutzerfreundlichkeit und Klarheit dar und hilft Spielern, schnell das **beste Layout** für jedes Schiff oder Werkzeug zu finden.

![Früher Prototyp der Benutzeroberfläche für die Layoutoptimierung von No Man's Sky](/assets/img/screenshots/screenshot_v03.png)