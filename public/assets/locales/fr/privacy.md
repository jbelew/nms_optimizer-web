# Politique de Confidentialité de l'NMS Optimizer : Vos Données et Sécurité

**Dernière Mise à Jour :** 16 mars 2026

Votre vie privée est importante pour nous. Cette politique de confidentialité explique comment **NMS Optimizer** ("nous" ou "notre") collecte, utilise et protège vos informations lorsque vous utilisez notre application web et son moteur d'optimisation associé.

---

## 1. Collecte des Informations

NMS Optimizer est conçu pour être un outil respectueux de la vie privée.

- **Aucune Donnée Personnelle :** Nous ne collectons aucune information personnellement identifiable (PII) telle que votre nom, votre adresse e-mail ou votre adresse physique. Il n'y a aucun système de compte ou de connexion.
- **Stockage Local :** L'application utilise le **LocalStorage** de votre navigateur pour sauvegarder vos préférences et l'état de vos builds. Ces données restent sur votre appareil et ne nous sont jamais transmises.
- **Données d'Utilisation Anonymes :** Nous utilisons **Google Analytics** pour collecter des statistiques d'utilisation anonymes (comme le nombre de pages vues et les interactions avec les fonctionnalités). Ces données sont agrégées et ne permettent pas de vous identifier personnellement.

## 2. Infrastructure Technique Et Surveillance

Pour garantir une application sécurisée, rapide et sans bug, nous utilisons les prestataires de services suivants :

- **Cloudflare :** Notre application est hébergée et sécurisée par Cloudflare. Ils traitent les adresses IP et les métadonnées techniques pour assurer une protection contre les attaques DDoS et optimiser la diffusion du contenu.
- **Heroku (Salesforce) :** Notre API interne d'optimisation est hébergée sur Heroku. Heroku traite les données techniques des requêtes et conserve des journaux serveur standard (ex: adresses IP et horodatages) pour garantir la sécurité et le bon fonctionnement de l'API.
- **Sentry :** Nous utilisons Sentry pour le suivi des erreurs. Si l'application rencontre un bug, un rapport technique est envoyé à Sentry. Ces rapports sont configurés pour exclure vos données personnelles et servent uniquement au débogage.

## 3. Traitement Des Données (API Interne)

NMS Optimizer interagit avec une API dédiée, développée par nos soins et hébergée sur Heroku, pour effectuer les calculs de disposition technologique.

- **Objectif :** Lorsque vous lancez une optimisation, les paramètres techniques de la technologie et la configuration de votre grille sont envoyés à cette API.
- **Confidentialité :** Cette interaction est strictement fonctionnelle. Aucune donnée personnelle ni identifiant utilisateur persistant n'est envoyé avec ces requêtes. Les données sont traitées en mémoire et ne sont pas conservées dans une base de données.

## 4. Sécurité Des Données

Nous mettons en œuvre des mesures de sécurité raisonnables, incluant le **chiffrement SSL/TLS** pour toutes les données en transit (via Cloudflare et Heroku), afin de protéger l'intégrité de l'application.

## 5. Votre Contrôle

Puisque l'état de votre application est stocké localement :

- **Pour Supprimer vos Données :** Effacez simplement les "Données de site" ou le cache de votre navigateur pour ce domaine.
- **Pour Refuser le Suivi :** Vous pouvez utiliser des extensions de navigateur (comme uBlock Origin) pour bloquer la collecte de données d'utilisation sans affecter le fonctionnement de l'application.

## 6. Modifications De Cette Politique

Nous pouvons mettre à jour notre politique de confidentialité de temps à jour. Nous vous informerons de tout changement en modifiant la date de "Dernière mise à jour" en haut de cette page.

## 7. Nous Contacter

Si vous avez des questions concernant cette politique de confidentialité, vous pouvez nous contacter via les [tickets GitHub (Issues)](https://github.com/jbelew/nms_optimizer-web/issues).
