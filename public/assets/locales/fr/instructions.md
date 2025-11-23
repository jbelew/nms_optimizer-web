## Utilisation de base

- **Cliquez ou appuyez** sur l'icône ⚙️ pour sélectionner votre **Plateforme** (Vaisseaux spatiaux, Multi-outils, Corvettes, etc.).
- **Cliquez ou appuyez deux fois** sur une cellule pour la marquer comme **Suralimentée** (jusqu'à 4 par grille).
- **Ctrl-clic** (Windows) / **⌘-clic** (Mac) ou **appui simple** (sur mobile) pour basculer l'état **actif** d'une cellule : les cellules actives peuvent contenir des modules.
- Utilisez les **boutons bascule de ligne** pour activer ou désactiver des lignes entières. Les bascules de ligne sont **désactivées une fois les modules placés** et réactivées lorsque vous appuyez sur **Réinitialiser la grille**.

> 💡 **Remarque :** Les Exosuits et Exocraft ont des configurations de grille fixes. Les cellules Exocraft ne peuvent pas du tout être modifiées. Sur les Exosuits, vous pouvez uniquement activer ou désactiver les cellules ; la modification de la disposition suralimentée n'est pas prise en charge.

## Sauvegarde et chargement des builds

Vous pouvez enregistrer vos mises en page optimisées dans un fichier et les recharger ultérieurement, ce qui facilite la gestion de plusieurs configurations pour la même plate-forme ou le partage de versions avec des amis.

- **Enregistrer la construction** — Cliquez sur l'icône d'enregistrement pour télécharger votre mise en page actuelle sous forme de fichier « .nms ». Vous serez invité à nommer votre build ; l'outil génère automatiquement des noms thématiques comme « Corvette - Crusade of the Starfall.nms » que vous pouvez personnaliser.
- **Load Build** — Cliquez sur l'icône de chargement pour télécharger un fichier « .nms » précédemment enregistré. Votre grille sera immédiatement mise à jour pour correspondre à la disposition enregistrée, y compris tous les emplacements de modules et les positions des cellules suralimentées.

Les fichiers de build sont validés pour leur intégrité et leur compatibilité : si une build a été enregistrée à partir d'un type de plate-forme différent ou est corrompue, l'outil vous le fera savoir.

## Avant de commencer

Cet outil est destiné aux **joueurs de fin de partie** qui optimisent la disposition technologique de leur plate-forme pour une efficacité maximale. Cela fonctionne mieux quand :

- Vous avez débloqué **la plupart ou toutes les cellules** de votre plateforme (Starship, Exosuit, Exocraft ou Multi-Tool).
- Vous avez accès à **toutes les technologies pertinentes**.
- Vous possédez un **ensemble complet de trois modules de mise à niveau** par technologie applicable.

Si vous déverrouillez toujours des cellules ou collectez des modules, l'outil peut toujours fournir des informations, mais il est principalement conçu pour les **plates-formes entièrement mises à niveau**.

## Informations sur les Corvettes

Les Corvettes fonctionnent un peu différemment des autres plates-formes : au lieu d’un seul ensemble de mises à niveau, elles peuvent en avoir jusqu’à trois.

- **Les améliorations cosmétiques** sont affichées sous la forme « Cn ».
- Les **mises à niveau du réacteur** sont affichées sous la forme « Rn ».

Le solveur suggérera également les meilleures mises à niveau esthétiques si vous préférez donner la priorité aux performances plutôt qu’à l’apparence – bien qu’en pratique, les compromis soient assez minimes la plupart du temps.

Gardez à l’esprit qu’un sous-système technologique Corvette entièrement mis à niveau prend **beaucoup** d’espace. Avec 60 emplacements technologiques complets, vous ne disposerez généralement que de trois ou quatre résolutions **min/max**, alors choisissez judicieusement.

## Builds recommandées

Pour les plates-formes comme **Exosuits** et **Exocraft**, où les cellules suralimentées sont fixes, le nombre de configurations viables est **extrêmement limité**. Au lieu de gérer des milliards de permutations comme nous le faisons pour les vaisseaux spatiaux ou les multi-outils, nous travaillons avec seulement une poignée de possibilités optimales.

Cela permet à l'outil de proposer des **versions recommandées** : des mises en page soigneusement sélectionnées et très avisées reflétant les meilleures combinaisons disponibles. Le système prend également en charge **plusieurs versions par plate-forme**, adaptées à différents cas d'utilisation. Par exemple:

- Le **Minotaur** comprend à la fois une **version à usage général** (pour lorsque vous le pilotez activement) et une **version de support dédiée à l'IA** (optimisée pour le déploiement à distance).

D'autres plates-formes pourraient inclure des **variantes spécialisées à l'avenir**, comme une **configuration de course de pèlerins** ou une **Exosuit optimisée par scanner**, en fonction des commentaires et de la demande des utilisateurs.

Si vous avez des commentaires ou souhaitez suggérer des configurations alternatives, n'hésitez pas à [démarrer une discussion](https://github.com/jbelew/nms_optimizer-web/discussions) — ces versions sont organisées, non générées automatiquement, et la contribution de la communauté contribue à les améliorer.

## Conseils d'utilisation

Les cellules suralimentées offrent des bonus majeurs mais sont limités : chaque placement compte. **Évitez de faire correspondre aveuglément votre disposition suralimentée dans le jeu.** Pour de meilleurs résultats :

- **Commencez avec une technologie à fort impact** — une qui correspond à votre style de jeu et bénéficie de deux ou trois cellules suralimentées, telles que _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_ ou _Neutron Cannon_.
  Marquez ces cellules comme suralimentées, puis résolvez.
- **Utilisez vos cellules suralimentées restantes** pour une technologie de deuxième priorité comme _Hyperdrive_, _Scanner_ ou _Mining Beam_, et résolvez à nouveau. Répartir les bonus vaut généralement mieux que de les empiler tous sur une seule technologie.
- Une fois vos technologies de base résolues, concentrez-vous sur celles avec **un plus grand nombre de modules** (par exemple _Hyperdrive_, _Starship Trails_) avant de manquer d'espace contigu.
- Le solveur fait le gros du travail : votre travail consiste à **prioriser les technologies** en fonction de votre façon de jouer.

À mesure que l'espace sur la grille devient restreint, vous devrez peut-être **réinitialiser quelques technologies** et les résoudre dans un ordre différent pour éviter la redoutable **alerte d'optimisation**. Avec un vaisseau entièrement amélioré, vous vous retrouverez souvent avec une seule cellule ouverte, voire aucune si vous optimisez un **Interceptor**.

## Conseil de pro

Il y a de vraies mathématiques derrière le placement. Le solveur fonctionne dans des fenêtres fixes en fonction du nombre de modules requis par une technologie et sélectionne généralement la disposition la plus efficace sans perdre d'espace. Mais si les choses ne s’alignent pas :

- Essayez de **désactiver quelques cellules** pour guider le solveur vers une meilleure fenêtre.
- Un petit ajustement peut libérer des zones de placement clés et améliorer votre mise en page finale.