## [4.9.3](https://github.com/jbelew/nms_optimizer-web/compare/v4.9.2...v4.9.3) (2025-11-03)


### Bug Fixes

* **docker:** moved building the rust wheels into the pipeline to ensure arm64 support ([a20bcd3](https://github.com/jbelew/nms_optimizer-web/commit/a20bcd320de39994ff0a0e8aee200302ad11537e))

## [4.9.2](https://github.com/jbelew/nms_optimizer-web/compare/v4.9.1...v4.9.2) (2025-11-03)


### Bug Fixes

* **docker:** fixed the docker build to pull in the rust wheels properly ([b6cbd6e](https://github.com/jbelew/nms_optimizer-web/commit/b6cbd6eff291f14031e37ac592acffb0b040afc2))

## [4.9.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.9.0...v4.9.1) (2025-11-03)


### Bug Fixes

* **docker:** fix for docker builds to pick up the locally built rust wheels ([67ef075](https://github.com/jbelew/nms_optimizer-web/commit/67ef075dd7f7fadaeac6f020105a3051b732fcfb))

# [4.9.0](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.11...v4.9.0) (2025-11-03)


### Features

* **rust!:** ported the main solver to rust. Minor fixes to support that change ([88fa1ff](https://github.com/jbelew/nms_optimizer-web/commit/88fa1ff25c6d225a284ed54043176173eca6d4d9))

## [4.8.11](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.10...v4.8.11) (2025-10-30)


### Bug Fixes

* **toast:** triggering a version bump for the toast removal ([6d60782](https://github.com/jbelew/nms_optimizer-web/commit/6d60782976653493a17c52cd776e8f03d044e0a6))

## [4.8.10](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.9...v4.8.10) (2025-10-29)


### Performance Improvements

* **markdown:** lazy loading the markdown libraries ([b713c49](https://github.com/jbelew/nms_optimizer-web/commit/b713c491f503b140a7f1a2d8e68f6560535b255e))

## [4.8.9](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.8...v4.8.9) (2025-10-28)


### Performance Improvements

* **app:** did a pass on removing unnecessary props ([ccead4c](https://github.com/jbelew/nms_optimizer-web/commit/ccead4c00f2fa5c08526a6e2b48bacc9c6f1bcec))

## [4.8.8](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.7...v4.8.8) (2025-10-27)


### Bug Fixes

* **docker:** possible fix or docker builds hanging ([2037d56](https://github.com/jbelew/nms_optimizer-web/commit/2037d567e5f71bc4cb8b8e1ac91115a489bb8267))

## [4.8.7](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.6...v4.8.7) (2025-10-26)


### Bug Fixes

* **docker:** bumping to trigger the docker workflow ([bedf3f3](https://github.com/jbelew/nms_optimizer-web/commit/bedf3f330d2b096bc9dc8b2c47929e422976300e))

## [4.8.6](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.5...v4.8.6) (2025-10-26)


### Performance Improvements

* **tooltip:** conditionally mount the radix ui component on hover ([1661800](https://github.com/jbelew/nms_optimizer-web/commit/16618000b804631751e83ead1719cceb309b8899))

## [4.8.5](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.4...v4.8.5) (2025-10-26)


### Bug Fixes

* **server:** fix for googlebot seeing a 404 on the main entry point ([03d0146](https://github.com/jbelew/nms_optimizer-web/commit/03d0146c6fe42afaafe352231477c15bf20dba67))

## [4.8.4](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.3...v4.8.4) (2025-10-26)


### Bug Fixes

* **server:** fix for over aggressive SPA redirects ([810aa8c](https://github.com/jbelew/nms_optimizer-web/commit/810aa8c74693bb1962a6172eb651787afe41c8d2))

## [4.8.3](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.2...v4.8.3) (2025-10-25)


### Bug Fixes

* **gridcell:** prevent cell state changes on a populated cell on touch devices ([2ad0fd8](https://github.com/jbelew/nms_optimizer-web/commit/2ad0fd8c83281b823664369a669d91fc20b98d85))

## [4.8.2](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.1...v4.8.2) (2025-10-25)


### Bug Fixes

* **server:** fix for failing routes to the sitemap.xml file ([abc8774](https://github.com/jbelew/nms_optimizer-web/commit/abc8774a571bcc1001714c1e7932c24bfd906452))

## [4.8.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.8.0...v4.8.1) (2025-10-25)


### Bug Fixes

* **server:** fixed o-op for static assets in the middleware ([2b4182b](https://github.com/jbelew/nms_optimizer-web/commit/2b4182b6cbc977115e3a0ac40866fb078c6b4581))

# [4.8.0](https://github.com/jbelew/nms_optimizer-web/compare/v4.7.1...v4.8.0) (2025-10-25)


### Features

* **pwa:** enabled vite-plugin-pwa to improve mobile performance ([cc3d700](https://github.com/jbelew/nms_optimizer-web/commit/cc3d700c4d0ee31e3d21f544d6b9eca393a0b423))

## [4.7.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.7.0...v4.7.1) (2025-10-25)


### Bug Fixes

* **server:** fix for stale markdown files (no rule was set previously) ([9472588](https://github.com/jbelew/nms_optimizer-web/commit/9472588dd7683f200c6d91b4e9947d15319aad62))

# [4.7.0](https://github.com/jbelew/nms_optimizer-web/compare/v4.6.1...v4.7.0) (2025-10-25)


### Features

* **corvettes:** corvette weapon systems changes for the Breach update ([5afae0a](https://github.com/jbelew/nms_optimizer-web/commit/5afae0a946f1e2a3818416b1564365c84e8e246c))

## [4.6.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.6.0...v4.6.1) (2025-10-25)


### Performance Improvements

* **shipselection:** one more react-scan fix for tonight ([827f022](https://github.com/jbelew/nms_optimizer-web/commit/827f022d430ab3c3d32e65ebac0e830f1f9bb0e8))

# [4.6.0](https://github.com/jbelew/nms_optimizer-web/compare/v4.5.4...v4.6.0) (2025-10-24)


### Bug Fixes

* **tests:** resolve unit test failures after refactoring ([543f683](https://github.com/jbelew/nms_optimizer-web/commit/543f683e5a3d2100903dbbd3195863cb9c2b2467))
* **tests:** resolve unit test failures and localStorage errors ([659bc74](https://github.com/jbelew/nms_optimizer-web/commit/659bc74552dcf1fcd9d8f667584e59c53b3785f7))


### Features

* **perf:** Memoize GridRow and co-locate state to prevent re-renders ([b666dd9](https://github.com/jbelew/nms_optimizer-web/commit/b666dd904e5d8abccb6d62695319edaa110b63fa))
* **perf:** Optimize grid performance with cell-based updates and selective state subscription ([cda1d08](https://github.com/jbelew/nms_optimizer-web/commit/cda1d086acfe792730f432ac09ece4443f0fe57a))


### Performance Improvements

* **react-scan:** final pass on react-scan based improvements ([b5d1db0](https://github.com/jbelew/nms_optimizer-web/commit/b5d1db0bb828328acb4ea7479fa789dafb5b66e4))
* **useoptimize:** cleaning up state subscriptions ([c797d15](https://github.com/jbelew/nms_optimizer-web/commit/c797d150525a8ff72f5e11c26e09e09e22ae0384))

## [4.5.4](https://github.com/jbelew/nms_optimizer-web/compare/v4.5.3...v4.5.4) (2025-10-23)


### Bug Fixes

* **app:** integrate i18n language to app header and footer ([eff8d76](https://github.com/jbelew/nms_optimizer-web/commit/eff8d769a8e60ac977bfb6cffc55254642fd01b0))
* **linting:** fixed numerous linting errors caused by new, stricter rules ([02d159c](https://github.com/jbelew/nms_optimizer-web/commit/02d159c7b0baa4127ef67463f1c79c9c6532f34a))

## [4.5.3](https://github.com/jbelew/nms_optimizer-web/compare/v4.5.2...v4.5.3) (2025-10-20)


### Bug Fixes

* **build:** align python version for dependency copy in Dockerfile ([1a7fe19](https://github.com/jbelew/nms_optimizer-web/commit/1a7fe19a75afe28cb821746e05bfad5e94a57928))

## [4.5.2](https://github.com/jbelew/nms_optimizer-web/compare/v4.5.1...v4.5.2) (2025-10-20)


### Bug Fixes

* **ci:** update node version in docker and refactor main workflow ([ce97172](https://github.com/jbelew/nms_optimizer-web/commit/ce971720cb1dea2ef20ac3ed0b78f2714cc39357))

## [4.5.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.5.0...v4.5.1) (2025-10-20)


### Bug Fixes

* **ci:** correct dependabot commit message format ([7a82f39](https://github.com/jbelew/nms_optimizer-web/commit/7a82f399c11eafecacdcbe3c9a2b639cc09a4284))

# [4.5.0](https://github.com/jbelew/nms_optimizer-web/compare/v4.4.1...v4.5.0) (2025-10-20)


### Features

* **ci:** configure dependabot and automerge workflow ([87f82e8](https://github.com/jbelew/nms_optimizer-web/commit/87f82e8be2da4044f46145053573d25c4af58191))

## [4.4.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.4.0...v4.4.1) (2025-10-20)


### Bug Fixes

* **ci:** correct invalid dependabot configuration ([95fd21d](https://github.com/jbelew/nms_optimizer-web/commit/95fd21d6e76bcd1cf849ff339af3642dbb42aded))

# [4.4.0](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.19...v4.4.0) (2025-10-20)


### Features

* **ci:** add dependabot configuration and trigger tests on pull requests ([8a42bcd](https://github.com/jbelew/nms_optimizer-web/commit/8a42bcd140d4521c2f8d42bb5725c1cdb5bf9dac))

## [4.3.19](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.18...v4.3.19) (2025-10-20)


### Bug Fixes

* **fonts:** updated the fonts.css file to match project settings ([03aa2b9](https://github.com/jbelew/nms_optimizer-web/commit/03aa2b9f5bbca28b86c7370465a5d11e85380fde))

## [4.3.18](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.17...v4.3.18) (2025-10-20)


### Bug Fixes

* **changelog:** fixed broken model link ([7db85b5](https://github.com/jbelew/nms_optimizer-web/commit/7db85b50632fea558faee27c810af6ae9a1518d2))
* **changelog:** updated changelog content ([f60feab](https://github.com/jbelew/nms_optimizer-web/commit/f60feabb529f96085089fa80324de3ab29f71244))

## [4.3.17](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.16...v4.3.17) (2025-10-20)


### Bug Fixes

* **ci:** fix for failing docker builds ([826e435](https://github.com/jbelew/nms_optimizer-web/commit/826e43551a5fd5922072d3274b49c439d1a296d8))

## [4.3.16](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.15...v4.3.16) (2025-10-20)


### Bug Fixes

* **ci:** Inject version info at build time and add pre-commit checks ([f488400](https://github.com/jbelew/nms_optimizer-web/commit/f488400017fef0bb11ee5a6ce948886bc1ba531a))

## [4.3.15](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.14...v4.3.15) (2025-10-20)


### Bug Fixes

* **ci:** Inject version info at build time and streamline deploy ([04c4acf](https://github.com/jbelew/nms_optimizer-web/commit/04c4acff85d333afcbb13a23bb7dbda350a3e7f7))

## [4.3.14](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.13...v4.3.14) (2025-10-20)


### Bug Fixes

* **ci:** fix for docker images not triggering ([845ce35](https://github.com/jbelew/nms_optimizer-web/commit/845ce3552b988b61c50e45d4c4af355b2dc1b76c))

## [4.3.13](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.12...v4.3.13) (2025-10-20)


### Bug Fixes

* **ci:** one more try at proper semver ([f8e8928](https://github.com/jbelew/nms_optimizer-web/commit/f8e89285ae57978d50bf2d11c8bdc0510c159d52))

## [4.3.12](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.11...v4.3.12) (2025-10-19)


### Bug Fixes

* **ci:** more semver fixes along with slug size reduction ([1029dfd](https://github.com/jbelew/nms_optimizer-web/commit/1029dfdc8ed74dbefdd88d3b0be3e0a762c767ea))

## [4.3.11](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.10...v4.3.11) (2025-10-19)


### Bug Fixes

* **ci:** one more fscking try! ([e0e7f00](https://github.com/jbelew/nms_optimizer-web/commit/e0e7f008fc9863579a43fe7838bd4ac7b24895cb))

## [4.3.10](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.9...v4.3.10) (2025-10-19)


### Bug Fixes

* **ci:** one more try, going back to using the bumped package.json ([5bd1c4e](https://github.com/jbelew/nms_optimizer-web/commit/5bd1c4ec1f9f383b6c3660d57eb213406d46a156))

## [4.3.9](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.8...v4.3.9) (2025-10-19)


### Bug Fixes

* **ci:** simplifying the approach to passing semver to use a text file ([d65dc10](https://github.com/jbelew/nms_optimizer-web/commit/d65dc103bfb0df04c6c082ce5f16455f9dfe6007))

## [4.3.8](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.7...v4.3.8) (2025-10-19)


### Bug Fixes

* **ci:** still trying to pass semver between build steps ([61f96ad](https://github.com/jbelew/nms_optimizer-web/commit/61f96ad635546a7be94e375751080add94382d75))

## [4.3.7](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.6...v4.3.7) (2025-10-19)


### Bug Fixes

* **ci:** trying to extract app version to pass to the build ([5fb280d](https://github.com/jbelew/nms_optimizer-web/commit/5fb280d5bae7e19d9e84ac3c423ec0421961f342))

## [4.3.6](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.5...v4.3.6) (2025-10-19)


### Bug Fixes

* **ci:** another fix for passing app version between workflow steps ([94a19bf](https://github.com/jbelew/nms_optimizer-web/commit/94a19bfc1bebe4929ec9143f3be7d2c224fa4dcd))

## [4.3.5](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.4...v4.3.5) (2025-10-19)


### Bug Fixes

* **ci:** fixed semver not being passed to the build properly ([84e0fc2](https://github.com/jbelew/nms_optimizer-web/commit/84e0fc2c1a964eca331e58b7b4867eb29d69f67b))

## [4.3.4](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.3...v4.3.4) (2025-10-19)


### Bug Fixes

* **ci:** updated github actions to support semver properly ([1baba96](https://github.com/jbelew/nms_optimizer-web/commit/1baba968b516e6ba4998bc79191ac12618036536))

## [4.3.3](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.2...v4.3.3) (2025-10-19)


### Bug Fixes

* **ci:** fix for semver not updating the package.json ([bb0fd2e](https://github.com/jbelew/nms_optimizer-web/commit/bb0fd2ead6db6e498436deb71b24f9105ece19ad))

## [4.3.2](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.1...v4.3.2) (2025-10-19)


### Bug Fixes

* **ci:** added semver support to the ci pipeline ([6fee315](https://github.com/jbelew/nms_optimizer-web/commit/6fee31569807ed5820ae0b4677ab8a873ad2c2cf))

## [4.3.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.3.0...v4.3.1) (2025-10-19)


### Features

* **a11y:** fixes to ensure 100 LH score in focus mode ([8885c0f](https://github.com/jbelew/nms_optimizer-web/commit/8885c0f8cbe1bd1f26719a01dee178bed2fb8dff))



# [4.3.0](https://github.com/jbelew/nms_optimizer-web/compare/v4.2.1...v4.3.0) (2025-10-17)


### Features

* **focus mode:** added a new focus mode for those with visual or reading challenges ([50b6151](https://github.com/jbelew/nms_optimizer-web/commit/50b61515ff5410c794139eb9730b04d573d1f4e9))


### Performance Improvements

* **fonts:** did some "glyph" removal on the main Raleway font asset ([cb6e02e](https://github.com/jbelew/nms_optimizer-web/commit/cb6e02ee931eeacc1f9d5492075cd1d6bc5b0806))



## [4.2.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.2.0...v4.2.1) (2025-10-16)



# [4.2.0](https://github.com/jbelew/nms_optimizer-web/compare/v4.1.2...v4.2.0) (2025-10-15)


### Bug Fixes

* **docker:** fixes for docker build issues ([66d631b](https://github.com/jbelew/nms_optimizer-web/commit/66d631b7773764a1a3ab5e2ea88acbb242f8f47f)), closes [#90](https://github.com/jbelew/nms_optimizer-web/issues/90)


### Performance Improvements

* **server:** changes to cache-control headers ([02f0cae](https://github.com/jbelew/nms_optimizer-web/commit/02f0cae207b56c21b5da27c8ff55ef41ce4eff1d))



## [4.1.2](https://github.com/jbelew/nms_optimizer-web/compare/v4.1.1...v4.1.2) (2025-10-12)


### Bug Fixes

* **csp:** more CSP config changes ([0f62d60](https://github.com/jbelew/nms_optimizer-web/commit/0f62d60fb2c7677bf087166e960017816a7c3d17))
* **inp:** some additional fixes to improve INP metrics ([cfc6a3f](https://github.com/jbelew/nms_optimizer-web/commit/cfc6a3fa4a98f8e82bc268a926b112fa9b64360d))
* **inp:** some additional inp fixes for the techtreerow buttons ([fe977c8](https://github.com/jbelew/nms_optimizer-web/commit/fe977c8a552ed7871671a505ea4f67455947f5b5))
* **postcss:** ported custom CSS over to SCSS ([fefd99f](https://github.com/jbelew/nms_optimizer-web/commit/fefd99f02d59e58e41d3e07cbff3603050028041))
* **techtree:** remove old "accordian" functionality from the code base ([f6d53c3](https://github.com/jbelew/nms_optimizer-web/commit/f6d53c35b41f82562763eb4289727bdd0c084367))


### Features

* **csp:** attempting to implement CSP ([3f61be0](https://github.com/jbelew/nms_optimizer-web/commit/3f61be0d2b03bc718558b50990891cbbc82e07b2))



## [4.1.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.1.0...v4.1.1) (2025-10-11)


### Bug Fixes

* **badgestatusicon:** fixed text size for mobile ([9003594](https://github.com/jbelew/nms_optimizer-web/commit/900359476795dbd807646a65d3d49f835babc214))
* **footer:** some minor a11y fixes ([ee9825d](https://github.com/jbelew/nms_optimizer-web/commit/ee9825d894f94f7daf0d6be203db9e129d8c7e8e))
* **moduleselectiondialog:** some minor sizing fixes ([d1524aa](https://github.com/jbelew/nms_optimizer-web/commit/d1524aa80ba3917b62de3b6a9bebf1134f86616f))
* **performance:** some small fixes for INP issues ([e582c30](https://github.com/jbelew/nms_optimizer-web/commit/e582c30f07575b1db8ff1939bae698fdbc4956da))
* **server:** another fix for canonical url generation ([4f9fae2](https://github.com/jbelew/nms_optimizer-web/commit/4f9fae2b8f984476067412d2353e70f809bf47ba))
* **server:** fix for canonical url generation ([e67c0cf](https://github.com/jbelew/nms_optimizer-web/commit/e67c0cfcbdbacc7574306549453ffe7acb3be7ea))



# [4.1.0](https://github.com/jbelew/nms_optimizer-web/compare/v4.0.2...v4.1.0) (2025-09-28)


### Bug Fixes

* **gridcell:** fix for when a cell has the white techcolor but no adjacency ([1005244](https://github.com/jbelew/nms_optimizer-web/commit/100524466a23804c2dc85554f86b0f2a4a022814))
* **modulegroup:** fix linting and typescript issues ([2e60cbb](https://github.com/jbelew/nms_optimizer-web/commit/2e60cbb81749dde6232d16b38874dce35f250e1c))


### Features

* **module dialog:** some minor UI improvements ([234b70c](https://github.com/jbelew/nms_optimizer-web/commit/234b70c2898a9e620340ce0c3dc34d94f4f1468a))
* **moduleselectiondialog:** unified dialog close functional to restore previous state ([7b09dfc](https://github.com/jbelew/nms_optimizer-web/commit/7b09dfce3b7dd965b0877f24739d6f3d2dc1423c))



## [4.0.2](https://github.com/jbelew/nms_optimizer-web/compare/v4.0.1...v4.0.2) (2025-09-27)


### Bug Fixes

* **messagespinner:** fix for the status message wrapping ([8b58188](https://github.com/jbelew/nms_optimizer-web/commit/8b5818897fc11fd4fd73dd7ca121866c56af24c4))
* **moduleselection:** fixed html rendering issue ([1f66137](https://github.com/jbelew/nms_optimizer-web/commit/1f66137ed6109f0c651cdb4706bdfad4bdde4cfe))


### Features

* **messagespinner:** better status message during the solve process ([df1b98d](https://github.com/jbelew/nms_optimizer-web/commit/df1b98d584e31f21972963fd7585ac8f2729b12e))
* **messaging:** additional messaging and UI refinements ([f749710](https://github.com/jbelew/nms_optimizer-web/commit/f749710aefb8e78b172c910a42ac7a39c5b0c86f))
* **messaging:** improved messaging around module selection ([1f10283](https://github.com/jbelew/nms_optimizer-web/commit/1f102836313b3506cfc5e452533ac5ab8473a968))
* **toast:** added a toast component and a warning about Corvette layout bugs ([c815f3e](https://github.com/jbelew/nms_optimizer-web/commit/c815f3e548fe751d81c38c3a72febc70c2be4289))



## [4.0.1](https://github.com/jbelew/nms_optimizer-web/compare/v4.0.0...v4.0.1) (2025-09-26)


### Bug Fixes

* **module selection:** some minor UI fixes for mobile ([f2d4af8](https://github.com/jbelew/nms_optimizer-web/commit/f2d4af848482a8fc1143bb17f129fe1143fa3d1f))


### Features

* **mardown:** added strikethrough support to the markdown renderer ([57b2b93](https://github.com/jbelew/nms_optimizer-web/commit/57b2b934bf3f7e7c35d8857ecd9ea12be7c2b0d2))



# [4.0.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.15.0...v4.0.0) (2025-09-25)


### Features

* **techtree:** added upgrade selection order to the modules selection ui ([1630f77](https://github.com/jbelew/nms_optimizer-web/commit/1630f777ac74744a0344c5d63f9f711c583a0119))



# [3.15.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.14.1...v3.15.0) (2025-09-23)


### Bug Fixes

* **markdown:** some small formatting changes ([4e760b0](https://github.com/jbelew/nms_optimizer-web/commit/4e760b0460a4e2db70cce77e088aa84576fa0082))



## [3.14.1](https://github.com/jbelew/nms_optimizer-web/compare/v3.14.0...v3.14.1) (2025-09-22)


### Bug Fixes

* **recommended builds:** fixed href / content targeting in the recommended build component ([582fa64](https://github.com/jbelew/nms_optimizer-web/commit/582fa64510de85f26adcf9a34223ae16a95422d9))



# [3.14.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.13.0...v3.14.0) (2025-09-22)


### Bug Fixes

* **about:** fixed corrupted markdown formatting in the localized dialog files ([e27b3f4](https://github.com/jbelew/nms_optimizer-web/commit/e27b3f435b1640366025514276b7591f470d701a))
* **about:** fixed the screenshot link in the localized about.md content ([f9446be](https://github.com/jbelew/nms_optimizer-web/commit/f9446be03263b95850ad82a4410e5caab9ce7302))
* **build:** regenerate sitemap during build process ([0891d3c](https://github.com/jbelew/nms_optimizer-web/commit/0891d3c7ae570b177dc46abca98b0f492906da6a))
* **react-compiler:** disabled the react-compiler because it was interfering with i18next ([85e6b32](https://github.com/jbelew/nms_optimizer-web/commit/85e6b322b893d1a042ef6cadc172849752f7a5b6))
* **seo:** align sitemap with build process and canonical URLs ([b752766](https://github.com/jbelew/nms_optimizer-web/commit/b752766d9e3c2988f4ea9569c5cb4c678f3d8d90))


### Features

* **i18n:** implement path-based internationalization ([0988543](https://github.com/jbelew/nms_optimizer-web/commit/09885435b6224c124e46ef3f196b13f1de58811d))
* **i18n:** implement path-based internationalization ([4cba847](https://github.com/jbelew/nms_optimizer-web/commit/4cba8479bb8bc72b45d36ea478e370166bd050a5))



# [3.13.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.12.0...v3.13.0) (2025-09-16)


### Bug Fixes

* **badges:** fixed module counts ([81f475a](https://github.com/jbelew/nms_optimizer-web/commit/81f475a34b8fecfb47c27f74e6766d2934bfcf56))
* Correct Crowdin workflow file ([f160bf2](https://github.com/jbelew/nms_optimizer-web/commit/f160bf2594397e06f6bdfae1dc2fd6c40de8a578))
* Correct Crowdin workflow to pass GITHUB_TOKEN ([c45e983](https://github.com/jbelew/nms_optimizer-web/commit/c45e9838b3f8ccd91dd58aa489aa721dfdcf2aa4))
* **seo:** possible fix for pages not being indexed properly ([0c86df4](https://github.com/jbelew/nms_optimizer-web/commit/0c86df475f395e3e08ba93062e828e1ff7655dac))


### Features

* Add and update JSDocs ([d56e312](https://github.com/jbelew/nms_optimizer-web/commit/d56e312c85b4a7abd60c8a8ae3bf2ff1e4ce1e8e))
* Add Crowdin integration for translations ([032c4a2](https://github.com/jbelew/nms_optimizer-web/commit/032c4a26e0929e096bf716e1218b68c89b822eab))
* Add Crowdin integration for translations ([bd3f05b](https://github.com/jbelew/nms_optimizer-web/commit/bd3f05bd33f953f6853a6410fe3f31bdb78a26fc))
* Optimize GridCell rendering to improve INP ([a93c898](https://github.com/jbelew/nms_optimizer-web/commit/a93c89863c2ce8646893124b9c372474f370cc8a))
* Synchronize and translate all localized .md files ([1a5bf31](https://github.com/jbelew/nms_optimizer-web/commit/1a5bf319cd875e8e08984124df94fb34c7818d5d))
* **translations:** trying crowdin support ([44a7360](https://github.com/jbelew/nms_optimizer-web/commit/44a73607b447b89509907dbb9e3069cc23ccff5e))
* **userstats:** added color defs for photonix and other ([6e11291](https://github.com/jbelew/nms_optimizer-web/commit/6e11291dbf2125c8547c68e8d030ee9a1cb6849d))



# [3.12.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.11.0...v3.12.0) (2025-09-10)


### Features

* **gridcell:** added some color to cosmetic parts gridcell priority labels ([210bb8d](https://github.com/jbelew/nms_optimizer-web/commit/210bb8d27d9f6f01022435069673ea3d6c751ea9))



# [3.11.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.10.0...v3.11.0) (2025-09-07)


### Bug Fixes

* **messagespinner:** a small spacing fix ([4e56251](https://github.com/jbelew/nms_optimizer-web/commit/4e56251aa0f5fbfcfcea4dbd03d8ae9fcb0976f4))
* **messagespinner:** fixed a react rendering issue surrounding loading the tech tree ([56f7fc2](https://github.com/jbelew/nms_optimizer-web/commit/56f7fc29c4bd19c3a726982ada5b0c094c6ca242))
* **recommendedbuilds:** fix for incorrectltly filtering out recommendedbuilds data ([d6970f8](https://github.com/jbelew/nms_optimizer-web/commit/d6970f86e8281668e01ccc14357da6f8c45bf9d8))


### Features

* **corvettes:** added support for both cosmetic and min/max solves for corvettes ([024d32c](https://github.com/jbelew/nms_optimizer-web/commit/024d32cfca863da1410fdf10ac8596aa95ded0a5))
* **userstats:** added corvette data to the dialog ([0595431](https://github.com/jbelew/nms_optimizer-web/commit/0595431ff792d9f1ea818b4a4f20fe065c79bde7))



# [3.10.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.9.1...v3.10.0) (2025-09-03)


### Bug Fixes

* **server:** a fix for vite hash regex ([23c8b59](https://github.com/jbelew/nms_optimizer-web/commit/23c8b59fb6b022d8b814fbce2b530ae1ca3d8052))
* **server:** addressing false 404's on / routes ([41812bb](https://github.com/jbelew/nms_optimizer-web/commit/41812bbb99e06d794e1cbb101c5f88e40dba3ed0))
* **server:** fix for "greedy" cache control settings overriding my config ([3234105](https://github.com/jbelew/nms_optimizer-web/commit/3234105bbdf47402e27a676c715efb6bc1907e28))
* **server:** fix for stale index.html page ([e475b70](https://github.com/jbelew/nms_optimizer-web/commit/e475b702e3398e9251e17b20ac91dd89edc43604))
* **server:** one last canonical url fix ([857fc86](https://github.com/jbelew/nms_optimizer-web/commit/857fc86d52515fff15947ac970f89a373b9c2a3e))
* **server:** one more tweak to the hashed file regex ([f4d9c6a](https://github.com/jbelew/nms_optimizer-web/commit/f4d9c6ae6545c391c830613195cb3ccac61d0ca3))
* **server:** setting explicit routes to prevent soft 404's ([bfb34bd](https://github.com/jbelew/nms_optimizer-web/commit/bfb34bdfd1efd26f9c65441cafa6f2b1dc456e75))
* **server:** still struggling with the express code ([f650583](https://github.com/jbelew/nms_optimizer-web/commit/f650583f1e39666005956db328ae4f7e8608e2a7))


### Features

* **corvettes:** added initial support for corvettes ([b4d3613](https://github.com/jbelew/nms_optimizer-web/commit/b4d3613afeae28ba138e2f837376f50af6359eef))


### Performance Improvements

* **server:** caching changes ([bac2ae9](https://github.com/jbelew/nms_optimizer-web/commit/bac2ae97b9df9f6110d77ef5cc8ae73b0384c75a))



## [3.9.1](https://github.com/jbelew/nms_optimizer-web/compare/v3.9.0...v3.9.1) (2025-08-26)


### Bug Fixes

* **analytics:** re-added missing optimize_tech event ([8245e5a](https://github.com/jbelew/nms_optimizer-web/commit/8245e5ae22ebf83cc8b7ca20efaec0aedd2844a8))
* **cursors:** updated the cursor behavior for bonus status icons ([388817e](https://github.com/jbelew/nms_optimizer-web/commit/388817e2c7ef64ad4e2762a643ab2993b46ea88c))
* **icons:** moving Apple standard icons to the root level ([3dd4607](https://github.com/jbelew/nms_optimizer-web/commit/3dd460733bb9986dfab4fe7ae509a9a23950c1a6))
* **manifest:** fixed incorrect image paths in the manifest ([ad0bfb9](https://github.com/jbelew/nms_optimizer-web/commit/ad0bfb94bc496700d346f9c5f6191f8a14ee181a))


### Features

* **useoptimize:** users can now visualize solves on the grid on larger screens ([7f99404](https://github.com/jbelew/nms_optimizer-web/commit/7f994043ba0f61879a0afc54b0d421db86807548))



# [3.9.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.8.0...v3.9.0) (2025-08-24)


### Bug Fixes

* **websokets:** trying to get websockets working on heroku ([c413fcf](https://github.com/jbelew/nms_optimizer-web/commit/c413fcf7e59f93a019ea11cea6b8baeb5b80142c))


### Features

* Add tests for WebSocket implementation of useOptimize hook ([4fd1f17](https://github.com/jbelew/nms_optimizer-web/commit/4fd1f1715364a0c68f299089bf5aaa929721ca8e))



# [3.8.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.7.6...v3.8.0) (2025-08-21)


### Bug Fixes

* **404:** fixed the missing, custom 404 page ([e8cfb87](https://github.com/jbelew/nms_optimizer-web/commit/e8cfb87d892938b434ccd5ea303dcf981e85a18a))
* **404:** updated error message color ([e21a7ab](https://github.com/jbelew/nms_optimizer-web/commit/e21a7abdc5e4b747b9c94776d847cb71dddeaa43))
* **applayout:** one last fix ([41f44c5](https://github.com/jbelew/nms_optimizer-web/commit/41f44c58521a714e403eead4c97c677804db4602))
* **applayout:** removed computed / dyanmic width sizing ([3c7fb40](https://github.com/jbelew/nms_optimizer-web/commit/3c7fb40ca6e991b1e96320a247919d69825073e2))
* **callout:** another attempt to fix the callout sizing bug ([741cfa7](https://github.com/jbelew/nms_optimizer-web/commit/741cfa73373c93ba2e01f2bb7b3093000a246b86))
* **callout:** touch instruction text callout wasn't sizing properly in landscape ([d545166](https://github.com/jbelew/nms_optimizer-web/commit/d54516664f31fada297e72158062650e49837ce4))
* **dialogs:** fixed content targeting in the dialogs ([f16373d](https://github.com/jbelew/nms_optimizer-web/commit/f16373d12419dcbaebcf9f1a293dfe857ddd48f8))
* **gidcell:** forgot to disable debug flag on last push ([dbaf1f5](https://github.com/jbelew/nms_optimizer-web/commit/dbaf1f5fc39394c36ec2009c4289fac6f6a28eae))
* **gridcell:** improved grid cell double tap to only act on the same cell as the first tap ([7aeb73e](https://github.com/jbelew/nms_optimizer-web/commit/7aeb73e6cf93a334bdcf1f7212742f4ddf4b49c1))
* **images:** fixed the proportions of the sidebar images ([322f8ee](https://github.com/jbelew/nms_optimizer-web/commit/322f8eec978ab8e7e08f8e6a7ffdc5c0a74aa129))
* **layout:** fixed a nagging, responsive layout issue. only a few pixels, but I noticed ([07f8749](https://github.com/jbelew/nms_optimizer-web/commit/07f8749105fd3b8205e5d44407c60210a63319e4))
* **messagespinner:** the component wasn't deactivating on shared grid urls ([f6792a7](https://github.com/jbelew/nms_optimizer-web/commit/f6792a75e089fc1efaa3d8f30c1a5e43f7895bbc))
* **mobile:** a better experience for slower, mobile users ([3aebfbb](https://github.com/jbelew/nms_optimizer-web/commit/3aebfbb924c9c4b03f59b6f31000c29d981d8dae))
* **preload:** better background preload strategy ([2bbcddf](https://github.com/jbelew/nms_optimizer-web/commit/2bbcddf2d10f7abdaceba9175ce74d1b1f395e65))
* **server:** fixed cache control headers ([73fc6f6](https://github.com/jbelew/nms_optimizer-web/commit/73fc6f6bf609351643741ea4688db999c0099418))
* **sidebar:** last commit on this project, evah! ([1ceb727](https://github.com/jbelew/nms_optimizer-web/commit/1ceb72718915dae83c39275f8d2c56006953777c))
* **skeleton:** fixed CLS on skeleton component on mobile screen sizes ([72b72a5](https://github.com/jbelew/nms_optimizer-web/commit/72b72a5822b55c9a13669a3d7b23ed2543200d6e))
* **techtree:** added missing srcset declaration to techtree category images ([433e283](https://github.com/jbelew/nms_optimizer-web/commit/433e28362476fb45c885c7ff6a79ff5721b1fdf9))


### Performance Improvements

* **critical:** disabled critical css for testing ([044a04d](https://github.com/jbelew/nms_optimizer-web/commit/044a04d71bf01f436f4a8ada6d82917f32042734))
* **critical:** turned it on again ([130dd44](https://github.com/jbelew/nms_optimizer-web/commit/130dd444dc14e2d21c1b6d405021703f8896c32e))
* **dialogs:** a better skeleton experience ([84b21d8](https://github.com/jbelew/nms_optimizer-web/commit/84b21d80ee34cb69f18193ae2f8d6f25bb0f027b))
* **hooks:** updated hook click handlers ([1a6273b](https://github.com/jbelew/nms_optimizer-web/commit/1a6273b71d88b86693569c31c1299ee7a2007a98))
* **lazyloading:** fixed some lazy loading misses ([601d563](https://github.com/jbelew/nms_optimizer-web/commit/601d563fc3dd21040089b9569239f92b24368ffb))
* **lazyload:** more performance enchancements ([546de07](https://github.com/jbelew/nms_optimizer-web/commit/546de07ed54f81c788c16358d092f35cdc6f9c39))
* **markdown:** re-anbled lazy loading the component and added skeleton for content load ([f64fee4](https://github.com/jbelew/nms_optimizer-web/commit/f64fee470be09900f5bed8985c42753a181ea450))
* **markdown:** reverting lazy loading the markdown component for now ([62f7bab](https://github.com/jbelew/nms_optimizer-web/commit/62f7bab14ad585af30d8221c2b6435ee77070131))
* **server:** updated cache settings ([8bb5e5e](https://github.com/jbelew/nms_optimizer-web/commit/8bb5e5ef2f8e535113ac157dd0e328169ee26a7a))
* **splashscreen:** moved hidesplashscreen to after when the techtree first loads ([214aa4e](https://github.com/jbelew/nms_optimizer-web/commit/214aa4ef4c3c19d005a1891b324e8fded4111cfb))



## [3.7.6](https://github.com/jbelew/nms_optimizer-web/compare/v3.7.5...v3.7.6) (2025-08-16)


### Bug Fixes

* **background:** forgot to uncomment the initial background color setting ([dda6584](https://github.com/jbelew/nms_optimizer-web/commit/dda658401deeabb3b8919dd299e10be62b00185e))
* **minotaur:** added proper minotaur laser images ([20e0704](https://github.com/jbelew/nms_optimizer-web/commit/20e0704a27a5ff8c132624ff369a25ce345a45b2))
* **popover:** possible fix for weird sizing on iOS ([c7a60e3](https://github.com/jbelew/nms_optimizer-web/commit/c7a60e36f863fdb0fe4a719c5ff6d96235ddc28f))
* **ui:** fixed a spacing regression ([0b21400](https://github.com/jbelew/nms_optimizer-web/commit/0b214005e45a924835404846d85c3ae46a6745ad))
* **ui:** one more color change ([ce48aab](https://github.com/jbelew/nms_optimizer-web/commit/ce48aab50bf1940edaf571b024f9eed6dd241bfe))


### Features

* Add g4 event to popover trigger ([ae3e2f9](https://github.com/jbelew/nms_optimizer-web/commit/ae3e2f9ab6d62c6eb0e1442b3031cccffa8504e2))
* **tecttree:** updated interaction patterns for a better mobile experience ([e8fcaa1](https://github.com/jbelew/nms_optimizer-web/commit/e8fcaa178f43811796d7c2ac9da53793829115ce))
* **tooltips:** depricated tooltip for popovers on mobile ([28b15f1](https://github.com/jbelew/nms_optimizer-web/commit/28b15f18cd78f639f11ccf0fdd4f01eda5f1f087))



## [3.7.5](https://github.com/jbelew/nms_optimizer-web/compare/v3.7.4...v3.7.5) (2025-08-15)


### Features

* **error messages:** fixed error boundaries in the tech tree ([b4cab56](https://github.com/jbelew/nms_optimizer-web/commit/b4cab5648e7e3ec55268ef880063057b17e0cc4b))


### Performance Improvements

* **optimize:** a quick fix to address INP issues with the useOptimize buttons ([ca16c93](https://github.com/jbelew/nms_optimizer-web/commit/ca16c937d4b806e425369738f73e3e0687b9d4c2))



## [3.7.4](https://github.com/jbelew/nms_optimizer-web/compare/v3.7.3...v3.7.4) (2025-08-14)


### Bug Fixes

* **recommendedbuilds:** fixes [#48](https://github.com/jbelew/nms_optimizer-web/issues/48). Recommended builds were failing due to a label mismatch ([6886b48](https://github.com/jbelew/nms_optimizer-web/commit/6886b484063a5cbb294380353d704bc5be2ded09))



## [3.7.3](https://github.com/jbelew/nms_optimizer-web/compare/v3.7.2...v3.7.3) (2025-08-14)


### Features

* **docs:** add comprehensive JSDoc comments across the codebase ([ddd76cb](https://github.com/jbelew/nms_optimizer-web/commit/ddd76cb25ede4a457b8100249125970a9c5b57f6))



## [3.7.2](https://github.com/jbelew/nms_optimizer-web/compare/v3.7.0...v3.7.2) (2025-08-12)


### Bug Fixes

* **server:** another attempt to fix canonical tags! ([f7eb9bf](https://github.com/jbelew/nms_optimizer-web/commit/f7eb9bf533871c147503fd309d1abd4666715d24))
* **server:** attempting to get dynamic canonical tags working ([dd78000](https://github.com/jbelew/nms_optimizer-web/commit/dd78000dbde8429adef80af18c8234897277c7b7))
* **server:** fix for canonical tag generation ([3916b87](https://github.com/jbelew/nms_optimizer-web/commit/3916b874ec481ceb924ad586d05a8e27575a3897))
* **server:** more canonical issues! ([0773777](https://github.com/jbelew/nms_optimizer-web/commit/0773777ddd188ed6f3100e32e69c0336e5822f68))
* **server:** still working on consistant canonical generation ([f5ee99c](https://github.com/jbelew/nms_optimizer-web/commit/f5ee99c157405f739dc9c769f3dc1dfcdf4e4eaa))
* **userstats:** better spacing of the piecdhart labels ([ff2e394](https://github.com/jbelew/nms_optimizer-web/commit/ff2e394e16972abee981093ec2be2e49d2f3d2cd))


### Features

* Combine misspelled multi-tool stats ([0aa0863](https://github.com/jbelew/nms_optimizer-web/commit/0aa0863648dede84ced4fb60fd691802c412a477))
* Fix canonical tag generation for SEO ([e24613b](https://github.com/jbelew/nms_optimizer-web/commit/e24613bae089daf5a31088fff143a6460d908f9d))
* **seo:** add metadata for user stats page ([15e82a7](https://github.com/jbelew/nms_optimizer-web/commit/15e82a7256d45e90c9cc0a3f4a921345861e9239))
* Standardize dialog component implementation ([8ea0a98](https://github.com/jbelew/nms_optimizer-web/commit/8ea0a983717db83fa9a6e43981bd26aee1d02997))
* Standardize UserStatsDialog component ([2ae6183](https://github.com/jbelew/nms_optimizer-web/commit/2ae6183c2a23012a0146e0e5d3ac4426f2e5d123))
* **userstats:** grouped tech with < 2% into an "other" category ([3f3e8f4](https://github.com/jbelew/nms_optimizer-web/commit/3f3e8f43838aac939ceb6650e3d976188d76d3f3))



# [3.7.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.6.0...v3.7.0) (2025-08-09)


### Bug Fixes

* **analytics:** added specific tracking for Photonix Core in solves ([a1e3e74](https://github.com/jbelew/nms_optimizer-web/commit/a1e3e74fe255631abac077827a854237ddeec71d))
* **depends:** reviewed and updated build dependancies ([2f21fac](https://github.com/jbelew/nms_optimizer-web/commit/2f21facdfd9b3214b7f9440bdc4a86eddecfe96d))
* **tech:** fixed spelling error with pulse-spitter tech. Made userstats a route ([6d314a2](https://github.com/jbelew/nms_optimizer-web/commit/6d314a2ef2bb74c317b7188c2ab85b0388721361))
* **user-stats:** Prevent unnecessary user-stats.md request ([f45211c](https://github.com/jbelew/nms_optimizer-web/commit/f45211cb934abca2011d903e433b761644cbd7ec))


### Features

* **i18n:** add translations for seo content ([8eb35de](https://github.com/jbelew/nms_optimizer-web/commit/8eb35dedcc5a373ee8d4178a009bc92742709718))
* **seo:** dynamically update meta tags for improved SEO ([c070b38](https://github.com/jbelew/nms_optimizer-web/commit/c070b38d0744537888f781e17566c6986efbc684))
* **seo:** improve on-page SEO with new content and keywords ([d2a350f](https://github.com/jbelew/nms_optimizer-web/commit/d2a350ff35ad2bb480d8fd6099277dd4ea0009e3))
* **styling:** some additional UI enhancements ([cf6de1b](https://github.com/jbelew/nms_optimizer-web/commit/cf6de1b3c37e1193d3673ff59d7a5e8ee9be96a3))


### Performance Improvements

* **app:** Comprehensive INP and rendering performance fixes ([806545f](https://github.com/jbelew/nms_optimizer-web/commit/806545fe2b0b538996e63a1369df0c52d6efabc3))
* **app:** Comprehensive INP, rendering, and layout performance fixes ([26d6864](https://github.com/jbelew/nms_optimizer-web/commit/26d68642bf29ffb5ebf99d576bec976e097d80c7))
* **render:** Optimize component rendering to improve INP ([4230a63](https://github.com/jbelew/nms_optimizer-web/commit/4230a6355e3666e9304733407ff18606a1c2e093))
* **techtree:** Use selectors for useTechStore in TechTreeRow ([836576a](https://github.com/jbelew/nms_optimizer-web/commit/836576a18a782771d06ed9e268ebad73563eddcf))



# [3.6.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.5.0...v3.6.0) (2025-08-08)


### Features

* Add comprehensive unit tests for useGridDeserializer hook ([3293db1](https://github.com/jbelew/nms_optimizer-web/commit/3293db1d655ab226a4f95d9964a7e7b734119fb6))
* **analytics:** added tracking of supercharged usage for future reporting idea ([82f0fff](https://github.com/jbelew/nms_optimizer-web/commit/82f0fffdd86476259d2862ebd719a809ee275c2b))
* **analytics:** send supercharged event ([a7b1293](https://github.com/jbelew/nms_optimizer-web/commit/a7b12934be1eea3ed9a80727b7822f99729c3d3d))
* enhance SEO and add project documentation ([8c7c68e](https://github.com/jbelew/nms_optimizer-web/commit/8c7c68e4f9aef0abf09449f2443600d72fc76550))
* **instructions:** added quick mobile instructions under the grid table ([52c0e28](https://github.com/jbelew/nms_optimizer-web/commit/52c0e2807fc1475f4f2599dd6c6c8614dc0808f6))
* **userstats:** added the User Statistics dialog ([e43bfa3](https://github.com/jbelew/nms_optimizer-web/commit/e43bfa35817c26e14e4e01702721dd99bf6ff6f5))



# [3.5.0](https://github.com/jbelew/nms_optimizer-web/compare/v3.4.0...v3.5.0) (2025-08-05)


### Bug Fixes

* **analytics:** added app_version to web vitals metrics ([2e8f164](https://github.com/jbelew/nms_optimizer-web/commit/2e8f16443f763279f048b3a5b9a9a64adbefaec6))
* **analytics:** Enable analytics in development mode ([4eaee67](https://github.com/jbelew/nms_optimizer-web/commit/4eaee67cb11de8fc8f4c8eda5085864c41b011c8))
* **analytics:** Update event tracking to new GA4 signature ([9eef1cf](https://github.com/jbelew/nms_optimizer-web/commit/9eef1cf8b482d8fab2f5807ad04538fe4df8aef8))
* **analytics:** updated web_vitals GA4 tag ([276482d](https://github.com/jbelew/nms_optimizer-web/commit/276482dd30b65191edbd7e984b2697578398ceb7))
* Generate changelog after version bump ([0417b6c](https://github.com/jbelew/nms_optimizer-web/commit/0417b6cb3eb5d89b0fc32a314ff61569ccb355d3))
* **performance:** remove unnecessary setTimeout in useUrlSync ([4274936](https://github.com/jbelew/nms_optimizer-web/commit/42749368e0c6638df1684a0b14895993e6c20058))
* **performance:** removed Critical CSS functionality from the build ([956ea38](https://github.com/jbelew/nms_optimizer-web/commit/956ea38a002b27e84a227872436b599a0fd8ebf9))
* **release:** Improve changelog extraction in GitHub Action ([ac83f88](https://github.com/jbelew/nms_optimizer-web/commit/ac83f889b7debf5f4fd1393c6e9e6a7f3b2151a7))
* **release:** Refine changelog extraction in GitHub Action ([80e7ea7](https://github.com/jbelew/nms_optimizer-web/commit/80e7ea73436e903f3d28ce402813e5801eaba712))


### Features

* **analytics:** Enhance analytics events and error boundary for better debugging ([a16f29b](https://github.com/jbelew/nms_optimizer-web/commit/a16f29b23cfd8065328339ee6805114c2d94de6c))
* Enhance GA, optimize performance, and improve build process ([96c436d](https://github.com/jbelew/nms_optimizer-web/commit/96c436d21f58a5416acae87d5aa8a5a065c73137))
* Leverage app_version in Google Analytics ([01167a5](https://github.com/jbelew/nms_optimizer-web/commit/01167a530ad173b5c283b15ae1a771ebc4084dbd))
* **scoring:** added support for group adjacency across multiple tech types ([bac995b](https://github.com/jbelew/nms_optimizer-web/commit/bac995bec9ef2ed06fc439057354f681051a07e3))



# [3.4.0](https://github.com/jbelew/nms_optimizer-web/compare/60e59b69cfac62c0c4539fcf453b263148213800...v3.4.0) (2025-07-31)


### Bug Fixes

* Adjust sidebar width to improve layout and add high contrast to badges when no tech is in grid ([0f6e7aa](https://github.com/jbelew/nms_optimizer-web/commit/0f6e7aa43751fe8a54a5657c6eed2dfd550ac1ae))
* **analytics:** updated GA analytics implementation ([5ae221f](https://github.com/jbelew/nms_optimizer-web/commit/5ae221f15f2a57d8ef44bbcbfc0f9eecada2448c))
* **gridcell:** addressed failing tests ([3b7ffa7](https://github.com/jbelew/nms_optimizer-web/commit/3b7ffa7fd5fcd73bea2876de298e520a51ae2682))
* **husky:** auto-stage prettier changes and update changelog on version\n\n- Modified `.husky/pre-commit` to automatically stage changes made by `prettier`.\n- Added `preversion` script to `package.json` to update and stage `CHANGELOG.md` before `npm version` creates a new version commit. ([243be1e](https://github.com/jbelew/nms_optimizer-web/commit/243be1e88c0f7c475a591c0c0d74dfd033bc44b3))
* **release:** use full CHANGELOG.md for release body and revert toggleCellActive tests\n\n- Modified `.github/workflows/github-release.yml` to use the entire `CHANGELOG.md` file as the release body.\n- Reverted tests in `src/store/GridStore.test/toggleCellActive.test.ts` to align with the previous `toggleCellActive` functionality.\n- Reverted `toggleCellActive` logic in `src/store/GridStore.ts` to its previous state. ([c017b21](https://github.com/jbelew/nms_optimizer-web/commit/c017b219ca161b14000611d8de07c24dea7a83bd))
* **versioning:** fix to get standard-release working ([5eab0a6](https://github.com/jbelew/nms_optimizer-web/commit/5eab0a6221667ab46b76aefb4fe7fc09c2db6e33))


### Features

* Add comprehensive tests for GridStore ([60e59b6](https://github.com/jbelew/nms_optimizer-web/commit/60e59b69cfac62c0c4539fcf453b263148213800))
* Configure critical CSS extraction with enforce: 'post' ([7f26b5c](https://github.com/jbelew/nms_optimizer-web/commit/7f26b5c288338c358a5e1fff28836ceee2786af5))
* Defer non-critical CSS and inline critical CSS post-build ([4066af4](https://github.com/jbelew/nms_optimizer-web/commit/4066af47f94807d67dc1f00329f3db039e431d23))
* **gridstore:** update toggleCellActive behavior and tests ([8e5c35c](https://github.com/jbelew/nms_optimizer-web/commit/8e5c35c45e31b471d11ae885b77e837cba88ace1))
* **gridstore:** update toggleCellSupercharged tests ([152da72](https://github.com/jbelew/nms_optimizer-web/commit/152da729629c9277170cb0be155f486ff0443b4e))
* **i18n:** Updated translations with new terms and phrases ([ce77d57](https://github.com/jbelew/nms_optimizer-web/commit/ce77d57dc8950827548ec4fcfc82aadb81e0672d))
* Implement further performance optimizations ([2604a0e](https://github.com/jbelew/nms_optimizer-web/commit/2604a0ea231f117ec9207b1a55f70f8aa6de797a))
* Implement various performance optimizations ([4a1cfa1](https://github.com/jbelew/nms_optimizer-web/commit/4a1cfa10e5bd4f606832b52e39c5bdf457cfbe90))
* Inline critical CSS after compression via custom plugin ([a1aca94](https://github.com/jbelew/nms_optimizer-web/commit/a1aca94b343447c82f2945ee2eaaa0d0f870b2a2))
* Optimize grid calculations for INP improvement ([c0310ff](https://github.com/jbelew/nms_optimizer-web/commit/c0310ffa00dfc056696f6ebae934be0a1e7250a7))
* Source app version from package.json for GA and AppHeader ([dc4ae52](https://github.com/jbelew/nms_optimizer-web/commit/dc4ae527d93f87908f49259ac9836b48eec0924c))


### Performance Improvements

* **background:** added preload for the mobile version of the background ([fcf6ddb](https://github.com/jbelew/nms_optimizer-web/commit/fcf6ddb9c0fca6ef205fd5c1ab4450ede71fa95e))
* **gridcell:** improved performance of the "empty" SVG rendering ([55d0c34](https://github.com/jbelew/nms_optimizer-web/commit/55d0c34429398e337654bbaedfcde4e3529bcd2f))
