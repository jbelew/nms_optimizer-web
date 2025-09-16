## Aperçu

Cette application Web, l'Optimiseur NMS, aide les joueurs de No Man's Sky à déterminer le meilleur arrangement de modules pour concevoir Optimal ** Spars Disposouts **, ** Corvette Layouts **, ** Multitool Builds **, ** Exocraft Layouts ** et ** Exosuit Builds **. Il calcule automatiquement le placement idéal ** Placement du module ** pour maximiser les mécanismes cruciaux dans le jeu comme ** Bonus d'adjacence ** (réalisé en regroupant des technologies similaires pour les effets synergiques) et les puissants boosts à partir de ** les emplacements suralimentés **. Comprendre comment utiliser au mieux ces fonctionnalités, en particulier les emplacements suralimentés, est la clé pour atteindre les performances de pointe, et cet outil rend ce processus complexe simple.

## Comment ça marche

> Comment résolvez-vous un problème avec jusqu'à ~ 8,32 × 10⁸¹ des permutations possibles (c'est-à-dire 82 chiffres!) En moins de cinq secondes?

Déterminer le meilleur emplacement du module absolu ** avec autant de permutations de mise en page possibles pour une grille complète n'est pas une mince affaire. Cet outil mélange des motifs déterministes, l'apprentissage automatique et le recuit simulé pour livrer le niveau de premier plan ** Starship Build **, ** Corvette Build **, ** Multitool Disposition **, ** EXOCRAFT Build ** et ** Exosuit Disposition ** Suggestions en moins de cinq secondes. Il considère tous les facteurs, y compris les bonus d'adjacence ** et l'utilisation stratégique de ** les emplacements suralimentés **.

1. ** Pré-solution basée sur le modèle: ** commence par une bibliothèque organisée de modèles de mise en page testés à la main, optimisant des bonus d'adjacence maximum sur différents types de grille.
2. ** Placement guidé par AI (inférence ML): ** Si une configuration viable comprend des emplacements suralimentés, l'outil invoque un modèle TensorFlow formé sur plus de 16 000 grilles pour prédire le placement optimal.
3. ** Recuit simulé (raffinement): ** Raffine la disposition par la recherche stochastique - les modules de saut et les positions de décalage pour augmenter la notation d'adjacence tout en évitant l'optima local.
4. ** Présentation des résultats: ** Sorte la configuration la plus score, y compris les pannes de score et les recommandations de disposition visuelle pour les vaisseaux, les corvettes, les outils multiples, l'Exocraft et les exosuites.

## fonctionnalités clés

- ** Optimisation complète de la grille: ** Prise en charge complète des emplacements standard, ** suralimentés ** et inactifs pour trouver la véritable disposition optimale.
- ** Utilisation stratégique de créneaux suralimentés: ** Au-delà de la simple reconnaissance des créneaux suralimentés, l'optimiseur détermine intelligemment s'il faut placer les technologies de base (comme une arme principale) ou leurs meilleures mises à niveau sur ces créneaux à haut boost, naviguer dans les compromis complexes pour maximiser vos objectifs de construction spécifiques (par exemple, les dégâts, la plage ou l'efficacité). Cela reflète des stratégies d'experts des joueurs mais avec une précision de calcul.
- ** Inférence d'apprentissage automatique: ** Formé sur plus de 16 000 dispositions de grille historiques pour identifier des modèles puissants.
- ** recuit simulé avancé: ** Pour le raffinement de mise en page méticuleux, garantissant que chaque point de performance de pourcentage est supprimé.

## Pourquoi utiliser cet outil?

Arrêtez de deviner le placement technologique et déverrouillez le véritable potentiel de votre équipement! Que vous visiez un maximum de damage ** Starship Build **, une puissante ** Corvette Build **, la gamme de numérisation ultime avec une disposition multitoolaire parfaite **, une manière optimisée ** Exocraft **, ou une robuste ** Exosuit **, ou essayer de trouver le meilleur moyen d'utiliser vos sous-efforts limité Interactions de l'emplacement **. Il fournit un moyen clair et efficace de planifier vos mises à niveau en toute confiance et d'atteindre des performances de haut niveau sans heures d'essai manuelles et d'erreur.

## Tech Stack

** Frontend: ** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI \
11
** Test: ** Vitest, Python Unittest \
** Déploiement: ** HEROKU (HOSTING) et CloudFlare (DNS et CDN) \
** Automatisation: ** Actions GitHub (CI / CD) \
** Analytics: ** Google Analytics

## référentiels

- Web ui: [https://github.com/jbelew/nms_optimizer-web
- Backend: [https://github.com/jbelew/nms_optimizer-service

## Une histoire amusante

Voici un aperçu d'une ** première version ** de l'interface utilisateur - fonctionnellement solide mais visuellement minime. La version actuelle est une mise à niveau majeure de la conception, de la convivialité et de la clarté, aidant les joueurs à trouver rapidement la ** meilleure mise en page ** pour tout navire ou outil.

! [Prototype précoce de No Man's Sky Layout Optimizer Interface] (/ Assets / IMG / Captures / ScreenShot_V03.png)