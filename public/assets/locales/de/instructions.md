## Grundlegende Verwendung

- **Klicken oder tippen** Sie auf das ⚙️-Symbol, um Ihre **Plattform** auszuwählen (Raumschiffe, Multitools, Korvetten usw.).
- **Klicken oder doppeltippen** (auf Mobilgeräten), um eine Zelle als **Supercharged** zu markieren.
- **Strg-Klick** (Windows) / **⌘-Klick** (Mac) oder **einmaliges Tippen** (auf Mobilgeräten), um den **aktiven** Status einer Zelle umzuschalten.
- Verwenden Sie die **Zeilen-Umschaltschaltflächen**, um ganze Zeilen zu aktivieren oder zu deaktivieren. Reihenumschaltungen werden **deaktiviert, sobald Module platziert sind**.

> 💡 **Hinweis:** Exosuits und Exocraft haben feste Gitterkonfigurationen. Exocraft-Zellen können überhaupt nicht verändert werden. Bei Exosuits können Sie Zellen nur aktiv oder inaktiv umschalten; Das Ändern des aufgeladenen Layouts wird nicht unterstützt.

## Builds speichern, laden und teilen

Sie können Ihre optimierten Layouts speichern, sie später erneut laden oder mit Freunden teilen, sodass Sie problemlos mehrere Konfigurationen für dieselbe Plattform verwalten können.

- **Build speichern** – Klicken Sie auf das Speichersymbol, um Ihr aktuelles Layout als „.nms“-Datei herunterzuladen. Sie werden aufgefordert, Ihrem Build einen Namen zu geben. Das Tool generiert außerdem automatisch thematische Namen wie „Corvette – Crusade of the Starfall.nms“, die Sie anpassen können.
- **Build laden** – Klicken Sie auf das Ladesymbol, um eine zuvor gespeicherte „.nms“-Datei hochzuladen. Ihr Raster wird sofort aktualisiert, um dem gespeicherten Layout zu entsprechen, einschließlich aller Modulplatzierungen und aufgeladenen Zellenpositionen.
- **Build teilen** – Klicken Sie auf das Teilen-Symbol, um einen gemeinsam nutzbaren Link für Ihr aktuelles Layout zu generieren. Freunde können über diesen Link Ihren Build direkt in ihren Optimierer laden, ohne die Datei zu benötigen.

## Bevor Sie beginnen

Dieses Tool wurde für **Endgame-Spieler** entwickelt, die das Technologielayout ihrer Plattform für maximale Effizienz optimieren möchten. Es funktioniert am besten, wenn:

- Sie haben **die meisten oder alle Zellen** auf Ihrer Plattform (Starship, Exosuit, Exocraft oder Multi-Tool) freigeschaltet.
- Sie haben Zugriff auf **alle relevanten Technologien**.
- Sie besitzen einen **vollständigen Satz von drei Upgrade-Modulen** pro anwendbarer Technologie.

Wenn Sie immer noch Zellen freischalten oder Module sammeln, kann das Tool immer noch Einblicke liefern – es ist jedoch in erster Linie für **vollständig aktualisierte Plattformen** konzipiert.

## Informationen zu Korvetten

Corvettes funktionieren etwas anders als andere Plattformen – statt nur einem Satz Upgrades können sie bis zu drei haben.

- **Kosmetische Upgrades** werden als „Cn“ angezeigt.
- **Reaktor-Upgrades** werden als „Rn“ angezeigt.

Der Solver schlägt auch die besten kosmetischen Upgrades vor, wenn Sie lieber Wert auf Leistung als auf Aussehen legen – in der Praxis sind die Kompromisse jedoch meist recht gering.

## Empfohlene Builds

Für Plattformen wie **Exosuits** und **Exocraft**, bei denen die aufgeladenen Zellen fest installiert sind, ist die Anzahl der realisierbaren Layouts **extrem begrenzt**.
Dadurch kann das Tool **empfohlene Builds** anbieten – sorgfältig ausgewählte und äußerst eigenwillige Layouts, die die besten verfügbaren Kombinationen widerspiegeln.

Wenn Sie Feedback haben oder alternative Konfigurationen vorschlagen möchten, können Sie gerne [eine Diskussion starten](https://github.com/jbelew/nms_optimizer-web/discussions) – diese Builds werden kuratiert und nicht automatisch generiert, und der Input der Community hilft, sie zu verbessern.

## Nutzungstipps

Aufgeladene Zellen bieten große Vorteile, sind aber begrenzt – jede Platzierung zählt. **Vermeiden Sie eine blinde Anpassung an Ihr aufgeladenes In-Game-Layout.** Für beste Ergebnisse:

- **Beginnen Sie mit einer hochwirksamen Technologie** – einer, die zu Ihrem Spielstil passt und von zwei oder drei aufgeladenen Zellen profitiert, wie z. B. _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_ oder _Neutron Cannon_.
  Markieren Sie diese Zellen als überladen und lösen Sie sie dann.
- **Verwenden Sie Ihre verbleibenden aufgeladenen Zellen** für eine Technologie zweiter Priorität wie _Hyperdrive_, _Scanner_ oder _Mining Beam_ und lösen Sie die Aufgabe erneut. Boni zu verteilen ist normalerweise besser als sie alle auf eine Technologie zu stapeln.
- Nachdem Ihre Kerntechnologien gelöst sind, konzentrieren Sie sich auf diejenigen mit **größerer Modulanzahl** (z. B. _Hyperdrive_, _Starship Trails_), bevor Ihnen der zusammenhängende Platz ausgeht.
- Der Löser übernimmt die schwere Arbeit – Ihre Aufgabe ist es, basierend auf Ihrer Spielweise **Technologien zu priorisieren**.

Wenn der Platz im Raster knapp wird, müssen Sie möglicherweise **einige Technologien zurücksetzen** und sie in einer anderen Reihenfolge lösen, um die gefürchtete **Optimierungswarnung** zu vermeiden. Bei einem vollständig aufgerüsteten Raumschiff verfügen Sie oft über ein komplett vollständiges Gitter.

## Profi-Tipp

Hinter der Platzierung steckt echte Mathematik. Der Solver sucht nach festen Fenstern, die der Anzahl der Module entsprechen, die eine Technologie benötigt, und findet normalerweise das platzeffizienteste Layout. Wenn etwas nicht stimmt, versuchen Sie, **einige Zellen vorübergehend zu deaktivieren**, um es an eine bessere Stelle im Raster zu lenken.