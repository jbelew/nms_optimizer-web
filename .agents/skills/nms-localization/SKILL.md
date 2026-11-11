---
name: nms-localization
description: "Audit, translate, or add No Man's Sky locales and game item labels using Hello Games' extracted .MBIN localization tables. Use when editing public/assets/locales/**, adding a language, checking Canonical Game Terms, updating backend modules_data/*.json names, or localizing ModuleSelectionDialog/GridCell."
---

# NMS Localization (`.MBIN`-Backed Workflow)

Translate and audit **Locale Bundles** (`public/assets/locales/<lang>/translation.json`), **Localized Route Documents** (`public/assets/locales/<lang>/*.md`), and backend module definitions (`../nms_optimizer-service/src/data_definitions/modules_data/*.json`) against Hello Games' official `.MBIN` game localization tables.

## Steps

1. **Protect existing human translations and check English source drift.** Run `git log -n 10 --oneline -- public/assets/locales/<lang>/` before editing an existing locale to identify human contributor commits (such as PR `618f1bc9` in `es/translation.json`), and compare `git log -1 --format=%ct` timestamps between `en/*` and `<lang>/*` to catch English keys or Markdown sections edited in place after `<lang>` was translated.
   - *Done when*: Every human-curated key baseline and every source-drifted key or Markdown section since `<lang>`'s last update is identified.
2. **Resolve Canonical Game Terms via `.MBIN` tables.** Run [`scripts/lookup-mbin.mjs`](scripts/lookup-mbin.mjs) (`bun .agents/skills/nms-localization/scripts/lookup-mbin.mjs --audit` for full key audit, or `--query "<English term>"` for targeted lookups) to fetch and cache Hello Games' `.MBIN`-extracted `.lang.json` files from `AssistantNMS/App` and match English terms by stable item `Id` across target locales.
   - For items present in `.MBIN` tables, use Hello Games' exact localized `Name` (or class-stripped `TechnologyModule.lang.json` `Group` for `<Technology> Upgrade` labels), adjusted only where a locale enforces consistent catalog sentence case (e.g., `es-ES`).
   - For brand-new update items absent from public `.MBIN` extracts that cannot be verified from primary in-game captures, keep existing translations untouched (or leave an explicit verification note when adding new keys) rather than guessing literal translations.
   - *Done when*: Every `technologies.*`, `modules.*`, `platforms.*`, and inline Markdown game term is either matched to an `.MBIN` `Id` or explicitly listed as needing in-game verification.
3. **Apply the [Locale matrix](#locale-matrix) and preserve markup/SEO contracts.** Translate UI copy and **Localized Route Documents** using each locale's locked dialect, pronoun, `"Build"` noun/gender, and **Canonical Game Terms**:
   - Preserve `<Trans>` tags (`<0>`, `<1>`, `<p>`, `<strong>`, `<icon/>`), i18next `{{interpolation}}` variables, `–kzzkt–` lore markers, `<radix-icon ...></radix-icon>` elements, and localized internal links (`/<lang>/`, `/<lang>/instructions/`) verbatim.
   - Use ASCII `-` or `:` separators (not em-dashes `—`) in `seo.*` titles and Markdown `#`/`##`/`###` headings per [`docs/agents/project-rules.md`](../../../docs/agents/project-rules.md).
   - Keep `changelog.md` English-only (`public/assets/locales/en/changelog.md`); non-English locale directories contain the 6 localized Markdown documents (`home.md`, `instructions.md`, `about.md`, `privacy.md`, `userstats.md`, `translation-request.md`).
   - *Done when*: All **Locale Bundle** keys and all 6 **Localized Route Documents** align semantically and structurally with `en/*`.
4. **Verify structural parity and Markdown lint.** Run `bun run verify:locales && bun run lint:md` (plus `bun run test` if any `en/translation.json` strings or UI components changed).
   - *Done when*: Both commands exit `0` with zero missing/extra keys, tag mismatches, interpolation errors, or Markdown lint errors.

## `.MBIN` data sources & lookup mechanics

Raw *No Man's Sky* localization strings live in `NMS_LOC*_*.MBIN` game archives (unpacked via `MBINCompiler`). Structured per-language JSON extracts keyed by stable `Id` are published at:

- Primary URL: `https://raw.githubusercontent.com/AssistantNMS/App/develop/assets/json/<mbin_lang>/<table>.lang.json` (fallback branch: `master`)
- App-to-`.MBIN` language directory map: `en` -> `en`, `es` -> `es` (European Spanish; `es-la` is Latin American), `fr` -> `fr`, `de` -> `de`, `pt` -> `pt-br`, `it` -> `it`
- Lookup priority across tables:
  1. `Technology.lang.json` (`tech*` — core technologies, weapons, shields, drives, hazard protection)
  2. `UpgradeModules.lang.json` (`up*` — procedural upgrade items)
  3. `TechnologyModule.lang.json` (`tMod*` — upgrade module `Group` strings; expand `%NAME%` and strip `[CSBAX]-Class`, `Klasse-[CSBAX]-`, `der [CSBAX]-Klasse`, `de clase [CSBAX]`, `de classe [CSBAX]`, `di classe [CSBAX]`, or `Classe [CSBAX]` wrappers to obtain the localized `<Technology> Upgrade` label)
  4. `ConstructedTechnology.lang.json` (`conTech*`)
  5. `Products.lang.json` & `Curiosity.lang.json` (`prod*` / `cur*` — figurines, starship trails, crafted items)
  6. `Others.lang.json` (`other*` — platform categories, `UI_SPECIAL_TECH_SLOT` / Supercharged UI strings)

Normalize British vs. American spelling (`Armour`/`Armor`, `Ioniser`/`Ionizer`, `Defence`/`Defense`, `Harmoniser`/`Harmonizer`) when matching English source names, and note intentional NMS distinctions (`Mining Beam` on Multi-Tools vs. `Exocraft Mining Laser` on Exocraft; `Deflector Shield` on Starships/Corvettes).

## Locale matrix

| App Locale | Variant & Pronoun | `"Build"` Convention | Locked `.MBIN` & Gameplay Guardrails |
| :--- | :--- | :--- | :--- |
| `es` | `es-ES` (`tú`) | `el diseño` (masc.) | **Ranura potenciada** (`Potenciado` — avoid *sobrecargado*), **Nave** / **Nave espacial**, **Multiherramienta**, **Exotraje**, **Exonave**, **Carguero**, **Corbeta**, **Hiperturbo**, **Motor de pulso**. Use RAE sentence case for catalog names (`Balista de ciclotrones`). |
| `fr` | `fr-FR` (`vous`) | `le build` (masc.) | **Emplacement surchargé** (`Surchargé`), **Vaisseau**, **Multi-outil**, **Exocombinaison**, **Exonef**, **Cargo** (Freighter), **Corvette**, **Hyperpropulsion**, **Pulsoréacteur**. Distinguish file **Load/Open** (*Ouvrir* / *Importer*) from **Save/Download** (*Télécharger*). |
| `de` | `de-DE` (`du`) | `der Build` (masc.) | **Turbogeladener Platz** (`Turbogeladen` — **never** *Überladen*, which is the red *Technology Overloaded!* penalty), **Raumschiff**, **Multiwerkzeug**, **Exo-Anzug**, **Exo-Fahrzeug**, **Frachter**, **Korvette**, **Hyperantrieb**, **Impulsantrieb**, **Blitzwerfer** (Boltcaster) vs. **Glutspeer** (Blaze Javelin). Lowercase verbs in UI labels (`Build speichern`). |
| `pt` | `pt-BR` (`você`) | `a build` (fem.) | **Espaço supercarregado** (`Supercarregado` — **never** *Sobrecarregado*, which is *Technology Overloaded!*), **Nave**, **Multiferramenta**, **Exotraje**, **Exoveículo**, **Nave cargueira** (Freighter), **Corveta**, **Hiperpropulsor**, **Mecanismo de pulso**, **`Atualização do/da <tecnologia>`**. Watch for Spanish ("Portunhol") leaks. |
| `it` | `it-IT` (`tu`) | `la configurazione` (fem.) | **Slot sovralimentato** (`Sovralimentato`), **Astronave**, **Multi-tool** (kept in English in NMS IT), **Exotuta**, **Exoscafo** (Exocraft), **Mercantile** (Freighter — **never** *Fregata*, which is Frigate), **Corvetta**, **Iperguida**, **Motore a impulso**, **Exozattera** (Exo-Skiff). |

For app-specific optimizer concepts (**Solver Window**, **Pattern No Fit**, **Supercharged No Fit**, **Forced Solve**, **Focus Mode**), translate from their definitions in [`GLOSSARY.md`](../../../GLOSSARY.md).

## Backend `modules_data` & `module.label` invariants

[`ModuleSelectionDialog.tsx`](../../../src/components/ModuleSelectionDialog/ModuleSelectionDialog.tsx) and [`GridCell.tsx`](../../../src/components/GridCell/GridCell.tsx) currently consume `module.label` / `cell.label` from `/tech_tree/<shipType>` (`../nms_optimizer-service/src/data_definitions/modules_data/*.json`). Three frontend modules inspect English prefixes or substrings on `label`:

1. [`techRules.ts`](../../../src/store/tech/techRules.ts): `module.label?.toLowerCase().includes("figurine")` routes figurines in `groupModules`, and `module.label.includes(rank)` (`"Theta"`, `"Tau"`, `"Sigma"`) enforces **Module Rank Order** prerequisites and deselection cascades.
2. [`ModuleSelectionDialog.tsx`](../../../src/components/ModuleSelectionDialog/ModuleSelectionDialog.tsx): `m.label?.includes("[") && m.label?.includes("]")` detects bracket-prefixed ranked modules (`[1]`, `[2]`, `[3]`) and `formatLabel` strips rank/tier tokens for display.
3. [`GridCell.tsx`](../../../src/components/GridCell/GridCell.tsx) (`getModuleRankBadge` & `stripLabel`): parses `[1]`/`[2]`/`[3]`, word-bounded `\btheta\b` / `\btau\b` / `\bsigma\b`, and English category substrings (`"salvaged"`, `"forbidden"`, `"reactor"`, `"booster"`, `"upgrade"`, `"habitation"`, `"array"`, `"platform"`, etc.) to render slot rank badges (`1`–`3`, `S1`–`S3`, `F1`–`F3`, `R1`–`R3`, `C1`–`C3`).

When editing `modules_data/*.json` labels or wiring `t("modules.*")` into `ModuleSelectionDialog` and `GridCell`, keep canonical English metadata (or explicit rank/category fields) for domain rules and apply localized labels purely at display time.
