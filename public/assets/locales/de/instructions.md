# NMS Optimizer Anweisungen: Modules & Supercharged Slots

## Erste Schritte mit dem Raster

- Wählen Sie eine **Plattform** (Starship, Multi-Tool, Corvette, etc.) über das <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon> Symbol aus.
- **Klicken** oder **doppeltippen** (mobil) Sie auf einen Slot, um ihn als **Supercharged** zu markieren.
- **Strg-Klick (Windows) / ⌘-Klick (Mac) / einfaches Tippen (mobil)**, um einen Slot als **aktiv** oder **inaktiv** umzuschalten.
- Verwenden Sie die **Reihen-Umschalter**, um ganze Reihen zu aktivieren oder zu deaktivieren. *(Reihen-Umschalter sind deaktiviert, sobald Modules platziert wurden.)*
- Verwenden Sie die Schaltfläche zur **Modul-Auswahl** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon>, um einzelne Modules innerhalb einer Technology-Gruppe hinzuzufügen oder zu entfernen.

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
https://github.com/jbelew/nms_optimizer-web/discussions

## Speichern, Laden und Teilen

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Laden** — Laden Sie eine gespeicherte `.nms`-Datei hoch, um ein Layout wiederherzustellen.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Speichern** — Laden Sie das aktuelle Layout als `.nms`-Datei herunter.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Teilen** — Erzeugen Sie einen Link, den andere direkt im Optimizer öffnen können.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Screenshot** — Erzeugen Sie einen Screenshot des aktuellen Layouts.