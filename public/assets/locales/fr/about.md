# Comment fonctionne NMS Optimizer : optimisation de la mise en page technologique basée sur le ML

## Qu'est-ce que l'optimiseur NMS ?

NMS Optimizer est le meilleur calculateur de disposition technologique gratuit basé sur le Web pour les joueurs de No Man's Sky qui souhaitent trouver l'emplacement optimal des modules pour leur équipement. Cet outil vous aide à concevoir et visualiser des mises en page idéales pour :

- **Dispositions techniques des vaisseaux spatiaux** et constructions de vaisseaux spatiaux
- **Aménagements cargo** et placement de la technologie cargo
- **Agencements technologiques Corvette** et constructions de corvettes
- **Mise en page multi-outils** et versions multi-outils
- **Mise en page Exocraft** et versions d'exocraft
- **Dispositions d'exosuit** et placement de la technologie exosuit

L'outil gère les calculs automatiquement, en tenant compte des **bonus de contiguïté** (l'amélioration des performances que vous obtenez en plaçant des technologies compatibles les unes à côté des autres dans votre grille d'inventaire) et des **emplacements suralimentés** (les rares emplacements de grande valeur qui donnent des augmentations d'environ 25 à 30 %). Il calcule et trouve l'arrangement qui vous donne le score le plus élevé possible pour votre build.

## Comment ça marche ?

Le problème est mathématiquement énorme : ~8,32 × 10⁸¹ permutations possibles (82 chiffres de long). Nous le résolvons en utilisant la reconnaissance de formes, l’apprentissage automatique et l’optimisation. L'outil fonctionne en quatre étapes :

1. **Vérifiez les modèles sélectionnés :** Commencez par des modèles testés manuellement qui offrent de solides bonus de contiguïté
2. **Prédire avec le ML :** Si votre configuration comprend des emplacements suralimentés, un modèle TensorFlow, formé sur plus de 16 000 grilles du monde réel, prédit le meilleur emplacement pour les technologies de base.
3. **Affinez avec le recuit simulé :** Un optimiseur basé sur Rust échange les modules et change de position pour atteindre le meilleur score possible.
4. **Montrer le résultat :** L'outil affiche votre configuration avec le score le plus élevé avec la répartition des scores.

## Ce qu'il peut faire

- **Gère tous les types d'emplacements :** Emplacements standard, suralimentés et inactifs
- **Comprend les emplacements suralimentés :** L'optimiseur décide si une technologie de base ou sa meilleure mise à niveau doit être placée dans ces emplacements de grande valeur. Il gère les compromis pour maximiser votre objectif
- **Utilise des modèles ML :** Formé sur plus de 16 000 mises en page réelles pour identifier les arrangements les plus performants
- **Affine à la perfection :** Le recuit simulé extrait chaque point de pourcentage de performance possible

## Pourquoi l'utiliser

Évitez les essais et erreurs sans fin. Obtenez la disposition mathématiquement optimale pour votre vaisseau spatial à dégâts maximaux, votre cargo à plus longue portée, votre puissante Corvette ou votre Exosuit robuste. L'outil explique les bonus de contiguïté et les machines à sous suralimentées au lieu de vous laisser deviner. Si vous vous êtes déjà demandé comment utiliser au mieux vos emplacements suralimentés limités, ceci vous donne la réponse.

## Pourquoi choisir l'optimiseur NMS plutôt que la planification manuelle ?

**Le problème :** Les équipements de No Man's Sky peuvent avoir des millions d'arrangements technologiques possibles, et trouver la disposition optimale par essais et erreurs prend des heures.

**La solution :** NMS Optimizer utilise l'apprentissage automatique et des algorithmes avancés pour :
- Trouvez votre meilleure disposition technologique en quelques secondes
- Maximiser automatiquement les bonus de contiguïté
- Optimiser le placement des emplacements suralimentés
- Vous montrer la répartition exacte des scores
- Fonctionne pour tous les types d'équipements (vaisseaux, corvettes, outils multifonctions, exosuits, exocraft, cargos)
- Mise à jour en temps réel à mesure que vous ajustez vos sélections technologiques

Au lieu de deviner, vous obtenez à chaque fois la disposition mathématiquement optimale.

## Pile technologique

- **Frontend :** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solver :** Python, Flask, TensorFlow, NumPy, recuit et notation simulés basés sur Rust
- **Tests :** Vitest, Python Unittest
- **Déploiement :** Heroku (hébergement), Cloudflare (DNS et CDN), Docker
- **Automatisation :** Actions GitHub (CI/CD)
- **Analyses :** Google Analytics

## Dépôts

- Interface utilisateur Web : [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend : [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Questions fréquemment posées

### Q : Qu'est-ce qu'un bonus de contiguïté ?

R : Un **bonus de contiguïté** dans No Man's Sky est l'amélioration des performances que vous recevez lorsque vous placez des modules technologiques compatibles les uns à côté des autres dans votre grille d'inventaire. Différentes technologies ont différents partenaires de contiguïté. Par exemple, les améliorations d'armes donnent souvent des bonus lorsqu'elles sont placées les unes à côté des autres. L'optimiseur NMS analyse vos technologies sélectionnées et trouve l'arrangement qui maximise tous les bonus de contiguïté sur l'ensemble de votre réseau, vous garantissant ainsi les meilleurs multiplicateurs de performances possibles.

### Q : Comment fonctionnent les machines à sous suralimentées ?

R : Les **emplacements suralimentés** sont des emplacements d'inventaire rares et de grande valeur (généralement 4 par grille) qui fournissent un boost d'environ 25 à 30 % à tout ce qui y est placé. Il s'agit de l'un des biens immobiliers les plus précieux de votre réseau. Le défi consiste à décider quelles technologies doivent être utilisées dans ces emplacements limités. L'optimiseur utilise l'apprentissage automatique formé sur plus de 16 000 configurations réelles pour décider s'il convient de placer une technologie de base ou sa meilleure mise à niveau dans chaque emplacement suralimenté, maximisant ainsi vos performances globales.

### Q : Comment fonctionne l'optimiseur de placement de la technologie NMS ?

R : NMS Optimizer utilise trois méthodes fonctionnant ensemble :
1. **Correspondance de modèles** – Cela commence par des modèles de disposition technologiques testés manuellement et éprouvés qui offrent de solides bonus de contiguïté.
2. **Prédiction du machine learning** – Un réseau neuronal TensorFlow formé sur plus de 16 000 grilles du monde réel prédit le meilleur emplacement pour vos technologies principales
3. **Affinement du recuit simulé** – Un optimiseur basé sur Rust affine la mise en page en testant des milliers d'échanges de positions pour atteindre le meilleur score absolu possible.

Cette approche à trois couches résout ce qui serait autrement un problème incroyablement complexe (~8,32 × 10⁸¹ permutations).

### Q : Quels équipements No Man's Sky sont pris en charge par l'optimiseur ?

R : NMS Optimizer prend en charge tous les principaux équipements de No Man's Sky :

- **Vaisseaux spatiaux :** variantes Standard, Exotique, Sentinelle, Solaire, Vivante et MT (axées sur les outils multiples)
- **Corvettes :** Y compris des modules de réacteurs uniques et des emplacements de technologie cosmétique
- **Multitools :** Tous types, y compris les portées
- **Exocraft :** Tous les types de véhicules (Nomad, Pilgrim, Roamer, Minotaur, Nautilon)
- **Exosuits :** Tous les types de technologies
- **Cargos :** Dispositions technologiques des vaisseaux capitaux

### Q : Quelle est la précision de l'optimiseur ?

R : Très précis. L'optimiseur NMS combine des modèles de disposition testés manuellement, un apprentissage automatique formé sur plus de 16 000 grilles du monde réel et un algorithme de recuit simulé basé sur Rust pour trouver la disposition technologique mathématiquement optimale pour votre configuration exacte. Il prend en compte tous les bonus de contiguïté, les compromis suralimentés sur les emplacements et les emplacements inactifs pour maximiser les performances de votre build.

### Q : Puis-je trouver la meilleure configuration de vaisseau spatial, de corvette ou d'exosuit avec cet outil ?

R : Oui. L'optimiseur NMS trouve la **meilleure configuration technologique** pour tout type d'équipement :
- **Meilleures configurations de vaisseaux** compte tenu de vos choix en matière d'armes et de technologies utilitaires
- **Meilleures configurations de corvette** équilibrant les technologies de réacteur et de combat
- **Meilleures configurations d'exosuit** optimisant les technologies d'utilité, de défense et de mouvement
- **Meilleures configurations multi-outils** pour un maximum de dégâts ou d'utilité
- **Meilleures configurations de cargo** pour le stockage et l'utilité

Sélectionnez simplement votre type d'équipement, choisissez vos technologies, marquez vos emplacements suralimentés et l'optimiseur calcule la disposition mathématiquement optimale.

### Q : NMS Optimizer est-il gratuit ?

R : Oui. NMS Optimizer est entièrement gratuit, sans publicité et open source (licence GPL-3.0). Aucune inscription ni paiement requis. Toute optimisation s'effectue instantanément dans votre navigateur ou sur nos serveurs, sans frais.

### Q : Puis-je enregistrer et partager mes builds ?

R : Oui. Vous pouvez :
- **Enregistrez les builds** sous forme de fichiers `.nms` sur votre ordinateur et rechargez-les plus tard
- **Générez des liens partageables** pour envoyer votre mise en page technologique à des amis
- **Partagez votre build directement** via les réseaux sociaux ou la messagerie
Toutes les versions sont validées pour leur intégrité et la compatibilité des équipements avant le partage.

## Merci

George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrreally, Kevin Murray et tous ceux qui ont contribué : votre soutien signifie tout. Chaque don, partage et mot gentil m'aide à continuer à construire. Merci.

## Première version

Voici à quoi ressemblait l'interface utilisateur dans une première version : elle fonctionnait, mais la conception était minimale. La version actuelle constitue une amélioration majeure en termes de conception, de convivialité et de clarté.

![Premier prototype de l'interface utilisateur de l'optimiseur de mise en page de No Man's Sky](/assets/img/screenshots/screenshot_v03.png)