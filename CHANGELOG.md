## [7.0.8](https://github.com/jbelew/nms_optimizer-web/compare/v7.0.7...v7.0.8) (2026-05-03)


### Bug Fixes

* update performance trend logic to use formatted values and composite scores for UI consistency and add tests ([b9c2772](https://github.com/jbelew/nms_optimizer-web/commit/b9c277259d6e88aca4fd38691356c37b6b8005c9))

## [7.0.7](https://github.com/jbelew/nms_optimizer-web/compare/v7.0.6...v7.0.7) (2026-05-02)


### Bug Fixes

* finalize performance dashboard design with unified hierarchical styling and optimized deep-linking ([8922e1b](https://github.com/jbelew/nms_optimizer-web/commit/8922e1b4f70a132c8d4ab3905df93c0f8ff01646))

## [7.0.6](https://github.com/jbelew/nms_optimizer-web/compare/v7.0.5...v7.0.6) (2026-05-02)


### Bug Fixes

* update overall performance chart threshold band to yellow and fix lint errors ([5ea1796](https://github.com/jbelew/nms_optimizer-web/commit/5ea1796f47bf0dad7b2585f8af91ae37c4380bd5))

## [7.0.5](https://github.com/jbelew/nms_optimizer-web/compare/v7.0.4...v7.0.5) (2026-05-02)


### Bug Fixes

* resolve Cloudflare 404 on performance sub-route reload ([4234a67](https://github.com/jbelew/nms_optimizer-web/commit/4234a6778ba99d95e692de49a3d0a5da8bb67c15))

## [7.0.4](https://github.com/jbelew/nms_optimizer-web/compare/v7.0.3...v7.0.4) (2026-05-02)


### Bug Fixes

* performance dashboard synchronization, deep-linking, and tooltip coloring ([4d22f61](https://github.com/jbelew/nms_optimizer-web/commit/4d22f616fbf9d7107d258e4559634c3317837da3))

## [7.0.3](https://github.com/jbelew/nms_optimizer-web/compare/v7.0.2...v7.0.3) (2026-05-02)


### Bug Fixes

* sync overall score with graph, implement performance metric sub-routes with trailing slashes ([f0d5882](https://github.com/jbelew/nms_optimizer-web/commit/f0d5882b346683cdf751a569f5a86d59335f2954))

## [7.0.2](https://github.com/jbelew/nms_optimizer-web/compare/v7.0.1...v7.0.2) (2026-05-02)


### Bug Fixes

* resolve linting, formatting, and JSDoc issues ([a178048](https://github.com/jbelew/nms_optimizer-web/commit/a1780488900ad969ec5b60c332fe4338100d00ee))

## [7.0.1](https://github.com/jbelew/nms_optimizer-web/compare/v7.0.0...v7.0.1) (2026-05-01)


### Bug Fixes

* rebrand Optimiseur/Optimizador de NMS to NMS Optimizer across all locales and assets ([29b5053](https://github.com/jbelew/nms_optimizer-web/commit/29b50530f818f10cb2aff8f63b3c9ab7d1d2467c))

## [6.37.6](https://github.com/jbelew/nms_optimizer-web/compare/v6.37.5...v6.37.6) (2026-04-29)


### Bug Fixes

* **pwa:** disable navigation preload to resolve cancelled request error on 404 navigation ([4be7c63](https://github.com/jbelew/nms_optimizer-web/commit/4be7c639c26e7fd85736261c0ed7a0ff9c665d26))

## [6.37.5](https://github.com/jbelew/nms_optimizer-web/compare/v6.37.4...v6.37.5) (2026-04-29)


### Performance Improvements

* finalize transition to full SSG and consolidate caching strategy ([94003aa](https://github.com/jbelew/nms_optimizer-web/commit/94003aa68d796ff93ba89e6692b432b54fda1376))

## [6.37.4](https://github.com/jbelew/nms_optimizer-web/compare/v6.37.3...v6.37.4) (2026-04-29)


### Performance Improvements

* finalize transition to full SSG and consolidate caching strategy ([b7ff2d4](https://github.com/jbelew/nms_optimizer-web/commit/b7ff2d45126a2a203d0817b7aa5191cdcdcc59eb))

## [6.37.3](https://github.com/jbelew/nms_optimizer-web/compare/v6.37.2...v6.37.3) (2026-04-29)


### Performance Improvements

* seal cache holes by using wildcard matching for all entry points ([52a9cdf](https://github.com/jbelew/nms_optimizer-web/commit/52a9cdf457403f5cce64ada442e007c7d831f71c))

## [6.37.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.37.1...v6.37.2) (2026-04-29)


### Performance Improvements

* allow caching of manifest.json ([34dc6bd](https://github.com/jbelew/nms_optimizer-web/commit/34dc6bde146c3538c111ebb174212663c9d02b11))
* optimize cloudflare caching by resolving header overlaps and bypassing functions for static content ([a51505a](https://github.com/jbelew/nms_optimizer-web/commit/a51505a07f5733f3a32e41851d445ed92aed98d9))

## [6.37.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.37.0...v6.37.1) (2026-04-28)


### Bug Fixes

* implement data sub-sampling in performance charts and update line interpolation to basis ([cd7481a](https://github.com/jbelew/nms_optimizer-web/commit/cd7481a73ac43177ef113c7d33df9017b76e9aec))

# [6.37.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.36.2...v6.37.0) (2026-04-27)


### Features

* **ui:** complete modular performance dashboard with overall score and trend indicators ([184ad78](https://github.com/jbelew/nms_optimizer-web/commit/184ad78ddc58b2b059f86f1fa53b5a5c7543b053))
* **ui:** implement interactive metric cards and selection state ([47c5eb2](https://github.com/jbelew/nms_optimizer-web/commit/47c5eb2fd07a65087265b543517c31309ea421f4))

## [6.36.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.36.1...v6.36.2) (2026-04-27)


### Performance Improvements

* optimize initial load by refactoring index.html resource preloads and removing Vite DevTools dependency ([87fc359](https://github.com/jbelew/nms_optimizer-web/commit/87fc359493cbc953d7ce4bd60c36d2668a80cb01))

## [6.36.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.36.0...v6.36.1) (2026-04-26)


### Bug Fixes

* add performance metric trend indicators and update description translations ([20073b7](https://github.com/jbelew/nms_optimizer-web/commit/20073b783521fc25f18a5bf730668a9e04088043))

# [6.36.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.35.8...v6.36.0) (2026-04-26)


### Features

* **analytics:** implement multi-probe adblocker detection with anti-spoofing ([52dc7ec](https://github.com/jbelew/nms_optimizer-web/commit/52dc7ec40e512812c36f75ac06436e3c2b23a67e))

## [6.35.8](https://github.com/jbelew/nms_optimizer-web/compare/v6.35.7...v6.35.8) (2026-04-26)


### Bug Fixes

* implement periodic service worker updates and update PWA and E2E environment configurations ([143749e](https://github.com/jbelew/nms_optimizer-web/commit/143749e13248152156d378c77ccf804970ac85db))

## [6.35.7](https://github.com/jbelew/nms_optimizer-web/compare/v6.35.6...v6.35.7) (2026-04-26)


### Bug Fixes

* enable navigation preload and prioritize network-only navigation requests to optimize TTFB ([d1ddc44](https://github.com/jbelew/nms_optimizer-web/commit/d1ddc4494095633660471a1cbb8c11025ff9fca7))

## [6.35.6](https://github.com/jbelew/nms_optimizer-web/compare/v6.35.5...v6.35.6) (2026-04-26)


### Bug Fixes

* update production websocket URL and replace TBT with CLS in performance metrics visualization ([d3792df](https://github.com/jbelew/nms_optimizer-web/commit/d3792dfd4e5c87109e909b893c646fe08a0b0b3c))

## [6.35.5](https://github.com/jbelew/nms_optimizer-web/compare/v6.35.4...v6.35.5) (2026-04-26)


### Bug Fixes

* add cloudflareinsights.com to Content-Security-Policy connect-src directive ([fb59d64](https://github.com/jbelew/nms_optimizer-web/commit/fb59d644b1a714556ec143b474a7cab63ddd4632))

## [6.35.4](https://github.com/jbelew/nms_optimizer-web/compare/v6.35.3...v6.35.4) (2026-04-26)


### Bug Fixes

* robust CSP, resolve ReferenceLine closure scope natively, and fix local SW fetch errors ([13bba80](https://github.com/jbelew/nms_optimizer-web/commit/13bba807e0dc23882ade03475497aaedea2eba0b))

## [6.35.3](https://github.com/jbelew/nms_optimizer-web/compare/v6.35.2...v6.35.3) (2026-04-26)


### Bug Fixes

* disallow crawlers on performance routes and update SPA shell fetching to prevent redirect propagation ([6811af7](https://github.com/jbelew/nms_optimizer-web/commit/6811af707c672799be26bce9dd9faf885e66d2de))

## [6.35.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.35.1...v6.35.2) (2026-04-26)


### Bug Fixes

* migrate SPA route fallbacks to Cloudflare Functions and select highest performance score from lighthouse manifest ([3b9ceeb](https://github.com/jbelew/nms_optimizer-web/commit/3b9ceeb5df5c72c8d6b5ace38ed7fa86b2c6e3e9))

## [6.35.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.35.0...v6.35.1) (2026-04-26)


### Bug Fixes

* update sitemap timestamps, add CI sync step, and add SPA redirect wildcards for performance routes ([ed8d3ee](https://github.com/jbelew/nms_optimizer-web/commit/ed8d3ee77eb351b812063670da2d69edbea8f86f))

# [6.35.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.34.8...v6.35.0) (2026-04-26)


### Features

* add performance monitoring dialog and improve analytics tracking reliability ([b0ee519](https://github.com/jbelew/nms_optimizer-web/commit/b0ee5199f12aea0047d8fd114f8eac91eaec2748))

## [6.34.8](https://github.com/jbelew/nms_optimizer-web/compare/v6.34.7...v6.34.8) (2026-04-23)


### Performance Improvements

* improve INP score via concurrent rendering and task deferral ([24df5f1](https://github.com/jbelew/nms_optimizer-web/commit/24df5f1e7128ed4bc51640ce19e89374d8f77b4c))

## [6.34.7](https://github.com/jbelew/nms_optimizer-web/compare/v6.34.6...v6.34.7) (2026-04-23)


### Bug Fixes

* update maintenance page styles and exclude static error pages from service worker caching ([ed5ee0a](https://github.com/jbelew/nms_optimizer-web/commit/ed5ee0a60d01f68f07e7ab51d7572cd713e8baa6))

## [6.34.6](https://github.com/jbelew/nms_optimizer-web/compare/v6.34.5...v6.34.6) (2026-04-23)


### Performance Improvements

* add Vite plugin to purge unused Radix Themes CSS from production builds ([eed8e13](https://github.com/jbelew/nms_optimizer-web/commit/eed8e1367458901a1c6a5c05c754233acca6fc78))
* eliminate render-blocking CSS and fix E2E regressions ([34f9bdd](https://github.com/jbelew/nms_optimizer-web/commit/34f9bdd2fb6f54c3f5b49669205480cf25e0ffc1))
* eliminate render-blocking CSS via comprehensive lazy-loading ([611c135](https://github.com/jbelew/nms_optimizer-web/commit/611c135e216de550882a8806b6b2086a442718d6))

## [6.34.5](https://github.com/jbelew/nms_optimizer-web/compare/v6.34.4...v6.34.5) (2026-04-22)


### Performance Improvements

* add Vite plugin to purge unused Radix Themes CSS from production builds ([0fbba95](https://github.com/jbelew/nms_optimizer-web/commit/0fbba951bb4130c45c8ccd108d5eb1a3706404d9))
* revert chunk consolidation to fix TBT/LCP regressions, keep manifest deferral ([7735fb3](https://github.com/jbelew/nms_optimizer-web/commit/7735fb315e70cc63245996ae85c5c45577feb11f))

## [6.34.4](https://github.com/jbelew/nms_optimizer-web/compare/v6.34.3...v6.34.4) (2026-04-22)


### Performance Improvements

* consolidate CSS and JS chunks, and defer manifest loading to optimize LCP and TBT ([38165c4](https://github.com/jbelew/nms_optimizer-web/commit/38165c48360d580145736324aaa19393701f94ee))

## [6.34.3](https://github.com/jbelew/nms_optimizer-web/compare/v6.34.2...v6.34.3) (2026-04-21)


### Bug Fixes

* **pwa:** rename analytics chunk and fix favicon path for incognito reliability ([977b33d](https://github.com/jbelew/nms_optimizer-web/commit/977b33d45bbadd6cd423d010695924cd24837b48))

## [6.34.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.34.1...v6.34.2) (2026-04-21)


### Performance Improvements

* remove deferStylesheetsPlugin to eliminate FOUC ([d67bcce](https://github.com/jbelew/nms_optimizer-web/commit/d67bcced80729504e63a9e9a4162fbb45b48c1c7))

## [6.34.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.34.0...v6.34.1) (2026-04-20)


### Bug Fixes

* refine SEO titles and descriptions across all pages and languages, and update tests ([0c69330](https://github.com/jbelew/nms_optimizer-web/commit/0c6933080a3315301232035ce8d77f5ddc304c44))

# [6.34.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.33.4...v6.34.0) (2026-04-20)


### Bug Fixes

* **ssg:** restore CSS by making template extraction regex more resilient ([e961864](https://github.com/jbelew/nms_optimizer-web/commit/e9618644a4b77ce69cabf668e77c7980aa0f6e4e))


### Features

* **ssg:** automate H1 synchronization with standardized page titles ([90f02fb](https://github.com/jbelew/nms_optimizer-web/commit/90f02fbc301f91ea041d0762d0854e8d8c4f3b6f))

## [6.33.4](https://github.com/jbelew/nms_optimizer-web/compare/v6.33.3...v6.33.4) (2026-04-19)


### Performance Improvements

* de-bundle Sentry, optimize cache efficacy, and clean up obsolete config ([64ab79b](https://github.com/jbelew/nms_optimizer-web/commit/64ab79b48bf7acf585aa1bea3720aaf611032a94))

## [6.33.3](https://github.com/jbelew/nms_optimizer-web/compare/v6.33.2...v6.33.3) (2026-04-19)


### Performance Improvements

* optimize cache efficacy and enforce entry point bypass ([e5c8106](https://github.com/jbelew/nms_optimizer-web/commit/e5c8106e1ff6eefc2910a775855600c7764299fe))

## [6.33.2](https://github.com/jbelew/nms_optimizer-web/compare/v6.33.1...v6.33.2) (2026-04-18)


### Bug Fixes

* **version:** normalize version prefix at build-time to prevent GA4 duplicates ([1bf1694](https://github.com/jbelew/nms_optimizer-web/commit/1bf169410975fd9941023ea18d0470242a013368))

## [6.33.1](https://github.com/jbelew/nms_optimizer-web/compare/v6.33.0...v6.33.1) (2026-04-18)


### Bug Fixes

* **version:** normalize version prefix at build-time to prevent GA4 duplicates ([741d49e](https://github.com/jbelew/nms_optimizer-web/commit/741d49e24297bbf12ec061fbae4768ce0dcd92c0))

# [6.33.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.32.0...v6.33.0) (2026-04-18)


### Bug Fixes

* clean version display, repair translations, and harden auto-translate workflow ([1e64935](https://github.com/jbelew/nms_optimizer-web/commit/1e64935310dc357e61ca4f423d108b38d1655547))
* **translate:** preserve JSON arrays and handle 503 errors with retries ([c4082da](https://github.com/jbelew/nms_optimizer-web/commit/c4082da5f58687c72e54a669eaa3b1a73ea59114))


### Features

* **seo:** Create shared localized Schema utility ([9a4f15b](https://github.com/jbelew/nms_optimizer-web/commit/9a4f15bc75dbeae58c7d31e42c6965a2434d0131))
* **seo:** Create shared localized Schema utility ([fcbecc9](https://github.com/jbelew/nms_optimizer-web/commit/fcbecc94289eaf7a1d885dec64261a407bebbf98))
* **seo:** localize JSON-LD FAQ schema for client and SSG ([3982b6b](https://github.com/jbelew/nms_optimizer-web/commit/3982b6b1d878fba10382f6a3f4dd3cc23f84bffc))
* **seo:** localize JSON-LD FAQ schema for client and SSG ([a7e074c](https://github.com/jbelew/nms_optimizer-web/commit/a7e074ce0d41b96bb002faa6c69bff558320ad94))
* **seo:** Sync localized Schema across CSR and SSG ([8ab1a09](https://github.com/jbelew/nms_optimizer-web/commit/8ab1a09f2eecef80c6fa8a8c668e3de63d3fa238))
* **seo:** Sync localized Schema across CSR and SSG ([e94a76d](https://github.com/jbelew/nms_optimizer-web/commit/e94a76d46a9443be6c741dfb803d0313ea9cff02))
* **seo:** Update useSeoAndTitle to use shared localized Schema ([423822f](https://github.com/jbelew/nms_optimizer-web/commit/423822f5b8db50e077447b165e7f1e882d5af54f))
* **seo:** Update useSeoAndTitle to use shared localized Schema ([73b6713](https://github.com/jbelew/nms_optimizer-web/commit/73b6713a5b5750531a6d4c527c2c744238a8095d))

# [6.32.0](https://github.com/jbelew/nms_optimizer-web/compare/v6.31.7...v6.32.0) (2026-04-18)


### Bug Fixes

* **caching:** restore build directory split to fix overlapping edge cache rules ([3b92d41](https://github.com/jbelew/nms_optimizer-web/commit/3b92d412559027cc9f21979c4f373e07686cc9b0))
* **resilience:** remove duplicate preloadError handler, fix cache check, improve recovery flow ([fb934e7](https://github.com/jbelew/nms_optimizer-web/commit/fb934e7aefbc5762e83eab0e0a0fe33aa38a6c78))


### Features

* **sync:** synchronize dev with main and resolve resilience conflicts ([e528269](https://github.com/jbelew/nms_optimizer-web/commit/e528269ba2370d384b6447c4207d50efc2acc1fb))

## [6.31.7](https://github.com/jbelew/nms_optimizer-web/compare/v6.31.6...v6.31.7) (2026-04-18)


### Bug Fixes

* **resilience:** avoid triggering recovery for third-party script failures ([802cbda](https://github.com/jbelew/nms_optimizer-web/commit/802cbda068e672b19eda86863327f2ac00570aca))

## [6.31.6](https://github.com/jbelew/nms_optimizer-web/compare/v6.31.5...v6.31.6) (2026-04-18)


### Bug Fixes

* **deploy:** force trigger production release via push event ([80e0ae3](https://github.com/jbelew/nms_optimizer-web/commit/80e0ae3991872ae58a35f1826f261c0d11e00404))
* **resilience:** ensure reliable boot error recovery and test stabilization ([1fcebde](https://github.com/jbelew/nms_optimizer-web/commit/1fcebdecad0c8555dfa9772d10c639b321d3ed32))
* **resilience:** trigger production release for resilience and reliability improvements ([bc61cc7](https://github.com/jbelew/nms_optimizer-web/commit/bc61cc7201859b72c9f143168aeb44e6de87672b))

## [6.31.5](https://github.com/jbelew/nms_optimizer-web/compare/v6.31.4...v6.31.5) (2026-04-18)


### Bug Fixes

* **ci:** restore 5s sleep before cloudflare cache purge ([7f62547](https://github.com/jbelew/nms_optimizer-web/commit/7f62547c61fe0ab85dd5418ab13f624542f1c877))
* **ci:** restore cloudflare cache purge step in production deploy ([e37eb80](https://github.com/jbelew/nms_optimizer-web/commit/e37eb8074b9e90e5a9876d7ef7d1ef2600458ce6))

## [6.31.4](https://github.com/jbelew/nms_optimizer-web/compare/v6.31.3...v6.31.4) (2026-04-18)


### Bug Fixes

* resolve infinite reload loops and cloudflare caching issues ([dd1f5ca](https://github.com/jbelew/nms_optimizer-web/commit/dd1f5ca216328fe17858e7f0ce6d57b1deba4ec2))

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
