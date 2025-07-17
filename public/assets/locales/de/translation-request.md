## Hilfe bei der Übersetzung des NMS Optimizers

Die App ist derzeit nur auf Englisch verfügbar, aber Analysen zeigen Besucher aus aller Welt. Ich würde sie gerne der globalen _No Man's Sky_-Community zugänglicher machen – und hier kommst du ins Spiel.

## Wie du helfen kannst

Ich suche bilinguale Spieler, die bei der Übersetzung der App helfen möchten – insbesondere beim Bearbeiten und Korrekturlesen der KI-generierten **französischen**, **deutschen** und **spanischen** Übersetzungen, oder um andere Sprachen mit starken NMS-Spieler-Communities zu bearbeiten.

Du musst kein professioneller Übersetzer sein – nur fließend sprechen, mit dem Spiel vertraut sein und bereit sein, zu helfen. Es wird definitiv besser sein als dieses ChatGPT-Durcheinander! Du wirst namentlich erwähnt (oder bleibst auf Wunsch anonym).

Die meisten Zeichenketten sind kurze UI-Beschriftungen, Tooltips oder lustige Statusmeldungen.

Übersetzungen werden mit [`i18next`](https://www.i18next.com/) verwaltet, mit einfachen JSON- und Markdown-Dateien.

## Wenn du mit GitHub vertraut bist

**Fork das Repo:**  
 [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)

**Aktualisiere oder erstelle die Übersetzungsdateien:**

- Applikations-UI-Beschriftungen befinden sich unter `/src/i18n/locales/[language_code]/translation.json`.
- Inhalte größerer Dialogfelder werden als reine Markdown-Dateien unter `/public/locales/[language_code]/` gespeichert.

Du kannst vorhandene Dateien aktualisieren oder einen neuen Ordner für deine Sprache unter Verwendung des [ISO 639-1 Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) (z.B. `de` für Deutsch) erstellen. Kopiere die relevanten Markdown- und JSON-Dateien in diesen Ordner und aktualisiere den Inhalt entsprechend.

> _Beispiel:_ Erstelle `/public/locales/de/about.md` für Dialoginhalte und `/src/i18n/locales/de/translation.json` für UI-Beschriftungen.

Sende einen **Pull Request**, wenn du fertig bist.

## Keine Lust auf Pull Requests?

Kein Problem – gehe einfach zur [GitHub Discussions Seite](https://github.com/jbelew/nms_optimizer-web/discussions) und starte einen neuen Thread.

Du kannst deine Übersetzungen dort einfügen oder Fragen stellen, wenn du nicht sicher bist, wo du anfangen sollst. Ich kümmere mich dann darum.

## Hinweise

`randomMessages` ist genau das – eine Liste zufälliger Nachrichten, die angezeigt werden, wenn die Optimierung länger als ein paar Sekunden dauert. Du musst nicht alle übersetzen, überlege dir einfach ein paar, die in deiner Sprache Sinn ergeben.

Vielen Dank, dass du dazu beiträgst, den _No Man's Sky Technology Layout Optimizer AI_ für alle besser zu machen! Lass mich wissen, wenn du Fragen hast – helfe gerne.
