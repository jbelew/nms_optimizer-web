# Hilfe zum NMS-Optimierer

## Grundlegende Verwendung

- Wählen Sie eine **Plattform** (Raumschiff, Multi-Tool, Corvette usw.) mit dem Symbol <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon> aus.
- **Klicken** oder **doppeltippen** (mobil) auf eine Zelle, um sie als **Supercharged** zu markieren.
- **Strg-Klick (Windows) / ⌘-Klick (Mac) / einmaliges Tippen (Mobilgerät)**, um eine Zelle zwischen **aktiv** und **inaktiv** umzuschalten.
- Verwenden Sie **Zeilenumschaltungen**, um ganze Zeilen zu aktivieren oder zu deaktivieren. *(Zeilenumschaltung wird deaktiviert, sobald Module platziert sind.)*
- Verwenden Sie die Schaltfläche **Modulauswahl** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon>, um einzelne Module innerhalb einer Technologiegruppe hinzuzufügen oder zu entfernen.

> 💡 **Hinweis:**
> Exosuits und Exocraft haben feste Gitter. Exocraft-Zellen können nicht verändert werden. Bei Exosuits können nur die aktiven/inaktiven Zustände geändert werden – aufgeladene Layouts sind behoben.

## Bevor Sie beginnen

Dieses Tool ist für die **Endgame-Optimierung** gedacht und funktioniert am besten, wenn:

- Die meisten oder alle Rasterzellen sind entsperrt.
- Alle relevanten Technologien sind verfügbar.
- Sie haben **drei Upgrade-Module** pro Technologie.

Teil-Setups werden unterstützt, die Ergebnisse sind jedoch für vollständig aktualisierte Plattformen optimiert.

## Theta / Tau / Sigma

Diese Labels ordnen prozedurale Upgrades **nach Statistiken**, nicht nach Klasse. Es handelt sich um veraltete Begriffe, die aus Konsistenzgründen beibehalten werden.

- **Theta (1)** – beste Statistiken
- **Tau (2)** – Mitte
- **Sigma (3)** – am schwächsten

Diese Beschriftungen werden im Spiel nicht angezeigt. Sie werden durch direkten Vergleich der Upgrade-Statistiken zugewiesen.

### Vergleich im Spiel

Ignorieren Sie Klassenbuchstaben (S, X usw.) und vergleichen Sie die Statistiken:

- Am besten → **Theta**
- Sekunde → **Tau**
- Am schlimmsten → **Sigma**

**Die Klasse bestimmt nicht den Rang.** X-Klasse-Upgrades können die Leistung der S-Klasse übertreffen oder unterschreiten.

## Korvetten

Corvettes unterscheiden sich von anderen Plattformen: Sie können **bis zu drei separate Upgrade-Sets** haben.

- **Kosmetische Upgrades** werden als `Cn` angezeigt.
- **Reaktor-Upgrades** werden als `Rn` angezeigt.

Der Löser schlägt möglicherweise kosmetische Upgrades für die Leistung statt für das Aussehen vor, obwohl die Unterschiede normalerweise geringfügig sind.

## Empfohlene Builds

Für **Exosuits** und **Exocraft** sind aufgeladene Zellen festgelegt und die möglichen Layouts sind begrenzt.
Das Tool bietet **handkuratierte empfohlene Builds**, die optimale Kombinationen widerspiegeln.

Vorschläge und alternative Layouts sind über die Projektdiskussionen willkommen:
https://github.com/jbelew/nms_optimizer-web/discussions

## Speichern, Laden und Teilen

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Laden** – Laden Sie eine gespeicherte „.nms“-Datei hoch, um ein Layout wiederherzustellen.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Speichern** – Laden Sie das aktuelle Layout als „.nms“-Datei herunter.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Share** – Generieren Sie einen Link, den andere direkt im Optimierer öffnen können.

## Nutzungstipps

Aufgeladene Zellen sind begrenzt – die Platzierung ist wichtig.

- Beginnen Sie mit **einer leistungsstarken Technologie**, die von mehreren aufgeladenen Zellen profitiert.
- Weisen Sie die verbleibenden aufgeladenen Zellen einer **Technologie zweiter Priorität** zu, anstatt alles an einem Ort zu stapeln.
- Priorisieren Sie Technologien mit **größerer Modulanzahl**, bevor der Platz knapp wird.
- Überlassen Sie die Platzierung dem Solver; Ihre Aufgabe ist es, **Prioritäten zu setzen**.

Wenn der Platz knapp wird, müssen Sie die Technologien möglicherweise zurücksetzen und in einer anderen Reihenfolge lösen, um eine **Optimierungswarnung** zu vermeiden.

## Profi-Tipp

Der Solver verwendet feste Fenster, deren Größe an die Modulanzahl jeder Technologie angepasst ist, um platzsparende Platzierungen zu finden.
Wenn die Ergebnisse nicht ideal sind, **deaktivieren Sie Zellen vorübergehend**, um den Solver zu einem besseren Layout zu führen.
