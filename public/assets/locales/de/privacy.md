# NMS Optimizer Datenschutzrichtlinie: Deine Daten & Sicherheit

**Zuletzt aktualisiert:** 16. März 2026

Deine Privatsphäre ist uns wichtig. Diese Datenschutzrichtlinie erläutert, wie **NMS Optimizer** („wir“, „uns“ oder „unser“) deine Daten erfasst, nutzt und schützt, wenn du unsere Webanwendung und die zugehörige Optimierungs-Engine verwendest.

## 1. Datenerfassung

NMS Optimizer ist als datenschutzfreundliches Tool konzipiert.

- **Keine personenbezogenen Daten:** Wir erfassen keine personenbezogenen Daten (PII) wie deinen Namen, deine E-Mail-Adresse oder deine Anschrift. Es gibt weder einen Login noch ein Benutzerkonto.
- **Lokaler Speicher:** Die Anwendung nutzt den **LocalStorage** deines Browsers, um deine Einstellungen und deinen aktuellen Build-Status zu sichern. Diese Daten bleiben auf deinem Gerät und werden weder an unsere Server übertragen noch von uns gespeichert.
- **Anonyme Nutzungsdaten:** Wir setzen **Google Analytics** ein, um anonyme Nutzungsstatistiken (etwa Seitenaufrufe und Funktionsnutzung) zu erheben. Diese Daten werden aggregiert ausgewertet und lassen keine Rückschlüsse auf deine Person zu.

## 2. Technische Infrastruktur & Überwachung

Damit die Anwendung sicher, schnell und fehlerfrei läuft, greifen wir auf folgende Dienstleister zurück:

- **Cloudflare:** Unsere Anwendung wird über Cloudflare bereitgestellt und abgesichert. Cloudflare verarbeitet IP-Adressen und technische Metadaten, um DDoS-Schutz zu gewährleisten und die Auslieferung von Inhalten zu beschleunigen.
- **Heroku (Salesforce):** Unsere interne Optimierungs-API wird bei Heroku betrieben. Heroku verarbeitet technische Anfragedaten und führt übliche Serverprotokolle (z. B. IP-Adressen und Zeitstempel), um den sicheren Betrieb der API sicherzustellen.
- **Sentry:** Zur Fehlerüberwachung nutzen wir Sentry. Tritt in der Anwendung ein Programmfehler auf, wird ein technischer Bericht an Sentry übermittelt. Diese Berichte sind so konfiguriert, dass sie keine persönlichen Daten enthalten, und dienen ausschließlich der Fehlerbehebung.

## 3. Datenverarbeitung (Interne API)

Zur Berechnung von Technologie-Layouts kommuniziert NMS Optimizer mit einer eigenen, auf Heroku betriebenen API.

- **Zweck:** Wenn du eine Optimierung startest, werden die technischen Parameter der gewählten Technologie sowie dein Raster-Layout an diese API übertragen.
- **Datenschutz:** Diese Übertragung dient rein funktionalen Zwecken. Es werden weder personenbezogene Daten noch dauerhafte Benutzerkennungen mitgesendet. Die Verarbeitung erfolgt ausschließlich im Arbeitsspeicher; eine Speicherung in einer Datenbank findet nicht statt.

## 4. Datensicherheit

Wir treffen angemessene Sicherheitsvorkehrungen – darunter eine durchgehende **SSL/TLS-Verschlüsselung** sämtlicher Datenübertragungen (über Cloudflare und Heroku) –, um die Integrität der Anwendung zu schützen.

## 5. Deine Kontrolle

Da dein Anwendungsstatus lokal gespeichert wird, hast du jederzeit die volle Kontrolle:

- **Daten löschen:** Lösche in deinem Browser einfach die „Website-Daten“ oder den Cache für diese Domain.
- **Tracking unterbinden:** Du kannst Browser-Erweiterungen (wie uBlock Origin) verwenden, um die Erfassung anonymer Nutzungsdaten zu blockieren, ohne die Funktion der App einzuschränken.

## 6. Änderungen dieser Richtlinie

Wir können diese Datenschutzrichtlinie gelegentlich anpassen. Über Änderungen informieren wir dich, indem wir das Datum unter „Zuletzt aktualisiert“ oben auf dieser Seite erneuern.

## 7. Kontakt

Wenn du Fragen zu dieser Datenschutzrichtlinie hast, erreichst du uns jederzeit über [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues).
