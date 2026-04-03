# Comment fonctionne l'optimiseur NMS

## Qu'est-ce que c'est?

NMS Optimizer est un outil gratuit qui détermine où placer vos modules technologiques dans No Man's Sky. Vous choisissez votre équipement, sélectionnez vos technologies, marquez vos emplacements suralimentés et il calcule la disposition qui obtient le score le plus élevé.

Il fonctionne pour les vaisseaux spatiaux (standard, sentinelle, solaire, de chasse, vivant, atlantide), les corvettes, les outils multifonctions, les exosuits, tous les types d'exocraft et les cargos.

L’outil gère automatiquement les bonus de contiguïté et le placement des emplacements suralimentés. En pratique, une mise en page optimisée obtient généralement un score 15 à 20 % plus élevé que ce que la plupart des joueurs organisent à la main.

## Le problème

No Man's Sky n'explique pas bien les bonus de contiguïté, et n'explique pas du tout la stratégie des machines à sous suralimentée. Les modules du même type obtiennent une amélioration de leurs statistiques lorsqu'ils partagent un avantage sur la grille. Les machines à sous suralimentées donnent un multiplicateur d'environ 25 à 30 % à tout ce que vous y mettez. Trouver le meilleur arrangement signifie jongler avec les deux systèmes à la fois, sur des grilles avec des millions de permutations possibles (~8,32 × 10⁸¹ pour une mise en page complète).

Personne ne résout ce problème à la main.

## Comment l'optimiseur le résout

L'optimiseur se déroule en quatre étapes :

1. **Correspondance de modèles** — cela commence par des arrangements testés manuellement qui obtiennent de bons résultats de manière fiable pour les ensembles de modules courants
2. **Prédiction ML** — si votre grille dispose d'emplacements suralimentés, un modèle TensorFlow formé sur plus de 16 000 mises en page avec des scores élevés prédit où placer les technologies de base par rapport aux mises à niveau.
3. **Recuit simulé** — un optimiseur basé sur Rust échange les modules et teste des milliers d'arrangements en millisecondes, grimpant vers le score le plus élevé possible
4. **Affichage des résultats** — vous voyez la disposition la mieux notée avec une répartition complète du multiplicateur de contiguïté

Chaque étape alimente la suivante. Le modèle ML donne au recuit simulé un point de départ solide, et le recuit s'affine à partir de là.

## Ce que représente l'optimiseur

- Emplacements standard, suralimentés et inactifs
- Qu'une technologie de base ou sa meilleure mise à niveau ait sa place dans chaque emplacement suralimenté
- Compromis entre statistiques concurrentes (maniabilité vs vitesse, dégâts vs cadence de tir)
- Pondérations statistiques spécifiques au module et règles des partenaires de contiguïté

## Pile technologique

- **Frontend :** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Solveur backend :** Python, Flask, TensorFlow, NumPy, Rust (recuit et notation simulés)
- **Tests :** Vitest, Python Unittest
- **Déploiement :** Heroku (hébergement), Cloudflare (DNS/CDN), Docker
- **CI/CD :** Actions GitHub

## Dépôts

- Interface utilisateur Web : [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend : [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

##FAQ

### Qu'est-ce qu'un bonus de contiguïté ?

Lorsque vous placez des modules technologiques compatibles les uns à côté des autres sur la grille d'inventaire, ils bénéficient d'un boost de statistiques. Différentes technologies ont différents partenaires de contiguïté : les améliorations d'armes se bonus les unes par rapport aux autres, les bonus de technologie de mouvement par rapport aux autres technologies de mouvement, et ainsi de suite. L'optimiseur teste toutes les dispositions possibles et sélectionne celle où les bonus de contiguïté totaux sont les plus élevés.

### Comment fonctionnent les machines à sous suralimentées ?

Les emplacements suralimentés sont des emplacements d'inventaire rares (généralement 4 par grille) qui donnent un boost d'environ 25 à 30 % au module qui s'y trouve. La partie délicate est de décider ce qui va là-bas. Parfois, il s'agit de la technologie de base, parfois de la mise à niveau la plus élevée. Le modèle ML de l'optimiseur est formé spécifiquement sur cette décision, en utilisant plus de 16 000 mises en page réelles comme données de formation.

### Quels types d'équipements sont pris en charge ?

Tous :

- **Vaisseaux spatiaux** — variantes standard, exotiques, sentinelles, solaires, vivantes et atlantides
- **Corvettes** — y compris des emplacements pour réacteurs et technologies cosmétiques
- **Multitools** — tous types, y compris les portées
- **Exocraft** — nomade, pèlerin, vagabond, colosse, minotaure, nautilon
- **Exosuits** — toutes les catégories technologiques
- **Cargos** — configurations technologiques des vaisseaux capitaux

### Est-ce gratuit ?

Oui. Gratuit, sans publicité et open source (GPL-3.0). Aucun compte requis.

### Puis-je enregistrer et partager des builds ?

Oui. Vous pouvez enregistrer les builds sous forme de fichiers « .nms », générer des liens partageables ou partager directement sur les réseaux sociaux. Les versions sont validées pour leur intégrité et la compatibilité des équipements avant le partage.

## Merci

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray et tous ceux qui ont contribué – votre soutien signifie tout. Chaque don, partage et mot gentil m'aide à continuer à construire. Merci.

## Première version

Voici à quoi ressemblait l'interface utilisateur dans une première version : elle fonctionnait, mais la conception était minimale. La version actuelle constitue une amélioration majeure en termes de conception, de convivialité et de clarté.
![Premier prototype de l'interface utilisateur de l'optimiseur de mise en page de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)