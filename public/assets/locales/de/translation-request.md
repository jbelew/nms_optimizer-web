# Hilf bei der Übersetzung des NMS Optimizers: Werde Teil unserer Community-Lokalisierung

## Hilf bei der Übersetzung des NMS Optimizers

Analysen zeigen Besucher aus der ganzen Welt, und ich möchte die App der globalen No Man's Sky-Community zugänglicher machen – und hier kommst du ins Spiel.

## Wie du helfen kannst

Ich suche zweisprachige Spieler, die bei der Übersetzung der App helfen – insbesondere beim **Bearbeiten und Korrekturlesen der KI-generierten französischen, deutschen, spanischen und portugiesischen Übersetzungen**, oder um an anderen Sprachen mit starken NMS-Spieler-Communities zu arbeiten.

Du musst kein professioneller Übersetzer sein – nur fließend, mit dem Spiel vertraut und bereit zu helfen. Obwohl KI-generierte Übersetzungen ein großartiger Ausgangspunkt sind, übersehen sie oft spielspezifischen Kontext oder Nuancen. Du wirst namentlich erwähnt (oder bleibst anonym, wenn du es vorziehst).

Die meisten Zeichenketten sind kurze UI-Beschriftungen, Tooltips oder lustige Statusmeldungen.

## Der Arbeitsablauf

Der NMS Optimizer verwendet jetzt einen **KI-basierten Übersetzungs-Workflow** unter Nutzung der Gemini 2.5 Flash API. Dies stellt sicher, dass jedes Mal, wenn der englische Inhalt aktualisiert wird, alle anderen unterstützten Sprachen innerhalb von Minuten automatisch aktualisiert werden.

Allerdings ist KI nicht perfekt. Wir verlassen uns auf die Community, um „Halluzinationen“ oder falsche NMS-Terminologie zu identifizieren und zu korrigieren.

## Wie du beitragen kannst

Der einfachste Weg, einen Beitrag zu leisten, ist direkt über GitHub. Du musst nicht programmieren können, um eine bessere Übersetzung vorzuschlagen.

1. **Finde die Datei**: Alle Lokalisierungsdateien befinden sich in `/public/assets/locales/[language_code]/`.
    - `translation.json`: UI-Beschriftungen, Tooltips und Statusmeldungen.
    - `*.md`: Inhalt für größere Dialoge (Über, Anweisungen usw.).
2. **Direkt auf GitHub bearbeiten**:
    - Navigiere zur Datei für deine Sprache (z.B. `/public/assets/locales/es/translation.json`).
    - Klicke auf das **Bleistiftsymbol (Diese Datei bearbeiten)**.
    - Nimm deine Änderungen vor.
    - Klicke auf **Änderungen committen...** und GitHub erstellt automatisch einen Pull Request für dich.
3. **Auf Zusammenführung warten**: Sobald ich deinen PR zusammenführe, erkennt das KI-Skript deine menschlichen Bearbeitungen automatisch und stellt sicher, dass sie bei zukünftigen Updates erhalten bleiben.

## Unterstützte Sprachen

Wir unterstützen derzeit:

- `en` (Englisch - Quelle)
- `es` (Spanisch)
- `fr` (Französisch)
- `de` (Deutsch)
- `pt` (Portugiesisch)

Wenn du eine **neue Sprache** hinzufügen möchtest, erstelle einfach einen neuen Ordner mit dem entsprechenden [ISO 639-1-Code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) und ich werde ihn zur Rotation der KI hinzufügen!

## Hinweise

- **Interpolation**: Du wirst Tags wie `<1></1>` oder `{{techName}}` sehen – **bitte behalte diese genau so bei**, da die App sie verwendet, um dynamische Inhalte oder Stile einzufügen.
- **Menschliche Priorität**: Das Übersetzungs-Skript ist so konzipiert, dass es menschliche Bearbeitungen respektiert. Wenn du einen Wert in einer JSON-Datei änderst, wird die KI ihn beim nächsten automatischen Durchlauf nicht überschreiben.

Vielen Dank, dass du hilfst, den No Man's Sky Technology Layout Optimizer für alle besser zu machen! Lass mich wissen, wenn du Fragen hast – ich helfe gerne.
