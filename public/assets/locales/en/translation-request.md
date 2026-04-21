# Help Translate NMS Optimizer: Join Our Community Localization

## Help Translate the NMS Optimizer

Analytics show visitors from all over the world and I'd love to make it more accessible to the global No Man's Sky community — and that's where you come in.

## How You Can Help

I'm looking for bilingual players to help translate the app — especially to **edit and proof the AI-generated French, German, Spanish, and Portuguese translations**, or to work on other languages with strong NMS player communities.

You don't need to be a professional translator — just fluent, familiar with the game, and willing to help out. While AI-generated translations are a great starting point, they often miss game-specific context or nuance. You'll be credited (or remain anonymous if you prefer).

Most strings are short UI labels, tooltips, or fun status messages.

## The Workflow

The NMS Optimizer now uses an **AI-first translation workflow** using the Gemini 2.5 Flash API. This ensures that every time the English content is updated, all other supported languages are automatically updated within minutes.

However, AI isn't perfect. We rely on the community to identify and fix "hallucinations" or incorrect NMS terminology.

## How to Contribute

The easiest way to contribute is directly through GitHub. You don't need to know how to code to suggest a better translation.

1. **Find the file**: All localization files are located in `/public/assets/locales/[language_code]/`.
    - `translation.json`: UI labels, tooltips, and status messages.
    - `*.md`: Content for larger dialogs (About, Instructions, etc.).
2. **Edit directly on GitHub**:
    - Navigate to the file for your language (e.g., `/public/assets/locales/es/translation.json`).
    - Click the **Pencil icon (Edit this file)**.
    - Make your changes.
    - Click **Commit changes...** and GitHub will automatically create a Pull Request for you.
3. **Wait for Merge**: Once I merge your PR, the AI script will automatically detect your human edits and ensure they are preserved during future updates.

## Supported Languages

We currently support:

- `en` (English - Source)
- `es` (Spanish)
- `fr` (French)
- `de` (German)
- `pt` (Portuguese)

If you'd like to add a **new language**, simply create a new folder with the appropriate [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) and I will add it to the AI's rotation!

## Notes

- **Interpolation**: You'll see tags like `<1></1>` or `{{techName}}` — **please keep these exactly as they are**, as the app uses them to insert dynamic content or styling.
- **Human Priority**: The translation script is designed to respect human edits. If you change a value in a JSON file, the AI will not overwrite it during the next automated run.

Thanks for helping make the No Man's Sky Technology Layout Optimizer better for everyone! Let me know if you have any questions — happy to help.
