# NMS-Optimierer Anleitung: Nutzung, Module & überladene Slots

## Erste Schritte mit dem Raster

- Wähle eine **Plattform** (Raumschiff, Multitool, Korvette, etc.) über das <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon> Icon aus.
- **Klicke** oder **doppeltippe** (Mobil) auf einen Slot, um ihn als **Überladen** zu markieren.
- **Strg+Klick (Windows) / ⌘+Klick (Mac) / einfaches Tippen (Mobil)**, um einen Slot zwischen **aktiv** und **inaktiv** umzuschalten.
- Nutze die **Reihen-Schalter**, um ganze Reihen zu aktivieren oder zu deaktivieren. *(Die Schalter werden deaktiviert, sobald Module platziert sind).*
- Nutze den **Modulauswahl-Button** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon>, um einzelne Module innerhalb einer Technologiegruppe hinzuzufügen oder zu entfernen.

> 💡 **Hinweis:**
> Exo-Anzüge und Exofahrzeuge haben feste Raster. Slots bei Exofahrzeugen können nicht modifiziert werden. Beim Exo-Anzug können nur die Aktiv/Inaktiv-Zustände geändert werden – das Layout der überladenen Slots ist fest vorgegeben.

## Bevor du beginnst

Dieses Tool ist für die **Endgame-Optimierung** gedacht und funktioniert am besten, wenn:

- Die meisten oder alle Slots des Rasters freigeschaltet sind.
- Alle relevanten Technologien verfügbar sind.
- Du **drei Upgrade-Module** pro Technologie besitzt.

Teilkonfigurationen werden unterstützt, aber die Ergebnisse sind auf voll aufgerüstete Plattformen optimiert.

## Tipps zur Nutzung

Überladene Slots sind begrenzt – ihre Platzierung ist entscheidend.

- **Weise nicht alle überladenen Slots der ersten Technologie zu, die du platzierst.** Dies blockiert oft stärkere Gesamtlayouts zu einem späteren Zeitpunkt.
- Beginne damit, **2–3 überladene Slots einer Technologie mit hoher Wirkung** zuzuweisen, nicht alle.
- Reserviere mindestens **einen oder mehrere überladene Slots** für eine **zweite wichtige Technologie**, um die Gesamteffektivität zu steigern.
- Sobald deine überladenen Slots verbraucht sind, priorisiere Technologien mit der **höchsten Modulanzahl**, bevor der Platz knapp wird.
- Überlass die Platzierung dem Optimierer; deine Aufgabe ist es, die **Prioritäten und Verteilung** festzulegen.

Wenn der Platz knapp wird, musst du möglicherweise zurücksetzen und die Technologien in einer anderen Reihenfolge optimieren, um eine **Optimierungswarnung** zu vermeiden.

## Profi-Tipp

Der Optimierer nutzt feste Fenster, deren Größe auf der Modulanzahl jeder Technologie basiert, um platzsparende Positionen zu finden.
Wenn die Ergebnisse nicht ideal sind, **deaktiviere Slots vorübergehend**, um den Optimierer zu einem besseren Layout zu führen.

## Theta / Tau / Sigma Labels

Diese Labels klassifizieren prozedurale Upgrades **nach ihren Werten**, nicht nach ihrer Klasse. Es handelt sich um klassische Begriffe, die zur Konsistenz beibehalten wurden.

- **Theta (1)** — beste Werte
- **Tau (2)** — mittelmäßig
- **Sigma (3)** — schwächer

Du wirst diese Labels nicht im Spiel sehen. Sie werden durch direkten Vergleich der Upgrade-Werte zugewiesen.

### Vergleich im Spiel

Ignoriere die Klassenbuchstaben (S, X, etc.) und vergleiche die Werte:

- Bestes → **Theta**
- Zweitbestes → **Tau**
- Schlechtestes → **Sigma**

**Die Klasse bestimmt nicht den Rang.** Ein X-Klasse Upgrade kann besser oder schlechter als ein S-Klasse Upgrade sein.

## Korvetten

Korvetten unterscheiden sich von anderen Plattformen: Sie können **bis zu drei separate Upgrade-Sets** haben.

- **Kosmetische Upgrades** werden als `Cn` angezeigt.
- **Reaktor-Upgrades** werden als `Rn` angezeigt.

Der Optimierer schlägt möglicherweise kosmetische Upgrades aufgrund der Leistung statt der Optik vor, wobei die Unterschiede meist minimal sind.

## Empfohlene Builds

Für **Exo-Anzüge** und **Exofahrzeuge** sind die überladenen Slots fest vorgegeben und die sinnvollen Layouts begrenzt.
Das Tool bietet **handverlesene empfohlene Builds**, welche die optimalen Kombinationen widerspiegeln.

Vorschläge und alternative Layouts sind über die Projektdiskussionen willkommen:
https://github.com/jbelew/nms_optimizer-web/discussions

## Speichern, Laden und Teilen

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Laden** — Lade eine gespeicherte `.nms`-Datei hoch, um ein Layout wiederherzustellen.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Speichern** — Lade das aktuelle Layout als `.nms`-Datei herunter.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Teilen** — Generiere einen Link, den andere direkt im Optimierer öffnen können.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Screenshot** — Erstelle einen Screenshot deines aktuellen Layouts.
