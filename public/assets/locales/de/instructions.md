## Grundlegende Verwendung

- **Klicken oder tippen** Sie auf das ⚙️-Symbol, um Ihre **Plattform** auszuwählen (Raumschiffe, Multitools, Korvetten usw.).
- **Klicken oder doppeltippen** Sie auf eine Zelle, um sie als **Supercharged** zu markieren (bis zu 4 pro Raster).
- **Strg-Klick** (Windows) / **⌘-Klick** (Mac) oder **einmaliges Tippen** (auf Mobilgeräten), um den **aktiven** Status einer Zelle umzuschalten – aktive Zellen können Module enthalten.
- Verwenden Sie die **Zeilen-Umschaltschaltflächen**, um ganze Zeilen zu aktivieren oder zu deaktivieren. Reihenumschaltungen werden **deaktiviert, sobald Module platziert sind** und wieder aktiviert, wenn Sie **Reset Grid** drücken.

> 💡 **Hinweis:** Exosuits und Exocraft haben feste Gitterkonfigurationen. Exocraft-Zellen können überhaupt nicht verändert werden. Bei Exosuits können Sie Zellen nur aktiv oder inaktiv umschalten; Das Ändern des aufgeladenen Layouts wird nicht unterstützt.

## Builds speichern und laden

Sie können Ihre optimierten Layouts in einer Datei speichern und später erneut laden, sodass Sie problemlos mehrere Konfigurationen für dieselbe Plattform verwalten oder Builds mit Freunden teilen können.

- **Build speichern** – Klicken Sie auf das Speichersymbol, um Ihr aktuelles Layout als „.nms“-Datei herunterzuladen. Sie werden aufgefordert, Ihrem Build einen Namen zu geben. Das Tool generiert automatisch Themennamen wie „Corvette – Crusade of the Starfall.nms“, die Sie anpassen können.
- **Build laden** – Klicken Sie auf das Ladesymbol, um eine zuvor gespeicherte „.nms“-Datei hochzuladen. Ihr Raster wird sofort aktualisiert, um dem gespeicherten Layout zu entsprechen, einschließlich aller Modulplatzierungen und aufgeladenen Zellenpositionen.

Build-Dateien werden auf Integrität und Kompatibilität überprüft. Wenn ein Build von einem anderen Plattformtyp gespeichert wurde oder beschädigt ist, werden Sie vom Tool darüber informiert.

## Bevor Sie beginnen

Dieses Tool richtet sich an **Endgame-Spieler**, die das Technologielayout ihrer Plattform für maximale Effizienz optimieren möchten. Es funktioniert am besten, wenn:

- Sie haben **die meisten oder alle Zellen** auf Ihrer Plattform (Starship, Exosuit, Exocraft oder Multi-Tool) freigeschaltet.
- Sie haben Zugriff auf **alle relevanten Technologien**.
- Sie besitzen einen **vollständigen Satz von drei Upgrade-Modulen** pro anwendbarer Technologie.

Wenn Sie immer noch Zellen freischalten oder Module sammeln, kann das Tool immer noch Einblicke liefern – es ist jedoch in erster Linie für **vollständig aktualisierte Plattformen** konzipiert.

## Informationen zu Korvetten

Corvettes funktionieren etwas anders als andere Plattformen – statt nur einem Satz Upgrades können sie bis zu drei haben.

- **Kosmetische Upgrades** werden als „Cn“ angezeigt.
- **Reaktor-Upgrades** werden als „Rn“ angezeigt.

Der Solver schlägt auch die besten kosmetischen Upgrades vor, wenn Sie lieber Wert auf Leistung als auf Aussehen legen – in der Praxis sind die Kompromisse jedoch meist recht gering.

Bedenken Sie, dass ein vollständig aktualisiertes Corvette-Tech-Subsystem **viel** Platz einnimmt. Bei vollen 60 Technologie-Slots haben Sie normalerweise nur Platz für drei oder vier **Min/Max-Lösungen**, also wählen Sie mit Bedacht aus.

## Empfohlene Builds

Für Plattformen wie **Exosuits** und **Exocraft**, bei denen die aufgeladenen Zellen fest installiert sind, ist die Anzahl der realisierbaren Layouts **extrem begrenzt**. Anstatt uns mit Milliarden von Permutationen auseinanderzusetzen, wie wir es bei Raumschiffen oder Multitools tun, arbeiten wir mit nur einer Handvoll Best-Case-Möglichkeiten.

Dadurch kann das Tool **empfohlene Builds** anbieten – sorgfältig ausgewählte und äußerst eigenwillige Layouts, die die besten verfügbaren Kombinationen widerspiegeln. Das System unterstützt auch **mehrere Builds pro Plattform**, zugeschnitten auf verschiedene Anwendungsfälle. Zum Beispiel:

- Der **Minotaurus** enthält sowohl einen **Allzweck-Build** (für den Fall, dass Sie ihn aktiv steuern) als auch einen **dedizierten Build zur KI-Unterstützung** (optimiert für den Remote-Einsatz).

Andere Plattformen könnten **spezialisierte Varianten in der Zukunft** beinhalten – wie zum Beispiel ein **Pilgrim-Rennsetup** oder einen **Scanner-gestützten Exosuit** – abhängig vom Feedback und der Nachfrage der Benutzer.

Wenn Sie Feedback haben oder alternative Konfigurationen vorschlagen möchten, können Sie gerne [eine Diskussion starten](https://github.com/jbelew/nms_optimizer-web/discussions) – diese Builds werden kuratiert und nicht automatisch generiert, und der Input der Community hilft, sie zu verbessern.

## Nutzungstipps

Aufgeladene Zellen bieten große Vorteile, sind aber begrenzt – jede Platzierung zählt. **Vermeiden Sie eine blinde Anpassung an Ihr aufgeladenes In-Game-Layout.** Für beste Ergebnisse:

- **Beginnen Sie mit einer hochwirksamen Technologie** – einer, die zu Ihrem Spielstil passt und von zwei oder drei aufgeladenen Zellen profitiert, wie z. B. _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_ oder _Neutron Cannon_.
  Markieren Sie diese Zellen als überladen und lösen Sie sie dann.
- **Verwenden Sie Ihre verbleibenden aufgeladenen Zellen** für eine Technologie zweiter Priorität wie _Hyperdrive_, _Scanner_ oder _Mining Beam_ und lösen Sie die Aufgabe erneut. Boni zu verteilen ist normalerweise besser als sie alle auf eine Technologie zu stapeln.
- Nachdem Ihre Kerntechnologien gelöst sind, konzentrieren Sie sich auf diejenigen mit **größerer Modulanzahl** (z. B. _Hyperdrive_, _Starship Trails_), bevor Ihnen der zusammenhängende Platz ausgeht.
- Der Löser übernimmt die schwere Arbeit – Ihre Aufgabe ist es, basierend auf Ihrer Spielweise **Technologien zu priorisieren**.

Wenn der Platz im Raster knapp wird, müssen Sie möglicherweise **einige Technologien zurücksetzen** und sie in einer anderen Reihenfolge lösen, um die gefürchtete **Optimierungswarnung** zu vermeiden. Bei einem vollständig aufgerüsteten Raumschiff bleibt oft nur eine offene Zelle übrig – oder gar keine, wenn Sie einen **Abfangjäger** optimieren.

## Profi-Tipp

Hinter der Platzierung steckt echte Mathematik. Der Solver arbeitet innerhalb fester Fenster, basierend auf der Anzahl der Module, die eine Technologie erfordert, und wählt im Allgemeinen das effizienteste Layout aus, ohne Platz zu verschwenden. Aber wenn die Dinge nicht stimmen:

- Versuchen Sie, **einige Zellen zu deaktivieren**, um den Solver zu einem besseren Fenster zu führen.
- Eine kleine Anpassung kann wichtige Platzierungszonen freigeben und Ihr endgültiges Layout verbessern.