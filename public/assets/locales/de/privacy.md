# NMS-Optimierer Datenschutz: Deine Daten und Sicherheit

**Zuletzt Aktualisiert:** 16. März 2026

Ihr Datenschutz ist uns wichtig. Diese Datenschutzbestimmungen erläutern, wie der **NMS-Optimierer** („wir“, „uns“ oder „unser“) Ihre Informationen sammelt, nutzt und schützt, wenn Sie unsere Web-App und den dazugehörigen Optimierungs-Service nutzen.

---

## 1. Datenerfassung
Der NMS-Optimierer wurde als datenschutzfreundliches Tool konzipiert.

* **Keine Personenbezogenen Daten:** Wir erfassen keine personenbezogenen Daten (PII) wie Ihren Namen, Ihre E-Mail-Adresse oder Ihre Postanschrift. Es gibt kein Login- oder Kontosystem.
* **Lokale Speicherung:** Die App nutzt den **LocalStorage** Ihres Browsers, um Ihre Einstellungen und den Status Ihrer Builds zu speichern. Diese Daten verbleiben auf Ihrem Gerät und werden weder an unsere Server übertragen noch von uns gespeichert.
* **Anonyme Nutzungsdaten:** Wir verwenden **Google Analytics**, um anonyme Nutzungsstatistiken zu sammeln (z. B. Seitenaufrufe und Interaktionen mit Funktionen). Diese Daten werden aggregiert und lassen keine Rückschlüsse auf Ihre Person zu.

## 2. Technische Infrastruktur Und Überwachung
Um sicherzustellen, dass die App sicher, schnell und fehlerfrei ist, nutzen wir folgende Dienstleister:

* **Cloudflare:** Unsere App wird über Cloudflare gehostet und geschützt. Cloudflare verarbeitet IP-Adressen und technische Metadaten, um DDoS-Schutz zu bieten und die Inhaltsbereitstellung zu optimieren.
* **Heroku (Salesforce):** Unsere interne Optimierungs-API wird auf Heroku gehostet. Heroku verarbeitet technische Anfragedaten und führt Standard-Serverprotokolle (z. B. IP-Adressen und Zeitstempel), um den Betrieb und die Sicherheit der API zu gewährleisten.
* **Sentry:** Wir nutzen Sentry für das Error-Monitoring. Sollte die App auf einen Fehler stoßen, wird ein technischer Bericht an Sentry gesendet. Diese Berichte sind so konfiguriert, dass sie keine persönlichen Daten enthalten und dienen ausschließlich der Fehlerbehebung.

## 3. Datenverarbeitung (Interne API)
Der NMS-Optimierer interagiert mit einer von uns entwickelten und auf Heroku gehosteten API, um die Technologie-Layout-Berechnungen durchzuführen.

* **Zweck:** Wenn Sie eine Optimierung durchführen, werden die technischen Parameter der Technologie und Ihr Raster-Layout an diese API gesendet.
* **Datenschutz:** Diese Interaktion ist rein funktional. Es werden keine persönlichen Daten oder dauerhaften Benutzerkennungen mit diesen Anfragen gesendet. Die Daten werden im Arbeitsspeicher verarbeitet und nicht in einer Datenbank gespeichert.

## 4. Datensicherheit
Wir setzen angemessene Sicherheitsmaßnahmen ein, einschließlich der **SSL/TLS-Verschlüsselung** für alle Daten während der Übertragung (über Cloudflare und Heroku), um die Integrität der Anwendung zu schützen.

## 5. Ihre Kontrolle
Da Ihr Anwendungsstatus lokal gespeichert wird:
* **Löschen Ihrer Daten:** Löschen Sie einfach die „Webseitendaten“ oder den Cache Ihres Browsers für diese Domain.
* **Opt-out Vom Tracking:** Sie können Browser-Erweiterungen (wie uBlock Origin) verwenden, um die Erfassung von Nutzungsdaten zu verhindern, ohne die Funktionalität der App zu beeinträchtigen.

## 6. Änderungen Dieser Bestimmungen
Wir können unsere Datenschutzbestimmungen von Zeit zu Zeit aktualisieren. Wir werden Sie über Änderungen informieren, indem wir das Datum der „Letzten Aktualisierung“ oben auf dieser Seite anpassen.

## 7. Kontakt
Wenn Sie Fragen zu diesen Datenschutzbestimmungen haben, können Sie uns über [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues) kontaktieren.
