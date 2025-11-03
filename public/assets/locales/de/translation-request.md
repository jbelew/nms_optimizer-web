## Helfen Sie bei der Übersetzung des NMS-Optimierers

Analysen zeigen Besucher aus der ganzen Welt, und ich würde es gerne der globalen No Man's Sky-Community zugänglicher machen – und hier kommen Sie ins Spiel.

## Wie Sie helfen können

Ich suche zweisprachige Spieler, die bei der Übersetzung der App helfen – insbesondere beim **Bearbeiten und Korrekturlesen der KI-generierten französischen, deutschen und spanischen Übersetzungen** oder bei der Arbeit an anderen Sprachen mit starken NMS-Spieler-Communitys.

Sie müssen kein professioneller Übersetzer sein – nur fließend, mit dem Spiel vertraut und bereit zu helfen. Es wird definitiv besser sein als dieses ChatGPT-Chaos! Sie werden genannt (oder bleiben anonym, wenn Sie es vorziehen).

Die meisten Zeichenketten sind kurze UI-Beschriftungen, Tooltips oder lustige Statusmeldungen.

Übersetzungen werden mit [`i18next`](https://www.i18next.com/) und einfachen JSON- und Markdown-Dateien verwaltet. Wir verwenden auch **Crowdin**, um kollaborative Übersetzungsbeiträge zu verwalten.

## Verwendung von Crowdin (empfohlen)

Wenn Sie den einfachsten Weg zum Beitragen suchen:

1. **Melden Sie sich bei Crowdin** unter [https://crowdin.com](https://crowdin.com/project/nms-optimizer) an und beantragen Sie den Zugriff auf das NMS-Optimierer-Projekt.
2. Nach der Genehmigung können Sie **bestehende Übersetzungen direkt in der Web-Benutzeroberfläche bearbeiten** oder Ihre eigenen Übersetzungen hochladen.
3. Crowdin verwaltet verschiedene Sprachen und stellt sicher, dass Ihre Updates automatisch mit der App synchronisiert werden.
4. Sie können sich auf das **Korrekturlesen bestehender Übersetzungen** oder das Hinzufügen neuer in Ihrer Sprache konzentrieren.

> Crowdin verwendet Standard-[ISO-Sprachcodes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes): `fr` für Französisch, `de` für Deutsch, `es` für Spanisch usw.

Dies ist der empfohlene Ansatz, wenn Sie mit GitHub nicht vertraut sind oder möchten, dass Ihre Änderungen sofort in der App angezeigt werden.

## Wenn Sie mit GitHub vertraut sind

**Forken Sie das Repo:**
[github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)

**Aktualisieren oder erstellen Sie die Übersetzungsdateien:**

- Die UI-Beschriftungen der Anwendung befinden sich in `/src/i18n/locales/[language_code]/translation.json`.
- Größere Dialogfeldinhalte werden als reine Markdown-Dateien in `/public/locales/[language_code]/` gespeichert.

Sie können vorhandene Dateien aktualisieren oder einen neuen Ordner für Ihre Sprache mit dem [ISO 639-1-Code](https://en.wikipedia.org/wiki/List_of-ISO_639-1-codes) (z. B. `de` für Deutsch) erstellen. Kopieren Sie die relevanten Markdown- und JSON-Dateien in diesen Ordner und aktualisieren Sie den Inhalt entsprechend.

> _Beispiel:_ Erstellen Sie `/public/locales/de/about.md` für Dialoginhalte und `/src/i18n/locales/de/translation.json` für UI-Beschriftungen.

**Senden Sie eine Pull-Anfrage**, wenn Sie fertig sind.

## Keine Lust auf Pull-Anfragen?

Kein Problem – gehen Sie einfach zur [GitHub-Diskussionsseite](https://github.com/jbelew/nms_optimizer-web/discussions) und starten Sie ein neues Thema.

Sie können Ihre Übersetzungen dort einfügen oder Fragen stellen, wenn Sie nicht sicher sind, wo Sie anfangen sollen. Ich übernehme es von dort.

## Notizen

`randomMessages` ist genau das – eine Liste von zufälligen Nachrichten, die angezeigt werden, wenn die Optimierung länger als ein paar Sekunden dauert. Sie müssen nicht alle übersetzen, sondern nur ein paar, die in Ihrer Sprache Sinn ergeben.

Vielen Dank, dass Sie dazu beitragen, den No Man's Sky Technology Layout Optimizer für alle besser zu machen! Lassen Sie mich wissen, wenn Sie Fragen haben – ich helfe gerne.
