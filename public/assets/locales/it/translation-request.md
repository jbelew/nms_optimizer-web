# Aiuta a tradurre NMS Optimizer: unisciti alla localizzazione della community

## Aiuta a tradurre NMS Optimizer

Le statistiche mostrano visitatori da tutto il mondo e mi piacerebbe rendere l'ottimizzatore accessibile alla community globale di _No Man's Sky_ — ed è qui che entri in gioco tu.

## Come puoi aiutare

Cerco giocatori bilingui che aiutino a revisionare e perfezionare le localizzazioni in **spagnolo, francese, tedesco, portoghese e italiano**, oppure a contribuire con nuove lingue supportate da solide community di giocatori di NMS.

Non devi essere un traduttore professionista — basta conoscere bene la lingua, avere familiarità con _No Man's Sky_ nella tua lingua e avere voglia di dare una mano. Sebbene le traduzioni assistite dall'IA offrano un'ampia copertura, i giocatori bilingui sono preziosissimi per cogliere sfumature espressive o verificare l'esatta terminologia ufficiale del gioco. Riceverai un riconoscimento nei crediti (o potrai restare anonimo, se preferisci).

La maggior parte delle stringhe consiste in brevi etichette dell'interfaccia, tooltip o simpatici messaggi di stato.

## Come contribuire

Il modo più semplice per contribuire è direttamente tramite GitHub. Non serve saper programmare per proporre una traduzione migliore:

1. **Trova il file**: Tutti i file di localizzazione si trovano in `/public/assets/locales/[language_code]/`:
    - `translation.json`: **Pacchetto lingua** contenente etichette dell'interfaccia, nomi del catalogo, tooltip e metadati delle pagine.
    - `*.md`: **Documenti di percorso localizzati** per guide complete e finestre informative (Informazioni, Istruzioni, ecc.).
2. **Modifica direttamente su GitHub**:
    - Apri il file della tua lingua (ad esempio, `/public/assets/locales/it/translation.json`).
    - Fai clic sull'**icona della matita (Edit this file)**.
    - Apporta le tue modifiche.
    - Fai clic su **Commit changes...** e GitHub ti guiderà nell'apertura di una Pull Request.

## Lingue supportate

Attualmente supportiamo:

- `en` (Inglese - Sorgente)
- `es` (Spagnolo)
- `fr` (Francese)
- `de` (Tedesco)
- `pt` (Portoghese)
- `it` (Italiano)

Se desideri aggiungere una **nuova lingua**, apri una issue o una Pull Request con una cartella denominata secondo il relativo [codice ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

## Note

- **Termini ufficiali di gioco**: I nomi di piattaforme, tecnologie e moduli devono corrispondere al testo ufficiale localizzato da Hello Games all'interno del gioco, anziché a traduzioni letterali dall'inglese.
- **Interpolazione**: Mantieni intatti i tag come `<1></1>`, `<strong></strong>`, `<icon/>` e i segnaposto come `{{techName}}` affinché la formattazione dinamica dell'interfaccia continui a funzionare.

Grazie per il tuo aiuto nel rendere No Man's Sky Technology Layout Optimizer migliore per tutti!
