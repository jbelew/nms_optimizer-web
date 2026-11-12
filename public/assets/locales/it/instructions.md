# Istruzioni di NMS Optimizer: moduli e slot sovralimentati

## Primi passi con la griglia

- Seleziona un **Tipo di piattaforma** (Astronave, Multi-tool, Corvetta, ecc.) con il pulsante <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Fai clic** o **tocca due volte** (dispositivi mobili) uno slot vuoto per attivare o disattivare lo stato **Sovralimentato**.
- **Ctrl+clic** (Windows) / **⌘+clic** (Mac) / **tocco singolo** (dispositivi mobili) su uno slot per alternare lo stato **attivo** o **inattivo**.
- **Controlli da tastiera:** Premi i **tasti freccia** (↑, ↓, ←, →) e **Inizio** / **Fine** per spostare il focus. Premi **S** o **Shift+Invio** per attivare o disattivare lo stato **Sovralimentato**. Premi **Spazio** o **Invio** per alternare lo stato **attivo** o **inattivo**.
- Usa gli **interruttori di riga** per abilitare o disabilitare un'intera riga. _(Gli interruttori di riga si bloccano dopo aver posizionato moduli sulla griglia.)_
- Fai clic sul pulsante **Selezione moduli** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> di una **Categoria tecnologica** per abilitare o disabilitare i singoli moduli e visualizzare le dimensioni richieste della **Finestra di calcolo**.
- Attiva o disattiva la **Modalità focus** <radix-icon name="EyeOpenIcon" size="20" color="var(--accent-11)"></radix-icon> per ridurre le distrazioni visive e migliorare la leggibilità del testo.

> 💡 **Nota:**
> Alle Exotute e agli Exoscafi si applicano **Restrizioni degli slot**. Gli Exoscafi usano un **Layout predefinito della griglia** fisso in cui gli slot non possono essere modificati. Le Exotute hanno posizioni fisse per gli slot sovralimentati, quindi puoi modificare solo gli stati attivo e inattivo degli slot.

## Prima di iniziare

Questo strumento è progettato per l'**ottimizzazione di fine gioco** e produce i risultati migliori quando:

- La maggior parte o la totalità degli slot della griglia è attiva.
- Tutti i moduli di ciascuna **Categoria tecnologica** sono sbloccati.
- Possiedi **tre moduli di potenziamento procedurali** per ogni **Categoria tecnologica**.

Puoi ottimizzare anche configurazioni parziali, ma il risolutore è pensato per **Tipi di piattaforma** completamente potenziati.

## Consigli d'uso

Gli slot sovralimentati sono limitati. Distribuiscili tra più **Categorie tecnologiche** per ottenere il bonus complessivo più elevato:

- **Non assegnare tutti gli slot sovralimentati alla prima Categoria tecnologica.** Questo riduce il bonus disponibile per gli altri sistemi.
- Assegna **da 2 a 3 slot sovralimentati** alla tua **Categoria tecnologica** a priorità più alta.
- Riserva **1 o più slot sovralimentati** per una seconda **Categoria tecnologica**.
- Una volta occupati tutti gli slot sovralimentati, ottimizza per prime le **Categorie tecnologiche** che richiedono dimensioni maggiori della **Finestra di calcolo**.
- Imposta le tue priorità e lascia che il risolutore calcoli il posizionamento ottimale dei moduli.

### Finestra di calcolo e avvisi di ottimizzazione

Ogni **Categoria tecnologica** richiede una **Finestra di calcolo** (`larghezza × altezza`) basata sulla **Selezione moduli** attiva.

- Se nessuna regione contigua di slot attivi corrisponde alla **Finestra di calcolo** richiesta, compare un **Avviso di ottimizzazione** (**Modello non adattabile**).
- Dall'avviso puoi avviare una **Risoluzione forzata** (simulated annealing completo sugli slot disponibili) oppure annullare, usare **Ripristina** sulle categorie già posizionate e ottimizzarle in un ordine diverso.
- **Consiglio utile:** Imposta temporaneamente specifici slot come **inattivi** prima di ottimizzare per guidare il punto in cui viene posizionata la **Finestra di calcolo**.

## Ordine di rango dei moduli (Theta / Tau / Sigma)

L'**Ordine di rango dei moduli** (`Theta → Tau → Sigma`) classifica i moduli di potenziamento procedurali **in base al valore delle statistiche**, non alla classe del potenziamento:

- **Theta (1)** — statistiche più alte
- **Tau (2)** — statistiche intermedie
- **Sigma (3)** — statistiche più basse

Queste etichette non compaiono nel gioco. Confronta direttamente i valori delle statistiche dei tuoi potenziamenti procedurali:

- Statistiche più alte → **Theta**
- Seconde statistiche più alte → **Tau**
- Statistiche più basse → **Sigma**

**La classe del potenziamento non determina l'Ordine di rango dei moduli.** Un potenziamento di classe X può avere statistiche superiori o inferiori rispetto a un potenziamento di classe S.

## Corvette

Le Corvette supportano fino a **tre Gruppi di moduli di potenziamento separati** all'interno di una **Categoria tecnologica**:

- I **moduli estetici** usano l'etichetta `Cn`.
- I **moduli reattore** usano l'etichetta `Rn`.

Quando posiziona i moduli estetici, il risolutore dà priorità ai bonus alle statistiche rispetto all'aspetto visivo.

## Configurazioni consigliate

Le Exotute e gli Exoscafi hanno slot sovralimentati fissi e un numero inferiore di permutazioni di layout. Usa il menu **Configurazioni consigliate** per caricare layout curati per le combinazioni più comuni.

Invia suggerimenti sui layout o feedback nelle discussioni del progetto:
<https://github.com/jbelew/nms_optimizer-web/discussions>

## Salvataggio, caricamento e condivisione

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Carica configurazione** — Apri dal disco un **File di configurazione** `.nms` salvato.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Salva configurazione** — Scarica il layout attuale come **File di configurazione** `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Condividi configurazione** — Genera un URL di **Griglia condivisa** che apre il tuo layout nell'ottimizzatore.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Cattura screenshot della configurazione** — Cattura un'immagine PNG del layout attuale della griglia.
