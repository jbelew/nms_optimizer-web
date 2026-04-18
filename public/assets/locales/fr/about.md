# À Propos de l'Optimiseur NMS : Fonctionnement de l'Optimisation

## Qu'est-ce Que C'est ?

L'Optimiseur NMS est un outil gratuit qui calcule l'emplacement idéal de vos modules de technologie dans No Man's Sky. Vous choisissez votre équipement, sélectionnez vos technologies, marquez vos emplacements surchargés, et l'outil génère la disposition qui obtient le meilleur score.

Il fonctionne pour tous les types de vaisseaux (Standard, Sentinelle, Solaire, Combattant, Organique, Atlantide), Corvettes, Multi-outils, Exocombinaisons, Exonefs et Cargos.

L'outil gère automatiquement les bonus d'adjacence et l'optimisation des emplacements surchargés. En pratique, une build optimisée peut être 15 à 20 % plus efficace qu'une disposition faite manuellement.

## Le Problème

No Man's Sky n'explique pas clairement le fonctionnement des bonus d'adjacence et reste très vague sur la stratégie des emplacements surchargés. Les modules de même type gagnent des bonus de statistiques lorsqu'ils sont côte à côte dans l'inventaire. Les emplacements surchargés appliquent un multiplicateur d'environ 25-30 % à tout module placé dessus. Trouver la meilleure combinaison demande de jongler avec ces deux systèmes sur des grilles offrant des millions de permutations possibles (~8,32 × 10⁸¹ pour une build complète).

C'est mathématiquement impossible à résoudre de tête.

## Comment l'Optimiseur Résout Cela

L'optimisation se déroule en quatre étapes :

1. **Correspondance de Modèles** : Commence par des dispositions testées manuellement qui ont prouvé leur efficacité pour des ensembles de modules classiques.
2. **Prédiction Par ML** : Si votre grille comporte des slots surchargés, un modèle TensorFlow entraîné sur plus de 16 000 dispositions à haut score prédit le placement idéal des technologies principales par rapport aux améliorations.
3. **Simulated Annealing (Recuit Simulé)** : Un moteur basé sur Rust teste des milliers de combinaisons en quelques millisecondes pour trouver le score le plus élevé possible.
4. **Visualisation des Résultats** : Vous obtenez la disposition finale avec un détail complet des multiplicateurs d'adjacence.

Chaque étape alimente la suivante. Le modèle de Machine Learning donne au moteur de recuit un point de départ solide, qui se charge ensuite d'affiner le résultat.

## Ce Que l'Optimiseur Prend En Compte

- Les emplacements standards, surchargés et inactifs.
- Le choix du module (technologie principale ou meilleure amélioration) pour chaque slot surchargé.
- Les compromis entre statistiques (ex : Manœuvrabilité vs Vitesse, Dégâts vs Cadence).
- Les poids spécifiques de chaque statistique et les règles de bonus d'adjacence.

## Pile Technologique

- **Frontend :** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI.
- **Service d'Optimisation :** Python, Flask, TensorFlow, NumPy, Rust (Recuit simulé et calcul de score).
- **Tests :** Vitest, Python Unittest.
- **Déploiement :** Heroku (API), Cloudflare (Hébergement/DNS/CDN), Docker.
- **CI/CD :** GitHub Actions.

## Dépôts

- Interface Web : [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend : [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Foire Aux Questions (FAQ)

### Qu'est-ce qu'un bonus d'adjacence ?

Lorsque vous placez des modules technologiques compatibles les uns à côté des autres dans votre inventaire, ils gagnent un bonus de statistiques. Les technologies ont des "partenaires" spécifiques : les améliorations d'armes se boostent mutuellement, les technologies de mouvement font de même, etc. L'optimiseur teste toutes les positions pour maximiser ces bonus cumulés.

### Comment fonctionnent les emplacements surchargés ?

Ce sont des emplacements rares (généralement 4 par grille) qui boostent de 25-30 % les statistiques du module qui y est placé. La difficulté est de choisir quel module y mettre : parfois c'est la technologie de base, parfois c'est l'amélioration ayant les meilleures stats. Le modèle ML de l'outil est spécialement conçu pour trancher cette question en se basant sur des milliers de cas réels.

### Quels équipements sont supportés ?

Tous :

- **Vaisseaux :** Standard, Exotique, Sentinelle, Solaire et Organique.
- **Corvettes :** Incluant les réacteurs uniques et les slots de personnalisation cosmétique.
- **Multi-outils :** Tous les types, y compris les Bâtons.
- **Exonefs :** Tous les véhicules (Nomade, Colosse, Pèlerin, Vagabond, Minotaure, Nautilon).
- **Exocombinaisons :** Toutes les technologies de survie et de mouvement.
- **Cargos :** Dispositions technologiques des vaisseaux capitaux.

### Est-ce gratuit ?

Oui. Gratuit, sans publicité, et Open Source (GPL-3.0). Aucun compte ou e-mail n'est requis.

### Puis-je sauvegarder et partager mes builds ?

Oui. Vous pouvez sauvegarder vos dispositions au format `.nms`, générer des liens de partage ou les poster sur les réseaux sociaux. Les builds sont validées pour garantir qu'elles sont compatibles avec l'équipement sélectionné.

## Remerciements

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray et tous les autres contributeurs : votre soutien est essentiel. Chaque don, chaque partage et chaque mot d'encouragement m'aide à continuer le développement. Merci !

## Ancienne Version

Voici à quoi ressemblait l'interface dans ses débuts : fonctionnelle, mais très minimaliste. La version actuelle est une évolution majeure en termes de design et d'ergonomie.
![Prototype initial de l'interface de l'optimiseur No Man's Sky](/assets/img/screenshots/screenshot_v03.png)
