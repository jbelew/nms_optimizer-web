# Optimiseur NMS : Créateur de Layouts et Calculateur d'Adjacence

![Capture d'écran de l'application Optimiseur NMS montrant une grille de technologie de vaisseau avec un placement de modules optimisé](/assets/img/screenshots/screenshot.png)

L'Optimiseur NMS calcule pour vous le meilleur emplacement pour vos modules technologiques. Choisissez votre plateforme, sélectionnez vos modules, marquez vos emplacements surchargés, et l'optimiseur générera la disposition qui maximise vos bonus d'adjacence. Fonctionne pour les vaisseaux, corvettes, multi-outils, exocombinaisons, exonefs et cargos.

## Qu'est-ce Qu'un Bonus d'Adjacence ?

Lorsque vous placez des modules technologiques compatibles les uns à côté des autres dans No Man's Sky, ils bénéficient d'un boost de statistiques. Le jeu explique peu ce mécanisme, mais pour faire simple : les modules de même type partageant un bord commun voient leurs attributs augmenter. Plus ils partagent de bords, plus le bonus est important. Déterminer la disposition idéale manuellement est fastidieux, surtout sur de grandes grilles avec des emplacements surchargés à prendre en compte.

## Que Sont Les Emplacements Surchargés ?

Certains emplacements d'inventaire dans No Man's Sky sont surchargés. Tout module technologique placé sur l'un d'eux reçoit un multiplicateur de statistiques important, en plus des bonus d'adjacence habituels. Leur position est aléatoire sur chaque équipement, la disposition optimale change donc selon l'emplacement de ces slots surchargés. C'est là toute la difficulté, et c'est précisément pour cela que cet outil a été conçu.

## Comment Ça Fonctionne

L'optimiseur utilise une combinaison de correspondance de modèles déterministe et de recuit simulé (Simulated Annealing). Pour les petits ensembles de modules, il peut trouver la solution parfaite. Pour les grilles plus complexes, le recuit simulé explore des milliers de combinaisons pour identifier celle qui offre le score le plus élevé. Le calcul prend en compte les bonus d'adjacence, la position des slots surchargés et le poids spécifique de chaque statistique de module. Le moteur de calcul est écrit en Rust pour une vitesse maximale.

## Plateformes Supportées

- Vaisseaux (Standard, Sentinelle, Solaire, Combattant, Organique, Atlantide)
- Corvettes
- Multi-outils (Standard et Sentinelle)
- Exocombinaisons
- Exonefs (Vagabond, Pèlerin, Nomade, Colosse, Minotaure, Nautilon)
- Cargos
