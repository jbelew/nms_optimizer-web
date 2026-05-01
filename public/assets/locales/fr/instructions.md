# Instructions de l'NMS Optimizer : Modules et Emplacements Surchargés

## Premiers Pas Avec La Grille

- Sélectionnez une **Plateforme** (Vaisseau, Multi-outil, Corvette, etc.) via l'icône <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Cliquez** ou **appuyez deux fois** (mobile) sur un emplacement pour le marquer comme **Surchargé**.
- **Ctrl-clic (Windows) / ⌘-clic (Mac) / appui simple (mobile)** pour basculer un emplacement entre **actif** et **inactif**.
- Utilisez les **interrupteurs de rangée** pour activer ou désactiver des lignes entières. _(Ils sont désactivés une fois que des modules sont placés)._
- Utilisez le bouton de **sélection de modules** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> pour ajouter ou retirer des modules individuels.

> 💡 **Note :**
> L'Exocombinaison et les Exonefs ont des grilles fixes. Les slots des Exonefs ne peuvent pas être modifiés. Pour l'Exocombinaison, seuls les états actif/inactif peuvent être changés ; la disposition des slots surchargés est fixe.

## Avant De Commencer

Cet outil est conçu pour l'**optimisation de fin de jeu** et fonctionne mieux quand :

- La plupart des slots de la grille sont déverrouillés.
- Toutes les technologies pertinentes sont disponibles.
- Vous possédez **trois modules d'amélioration** par technologie.

Les configurations partielles sont supportées, mais les résultats sont optimisés pour les plateformes totalement améliorées.

## Conseils d'Utilisation

Les emplacements surchargés sont limités — leur placement est crucial.

- **N'assignez pas tous vos slots surchargés à la première technologie que vous placez.** Cela bloque souvent des dispositions globales plus puissantes par la suite.
- Commencez par assigner **2 à 3 slots surchargés à une technologie à fort impact**, pas la totalité.
- Réservez au moins **un ou plusieurs slots surchargés** pour une **deuxième technologie prioritaire** afin d'améliorer l'efficacité globale.
- Une fois vos slots surchargés épuisés, priorisez les technologies ayant le **plus grand nombre de modules** avant que l'espace ne manque.
- Laissez le moteur de calcul gérer le placement ; votre rôle est de **fixer les priorités et la répartition**.

Si l'espace devient trop restreint, vous devrez peut-être réinitialiser et optimiser les technologies dans un ordre différent pour éviter une **Alerte d'Optimisation**.

## Astuce De Pro

L'optimiseur utilise des fenêtres fixes dimensionnées selon le nombre de modules de chaque technologie pour trouver les emplacements les plus compacts.
Si les résultats ne sont pas idéaux, **désactivez temporairement certains slots** pour guider l'optimiseur vers une meilleure disposition.

## Étiquettes Theta / Tau / Sigma

Ces labels classent les améliorations procédurales **par statistiques**, et non par classe. Ce sont des termes historiques conservés pour la cohérence.

- **Theta (1)** — meilleures statistiques
- **Tau (2)** — intermédiaire
- **Sigma (3)** — plus faible

Vous ne verrez pas ces étiquettes en jeu. Elles sont attribuées en comparant directement les valeurs des améliorations.

### Comparaison En Jeu

Ignorez les lettres de classe (S, X, etc.) et comparez les stats :

- Meilleur → **Theta**
- Second → **Tau**
- Moins bon → **Sigma**

**La classe ne détermine pas le rang.** Une amélioration de classe X peut être supérieure ou inférieure à une classe S.

## Corvettes

Les Corvettes diffèrent des autres plateformes : elles peuvent avoir **jusqu'à trois ensembles d'améliorations distincts**.

- Les **améliorations cosmétiques** sont notées `Cn`.
- Les **améliorations de réacteur** sont notées `Rn`.

L'optimiseur peut suggérer des améliorations cosmétiques pour la performance plutôt que pour l'apparence, bien que les différences soient généralement mineures.

## Builds Recommandées

Pour l'**Exocombinaison** et les **Exonefs**, les slots surchargés sont fixes et les dispositions viables sont limitées.
L'outil propose des **builds recommandées sélectionnées à la main** qui reflètent les combinaisons optimales.

Vos suggestions et variantes sont les bienvenues sur les discussions du projet :
https://github.com/jbelew/nms_optimizer-web/discussions

## Sauvegarder, Charger Et Partager

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Charger** — Téléchargez un fichier `.nms` pour restaurer une build.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Sauvegarder** — Téléchargez la build actuelle au format `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Partager** — Générez un lien que d'autres peuvent ouvrir directement.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Capture** — Générez une image de votre build actuelle.
