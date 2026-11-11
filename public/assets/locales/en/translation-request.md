# Help Translate NMS Optimizer: Join Our Community Localization

## Help Translate the NMS Optimizer

Analytics show visitors from all over the world, and I'd love to make the optimizer accessible to the global _No Man's Sky_ community — and that's where you come in.

## How You Can Help

I'm looking for bilingual players to help proofread and refine the **Spanish, French, German, Portuguese, and Italian** localizations, or to contribute new languages with strong NMS player communities.

You don't need to be a professional translator — just fluent, familiar with _No Man's Sky_ in your language, and willing to help out. While AI-assisted translations provide broad coverage, bilingual players are invaluable for catching subtle phrasing issues or verifying exact in-game terminology. You'll be credited (or remain anonymous if you prefer).

Most strings are short UI labels, tooltips, or fun status messages.

## How to Contribute

The easiest way to contribute is directly through GitHub. You don't need to know how to code to suggest a better translation:

1. **Find the file**: All localization files live in `/public/assets/locales/[language_code]/`:
    - `translation.json`: **Locale Bundle** containing UI labels, catalog names, tooltips, and page metadata.
    - `*.md`: **Localized Route Documents** for full-page guides and dialogs (About, Instructions, etc.).
2. **Edit directly on GitHub**:
    - Open the file for your language (for example, `/public/assets/locales/es/translation.json`).
    - Click the **Pencil icon (Edit this file)**.
    - Make your changes.
    - Click **Commit changes...** and GitHub will walk you through opening a Pull Request.

## Supported Languages

We currently support:

- `en` (English - Source)
- `es` (Spanish)
- `fr` (French)
- `de` (German)
- `pt` (Portuguese)
- `it` (Italian)

If you'd like to add a **new language**, open an issue or pull request with a folder using its [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

## Notes

- **Canonical Game Terms**: Platform, technology, and module names should match Hello Games' official localized in-game text rather than literal translations of the English names.
- **Interpolation**: Keep tags such as `<1></1>`, `<strong></strong>`, `<icon/>`, and placeholders such as `{{techName}}` intact so dynamic UI formatting continues to work.

Thanks for helping make the No Man's Sky Technology Layout Optimizer better for everyone!
