# Instructions de NMS Optimizer : modules et emplacements surchargés

## Premiers pas avec la grille

- Sélectionnez un **Type de plateforme** (Vaisseau, Multi-outil, Corvette, etc.) avec le bouton <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Cliquez** ou **appuyez deux fois** (mobile) sur un emplacement vide pour basculer son état **Surchargé**.
- **Ctrl-clic** (Windows) / **⌘-clic** (Mac) / **appui simple** (mobile) sur un emplacement pour basculer son état **actif** ou **inactif**.
- **Commandes clavier :** Appuyez sur les **touches fléchées** (↑, ↓, ←, →) et **Début** / **Fin** pour déplacer le focus. Appuyez sur **S** ou **Maj+Entrée** pour basculer l'état **Surchargé**. Appuyez sur **Espace** ou **Entrée** pour basculer l'état **actif** ou **inactif**.
- Utilisez les **interrupteurs de rangée** pour activer ou désactiver une rangée entière. _(Les interrupteurs de rangée se verrouillent après le placement de modules sur la grille.)_
- Cliquez sur le bouton de **Sélection de modules** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> d'une **Catégorie de technologie** pour activer ou désactiver des modules individuels et afficher les dimensions requises de la **Fenêtre de calcul**.
- Basculez le **Mode Focus** <radix-icon name="EyeOpenIcon" size="20" color="var(--accent-11)"></radix-icon> pour réduire les distractions visuelles et améliorer la lisibilité du texte.

> 💡 **Remarque :**
> Des **Restrictions d'emplacements** s'appliquent à l'exocombinaison et aux exonefs. Les exonefs utilisent une **Disposition de grille par défaut** fixe dont les emplacements ne peuvent pas être modifiés. L'exocombinaison possède des emplacements surchargés à position fixe : vous pouvez uniquement modifier l'état actif ou inactif des emplacements.

## Avant de commencer

Cet outil est conçu pour l'**optimisation de fin de jeu** et produit les meilleurs résultats lorsque :

- La plupart ou la totalité des emplacements de la grille sont actifs.
- Tous les modules de chaque **Catégorie de technologie** sont débloqués.
- Vous possédez **trois modules d'amélioration procéduraux** par **Catégorie de technologie**.

Vous pouvez optimiser des configurations partielles, mais le solveur cible des **Types de plateforme** entièrement améliorés.

## Conseils d'utilisation

Les emplacements surchargés sont limités. Répartissez-les sur plusieurs **Catégories de technologie** pour obtenir le bonus global le plus élevé :

- **N'attribuez pas tous les emplacements surchargés à la première Catégorie de technologie.** Cela réduit le bonus disponible pour les autres systèmes.
- Attribuez **2 à 3 emplacements surchargés** à votre **Catégorie de technologie** prioritaire.
- Réservez **1 ou plusieurs emplacements surchargés** pour une deuxième **Catégorie de technologie**.
- Une fois tous les emplacements surchargés occupés, optimisez d'abord les **Catégories de technologie** qui nécessitent les plus grandes dimensions de **Fenêtre de calcul**.
- Définissez vos priorités et laissez le solveur calculer le placement optimal des modules.

### Fenêtre de calcul et alertes d'optimisation

Chaque **Catégorie de technologie** requiert une **Fenêtre de calcul** (`largeur × hauteur`) déterminée par sa **Sélection de modules** active.

- Si aucune zone contiguë d'emplacements actifs ne correspond à la **Fenêtre de calcul** requise, une **Alerte d'optimisation** (**Modèle incompatible**) s'affiche.
- Depuis cette alerte, vous pouvez lancer une **Optimisation forcée** (recuit simulé complet sur l'ensemble des emplacements disponibles) ou annuler, utiliser la **Réinitialisation de technologie** sur des catégories déjà placées, puis optimiser dans un ordre différent.
- **Astuce de pro :** Désactivez temporairement certains emplacements (**inactifs**) avant de lancer le calcul afin de guider l'endroit où la **Fenêtre de calcul** sera placée.

## Ordre de rang des modules (Theta / Tau / Sigma)

L'**Ordre de rang des modules** (`Theta → Tau → Sigma`) classe les modules d'amélioration procéduraux **selon la valeur de leurs statistiques**, et non selon leur classe d'amélioration :

- **Theta (1)** — statistiques les plus élevées
- **Tau (2)** — statistiques intermédiaires
- **Sigma (3)** — statistiques les plus basses

Ces étiquettes n'apparaissent pas en jeu. Comparez directement les valeurs de statistiques de vos améliorations procédurales :

- Statistiques les plus élevées → **Theta**
- Deuxièmes statistiques les plus élevées → **Tau**
- Statistiques les plus basses → **Sigma**

**La classe d'amélioration ne détermine pas l'Ordre de rang des modules.** Une amélioration de classe X peut afficher des statistiques supérieures ou inférieures à celles d'une amélioration de classe S.

## Corvettes

Les Corvettes prennent en charge jusqu'à **trois Groupes de modules d'amélioration distincts** au sein d'une même **Catégorie de technologie** :

- Les **modules cosmétiques** portent l'étiquette `Cn`.
- Les **modules de réacteur** portent l'étiquette `Rn`.

Le solveur privilégie les bonus de statistiques plutôt que l'apparence visuelle lors du placement des modules cosmétiques.

## Builds recommandés

L'exocombinaison et les exonefs possèdent des emplacements surchargés fixes et moins de permutations possibles. Utilisez le menu **Builds recommandés** pour charger des dispositions éprouvées adaptées aux configurations courantes.

Proposez vos suggestions de dispositions ou vos retours dans les discussions du projet :
<https://github.com/jbelew/nms_optimizer-web/discussions>

## Sauvegarder, charger et partager

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Charger** — Ouvrez un **fichier de build** `.nms` sauvegardé depuis votre disque.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Sauvegarder** — Téléchargez la disposition actuelle sous forme de **fichier de build** `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Partager** — Générez une URL de **Grille partagée** qui ouvre votre disposition dans l'optimiseur.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Capture d'écran** — Enregistrez une image PNG de la disposition actuelle de la grille.
