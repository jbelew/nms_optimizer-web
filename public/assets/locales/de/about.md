# Über den NMS-Optimierer: Der ultimative No Man's Sky Technologie-Layout-Rechner

Der **NMS Optimizer** ist ein 100 % kostenloses, werbefreies Tool, das entwickelt wurde, um genau herauszufinden, wo du deine Technologie-Module in _No Man's Sky_ platzieren solltest. Du wählst deine Ausrüstung, wählst deine S-Klasse- oder X-Klasse-Upgrade-Module aus, markierst deine aufgeladenen Plätze (Supercharged Slots) und unser Rechner generiert fast sofort das Layout, das deine In-Game-Werte maximiert.

Durch die perfekte Ausbalancierung der Spielmechaniken erzielt ein optimiertes Layout typischerweise eine **15-20 % höhere** Punktzahl als das, was die meisten Spieler manuell arrangieren können.

## Das Problem: Maximierung von Adjazenz-Boni (Adjacency Bonuses) & aufgeladenen Plätzen

_No Man's Sky_ erklärt Adjazenz-Boni nicht ausdrücklich und bietet keine Anleitung zur Strategie für aufgeladene Plätze. Die Maximierung der Manövrierfähigkeit deines Raumschiffs oder des Schadens deines Multifunktionswerkzeugs erfordert das Jonglieren mit zwei komplexen Systemen:

- **Adjazenz-Boni:** Wenn du kompatible Technologie-Module nebeneinander auf dem Inventar-Raster platzierst, erhalten sie einen Werte-Boost. Verschiedene Technologien haben unterschiedliche Adjazenz-Partner — Waffen-Upgrades verstärken sich gegenseitig, Bewegungstechnologie verstärkt andere Bewegungstechnologie, und je mehr gemeinsame Kanten du erstellst, desto größer ist der kumulative Bonus.
- **Aufgeladene Plätze:** Diese seltenen Inventarplätze (normalerweise bis zu 4 pro Raster) geben einen massiven ~25-30%igen Werte-Multiplikator für jedes Modul, das darin platziert wird.

Die absolut beste Anordnung herauszufinden, bedeutet, Kombinationen über Millionen möglicher Permutationen hinweg zu testen — bis zu etwa 8.32 × 10⁸¹ für ein vollständig erweitertes Raster. Niemand löst das manuell.

## Wie die Layout-Optimierungs-Engine funktioniert

Wir verlassen uns nicht auf Vermutungen. Die Engine des NMS-Optimierers nutzt eine ausgeklügelte vierstufige Pipeline, um automatisch deinen besten Build zu finden:

1.  **Mustererkennung:** Der Solver beginnt mit manuell getesteten, von der Community bewährten Anordnungen, die für gängige Modulsätze zuverlässig gute Ergebnisse erzielen.
2.  **Maschinelles Lernen (KI):** Wenn dein Raster einzigartige aufgeladene Plätze hat, sagt ein TensorFlow-Modell für maschinelles Lernen — trainiert mit über 16.000 Layouts mit hohen Punktzahlen — die intelligentesten Platzierungen für deine Kerntechnologien im Vergleich zu deinen Upgrade-Modulen voraus.
3.  **Simulated Annealing:** Unsere Kern-Optimierungs-Engine, entwickelt in Rust, tauscht Module rasant aus und testet Tausende von Anordnungen in Millisekunden, um zur absolut höchstmöglichen Punktzahl aufzusteigen.
4.  **Ergebnisanzeige:** Du siehst sofort das Gewinner-Layout zusammen mit einer vollständigen Aufschlüsselung der Adjazenz-Multiplikatoren.

## Unterstützte Ausrüstung

Der NMS-Optimierer bietet dynamische Lösungsfindung für jede wichtige Plattform im Spiel:

- **Raumschiffe (Starships):** Standard-, Exotische (Exotic), Wächter-Abfangjäger (Sentinel Interceptor), Solar-, Jäger- (Fighter), Lebende (Living) und Atlantid-Schiffe.
- **Multifunktionswerkzeuge (Multi-Tools):** Alle Waffen- und Abbauvarianten, einschließlich Stäbe (Staves).
- **Exo-Anzüge (Exosuits) & Exofahrzeuge (Exocraft):** Alle Exo-Anzug-Technologien und Fahrzeugtypen (Nomad, Koloss, Pilgrim, Roamer, Minotaurus, Nautilon).
- **Frachter (Freighters):** Hyperantrieb und Flotten-Koordinationstechnologie von Großkampfschiffen.
- **Korvetten (Corvettes):** Unterstützung für komplexe Layouts, einschließlich einzigartiger Reaktormodule und kosmetischer Technologie-Slots.

## Häufig gestellte Fragen (FAQ)

**Was sollte ich in meine aufgeladenen Plätze legen?**
Das hängt von deinem Layout ab! Manchmal ist es am besten, deine Kerntechnologie aufzuladen, und manchmal ist es besser, dein Upgrade mit den höchsten Werten aufzuladen. Unser KI-Modell wurde mit über 16.000 echten Layouts trainiert, speziell um diese Entscheidung für dich zu treffen.

**Ist der NMS-Optimierer kostenlos?**
Ja. Es ist zu 100 % kostenlos, werbefrei und Open Source (GPL-3.0). Du musst kein Konto erstellen oder eine E-Mail-Adresse angeben.

**Kann ich meine Layouts speichern und teilen?**
Ja! Du kannst deine Lieblings-Builds lokal als `.nms`-Dateien speichern, teilbare Links generieren, um sie an Freunde zu senden, oder hochwertige Layout-Screenshots direkt in den sozialen Medien teilen. Builds werden vor dem Teilen auf Integrität geprüft.

**Warum zeigt das Tool keine In-Game-Werte an?**
Das Tool vermeidet absichtlich die Berechnung von Standard-In-Game-Metriken wie SPS oder Lichtjahre-Reichweite. Da genaue Zahlen verborgene Schiffs-Seeds erfordern, die ohne einen Save-Editor unzugänglich sind, verlässt sich der Optimierer stattdessen auf eine "Prozentual vom Maximum"-Punktzahl.

**Warum enthält das optimierte Layout nicht mein spezifisches Expeditionsmodul?**
Der NMS-Optimierer unterstützt vollständig alle **Expeditions- und Expeditions-Redux-Belohnungen**, die nach dem _Worlds Part I_-Update angeboten wurden. Da jedoch nicht alle Spieler diese seltenen Gegenstände besitzen, sind diese optionalen Module standardmäßig nicht in deinen Lösungen enthalten. Du kannst sie ganz einfach für deinen Build aktivieren, indem du die <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> **Modulauswahl-Schnittstelle** öffnest.

## Unter der Haube: Unser Tech-Stack

Für die Entwickler und Daten-Nerds ist hier der Tech-Stack, der den NMS-Optimierer antreibt:

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solver:** Python, Flask, TensorFlow, NumPy, Rust (treibt das Simulated Annealing und die Bewertungs-Engine an)
- **Tests:** Vitest, Python Unittest
- **Bereitstellung & Hosting:** Heroku (API-Hosting), Cloudflare (DNS/CDN), Docker
- **CI/CD:** GitHub Actions

### Open-Source-Repositories

Möchtest du beitragen? Der NMS-Optimierer ist vollständig Open Source.

- Web-UI: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Ein riesiges Dankeschön an die Community

Dieses Projekt wäre ohne die unglaubliche _No Man's Sky_-Community nicht möglich. Ein besonderer Dank geht an George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray und alle anderen, die beigetragen haben. Eure Unterstützung, Spenden, das Teilen und die freundlichen Worte bedeuten uns alles und helfen, dieses Projekt am Leben zu erhalten.

## Ein Rückblick: Frühe Versionen

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
Wenn du von Anfang an dabei warst, erinnerst du dich vielleicht daran, wie die Benutzeroberfläche in ihren frühen Alpha-Phasen aussah. Sie funktionierte, aber das Design war minimal. Die aktuelle Version stellt eine wesentliche, fortlaufende Verbesserung in den Bereichen Design, mobile Benutzerfreundlichkeit und allgemeine Übersichtlichkeit dar.
