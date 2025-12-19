## Help Translate the NMS Optimizer

Analytics show visitors from all over the world and I'd love to make it more accessible to the global No Man's Sky community — and that's where you come in.

## How You Can Help

I'm looking for bilingual players to help translate the app — especially to **edit and proof the AI-generated French, German, Spanish, and Portuguese translations**, or to work on other languages with strong NMS player communities.

You don't need to be a professional translator — just fluent, familiar with the game, and willing to help out. While AI-generated translations are a great starting point, they often miss game-specific context or nuance. You'll be credited (or remain anonymous if you prefer).

Most strings are short UI labels, tooltips, or fun status messages.

## Using Crowdin (Recommended)

If you want the easiest way to contribute:

1. **Visit the Crowdin Project** at [crowdin.com/project/nms-optimizer](https://crowdin.com/project/nms-optimizer).
2. **Select your language** and start editing existing strings or adding new ones.
3. You can use the **proofreading** feature to verify AI-suggested translations.
4. Crowdin handles the synchronization with GitHub automatically, so you don't need to touch any code.

> Crowdin uses standard [ISO language codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes): `fr` for French, `de` for German, `es` for Spanish, `pt` for Portuguese, etc.

## If You're Comfortable With GitHub

**Fork the repo:**
[github.com/jbelew/nms_optimizer-web](https://github.com/jbelew/nms_optimizer-web)

**Update or Create the Translation Files:**

All localization files are located in `/public/assets/locales/[language_code]/`:

- `translation.json`: Application UI labels, tooltips, and status messages.
- `*.md`: Content for larger dialogs (About, Instructions, Changelog, etc.).

You can update existing files or create a new folder for your language using the [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

> _Example:_ To add or edit German translations, check `/public/assets/locales/de/`.

**Submit a pull request** when you're done.

## Notes

- **Interpolation**: You'll see tags like `<1></1>` or `{{techName}}`—please keep these exactly as they are, as the app uses them to insert dynamic content or styling.
- **Random Messages**: `randomMessages` is a list of fun status updates that appear during optimization. Feel free to get creative with these in your language!

Thanks for helping make the No Man's Sky Technology Layout Optimizer better for everyone! Let me know if you have any questions — happy to help.
