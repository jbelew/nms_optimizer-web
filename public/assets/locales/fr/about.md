## Aperçu

Cette application Web, **l'Optimiseur NMS**, aide les joueurs de _No Man's Sky_ à déterminer le meilleur arrangement de modules pour concevoir des **Starship Layouts**, **Corvette Layouts**, **Multitool Builds**, **Exocraft Layouts** et **Exosuit Builds**.
Elle calcule automatiquement le **placement idéal des modules** pour maximiser les mécanismes cruciaux du jeu, comme les **bonus d'adjacence** (réalisés en regroupant des technologies similaires pour les effets synergiques) et les puissants boosts à partir des **emplacements suralimentés**.
Comprendre comment utiliser au mieux ces fonctionnalités, en particulier les emplacements suralimentés, est la clé pour atteindre les performances de pointe — et cet outil rend ce processus complexe simple.

---

## Comment ça marche

> Comment résoudre un problème avec jusqu’à ~8,32 × 10⁸¹ permutations possibles (82 chiffres!) en moins de cinq secondes?

Déterminer le meilleur placement absolu des modules, avec autant de combinaisons possibles pour une grille complète, n’est pas une mince affaire.
Cet outil combine **motifs déterministes**, **apprentissage automatique** et **recuit simulé** pour livrer des suggestions de premier plan en moins de cinq secondes.
Il considère tous les facteurs, y compris les **bonus d’adjacence** et l’utilisation stratégique des **emplacements suralimentés**.

1. **Pré-solution basée sur des modèles** — commence par une bibliothèque organisée de mises en page testées à la main, optimisées pour les bonus d’adjacence.
2. **Placement guidé par l’IA (inférence ML)** — si une configuration inclut des emplacements suralimentés, un modèle TensorFlow entraîné sur plus de 16 000 grilles prédit le placement optimal.
3. **Recuit simulé (raffinement)** — affine la disposition par recherche stochastique, en déplaçant les modules pour améliorer la note d’adjacence tout en évitant les optima locaux.
4. **Présentation des résultats** — retourne la meilleure configuration avec les scores détaillés et une visualisation de la mise en page.

---

## Fonctionnalités clés

- **Optimisation complète de la grille** — prise en charge des emplacements standard, suralimentés et inactifs pour trouver la disposition réellement optimale.
- **Utilisation stratégique des emplacements suralimentés** — décide intelligemment s’il faut placer des technologies de base (ex. arme principale) ou leurs meilleures améliorations sur ces slots, en équilibrant dégâts, portée ou efficacité.
- **Inférence via apprentissage automatique** — modèle entraîné sur 16 000+ dispositions historiques pour détecter les meilleurs schémas.
- **Recuit simulé avancé** — raffinement méticuleux garantissant que chaque point de performance est exploité.

---

## Pourquoi utiliser cet outil ?

Arrêtez de deviner le placement technologique et débloquez le véritable potentiel de votre équipement!
Que vous visiez :

- un maximum de dégâts avec un **Starship Build**,
- une **Corvette Build** puissante,
- une portée de scan ultime avec une **Multitool Layout** parfaite,
- un **Exocraft** optimisé,
- ou une **Exosuit** robuste,

cet outil vous permet de planifier vos améliorations en toute confiance et d’atteindre des performances de haut niveau — sans des heures d’essais manuels.

---

## Tech Stack

- **Frontend :** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Test :** Vitest, Python Unittest
- **Déploiement :** Heroku (hosting) et Cloudflare (DNS & CDN)
- **Automatisation :** GitHub Actions (CI/CD)
- **Analytics :** Google Analytics

---

## Référentiels

- Web UI : [https://github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend : [https://github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

---

## Une histoire amusante

Voici un aperçu d’une **première version** de l’interface utilisateur — fonctionnelle mais visuellement minimale.
La version actuelle est une mise à jour majeure, avec un design, une convivialité et une clarté bien améliorés.
Elle aide les joueurs à trouver rapidement la **meilleure disposition** pour tout vaisseau ou outil.

![Prototype précoce de l'interface No Man's Sky Layout Optimizer](/assets/img/screenshots/screenshot_v03.png)
