# Informazioni su NMS Optimizer: il calcolatore definitivo di layout tecnologici per No Man's Sky

**NMS Optimizer** è uno strumento 100% gratuito e senza pubblicità progettato per determinare esattamente dove posizionare i tuoi moduli tecnologici in _No Man's Sky_. Scegli il tuo equipaggiamento, selezioni i moduli di potenziamento di classe S o classe X, contrassegni gli slot sovralimentati e il nostro calcolatore genera quasi all'istante il layout che massimizza le tue statistiche di gioco.

Bilanciando alla perfezione le meccaniche di gioco, un layout ottimizzato ottiene in genere un punteggio **dal 15 al 20% più alto** rispetto a quanto la maggior parte dei giocatori riesce a disporre manualmente.

## Il problema: massimizzare i bonus di adiacenza e gli slot sovralimentati

_No Man's Sky_ non spiega esplicitamente i bonus di adiacenza e non offre alcuna guida sulla strategia per gli slot sovralimentati. Massimizzare la manovrabilità della tua astronave o il danno del tuo multi-tool significa destreggiarsi tra due sistemi complessi:

- **Bonus di adiacenza:** Quando posizioni moduli tecnologici compatibili uno accanto all'altro sulla griglia dell'inventario, ricevono un incremento delle statistiche. Tecnologie diverse hanno partner di adiacenza diversi: i potenziamenti delle armi si potenziano a vicenda, le tecnologie di movimento potenziano altre tecnologie di movimento e, più lati condivisi crei, maggiore sarà il bonus cumulativo.
- **Slot sovralimentati:** Questi rari slot dell'inventario (di solito fino a 4 per griglia) conferiscono un enorme moltiplicatore delle statistiche di circa il 25-30% a qualsiasi modulo vi sia posizionato all'interno.

Trovare la disposizione migliore in assoluto significa testare combinazioni tra milioni di possibili permutazioni, fino a circa 8,32 × 10⁸¹ per una griglia completamente espansa. Nessuno può risolverlo a mano.

## Come funziona il motore di ottimizzazione dei layout

Non ci affidiamo a tentativi. Il motore di NMS Optimizer utilizza una sofisticata pipeline in quattro fasi per trovare automaticamente la tua configurazione migliore:

1. **Corrispondenza di modelli:** Il risolutore parte da disposizioni testate manualmente e comprovate dalla community che ottengono punteggi elevati e affidabili per i set di moduli più comuni.
2. **Machine learning (IA):** Se la tua griglia ha slot sovralimentati unici, un modello di machine learning TensorFlow, addestrato su oltre 16.000 layout ad alto punteggio, prevede i posizionamenti più efficaci per le tue tecnologie principali rispetto ai moduli di potenziamento.
3. **Simulated annealing:** Il nostro motore di ottimizzazione principale, scritto in Rust, scambia rapidamente i moduli e testa migliaia di disposizioni in pochi millisecondi per salire verso il punteggio più alto in assoluto.
4. **Visualizzazione dei risultati:** Vedi immediatamente il layout vincente accompagnato dal dettaglio completo dei moltiplicatori di adiacenza.

## Equipaggiamento supportato

NMS Optimizer offre calcolo dinamico per ogni piattaforma principale del gioco:

- **Astronavi:** Navi standard, Esotiche, Intercettori Sentinella, Solari, Caccia e Viventi.
- **Multi-tool:** Tutte le varianti per armi ed estrazione, inclusi i Bastoni.
- **Exotute ed Exoscafi:** Tutte le tecnologie dell'Exotuta e tutti i tipi di veicoli (Nomade, Colosso, Pellegrino, Vagabondo, Minotauro, Nautilon).
- **Mercantili:** Iperguida dell'ammiraglia e tecnologie di coordinamento della flotta.
- **Corvette:** Supporto per layout complessi, inclusi moduli reattore unici e slot tecnologici estetici.

## Domande frequenti (FAQ)

**Cosa dovrei mettere nei miei slot sovralimentati?**
Dipende dal tuo layout! A volte conviene sovralimentare la tecnologia principale, mentre altre volte è meglio sovralimentare il potenziamento con i valori più alti. Il nostro modello IA è stato addestrato su oltre 16.000 layout reali proprio per prendere questa decisione al posto tuo.

**NMS Optimizer è gratuito?**
Sì. È gratuito al 100%, senza pubblicità e open source (GPL-3.0). Non devi creare un account né fornire un indirizzo email.

**Posso salvare e condividere i miei layout?**
Sì! Puoi salvare localmente le tue configurazioni preferite come file `.nms`, generare link condivisibili da inviare agli amici o condividere screenshot del layout ad alta qualità direttamente sui social media. L'integrità delle configurazioni viene verificata prima della condivisione.

**Perché lo strumento non mostra le statistiche di gioco?**
Lo strumento evita intenzionalmente di calcolare metriche di gioco standard come il DPS o la portata in anni luce. Poiché i valori esatti richiedono i seed nascosti delle astronavi, inaccessibili senza un editor di salvataggi, l'ottimizzatore si basa invece su un punteggio espresso come "percentuale del massimo".

**Perché il layout ottimizzato non include il mio specifico modulo da spedizione?**
NMS Optimizer supporta pienamente tutte le **ricompense di spedizione e spedizione Redux** introdotte dopo l'aggiornamento _Worlds Part I_. Tuttavia, poiché non tutti i giocatori possiedono questi oggetti rari, tali moduli opzionali non vengono inclusi per impostazione predefinita nei calcoli. Puoi attivarli facilmente per la tua configurazione aprendo l'**interfaccia Selezione moduli** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon>.

## Dietro le quinte: il nostro stack tecnologico

Per gli sviluppatori e gli appassionati di dati, ecco lo stack tecnologico che alimenta NMS Optimizer:

- **Frontend:** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Risolutore backend:** Python, Flask, TensorFlow, NumPy, Rust (alimenta il motore di simulated annealing e di calcolo del punteggio)
- **Testing:** Vitest, Python Unittest
- **Distribuzione e hosting:** Heroku (hosting API), Cloudflare (DNS/CDN), Docker
- **CI/CD:** GitHub Actions

### Repository open source

Vuoi contribuire? NMS Optimizer è interamente open source.

- Interfaccia web: [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend: [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Un enorme grazie alla community

Questo progetto non sarebbe possibile senza la straordinaria community di _No Man's Sky_. Un ringraziamento speciale a **George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, jayriley, arratikbehavior, Someone, Cal Abunga** e a chiunque altro abbia contribuito. Il vostro supporto, le donazioni, le condivisioni e le parole gentili significano moltissimo e aiutano a mantenere vivo questo progetto.

## Uno sguardo al passato: le prime versioni

![Prototipo iniziale dell'interfaccia utente dell'ottimizzatore di layout di No Man's Sky](/assets/img/screenshots/screenshot_v03.webp)
Se eri con noi fin dall'inizio, forse ricorderai l'aspetto dell'interfaccia nelle prime fasi alpha. Funzionava, ma il design era essenziale. La versione attuale rappresenta un miglioramento profondo e continuo nel design, nell'usabilità su dispositivi mobili e nella chiarezza complessiva.
