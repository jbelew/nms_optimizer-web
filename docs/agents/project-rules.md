# Project Safeguards & Preferences

Crucial codebase rules, legacy browser workarounds, and workflow conventions that must be adhered to.

## iOS Safari Rendering
- **CRITICAL**: iOS Safari rendering failures are common with GPU-accelerated CSS properties.
- **Rules**:
  - Never add properties like `translateZ(0)`, `translate3d()`, `will-change`, or `contain: layout` without verified performance issues and real iOS device testing.
  - Prefer simple, clean CSS and set explicit image dimensions to avoid layouts collapsing.

## SEO (Search Engine Optimization)
- **Metadata**: Do not shorten the meta description in [`index.html`](file:///home/jbelew/projects/nms_optimizer-web/index.html) to preserve search engine ranking metadata.

## Commit Conventions & Automated Releases
- **Style**: Follow the Angular / Conventional Commits convention for commit messages. This is enforced by Commitlint during git lifecycle hooks.
- **Semantic Release Mapping**: Releases on `main` are managed automatically by `semantic-release` via GitHub Actions:
  - `fix: <summary>` triggers a **Patch** release (e.g., `8.0.1` &rarr; `8.0.2`).
  - `feat: <summary>` triggers a **Minor** release (e.g., `8.0.1` &rarr; `8.1.0`).
  - `feat!: <summary>` or `BREAKING CHANGE: <explanation>` triggers a **Major** release (e.g., `8.0.1` &rarr; `9.0.0`).
- **Changelog Location**: Curated, human-facing changelog entries live in [`public/assets/locales/en/changelog.md`](file:///home/jbelew/projects/nms_optimizer-web/public/assets/locales/en/changelog.md). Update this file directly when adding version notes before a release.
- **Working Tree Protection**: Never overwrite uncommitted user modifications. Run `git status --short` before modifying or replacing files to ensure user-directed in-flight changes are preserved.
