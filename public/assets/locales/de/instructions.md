# NMS Optimizer Anweisungen: Modules & Supercharged Slots

## Erste Schritte mit dem Raster

- Wählen Sie einen **Plattformtyp** (Raumschiff, Multitool, Korvette usw.) über die Schaltfläche <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon> aus.
- **Klicken** oder **doppeltippen** (mobil) Sie auf einen leeren Slot, um seinen Status **Überladen** umzuschalten.
- **Strg-Klick** (Windows) / **⌘-Klick** (Mac) / **einfaches Tippen** (mobil) auf einen Slot, um ihn zwischen **aktiv** und **inaktiv** umzuschalten.
- **Tastatursteuerung:** Drücken Sie die **Pfeiltasten** (↑, ↓, ←, →) sowie **Pos1** / **Ende**, um den Fokus zu bewegen. Drücken Sie **S** oder **Umschalt+Eingabe**, um den Status **Überladen** umzuschalten. Drücken Sie **Leertaste** oder **Eingabe**, um zwischen **aktiv** und **inaktiv** umzuschalten.
- Verwenden Sie die **Reihen-Schalter**, um eine ganze Reihe zu aktivieren oder zu deaktivieren. _(Reihen-Schalter werden gesperrt, sobald Sie Module auf dem Raster platzieren.)_
- Klicken Sie auf die Schaltfläche **Modulauswahl** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> einer **Technologiekategorie**, um einzelne Module zu aktivieren oder zu deaktivieren und die erforderlichen Abmessungen des **Solver-Fensters** anzuzeigen.
- Schalten Sie den **Fokus-Modus** <radix-icon name="EyeOpenIcon" size="20" color="var(--accent-11)"></radix-icon> um, um visuelle Ablenkungen zu reduzieren und die Lesbarkeit des Textes zu verbessern.

> 💡 **Hinweis:**
> Exosuits und Exocraft haben feste Raster. Exocraft-Slots können nicht modifiziert werden. Bei Exosuits können nur aktive/inaktive Zustände geändert werden – Supercharged Slot-Layouts sind fest.

## Bevor Sie beginnen

Dieses Tool ist für die **Endgame-Optimierung** gedacht und funktioniert am besten, wenn:

- Die meisten oder alle Raster-Slots freigeschaltet sind.
- Alle relevanten Technologies verfügbar sind.
- Sie **drei Upgrade Modules** pro Technology haben.

Teilweise Setups werden unterstützt, aber die Ergebnisse sind für vollständig aufgerüstete Plattformen optimiert.

## Nutzungstipps

Supercharged Slots sind begrenzt – die Platzierung ist entscheidend.

- **Weisen Sie nicht alle Supercharged Slots der ersten Technology zu, die Sie platzieren.** Dies blockiert oft später stärkere Gesamt-Layouts.
- Beginnen Sie damit, **2–3 Supercharged Slots einer High-Impact Technology** zuzuweisen, nicht alle.
- Reservieren Sie mindestens **einen oder mehrere Supercharged Slots** für eine **zweite Prioritäts-Technology**, um die Gesamteffektivität zu verbessern.
- Sobald Sie alle Ihre Supercharged Slots verwendet haben, priorisieren Sie Technologies mit **größeren Module Counts**, bevor der Platz knapp wird.
- Lassen Sie den Solver die Platzierung übernehmen; Ihre Rolle ist es, **Prioritäten und Verteilung festzulegen**.

Wenn der Platz knapp wird, müssen Sie möglicherweise zurücksetzen und Technologies in einer anderen Reihenfolge lösen, um eine **Optimization Alert** zu vermeiden.

## Pro-Tipp

Der Solver verwendet feste Fenster, die an die Module Count jeder Technology angepasst sind, um platzsparende Platzierungen zu finden.
Wenn die Ergebnisse nicht ideal sind, **deaktivieren Sie temporär Slots**, um den Solver zu einem besseren Layout zu führen.

## Theta / Tau / Sigma Bezeichnungen

Diese Bezeichnungen ranken Procedural Upgrades **nach Stats**, nicht nach Class. Es sind veraltete Begriffe, die aus Konsistenzgründen beibehalten wurden.

- **Theta (1)** — beste Stats
- **Tau (2)** — mittel
- **Sigma (3)** — schwächste

Sie werden diese Bezeichnungen im Spiel nicht sehen. Sie werden durch den direkten Vergleich der Upgrade Stats zugewiesen.

### In-Game Vergleich

Ignorieren Sie Class-Buchstaben (S, X, etc.) und vergleichen Sie Stats:

- Beste → **Theta**
- Zweite → **Tau**
- Schlechteste → **Sigma**

**Class bestimmt nicht den Rang.** X-Class Upgrades können S-Class übertreffen oder unterbieten.

## Corvettes

Corvettes unterscheiden sich von anderen Plattformen: Sie können **bis zu drei separate Upgrade Sets** haben.

- **Cosmetic Upgrades** werden als `Cn` angezeigt.
- **Reactor Upgrades** werden als `Rn` angezeigt.

Der Solver kann Cosmetic Upgrades für die Leistung gegenüber dem Aussehen vorschlagen, obwohl die Unterschiede normalerweise gering sind.

## Empfohlene Builds

Für **Exosuits** und **Exocraft** sind Supercharged Slots fest und praktikable Layouts begrenzt.
Das Tool bietet **handverlesene empfohlene Builds**, die optimale Kombinationen widerspiegeln.

Vorschläge und alternative Layouts sind über die Projektdiskussionen willkommen:
<https://github.com/jbelew/nms_optimizer-web/discussions>

## Speichern, Laden und Teilen

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Laden** — Laden Sie eine gespeicherte `.nms`-Datei hoch, um ein Layout wiederherzustellen.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Speichern** — Laden Sie das aktuelle Layout als `.nms`-Datei herunter.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Teilen** — Erzeugen Sie einen Link, den andere direkt im Optimizer öffnen können.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Screenshot** — Erzeugen Sie einen Screenshot des aktuellen Layouts.
