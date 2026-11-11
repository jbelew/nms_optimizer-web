# Über NMS Optimizer: Der ultimative No Man's Sky Technologie-Layout-Rechner

**NMS Optimizer** ist ein zu 100 % kostenloses, werbefreies Tool, das genau berechnet, wo du deine Technologiemodule in _No Man's Sky_ platzieren solltest. Du wählst deine Ausrüstung, bestimmst deine Upgrade-Module der S- oder X-Klasse, markierst deine turbogeladenen Plätze – und unser Rechner erstellt nahezu augenblicklich das Layout, das deine Werte im Spiel maximiert.

Durch das optimale Zusammenspiel der Spielmechaniken erzielt ein berechnetes Layout in der Regel **15–20 % höhere Werte** als eine manuelle Anordnung.

## Das Problem: Adjazenzboni & turbogeladene Plätze maximieren

_No Man's Sky_ erklärt Adjazenzboni im Spiel kaum und gibt keinerlei Hinweise zur optimalen Nutzung turbogeladener Plätze. Um die Manövrierfähigkeit deines Raumschiffs oder den Schaden deines Multiwerkzeugs auszureizen, musst du zwei komplexe Systeme gleichzeitig abwägen:

- **Adjazenzboni:** Platzierst du kompatible Technologiemodule auf dem Inventar-Raster nebeneinander, erhalten sie einen Wertebonus. Verschiedene Technologien harmonieren mit passenden Partnermodulen – Waffen-Upgrades verstärken einander, Bewegungstechnologie verstärkt Bewegungstechnologie, und je mehr gemeinsame Kanten entstehen, desto höher steigt der Gesamtbonus.
- **Turbogeladene Plätze:** Diese seltenen Inventarplätze (in der Regel bis zu 4 pro Raster) verleihen jedem darin platzierten Modul einen massiven Multiplikator von rund 25–30 % auf seine Werte.

Um die absolut beste Anordnung zu finden, müssten Kombinationen aus Millionen möglicher Permutationen getestet werden – bis zu rund 8,32 × 10⁸¹ bei einem voll ausgebauten Raster. Von Hand ist das unmöglich zu lösen.

## Wie die Layout-Optimierungs-Engine funktioniert

Wir verlassen uns nicht auf bloßes Raten. Die Engine des NMS Optimizers nutzt eine vierstufige Pipeline, um automatisch deinen besten Build zu finden:

1. **Mustererkennung:** Der Solver startet mit handgetesteten, in der Community bewährten Anordnungen, die für gängige Modulkombinationen zuverlässig starke Ergebnisse erzielen.
2. **Maschinelles Lernen (KI):** Besitzt dein Raster individuelle turbogeladene Plätze, prognostiziert ein mit über 16.000 Spitzen-Layouts trainiertes TensorFlow-Modell die klügsten Platzierungen für Kerntechnologien im Vergleich zu Upgrade-Modulen.
3. **Simulated Annealing:** Unsere in Rust entwickelte Kern-Engine tauscht Module rasant durch und prüft in Millisekunden Tausende Anordnungen, um sich zur höchstmöglichen Punktzahl vorzuarbeiten.
4. **Ergebnisanzeige:** Du siehst sofort das beste Layout samt einer vollständigen Aufschlüsselung der Adjazenz-Multiplikatoren.

## Unterstützte Ausrüstung

Der NMS Optimizer bietet dynamische Optimierung für jede wichtige Plattform im Spiel:

- **Raumschiffe:** Standard-, Exotik-, Wächter-Abfangjäger-, Solar-, Jäger- und Lebende Raumschiffe.
- **Multiwerkzeuge:** Alle Waffen- und Abbauvarianten einschließlich Stäben.
- **Exo-Anzüge & Exo-Fahrzeuge:** Alle Exo-Anzug-Technologien und Fahrzeugtypen (Nomade, Koloss, Pilger, Roamer, Minotaurus, Nautilon).
- **Frachter:** Hyperantrieb und Flotten-Koordinationstechnologie für Großkampfschiffe.
- **Korvetten:** Unterstützung komplexer Layouts einschließlich spezieller Reaktor-Module und kosmetischer Technologieplätze.

## Häufig gestellte Fragen (FAQ)

**Was gehört in meine turbogeladenen Plätze?**
Das hängt ganz von deinem Raster ab! Manchmal lohnt es sich mehr, die Kerntechnologie in einen turbogeladenen Platz zu setzen, und manchmal erzielt das Upgrade mit den besten Werten den höheren Gewinn. Unser KI-Modell wurde mit über 16.000 echten Layouts genau dafür trainiert, dir diese Entscheidung abzunehmen.

**Ist der NMS Optimizer kostenlos?**
Ja. Er ist zu 100 % kostenlos, werbefrei und Open Source (GPL-3.0). Du musst weder ein Konto anlegen noch eine E-Mail-Adresse angeben.

**Kann ich meine Layouts speichern und teilen?**
Ja! Du kannst deine Lieblings-Builds lokal als `.nms`-Dateien speichern, teilbare Links für Freunde erstellen oder hochwertige Layout-Screenshots direkt in sozialen Medien teilen. Vor dem Teilen werden Builds auf ihre Integrität geprüft.

**Warum zeigt das Tool keine exakten Spielwerte an?**
Das Tool verzichtet bewusst darauf, konkrete Anzeigewerte aus dem Spiel wie DPS oder Lichtjahre-Reichweite zu berechnen. Da exakte Zahlen verborgene Schiffs-Seeds voraussetzen, die ohne Save-Editor nicht einsehbar sind, arbeitet der Optimierer stattdessen mit einer Bewertung als „Prozentsatz vom Maximum“.

**Warum enthält das optimierte Layout nicht mein spezielles Expeditionsmodul?**
Der NMS Optimizer unterstützt sämtliche **Expeditions- und Expeditions-Redux-Belohnungen**, die seit dem Update _Worlds Part I_ erschienen sind. Da jedoch nicht alle Spieler diese seltenen Gegenstände besitzen, sind solche optionalen Module bei Berechnungen standardmäßig deaktiviert. Du kannst sie jederzeit für deinen Build zuschalten, indem du den Dialog <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> **Modulauswahl** öffnest.

## Unter der Haube: Unser Tech-Stack

Für Entwickler und Daten-Fans – dieser Tech-Stack treibt den NMS Optimizer an:

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend-Solver:** Python, Flask, TensorFlow, NumPy, Rust (betreibt das Simulated Annealing und die Bewertungs-Engine)
- **Tests:** Vitest, Python Unittest
- **Bereitstellung & Hosting:** Heroku (API-Hosting), Cloudflare (DNS/CDN), Docker
- **CI/CD:** GitHub Actions

### Open-Source-Repositories

Möchtest du mitwirken? Der NMS Optimizer ist vollständig Open Source.

- Web-UI: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Ein riesiges Dankeschön an die Community

Dieses Projekt wäre ohne die großartige _No Man's Sky_-Community nicht möglich. Ein besonderer Dank geht an **George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, jayriley, arratikbehavior, Someone, Cal Abunga** sowie an alle anderen Mitwirkenden. Eure Unterstützung, Spenden, geteilten Builds und freundlichen Worte bedeuten alles und halten dieses Projekt lebendig.

## Ein Rückblick: Frühe Versionen

![Früher Prototyp der Benutzeroberfläche des No Man's Sky Layout-Optimierers](/assets/img/screenshots/screenshot_v03.webp)
Wer von Anfang an dabei war, erinnert sich vielleicht noch daran, wie die Benutzeroberfläche in den frühen Alpha-Tagen aussah. Sie erfüllte ihren Zweck, war aber gestalterisch sehr schlicht. Die aktuelle Version steht für eine stetige Weiterentwicklung bei Design, mobiler Bedienbarkeit und Übersichtlichkeit.
