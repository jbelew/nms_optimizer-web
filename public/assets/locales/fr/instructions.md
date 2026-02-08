# Guide de l'optimiseur NMS : bonus de contiguïté et optimisation de la mise en page

## Utilisation de base

- **Cliquez ou appuyez** sur l'icône ⚙️ pour sélectionner votre **Plateforme** (Vaisseaux spatiaux, Multi-outils, Corvettes, etc.).
- **Cliquez ou appuyez deux fois** (sur mobile) pour marquer une cellule comme **Suralimentée**.
- **Ctrl-clic** (Windows) / **⌘-clic** (Mac) ou **une seule pression** (sur mobile) pour basculer l'état **actif** d'une cellule.
- Utilisez les **boutons bascule de ligne** pour activer ou désactiver des lignes entières. Les bascules de ligne sont **désactivées une fois les modules placés**.

> 💡 **Remarque :** Les Exosuits et Exocraft ont des configurations de grille fixes. Les cellules Exocraft ne peuvent pas du tout être modifiées. Sur les Exosuits, vous pouvez uniquement activer ou désactiver les cellules ; la modification de la disposition suralimentée n'est pas prise en charge.

## Avant de commencer

Cet outil est conçu pour les **joueurs de fin de partie** qui optimisent la configuration technologique de leur plate-forme pour une efficacité maximale. Cela fonctionne mieux quand :

- Vous avez débloqué **la plupart ou toutes les cellules** de votre plateforme (Starship, Exosuit, Exocraft ou Multi-Tool).
- Vous avez accès à **toutes les technologies pertinentes**.
- Vous possédez un **ensemble complet de trois modules de mise à niveau** par technologie applicable.

Si vous déverrouillez toujours des cellules ou collectez des modules, l'outil peut toujours fournir des informations, mais il est principalement conçu pour les **plates-formes entièrement mises à niveau**.

## Étiquettes Thêta / Tau / Sigma

Ces étiquettes classent les améliorations procédurales **par qualité statistique**, et non par classe. Il s'agit de **termes hérités des versions antérieures du jeu**, conservés pour maintenir la cohérence du thème et du style.

- **Theta** — meilleure mise à niveau procédurale _(affiché comme **1** dans la grille)_
- **Tau** — milieu _(affiché comme **2** dans la grille)_
- **Sigma** — pire _(affiché comme **3** dans la grille)_

Vous ne verrez pas ces noms dans votre inventaire. Ils sont attribués en **comparant les statistiques réelles des mises à niveau pour la même technologie**.

### Comment utiliser ceci dans le jeu

Ignorez la lettre de classe (S, X, etc.). Comparez plutôt les statistiques directement :

- Meilleures statistiques → **Thêta (1)**
- Deuxième meilleur → **Tau (2)**
- Pires statistiques → **Sigma (3)**

### Classe S vs Classe X

La classe ne détermine **pas** le rang. Les mises à niveau de la Classe X peuvent être supérieures ou inférieures à celles de la Classe S.

- Si une Classe X a les meilleures statistiques, c'est **Thêta (1)**
- Si une Classe S est plus faible, elle devient **Tau (2)** ou **Sigma (3)**

**En résumé :** Thêta/Tau/Sigma signifie simplement **meilleur/milieu/pire**, en se basant uniquement sur les statistiques.

## Informations sur les Corvettes

Les Corvettes fonctionnent un peu différemment des autres plates-formes : au lieu d’un seul ensemble de mises à niveau, elles peuvent en avoir jusqu’à trois.

- **Les améliorations cosmétiques** sont affichées sous la forme « Cn ».
- Les **mises à niveau du réacteur** sont affichées sous la forme « Rn ».

Le solveur suggérera également les meilleures mises à niveau esthétiques si vous préférez donner la priorité aux performances plutôt qu'à l'apparence – bien qu'en pratique, les compromis soient assez minimes la plupart du temps.

## Builds recommandées

Pour les plates-formes comme **Exosuits** et **Exocraft**, où les cellules suralimentées sont fixes, le nombre de configurations viables est **extrêmement limité**.
Cela permet à l'outil de proposer des **versions recommandées** : des mises en page soigneusement sélectionnées et très avisées reflétant les meilleures combinaisons disponibles.

Si vous avez des commentaires ou souhaitez suggérer des configurations alternatives, n'hésitez pas à [démarrer une discussion](https://github.com/jbelew/nms_optimizer-web/discussions) — ces versions sont organisées, non générées automatiquement, et la contribution de la communauté contribue à les améliorer.

## Sauvegarde, chargement et partage de builds

Vous pouvez enregistrer vos mises en page optimisées, les recharger plus tard ou les partager avec des amis, ce qui facilite la gestion de plusieurs configurations pour la même plateforme.

- **Enregistrer la construction** — Cliquez sur l'icône d'enregistrement pour télécharger votre mise en page actuelle sous forme de fichier « .nms ». Vous serez invité à nommer votre build ; l'outil génère également automatiquement des noms thématiques comme « Corvette - Crusade of the Starfall.nms » , que vous pouvez personnaliser.
- **Load Build** — Cliquez sur l'icône de chargement pour télécharger un fichier « .nms » précédemment enregistré. Votre grille sera immédiatement mise à jour pour correspondre à la disposition enregistrée, y compris tous les emplacements de modules et les positions des cellules suralimentées.
- **Partager la construction** — Cliquez sur l'icône de partage pour générer un lien partageable pour votre mise en page actuelle. Les amis peuvent utiliser ce lien pour charger votre build directement dans leur optimiseur sans avoir besoin du fichier.

## Conseils d'utilisation

Les cellules suralimentées offrent des bonus majeurs mais sont limités : chaque placement compte. **Évitez de faire correspondre aveuglément votre disposition suralimentée dans le jeu.** Pour de meilleurs résultats :

- **Commencez avec une technologie à fort impact** — une qui correspond à votre style de jeu et bénéficie de deux ou trois cellules suralimentées, telles que _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_ ou _Neutron Cannon_.
  Marquez ces cellules comme suralimentées, puis résolvez.
- **Utilisez vos cellules suralimentées restantes** pour une technologie de deuxième priorité comme _Hyperdrive_, _Scanner_ ou _Mining Beam_, et résolvez à nouveau. Répartir les bonus vaut généralement mieux que de les empiler tous sur une seule technologie.
- Une fois vos technologies de base résolues, concentrez-vous sur celles avec **un plus grand nombre de modules** (par exemple _Hyperdrive_, _Starship Trails_) avant de manquer d'espace contigu.
- Le solveur fait le gros du travail : votre travail consiste à **prioriser les technologies** en fonction de votre façon de jouer.

À mesure que l'espace sur la grille devient restreint, vous devrez peut-être **réinitialiser quelques technologies** et les résoudre dans un ordre différent pour éviter la redoutable **alerte d'optimisation**. Avec un vaisseau entièrement amélioré, vous aurez souvent une grille complètement pleine.

## Conseil de pro

Il y a de vraies mathématiques derrière le placement. Le solveur recherche des fenêtres fixes correspondant au nombre de modules dont une technologie a besoin et trouve généralement la disposition la plus efficace en termes d'espace. Si quelque chose ne s'aligne pas, essayez de **désactiver temporairement quelques cellules** pour l'orienter vers un meilleur endroit sur la grille.