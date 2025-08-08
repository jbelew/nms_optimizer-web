## Utilisation de base

- **Cliquez ou appuyez** sur l'icône ⚙️ pour sélectionner votre **Technologie**.
- **Cliquez ou double-cliquez** sur une cellule pour la marquer comme **Surchargée** (jusqu'à 4 par grille).
- **Ctrl-clic** (Windows) / **⌘-clic** (Mac) ou un **simple appui** (sur mobile) pour activer ou désactiver l'état d'une cellule — les cellules actives peuvent contenir des modules.
- Utilisez les **boutons de bascule de ligne** pour activer ou désactiver des lignes entières. Les bascules de ligne sont **désactivées une fois les modules placés** et réactivées lorsque vous appuyez sur **Réinitialiser la grille**.

> 💡 **Remarque :** Les Exosuits et les Exocrafts ont des configurations de grille fixes. Les cellules des Exocrafts ne peuvent pas être modifiées du tout. Sur les Exosuits, vous ne pouvez qu'activer ou désactiver les cellules ; la modification de la disposition des cellules surchargées n'est pas prise en charge.

## Avant de commencer

Cet outil est destiné aux **joueurs avancés** qui optimisent la disposition de la technologie sur leur plateforme pour une efficacité maximale. Il fonctionne mieux lorsque :

- Vous avez débloqué **la plupart ou toutes les cellules** sur votre plateforme (Vaisseau, Exosuit, Exocraft ou Multi-outil).
- Vous avez accès à **toutes les technologies pertinentes**.
- Vous possédez un **ensemble complet de trois modules d'amélioration** par technologie applicable.

Si vous êtes encore en train de débloquer des cellules ou de collecter des modules, l'outil peut toujours fournir des informations, mais il est principalement conçu pour les **plateformes entièrement améliorées**.

## Configurations recommandées

Pour les plateformes comme les **Exosuits** et les **Exocrafts**, où les cellules surchargées sont fixes, le nombre de dispositions viables est **extrêmement limité**. Au lieu de traiter des milliards de permutations comme nous le faisons pour les vaisseaux ou les multi-outils, nous travaillons avec seulement une poignée des meilleures possibilités.

Cela permet à l'outil d'offrir des **configurations recommandées**— des dispositions soigneusement sélectionnées et très subjectives reflétant les meilleures combinaisons disponibles. Le système prend également en charge **plusieurs configurations par plateforme**, adaptées à différents cas d'utilisation. Par exemple :

- Le **Minotaure** comprend à la fois une **configuration polyvalente** (pour quand vous le pilotez activement) et une **configuration de support IA dédiée** (optimisée pour le déploiement à distance).

D'autres plateformes pourraient inclure des **variantes spécialisées à l'avenir** — comme une **configuration de course pour le Pèlerin** ou un **Exosuit avec scanner amélioré** — en fonction des commentaires et de la demande des utilisateurs.

Si vous avez des commentaires ou souhaitez suggérer des configurations alternatives, n'hésitez pas à [lancer une discussion](https://github.com/jbelew/nms_optimizer-web/discussions) — ces configurations sont sélectionnées, pas générées automatiquement, et la contribution de la communauté aide à les améliorer.

## Conseils d'utilisation

Les cellules surchargées offrent des bonus majeurs mais sont limitées — chaque placement compte. **Évitez de reproduire aveuglément votre disposition surchargée dans le jeu.** Pour de meilleurs résultats :

- **Commencez par une technologie à fort impact** — une qui correspond à votre style de jeu et bénéficie de deux ou trois cellules surchargées, comme le _Moteur à impulsion_, le _Lanceur à impulsion_, l'_Accélérateur à infra-couteau_ ou le _Canon à neutrons_. Marquez ces cellules comme surchargées, puis résolvez.
- **Utilisez vos cellules surchargées restantes** pour une deuxième technologie prioritaire comme l'_Hyperpropulseur_, le _Scanner_ ou le _Faisceau minier_, et résolvez à nouveau. Répartir les bonus est généralement plus efficace que de les empiler tous sur une seule technologie.
- Une fois que vos technologies principales sont résolues, concentrez-vous sur celles avec un **plus grand nombre de modules** (par exemple, _Hyperpropulseur_, _Traînées de vaisseau_) avant de manquer d'espace contigu.
- Le solveur fait le gros du travail — votre tâche est de **prioriser les technologies** en fonction de la façon dont vous jouez.

Lorsque l'espace de la grille devient serré, vous devrez peut-être **réinitialiser quelques technologies** et les résoudre dans un ordre différent pour éviter la redoutée **Alerte d'optimisation**. Avec un vaisseau entièrement amélioré, il ne vous restera souvent qu'une seule cellule ouverte — ou aucune si vous optimisez un **Intercepteur**.

## Astuce de pro

Il y a de vraies maths derrière le placement. Le solveur fonctionne dans des fenêtres fixes basées sur le nombre de modules requis par une technologie et choisit généralement la disposition la plus efficace sans gaspiller d'espace. Mais si les choses ne s'alignent pas :

- Essayez de **désactiver quelques cellules** pour guider le solveur vers une meilleure fenêtre.
- Un petit ajustement peut libérer des zones de placement clés et améliorer votre disposition finale.
