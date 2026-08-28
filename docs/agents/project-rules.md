# Project Safeguards & Preferences

Crucial codebase rules, legacy browser workarounds, and workflow conventions that must be adhered to.

## iOS Safari Rendering
- **CRITICAL**: iOS Safari rendering failures are common with GPU-accelerated CSS properties.
- **Rules**:
  - Never add properties like `translateZ(0)`, `translate3d()`, `will-change`, or `contain: layout` without verified performance issues and real iOS device testing.
  - Prefer simple, clean CSS and set explicit image dimensions to avoid layouts collapsing.

## SEO (Search Engine Optimization)
- **Metadata**: Do not shorten the meta description in [`index.html`](file:///home/jbelew/projects/nms_optimizer-web/index.html) to preserve search engine ranking metadata.

## Commit Conventions
- **Style**: Follow the Angular convention for commit messages. This is enforced by Commitlint during git lifecycle hooks.
