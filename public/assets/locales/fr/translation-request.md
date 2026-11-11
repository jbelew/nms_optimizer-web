# Aidez à traduire NMS Optimizer : rejoignez notre localisation communautaire

## Participez à la traduction de NMS Optimizer

Les statistiques montrent des visiteurs venus du monde entier, et j'aimerais rendre l'optimiseur accessible à toute la communauté internationale de _No Man's Sky_ — c'est là que vous intervenez.

## Comment vous pouvez aider

Je recherche des joueurs bilingues pour relire et affiner les localisations en **espagnol, français, allemand, portugais et italien**, ou pour contribuer à de nouvelles langues comptant une importante communauté de joueurs NMS.

Vous n'avez pas besoin d'être traducteur professionnel — il suffit de maîtriser la langue, de connaître _No Man's Sky_ dans votre langue et d'avoir envie de donner un coup de main. Même si les traductions assistées par IA offrent une large couverture, les joueurs bilingues sont précieux pour repérer les subtilités de formulation ou vérifier la terminologie exacte utilisée en jeu. Vous serez crédité (ou pourrez rester anonyme si vous le préférez).

La majorité des chaînes consiste en de courts libellés d'interface, des infobulles ou des messages de statut pleins d'humour.

## Comment contribuer

Le moyen le plus simple de contribuer consiste à passer directement par GitHub. Il n'est pas nécessaire de savoir coder pour proposer une meilleure traduction :

1. **Repérez le fichier** : Tous les fichiers de localisation se trouvent dans `/public/assets/locales/[language_code]/` :
    - `translation.json` : **Lot de langue** contenant les libellés d'interface, les noms du catalogue, les infobulles et les métadonnées de page.
    - `*.md` : **Documents de route localisés** pour les guides complets et les fenêtres d'information (À propos, Instructions, etc.).
2. **Modifiez directement sur GitHub** :
    - Ouvrez le fichier correspondant à votre langue (par exemple, `/public/assets/locales/fr/translation.json`).
    - Cliquez sur l'**icône de crayon (Edit this file)**.
    - Apportez vos modifications.
    - Cliquez sur **Commit changes...** et GitHub vous guidera pour ouvrir une Pull Request.

## Langues prises en charge

Nous prenons actuellement en charge :

- `en` (Anglais - Source)
- `es` (Espagnol)
- `fr` (Français)
- `de` (Allemand)
- `pt` (Portugais)
- `it` (Italien)

Si vous souhaitez ajouter une **nouvelle langue**, ouvrez un ticket ou une Pull Request avec un dossier utilisant son [code ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

## Remarques

- **Termes officiels du jeu** : Les noms des plateformes, des technologies et des modules doivent correspondre aux textes officiels localisés par Hello Games en jeu plutôt qu'à des traductions littérales de l'anglais.
- **Interpolation** : Conservez intactes les balises telles que `<1></1>`, `<strong></strong>`, `<icon/>` ainsi que les variables telles que `{{techName}}` afin que la mise en forme dynamique de l'interface continue de fonctionner.

Merci d'aider à améliorer l'optimiseur de dispositions technologiques de No Man's Sky pour tous les voyageurs !
