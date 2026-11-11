# Informativa sulla privacy di NMS Optimizer: i tuoi dati e la sicurezza

**Ultimo aggiornamento:** 16 marzo 2026

La tua privacy è importante per noi. Questa Informativa sulla privacy spiega come **NMS Optimizer** ("noi" o "nostro") raccoglie, utilizza e protegge le tue informazioni quando usi la nostra applicazione web e il relativo motore di ottimizzazione.

## 1. Raccolta delle informazioni

NMS Optimizer è progettato per essere uno strumento attento alla privacy.

- **Nessuna informazione personale:** Non raccogliamo informazioni di identificazione personale (PII) come nome, indirizzo email o indirizzo fisico. Non esiste alcun sistema di accesso o di account.
- **Archiviazione locale:** L'applicazione utilizza il **LocalStorage** del tuo browser per salvare le tue preferenze e lo stato della configurazione. Questi dati rimangono sul tuo dispositivo e non vengono trasmessi ai nostri server né memorizzati da noi.
- **Dati di utilizzo anonimi:** Utilizziamo **Google Analytics** per raccogliere statistiche di utilizzo anonime (come le visualizzazioni di pagina e l'interazione con le funzionalità). Questi dati sono aggregati e non ti identificano personalmente.

## 2. Infrastruttura tecnica e monitoraggio

Per garantire che l'applicazione sia sicura, veloce e priva di bug, ci avvaliamo dei seguenti fornitori di servizi:

- **Cloudflare:** La nostra applicazione è ospitata e protetta tramite Cloudflare, che elabora indirizzi IP e metadati tecnici per fornire protezione DDoS e ottimizzare la distribuzione dei contenuti.
- **Heroku (Salesforce):** La nostra API interna di ottimizzazione è ospitata su Heroku. Heroku elabora i dati tecnici delle richieste e conserva i normali log del server (ad esempio indirizzi IP e timestamp) per garantire che l'API rimanga operativa e sicura.
- **Sentry:** Utilizziamo Sentry per il monitoraggio degli errori. Se l'applicazione riscontra un bug, viene inviato un rapporto tecnico a Sentry. Questi rapporti sono configurati per escludere i tuoi dati personali e vengono usati esclusivamente per il debug.

## 3. Trattamento dei dati (API interna)

NMS Optimizer interagisce con un'API dedicata, sviluppata da noi e ospitata su Heroku, per eseguire i calcoli dei layout tecnologici.

- **Finalità:** Quando esegui un'ottimizzazione, i parametri tecnici della tecnologia e il layout della tua griglia vengono inviati a questa API.
- **Privacy:** Questa interazione è strettamente funzionale. Con queste richieste non vengono inviati dati personali né identificatori utente persistenti. I dati vengono elaborati in memoria e non vengono salvati in alcun database.

## 4. Sicurezza dei dati

Adottiamo misure di sicurezza ragionevoli, inclusa la **crittografia SSL/TLS** per tutti i dati in transito (tramite Cloudflare e Heroku), per proteggere l'integrità dell'applicazione.

## 5. Il tuo controllo

Poiché lo stato dell'applicazione viene salvato localmente:

- **Per eliminare i tuoi dati:** Ti basta cancellare i "Dati dei siti" o la cache del browser per questo dominio.
- **Per disattivare il tracciamento:** Puoi usare estensioni del browser (come uBlock Origin) per impedire la raccolta dei dati di utilizzo senza compromettere il funzionamento dell'app.

## 6. Modifiche a questa informativa

Potremmo aggiornare periodicamente la presente Informativa sulla privacy. Ti informeremo di eventuali modifiche aggiornando la data di "Ultimo aggiornamento" in cima a questa pagina.

## 7. Contattaci

Se hai domande su questa Informativa sulla privacy, puoi contattarci tramite [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues).
