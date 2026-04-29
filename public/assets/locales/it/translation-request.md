# Aiuta a Tradurre NMS Optimizer: Unisciti alla Nostra Localizzazione di Comunità

## Aiuta a Tradurre NMS Optimizer

Le analisi mostrano visitatori da tutto il mondo e mi piacerebbe renderlo più accessibile alla comunità globale di No Man's Sky — ed è qui che entri in gioco tu.

## Come Puoi Aiutare

Sono alla ricerca di giocatori bilingue che aiutino a tradurre l'app — in particolare per **revisionare e correggere le traduzioni generate dall'IA in francese, tedesco, spagnolo e portoghese**, o per lavorare su altre lingue con forti comunità di giocatori NMS.

Non è necessario essere un traduttore professionista — basta essere fluenti, avere familiarità con il gioco e essere disposti ad aiutare. Sebbene le traduzioni generate dall'IA siano un ottimo punto di partenza, spesso mancano di contesto o sfumature specifiche del gioco. Sarai accreditato (o rimarrai anonimo se preferisci).

La maggior parte delle stringhe sono brevi etichette UI, tooltip o divertenti messaggi di stato.

## Il Flusso di Lavoro

NMS Optimizer ora utilizza un **flusso di lavoro di traduzione AI-first** che impiega l'API Gemini 2.5 Flash. Questo assicura che ogni volta che il contenuto inglese viene aggiornato, tutte le altre lingue supportate vengano automaticamente aggiornate in pochi minuti.

Tuttavia, l'IA non è perfetta. Ci affidiamo alla comunità per identificare e correggere "allucinazioni" o terminologia NMS errata.

## Come Contribuire

Il modo più semplice per contribuire è direttamente tramite GitHub. Non è necessario saper programmare per suggerire una traduzione migliore.

1.  **Trova il file**: Tutti i file di localizzazione si trovano in `/public/assets/locales/[language_code]/`.
    -   `translation.json`: Etichette UI, tooltip e messaggi di stato.
    -   `*.md`: Contenuto per dialoghi più ampi (About, Instructions, ecc.).
2.  **Modifica direttamente su GitHub**:
    -   Naviga al file per la tua lingua (es. `/public/assets/locales/es/translation.json`).
    -   Clicca sull'**icona della matita (Edit this file)**.
    -   Apporta le tue modifiche.
    -   Clicca su **Commit changes...** e GitHub creerà automaticamente una Pull Request per te.
3.  **Attendi l'unione**: Una volta che avrò unito la tua PR, lo script AI rileverà automaticamente le tue modifiche umane e si assicurerà che vengano preservate durante i futuri aggiornamenti.

## Lingue Supportate

Attualmente supportiamo:

-   `en` (Inglese - Sorgente)
-   `es` (Spagnolo)
-   `fr` (Francese)
-   `de` (Tedesco)
-   `pt` (Portoghese)

Se desideri aggiungere una **nuova lingua**, crea semplicemente una nuova cartella con il codice [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) appropriato e la aggiungerò alla rotazione dell'IA!

## Note

-   **Interpolazione**: Vedrai tag come `<1></1>` o `{{techName}}` — **ti preghiamo di mantenerli esattamente come sono**, poiché l'app li usa per inserire contenuti dinamici o stili.
-   **Priorità Umana**: Lo script di traduzione è progettato per rispettare le modifiche umane. Se modifichi un valore in un file JSON, l'IA non lo sovrascriverà durante la successiva esecuzione automatica.

Grazie per aver contribuito a rendere No Man's Sky Technology Layout Optimizer migliore per tutti! Fammi sapere se hai domande — sono felice di aiutare.