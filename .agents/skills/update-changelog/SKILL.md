---
name: update-changelog
description: "Curate player-facing release notes in public/assets/locales/en/changelog.md from CHANGELOG.md."
disable-model-invocation: true
---

Update [`public/assets/locales/en/changelog.md`](../../../public/assets/locales/en/changelog.md) with curated, player-friendly release notes synthesized from [`CHANGELOG.md`](../../../CHANGELOG.md).

## Steps

1. **Sync with `origin/main` and collect the unreleased range.** Run `git pull --ff-only origin main` (and `git -C ../nms_optimizer-service pull --ff-only origin main` when the sibling backend repo is present) so CI `semantic-release` updates to `CHANGELOG.md` are present locally. Read the topmost `## Version X.Y` heading in `public/assets/locales/en/changelog.md`, then read every newer `X.Y.Z` release in root `CHANGELOG.md` and any matching solver commits in `../nms_optimizer-service` during that date window. Run `git show <sha>` whenever a commit subject is too terse to tell what the player sees.
   - *Done when*: Local `main` matches `origin/main` and every `X.Y.Z` release in `CHANGELOG.md` newer than the top `changelog.md` entry (plus matching backend solver changes) is accounted for.
2. **Filter to player-facing changes and group by `major.minor`.** Apply the [Player-facing filter](#player-facing-filter) to every commit, then roll `X.Y.*` patches into their parent `Version X.Y` section. Skip any `X.Y` minor series that has zero player-facing changes left after filtering. When cutting a `Version X.0` major release, consolidate any preceding minor sections specified by the user into `Version X.0`.
   - *Done when*: Every kept item describes a visible player benefit, related commits within the same `X.Y.*` series are merged into single bullets, and empty minor versions are dropped.
3. **Prepend the new release section(s).** Write each `## Version X.Y` section using the [Entry format](#entry-format) and insert them in descending version order directly below the intro paragraph in `public/assets/locales/en/changelog.md`.
   - *Done when*: All new sections are inserted in `public/assets/locales/en/changelog.md` with zero code identifiers, component names, or commit-message jargon.
4. **Format and lint.** Run `bunx prettier --write public/assets/locales/en/changelog.md && bun run lint:md`.
   - *Done when*: Both commands exit `0` with zero warnings or errors.

## Player-facing filter

Players read the changelog to learn what changed in the optimizer UI, layouts, and game data.

- **Include**:
  - **Game content & data**: New or updated platforms, technologies, modules, figurines, solve maps, Recommended Builds, and module/grid icons or artwork.
  - **UI & workflow features**: New or updated controls, dialogs, visual indicators, keyboard navigation, and layout behaviors.
  - **Player-visible bug fixes**: Fixes for broken links or buttons, layout shifts, visual glitches, touch/scroll issues, and update-prompt or error-recovery loops.
  - **Perceived responsiveness**: Noticeable client-side rendering, animation, or interaction speedups.
  - **Localization**: New supported languages or visible translation/terminology improvements.
- **Exclude**:
  - **Build & CI plumbing**: GitHub Actions, Dockerfiles, Vite/Rolldown/Bun configuration, SSG/sitemap scripts, and semantic-release plumbing.
  - **Quality gates & refactors**: Unit/Storybook/E2E tests, Lighthouse CI config, linter/typecheck fixes, JSDoc, dead-code removal, and internal architecture refactors.
  - **Security & monitoring internals**: CodeQL/Dependabot alerts, Sentry initialization/chunking/error filtering, and logger internals.
  - **Telemetry & invisible SEO**: GA4 events, referrer/campaign tracking, ad-blocker probes, Web Vitals reporting scripts, structured data/hreflang/meta tags, and crawler/bot detection.

## Entry format

```markdown
## Version X.Y – <2–5 Word Theme Subtitle> (YYYY-MM-DD)

This update <1-sentence summary of the release's main player-visible themes>.

- **<Short Feature or Fix Label>:** <1–2 sentences in direct, literal English (no idioms or slang, since the changelog is served in English to all locales) describing what changed and how it helps the player>.
```

- **Heading**: Separate `Version X.Y` and the subtitle with an en-dash surrounded by spaces (` – `). Write `major.minor` without a trailing `.0` (`Version 8.4`, not `Version 8.4.0`).
- **Date**: Use the `YYYY-MM-DD` date of `X.Y.0` from `CHANGELOG.md`, or the date of the latest player-facing `X.Y.Z` patch when `X.Y.0` contained only internal changes.
- **Bullets**: Lead with a bold noun phrase followed by a colon inside the bold span (`- **Label:**`). Combine multi-commit features (such as a calculation commit plus dialog UI commits) into one cohesive bullet written from the player's perspective.
