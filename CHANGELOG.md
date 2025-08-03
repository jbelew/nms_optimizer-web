## [3.4.11](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.10...v3.4.11) (2025-08-03)


### Bug Fixes

* **release:** Improve changelog extraction in GitHub Action ([ac83f88](https://github.com/jbelew/nms_optimizer-web/commit/ac83f889b7debf5f4fd1393c6e9e6a7f3b2151a7))



## [3.4.10](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.9...v3.4.10) (2025-08-03)


### Features

* Enhance GA, optimize performance, and improve build process ([96c436d](https://github.com/jbelew/nms_optimizer-web/commit/96c436d21f58a5416acae87d5aa8a5a065c73137))



## [3.4.9](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.8...v3.4.9) (2025-08-03)



## [3.4.8](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.7...v3.4.8) (2025-08-03)


### Bug Fixes

* Generate changelog after version bump ([0417b6c](https://github.com/jbelew/nms_optimizer-web/commit/0417b6cb3eb5d89b0fc32a314ff61569ccb355d3))
* **performance:** remove unnecessary setTimeout in useUrlSync ([4274936](https://github.com/jbelew/nms_optimizer-web/commit/42749368e0c6638df1684a0b14895993e6c20058))



## [3.4.7](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.6...v3.4.7) (2025-08-03)


### Bug Fixes

* **analytics:** added app_version to web vitals metrics ([2e8f164](https://github.com/jbelew/nms_optimizer-web/commit/2e8f16443f763279f048b3a5b9a9a64adbefaec6))


### Features

* Leverage app_version in Google Analytics ([01167a5](https://github.com/jbelew/nms_optimizer-web/commit/01167a530ad173b5c283b15ae1a771ebc4084dbd))



## [3.4.6](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.5...v3.4.6) (2025-08-02)



## [3.4.5](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.4...v3.4.5) (2025-08-02)


### Bug Fixes

* **analytics:** Enable analytics in development mode ([4eaee67](https://github.com/jbelew/nms_optimizer-web/commit/4eaee67cb11de8fc8f4c8eda5085864c41b011c8))
* **analytics:** Update event tracking to new GA4 signature ([9eef1cf](https://github.com/jbelew/nms_optimizer-web/commit/9eef1cf8b482d8fab2f5807ad04538fe4df8aef8))
* **analytics:** updated web_vitals GA4 tag ([276482d](https://github.com/jbelew/nms_optimizer-web/commit/276482dd30b65191edbd7e984b2697578398ceb7))


### Features

* **analytics:** Enhance analytics events and error boundary for better debugging ([a16f29b](https://github.com/jbelew/nms_optimizer-web/commit/a16f29b23cfd8065328339ee6805114c2d94de6c))



## [3.4.4](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.3...v3.4.4) (2025-07-31)



## [3.4.3](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.2...v3.4.3) (2025-07-31)



## [3.4.2](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.1...v3.4.2) (2025-07-31)



## [3.4.1](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.0...v3.4.1) (2025-07-31)



# [3.4.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.3.2...v3.4.0) (2025-07-31)


### Bug Fixes

* **analytics:** updated GA analytics implementation ([5ae221f](https://github.com/jbelew/nms_optimizer-web/commit/5ae221f15f2a57d8ef44bbcbfc0f9eecada2448c))
* **gridcell:** addressed failing tests ([3b7ffa7](https://github.com/jbelew/nms_optimizer-web/commit/3b7ffa7fd5fcd73bea2876de298e520a51ae2682))


### Performance Improvements

* **gridcell:** improved performance of the "empty" SVG rendering ([55d0c34](https://github.com/jbelew/nms_optimizer-web/commit/55d0c34429398e337654bbaedfcde4e3529bcd2f))



## [3.3.2](https://github.com/jbelew/nms_optimizer-web/compare/v3.3.1...v3.3.2) (2025-07-30)



## [3.3.1](https://github.com/jbelew/nms_optimizer-web/compare/v3.2.8...v3.3.1) (2025-07-30)


### Bug Fixes

* **release:** use full CHANGELOG.md for release body and revert toggleCellActive tests\n\n- Modified `.github/workflows/github-release.yml` to use the entire `CHANGELOG.md` file as the release body.\n- Reverted tests in `src/store/GridStore.test/toggleCellActive.test.ts` to align with the previous `toggleCellActive` functionality.\n- Reverted `toggleCellActive` logic in `src/store/GridStore.ts` to its previous state. ([c017b21](https://github.com/jbelew/nms_optimizer-web/commit/c017b219ca161b14000611d8de07c24dea7a83bd))


### Reverts

* Revert "fix(gridcell): fix for failing tests" ([ab3b168](https://github.com/jbelew/nms_optimizer-web/commit/ab3b168ccd3e508a72d3e560d6e197a1dabc8033))



## [3.2.8](https://github.com/jbelew/nms_optimizer-web/compare/v3.2.7...v3.2.8) (2025-07-29)


### Bug Fixes

* **husky:** auto-stage prettier changes and update changelog on version\n\n- Modified `.husky/pre-commit` to automatically stage changes made by `prettier`.\n- Added `preversion` script to `package.json` to update and stage `CHANGELOG.md` before `npm version` creates a new version commit. ([243be1e](https://github.com/jbelew/nms_optimizer-web/commit/243be1e88c0f7c475a591c0c0d74dfd033bc44b3))



## [3.2.7](https://github.com/jbelew/nms_optimizer-web/compare/v3.2.6...v3.2.7) (2025-07-29)


### Bug Fixes

* **gridcell:** fix for failing tests ([1d7a362](https://github.com/jbelew/nms_optimizer-web/commit/1d7a362faf56f34329625d4a2838ee8acd94d8c6))


### Features

* **gridstore:** update toggleCellActive behavior and tests ([8e5c35c](https://github.com/jbelew/nms_optimizer-web/commit/8e5c35c45e31b471d11ae885b77e837cba88ace1))
* **gridstore:** update toggleCellSupercharged tests ([152da72](https://github.com/jbelew/nms_optimizer-web/commit/152da729629c9277170cb0be155f486ff0443b4e))


### Performance Improvements

* **background:** added preload for the mobile version of the background ([fcf6ddb](https://github.com/jbelew/nms_optimizer-web/commit/fcf6ddb9c0fca6ef205fd5c1ab4450ede71fa95e))



## [3.2.6](https://github.com/jbelew/nms_optimizer-web/compare/v3.2.5...v3.2.6) (2025-07-29)



## [3.2.5](https://github.com/jbelew/nms_optimizer-web/compare/v3.2.4...v3.2.5) (2025-07-28)



## [3.2.4](https://github.com/jbelew/nms_optimizer-web/compare/v3.2.3...v3.2.4) (2025-07-28)



## [3.2.3](https://github.com/jbelew/nms_optimizer-web/compare/v3.2.2...v3.2.3) (2025-07-28)



## [3.2.2](https://github.com/jbelew/nms_optimizer-web/compare/60e59b69cfac62c0c4539fcf453b263148213800...v3.2.2) (2025-07-28)


### Bug Fixes

* Adjust sidebar width to improve layout and add high contrast to badges when no tech is in grid ([0f6e7aa](https://github.com/jbelew/nms_optimizer-web/commit/0f6e7aa43751fe8a54a5657c6eed2dfd550ac1ae))
* **versioning:** fix to get standard-release working ([5eab0a6](https://github.com/jbelew/nms_optimizer-web/commit/5eab0a6221667ab46b76aefb4fe7fc09c2db6e33))


### Features

* Add comprehensive tests for GridStore ([60e59b6](https://github.com/jbelew/nms_optimizer-web/commit/60e59b69cfac62c0c4539fcf453b263148213800))
* Configure critical CSS extraction with enforce: 'post' ([7f26b5c](https://github.com/jbelew/nms_optimizer-web/commit/7f26b5c288338c358a5e1fff28836ceee2786af5))
* Defer non-critical CSS and inline critical CSS post-build ([4066af4](https://github.com/jbelew/nms_optimizer-web/commit/4066af47f94807d67dc1f00329f3db039e431d23))
* **i18n:** Updated translations with new terms and phrases ([ce77d57](https://github.com/jbelew/nms_optimizer-web/commit/ce77d57dc8950827548ec4fcfc82aadb81e0672d))
* Implement further performance optimizations ([2604a0e](https://github.com/jbelew/nms_optimizer-web/commit/2604a0ea231f117ec9207b1a55f70f8aa6de797a))
* Implement various performance optimizations ([4a1cfa1](https://github.com/jbelew/nms_optimizer-web/commit/4a1cfa10e5bd4f606832b52e39c5bdf457cfbe90))
* Inline critical CSS after compression via custom plugin ([a1aca94](https://github.com/jbelew/nms_optimizer-web/commit/a1aca94b343447c82f2945ee2eaaa0d0f870b2a2))
* Optimize grid calculations for INP improvement ([c0310ff](https://github.com/jbelew/nms_optimizer-web/commit/c0310ffa00dfc056696f6ebae934be0a1e7250a7))
* Source app version from package.json for GA and AppHeader ([dc4ae52](https://github.com/jbelew/nms_optimizer-web/commit/dc4ae527d93f87908f49259ac9836b48eec0924c))



