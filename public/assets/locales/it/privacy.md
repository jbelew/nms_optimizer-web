# Informativa sulla Privacy di NMS Optimizer: I Tuoi Dati e la Sicurezza

**Ultimo Aggiornamento:** 16 marzo 2026

La tua privacy è importante per noi. Questa Informativa sulla Privacy spiega come **NMS Optimizer** ("noi" o "nostro") raccoglie, utilizza e protegge le tue informazioni quando usi la nostra applicazione web e il suo motore di ottimizzazione associato.

---

## 1. Raccolta delle Informazioni

NMS Optimizer è progettato per essere uno strumento attento alla privacy.

- **Nessuna Informazione Personale:** Non raccogliamo informazioni di identificazione personale (PII) come il tuo nome, indirizzo email o indirizzo fisico. Non esiste un sistema di login o account.
- **Archiviazione Locale:** L'applicazione utilizza il **LocalStorage** del tuo browser per salvare le tue preferenze e lo stato della configurazione. Questi dati rimangono sul tuo dispositivo e non vengono trasmessi ai nostri server né archiviati da noi.
- **Dati di Utilizzo Anonimi:** Utilizziamo **Google Analytics** per raccogliere statistiche di utilizzo anonime (come visualizzazioni di pagina e interazione con le funzionalità). Questi dati sono aggregati e non ti identificano personalmente.

## 2. Infrastruttura Tecnica e Monitoraggio

Per garantire che l'applicazione sia sicura, veloce e priva di bug, utilizziamo i seguenti fornitori di servizi:

- **Cloudflare:** La nostra applicazione è ospitata e protetta tramite Cloudflare. Essi elaborano indirizzi IP e metadati tecnici per fornire protezione DDoS e ottimizzare la consegna dei contenuti.
- **Heroku (Salesforce):** La nostra API di ottimizzazione interna è ospitata su Heroku. Heroku elabora i dati tecnici delle richieste e mantiene i log standard del server (ad esempio, indirizzi IP e timestamp) per garantire che l'API rimanga operativa e sicura.
- **Sentry:** Utilizziamo Sentry per il monitoraggio degli errori. Se l'applicazione incontra un bug, un rapporto tecnico viene inviato a Sentry. Questi rapporti sono configurati per escludere i tuoi dati personali e sono utilizzati strettamente per il debugging.

## 3. Elaborazione dei Dati (API Interna)

NMS Optimizer interagisce con un'API dedicata, creata da noi e ospitata su Heroku, per eseguire i calcoli del layout delle tecnologie.

- **Scopo:** Quando esegui un'ottimizzazione, i parametri tecnici della tecnologia e il layout della tua griglia vengono inviati a questa API.
- **Privacy:** Questa interazione è strettamente funzionale. Nessun dato personale o identificatore utente persistente viene inviato con queste richieste. I dati vengono elaborati in memoria e non sono persistiti in un database.

## 4. Sicurezza dei Dati

Implementiamo misure di sicurezza ragionevoli, inclusa la **crittografia SSL/TLS** per tutti i dati in transito (tramite Cloudflare e Heroku), per proteggere l'integrità dell'applicazione.

## 5. Il Tuo Controllo

Poiché lo stato della tua applicazione è archiviato localmente:

- **Per eliminare i tuoi dati:** Basta cancellare i "Dati del sito" o la cache del tuo browser per questo dominio.
- **Per disattivare il tracciamento:** Puoi utilizzare estensioni del browser (come uBlock Origin) per impedire la raccolta di dati di utilizzo senza influenzare la funzionalità dell'app.

## 6. Modifiche a Questa Informativa

Potremmo aggiornare la nostra Informativa sulla Privacy di tanto in tanto. Ti informeremo di eventuali modifiche aggiornando la data di "Ultimo Aggiornamento" nella parte superiore di questa pagina.

## 7. Contattaci

Se hai domande su questa Informativa sulla Privacy, puoi contattarci tramite [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues).