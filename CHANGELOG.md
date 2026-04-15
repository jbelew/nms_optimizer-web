## [6.26.21](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.20...v6.26.21) (2026-04-15)


### Bug Fixes

* **seo:** implement sticky URL decoration for returning users ([6cbdb01](https://github.com/jbelew/nms_optimizer-web/commit/6cbdb015867a6492c22a9cac1213e35e26a183d7))

## [6.26.20](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.19...v6.26.20) (2026-04-14)


### Bug Fixes

* optimize chunk count and harden Lighthouse CI stability ([b1ddf4e](https://github.com/jbelew/nms_optimizer-web/commit/b1ddf4e2396b9b81b9b3407a2f8915377561a28e))

## [6.26.19](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.18...v6.26.19) (2026-04-14)


### Bug Fixes

* update Sentry configuration to increase trace sampling and filter noise from extensions and network errors ([f14af64](https://github.com/jbelew/nms_optimizer-web/commit/f14af64513b8f4c71870de169bff424d86d9e980))
* update Sentry ignore error comment formatting for readability ([65fe8bd](https://github.com/jbelew/nms_optimizer-web/commit/65fe8bd917be8039464b43f0365ae717228aa79c))

## [6.26.18](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.17...v6.26.18) (2026-04-14)


### Bug Fixes

* implement in-memory caching for assets and generated HTML to optimize response times in Cloudflare functions ([72b774f](https://github.com/jbelew/nms_optimizer-web/commit/72b774fb832f1b3cd8360a308486f037cc49fe13))


### Performance Improvements

* fix INP regression and optimize Sentry integration ([1d9355c](https://github.com/jbelew/nms_optimizer-web/commit/1d9355c2b802be545fefadbcc550bb03186a69da))

## [6.26.17](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.16...v6.26.17) (2026-04-14)


### Bug Fixes

* **seo:** align metadata lookups with trailing slash architecture and improve edge injection ([23c4937](https://github.com/jbelew/nms_optimizer-web/commit/23c49374e8278afb5a55402884d1d6ea73e5ee1c))

## [6.26.16](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.15...v6.26.16) (2026-04-13)


### Bug Fixes

* implement dynamic SEO metadata injection and hreflang tags in Cloudflare edge SPA fallback ([79a79b4](https://github.com/jbelew/nms_optimizer-web/commit/79a79b46f1e5575a856d011bb11529e93624b493))

## [6.26.15](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.14...v6.26.15) (2026-04-13)


### Bug Fixes

* integrate Sentry router instrumentation, remove unused zod dependency, and adjust font preload priority ([c2f4d26](https://github.com/jbelew/nms_optimizer-web/commit/c2f4d26513e211098e0b639d848628197498e1c2))

## [6.26.14](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.13...v6.26.14) (2026-04-12)


### Bug Fixes

* increase Sentry traces sample rate from 0.2 to 0.5 in production ([82d8c50](https://github.com/jbelew/nms_optimizer-web/commit/82d8c5041ebea7906644be3c588d7077d1792fcb))

## [6.26.13](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.12...v6.26.13) (2026-04-12)


### Bug Fixes

* add Sentry configuration secrets to CI build steps ([f182ace](https://github.com/jbelew/nms_optimizer-web/commit/f182acec4045e32223fff17a8f8c4a112ba7b972))

## [6.26.12](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.11...v6.26.12) (2026-04-12)


### Bug Fixes

* implement pre-commit hook to enforce Beads-Conductor integration and document workflow in learnings ([a8d4430](https://github.com/jbelew/nms_optimizer-web/commit/a8d44305805dc05d39dbea1e7044cbb5d92f7c91))

## [6.26.11](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.10...v6.26.11) (2026-04-12)


### Performance Improvements

* **caching:** restore edge caching strategy for HTML to improve TTFB ([f18d913](https://github.com/jbelew/nms_optimizer-web/commit/f18d9132e2b657ef8ea421d27ba765f0e061926d))

## [6.26.10](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.9...v6.26.10) (2026-04-12)


### Bug Fixes

* **seo:** implement robust URL sanitization to strip mangled paths and unrecognized parameters ([83650f9](https://github.com/jbelew/nms_optimizer-web/commit/83650f9644db32d11349fe8056a675d99446d114))

## [6.26.9](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.8...v6.26.9) (2026-04-12)


### Bug Fixes

* **seo:** standardize trailing slashes across all routes and preserve query params ([846e916](https://github.com/jbelew/nms_optimizer-web/commit/846e9164f50af75a1b722beba6440f7f48298fc5))

## [6.26.8](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.7...v6.26.8) (2026-04-12)


### Bug Fixes

* **seo:** standardize trailing slashes across all routes and normalize platform URLs ([2a84a99](https://github.com/jbelew/nms_optimizer-web/commit/2a84a99682228adde767c432be0df6609b358d85))

## [6.26.7](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.6...v6.26.7) (2026-04-12)


### Bug Fixes

* **seo:** ensure consistent trailing slashes for language-prefixed routes ([23d23eb](https://github.com/jbelew/nms_optimizer-web/commit/23d23eb50f565970bbbdfc31af1cd9973c41ffc1))
* **translate:** add requirements.txt and improve bot detection reliability ([ea84846](https://github.com/jbelew/nms_optimizer-web/commit/ea84846ac350fb1ce512f7a10fdaf1e0e646b390))

## [6.26.6](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.5...v6.26.6) (2026-04-12)


### Bug Fixes

* **seo:** implement dynamic FAQPage schema and improved bot detection for welcome dialog ([0285aaa](https://github.com/jbelew/nms_optimizer-web/commit/0285aaa2e89b412dca1a26584a838a4a0ca8c20d))

## [6.26.5](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.4...v6.26.5) (2026-04-12)


### Bug Fixes

* update Corvette warning ([74a6753](https://github.com/jbelew/nms_optimizer-web/commit/74a67535ac724ec3b88d4bf69f1b8701452c5944))

## [6.26.4](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.3...v6.26.4) (2026-04-11)


### Bug Fixes

* **ci:** correct YAML syntax in update-screenshots workflow ([a41f939](https://github.com/jbelew/nms_optimizer-web/commit/a41f939f536d8264821e24f329325b097ba8df4e))
* **ci:** ensure all changes are staged before rebase in screenshot workflow ([1986984](https://github.com/jbelew/nms_optimizer-web/commit/1986984ea279848f588d923c56ef22c5fcc0aa34))

## [6.26.3](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.2...v6.26.3) (2026-04-11)


### Bug Fixes

* **analytics:** correct Cloudflare beacon tag configuration ([7cb4ddb](https://github.com/jbelew/nms_optimizer-web/commit/7cb4ddb8662a6880445be5a1455e4279f5a42984))

## [6.26.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.1...v6.26.2) (2026-04-11)


### Bug Fixes

* **ci:** trigger release workflow verification ([3cccdef](https://github.com/jbelew/nms_optimizer-web/commit/3cccdefce59b44662f481c1c3d6698c82c036c58))

## [6.26.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.0...v6.26.1) (2026-04-11)


### Bug Fixes

* **ci:** solve local action bootstrap error and apply latest updates ([a7e6766](https://github.com/jbelew/nms_optimizer-web/commit/a7e676647a74c3915196be47bc2ac384553dc413))

# [6.26.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.25.1...v6.26.0) (2026-04-11)


### Features

* **l10n:** implement intelligent AI translation system and standardize headers ([493a0cb](https://github.com/jbelew/nms_optimizer-web/commit/493a0cb7cd1a6dad35c1a6b38f1814ed31bf0820))

# [6.25.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.24.2...v6.25.0) (2026-04-11)


### Features

* **l10n:** high-quality baseline refresh for all supported languages using Gemini 2.5 Flash
* **l10n:** migrate from Crowdin to Gemini-AI automated translation workflow ([8d6240d](https://github.com/jbelew/nms_optimizer-web/commit/8d6240d706990ae9060ae9060ae9060ae9060ae9))


## [6.24.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.24.1...v6.24.2) (2026-04-11)
