# NMS Optimizer: Rechner für technisches Layout und Adjazenzbonus für No Man's Sky

![Screenshot der NMS Optimizer-Anwendung, die ein Raumschiff-Technologieraster mit optimierter Modulplatzierung zeigt](/assets/img/screenshots/screenshot.png)

NMS Optimizer ermittelt, wo Ihre Technologiemodule platziert werden müssen, sodass Sie dies nicht tun müssen. Wählen Sie Ihre Plattform, wählen Sie Ihre Module aus, markieren Sie Ihre aufgeladenen Slots und der Optimierer berechnet das Layout, das Ihre Nachbarschaftsboni optimal nutzt. Es funktioniert für Raumschiffe, Korvetten, Multitools, Exosuits, Exocraft und Frachter.

## Was ist ein Adjacency-Bonus?

Wenn Sie in No Man's Sky kompatible Technologiemodule nebeneinander platzieren, erhalten sie einen Stat-Boost. Das Spiel verrät nicht viel darüber, wie das funktioniert, aber die Kurzfassung: Module des gleichen Typs, die einen gemeinsamen Vorteil haben, erhalten eine prozentuale Erhöhung ihrer Werte. Je mehr Kanten geteilt werden, desto größer ist der Bonus. Die richtige Anordnung von Hand herauszufinden, ist mühsam, insbesondere bei größeren Netzen mit überlasteten Steckplätzen.

## Was sind Supercharged-Slots?

Einige Inventarplätze in No Man's Sky sind überladen. Jedes darin platzierte Technologiemodul erhält zusätzlich zu den normalen Nachbarschaftsboni einen großen Statistikmultiplikator. Sie werden zufällig auf jedem Ausrüstungsteil platziert, sodass sich die optimale Anordnung je nachdem, wo Ihre aufgeladenen Slots gelandet sind, ändert. Das ist der schwierige Teil, und dieses Tool ist darauf ausgelegt, ihn zu lösen.

## Wie es funktioniert

Der Optimierer verwendet eine Kombination aus deterministischem Mustervergleich und simuliertem Tempern. Für kleinere Modulsätze kann das exakt beste Layout gefunden werden. Bei größeren oder komplexeren Gittern werden beim simulierten Tempern Tausende von Anordnungen untersucht, um eine zu finden, die die bestmögliche Punktzahl erreicht. Bei der Wertung werden Nachbarschaftsboni, die Platzierung von Super-Slots und modulspezifische Statistikgewichte berücksichtigt. Das Backend läuft aus Geschwindigkeitsgründen in Rust.

## Unterstützte Plattformen

- Raumschiffe (Standard, Sentinel, Solar, Jäger, lebend, Atlantis)
- Korvetten
- Multitools (Standard und Sentinel)
- Exoanzüge
- Exocraft (Wanderer, Pilger, Nomade, Koloss, Minotaurus, Nautilon)
- Frachter