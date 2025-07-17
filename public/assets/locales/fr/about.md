## Aperçu

Cette application web fournit une interface interactive pour optimiser les agencements technologiques dans le jeu _No Man's Sky_, spécifiquement pour les vaisseaux spatiaux, les multi-outils et les cargos. L'outil se concentre sur l'identification des **meilleurs agencements technologiques** en maximisant les bonus d'adjacence et en exploitant les emplacements surchargés—stratégies fondamentales pour obtenir le **meilleur agencement de vaisseau spatial**, le **meilleur agencement de multi-outil** ou le **meilleur agencement de cargo**.

## Comment ça marche

> Comment résoudre un problème avec 479 millions de permutations possibles en moins de 5 secondes ?

Le processus d'optimisation combine des motifs déterministes avec des algorithmes adaptatifs adaptés aux grilles de modules technologiques de No Man's Sky :

1. **Pré-résolution basée sur des motifs :** Commence avec une bibliothèque organisée de motifs d'agencement testés à la main, optimisant pour des bonus d'adjacence maximaux sur différents types de grille.
2. **Placement guidé par l'IA (Inférence ML) :** Si une configuration viable inclut des emplacements surchargés, l'outil invoque un modèle TensorFlow entraîné sur plus de 16 000 grilles pour prédire le placement optimal.
3. **Recuit simulé (Affinement) :** Affine l'agencement par recherche stochastique—échangeant des modules et déplaçant les positions pour augmenter le score d'adjacence tout en évitant les optima locaux.
4. **Présentation des résultats :** Génère la configuration la mieux notée, y compris les ventilations de score et les recommandations d'agencement visuel pour les vaisseaux spatiaux, les multi-outils et les cargos.

## Fonctionnalités

- **Résolution consciente de la grille :** Tient compte des emplacements surchargés et inactifs lors de la détermination de la **meilleure configuration d'agencement**.
- **Inférence ML TensorFlow :** Prédit le placement optimal de la technologie en fonction des données historiques de la grille.
- **Recuit simulé :** Améliore la qualité de l'agencement en explorant les changements de configuration et les échanges basés sur l'adjacence.

## Pile technologique

**Frontend :** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI  
**Solveur Backend :** Python, Flask, TensorFlow, NumPy, implémentation personnalisée du recuit simulé et score heuristique  
**Tests :** Vitest, Python Unittest  
**Déploiement :** Heroku (Hébergement) et Cloudflare (DNS et CDN)  
**Automatisation :** GitHub Actions (CI/CD)  
**Analyse :** Google Analytics

## Dépôts

- Interface utilisateur web : [nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend : [nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Quelques anecdotes amusantes

Voici un aperçu d'une **première version** de l'interface utilisateur—fonctionnellement solide mais visuellement minimale. La version actuelle est une amélioration majeure en termes de conception, d'utilisabilité et de clarté, aidant les joueurs à trouver rapidement le **meilleur agencement** pour n'importe quel vaisseau ou outil.

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
