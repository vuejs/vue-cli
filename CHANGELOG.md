<a name="3.0.0-beta.1"></a>
# [3.0.0-beta.1](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.13...v3.0.0-beta.1) (2018-02-16)


### Bug Fixes

* **babel preset:** allow setting `useBuiltIns` to be `false`. ([#843](https://github.com/vuejs/vue-cli/issues/843)) ([a9ac1a9](https://github.com/vuejs/vue-cli/commit/a9ac1a9))
* also include import rule in eslint plugin ([e8f036b](https://github.com/vuejs/vue-cli/commit/e8f036b))
* eslint + airbnb compat with TypeScript ([d391e47](https://github.com/vuejs/vue-cli/commit/d391e47))
* fix core-js import for global service ([3a5d125](https://github.com/vuejs/vue-cli/commit/3a5d125)), closes [#837](https://github.com/vuejs/vue-cli/issues/837)
* fix eslint-loader for TypeScript ([9f5d0b9](https://github.com/vuejs/vue-cli/commit/9f5d0b9))



<a name="3.0.0-alpha.13"></a>
# [3.0.0-alpha.13](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.12...v3.0.0-alpha.13) (2018-02-13)


### Bug Fixes

* include missing dep (fix [#831](https://github.com/vuejs/vue-cli/issues/831)) ([6a0bc17](https://github.com/vuejs/vue-cli/commit/6a0bc17))



<a name="3.0.0-alpha.12"></a>
# [3.0.0-alpha.12](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.11...v3.0.0-alpha.12) (2018-02-12)


### Bug Fixes

* fix usage with https proxy by switching from axios to request ([#829](https://github.com/vuejs/vue-cli/issues/829)) ([e8aa688](https://github.com/vuejs/vue-cli/commit/e8aa688)), closes [#785](https://github.com/vuejs/vue-cli/issues/785)
* make extension test for font files case-insensitive ([#830](https://github.com/vuejs/vue-cli/issues/830)) ([d7cfa00](https://github.com/vuejs/vue-cli/commit/d7cfa00))
* only enable TSLint when tslint.json exists ([76d7f77](https://github.com/vuejs/vue-cli/commit/76d7f77))


### Features

* allow e2e plugins to sepcify which mode the server should start in ([8f8fe6d](https://github.com/vuejs/vue-cli/commit/8f8fe6d)), closes [#814](https://github.com/vuejs/vue-cli/issues/814)
* expose useBuiltIns options in [@vue](https://github.com/vue)/babel-preset-app ([8e0661e](https://github.com/vuejs/vue-cli/commit/8e0661e)), closes [#812](https://github.com/vuejs/vue-cli/issues/812)
* lintOnSave no longer causes compilation to fail ([9040df8](https://github.com/vuejs/vue-cli/commit/9040df8)), closes [#817](https://github.com/vuejs/vue-cli/issues/817)
* use eslint-plugin-cypress ([9410442](https://github.com/vuejs/vue-cli/commit/9410442)), closes [#815](https://github.com/vuejs/vue-cli/issues/815)
* use more descriptive classNames for CSS modules ([fd13106](https://github.com/vuejs/vue-cli/commit/fd13106)), closes [#813](https://github.com/vuejs/vue-cli/issues/813)



<a name="3.0.0-alpha.11"></a>
# [3.0.0-alpha.11](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.10...v3.0.0-alpha.11) (2018-02-09)


### Bug Fixes

* eslint config should be root ([ea74da1](https://github.com/vuejs/vue-cli/commit/ea74da1))
* **eslint:** load node env by default (fix [#806](https://github.com/vuejs/vue-cli/issues/806)) ([c2e3228](https://github.com/vuejs/vue-cli/commit/c2e3228))
* respect user configured output path ([b5564af](https://github.com/vuejs/vue-cli/commit/b5564af)), closes [#809](https://github.com/vuejs/vue-cli/issues/809)



<a name="3.0.0-alpha.10"></a>
# [3.0.0-alpha.10](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.9...v3.0.0-alpha.10) (2018-02-08)


### Bug Fixes

* fix pwa info link (close [#801](https://github.com/vuejs/vue-cli/issues/801)) ([a0004ea](https://github.com/vuejs/vue-cli/commit/a0004ea))
* vue-class-component and vue-property-decorators should be dependencies ([c26559d](https://github.com/vuejs/vue-cli/commit/c26559d))


### Features

* include eslint:recommended in prettier config ([e261718](https://github.com/vuejs/vue-cli/commit/e261718))
* support using ESLint to lint TypeScript ([dd04add](https://github.com/vuejs/vue-cli/commit/dd04add))



<a name="3.0.0-alpha.9"></a>
# [3.0.0-alpha.9](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.8...v3.0.0-alpha.9) (2018-02-06)


### Bug Fixes

* **unit-mocha:** fix test glob to avoid running e2e tests ([172e8eb](https://github.com/vuejs/vue-cli/commit/172e8eb)), closes [#790](https://github.com/vuejs/vue-cli/issues/790)
* handle vue invoke config merging for existing files ([46166fb](https://github.com/vuejs/vue-cli/commit/46166fb)), closes [#788](https://github.com/vuejs/vue-cli/issues/788)
* object returned from api.configureWebpack should be merged ([920d8fa](https://github.com/vuejs/vue-cli/commit/920d8fa))
* only support taobao check and inline registry when using npm ([67df3eb](https://github.com/vuejs/vue-cli/commit/67df3eb)), closes [#789](https://github.com/vuejs/vue-cli/issues/789)


### Features

* Use the Workbox webpack plugin in pwa template ([#769](https://github.com/vuejs/vue-cli/issues/769)) ([9095483](https://github.com/vuejs/vue-cli/commit/9095483))



<a name="3.0.0-alpha.8"></a>
# [3.0.0-alpha.8](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.7...v3.0.0-alpha.8) (2018-02-04)


### Bug Fixes

* fix eslint errors when using airbnb + cypress ([313533d](https://github.com/vuejs/vue-cli/commit/313533d))
* fix jest test match ([2c61d23](https://github.com/vuejs/vue-cli/commit/2c61d23)), closes [#771](https://github.com/vuejs/vue-cli/issues/771)
* fix overwrite prompt ([7871c5c](https://github.com/vuejs/vue-cli/commit/7871c5c))
* include version marker in workspace ([d3d040a](https://github.com/vuejs/vue-cli/commit/d3d040a)), closes [#772](https://github.com/vuejs/vue-cli/issues/772)
* **inspect:** correct usage of `resolve` ([#773](https://github.com/vuejs/vue-cli/issues/773)) ([0f9a44a](https://github.com/vuejs/vue-cli/commit/0f9a44a))
* move plugin data extraction into GeneratorAPI ([4f2f6f0](https://github.com/vuejs/vue-cli/commit/4f2f6f0))
* shim global for node modules ([691cfa2](https://github.com/vuejs/vue-cli/commit/691cfa2)), closes [#774](https://github.com/vuejs/vue-cli/issues/774)


### Features

* build --target wc-async ([50fdd9b](https://github.com/vuejs/vue-cli/commit/50fdd9b))
* polish build output ([dc29e88](https://github.com/vuejs/vue-cli/commit/dc29e88))
* update default component content ([59f5913](https://github.com/vuejs/vue-cli/commit/59f5913))



<a name="3.0.0-alpha.7"></a>
# [3.0.0-alpha.7](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.6...v3.0.0-alpha.7) (2018-02-02)


### Bug Fixes

* ensure vue init works when installed with npm ([6ce8565](https://github.com/vuejs/vue-cli/commit/6ce8565))


### Features

* check and show newer version on create ([3df1289](https://github.com/vuejs/vue-cli/commit/3df1289))
* support prompts when invoking plugins ([c1142e2](https://github.com/vuejs/vue-cli/commit/c1142e2))



<a name="3.0.0-alpha.6"></a>
# [3.0.0-alpha.6](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.5...v3.0.0-alpha.6) (2018-02-02)


### Bug Fixes

* --target for global build ([4fb4e35](https://github.com/vuejs/vue-cli/commit/4fb4e35))
* allow console during dev ([5ad8fae](https://github.com/vuejs/vue-cli/commit/5ad8fae))
* avoid deepmerge on project config ([7d590d8](https://github.com/vuejs/vue-cli/commit/7d590d8))
* compatible with safari 10 ([#755](https://github.com/vuejs/vue-cli/issues/755)) ([199c754](https://github.com/vuejs/vue-cli/commit/199c754))
* do not extract vue.config.js in tests ([7874b0e](https://github.com/vuejs/vue-cli/commit/7874b0e))
* ensure loaders exist ([fcfb099](https://github.com/vuejs/vue-cli/commit/fcfb099))
* fix --force flag ([6661ac2](https://github.com/vuejs/vue-cli/commit/6661ac2))
* fix project creation when path contains spaces (fix [#742](https://github.com/vuejs/vue-cli/issues/742)) ([5be05f3](https://github.com/vuejs/vue-cli/commit/5be05f3))
* fix version check ([e5ef34d](https://github.com/vuejs/vue-cli/commit/e5ef34d))
* move linkBin into [@vue](https://github.com/vue)/cli since it requires node 8 ([120d5c5](https://github.com/vuejs/vue-cli/commit/120d5c5))
* TS 2.7 compat ([c7e28fd](https://github.com/vuejs/vue-cli/commit/c7e28fd))
* typescript caching problems ([a80cf18](https://github.com/vuejs/vue-cli/commit/a80cf18))
* **typescript:** explicitly include global types ([31c1261](https://github.com/vuejs/vue-cli/commit/31c1261)), closes [#762](https://github.com/vuejs/vue-cli/issues/762)


### Features

* build --target lib/wc ([faadadf](https://github.com/vuejs/vue-cli/commit/faadadf))
* build --target web-component (WIP) ([6db7735](https://github.com/vuejs/vue-cli/commit/6db7735))
* complete --target wc & multi-wc + tests ([9a07eeb](https://github.com/vuejs/vue-cli/commit/9a07eeb))
* improve build lib/web-component ([1c4943b](https://github.com/vuejs/vue-cli/commit/1c4943b))
* improve inspect output ([fd87394](https://github.com/vuejs/vue-cli/commit/fd87394))
* inject styles under shadow root in web component mode ([98afd07](https://github.com/vuejs/vue-cli/commit/98afd07))
* make env variables available in HTML template ([b626ef1](https://github.com/vuejs/vue-cli/commit/b626ef1))
* parallel mode ([b8f2487](https://github.com/vuejs/vue-cli/commit/b8f2487))
* vue build --target multi-wc [pattern] ([0f59c03](https://github.com/vuejs/vue-cli/commit/0f59c03))
* vue inspect that proxies to vue-cli-service ([4c00cfa](https://github.com/vuejs/vue-cli/commit/4c00cfa))


### Reverts

* feat: load config w/ cosmiconfig ([702b539](https://github.com/vuejs/vue-cli/commit/702b539))



<a name="3.0.0-alpha.5"></a>
# [3.0.0-alpha.5](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2018-01-29)


### Bug Fixes

* cache-loader doesnt seem to work well with ts-loader ([63c8f65](https://github.com/vuejs/vue-cli/commit/63c8f65))
* jest should only run files in given directory ([4a7fd64](https://github.com/vuejs/vue-cli/commit/4a7fd64)), closes [#740](https://github.com/vuejs/vue-cli/issues/740)


### Features

* allow saving multiple presets ([f372f55](https://github.com/vuejs/vue-cli/commit/f372f55))
* load config w/ cosmiconfig ([5288122](https://github.com/vuejs/vue-cli/commit/5288122))
* support config in dedicated files ([01edb46](https://github.com/vuejs/vue-cli/commit/01edb46))



<a name="3.0.0-alpha.4"></a>
# [3.0.0-alpha.4](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2018-01-26)


### Bug Fixes

* pin joi to 12.x for node version compat ([3bd447a](https://github.com/vuejs/vue-cli/commit/3bd447a))
* skip postcss-loader if no postcss config is present ([1142339](https://github.com/vuejs/vue-cli/commit/1142339))
* temp pinning vue-jest to github branch ([2d6a0d9](https://github.com/vuejs/vue-cli/commit/2d6a0d9))


### Features

* move babel-preset and eslint-plugin as deps of plugins ([c2583e4](https://github.com/vuejs/vue-cli/commit/c2583e4))



<a name="3.0.0-alpha.3"></a>
# [3.0.0-alpha.3](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2018-01-26)


### Bug Fixes

* clone options before mutating ([7471f94](https://github.com/vuejs/vue-cli/commit/7471f94))
* **typescript:** fix tsconfig.json ([235676f](https://github.com/vuejs/vue-cli/commit/235676f))
* **typescript:** include [@types](https://github.com/types)/node instead of shimming process ([f9c8849](https://github.com/vuejs/vue-cli/commit/f9c8849))
* ensure cache-loader apply to both babel and ts ([5f76980](https://github.com/vuejs/vue-cli/commit/5f76980))
* fix sync script for generators ([134ac58](https://github.com/vuejs/vue-cli/commit/134ac58))
* force babel-core version when using ts + babel ([d7c6af7](https://github.com/vuejs/vue-cli/commit/d7c6af7))
* more global resolve fixes + better error message for missing loaders ([367b78b](https://github.com/vuejs/vue-cli/commit/367b78b))
* more global service resolve fixes ([76dda73](https://github.com/vuejs/vue-cli/commit/76dda73))
* packageManager flag ([0c9ecd5](https://github.com/vuejs/vue-cli/commit/0c9ecd5))
* resolve for global service ([8f0b52f](https://github.com/vuejs/vue-cli/commit/8f0b52f))


### Features

* use cache-loader for ts ([4680544](https://github.com/vuejs/vue-cli/commit/4680544))



<a name="3.0.0-alpha.2"></a>
# [3.0.0-alpha.2](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2018-01-25)


### Bug Fixes

* avoid dotfiles not being published to npm ([2e3fe07](https://github.com/vuejs/vue-cli/commit/2e3fe07))
* do not update dep if latest tag is older then specified ([b913047](https://github.com/vuejs/vue-cli/commit/b913047))
* use babel-loader@8 ([c769110](https://github.com/vuejs/vue-cli/commit/c769110))



<a name="3.0.0-alpha.1"></a>
# [3.0.0-alpha.1](https://github.com/vuejs/vue-cli/compare/a923afb...v3.0.0-alpha.1) (2018-01-25)


### Bug Fixes

* avoid scrolling when picking features ([d57208d](https://github.com/vuejs/vue-cli/commit/d57208d))
* bump root deps as well ([f52ff70](https://github.com/vuejs/vue-cli/commit/f52ff70))
* ensure paths + make html optional ([2c1ad14](https://github.com/vuejs/vue-cli/commit/2c1ad14))
* typo {mdoule => module} ([#721](https://github.com/vuejs/vue-cli/issues/721)) ([4765cc6](https://github.com/vuejs/vue-cli/commit/4765cc6))


### Features

* add caching for babel ([7605bd6](https://github.com/vuejs/vue-cli/commit/7605bd6))
* auto DLL ([8dff383](https://github.com/vuejs/vue-cli/commit/8dff383))
* better validation error message ([5fef42c](https://github.com/vuejs/vue-cli/commit/5fef42c))
* complete prettier integration ([100c5c6](https://github.com/vuejs/vue-cli/commit/100c5c6))
* core ([a923afb](https://github.com/vuejs/vue-cli/commit/a923afb))
* css preprocessors ([d3bb381](https://github.com/vuejs/vue-cli/commit/d3bb381))
* e2e cypress ([8a3ac7e](https://github.com/vuejs/vue-cli/commit/8a3ac7e))
* e2e nightwatch ([655202f](https://github.com/vuejs/vue-cli/commit/655202f))
* enable caching for uglifyjs plugin ([abaed00](https://github.com/vuejs/vue-cli/commit/abaed00))
* experimental support for compiling TS with Babel ([e4dcc2f](https://github.com/vuejs/vue-cli/commit/e4dcc2f))
* improve generator hasPlugin check + invoke output ([52dad9d](https://github.com/vuejs/vue-cli/commit/52dad9d))
* improve prompt flow ([06af371](https://github.com/vuejs/vue-cli/commit/06af371))
* make jest plugin work with TypeScript ([ea2648e](https://github.com/vuejs/vue-cli/commit/ea2648e))
* make tslint work for vue files ([52b587e](https://github.com/vuejs/vue-cli/commit/52b587e))
* mocha-webpack plugin ([21187b4](https://github.com/vuejs/vue-cli/commit/21187b4))
* optimize minification ([bd1ffd3](https://github.com/vuejs/vue-cli/commit/bd1ffd3))
* preliminary TS plugin imeplementation ([54a902d](https://github.com/vuejs/vue-cli/commit/54a902d))
* pwa ([902f6c0](https://github.com/vuejs/vue-cli/commit/902f6c0))
* router & vuex ([88e9d46](https://github.com/vuejs/vue-cli/commit/88e9d46))
* support Prettier eslint config (pending) ([d84df9a](https://github.com/vuejs/vue-cli/commit/d84df9a))
* tweak invoke command ([65cc27d](https://github.com/vuejs/vue-cli/commit/65cc27d))
* use Babel w/ TS for polyfills ([5b19826](https://github.com/vuejs/vue-cli/commit/5b19826))
* wip invoke command ([132b0db](https://github.com/vuejs/vue-cli/commit/132b0db))
* WIP jest plugin ([bb5d968](https://github.com/vuejs/vue-cli/commit/bb5d968))



