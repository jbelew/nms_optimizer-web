# Comment Fonctionne NMS Optimizer: Optimisation d'Agencements Technologiques

## Qu'est-ce que l'optimiseur NMS ?

Arrêtez de vous fier aux suppositions ! **NMS Optimizer** est le **calculateur**, **planificateur** et **constructeur** ultime et gratuit basé sur le Web pour les joueurs de **No Man's Sky** qui souhaitent libérer le potentiel maximum absolu de leur équipement.

C'est un outil intelligent qui vous aide à concevoir et à visualiser le **placement optimal des modules** pour tous vos équipements. Obtenez la **mise en page** parfaite pour votre :

* **Constructions de vaisseaux** (toutes les classes)
* **Aménagements cargo**
* **Constructions de Corvette**
* **Mise en page multi-outils**
* **Constructions Exocraft**
* **Constructions d'exosuit**

L'optimiseur gère automatiquement les calculs complexes, calculant l'arrangement idéal pour maximiser les mécanismes critiques du jeu tels que les **bonus de contiguïté** (l'avantage du regroupement de technologies similaires) et l'immense puissance des **machines à sous suralimentées**. Atteindre des performances optimales est désormais simple.

## Comment résout-il le problème impossible ?

> Comment résoudre un problème avec jusqu'à ~8,32 × 10⁸¹ permutations possibles (soit 82 chiffres !) en quelques secondes seulement ?

Nous combinons une technologie de pointe pour proposer des **configurations Starship**, des **versions Cargo**, des **configurations Multitool** et des **versions Exosuit** de premier ordre. L'outil prend en compte tous les facteurs, y compris tous les **bonus de proximité** et l'utilisation stratégique des **emplacements suralimentés**, en utilisant un processus en quatre étapes :

1. **Commencez avec les meilleurs modèles :** Le processus commence par la vérification instantanée d'une bibliothèque organisée de modèles testés manuellement afin d'établir un point de départ avec des scores élevés pour les **bonus de contiguïté**.
2. **Placement guidé par l'IA (apprentissage automatique) :** Si votre configuration comprend des emplacements suralimentés, un modèle TensorFlow spécialisé, formé sur plus de 16 000 grilles du monde réel, intervient pour prédire le placement optimal des technologies de base.
3. **Raffinement via recuit simulé :** Un processus de recherche stochastique hautement optimisé, basé sur Rust, permute méticuleusement les modules et décale leurs positions. Ce raffinement final garantit que la mise en page est poussée à sa limite absolue de performances, évitant les erreurs courantes (optima local) que les joueurs humains commettent souvent.
4. **Visualisez la construction parfaite :** Le **calculateur NMS** présente ensuite la configuration ayant obtenu le score le plus élevé, avec une répartition des scores et des recommandations visuelles pour tout votre équipement.

---

## ✨Fonctionnalités clés qui améliorent les performances

* **Optimisation complète :** Prise en charge complète des emplacements standard, **suralimentés** et inactifs pour vous garantir de trouver la **mise en page** optimale mathématiquement vraie.
* **Utilisation intelligente des emplacements suralimentés :** L'optimiseur ne se contente pas de reconnaître les emplacements suralimentés : il agit comme un joueur expert, déterminant intelligemment si une technologie de base (comme un moteur Pulse principal) ou son module de mise à niveau le plus puissant doit occuper ces emplacements à forte puissance. Il gère les compromis complexes pour maximiser parfaitement votre objectif spécifique (par exemple, la portée de saut, les dégâts de l'arme ou la mobilité).
* **Apprentissage avancé de l'IA :** Construit sur une base d'**inférence d'apprentissage automatique** à partir de plus de 16 000 dispositions de grille historiques.
* **Affinement méticuleux de la disposition :** Le processus de **Recuit simulé avancé** garantit que chaque point de pourcentage possible de performance est extrait de votre équipement.

## Pourquoi utiliser ce **calculateur NMS** ?

Arrêtez les essais et erreurs manuels sans fin ! Libérez le véritable potentiel de votre équipement, que vous construisiez une **version de vaisseau spatial** à dégâts maximums, la **disposition de cargo** à plus longue portée, une **version de corvette** puissante, la portée de numérisation ultime avec une **disposition multi-outils** parfaite, un **Exocraft** optimisé ou une **Exosuit** robuste.

Cet **optimiseur** démystifie les règles complexes des **bonus de contiguïté** et des interactions avec les **emplacements suralimentés**. Il fournit un moyen clair et efficace de planifier chaque mise à niveau en toute confiance. Si vous vous êtes déjà demandé quelle était la meilleure façon d'utiliser vos **emplacements suralimentés** limités, cet outil fournit la réponse définitive.

---

## Pile technologique

* **Frontend :** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
* **Backend Solver :** Implémentations de recuit simulé et de notation heuristique personnalisées basées sur Python, Flask, TensorFlow, NumPy et Rust.
* **Test :** Vitest, Python Unittest
* **Déploiement :** Heroku (hébergement), Cloudflare (DNS et CDN), Docker
* **Automatisation :** Actions GitHub (CI/CD)
* **Analyses :** Google Analytics

## Dépôts

* Interface utilisateur Web : [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
* Backend : [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

---

## ❓Questions fréquemment posées

### Qu'est-ce qu'un bonus de contiguïté dans No Man's Sky ?

Un **bonus de contiguïté** est une amélioration significative des performances que vous obtenez lorsque des modules technologiques compatibles sont placés les uns à côté des autres dans votre grille d'inventaire. L'optimiseur NMS calcule la disposition optimale pour maximiser ces bonus sur toutes vos technologies pour un effet maximal.

### Comment fonctionnent les machines à sous suralimentées ?

Les **emplacements suralimentés** sont rares (limités à 4 par grille sur la plupart des plateformes) et offrent un énorme boost d'environ 25 à 30 % à tout module technologique qui y est placé. Ils sont stratégiquement vitaux. L'optimiseur vous aide à décider de placer une technologie de base ou ses meilleures mises à niveau dans ces emplacements pour maximiser vos performances globales.

### Quels équipements l'optimiseur prend-il en charge ?

L'optimiseur prend en charge tous les principaux équipements **No Man's Sky** :

* **Vaisseaux spatiaux** (Standard, Exotique, Sentinelle, Solaire, Vivant)
* **Corvettes** (comprenant un réacteur unique et des modules cosmétiques)
* **Multitools** (Standard, Exotique, Atlantide, Sentinelle, Staves)
* **Exocraft** (tous les types, y compris Minotaure)
* **Exocombinaisons**
* **Cargos**

### Quelle est la précision de l'optimiseur ?

C'est **extrêmement précis**. L'outil utilise une combinaison de modèles éprouvés, d'apprentissage automatique entraîné sur plus de 16 000 mises en page et d'affinement du recuit simulé. Il prend en compte tous les facteurs, y compris les **bonus de contiguïté**, les **emplacements suralimentés** et les règles de placement des modules, pour trouver la **disposition optimale** mathématiquement pour votre configuration spécifique.

### L'utilisation de l'optimiseur est-elle gratuite ?

Oui! **NMS Optimizer** est entièrement gratuit, sans publicité et open source. Aucune inscription ni paiement n'est requis.

### Puis-je enregistrer et partager mes builds ?

Absolument! Vous pouvez enregistrer vos mises en page optimisées sous forme de fichiers « .nms », les recharger plus tard ou générer des liens partageables à envoyer à des amis. Toutes les versions sont validées pour leur intégrité et leur compatibilité.

---

## Une histoire amusante

Voici un aperçu d'une **première version** de l'interface utilisateur : fonctionnellement solide mais visuellement minimale. La version actuelle constitue une amélioration massive en termes de conception, de convivialité et de clarté, aidant les joueurs à trouver rapidement la **meilleure disposition** pour n'importe quel vaisseau ou outil.

![Premier prototype de l'interface utilisateur de l'optimiseur de mise en page de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)
