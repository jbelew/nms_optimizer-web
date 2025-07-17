## Aidez à traduire l'Optimiseur NMS

L'application est actuellement disponible uniquement en anglais, mais les analyses montrent des visiteurs du monde entier. J'aimerais la rendre plus accessible à la communauté mondiale de _No Man's Sky_ – et c'est là que vous intervenez.

## Comment vous pouvez aider

Je recherche des joueurs bilingues pour aider à traduire l'application – notamment pour éditer et relire les traductions générées par l'IA en **français**, **allemand** et **espagnol**, ou pour travailler sur d'autres langues avec de fortes communautés de joueurs NMS.

Vous n'avez pas besoin d'être un traducteur professionnel – juste être bilingue, familier avec le jeu et désireux d'aider. Ce sera certainement mieux que ce désordre de ChatGPT ! Vous serez crédité (ou resterez anonyme si vous préférez).

La plupart des chaînes sont de courtes étiquettes d'interface utilisateur, des info-bulles ou des messages de statut amusants.

Les traductions sont gérées à l'aide de [`i18next`](https://www.i18next.com/), avec de simples fichiers JSON et Markdown.

## Si vous êtes à l'aise avec GitHub

**Forkez le dépôt :**
[github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)

**Mettez à jour ou créez les fichiers de traduction :**

- Les étiquettes de l'interface utilisateur de l'application se trouvent dans `/src/i18n/locales/[language_code]/translation.json`.
- Le contenu des boîtes de dialogue plus grandes est stocké sous forme de fichiers Markdown purs dans `/public/locales/[language_code]/`.

Vous pouvez mettre à jour des fichiers existants ou créer un nouveau dossier pour votre langue en utilisant le [code ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) (par exemple, `fr` pour le français). Copiez les fichiers Markdown et JSON pertinents dans ce dossier, puis mettez à jour le contenu en conséquence.

> _Exemple :_ Créez `/public/locales/fr/about.md` pour le contenu des dialogues et `/src/i18n/locales/fr/translation.json` pour les étiquettes de l'interface utilisateur.

**Soumettez une pull request** lorsque vous avez terminé.

## Pas envie de faire des Pull Requests ?

Pas de problème – rendez-vous simplement sur la [page de Discussions GitHub](https://github.com/jbelew/nms_optimizer-web/discussions) et démarrez un nouveau fil de discussion.

Vous pouvez y coller vos traductions ou poser des questions si vous ne savez pas par où commencer. Je prendrai le relais à partir de là.

## Notes

`randomMessages` est juste cela – une liste de messages aléatoires qui s'affichent lorsque l'optimisation prend plus de quelques secondes. Pas besoin de tout traduire, trouvez simplement quelques messages qui ont du sens dans votre langue.

Merci d'aider à améliorer l'Optimiseur de Dispositions Technologiques de No Man's Sky AI pour tout le monde ! Faites-moi savoir si vous avez des questions – je suis là pour aider.
