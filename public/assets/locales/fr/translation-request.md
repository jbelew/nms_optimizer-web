# Aidez à Traduire l'NMS Optimizer : Rejoignez la Localisation Communautaire

## Participez à la Traduction de l'NMS Optimizer

Les statistiques montrent des visiteurs venant du monde entier, et je serais ravi de rendre cet outil plus accessible à toute la communauté No Man's Sky. C'est là que vous intervenez !

## Comment Vous Pouvez Aider

Je recherche des joueurs bilingues pour m'aider à traduire l'application — en particulier pour **relire et corriger les traductions générées par IA (Français, Allemand, Espagnol, Portugais)**, ou pour ajouter de nouvelles langues portées par de fortes communautés NMS.

Pas besoin d'être un traducteur professionnel : il suffit d'être à l'aise avec la langue, de bien connaître le jeu et d'avoir envie d'aider. Bien que l'IA soit un bon point de départ, elle manque souvent de contexte ou de nuances spécifiques à l'univers du jeu. Vous serez bien sûr crédité (ou pourrez rester anonyme si vous préférez).

La plupart des textes sont des libellés d'interface courts, des infobulles ou des messages de statut amusants.

## Le Flux de Travail

L'NMS Optimizer utilise désormais un **Système de Traduction Automatisé Par IA** via l'API Gemini 2.5 Flash. Cela garantit que chaque mise à jour du contenu anglais est répercutée sur les autres langues en quelques minutes seulement.

Cependant, l'IA n'est pas parfaite. Nous comptons sur la communauté pour repérer et corriger les erreurs de terminologie ou les tournures maladroites.

## Comment Contribuer

La méthode la plus simple est de passer directement par GitHub. Pas besoin de savoir coder pour proposer une meilleure traduction !

1. **Trouvez le Fichier** : Tous les fichiers de localisation sont dans `/public/assets/locales/[code_langue]/`.
    - `translation.json` : Libellés UI, infobulles et messages de statut.
    - `*.md` : Contenu des dialogues plus longs (À propos, Instructions, etc.).
2. **Éditez Directement Sur GitHub** :
    - Naviguez jusqu'au fichier de votre langue (ex : `/public/assets/locales/fr/translation.json`).
    - Cliquez sur l'icône **Crayon (Modifier ce fichier)**.
    - Faites vos modifications.
    - Cliquez sur **Commit changes...** et GitHub créera automatiquement une Pull Request pour vous.
3. **Attendez la Validation** : Une fois que j'aurai validé et fusionné votre PR, le script d'IA détectera vos corrections et veillera à les préserver lors des futures mises à jour.

## Langues Supportées

Nous supportons actuellement :

- `en` (Anglais - Source)
- `es` (Espagnol)
- `fr` (Français)
- `de` (Allemand)
- `pt` (Portugais)

Si vous souhaitez ajouter une **Nouvelle Langue**, créez simplement un dossier avec le [code ISO 639-1](https://fr.wikipedia.org/wiki/Liste_des_codes_ISO_639-1) approprié et je l'ajouterai à la rotation de l'IA !

## Notes

- **Interpolation** : Vous verrez des balises comme `<1></1>` ou `{{techName}}`. **Merci de les laisser telles quelles**, car l'application les utilise pour insérer du contenu dynamique ou du style.
- **Priorité à l'Humain** : Le script de traduction est conçu pour respecter les modifications humaines. Si vous changez une valeur manuellement, l'IA ne l'écrasera pas lors des prochaines exécutions.

Merci de nous aider à rendre l'Optimiseur de Technologie No Man's Sky meilleur pour tout le monde ! N'hésitez pas à me contacter si vous avez des questions.
