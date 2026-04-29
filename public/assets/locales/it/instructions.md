# Istruzioni NMS Optimizer: Moduli e Slot Sovraccarichi

## Iniziare con la Griglia

- Seleziona una **Piattaforma** (Starship, Multi-Tool, Corvette, ecc.) usando l'icona <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Clicca** o **doppio tocco** (mobile) su uno slot per marcarlo come **Sovraccarico**.
- **Ctrl-clic (Windows) / ⌘-clic (Mac) / singolo tocco (mobile)** per attivare o disattivare uno slot.
- Usa gli **interruttori di riga** per abilitare o disabilitare intere righe. _(Gli interruttori di riga sono disabilitati una volta posizionati i moduli.)_
- Usa il pulsante di **selezione moduli** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> per aggiungere o rimuovere singoli moduli all'interno di un gruppo tecnologico.

> 💡 **Nota:**
> Le Exosuit e gli Exocraft hanno griglie fisse. Gli slot degli Exocraft non possono essere modificati. Sulle Exosuit, solo gli stati attivo/inattivo possono essere cambiati — i layout degli slot sovraccarichi sono fissi.

## Prima di Iniziare

Questo strumento è inteso per l'**ottimizzazione di fine gioco** e funziona al meglio quando:

- La maggior parte o tutti gli slot della griglia sono sbloccati.
- Tutte le tecnologie rilevanti sono disponibili.
- Hai **tre moduli di potenziamento** per tecnologia.

Le configurazioni parziali sono supportate, ma i risultati sono ottimizzati per piattaforme completamente potenziate.

## Consigli d'Uso

Gli slot sovraccarichi sono limitati — il posizionamento è importante.

- **Non assegnare tutti gli slot sovraccarichi alla prima tecnologia che posizioni.** Questo spesso blocca layout complessivi più forti in seguito.
- Inizia assegnando **2-3 slot sovraccarichi a una tecnologia ad alto impatto**, non tutti.
- Riserva almeno **uno o più slot sovraccarichi** per una **tecnologia di seconda priorità** per migliorare l'efficacia totale.
- Una volta utilizzati tutti gli slot sovraccarichi, dai priorità alle tecnologie con un **numero maggiore di moduli** prima che lo spazio diventi limitato.
- Lascia che il solutore gestisca il posizionamento; il tuo ruolo è **impostare priorità e distribuzione**.

Se lo spazio diventa ristretto, potresti dover resettare e risolvere le tecnologie in un ordine diverso per evitare un **Avviso di Ottimizzazione**.

## Suggerimento Pro

Il solutore utilizza finestre fisse dimensionate in base al numero di moduli di ogni tecnologia per trovare posizionamenti efficienti in termini di spazio.
Se i risultati non sono ideali, **disabilita temporaneamente gli slot** per guidare il solutore verso un layout migliore.

## Etichette Theta / Tau / Sigma

Queste etichette classificano i potenziamenti procedurali **in base alle statistiche**, non alla classe. Sono termini ereditati mantenuti per coerenza.

- **Theta (1)** — migliori statistiche
- **Tau (2)** — medie
- **Sigma (3)** — più deboli

Non vedrai queste etichette nel gioco. Sono assegnate confrontando direttamente le statistiche di potenziamento.

### Confronto nel Gioco

Ignora le lettere di classe (S, X, ecc.) e confronta le statistiche:

- Migliore → **Theta**
- Secondo → **Tau**
- Peggiore → **Sigma**

**La classe non determina il rango.** I potenziamenti di Classe X possono superare o essere inferiori a quelli di Classe S.

## Corvette

Le Corvette differiscono dalle altre piattaforme: possono avere **fino a tre set di potenziamenti separati**.

- I **potenziamenti estetici** sono mostrati come `Cn`.
- I **potenziamenti del reattore** sono mostrati come `Rn`.

Il solutore potrebbe suggerire potenziamenti estetici per le prestazioni piuttosto che per l'aspetto, sebbene le differenze siano solitamente minime.

## Costruzioni Raccomandate

Per le **Exosuit** e gli **Exocraft**, gli slot sovraccarichi sono fissi e i layout praticabili sono limitati.
Lo strumento fornisce **costruzioni raccomandate curate manualmente** che riflettono le combinazioni ottimali.

Suggerimenti e layout alternativi sono benvenuti tramite le discussioni del progetto:
https://github.com/jbelew/nms_optimizer-web/discussions

## Salvataggio, Caricamento e Condivisione

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Carica** — Carica un file `.nms` salvato per ripristinare un layout.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Salva** — Scarica il layout attuale come file `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Condividi** — Genera un link che altri possono aprire direttamente nell'optimizer.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Screenshot** — Genera uno screenshot del layout attuale.