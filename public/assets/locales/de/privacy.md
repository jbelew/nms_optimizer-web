# NMS Optimizer Datenschutzrichtlinie: Ihre Daten & Sicherheit

**Zuletzt aktualisiert:** 16. März 2026

Ihre Privatsphäre ist uns wichtig. Diese Datenschutzrichtlinie erklärt, wie **NMS Optimizer** („wir“, „uns“ oder „unser“) Ihre Informationen sammelt, verwendet und schützt, wenn Sie unsere Webanwendung und die zugehörige Optimierungs-Engine nutzen.

---

## 1. Datenerfassung

NMS Optimizer ist als datenschutzorientiertes Tool konzipiert.

- **Keine persönlichen Informationen:** Wir erfassen keine persönlich identifizierbaren Informationen (PII) wie Ihren Namen, Ihre E-Mail-Adresse oder Ihre physische Adresse. Es gibt kein Login- oder Kontosystem.
- **Lokaler Speicher:** Die Anwendung verwendet den **LocalStorage** Ihres Browsers, um Ihre Präferenzen und den Build-Zustand zu speichern. Diese Daten verbleiben auf Ihrem Gerät und werden nicht an unsere Server übertragen oder von uns gespeichert.
- **Anonyme Nutzungsdaten:** Wir verwenden **Google Analytics**, um anonyme Nutzungsstatistiken (wie Seitenaufrufe und Feature-Interaktionen) zu erfassen. Diese Daten werden aggregiert und identifizieren Sie nicht persönlich.

## 2. Technische Infrastruktur & Überwachung

Um sicherzustellen, dass die Anwendung sicher, schnell und fehlerfrei ist, nutzen wir die folgenden Dienstleister:

- **Cloudflare:** Unsere Anwendung wird über Cloudflare gehostet und gesichert. Cloudflare verarbeitet IP-Adressen und technische Metadaten, um DDoS-Schutz zu bieten und die Inhaltsbereitstellung zu optimieren.
- **Heroku (Salesforce):** Unsere interne Optimierungs-API wird auf Heroku gehostet. Heroku verarbeitet technische Anfragedaten und führt Standard-Serverprotokolle (z. B. IP-Adressen und Zeitstempel), um sicherzustellen, dass die API betriebsbereit und sicher bleibt.
- **Sentry:** Wir verwenden Sentry zur Fehlerüberwachung. Wenn die Anwendung einen Fehler aufweist, wird ein technischer Bericht an Sentry gesendet. Diese Berichte sind so konfiguriert, dass sie Ihre persönlichen Daten ausschließen und werden ausschließlich zur Fehlerbehebung verwendet.

## 3. Datenverarbeitung (Interne API)

NMS Optimizer interagiert mit einer dedizierten API, die von uns erstellt und auf Heroku gehostet wird, um Technologie-Layout-Berechnungen durchzuführen.

- **Zweck:** Wenn Sie eine Optimierung durchführen, werden die technischen Parameter der Technologie und Ihres Raster-Layouts an diese API gesendet.
- **Datenschutz:** Diese Interaktion ist rein funktional. Es werden keine persönlichen Daten oder dauerhaften Benutzerkennungen mit diesen Anfragen gesendet. Daten werden im Arbeitsspeicher verarbeitet und nicht in einer Datenbank gespeichert.

## 4. Datensicherheit

Wir implementieren angemessene Sicherheitsmaßnahmen, einschließlich **SSL/TLS-Verschlüsselung** für alle Daten während der Übertragung (über Cloudflare und Heroku), um die Integrität der Anwendung zu schützen.

## 5. Ihre Kontrolle

Da Ihr Anwendungsstatus lokal gespeichert wird:

- **So löschen Sie Ihre Daten:** Löschen Sie einfach die „Website-Daten“ oder den Cache Ihres Browsers für diese Domain.
- **So deaktivieren Sie das Tracking:** Sie können Browser-Erweiterungen (wie uBlock Origin) verwenden, um die Erfassung von Nutzungsdaten zu verhindern, ohne die Funktionalität der App zu beeinträchtigen.

## 6. Änderungen dieser Richtlinie

Wir können unsere Datenschutzrichtlinie von Zeit zu Zeit aktualisieren. Wir werden Sie über Änderungen informieren, indem wir das Datum der „Letzten Aktualisierung“ oben auf dieser Seite aktualisieren.

## 7. Kontakt

Wenn Sie Fragen zu dieser Datenschutzrichtlinie haben, können Sie uns über [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues) kontaktieren.
