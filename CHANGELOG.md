## [6.31.3](https://github.com/jbelew/nms_optimizer-web/compare/v6.31.2...v6.31.3) (2026-04-18)


### Bug Fixes

* **ci:** move cloudflare cache purge to finalize production step ([7c2324d](https://github.com/jbelew/nms_optimizer-web/commit/7c2324d84ca632d1855b103bd634f96032a73744))
* **cloudflare:** implement 1-year edge caching for static assets with browser revalidation ([b4c6960](https://github.com/jbelew/nms_optimizer-web/commit/b4c6960b2ae8d948e8e3657516f171b61bf19bdc))

## [6.31.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.31.1...v6.31.2) (2026-04-18)


### Bug Fixes

* **caching:** completely disable edge caching for html files to fix deployments ([879a85b](https://github.com/jbelew/nms_optimizer-web/commit/879a85b7342868ee8c3ed00fe21f42e06bc88e83))
* **cloudflare:** disable caching for all HTML entry points to ensure instant updates ([2595c9d](https://github.com/jbelew/nms_optimizer-web/commit/2595c9df68130df873d8612efcdd0673604f4438))
* **deployment:** trigger release to deploy caching fixes ([2096a33](https://github.com/jbelew/nms_optimizer-web/commit/2096a33249d1c0ca43a3882e68d18cf2561e7d10))

## [6.31.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.31.0...v6.31.1) (2026-04-18)


### Bug Fixes

* **cloudflare:** restore aggressive caching and robust automated purge ([aabc400](https://github.com/jbelew/nms_optimizer-web/commit/aabc400ea7d560bcbcaf715e12f06f8ad4cf11a2))

# [6.31.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.30.2...v6.31.0) (2026-04-18)


### Features

* **cloudflare:** optimize delivery pipeline and harden error recovery ([08edfdf](https://github.com/jbelew/nms_optimizer-web/commit/08edfdf02469dc6d9f77776ecb5707ac110af151)), closes [#root](https://github.com/jbelew/nms_optimizer-web/issues/root) [hi#performance](https://github.com/hi/issues/performance)

## [6.30.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.30.1...v6.30.2) (2026-04-17)


### Bug Fixes

* disable stale HTML caching and remove unused noscript background styles ([ef56332](https://github.com/jbelew/nms_optimizer-web/commit/ef56332d1d2d25766de32494114b346d50395944))

## [6.30.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.30.0...v6.30.1) (2026-04-17)


### Bug Fixes

* migrate application load retry state from sessionStorage to URL search parameters for improved resilience and recovery tracking ([fd2576f](https://github.com/jbelew/nms_optimizer-web/commit/fd2576f395ed38d46cbc255f3707c4d6ad31cd53))

# [6.30.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.29.2...v6.30.0) (2026-04-17)


### Features

* **ui:** implement isolated recovery UI for initialization failures ([bc8dbb0](https://github.com/jbelew/nms_optimizer-web/commit/bc8dbb059df0ca9948d4f8c3125dde6855b4deab))
* **ui:** implement isolated recovery UI for initialization failures with ad-blocker resilience ([dabdeb9](https://github.com/jbelew/nms_optimizer-web/commit/dabdeb9fd61885d7183585b3f0f43a6f67de971b))

## [6.29.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.29.1...v6.29.2) (2026-04-17)


### Bug Fixes

* replace client-side error handling with robust initialization logic in index.html and disable HTML caching to prevent stale deployment errors. ([7eeb37d](https://github.com/jbelew/nms_optimizer-web/commit/7eeb37d7417565885a7f2ce5c2130f09c40df836))

## [6.29.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.29.0...v6.29.1) (2026-04-17)


### Bug Fixes

* bumping to trigger release workflow ([b263ec1](https://github.com/jbelew/nms_optimizer-web/commit/b263ec117216f38fc8b66d18335560a9f43506d8))
* shorten site title and normalize URL path handling with trailing slashes ([4ae891b](https://github.com/jbelew/nms_optimizer-web/commit/4ae891b849667868b896ff2487db68681d906682))

# [6.29.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.28.1...v6.29.0) (2026-04-17)


### Features

* **dashboard:** limit audit table to last 10 runs and link to github commits ([6a786ad](https://github.com/jbelew/nms_optimizer-web/commit/6a786ad6bbe0b0c3d4efd6d9672ed550ec14517b))

## [6.28.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.28.0...v6.28.1) (2026-04-17)


### Performance Improvements

* **cloudflare:** optimize edge caching and function routing ([694a5a1](https://github.com/jbelew/nms_optimizer-web/commit/694a5a1d12d6541c8e3aaf988cc2153b99f55e46))
* merge dev to main for cloudflare optimizations ([e6b58bb](https://github.com/jbelew/nms_optimizer-web/commit/e6b58bbef62391d9705b72b32a2c6c6a95eeed34))

# [6.28.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.27.0...v6.28.0) (2026-04-17)


### Features

* force release trigger ([0ecdb6c](https://github.com/jbelew/nms_optimizer-web/commit/0ecdb6c0d050d10c3f12605ed0651b91c98b5721))
* re-trigger release workflow ([244c4f8](https://github.com/jbelew/nms_optimizer-web/commit/244c4f8c308cff8a561cbbb777c7cec1b77e746a))

# [6.27.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.27...v6.27.0) (2026-04-16)


### Bug Fixes

* resolve storybook failures and restore tooltip visibility on shared grids ([2ca986e](https://github.com/jbelew/nms_optimizer-web/commit/2ca986e796bfaf62788032d6f7a8d9ccdf2d1696))


### Features

* implementation of post-audit stability fixes and test coverage improvements ([5a577ca](https://github.com/jbelew/nms_optimizer-web/commit/5a577ca02b43d2ea6bcacea9ec7fdc4fd75a5cf8))

## [6.26.27](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.26...v6.26.27) (2026-04-16)


### Bug Fixes

* add build name persistence to GridStore and include it in screenshot exports with rounded borders and styling ([001b2ca](https://github.com/jbelew/nms_optimizer-web/commit/001b2ca70c78f1b960e1ee4a2781b1535cb734c8))

## [6.26.26](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.25...v6.26.26) (2026-04-16)


### Bug Fixes

* **security:** remove unrecognized features from permissions policy ([0fb3ec8](https://github.com/jbelew/nms_optimizer-web/commit/0fb3ec8f65918ac382aab762301689f91f9c3b91))

## [6.26.25](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.24...v6.26.25) (2026-04-16)


### Bug Fixes

* **security:** permit web-share for self in permissions policy ([144055e](https://github.com/jbelew/nms_optimizer-web/commit/144055ef2e886fb12275a18b2b4fa04ccd8c9252))

## [6.26.24](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.23...v6.26.24) (2026-04-16)


### Bug Fixes

* **security:** implement edge-wide security hardening headers ([93c5d30](https://github.com/jbelew/nms_optimizer-web/commit/93c5d30da4c802c85ccb5cb07d20f26eb7d66442))
* **security:** remove HSTS header to eliminate browser lockout risk ([2c53cee](https://github.com/jbelew/nms_optimizer-web/commit/2c53cee6213213d90336c3fe434dafd11e1133b3))
* **security:** resolve CSP block and soften HSTS for testing ([b917d30](https://github.com/jbelew/nms_optimizer-web/commit/b917d3012f71f36590cbc8503fa31d3b957e5d7d))
* **security:** resolve merge conflicts and allow PiP for youtube ([14e9186](https://github.com/jbelew/nms_optimizer-web/commit/14e9186a0744b4a8a1fdd27741af058a59ba82aa))

## [6.26.23](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.22...v6.26.23) (2026-04-16)


### Bug Fixes

* **security:** allow picture-in-picture for youtube in permissions policy ([a129685](https://github.com/jbelew/nms_optimizer-web/commit/a129685c9782daab2437e13f3d8202169a2eb567))

## [6.26.22](https://github.com/jbelew/nms_optimizer-web/compare/v6.26.21...v6.26.22) (2026-04-15)


### Bug Fixes

* **security:** implement edge-wide security hardening headers ([0876f4b](https://github.com/jbelew/nms_optimizer-web/commit/0876f4b1a7b5ead561c1930e4f5bacdd4b012997))
* **security:** remove HSTS header to eliminate browser lockout risk ([606e7ef](https://github.com/jbelew/nms_optimizer-web/commit/606e7efe83abc29a6ca39a5aa920174b8e3ca09b))
* **security:** resolve CSP block and soften HSTS for testing ([90d0a11](https://github.com/jbelew/nms_optimizer-web/commit/90d0a11fcd24bc6d092b4c0c00b2014fe0d6b920))

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
