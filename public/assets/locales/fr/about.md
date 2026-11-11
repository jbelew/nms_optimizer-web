# À propos de NMS Optimizer : le calculateur ultime de dispositions technologiques pour No Man's Sky

**NMS Optimizer** est un outil 100 % gratuit et sans publicité conçu pour déterminer exactement où placer vos modules de technologie dans _No Man's Sky_. Vous choisissez votre équipement, sélectionnez vos modules d'amélioration de classe S ou de classe X, marquez vos emplacements surchargés, et notre calculateur génère quasi instantanément la disposition qui maximise vos statistiques en jeu.

En équilibrant parfaitement les mécaniques du jeu, une disposition optimisée obtient généralement un score **15 à 20 % plus élevé** que ce que la plupart des joueurs parviennent à agencer manuellement.

## Le problème : maximiser les bonus d'adjacence et les emplacements surchargés

_No Man's Sky_ n'explique pas explicitement les bonus d'adjacence et ne fournit aucune indication sur la stratégie d'utilisation des emplacements surchargés. Maximiser la maniabilité de votre vaisseau ou les dégâts de votre multi-outil exige de combiner deux systèmes complexes :

- **Bonus d'adjacence :** Lorsque vous placez des modules technologiques compatibles côte à côte sur la grille d'inventaire, ils bénéficient d'un gain de statistiques. Chaque technologie possède ses propres partenaires d'adjacence : les améliorations d'armes se renforcent mutuellement, les systèmes de mouvement renforcent les autres technologies de mouvement, et plus les bords partagés sont nombreux, plus le bonus cumulé est important.
- **Emplacements surchargés :** Ces emplacements d'inventaire rares (généralement jusqu'à 4 par grille) confèrent un multiplicateur de statistiques massif d'environ 25 à 30 % au module qui y est installé.

Trouver le meilleur agencement absolu implique de tester des combinaisons parmi des millions de permutations possibles — jusqu'à environ 8,32 × 10⁸¹ pour une grille entièrement débloquée. Personne ne peut résoudre cela à la main.

## Fonctionnement du moteur d'optimisation de disposition

Nous ne comptons pas sur l'approximation. Le moteur de NMS Optimizer s'appuie sur un pipeline sophistiqué en quatre étapes pour déterminer automatiquement votre meilleur build :

1. **Reconnaissance de modèles :** Le solveur démarre avec des agencements testés manuellement et éprouvés par la communauté qui obtiennent d'excellents scores pour les ensembles de modules courants.
2. **Apprentissage automatique (IA) :** Si votre grille comporte des emplacements surchargés spécifiques, un modèle d'apprentissage automatique TensorFlow — entraîné sur plus de 16 000 dispositions à haut score — prédit s'il est plus avantageux d'y placer vos technologies principales ou vos modules d'amélioration.
3. **Recuit simulé :** Notre moteur d'optimisation central, développé en Rust, permute rapidement les modules et évalue des milliers d'agencements en quelques millisecondes afin d'atteindre le score maximal possible.
4. **Affichage du résultat :** Vous visualisez immédiatement la disposition retenue accompagnée du détail complet des multiplicateurs d'adjacence.

## Équipements pris en charge

NMS Optimizer propose une résolution dynamique pour chaque plateforme majeure du jeu :

- **Vaisseaux :** Vaisseaux standards, exotiques, intercepteurs sentinelles, solaires, chasseurs et vivants.
- **Multi-outils :** Toutes les variantes d'armes et d'extraction, y compris les bâtons.
- **Exocombinaison et exonefs :** Toutes les technologies d'exocombinaison et tous les types de véhicules (Nomade, Colosse, Pèlerin, Vagabond, Minotaure, Nautilon).
- **Cargos :** Technologies d'hyperpropulsion de vaisseau amiral et de coordination de flotte.
- **Corvettes :** Prise en charge des dispositions complexes, y compris les modules de réacteur uniques et les emplacements de technologies cosmétiques.

## Foire aux questions (FAQ)

**Que dois-je placer dans mes emplacements surchargés ?**
Tout dépend de votre disposition ! Il est parfois préférable de surcharger votre technologie principale, et d'autres fois d'y placer votre module d'amélioration aux statistiques les plus élevées. Notre modèle d'IA a été entraîné sur plus de 16 000 dispositions réelles précisément pour prendre cette décision à votre place.

**NMS Optimizer est-il gratuit ?**
Oui. Il est 100 % gratuit, sans publicité et open source (GPL-3.0). Vous n'avez pas besoin de créer de compte ni de fournir d'adresse e-mail.

**Puis-je sauvegarder et partager mes dispositions ?**
Oui ! Vous pouvez sauvegarder vos builds favoris localement sous forme de fichiers `.nms`, générer des liens de partage à envoyer à vos amis ou partager des captures d'écran haute qualité de vos dispositions sur les réseaux sociaux. L'intégrité des builds est vérifiée avant le partage.

**Pourquoi l'outil n'affiche-t-il pas les statistiques exactes en jeu ?**
L'outil évite volontairement de calculer les valeurs brutes affichées en jeu telles que le DPS ou la portée en années-lumière. Comme les chiffres exacts dépendent de graines procédurales cachées inaccessibles sans éditeur de sauvegarde, l'optimiseur exprime plutôt ses résultats sous forme de « pourcentage du maximum ».

**Pourquoi la disposition optimisée n'inclut-elle pas mon module d'Expédition spécifique ?**
NMS Optimizer prend entièrement en charge toutes les **récompenses d'Expédition et d'Expédition Redux** introduites après la mise à jour _Worlds Part I_. Toutefois, comme tous les joueurs ne possèdent pas ces objets rares, ces modules optionnels ne sont pas activés par défaut dans vos calculs. Vous pouvez facilement les activer pour votre build en ouvrant l'**interface de Sélection de modules** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon>.

## Sous le capot : notre pile technologique

Pour les développeurs et les passionnés de données, voici la pile technologique qui propulse NMS Optimizer :

- **Frontend :** TypeScript, React, Zustand, Vite, Tailwind CSS, Radix UI
- **Solveur backend :** Python, Flask, TensorFlow, NumPy, Rust (propulse le recuit simulé et le moteur de calcul des scores)
- **Tests :** Vitest, Python Unittest
- **Déploiement et hébergement :** Heroku (hébergement API), Cloudflare (DNS/CDN), Docker
- **CI/CD :** GitHub Actions

### Dépôts open source

Envie de contribuer ? NMS Optimizer est entièrement open source.

- Interface Web : [github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)
- Backend : [github.com/jbelew/nms_optimizer-service](https://github.com/jbelew/nms_optimizer-service)

## Un immense merci à la communauté

Ce projet n'existerait pas sans l'incroyable communauté de _No Man's Sky_. Un remerciement tout particulier à **George V, Diab, JayTee73, boldfish, Jason Hawks, Jeremy Ricketts, H. Blumenthal, u/rrrrreally, Kevin Murray, jayriley, arratikbehavior, Someone, Cal Abunga**, ainsi qu'à toutes les personnes qui ont contribué. Votre soutien, vos dons, vos partages et vos encouragements comptent énormément et font vivre ce projet.

## Rétrospective : les premières versions

![Premier prototype de l'interface utilisateur de l'optimiseur de dispositions No Man's Sky](/assets/img/screenshots/screenshot_v03.webp)
Si vous nous suivez depuis les débuts, vous vous souvenez peut-être de l'apparence de l'interface lors de ses premières versions alpha. Elle fonctionnait, mais son design restait minimaliste. La version actuelle est le fruit d'améliorations majeures et continues en matière de design, d'ergonomie mobile et de clarté générale.
