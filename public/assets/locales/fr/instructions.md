# Aide de l'optimiseur NMS

## Utilisation de base

- Sélectionnez une **Plateforme** (Starship, Multi-Tool, Corvette, etc.) à l'aide de l'icône <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon>.
- **Cliquez** ou **appuyez deux fois** (mobile) sur une cellule pour la marquer **Suralimentée**.
- **Ctrl-clic (Windows) / ⌘-clic (Mac) / simple pression (mobile)** pour basculer une cellule **active** ou **inactive**.
- Utilisez **row toggles** pour activer ou désactiver des lignes entières. *(Les bascules de ligne sont désactivées une fois les modules placés.)*
- Utilisez le bouton **sélection de module** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> pour ajouter ou supprimer des modules individuels au sein d'un groupe technologique.

> 💡 **Remarque :**
> Les Exosuits et Exocraft ont des grilles fixes. Les cellules Exocraft ne peuvent pas être modifiées. Sur les Exosuits, seuls les états actif/inactif peuvent être modifiés – les dispositions suralimentées sont corrigées.

## Avant de commencer

Cet outil est destiné à l'**optimisation de fin de partie** et fonctionne mieux lorsque :

- La plupart ou la totalité des cellules de la grille sont déverrouillées.
- Toutes les technologies pertinentes sont disponibles.
- Vous disposez de **trois modules de mise à niveau** par technologie.

Les configurations partielles sont prises en charge, mais les résultats sont optimisés pour les plates-formes entièrement mises à niveau.

## Thêta / Tau / Sigma

Ces étiquettes classent les améliorations procédurales **par statistiques**, et non par classe. Ce sont des termes hérités conservés par souci de cohérence.

- **Thêta (1)** — meilleures statistiques
- **Tau (2)** — milieu
- **Sigma (3)** — le plus faible

Vous ne verrez pas ces étiquettes dans le jeu. Ils sont attribués en comparant directement les statistiques de mise à niveau.

### Comparaison en jeu

Ignorez les lettres de classe (S, X, etc.) et comparez les statistiques :

- Meilleur → **Thêta**
- Deuxième → **Tau**
- Le pire → **Sigma**

**La classe ne détermine pas le classement.** Les mises à niveau de la Classe X peuvent surpasser ou sous-performer la Classe S.

## Corvette

Les corvettes diffèrent des autres plates-formes : elles peuvent avoir **jusqu'à trois ensembles de mises à niveau distincts**.

- **Les améliorations cosmétiques** sont affichées sous la forme `Cn`.
- Les **mises à niveau du réacteur** sont affichées sous la forme `Rn`.

Le solveur peut suggérer des améliorations esthétiques pour les performances par rapport à l'apparence, bien que les différences soient généralement mineures.

## Builds recommandées

Pour les **Exosuits** et **Exocraft**, les cellules suralimentées sont fixes et les configurations viables sont limitées.
L'outil fournit des **versions recommandées sélectionnées à la main** reflétant des combinaisons optimales.

Les suggestions et mises en page alternatives sont les bienvenues via les discussions sur le projet :
https://github.com/jbelew/nms_optimizer-web/discussions

## Sauvegarde, chargement et partage

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Load** — Téléchargez un fichier `.nms` enregistré pour restaurer une mise en page.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Enregistrer** — Téléchargez la mise en page actuelle sous forme de fichier `.nms`.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Partager** — Génère un lien que d'autres peuvent ouvrir directement dans l'optimiseur.

## Conseils d'utilisation

Les cellules suralimentées sont limitées – le placement est important.

- Commencez par **une technologie à fort impact** qui bénéficie de plusieurs cellules suralimentées.
- Attribuez les cellules suralimentées restantes à une **technologie de deuxième priorité** plutôt que de tout empiler au même endroit.
- Donnez la priorité aux technologies avec **un plus grand nombre de modules** avant que l'espace ne devienne limité.
- Laissez le solveur gérer le placement ; votre rôle est de **fixer les priorités**.

Si l'espace devient restreint, vous devrez peut-être réinitialiser et résoudre les technologies dans un ordre différent pour éviter une **alerte d'optimisation**.

## Conseil de pro

Le solveur utilise des fenêtres fixes dimensionnées en fonction du nombre de modules de chaque technologie pour trouver des emplacements optimisés en termes d'espace.
Si les résultats ne sont pas idéaux, **désactivez temporairement les cellules** pour guider le solveur vers une meilleure présentation.
