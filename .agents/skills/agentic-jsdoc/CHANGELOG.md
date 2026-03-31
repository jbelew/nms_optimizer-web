# Changelog

## [1.12.1](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.12.0...agentic-jsdoc-v1.12.1) (2026-03-22)


### Bug Fixes

* Refine JSDoc `[@see](https://github.com/see)` guidelines to prioritize TypeDoc symbol references for code and require language-specific fenced code blocks for `[@example](https://github.com/example)` tags, while adding `[@see](https://github.com/see)` links to example files. ([fc46991](https://github.com/jbelew/agentic-jsdoc/commit/fc4699136b65740869c7c663c551e6b727a72e3c))

## [1.12.0](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.11.0...agentic-jsdoc-v1.12.0) (2026-03-22)


### Features

* enforce JSDoc on exported variable declarations and clarify requirements for internal local variables. ([0b62cde](https://github.com/jbelew/agentic-jsdoc/commit/0b62cde05eb56ec04428919803702d6961f8c465))

## [1.11.0](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.10.0...agentic-jsdoc-v1.11.0) (2026-03-21)


### Features

* Enhance JSDoc documentation with `[@remarks](https://github.com/remarks)`, `[@component](https://github.com/component)`, `[@hook](https://github.com/hook)` tags, and standardize `[@see](https://github.com/see)` links to use the `{[@link](https://github.com/link) RelativePath Label}` format. ([e6db381](https://github.com/jbelew/agentic-jsdoc/commit/e6db381c187bd978cb89966d8a3b35e1c9bc9fcc))

## [1.10.0](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.9.0...agentic-jsdoc-v1.10.0) (2026-03-21)


### Features

* Enhance JSDoc guidelines with `[@default](https://github.com/default)` tag, refined `[@throws](https://github.com/throws)` and `[@see](https://github.com/see)` usage for Zod-inferred types, and updated test instructions. ([608cd92](https://github.com/jbelew/agentic-jsdoc/commit/608cd920e3b03edb1c2b4dd44d55f90695e0bf54))

## [1.9.0](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.8.0...agentic-jsdoc-v1.9.0) (2026-03-21)


### Features

* Add new test fixtures for JSDoc tag validation and JSDoc generation, and update README documentation. ([39fdc57](https://github.com/jbelew/agentic-jsdoc/commit/39fdc579703832ede01880c0f38b9703a7b094e1))

## [1.8.0](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.7.2...agentic-jsdoc-v1.8.0) (2026-03-21)


### Features

* added a basic testing fixture. ([83ce21c](https://github.com/jbelew/agentic-jsdoc/commit/83ce21cffe0d89c5d0499b2eb2f7b19cd3ae729d))

## [1.7.2](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.7.1...agentic-jsdoc-v1.7.2) (2026-03-21)


### Bug Fixes

* Clarify and add guidelines for proactively linking associated files like tests and stories using `[@see](https://github.com/see)` in JSDoc. ([e13fd91](https://github.com/jbelew/agentic-jsdoc/commit/e13fd91172c02c911ca22cc2123432f758436b75))

## [1.7.1](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.7.0...agentic-jsdoc-v1.7.1) (2026-03-21)


### Bug Fixes

* Standardize JSDoc `[@see](https://github.com/see)` tags to use `{[@link](https://github.com/link) ...}` syntax for improved linking and documentation generation. ([3b7c7e7](https://github.com/jbelew/agentic-jsdoc/commit/3b7c7e755ff86683a4f466134470d7f5fa2a1916))
* Update typedoc command in README for improved API documentation generation with expanded entry points and exclusions. ([6cf8f25](https://github.com/jbelew/agentic-jsdoc/commit/6cf8f253a278d21bb4cf324f311aec8122756e28))

## [1.7.0](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.6.1...agentic-jsdoc-v1.7.0) (2026-03-21)


### Features

* Enhance README to highlight SKILL.md for better discoverability ([a226141](https://github.com/jbelew/agentic-jsdoc/commit/a226141fb1d29e09626532dc21edab49a7dcc4d3))

## [1.6.1](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.6.0...agentic-jsdoc-v1.6.1) (2026-03-21)


### Bug Fixes

* One final semver test. ([255464c](https://github.com/jbelew/agentic-jsdoc/commit/255464c8bfeb98121b0724afa42b52fba154e8c3))

## [1.6.0](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.5.1...agentic-jsdoc-v1.6.0) (2026-03-21)

* This version contains no new changes from 1.5.1, but was released to stabilize the versioning pipeline and ensure consistent tagging.

## [1.5.1](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.5.0...agentic-jsdoc-v1.5.1) (2026-03-21)


### Bug Fixes

* Update ESLint configuration example in README to use ES module syntax and correct a markdown link in the changelog. ([dd8c6e5](https://github.com/jbelew/agentic-jsdoc/commit/dd8c6e575b9c933274d8ec3462ff1bc796d40b4b))

## [1.5.0](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.4.0...agentic-jsdoc-v1.5.0) (2026-03-21)


### Features

* Introduce detailed React JSDoc patterns, new good and bad examples, and the `[@category]` tag for LLM-optimized documentation. ([680009d](https://github.com/jbelew/agentic-jsdoc/commit/680009d80167ea0b015d41365c76af2a733fbdaa))

## [1.4.0](https://github.com/jbelew/agentic-jsdoc/compare/agentic-jsdoc-v1.3.0...agentic-jsdoc-v1.4.0) (2026-03-21)


### Features

* Add agent skill manifest and configure release automation for version management. ([b959bd3](https://github.com/jbelew/agentic-jsdoc/commit/b959bd3d805428ce54c47362c2191d4429725c4c))
* Extend JSDoc enforcement to TypeScript interfaces and types, and allow the 'category' tag. ([97d7344](https://github.com/jbelew/agentic-jsdoc/commit/97d7344f94db682485451872dca32afc7ad3ddc0))
* setup semantic release workflow, package.json, and formatting standards ([477ace6](https://github.com/jbelew/agentic-jsdoc/commit/477ace64c9193f9374e5bcb6aa3f2dab1b72219e))


### Bug Fixes

* bump project version to 1.2.0 in release manifest. ([d79cfa4](https://github.com/jbelew/agentic-jsdoc/commit/d79cfa4a47cfecf65486e5fc64921686eca19c36))
* force JavaScript actions to use Node 24 in the release workflow. ([d398658](https://github.com/jbelew/agentic-jsdoc/commit/d398658bdc64a9e2c20913f7925aedc6e3fb8c3e))
* Remove explicit `release-type: node` configuration from the release-please workflow. ([574c915](https://github.com/jbelew/agentic-jsdoc/commit/574c915efd9c730882259204491c1fe38a15350b))

## [1.3.0](https://github.com/jbelew/agentic-jsdoc/compare/v1.2.1...v1.3.0) (2026-03-21)


### Features

* Add agent skill manifest and configure release automation for version management. ([b959bd3](https://github.com/jbelew/agentic-jsdoc/commit/b959bd3d805428ce54c47362c2191d4429725c4c))
* Extend JSDoc enforcement to TypeScript interfaces and types, and allow the 'category' tag. ([97d7344](https://github.com/jbelew/agentic-jsdoc/commit/97d7344f94db682485451872dca32afc7ad3ddc0))
* setup semantic release workflow, package.json, and formatting standards ([477ace6](https://github.com/jbelew/agentic-jsdoc/commit/477ace64c9193f9374e5bcb6aa3f2dab1b72219e))


### Bug Fixes

* bump project version to 1.2.0 in release manifest. ([d79cfa4](https://github.com/jbelew/agentic-jsdoc/commit/d79cfa4a47cfecf65486e5fc64921686eca19c36))
* force JavaScript actions to use Node 24 in the release workflow. ([d398658](https://github.com/jbelew/agentic-jsdoc/commit/d398658bdc64a9e2c20913f7925aedc6e3fb8c3e))

## [1.2.1](https://github.com/jbelew/agentic-jsdoc/compare/v1.2.0...v1.2.1) (2026-03-21)


### Bug Fixes

* bump project version to 1.2.0 in release manifest. ([d79cfa4](https://github.com/jbelew/agentic-jsdoc/commit/d79cfa4a47cfecf65486e5fc64921686eca19c36))

## [1.2.0](https://github.com/jbelew/agentic-jsdoc/compare/v1.1.0...v1.2.0) (2026-03-21)


### Features

* Add agent skill manifest and configure release automation for version management. ([b959bd3](https://github.com/jbelew/agentic-jsdoc/commit/b959bd3d805428ce54c47362c2191d4429725c4c))

## [1.1.0](https://github.com/jbelew/agentic-jsdoc/compare/v1.0.1...v1.1.0) (2026-03-21)


### Features

* Extend JSDoc enforcement to TypeScript interfaces and types, and allow the 'category' tag. ([97d7344](https://github.com/jbelew/agentic-jsdoc/commit/97d7344f94db682485451872dca32afc7ad3ddc0))

## [1.0.1](https://github.com/jbelew/agentic-jsdoc/compare/v1.0.0...v1.0.1) (2026-03-21)


### Bug Fixes

* force JavaScript actions to use Node 24 in the release workflow. ([d398658](https://github.com/jbelew/agentic-jsdoc/commit/d398658bdc64a9e2c20913f7925aedc6e3fb8c3e))

## 1.0.0 (2026-03-21)


### Features

* setup semantic release workflow, package.json, and formatting standards ([477ace6](https://github.com/jbelew/agentic-jsdoc/commit/477ace64c9193f9374e5bcb6aa3f2dab1b72219e))
