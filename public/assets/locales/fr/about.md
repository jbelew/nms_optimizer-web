# À Propos de l'NMS Optimizer : Le Calculateur de Disposition de Technologie Ultime pour No Man's Sky

**NMS Optimizer** est un outil 100 % gratuit et sans publicité conçu pour déterminer exactement où placer vos modules de technologie dans _No Man's Sky_. Vous choisissez votre équipement, sélectionnez vos modules d'amélioration de Classe S ou de Classe X, marquez vos emplacements suralimentés (Supercharged Slots), et notre calculateur génère presque instantanément la disposition qui maximise vos statistiques en jeu.

En équilibrant parfaitement les mécanismes du jeu, une disposition optimisée obtient généralement un score **15-20 % plus élevé** que ce que la plupart des joueurs peuvent arranger manuellement.

## Le Problème : Maximiser les Bonus d'Adjacence (Adjacency Bonuses) & les Emplacements Suralimentés

_No Man's Sky_ n'explique pas explicitement les bonus d'adjacence et n'offre aucune indication sur la stratégie des emplacements suralimentés. Maximiser la maniabilité de votre vaisseau ou les dégâts de votre multi-outil signifie jongler avec deux systèmes complexes :

- **Bonus d'Adjacence :** Lorsque vous placez des modules de technologie compatibles côte à côte sur la grille d'inventaire, ils obtiennent un boost de statistiques. Différentes technologies ont des partenaires d'adjacence différents : les améliorations d'armes se boostent mutuellement, la technologie de mouvement booste d'autres technologies de mouvement, et plus vous créez de bords partagés, plus le bonus cumulatif est important.
- **Emplacements Suralimentés :** Ces rares emplacements d'inventaire (généralement jusqu'à 4 par grille) donnent un multiplicateur massif de statistiques de ~25-30 % à tout module placé à l'intérieur.

Trouver le meilleur arrangement absolu signifie tester des combinaisons sur des millions de permutations possibles — jusqu'à environ 8.32 × 10⁸¹ pour une grille entièrement étendue. Personne ne résout cela manuellement.

## Comment Fonctionne le Moteur d'Optimisation de Disposition

Nous ne comptons pas sur des suppositions. Le moteur de l'NMS Optimizer utilise un flux de travail sophistiqué en quatre étapes pour trouver automatiquement votre meilleur build :

1.  **Reconnaissance de Modèles :** Le solveur commence avec des arrangements testés manuellement et approuvés par la communauté qui obtiennent de manière fiable de bons scores pour des ensembles de modules communs.
2.  **Apprentissage Automatique (IA) :** Si votre grille a des emplacements suralimentés uniques, un modèle d'apprentissage automatique TensorFlow — entraîné sur plus de 16 000 dispositions à haut score — prédit les placements les plus intelligents pour vos technologies principales par rapport à vos modules d'amélioration.
3.  **Recuit Simulé (Simulated Annealing) :** Notre moteur d'optimisation central, construit en Rust, échange rapidement les modules et teste des milliers d'arrangements en quelques millisecondes pour grimper vers le score le plus élevé absolu possible.
4.  **Affichage des Résultats :** Vous voyez immédiatement la disposition gagnante aux côtés d'une ventilation complète des multiplicateurs d'adjacence.

## Équipements Pris en Charge

L'NMS Optimizer fournit une résolution dynamique pour chaque plateforme majeure du jeu :

- **Vaisseaux (Starships) :** Vaisseaux Standard, Exotiques (Exotic), Intercepteurs Sentinelles (Sentinel Interceptor), Solaires, Chasseurs (Fighter), Vivants (Living), et Atlantide.
- **Multi-outils (Multi-Tools) :** Toutes les variantes d'armes et d'extraction, y compris les Bâtons (Staves).
- **Exocombinaisons (Exosuits) & Exonefs (Exocraft) :** Toutes les technologies d'Exocombinaison et les types de véhicules (Nomade, Colosse, Pèlerin, Vagabond, Minotaure, Nautilon).
- **Cargos (Freighters) :** Technologie d'hyperpropulsion de vaisseau amiral et de coordination de la flotte.
- **Corvettes :** Prise en charge des dispositions complexes, y compris les modules de réacteur uniques et les emplacements de technologie cosmétique.

## Foire Aux Questions (FAQ)

**Que devrais-je mettre dans mes emplacements suralimentés ?**
Cela dépend de votre disposition ! Parfois, il est préférable de suralimenter votre technologie principale, et d'autres fois, il est préférable de suralimenter votre amélioration aux statistiques les plus élevées. Notre modèle d'IA a été entraîné sur plus de 16 000 dispositions réelles spécifiquement pour prendre cette décision à votre place.

**L'NMS Optimizer est-il gratuit ?**
Oui. Il est 100 % gratuit, sans publicité et open-source (GPL-3.0). Vous n'avez pas besoin de créer de compte ou de fournir une adresse e-mail.

**Puis-je sauvegarder et partager mes dispositions ?**
Oui ! Vous pouvez sauvegarder vos builds préférés localement sous forme de fichiers `.nms`, générer des liens partageables à envoyer à vos amis, ou partager des captures d'écran de dispositions de haute qualité directement sur les réseaux sociaux. Les builds sont validés pour leur intégrité avant d'être partagés.

**Pourquoi l'outil ne montre-t-il pas les statistiques en jeu ?**
L'outil évite intentionnellement de calculer les métriques standard du jeu comme le DPS ou la Portée en Années-Lumière. Parce que les nombres exacts nécessitent des seeds de vaisseau cachées inaccessibles sans un éditeur de sauvegarde, l'optimiseur s'appuie plutôt sur un score en "pourcentage du maximum".

**Pourquoi la disposition optimisée n'inclut-elle pas mon module d'Expédition spécifique ?**
L'NMS Optimizer prend entièrement en charge toutes les **Récompenses d'Expédition et Redux d'Expédition** offertes après la mise à jour _Worlds Part I_. Cependant, comme tous les joueurs ne possèdent pas ces objets rares, ces modules optionnels ne sont pas inclus par défaut dans vos résolutions. Vous pouvez facilement les activer pour votre build en ouvrant <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> l'**interface de Sélection des Modules**.

## Sous le Capot : Notre Pile Technologique

Pour les développeurs et les passionnés de données, voici la pile technologique qui alimente l'NMS Optimizer :

- **Frontend :** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Backend Solveur :** Python, Flask, TensorFlow, NumPy, Rust (alimente le recuit simulé et le moteur de notation)
- **Tests :** Vitest, Python Unittest
- **Déploiement & Hébergement :** Heroku (hébergement API), Cloudflare (DNS/CDN), Docker
- **CI/CD :** GitHub Actions

### Dépôts Open Source

Vous voulez contribuer ? L'NMS Optimizer est entièrement open-source.

- Interface Web : [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend : [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Un Grand Merci à la Communauté

Ce projet ne serait pas possible sans l'incroyable communauté de _No Man's Sky_. Un merci spécial à George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, et à tous les autres qui ont contribué. Votre soutien, vos dons, vos partages et vos mots gentils signifient tout et aident à garder ce projet en vie.

## Un Regard en Arrière : Les Premières Versions

![Early prototype of No Man's Sky layout optimizer user interface](/assets/img/screenshots/screenshot_v03.png)
Si vous étiez avec nous depuis le début, vous vous souvenez peut-être à quoi ressemblait l'interface utilisateur dans ses premières phases alpha. Elle fonctionnait, mais la conception était minimale. La version actuelle représente une amélioration majeure et continue en matière de conception, d'utilisabilité mobile et de clarté globale.
