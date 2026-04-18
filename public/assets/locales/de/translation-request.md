# Hilf bei der Übersetzung des NMS-Optimierers: Werde Teil unserer Community-Lokalisierung

## Hilf Bei Der Übersetzung Des NMS-Optimierers

Unsere Statistiken zeigen Besucher aus der ganzen Welt und ich würde die App gerne für die gesamte No Man's Sky Community zugänglich machen – und hier kommst du ins Spiel.

## Wie Du Helfen Kannst

Ich suche zweisprachige Spieler, die bei der Übersetzung der App helfen – insbesondere beim **Korrekturlesen der KI-generierten deutschen, französischen, spanischen und portugiesischen Übersetzungen** oder bei der Arbeit an neuen Sprachen mit starken NMS-Communitys.

Du musst kein professioneller Übersetzer sein – fließende Sprachkenntnisse, Vertrautheit mit dem Spiel und die Bereitschaft zu helfen genügen. Während KI-generierte Übersetzungen ein guter Startpunkt sind, fehlen ihnen oft der spielspezifische Kontext oder Nuancen. Du wirst namentlich erwähnt (oder bleibst auf Wunsch anonym).

Die meisten Texte sind kurze UI-Labels, Tooltips oder unterhaltsame Statusmeldungen.

## Der Workflow

Der NMS-Optimierer nutzt jetzt einen **KI-Gestützten Übersetzungs-Workflow** über die Gemini 2.5 Flash API. Dies stellt sicher, dass jedes Mal, wenn der englische Inhalt aktualisiert wird, alle anderen unterstützten Sprachen innerhalb weniger Minuten automatisch aktualisiert werden.

KI ist jedoch nicht perfekt. Wir verlassen uns auf die Community, um „Halluzinationen“ oder falsche NMS-Terminologie zu identifizieren und zu korrigieren.

## So Kannst Du Beitragen

Der einfachste Weg ist direkt über GitHub. Du musst nicht programmieren können, um eine bessere Übersetzung vorzuschlagen.

1. **Datei Finden**: Alle Lokalisierungsdateien befinden sich unter `/public/assets/locales/[sprach_code]/`.
   - `translation.json`: UI-Labels, Tooltips und Statusmeldungen.
   - `*.md`: Inhalte für größere Dialoge (Über uns, Anleitung, etc.).
2. **Direkt Auf GitHub Bearbeiten**: 
   - Navigiere zur Datei deiner Sprache (z. B. `/public/assets/locales/de/translation.json`).
   - Klicke auf das **Stift-Icon (Datei bearbeiten)**.
   - Nimm deine Änderungen vor.
   - Klicke auf **Commit changes...** und GitHub wird automatisch einen Pull Request für dich erstellen.
3. **Auf Merge Warten**: Sobald ich deinen PR merge, wird das KI-Skript deine manuellen Änderungen automatisch erkennen und sicherstellen, dass diese bei zukünftigen Updates erhalten bleiben.

## Unterstützte Sprachen

Wir unterstützen derzeit:
- `en` (Englisch - Quelle)
- `es` (Spanisch)
- `fr` (Französisch)
- `de` (Deutsch)
- `pt` (Portugiesisch)

Wenn du eine **Neue Sprache** hinzufügen möchtest, erstelle einfach einen neuen Ordner mit dem entsprechenden [ISO 639-1 Code](https://de.wikipedia.org/wiki/Liste_der_ISO-639-1-Codes) und ich füge sie zur KI-Rotation hinzu!

## Hinweise

- **Interpolation**: Du wirst Tags wie `<1></1>` oder `{{techName}}` sehen – **bitte behalte diese exakt so bei**, da die App sie nutzt, um dynamische Inhalte oder Styling einzufügen.
- **Menschliche Priorität**: Das Übersetzungs-Skript respektiert manuelle Änderungen. Wenn du einen Wert in einer JSON-Datei änderst, wird die KI diesen beim nächsten automatischen Durchlauf nicht überschreiben.

Vielen Dank für deine Hilfe, den No Man's Sky Technologie-Layout-Optimierer für alle besser zu machen! Lass es mich wissen, wenn du Fragen hast – ich helfe gerne weiter.
