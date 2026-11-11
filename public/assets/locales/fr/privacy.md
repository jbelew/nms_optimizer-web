# Politique de confidentialité de NMS Optimizer : vos données et votre sécurité

**Dernière mise à jour :** 16 mars 2026

Votre vie privée est importante pour nous. La présente politique de confidentialité explique comment **NMS Optimizer** (« nous », « notre » ou « nos ») collecte, utilise et protège vos informations lorsque vous utilisez notre application web et son moteur d'optimisation associé.

## 1. Collecte des informations

NMS Optimizer est conçu dès l'origine pour respecter la vie privée.

- **Aucune donnée personnelle :** Nous ne collectons aucune information personnellement identifiable (PII) telle que votre nom, votre adresse e-mail ou votre adresse postale. Il n'existe aucun système de compte ou de connexion.
- **Stockage local :** L'application utilise le **LocalStorage** de votre navigateur pour enregistrer vos préférences et l'état de vos builds. Ces données restent sur votre appareil et ne sont jamais transmises à nos serveurs ni stockées par nos soins.
- **Données d'utilisation anonymes :** Nous utilisons **Google Analytics** pour recueillir des statistiques d'utilisation anonymes (comme le nombre de pages vues et les interactions avec les fonctionnalités). Ces données sont agrégées et ne permettent pas de vous identifier personnellement.

## 2. Infrastructure technique et surveillance

Afin de garantir une application sécurisée, rapide et exempte de bugs, nous faisons appel aux prestataires suivants :

- **Cloudflare :** Notre application est hébergée et sécurisée via Cloudflare, qui traite les adresses IP et les métadonnées techniques afin d'assurer la protection contre les attaques DDoS et d'optimiser la diffusion du contenu.
- **Heroku (Salesforce) :** Notre API interne d'optimisation est hébergée sur Heroku. Heroku traite les données techniques des requêtes et conserve des journaux serveur standards (p. ex. adresses IP et horodatages) afin d'assurer la disponibilité et la sécurité de l'API.
- **Sentry :** Nous utilisons Sentry pour la surveillance des erreurs. Si l'application rencontre un bug, un rapport technique est transmis à Sentry. Ces rapports sont configurés pour exclure vos données personnelles et servent strictement au débogage.

## 3. Traitement des données (API interne)

NMS Optimizer communique avec une API dédiée, développée par nos soins et hébergée sur Heroku, afin d'effectuer les calculs de disposition technologique.

- **Finalité :** Lorsque vous lancez une optimisation, les paramètres techniques de la technologie et la disposition de votre grille sont envoyés à cette API.
- **Confidentialité :** Cet échange est strictement fonctionnel. Aucune donnée personnelle ni aucun identifiant utilisateur persistant n'accompagne ces requêtes. Les données sont traitées en mémoire vive et ne sont jamais enregistrées dans une base de données.

## 4. Sécurité des données

Nous mettons en œuvre des mesures de sécurité appropriées, notamment le **chiffrement SSL/TLS** pour l'ensemble des données en transit (via Cloudflare et Heroku), afin de protéger l'intégrité de l'application.

## 5. Votre contrôle

Comme l'état de l'application est stocké localement :

- **Pour supprimer vos données :** Effacez simplement les « Données de site » ou le cache de votre navigateur pour ce domaine.
- **Pour refuser le suivi :** Vous pouvez utiliser des extensions de navigateur (telles que uBlock Origin) pour bloquer la collecte de statistiques d'utilisation sans altérer le fonctionnement de l'application.

## 6. Modifications de cette politique

Nous sommes susceptibles de mettre à jour notre politique de confidentialité de temps à autre. Tout changement sera signalé par la mise à jour de la date de « Dernière mise à jour » figurant en haut de cette page.

## 7. Nous contacter

Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter via les [tickets GitHub](https://github.com/jbelew/nms_optimizer-web/issues).
