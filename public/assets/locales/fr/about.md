## Qu'est-ce que l'optimiseur NMS ?

NMS Optimizer est un puissant **calculateur**, **planificateur** et **constructeur** basé sur le Web pour le jeu No Man's Sky. Il aide les joueurs à concevoir des dispositions optimales pour leur équipement en déterminant la meilleure disposition des modules. Cet outil prend en charge les **mises en page Starship**, **mises en page Freighter**, **mises en page Corvette**, **versions Multitool**, **mises en page Exocraft** et **versions Exosuit**. Il calcule automatiquement le **placement de module** idéal pour maximiser les mécanismes cruciaux du jeu tels que les **bonus de contiguïté** (issus du regroupement de technologies similaires) et les puissants boosts des **emplacements suralimentés**. Comprendre comment utiliser au mieux ces fonctionnalités est essentiel pour atteindre des performances optimales, et cet outil simplifie ce processus complexe.

## Comment ça marche

> Comment résoudre un problème avec jusqu'à ~8,32 × 10⁸¹ permutations possibles (soit 82 chiffres !) en moins de cinq secondes ?

Déterminer le meilleur **emplacement de module** absolu avec autant de permutations de disposition possibles pour une grille complète n'est pas une mince affaire. Cet outil combine des modèles déterministes, l'apprentissage automatique et le recuit simulé basé sur Rust pour fournir des **versions Starship**, **versions Freighter**, **versions Corvette**, **mises en page Multitool**, **versions Exocraft** et **mises en page Exosuit** en cinq secondes environ. Il prend en compte tous les facteurs, y compris les **bonus de proximité** et l'utilisation stratégique des **emplacements suralimentés**.

1. **Pré-résolution basée sur des modèles :** commence par une bibliothèque organisée de modèles de mise en page testés manuellement, optimisant pour des bonus de contiguïté maximum sur différents types de grille.
2. **Placement guidé par l'IA (inférence ML) :** Si une configuration viable comprend des emplacements suralimentés, l'outil invoque un modèle TensorFlow formé sur plus de 16 000 grilles pour prédire le placement optimal.
3. **Recuit simulé (raffinement) :** affine la mise en page grâce à une recherche stochastique : échange de modules et déplacement de positions pour améliorer le score de contiguïté tout en évitant les optima locaux.
4. **Présentation des résultats :** Produit la configuration ayant obtenu le score le plus élevé, y compris la répartition des scores et des recommandations de présentation visuelle pour les vaisseaux spatiaux, les cargos, les corvettes, les outils multifonctions, les Exocraft et les Exosuits.

## Principales fonctionnalités

- **Optimisation complète du réseau :** Prise en charge complète des emplacements standard, **suralimentés** et inactifs pour trouver la véritable disposition optimale.
- **Utilisation stratégique des emplacements suralimentés :** Au-delà de la simple reconnaissance des emplacements suralimentés, l'optimiseur détermine intelligemment s'il convient de placer les technologies de base (comme une arme principale) ou leurs meilleures améliorations sur ces emplacements à fort boost, en parcourant les compromis complexes pour maximiser vos objectifs de construction spécifiques (par exemple, dégâts, portée ou efficacité). Cela reflète les stratégies des joueurs experts mais avec une précision informatique.
- **Inférence d'apprentissage automatique :** Formation sur plus de 16 000 dispositions de grilles historiques pour identifier des modèles puissants.
- **Recuit simulé avancé :** Pour un raffinement méticuleux de la disposition garantissant que chaque point de pourcentage de performance est éliminé.

## Pourquoi utiliser cet outil ?

Arrêtez de deviner le placement technologique et libérez le véritable potentiel de votre équipement ! Que vous visiez une **version de vaisseau** à dégâts maximum, une **version de cargo** à longue portée, une **version de corvette** puissante, la portée de numérisation ultime avec une **disposition multi-outils** parfaite, un **Exocraft** optimisé ou une **Exosuit** robuste, cet optimiseur démystifie les règles complexes des **bonus de contiguïté** et des interactions de **emplacements suralimentés**. Il fournit un moyen clair et efficace de planifier vos mises à niveau en toute confiance et d'obtenir des performances de premier ordre sans des heures d'essais et d'erreurs manuels. Si vous vous êtes déjà demandé quelle était la meilleure façon d'utiliser vos emplacements suralimentés limités, ce **calculateur NMS** a la réponse.

## Pile technologique

- **Frontend :** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solver :** Implémentations de recuit simulé et de notation heuristique personnalisées basées sur Python, Flask, TensorFlow, NumPy et Rust.
- **Tests :** Vitest, Python Unittest
- **Déploiement :** Heroku (hébergement), Cloudflare (DNS et CDN), Docker
- **Automatisation :** Actions GitHub (CI/CD)
- **Analyses :** Google Analytics

## Dépôts

- Interface utilisateur Web : [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend : [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Une histoire amusante

Voici un aperçu d'une **première version** de l'interface utilisateur : fonctionnellement solide mais visuellement minimale. La version actuelle constitue une amélioration majeure en termes de conception, de convivialité et de clarté, aidant les joueurs à trouver rapidement la **meilleure disposition** pour n'importe quel vaisseau ou outil.

![Premier prototype de l'interface utilisateur de l'optimiseur de mise en page de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)