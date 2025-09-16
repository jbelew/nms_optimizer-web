## Utilisation de Base

- **Cliquez ou appuyez** sur l'icône ⚙️ pour sélectionner votre **Technologie**.
- **Cliquez ou double-cliquez** sur une cellule pour la marquer comme **Suralimentée** (jusqu'à 4 par grille).
- **Ctrl-clic** (Windows) / **⌘-clic** (Mac) ou **un seul appui** (sur mobile) pour basculer l'état **actif** d'une cellule — les cellules actives peuvent contenir des modules.
- Utilisez les **boutons de basculement de rangée** pour activer ou désactiver des rangées entières. Les bascules de rangée sont **désactivées une fois les modules placés** et réactivées lorsque vous appuyez sur **Réinitialiser la Grille**.

> 💡 **Remarque :** Les Exotrajes et les Exocrafts ont des configurations de grille fixes. Les cellules d'Exocraft ne peuvent pas être modifiées du tout. Sur les Exotrajes, vous ne pouvez que basculer l'état des cellules entre actif et inactif ; la modification de la disposition suralimentée n'est pas prise en charge.

## Avant de Commencer

Cet outil est destiné aux **joueurs de fin de partie** qui optimisent la disposition technologique de leur plateforme pour une efficacité maximale. Il fonctionne mieux lorsque :

- Vous avez débloqué **la plupart ou la totalité des cellules** de votre plateforme (Vaisseau, Exotraje, Exocraft ou Multi-outil).
- Vous avez accès à **toutes les technologies pertinentes**.
- Vous possédez un **ensemble complet de trois modules d'amélioration** par technologie applicable.

Si vous êtes encore en train de débloquer des cellules ou de collecter des modules, l'outil peut tout de même fournir des informations, mais il est principalement conçu pour les **plateformes entièrement améliorées**.

## Informations sur les Corvettes

Les corvettes fonctionnent un peu différemment des autres plateformes — au lieu d'un seul ensemble d'améliorations, elles peuvent en avoir jusqu'à trois.

- Les **améliorations cosmétiques** sont affichées comme `Cn`.
- Les **améliorations de réacteur** sont affichées comme `Rn`.

Le solveur suggérera également les meilleures améliorations cosmétiques si vous préférez privilégier les performances à l'apparence — bien que dans la pratique, les compromis soient assez minimes la plupart du temps.

Gardez à l'esprit qu'un sous-système technologique de corvette entièrement amélioré prend **beaucoup** de place. Les interrupteurs à droite de chaque technologie de corvette vous permettent de choisir entre une **solution cosmétique**, organisant les éléments placés automatiquement dans l'emplacement technologique avec des ajustements et des ajouts minimes, ou une **solution min/max** entièrement optimisée pour les performances.

Avec 60 emplacements technologiques complets, vous n'aurez généralement de la place que pour three ou quatre **solutions min/max**, alors choisissez judicieusement.

## Constructions Recommandées

Pour les plateformes comme les **Exotrajes** et les **Exocrafts**, où les cellules suralimentées sont fixes, le nombre de dispositions viables est **extrêmement limité**. Au lieu de traiter des milliards de permutations comme nous le faisons pour les vaisseaux ou les multi-outils, nous ne travaillons qu'avec une poignée des meilleures possibilités.

Cela permet à l'outil de proposer des **constructions recommandées** — des dispositions soigneusement sélectionnées et très avisées qui reflètent les meilleures combinaisons disponibles. Le système prend également en charge **plusieurs constructions par plateforme**, adaptées à différents cas d'utilisation. Par exemple :

- Le **Minotaure** comprend à la fois une **construction à usage général** (pour lorsque vous le pilotez activement) et une **construction de soutien IA dédiée** (optimisée pour le déploiement à distance).

D'autres plateformes pourraient inclure des **variantes spécialisées à l'avenir** — comme une **configuration de course Pilgrim** ou un **Exotraje amélioré par scanner** — en fonction des commentaires et de la demande des utilisateurs.

Si vous avez des commentaires ou si vous souhaitez suggérer d'autres configurations, n'hésitez pas à [lancer une discussion](https://github.com/jbelew/nms_optimizer-web/discussions) — ces constructions sont sélectionnées, non générées automatiquement, et la contribution de la communauté aide à les améliorer.

## Conseils d'Utilisation

Les cellules suralimentées offrent des bonus importants mais sont limitées — chaque emplacement compte. **Évitez de reproduire aveuglément votre disposition suralimentée en jeu.** Pour de meilleurs résultats :

- **Commencez par une technologie à fort impact** — une qui correspond à votre style de jeu et bénéficie de deux ou trois cellules suralimentées, comme le _Moteur à Impulsion_, le _Cracheur à Impulsion_, l' _Accélérateur d'Infra-couteau_ ou le _Canon à Neutrons_.
  Marquez ces cellules comme suralimentées, puis résolvez.
- **Utilisez vos cellules suralimentées restantes** pour une deuxième technologie prioritaire comme l' _Hyperpropulseur_, le _Scanner_ ou le _Rayon d'Extraction_, et résolvez à nouveau. Répartir les bonus est généralement préférable à les empiler tous sur une seule technologie.
- Une fois vos technologies de base résolues, concentrez-vous sur celles qui ont un **plus grand nombre de modules** (par exemple, _Hyperpropulseur_, _Traînées de Vaisseau_) avant de manquer d'espace contigu.
- Le solveur fait le gros du travail — votre tâche consiste à **prioriser les technologies** en fonction de votre façon de jouer.

Lorsque l'espace de la grille se resserre, vous devrez peut-être **réinitialiser quelques technologies** et les résoudre dans un ordre différent pour éviter la redoutée **Alerte d'Optimisation**. Avec un vaisseau entièrement amélioré, il ne vous restera souvent qu'une seule cellule ouverte — ou aucune si vous optimisez un **Intercepteur**.

## Conseil de Pro

Il y a de vraies mathématiques derrière le placement. Le solveur fonctionne dans des fenêtres fixes basées sur le nombre de modules requis par une technologie et choisit généralement la disposition la plus efficace sans gaspiller d'espace. Mais si les choses ne s'alignent pas :

- Essayez de **désactiver quelques cellules** pour guider le solveur vers une meilleure fenêtre.
- Un petit ajustement peut libérer des zones de placement clés et améliorer votre disposition finale.