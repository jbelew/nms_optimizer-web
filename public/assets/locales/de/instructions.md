# NMS Optimizer Anleitung: Module & turbogeladene Plätze

## Erste Schritte mit dem Raster

- Wähle über die Schaltfläche <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon> einen **Plattformtyp** aus (Raumschiff, Multiwerkzeug, Korvette usw.).
- **Klicke** oder **doppeltippe** (mobil) auf einen leeren Platz, um den Status **Turbogeladen** umzuschalten.
- Nutze **Strg+Klick** (Windows) / **⌘+Klick** (Mac) / **einfaches Tippen** (mobil) auf einen Platz, um ihn zwischen **aktiv** und **inaktiv** umzuschalten.
- **Tastatursteuerung:** Drücke die **Pfeiltasten** (↑, ↓, ←, →) sowie **Pos1** / **Ende**, um den Fokus zu bewegen. Drücke **S** oder **Umschalt+Eingabe**, um den Status **Turbogeladen** umzuschalten. Drücke **Leertaste** oder **Eingabe**, um zwischen **aktiv** und **inaktiv** umzuschalten.
- Verwende die **Reihen-Schalter**, um eine ganze Reihe zu aktivieren oder zu deaktivieren. _(Reihen-Schalter werden gesperrt, sobald du Module auf dem Raster platzierst.)_
- Klicke bei einer **Technologiekategorie** auf die Schaltfläche **Modulauswahl** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon>, um einzelne Module zu aktivieren oder zu deaktivieren und die erforderlichen Abmessungen des **Solver-Fensters** einzusehen.
- Schalte den **Fokus-Modus** <radix-icon name="EyeOpenIcon" size="20" color="var(--accent-11)"></radix-icon> um, um visuelle Ablenkungen zu reduzieren und die Lesbarkeit des Textes zu verbessern.

> 💡 **Hinweis:**
> Für Exo-Anzüge und Exo-Fahrzeuge gelten **Platzbeschränkungen**. Exo-Fahrzeuge verwenden ein festes **Standard-Rasterlayout**, bei dem Plätze nicht verändert werden können. Bei Exo-Anzügen sind die Positionen der turbogeladenen Plätze fest vorgegeben, sodass du nur zwischen aktiven und inaktiven Plätzen umschalten kannst.

## Bevor du beginnst

Dieses Tool ist auf **Endgame-Optimierung** ausgelegt und liefert die besten Ergebnisse, wenn:

- die meisten oder alle Rasterplätze aktiv sind,
- alle Module in jeder **Technologiekategorie** freigeschaltet sind,
- du über **drei prozedurale Upgrade-Module** pro **Technologiekategorie** verfügst.

Du kannst auch unvollständige Setups optimieren, der Solver ist jedoch auf voll ausgebaute **Plattformtypen** ausgelegt.

## Nutzungstipps

Turbogeladene Plätze sind begrenzt. Verteile sie auf mehrere **Technologiekategorien**, um den höchsten Gesamtbonus zu erzielen:

- **Weise nicht alle turbogeladenen Plätze der ersten Technologiekategorie zu.** Dadurch sinkt der verfügbare Bonus für andere Systeme.
- Weise deiner wichtigsten **Technologiekategorie** **2 bis 3 turbogeladene Plätze** zu.
- Reserviere **mindestens 1 turbogeladenen Platz** für eine zweite **Technologiekategorie**.
- Sobald alle turbogeladenen Plätze belegt sind, optimiere zuerst die **Technologiekategorien**, die ein größeres **Solver-Fenster** benötigen.
- Lege deine Prioritäten fest und überlass dem Solver die optimale Modulplatzierung.

### Solver-Fenster & Optimierungswarnungen

Jede **Technologiekategorie** benötigt abhängig von ihrer aktiven **Modulauswahl** ein **Solver-Fenster** (`Breite × Höhe`).

- Wenn kein zusammenhängender Bereich aktiver Plätze in das erforderliche **Solver-Fenster** passt, erscheint eine **Optimierungswarnung** (**Muster passt nicht**).
- Über die Warnung kannst du eine **Erzwungene Berechnung** (vollständiges Simulated Annealing über alle verfügbaren Plätze) starten oder abbrechen, bereits platzierte Kategorien über **Zurücksetzen** leeren und in einer anderen Reihenfolge optimieren.
- **Profi-Tipp:** Setze vor dem Optimieren gezielt einzelne Plätze vorübergehend auf **inaktiv**, um zu steuern, wo das **Solver-Fenster** platziert wird.

## Modul-Rangfolge (Theta / Tau / Sigma)

Die **Modul-Rangfolge** (`Theta → Tau → Sigma`) sortiert prozedurale Upgrade-Module **nach ihren Werten**, nicht nach ihrer Upgrade-Klasse:

- **Theta (1)** – höchste Werte
- **Tau (2)** – mittlere Werte
- **Sigma (3)** – niedrigste Werte

Diese Bezeichnungen erscheinen nicht im Spiel. Vergleiche direkt die Werte deiner prozeduralen Upgrades:

- Höchste Werte → **Theta**
- Zweithöchste Werte → **Tau**
- Niedrigste Werte → **Sigma**

**Die Upgrade-Klasse bestimmt nicht die Modul-Rangfolge.** Ein Upgrade der X-Klasse kann höhere oder niedrigere Werte als ein Upgrade der S-Klasse aufweisen.

## Korvetten

Korvetten unterstützen bis zu **drei separate Upgrade-Modulgruppen** innerhalb einer **Technologiekategorie**:

- **Kosmetische Module** tragen die Kennzeichnung `Cn`.
- **Reaktor-Module** tragen die Kennzeichnung `Rn`.

Beim Platzieren kosmetischer Module priorisiert der Solver Werteboni gegenüber dem optischen Erscheinungsbild.

## Empfohlene Builds

Exo-Anzüge und Exo-Fahrzeuge haben feste turbogeladene Plätze und weniger mögliche Layout-Varianten. Über das Menü **Empfohlene Builds** kannst du kuratierte Layouts für gängige Setups laden.

Layout-Vorschläge oder Feedback kannst du gerne in den Projektdiskussionen einreichen:
<https://github.com/jbelew/nms_optimizer-web/discussions>

## Speichern, Laden und Teilen

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Build laden** – Öffne eine gespeicherte `.nms`-**Build-Datei** von deinem Gerät.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Build speichern** – Lade das aktuelle Layout als `.nms`-**Build-Datei** herunter.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Build teilen** – Erzeuge eine **Geteiltes-Raster**-URL, mit der sich dein Layout direkt im Optimierer öffnen lässt.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Build-Screenshot aufnehmen** – Speichere ein PNG-Bild des aktuellen Raster-Layouts.
