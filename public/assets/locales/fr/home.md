# NMS Optimizer : disposition technique et calculateur de bonus de contiguïté pour No Man's Sky

![Capture d'écran de l'application NMS Optimizer montrant une grille technologique de vaisseau spatial avec un placement de module optimisé](/assets/img/screenshots/screenshot.png)

NMS Optimizer détermine où placer vos modules technologiques pour que vous n'ayez pas à le faire. Choisissez votre plateforme, sélectionnez vos modules, marquez vos emplacements suralimentés et l'optimiseur calcule la disposition qui tire le meilleur parti de vos bonus de contiguïté. Il fonctionne pour les vaisseaux spatiaux, les corvettes, les outils multifonctions, les exosuits, les exocraft et les cargos.

## Qu'est-ce qu'un bonus de contiguïté ?

Lorsque vous placez des modules technologiques compatibles les uns à côté des autres dans No Man's Sky, ils obtiennent une amélioration de leurs statistiques. Le jeu ne vous dit pas grand-chose sur la façon dont cela fonctionne, mais la version courte : les modules du même type qui partagent un avantage obtiennent un pourcentage d'augmentation de leurs statistiques. Plus il y a d’avantages partagés, plus le bonus est important. Déterminer manuellement le bon agencement est fastidieux, en particulier sur les réseaux plus grands avec des emplacements suralimentés à prendre en compte.

## Que sont les machines à sous suralimentées ?

Certains emplacements d'inventaire dans No Man's Sky sont suralimentés. Tout module technologique placé dans un module obtient un multiplicateur de statistiques important en plus des bonus de contiguïté normaux. Ils sont placés de manière aléatoire sur chaque pièce d'équipement, de sorte que la disposition optimale change en fonction de l'endroit où vos emplacements suralimentés ont atterri. C’est la partie la plus difficile, et c’est pour cela que cet outil est conçu.

## Comment ça marche

L'optimiseur utilise une combinaison de correspondance de modèles déterministe et de recuit simulé. Pour les ensembles de modules plus petits, il peut trouver la meilleure disposition exacte. Pour les grilles plus grandes ou plus complexes, le recuit simulé explore des milliers d’arrangements pour en trouver un qui obtient le score le plus élevé possible. La notation prend en compte les bonus de contiguïté, le placement des emplacements suralimenté et les pondérations statistiques spécifiques aux modules. Le backend fonctionne dans Rust pour plus de rapidité.

## Plateformes prises en charge

- Vaisseaux spatiaux (standard, sentinelle, solaire, chasseur, vivant, atlantide)
- Corvette
- Multioutils (standard et sentinelle)
- Exocombinaisons
- Exocraft (errant, pèlerin, nomade, colosse, minotaure, nautilon)
- Cargos