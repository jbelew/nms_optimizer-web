## Übersicht

Diese Webanwendung bietet eine interaktive Oberfläche zur Optimierung von Technologie-Layouts im Spiel _No Man's Sky_, insbesondere für Raumschiffe, Multi-Werkzeuge und Frachter. Das Tool konzentriert sich darauf, die **besten Tech-Layouts** zu identifizieren, indem es angrenzende Boni maximiert und überladene Slots nutzt – Kernstrategien zur Erzielung des **besten Raumschiff-Layouts**, des **besten Multi-Werkzeug-Layouts** oder des **besten Frachter-Layouts**.

## Funktionsweise

> Wie löst man ein Problem mit 479 Millionen möglichen Permutationen in unter 5 Sekunden?

Der Optimierungsprozess kombiniert deterministische Muster mit adaptiven Algorithmen, die auf die Technologie-Modulraster von No Man's Sky zugeschnitten sind:

1. **Musterbasierte Vorlösung:** Beginnt mit einer kuratierten Bibliothek von handgetesteten Layout-Mustern, die auf maximale angrenzende Boni über verschiedene Rastertypen hinweg optimieren.
2. **KI-gesteuerte Platzierung (ML-Inferenz):** Falls eine brauchbare Konfiguration überladene Slots enthält, ruft das Tool ein TensorFlow-Modell auf, das an über 16.000 Rastern trainiert wurde, um die optimale Platzierung vorherzusagen.
3. **Simuliertes Annealing (Verfeinerung):** Verfeinert das Layout durch stochastische Suche – tauscht Module und verschiebt Positionen, um die angrenzende Punktzahl zu erhöhen und gleichzeitig lokale Optima zu vermeiden.
4. **Ergebnispräsentation:** Gibt die Konfiguration mit der höchsten Punktzahl aus, einschließlich Punkteaufschlüsselungen und visuellen Layout-Empfehlungen für Raumschiffe, Multi-Werkzeuge und Frachter.

## Funktionen

- **Rasterbewusste Lösung:** Berücksichtigt überladene und inaktive Slots bei der Bestimmung der **besten Layout-Konfiguration**.
- **TensorFlow ML-Inferenz:** Sagt die optimale Technologieplatzierung basierend auf historischen Rasterdaten voraus.
- **Simuliertes Annealing:** Verbessert die Layout-Qualität durch Erkundung von Konfigurationsverschiebungen und angrenzungsbasierten Swaps.

## Technologie-Stack

**Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI  
**Backend-Solver:** Python, Flask, TensorFlow, NumPy, kundenspezifische Implementierung von simuliertem Annealing und heuristischer Bewertung  
**Tests:** Vitest, Python Unittest  
**Bereitstellung:** Heroku (Hosting) und Cloudflare (DNS und CDN)  
**Automatisierung:** GitHub Actions (CI/CD)  
**Analysen:** Google Analytics

## Repositories

- Web-UI: [nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Ein bisschen Spaßgeschichte

Hier ist ein Blick auf eine **frühe Version** der Benutzeroberfläche – funktional solide, aber visuell minimalistisch. Die aktuelle Version ist ein großes Upgrade in Design, Benutzerfreundlichkeit und Klarheit, das Spielern hilft, schnell das **beste Layout** für jedes Schiff oder Werkzeug zu finden.

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
