# [1.0.0-beta.5](https://github.com/Angular-Material-Dev/mat-exp/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2026-07-23)


### Bug Fixes

* add schematics export to package.json ([8c72d0d](https://github.com/Angular-Material-Dev/mat-exp/commit/8c72d0d6aa32579148a25bac788c68ffcac753a7))

# [1.0.0-beta.4](https://github.com/Angular-Material-Dev/mat-exp/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2026-07-23)


### Bug Fixes

* add copyfiles dependency and update build script for schema files ([fcc5c7d](https://github.com/Angular-Material-Dev/mat-exp/commit/fcc5c7d3f9f910e9b4841fc10d4990217754c48f))

# [1.0.0-beta.3](https://github.com/Angular-Material-Dev/mat-exp/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2026-07-22)


### Bug Fixes

* remove styles confirmation question from schematic ([e44cfdc](https://github.com/Angular-Material-Dev/mat-exp/commit/e44cfdc89730e3f8b60edd12c9414791f8f5e222))

# [1.0.0-beta.2](https://github.com/Angular-Material-Dev/mat-exp/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2026-07-22)


### Bug Fixes

* update footer to link to MIT License and improve code readability ([0590a7e](https://github.com/Angular-Material-Dev/mat-exp/commit/0590a7eae00f57b70627d1a670bb6ebd25404bfd))

# 1.0.0-beta.1 (2026-07-22)


* Remove versioned-subdomain deployment infrastructure ([#161](https://github.com/Angular-Material-Dev/mat-exp/issues/161)) ([22a6e00](https://github.com/Angular-Material-Dev/mat-exp/commit/22a6e0085b2f5a9ea3803deae9f1664165fd1fdd)), closes [51-#55](https://github.com/51-/issues/55)


### Bug Fixes

* **a11y:** add ARIA labels to buttons in playground preview for better accessibility ([3e47393](https://github.com/Angular-Material-Dev/mat-exp/commit/3e4739316ceea29fc6bb8a82619a7bfaeb4cf681))
* **docs:** correct invalid size="sm" example in button docs ([#140](https://github.com/Angular-Material-Dev/mat-exp/issues/140)) ([887e719](https://github.com/Angular-Material-Dev/mat-exp/commit/887e7195ee14c28cd618223b0c8241a186c50b35)), closes [#118](https://github.com/Angular-Material-Dev/mat-exp/issues/118)
* **docs:** refine button documentation for clarity and consistency ([f7957f1](https://github.com/Angular-Material-Dev/mat-exp/commit/f7957f127df9a2c3dba187066d6763b2bb135e72))
* **docs:** restore Import/GitHub rows and Design link on Component Pages ([#182](https://github.com/Angular-Material-Dev/mat-exp/issues/182)) ([b5cb0df](https://github.com/Angular-Material-Dev/mat-exp/commit/b5cb0df45675d832d13980c90ca484c1f8961757)), closes [#177](https://github.com/Angular-Material-Dev/mat-exp/issues/177) [137/#179](https://github.com/Angular-Material-Dev/mat-exp/issues/179)
* **docs:** update quickstart instructions to use 'ng add' and specify button sizes in styles ([6cca2a3](https://github.com/Angular-Material-Dev/mat-exp/commit/6cca2a3e30fcfbde0cd51c158f5d624deaec3922))
* **fab-menu:** read original panel classes via ElementRef instead of setter-only panelClass ([#193](https://github.com/Angular-Material-Dev/mat-exp/issues/193)) ([28495cc](https://github.com/Angular-Material-Dev/mat-exp/commit/28495cc20b388417d500df64455e50201b9b27e8)), closes [#120](https://github.com/Angular-Material-Dev/mat-exp/issues/120) [#185](https://github.com/Angular-Material-Dev/mat-exp/issues/185)
* **fab-menu:** recompute panelClass from scratch on color change ([#147](https://github.com/Angular-Material-Dev/mat-exp/issues/147)) ([57d62e2](https://github.com/Angular-Material-Dev/mat-exp/commit/57d62e2a4bdbe60396d5b0655a9d2ee1ab795c5f)), closes [#120](https://github.com/Angular-Material-Dev/mat-exp/issues/120)
* **loading-indicator:** track recursive GSAP tweens in matchMedia context to fix destroy leak ([#194](https://github.com/Angular-Material-Dev/mat-exp/issues/194)) ([8055216](https://github.com/Angular-Material-Dev/mat-exp/commit/80552160ba02a994cd4f50da082bf8b25f10e775)), closes [#184](https://github.com/Angular-Material-Dev/mat-exp/issues/184) [#184](https://github.com/Angular-Material-Dev/mat-exp/issues/184)
* **loading-indicator:** update dev flag to devOptional and set ViewEncapsulation to None ([8fc987e](https://github.com/Angular-Material-Dev/mat-exp/commit/8fc987e7a1f2ce340a8105d07d7f82af788c8153))
* make a release ([8955376](https://github.com/Angular-Material-Dev/mat-exp/commit/89553761ef029bf9df9f571775a74f41e524eb41))
* **package.json:** update sass build command ([722dab7](https://github.com/Angular-Material-Dev/mat-exp/commit/722dab742041357e581bc10faed801c47c747177))
* **split-button:** correct trailing comma in XS config ([5de89c5](https://github.com/Angular-Material-Dev/mat-exp/commit/5de89c54f97b29dea64899a9f2adf4310a33d1c4))
* **styles:** comment out unused size configurations in split-button SCSS files ([1fa5b57](https://github.com/Angular-Material-Dev/mat-exp/commit/1fa5b57bb661dfd4cde57ebbbd3ffcf0cfb0d888))
* **styles:** update fab-menu hover state colors to use solid backgrounds instead of transparent ([fe45668](https://github.com/Angular-Material-Dev/mat-exp/commit/fe456689e667b833ebb3993b6499e042828c1288))
* update Vercel configuration to redirect all traffic to index.html ([29fe7e8](https://github.com/Angular-Material-Dev/mat-exp/commit/29fe7e8c8ec7c760491bf494c79f49fd44b6916b))


### Features

* **accessibility:** add accessibility documentation and restructure navigation ([6f90fca](https://github.com/Angular-Material-Dev/mat-exp/commit/6f90fca10229cd57ea017e6627aa69b5ac0fc827))
* add button-group component ([2821993](https://github.com/Angular-Material-Dev/mat-exp/commit/2821993f78639433ca0b5306209a33d2589160ac))
* add class selector for button and refactor tokens ([81dac99](https://github.com/Angular-Material-Dev/mat-exp/commit/81dac993033b8c90ec372bcbcdbec6c59fecd98b))
* add toggle option ([64fb551](https://github.com/Angular-Material-Dev/mat-exp/commit/64fb5511a5c7120d29a600a4dde3d5e6f1250858))
* basic setup for button ([ed82ca1](https://github.com/Angular-Material-Dev/mat-exp/commit/ed82ca1c3f14e3ab6717d884f1353c0193cca21f))
* button-group component config styles ([8c6ea7c](https://github.com/Angular-Material-Dev/mat-exp/commit/8c6ea7c3414d1806a5a4b58821f8ed800b837b8f))
* button-group component connected variant ([cf4c69c](https://github.com/Angular-Material-Dev/mat-exp/commit/cf4c69c093c10a72d3f44407f3a8f6035a63c7c7))
* **button-group:** handle appearance ([3340bbe](https://github.com/Angular-Material-Dev/mat-exp/commit/3340bbe752bb0cbca2e46d2cde458fdd11e04f76))
* **button-group:** handle border radius for square connected ([3aa9626](https://github.com/Angular-Material-Dev/mat-exp/commit/3aa9626e07d118e68c8f3bd231cfe514c34e5262))
* **button-group:** handle border radius when shape is square ([0729005](https://github.com/Angular-Material-Dev/mat-exp/commit/0729005aa2301d9b6e88fe93a03a150762d7b40a))
* **button-group:** handle disabled state ([9c1a26b](https://github.com/Angular-Material-Dev/mat-exp/commit/9c1a26b7b42a06310010915c0e563d18faf180bf))
* **button-group:** implement CVA for button-group ([baa8a21](https://github.com/Angular-Material-Dev/mat-exp/commit/baa8a21905ff26b13d98ff53188b9f6892f28825))
* **button-group:** inject button-group in button & icon-button ([d1252b5](https://github.com/Angular-Material-Dev/mat-exp/commit/d1252b576ae103eb7d3ecaa3497ac79f44326551))
* **docs:** add Docs Row on every Doc Page (new DocPageMetaComponent) ([#174](https://github.com/Angular-Material-Dev/mat-exp/issues/174)) ([4a9f2b8](https://github.com/Angular-Material-Dev/mat-exp/commit/4a9f2b816cb8d05c9f15f1e9c41b4ce91d79b505))
* **docs:** add GitHub Row on Component Pages ([#176](https://github.com/Angular-Material-Dev/mat-exp/issues/176)) ([75dfaaa](https://github.com/Angular-Material-Dev/mat-exp/commit/75dfaaa0df8cf99fe8efba88d0ba1a314ccaf5a1))
* **docs:** add Import Row on Component Pages ([#175](https://github.com/Angular-Material-Dev/mat-exp/issues/175)) ([7868e97](https://github.com/Angular-Material-Dev/mat-exp/commit/7868e972e6b7d4d97af8cb038d56084d303af987))
* **docs:** add metaDescription frontmatter/JSDoc override for meta description ([#196](https://github.com/Angular-Material-Dev/mat-exp/issues/196)) ([86561ee](https://github.com/Angular-Material-Dev/mat-exp/commit/86561ee641364b94a6479c83aabb4f17c7208a97))
* **docs:** centralize SVG icon registration and relocate actions row above tabs ([7021ee4](https://github.com/Angular-Material-Dev/mat-exp/commit/7021ee45bc9d419a19f29a0169a78bd9a0af3009))
* **docs:** consolidate Component Page tabs into a single index.md with updated structure ([a7adad1](https://github.com/Angular-Material-Dev/mat-exp/commit/a7adad12473a39b300821ccf5bf30d49d6d3104d))
* **docs:** enhance Doc Page metadata ([097de6c](https://github.com/Angular-Material-Dev/mat-exp/commit/097de6cc885eb0c6c541e9ebecd5fa611196a408))
* **docs:** expose speed input on loading-indicator playground ([c91dbb5](https://github.com/Angular-Material-Dev/mat-exp/commit/c91dbb55c758ae37a81688464acbe7f8670621e3))
* **docs:** implement metadata table for Doc Pages, replacing action button row ([f55ceea](https://github.com/Angular-Material-Dev/mat-exp/commit/f55ceea55813262eec70fcb7f7977fcbee9c6474))
* **docs:** migrate remaining 5 components off tabs ([#178](https://github.com/Angular-Material-Dev/mat-exp/issues/178)) ([#181](https://github.com/Angular-Material-Dev/mat-exp/issues/181)) ([0943766](https://github.com/Angular-Material-Dev/mat-exp/commit/09437664bfdde75691a71013e6152cc170cba25e)), closes [#177](https://github.com/Angular-Material-Dev/mat-exp/issues/177) [#api](https://github.com/Angular-Material-Dev/mat-exp/issues/api) [#styling](https://github.com/Angular-Material-Dev/mat-exp/issues/styling) [#179](https://github.com/Angular-Material-Dev/mat-exp/issues/179)
* **docs:** playground custom element + Button migration (pilot) ([#177](https://github.com/Angular-Material-Dev/mat-exp/issues/177)) ([#180](https://github.com/Angular-Material-Dev/mat-exp/issues/180)) ([385970e](https://github.com/Angular-Material-Dev/mat-exp/commit/385970efe0b6cf1f87ea5d49d8574fd2fcb01834))
* **docs:** update button descriptions to use code formatting and enhance doc page layout ([017311f](https://github.com/Angular-Material-Dev/mat-exp/commit/017311f1b5ba4406ec5af54490601f4a00a9ee37))
* expose expressive button class option ([0b64a71](https://github.com/Angular-Material-Dev/mat-exp/commit/0b64a713a45428c49f740aaff39d37dd68280f0d))
* **fab-menu:** color variations ([788621c](https://github.com/Angular-Material-Dev/mat-exp/commit/788621cbd0f84f701ca9fcd5824b659314d13002))
* **fab-menu:** implement fab-menu ([9178bc4](https://github.com/Angular-Material-Dev/mat-exp/commit/9178bc44a259766b2ece1190055ee98af6ee95ba))
* handle all button colors in xs size ([a4a7d18](https://github.com/Angular-Material-Dev/mat-exp/commit/a4a7d18585567886d03b917494c7a47d61a21c42))
* icon button l variants ([34606ec](https://github.com/Angular-Material-Dev/mat-exp/commit/34606ec4ceb88ab4353e473a052bfbea6675a711))
* icon button m variants ([c3a6282](https://github.com/Angular-Material-Dev/mat-exp/commit/c3a6282ab428513156fdebd35838985177e95022))
* icon button overrides for m3 expressive styles ([88101fb](https://github.com/Angular-Material-Dev/mat-exp/commit/88101fb0a3aef8fce4bd359e6348582cab397bde))
* icon button s variants ([53d3219](https://github.com/Angular-Material-Dev/mat-exp/commit/53d3219d98bbd9187f1d7100d9cf04e9da4eea8e))
* icon button xl variants, border-radius for outline variants ([51ff4e3](https://github.com/Angular-Material-Dev/mat-exp/commit/51ff4e39413db0bda12076dd149a6c0e411bcf92))
* icon button xs filled variant ([8a911ec](https://github.com/Angular-Material-Dev/mat-exp/commit/8a911ececd37230dccfe69873c99f647eefb3e38))
* icon button xs outlined variant ([386590c](https://github.com/Angular-Material-Dev/mat-exp/commit/386590c03ac5966c444938664f40129e0a33880a))
* icon button xs tonal variant ([37c601d](https://github.com/Angular-Material-Dev/mat-exp/commit/37c601d792945286d25d4321c0b13206c2440208))
* icon button xs width variants ([e983f26](https://github.com/Angular-Material-Dev/mat-exp/commit/e983f26470968e094d9c4986dd3c856db0834e04))
* improve config structure ([a652363](https://github.com/Angular-Material-Dev/mat-exp/commit/a652363ccd10068babd79fb7562ee0d4df7a49c1))
* initial setup ([3859929](https://github.com/Angular-Material-Dev/mat-exp/commit/3859929d55c897ca193436c5a65cf99cc65b7d31))
* loading indicator setup ([8b5c4b0](https://github.com/Angular-Material-Dev/mat-exp/commit/8b5c4b09b2bcfd3f4edadf9aec4ffc3fce1d1bef))
* **loading-indicator:** add loading indicator HTML template and update speed option ([195f734](https://github.com/Angular-Material-Dev/mat-exp/commit/195f734c7a9e6e7339b5c7c077ccdaee00a537cb))
* **loading-indicator:** add shape path data and ariaLabel option ([0a1dda5](https://github.com/Angular-Material-Dev/mat-exp/commit/0a1dda550a7982393ec1b3391bbb945b670c72c1))
* **loading-indicator:** add size input for dynamic loading indicator dimensions and update playground example ([d6b96f4](https://github.com/Angular-Material-Dev/mat-exp/commit/d6b96f408ff3bacf77676365c062d9ef8501f1e0))
* **loading-indicator:** expose speed config (fast / default / slow) ([dfe4721](https://github.com/Angular-Material-Dev/mat-exp/commit/dfe47212e7866a850895d7ae823ad907d890c610))
* **loading-indicator:** implement GSAP animations for loading indicator ([0f47002](https://github.com/Angular-Material-Dev/mat-exp/commit/0f47002be40715b7105d4baea9b9368d9486decf))
* **loading-indicator:** implement M3 Expressive morph + rotation animation ([ebfd950](https://github.com/Angular-Material-Dev/mat-exp/commit/ebfd950a3dd3779e207e422a30af5b1de8a2f4c0))
* **loading-indicator:** mirror Compose's spring-bounce morph choreography ([2d667a3](https://github.com/Angular-Material-Dev/mat-exp/commit/2d667a36a68327e8d014ee35158ae4f1f605a84f))
* more button sizes & docs changes ([8b0326b](https://github.com/Angular-Material-Dev/mat-exp/commit/8b0326b3923de966e17730dd2e3380bb406aba71))
* move other size token in correct folders ([231f75f](https://github.com/Angular-Material-Dev/mat-exp/commit/231f75fc168d551546b72816f3b5246c8c0e2467))
* new sizes for button and docs setup ([48adf6c](https://github.com/Angular-Material-Dev/mat-exp/commit/48adf6c8b37b3a6832d53c6b1b36b04b185b85d2))
* remove class name configuration and update docs ([298b4ea](https://github.com/Angular-Material-Dev/mat-exp/commit/298b4eab073697cde7ecfc5ff73b4730ea4f27c2))
* replace ng-doc with standard Angular builder and scaffold three-column shell ([e131c63](https://github.com/Angular-Material-Dev/mat-exp/commit/e131c63e4e84433841084928e9a87f5c9930d92a)), closes [#11](https://github.com/Angular-Material-Dev/mat-exp/issues/11)
* **router-link:** add router-link component for dynamic routing ([746d5da](https://github.com/Angular-Material-Dev/mat-exp/commit/746d5da73efaf59eda017f6aaacd1af6d143def8))
* **schematics:** add ng-add schematic with interactive style configuration ([#157](https://github.com/Angular-Material-Dev/mat-exp/issues/157)) ([175878d](https://github.com/Angular-Material-Dev/mat-exp/commit/175878df7fba02cd900fee3f21ff32adc65d5c5a)), closes [#136](https://github.com/Angular-Material-Dev/mat-exp/issues/136) [#116](https://github.com/Angular-Material-Dev/mat-exp/issues/116) [#116](https://github.com/Angular-Material-Dev/mat-exp/issues/116) [post-#116](https://github.com/post-/issues/116) [#116](https://github.com/Angular-Material-Dev/mat-exp/issues/116) [#159](https://github.com/Angular-Material-Dev/mat-exp/issues/159) [#116](https://github.com/Angular-Material-Dev/mat-exp/issues/116) [#116](https://github.com/Angular-Material-Dev/mat-exp/issues/116) [#136](https://github.com/Angular-Material-Dev/mat-exp/issues/136)
* **split-button:** size: l ([6a4da96](https://github.com/Angular-Material-Dev/mat-exp/commit/6a4da963a8d2808f6917264b48994bbc6365ba07))
* **split-button:** size: m ([cdd36cd](https://github.com/Angular-Material-Dev/mat-exp/commit/cdd36cd43272dfca8c8fc2f0c195671c1165914e))
* **split-button:** size: s ([2db7a5b](https://github.com/Angular-Material-Dev/mat-exp/commit/2db7a5b38f65dcaa452aea49e471f0ba39046049))
* **split-button:** size: xl ([a6f4f62](https://github.com/Angular-Material-Dev/mat-exp/commit/a6f4f6226b6873f5b4cbdb1a40f0f22ab54307ac))
* **split-button:** split button ([915c9d7](https://github.com/Angular-Material-Dev/mat-exp/commit/915c9d77ded8ac41d57b4d34c34315fac6c0f538))
* **split-button:** use button instead of icon button for trailing ([10c53f5](https://github.com/Angular-Material-Dev/mat-exp/commit/10c53f5903b4d689a152364c679ac4a0530ae182))
* **toc:** integrate TOC service and update layout for documentation pages ([2dc1ff5](https://github.com/Angular-Material-Dev/mat-exp/commit/2dc1ff5571a440954090b31c21d0ead343dd5822))
* **tooling:** add new:component generator for Button-Family and standalone components ([#158](https://github.com/Angular-Material-Dev/mat-exp/issues/158)) ([a989b61](https://github.com/Angular-Material-Dev/mat-exp/commit/a989b61665837f4b742636c259e4d64c28ac462e)), closes [#137](https://github.com/Angular-Material-Dev/mat-exp/issues/137)
* **types:** add MatExpressiveLoadingIndicatorSpeed type ([ab64efd](https://github.com/Angular-Material-Dev/mat-exp/commit/ab64efd9fbd69cd8b596f11623aa13d2b7a09736))
* update button styles and structure in mat-expressive package ([963d7d3](https://github.com/Angular-Material-Dev/mat-exp/commit/963d7d38d605195be3bb043773804fb5125db3cb))


### Performance Improvements

* **styles:** add size/appearance/color filtering option and docs guidance to reduce CSS payload ([#155](https://github.com/Angular-Material-Dev/mat-exp/issues/155)) ([fe121e4](https://github.com/Angular-Material-Dev/mat-exp/commit/fe121e4529caa11001f136ee7c52cae60c187444))


### BREAKING CHANGES

* environment.version, VersionsService, VersionSwitcherComponent,
and DeprecationBannerComponent are removed.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CczEvuffptpzV13phYL3A9

* chore(ci)!: remove act-based local CI/CD testing feature

## [1.0.2](https://github.com/Angular-Material-Dev/mat-exp/compare/v1.0.1...v1.0.2) (2026-05-25)


### Bug Fixes

* update Vercel configuration to redirect all traffic to index.html ([cbaab73](https://github.com/Angular-Material-Dev/mat-exp/commit/cbaab732c827242736f82fe1a15b2752cd286c2a))

## [1.0.1](https://github.com/Angular-Material-Dev/mat-exp/compare/v1.0.0...v1.0.1) (2026-05-25)


### Bug Fixes

* make a release ([a4cfeb9](https://github.com/Angular-Material-Dev/mat-exp/commit/a4cfeb9d0d4741c20e6c3a85113a9c40e4a4366d))

# 1.0.0 (2026-05-25)


### Bug Fixes

* **loading-indicator:** update dev flag to devOptional and set ViewEncapsulation to None ([3ad3110](https://github.com/Angular-Material-Dev/mat-exp/commit/3ad3110898e5c2c43e9d38b36edb8c4d4dc58161))
* **package.json:** update sass build command ([7a65128](https://github.com/Angular-Material-Dev/mat-exp/commit/7a65128f55ba9e2f07f31d2cf4e6177a3060f66b))
* **split-button:** correct trailing comma in XS config ([5de89c5](https://github.com/Angular-Material-Dev/mat-exp/commit/5de89c54f97b29dea64899a9f2adf4310a33d1c4))


### Features

* add button-group component ([2821993](https://github.com/Angular-Material-Dev/mat-exp/commit/2821993f78639433ca0b5306209a33d2589160ac))
* add class selector for button and refactor tokens ([81dac99](https://github.com/Angular-Material-Dev/mat-exp/commit/81dac993033b8c90ec372bcbcdbec6c59fecd98b))
* add toggle option ([64fb551](https://github.com/Angular-Material-Dev/mat-exp/commit/64fb5511a5c7120d29a600a4dde3d5e6f1250858))
* basic setup for button ([ed82ca1](https://github.com/Angular-Material-Dev/mat-exp/commit/ed82ca1c3f14e3ab6717d884f1353c0193cca21f))
* button-group component config styles ([8c6ea7c](https://github.com/Angular-Material-Dev/mat-exp/commit/8c6ea7c3414d1806a5a4b58821f8ed800b837b8f))
* button-group component connected variant ([cf4c69c](https://github.com/Angular-Material-Dev/mat-exp/commit/cf4c69c093c10a72d3f44407f3a8f6035a63c7c7))
* **button-group:** handle appearance ([3340bbe](https://github.com/Angular-Material-Dev/mat-exp/commit/3340bbe752bb0cbca2e46d2cde458fdd11e04f76))
* **button-group:** handle border radius for square connected ([3aa9626](https://github.com/Angular-Material-Dev/mat-exp/commit/3aa9626e07d118e68c8f3bd231cfe514c34e5262))
* **button-group:** handle border radius when shape is square ([0729005](https://github.com/Angular-Material-Dev/mat-exp/commit/0729005aa2301d9b6e88fe93a03a150762d7b40a))
* **button-group:** handle disabled state ([9c1a26b](https://github.com/Angular-Material-Dev/mat-exp/commit/9c1a26b7b42a06310010915c0e563d18faf180bf))
* **button-group:** implement CVA for button-group ([baa8a21](https://github.com/Angular-Material-Dev/mat-exp/commit/baa8a21905ff26b13d98ff53188b9f6892f28825))
* **button-group:** inject button-group in button & icon-button ([d1252b5](https://github.com/Angular-Material-Dev/mat-exp/commit/d1252b576ae103eb7d3ecaa3497ac79f44326551))
* **docs:** expose speed input on loading-indicator playground ([8c598ac](https://github.com/Angular-Material-Dev/mat-exp/commit/8c598ac15b5073fbfda1003d26c2cbedf3d60683))
* expose expressive button class option ([0b64a71](https://github.com/Angular-Material-Dev/mat-exp/commit/0b64a713a45428c49f740aaff39d37dd68280f0d))
* **fab-menu:** color variations ([788621c](https://github.com/Angular-Material-Dev/mat-exp/commit/788621cbd0f84f701ca9fcd5824b659314d13002))
* **fab-menu:** implement fab-menu ([9178bc4](https://github.com/Angular-Material-Dev/mat-exp/commit/9178bc44a259766b2ece1190055ee98af6ee95ba))
* handle all button colors in xs size ([a4a7d18](https://github.com/Angular-Material-Dev/mat-exp/commit/a4a7d18585567886d03b917494c7a47d61a21c42))
* icon button l variants ([34606ec](https://github.com/Angular-Material-Dev/mat-exp/commit/34606ec4ceb88ab4353e473a052bfbea6675a711))
* icon button m variants ([c3a6282](https://github.com/Angular-Material-Dev/mat-exp/commit/c3a6282ab428513156fdebd35838985177e95022))
* icon button overrides for m3 expressive styles ([88101fb](https://github.com/Angular-Material-Dev/mat-exp/commit/88101fb0a3aef8fce4bd359e6348582cab397bde))
* icon button s variants ([53d3219](https://github.com/Angular-Material-Dev/mat-exp/commit/53d3219d98bbd9187f1d7100d9cf04e9da4eea8e))
* icon button xl variants, border-radius for outline variants ([51ff4e3](https://github.com/Angular-Material-Dev/mat-exp/commit/51ff4e39413db0bda12076dd149a6c0e411bcf92))
* icon button xs filled variant ([8a911ec](https://github.com/Angular-Material-Dev/mat-exp/commit/8a911ececd37230dccfe69873c99f647eefb3e38))
* icon button xs outlined variant ([386590c](https://github.com/Angular-Material-Dev/mat-exp/commit/386590c03ac5966c444938664f40129e0a33880a))
* icon button xs tonal variant ([37c601d](https://github.com/Angular-Material-Dev/mat-exp/commit/37c601d792945286d25d4321c0b13206c2440208))
* icon button xs width variants ([e983f26](https://github.com/Angular-Material-Dev/mat-exp/commit/e983f26470968e094d9c4986dd3c856db0834e04))
* improve config structure ([a652363](https://github.com/Angular-Material-Dev/mat-exp/commit/a652363ccd10068babd79fb7562ee0d4df7a49c1))
* initial setup ([3859929](https://github.com/Angular-Material-Dev/mat-exp/commit/3859929d55c897ca193436c5a65cf99cc65b7d31))
* loading indicator setup ([8b5c4b0](https://github.com/Angular-Material-Dev/mat-exp/commit/8b5c4b09b2bcfd3f4edadf9aec4ffc3fce1d1bef))
* **loading-indicator:** add loading indicator HTML template and update speed option ([692c81e](https://github.com/Angular-Material-Dev/mat-exp/commit/692c81e829a9889d3be3d0125145fef41b3f076c))
* **loading-indicator:** add shape path data and ariaLabel option ([1f72eb1](https://github.com/Angular-Material-Dev/mat-exp/commit/1f72eb10d6ef73a7e969fd297b564630f48224f9))
* **loading-indicator:** add size input for dynamic loading indicator dimensions and update playground example ([cdc1b7f](https://github.com/Angular-Material-Dev/mat-exp/commit/cdc1b7ff021847beffd361a2497cc617f06cadf5))
* **loading-indicator:** expose speed config (fast / default / slow) ([89e60ab](https://github.com/Angular-Material-Dev/mat-exp/commit/89e60abf4cb137fcfe142308da4d53a4d5f2cfb2))
* **loading-indicator:** implement GSAP animations for loading indicator ([8822633](https://github.com/Angular-Material-Dev/mat-exp/commit/882263349443475caa887d76c055208deb4bc9ca))
* **loading-indicator:** implement M3 Expressive morph + rotation animation ([9c99554](https://github.com/Angular-Material-Dev/mat-exp/commit/9c99554e7e9eeecfb3841bb7d422b04a3c12787c))
* **loading-indicator:** mirror Compose's spring-bounce morph choreography ([0ddb667](https://github.com/Angular-Material-Dev/mat-exp/commit/0ddb667089b71744be7cde91e27fac124ee1d95a))
* more button sizes & docs changes ([8b0326b](https://github.com/Angular-Material-Dev/mat-exp/commit/8b0326b3923de966e17730dd2e3380bb406aba71))
* move other size token in correct folders ([231f75f](https://github.com/Angular-Material-Dev/mat-exp/commit/231f75fc168d551546b72816f3b5246c8c0e2467))
* new sizes for button and docs setup ([48adf6c](https://github.com/Angular-Material-Dev/mat-exp/commit/48adf6c8b37b3a6832d53c6b1b36b04b185b85d2))
* remove class name configuration and update docs ([298b4ea](https://github.com/Angular-Material-Dev/mat-exp/commit/298b4eab073697cde7ecfc5ff73b4730ea4f27c2))
* **split-button:** size: l ([6a4da96](https://github.com/Angular-Material-Dev/mat-exp/commit/6a4da963a8d2808f6917264b48994bbc6365ba07))
* **split-button:** size: m ([cdd36cd](https://github.com/Angular-Material-Dev/mat-exp/commit/cdd36cd43272dfca8c8fc2f0c195671c1165914e))
* **split-button:** size: s ([2db7a5b](https://github.com/Angular-Material-Dev/mat-exp/commit/2db7a5b38f65dcaa452aea49e471f0ba39046049))
* **split-button:** size: xl ([a6f4f62](https://github.com/Angular-Material-Dev/mat-exp/commit/a6f4f6226b6873f5b4cbdb1a40f0f22ab54307ac))
* **split-button:** split button ([915c9d7](https://github.com/Angular-Material-Dev/mat-exp/commit/915c9d77ded8ac41d57b4d34c34315fac6c0f538))
* **split-button:** use button instead of icon button for trailing ([10c53f5](https://github.com/Angular-Material-Dev/mat-exp/commit/10c53f5903b4d689a152364c679ac4a0530ae182))
* **types:** add MatExpressiveLoadingIndicatorSpeed type ([024ddd1](https://github.com/Angular-Material-Dev/mat-exp/commit/024ddd14a2c534daa455e934ed7989d6c2b1cc20))
* update button styles and structure in mat-expressive package ([963d7d3](https://github.com/Angular-Material-Dev/mat-exp/commit/963d7d38d605195be3bb043773804fb5125db3cb))
