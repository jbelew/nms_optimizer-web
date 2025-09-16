# Aidez à Traduire l'Optimiseur NMS

Les analyses montrent des visiteurs du monde entier et j'aimerais le rendre plus accessible à la communauté mondiale de No Man's Sky — et c'est là que vous intervenez.

## Comment Pouvez-vous Aider

Je recherche des joueurs bilingues pour aider à traduire l'application — en particulier pour **modifier et relire les traductions en français, allemand et espagnol générées par l'IA**, ou pour travailler sur d'autres langues avec de fortes communautés de joueurs NMS.

Vous n'avez pas besoin d'être un traducteur professionnel — juste être à l'aise, familier avec le jeu et désireux d'aider. Ce sera certainement mieux que ce désordre de ChatGPT ! Vous serez crédité (ou resterez anonyme si vous préférez).

La plupart des chaînes sont de courtes étiquettes d'interface utilisateur, des infobulles ou des messages d'état amusants.

Les traductions sont gérées à l'aide de [`i18next`](https://www.i18next.com/), avec de simples fichiers JSON et Markdown. Nous utilisons également **Crowdin** pour gérer les contributions de traduction collaboratives.

---

## Utiliser Crowdin (Recommandé)

Si vous voulez le moyen le plus simple de contribuer :

1. **Inscrivez-vous sur Crowdin** à [https://crowdin.com](https://crowdin.com) et demandez l'accès au projet NMS Optimizer.
2. Une fois approuvé, vous pouvez **modifier les traductions existantes directement dans l'interface utilisateur web**, ou télécharger vos propres traductions.
3. Crowdin gère différentes langues et s'assure que vos mises à jour sont synchronisées automatiquement avec l'application.
4. Vous pouvez vous concentrer sur la **relecture des traductions existantes** ou en ajouter de nouvelles dans votre langue.

> Crowdin utilise les codes de langue [ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) standard : `fr` pour le français, `de` pour l'allemand, `es` pour l'espagnol, etc.

C'est l'approche recommandée si vous n'êtes pas familier avec GitHub ou si vous souhaitez que vos modifications soient immédiatement prises en compte dans l'application.

---

## Si Vous êtes à l'aise avec GitHub

**Forkez le dépôt :**
[github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)

**Mettez à jour ou Créez les Fichiers de Traduction :**

- Les étiquettes de l'interface utilisateur de l'application se trouvent dans `/src/i18n/locales/[language_code]/translation.json`.
- Le contenu des boîtes de dialogue plus volumineuses est stocké sous forme de fichiers Markdown purs dans `/public/locales/[language_code]/`.

Vous pouvez mettre à jour les fichiers existants ou créer un nouveau dossier pour votre langue en utilisant le [code ISO 639-1](https://en.wikipedia.org/wiki/List_of-ISO_639-1-codes) (par exemple, `de` pour l'allemand). Copiez les fichiers Markdown et JSON pertinents dans ce dossier, puis mettez à jour le contenu en conséquence.

> _Exemple :_ Créez `/public/locales/de/about.md` pour le contenu de la boîte de dialogue et `/src/i18n/locales/de/translation.json` pour les étiquettes de l'interface utilisateur.

**Soumettez une pull request** lorsque vous avez terminé.

---

## Pas fan des Pull Requests ?

Pas de problème — rendez-vous simplement sur la [page des Discussions GitHub](https://github.com/jbelew/nms_optimizer-web/discussions) et lancez un nouveau fil de discussion.

Vous pouvez y coller vos traductions ou poser des questions si vous n'êtes pas sûr de par où commencer. Je m'en occuperai à partir de là.

---

## Remarques

`randomMessages` est exactement cela — une liste de messages aléatoires qui s'affichent lorsque l'optimisation prend plus de quelques secondes. Pas besoin de les traduire tous, trouvez-en simplement quelques-uns qui ont du sens dans votre langue.

Merci de contribuer à améliorer l'Optimiseur de Disposition Technologique de No Man's Sky pour tout le monde ! N'hésitez pas si vous avez des questions — je suis là pour aider.