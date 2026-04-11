# NMS-Optimierer: Technologie-Layouts & Adjazenz-Rechner Für No Man's Sky

![Screenshot der NMS-Optimierer-App, die ein Raumschiff-Technologieraster mit optimierter Modulplatzierung zeigt](/assets/img/screenshots/screenshot.png)

Der NMS-Optimierer berechnet, wo du deine Technologie-Module am besten platzierst, damit du es nicht tun musst. Wähle deine Plattform, selektiere deine Module, markiere deine überladenen Slots und der Optimierer berechnet das Layout, das deine Adjazenzboni maximiert. Funktioniert für Raumschiffe, Korvetten, Multitools, Exo-Anzüge, Exofahrzeuge und Frachter.

## Was Ist Ein Adjazenzbonus?

Wenn du kompatible Technologie-Module in No Man's Sky direkt nebeneinander platzierst, erhalten sie einen Stat-Boost. Das Spiel erklärt nicht viel darüber, wie das funktioniert, aber kurz gesagt: Module des gleichen Typs, die sich eine Kante teilen, erhalten eine prozentuale Steigerung ihrer Attribute. Je mehr Kanten geteilt werden, desto höher der Bonus. Die korrekte Anordnung von Hand zu finden ist mühsam, besonders in großen Rastern mit überladenen Slots.

## Was Sind Überladene Slots?

Einige Inventarplätze in No Man's Sky sind überladen. Jedes Technologie-Modul, das dort platziert wird, erhält einen großen Stat-Multiplikator zusätzlich zu den normalen Adjazenzboni. Da sie bei jedem Ausrüstungsstück zufällig platziert sind, ändert sich das optimale Layout je nachdem, wo sich diese Slots befinden. Das ist der schwierige Teil, für den dieses Tool entwickelt wurde.

## Wie Es Funktioniert

Der Optimierer nutzt eine Kombination aus deterministischem Musterabgleich und Simulated Annealing. Bei kleinen Modul-Sets kann er exakt das beste Layout finden. Bei größeren oder komplexeren Rastern erkundet das Simulated Annealing tausende Anordnungen, um diejenige mit der höchstmöglichen Punktzahl zu finden. Die Berechnung berücksichtigt Adjazenzboni, die Position überladener Slots und modulspezifische Stat-Gewichtungen. Das Backend läuft für maximale Geschwindigkeit in Rust.

## Unterstützte Plattformen

- Raumschiffe (Standard, Wächter, Solar, Kämpfer, Lebend, Atlantid)
- Korvetten
- Multitools (Standard und Wächter)
- Exo-Anzüge
- Exofahrzeuge (Streuner, Pilger, Nomade, Koloss, Minotaurus, Nautilon)
- Frachter
