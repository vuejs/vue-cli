# [3.0.3](https://github.com/vuejs/vue-cli/compare/v3.0.2...v3.0.3) (2018-09-12)

## cli-plugin-unit-mocha

#### Bug Fixes

* revert file name hashing in dev mode ([0909bc8](https://github.com/vuejs/vue-cli/commit/0909bc8)), closes [#2492](https://github.com/vuejs/vue-cli/issues/2492) [/github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405](https://github.com//github.com/webpack/webpack-dev-server/issues/377/issues/issuecomment-241258405)

## cli-service

#### Bug Fixes

* fix ESDIR errors when outputDir contains dots ([1682ff7](https://github.com/vuejs/vue-cli/commit/1682ff7)), closes [#2414](https://github.com/vuejs/vue-cli/issues/2414)
* hash module ids in anonymous chunks, avoid ENAMETOOLONG error ([69cec80](https://github.com/vuejs/vue-cli/commit/69cec80)), closes [#2490](https://github.com/vuejs/vue-cli/issues/2490)



# [3.0.2](https://github.com/vuejs/vue-cli/compare/v3.0.1...v3.0.2) (2018-09-11)

## cli

#### Bug Fixes

* names of Sass and Less ([#2384](https://github.com/vuejs/vue-cli/issues/2384)) ([ff57b8f](https://github.com/vuejs/vue-cli/commit/ff57b8f))
* support generator/index.js in local presets ([#2263](https://github.com/vuejs/vue-cli/issues/2263)) ([ecb8c18](https://github.com/vuejs/vue-cli/commit/ecb8c18)), closes [#2172](https://github.com/vuejs/vue-cli/issues/2172)
* use sync fs methods in writeFileTree ([#2341](https://github.com/vuejs/vue-cli/issues/2341)) ([ba15fa2](https://github.com/vuejs/vue-cli/commit/ba15fa2)), closes [#2275](https://github.com/vuejs/vue-cli/issues/2275)
* **plugin api:** fix generator dotfile rename for Windows. ([#2427](https://github.com/vuejs/vue-cli/issues/2427)) ([3f434f6](https://github.com/vuejs/vue-cli/commit/3f434f6)), closes [#2424](https://github.com/vuejs/vue-cli/issues/2424)

## cli-plugin-babel

#### Bug Fixes

* fix require('[@vue](https://github.com/vue)/babel-preset-app').version return undefined bug ([#2393](https://github.com/vuejs/vue-cli/issues/2393)) ([f0bddd8](https://github.com/vuejs/vue-cli/commit/f0bddd8))
* fix scoped modules exclusion on windows ([#2379](https://github.com/vuejs/vue-cli/issues/2379)) ([3247719](https://github.com/vuejs/vue-cli/commit/3247719)), closes [#2251](https://github.com/vuejs/vue-cli/issues/2251)

## cli-plugin-eslint

#### Bug Fixes

* also lint nested js files starting with dot ([b81d11e](https://github.com/vuejs/vue-cli/commit/b81d11e))

## cli-plugin-unit-jest

#### Bug Fixes

* **cli-plugin-unit-jest:** also process SVG files with jest-transform-stub ([#2368](https://github.com/vuejs/vue-cli/issues/2368)) ([3def765](https://github.com/vuejs/vue-cli/commit/3def765))
* ensure unit test examples work in projects created with --bare ([b62c6ba](https://github.com/vuejs/vue-cli/commit/b62c6ba)), closes [#2262](https://github.com/vuejs/vue-cli/issues/2262)

## cli-plugin-unit-mocha

#### Bug Fixes

* fix file name resovling in mocha env ([f683583](https://github.com/vuejs/vue-cli/commit/f683583))

## cli-service

#### Bug Fixes

* **cli-service:** treat specific flags as boolean only ([b1f3a4c](https://github.com/vuejs/vue-cli/commit/b1f3a4c)), closes [#2258](https://github.com/vuejs/vue-cli/issues/2258)
* add hash to filename in development mode ([#2403](https://github.com/vuejs/vue-cli/issues/2403)) ([33dad39](https://github.com/vuejs/vue-cli/commit/33dad39)), closes [#2391](https://github.com/vuejs/vue-cli/issues/2391) [#1132](https://github.com/vuejs/vue-cli/issues/1132)
* adjust postcss-loader order when using inline minification ([a2d1095](https://github.com/vuejs/vue-cli/commit/a2d1095))
* fix cssnanoOptions format ([d0320eb](https://github.com/vuejs/vue-cli/commit/d0320eb)), closes [#2395](https://github.com/vuejs/vue-cli/issues/2395)
* fix extracted css publicPath for target --lib ([1973e2d](https://github.com/vuejs/vue-cli/commit/1973e2d)), closes [#2260](https://github.com/vuejs/vue-cli/issues/2260)
* fix hmr compatibility with worker-loader ([#2286](https://github.com/vuejs/vue-cli/issues/2286)) ([78c6877](https://github.com/vuejs/vue-cli/commit/78c6877)), closes [#2276](https://github.com/vuejs/vue-cli/issues/2276)
* fix HMR hostname when devServe.host is set ([#2230](https://github.com/vuejs/vue-cli/issues/2230)) ([2f19904](https://github.com/vuejs/vue-cli/commit/2f19904))
* revert default `symlinks` setting ([#2409](https://github.com/vuejs/vue-cli/issues/2409)) ([c9cc225](https://github.com/vuejs/vue-cli/commit/c9cc225)), closes [#1559](https://github.com/vuejs/vue-cli/issues/1559) [#2195](https://github.com/vuejs/vue-cli/issues/2195) [#2284](https://github.com/vuejs/vue-cli/issues/2284) [#1609](https://github.com/vuejs/vue-cli/issues/1609)
* revert named-chunks nameResolver algorithm ([#2324](https://github.com/vuejs/vue-cli/issues/2324)) ([3933187](https://github.com/vuejs/vue-cli/commit/3933187)), closes [#1959](https://github.com/vuejs/vue-cli/issues/1959)
* **serve:** respect devServer.openPage field ([#2309](https://github.com/vuejs/vue-cli/issues/2309)) ([f9652a1](https://github.com/vuejs/vue-cli/commit/f9652a1))

## cli-shared-utils

#### Bug Fixes

* expire env maps, closes [#1906](https://github.com/vuejs/vue-cli/issues/1906) ([8dd0b11](https://github.com/vuejs/vue-cli/commit/8dd0b11))

## cli-ui

#### Bug Fixes

* put actions buttons together, closes [#1588](https://github.com/vuejs/vue-cli/issues/1588) ([812159a](https://github.com/vuejs/vue-cli/commit/812159a))
* ansi up shouldn't escape HTML, closes [#2187](https://github.com/vuejs/vue-cli/issues/2187) ([51490c6](https://github.com/vuejs/vue-cli/commit/51490c6))
* pane toolbar switch background in dark mode ([ad6f934](https://github.com/vuejs/vue-cli/commit/ad6f934))
* restore select element (config/task) ([a549d56](https://github.com/vuejs/vue-cli/commit/a549d56))
* **TopBar:** project dropdown button not flat to be more accessible ([59dbc02](https://github.com/vuejs/vue-cli/commit/59dbc02))
* **cli-ui:** ignore "false" ENOENT errors on Windows ([#2294](https://github.com/vuejs/vue-cli/issues/2294)) ([bf91533](https://github.com/vuejs/vue-cli/commit/bf91533))
* **plugin api:** IPC now namspaced per project by default, closes [#2189](https://github.com/vuejs/vue-cli/issues/2189) ([f261410](https://github.com/vuejs/vue-cli/commit/f261410))
#### Features

* **configuration details:** better loading UX ([5efbd1b](https://github.com/vuejs/vue-cli/commit/5efbd1b))

## cli-ui-addon-webpack

#### Bug Fixes

* **webpack dashboard:** anazlyer sort on size types + performance improvements ([de290d8](https://github.com/vuejs/vue-cli/commit/de290d8))
* **webpack dashboard:** support any command for mode ([855da76](https://github.com/vuejs/vue-cli/commit/855da76))

## docs

#### Bug Fixes

* spelling of TypeScript ([#2389](https://github.com/vuejs/vue-cli/issues/2389)) ([cd619e7](https://github.com/vuejs/vue-cli/commit/cd619e7))



# [3.0.1](https://github.com/vuejs/vue-cli/compare/v3.0.0...v3.0.1) (2018-08-16)

## cli

#### Bug Fixes

* fix local preset inference on Windows ([f83f31a](https://github.com/vuejs/vue-cli/commit/f83f31a))
* temporary fix core-js dep for vue ui ([6d64750](https://github.com/vuejs/vue-cli/commit/6d64750)), closes [#2215](https://github.com/vuejs/vue-cli/issues/2215)
* **generator:** handle directories starting with dot ([1892bcc](https://github.com/vuejs/vue-cli/commit/1892bcc)), closes [#2222](https://github.com/vuejs/vue-cli/issues/2222)

## cli-plugin-eslint

#### Bug Fixes

* **eslint:** lint command should also lint config files starting with dot ([8189f20](https://github.com/vuejs/vue-cli/commit/8189f20)), closes [#2228](https://github.com/vuejs/vue-cli/issues/2228)

## cli-plugin-typescript

#### Bug Fixes

* **typescript:** fix typescript + multi-page build ([7e1862f](https://github.com/vuejs/vue-cli/commit/7e1862f)), closes [#2179](https://github.com/vuejs/vue-cli/issues/2179) [#2193](https://github.com/vuejs/vue-cli/issues/2193)

## cli-service

#### Bug Fixes

* allow relative baseUrl other than ./ ([#2168](https://github.com/vuejs/vue-cli/issues/2168)) ([d14d4e6](https://github.com/vuejs/vue-cli/commit/d14d4e6))
* inspect --plugins should log plugin names from webpack-merge ([#2201](https://github.com/vuejs/vue-cli/issues/2201)) ([69a4fb3](https://github.com/vuejs/vue-cli/commit/69a4fb3))
* minify embedded CSS with extract: false ([a2c767e](https://github.com/vuejs/vue-cli/commit/a2c767e)), closes [#2214](https://github.com/vuejs/vue-cli/issues/2214)
* preserve rule names when configureWebpack is present ([2257034](https://github.com/vuejs/vue-cli/commit/2257034)), closes [#2206](https://github.com/vuejs/vue-cli/issues/2206)
* work around url-loader 1.1.0 regression ([1f0c8e9](https://github.com/vuejs/vue-cli/commit/1f0c8e9)), closes [#2242](https://github.com/vuejs/vue-cli/issues/2242)

## docs

#### Bug Fixes

* fix css output location for relative baseUrl + more details in docs ([1e7fa2c](https://github.com/vuejs/vue-cli/commit/1e7fa2c))
* **eslint:** always emit error when lintOnSave === error + improve docs ([d96a794](https://github.com/vuejs/vue-cli/commit/d96a794)), closes [#2162](https://github.com/vuejs/vue-cli/issues/2162)

## other

#### Bug Fixes

* upgrade lint-staged to v7.2.2 ([#2183](https://github.com/vuejs/vue-cli/issues/2183)) ([4a035e2](https://github.com/vuejs/vue-cli/commit/4a035e2)), closes [#2165](https://github.com/vuejs/vue-cli/issues/2165)



# [3.0.0](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.12...v3.0.0) (2018-08-10)

## other

#### Bug Fixes

* avoid adding githooks if created as sub dir in existing git repo ([ba75e29](https://github.com/vuejs/vue-cli/commit/ba75e29)), closes [#2131](https://github.com/vuejs/vue-cli/issues/2131)



# [3.0.0-rc.12](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.11...v3.0.0-rc.12) (2018-08-09)

## cli

#### Features

* support generator.js and prompts.js in preset ([3b21fad](https://github.com/vuejs/vue-cli/commit/3b21fad))

## cli-service

#### Bug Fixes

* avoid os.cpus() error in certain envs ([327d041](https://github.com/vuejs/vue-cli/commit/327d041)), closes [#2110](https://github.com/vuejs/vue-cli/issues/2110)
#### Code Refactoring

* use better modern mode and cors implementation ([7b39bed](https://github.com/vuejs/vue-cli/commit/7b39bed))
#### Features

* support Subresource Integrity via `integrity` option ([55043d3](https://github.com/vuejs/vue-cli/commit/55043d3))

## cli-service-global

#### Bug Fixes

* install vue-template-compiler for global service ([c42cb94](https://github.com/vuejs/vue-cli/commit/c42cb94))

## cli-ui

#### Bug Fixes

* **build:** wrong arg name, closes [#2067](https://github.com/vuejs/vue-cli/issues/2067) ([fe66a44](https://github.com/vuejs/vue-cli/commit/fe66a44))

## other

#### Bug Fixes

* ensure consistent build hash with different project locations ([9e4d62c](https://github.com/vuejs/vue-cli/commit/9e4d62c))


### BREAKING CHANGES

* The `corsUseCredentials` option has been replaced by the new
`crossorigin` option.



# [3.0.0-rc.11](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.10...v3.0.0-rc.11) (2018-08-07)

## babel-preset-app

#### Bug Fixes

* fix Promise.finally missing in Firefox ([b20f624](https://github.com/vuejs/vue-cli/commit/b20f624)), closes [#2012](https://github.com/vuejs/vue-cli/issues/2012)

## cli

#### Bug Fixes

* temporarily avoid chalk color in options ([#2042](https://github.com/vuejs/vue-cli/issues/2042)) ([31710fe](https://github.com/vuejs/vue-cli/commit/31710fe))
#### Features

* **create:** more descriptions and links ([9f9ddb1](https://github.com/vuejs/vue-cli/commit/9f9ddb1))

## cli-plugin-babel

#### Bug Fixes

* babel cache should take browserslist into account ([356eef6](https://github.com/vuejs/vue-cli/commit/356eef6))

## cli-plugin-e2e-cypress

#### Bug Fixes

* **e2e-cypress:** merge --config option for cypress ([#2048](https://github.com/vuejs/vue-cli/issues/2048)) ([d210e78](https://github.com/vuejs/vue-cli/commit/d210e78)), closes [#2047](https://github.com/vuejs/vue-cli/issues/2047)

## cli-plugin-eslint

#### Bug Fixes

* **cli-plugin-eslint:** remove base rules from ui ([#2029](https://github.com/vuejs/vue-cli/issues/2029)) ([1e10161](https://github.com/vuejs/vue-cli/commit/1e10161))
* eslint plugin module loading in workspaces ([185ae6d](https://github.com/vuejs/vue-cli/commit/185ae6d))
#### Features

* rework eslint configuration tab to display all rules ([#2008](https://github.com/vuejs/vue-cli/issues/2008)) ([7953d83](https://github.com/vuejs/vue-cli/commit/7953d83))

## cli-plugin-typescript

#### Bug Fixes

* **tslint:** also lint tsx blocks ([55f4c5f](https://github.com/vuejs/vue-cli/commit/55f4c5f))
* **typescript:** explicitly enable allowSyntheticDefaultImports ([350f77b](https://github.com/vuejs/vue-cli/commit/350f77b))
* **typescript:** prevent compilation error when using src attribute on sfc ([#2068](https://github.com/vuejs/vue-cli/issues/2068)) ([7706dcf](https://github.com/vuejs/vue-cli/commit/7706dcf))
* **typescript:** tsconfig whitespace ([#2046](https://github.com/vuejs/vue-cli/issues/2046)) ([437f56c](https://github.com/vuejs/vue-cli/commit/437f56c))
* **typescript:** use esnext in lib ([#2045](https://github.com/vuejs/vue-cli/issues/2045)) ([5838096](https://github.com/vuejs/vue-cli/commit/5838096))

## cli-plugin-unit-jest

#### Bug Fixes

* **jest:** make sure jest tests work without babel ([99761b3](https://github.com/vuejs/vue-cli/commit/99761b3)), closes [#2040](https://github.com/vuejs/vue-cli/issues/2040)

## cli-plugin-unit-mocha

#### Features

* **service:** Enable inspector debugging for unit test by mocha ([#2013](https://github.com/vuejs/vue-cli/issues/2013)) ([2243515](https://github.com/vuejs/vue-cli/commit/2243515))

## cli-service

#### Bug Fixes

* **css:** fix importLoaders which only applies to plain CSS imports ([4220835](https://github.com/vuejs/vue-cli/commit/4220835)), closes [#2055](https://github.com/vuejs/vue-cli/issues/2055)
* **pwa:** workaround index sw manifest path when using relative indexPath ([68aaa8f](https://github.com/vuejs/vue-cli/commit/68aaa8f)), closes [#2007](https://github.com/vuejs/vue-cli/issues/2007)
* avoid crashing when adding router via UI ([128d9d9](https://github.com/vuejs/vue-cli/commit/128d9d9)), closes [#2034](https://github.com/vuejs/vue-cli/issues/2034)
* defensive html chunk sorting ([495c25a](https://github.com/vuejs/vue-cli/commit/495c25a)), closes [#1993](https://github.com/vuejs/vue-cli/issues/1993)
* make vue-template-compiler a peer dep to allow version pinning ([fd839b5](https://github.com/vuejs/vue-cli/commit/fd839b5)), closes [#2086](https://github.com/vuejs/vue-cli/issues/2086)
#### Features

* respect devServer field in webpack config as well ([3894a4a](https://github.com/vuejs/vue-cli/commit/3894a4a)), closes [#2053](https://github.com/vuejs/vue-cli/issues/2053)
* support --bare flag when creating new projects ([c6ca93e](https://github.com/vuejs/vue-cli/commit/c6ca93e)), closes [#2030](https://github.com/vuejs/vue-cli/issues/2030)

## cli-ui

#### Bug Fixes

* **deps:** more robust isInstalled ([9079d3e](https://github.com/vuejs/vue-cli/commit/9079d3e))
* **filediff:** expand all don't expand files collapsed by default (like yarn.lock) ([3bda824](https://github.com/vuejs/vue-cli/commit/3bda824))
* change new project folder input placeholder, closes [#2069](https://github.com/vuejs/vue-cli/issues/2069) ([4c8c3e9](https://github.com/vuejs/vue-cli/commit/4c8c3e9))
#### Features

* support ANSI colors in ListItemInfo ([8c96c15](https://github.com/vuejs/vue-cli/commit/8c96c15))
* **file-diff:** syntax highlighting, better background colors ([196c84c](https://github.com/vuejs/vue-cli/commit/196c84c))

## docs

#### Features

* allow enfoce extract css in development ([686ec25](https://github.com/vuejs/vue-cli/commit/686ec25)), closes [#2002](https://github.com/vuejs/vue-cli/issues/2002)


### BREAKING CHANGES

* setting css.extract to true will now force extraction in development



# [3.0.0-rc.10](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.9...v3.0.0-rc.10) (2018-07-30)

## cli

#### Features

* add create option for router history mode ([6392a60](https://github.com/vuejs/vue-cli/commit/6392a60))

## cli-plugin-typescript

#### Bug Fixes

* **tslint:** should only lint <script lang="ts"> ([2a21612](https://github.com/vuejs/vue-cli/commit/2a21612)), closes [#1984](https://github.com/vuejs/vue-cli/issues/1984)
#### Features

* **typescript:** upgrade default TS version to 3.0 ([483a082](https://github.com/vuejs/vue-cli/commit/483a082))

## cli-service

#### Bug Fixes

* ensure entry chunk is placed last for CSS overrides ([352d3bb](https://github.com/vuejs/vue-cli/commit/352d3bb))
#### Features

* add filenameHashing option ([#1980](https://github.com/vuejs/vue-cli/issues/1980)) ([ce7b394](https://github.com/vuejs/vue-cli/commit/ce7b394))



# [3.0.0-rc.9](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.8...v3.0.0-rc.9) (2018-07-29)

## cli

#### Bug Fixes

* Typo. ([#1968](https://github.com/vuejs/vue-cli/issues/1968)) ([ee85f7c](https://github.com/vuejs/vue-cli/commit/ee85f7c))

## cli-plugin-unit-jest

#### Bug Fixes

* improve jest/mocha add compat with typescript ([252dd3d](https://github.com/vuejs/vue-cli/commit/252dd3d))

## cli-service

#### Bug Fixes

* **serve:** use explicit sockjs url unless inside a container ([cf6290f](https://github.com/vuejs/vue-cli/commit/cf6290f)), closes [#1974](https://github.com/vuejs/vue-cli/issues/1974)
* typo ([#1965](https://github.com/vuejs/vue-cli/issues/1965)) ([ae1817a](https://github.com/vuejs/vue-cli/commit/ae1817a))
#### Features

* hasPlugin matches router or vuex ([1c5fdd0](https://github.com/vuejs/vue-cli/commit/1c5fdd0))



# [3.0.0-rc.8](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.7...v3.0.0-rc.8) (2018-07-27)

## babel-preset-app

#### Code Refactoring

* **babel:** use individual plugins instead of stage presets ([da833d6](https://github.com/vuejs/vue-cli/commit/da833d6))

## cli

#### Bug Fixes

* revert windows config path change, close [#1961](https://github.com/vuejs/vue-cli/issues/1961) ([b60dd4b](https://github.com/vuejs/vue-cli/commit/b60dd4b))

## cli-plugin-typescript

#### Bug Fixes

* do not default emitDecoratorMetadata to true ([aea4cfe](https://github.com/vuejs/vue-cli/commit/aea4cfe)), closes [#1708](https://github.com/vuejs/vue-cli/issues/1708)
* fix tslint on vue file with no script ([6b91a13](https://github.com/vuejs/vue-cli/commit/6b91a13))

## cli-plugin-unit-jest

#### Bug Fixes

* **jest:** fix jest tests due to jsdom 11.12.0 ([7d65353](https://github.com/vuejs/vue-cli/commit/7d65353)), closes [#1960](https://github.com/vuejs/vue-cli/issues/1960)

## cli-service

#### Bug Fixes

* avoid hash collisions ([#1959](https://github.com/vuejs/vue-cli/issues/1959)) ([4b5a634](https://github.com/vuejs/vue-cli/commit/4b5a634))
* fix hmr in docker + support devServer.public with protocol ([da38ed4](https://github.com/vuejs/vue-cli/commit/da38ed4))
#### Features

* **serve:** detect and add tip when running inside container ([ed0315a](https://github.com/vuejs/vue-cli/commit/ed0315a))


### BREAKING CHANGES

* **babel:** @vue/babel-preset-app no longer includes @babel/preset-stage-2.
Now the only pre stage-3 proposals included are dynamic import, decorators and
class properties. This is because Babel 7 will be removing stage presets
altogether.



# [3.0.0-rc.7](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.6...v3.0.0-rc.7) (2018-07-27)

## cli

#### Features

* store rc file in AppData on windows ([e970b1a](https://github.com/vuejs/vue-cli/commit/e970b1a)), closes [#1957](https://github.com/vuejs/vue-cli/issues/1957)

## cli-service

#### Bug Fixes

* fix absolute path for outputDir option ([e7602ab](https://github.com/vuejs/vue-cli/commit/e7602ab))
* make sure router.js passes airbnb lint ([e27e679](https://github.com/vuejs/vue-cli/commit/e27e679)), closes [#1956](https://github.com/vuejs/vue-cli/issues/1956)
#### Features

* support specifying index output path via indexPath option ([b9ecb90](https://github.com/vuejs/vue-cli/commit/b9ecb90))



# [3.0.0-rc.6](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.5...v3.0.0-rc.6) (2018-07-26)

## cli

#### Bug Fixes

* infer rootOptions for late invoked generators ([ce58549](https://github.com/vuejs/vue-cli/commit/ce58549)), closes [#1820](https://github.com/vuejs/vue-cli/issues/1820)
* plugin generator should be optional ([75eb5b1](https://github.com/vuejs/vue-cli/commit/75eb5b1)), closes [#1896](https://github.com/vuejs/vue-cli/issues/1896)
* README.md not in initial commit, closes [#1869](https://github.com/vuejs/vue-cli/issues/1869) ([fde3c0e](https://github.com/vuejs/vue-cli/commit/fde3c0e))
* **create:** clear tmpdir before cloning remote preset, fix [#1878](https://github.com/vuejs/vue-cli/issues/1878) ([#1880](https://github.com/vuejs/vue-cli/issues/1880)) ([a1097f2](https://github.com/vuejs/vue-cli/commit/a1097f2))
* **create:** Commands added by plugin (through preset) won't have description in README' ([#1910](https://github.com/vuejs/vue-cli/issues/1910)) ([e9d01eb](https://github.com/vuejs/vue-cli/commit/e9d01eb))
* **create:** fix force git init ([967f99a](https://github.com/vuejs/vue-cli/commit/967f99a))
* **create:** fix shouldInitGit check ([#1901](https://github.com/vuejs/vue-cli/issues/1901)) ([7e6c37c](https://github.com/vuejs/vue-cli/commit/7e6c37c))
* **create:** prioritize preset name present in ~/.vuerc ([#1874](https://github.com/vuejs/vue-cli/issues/1874)) ([87a6272](https://github.com/vuejs/vue-cli/commit/87a6272)), closes [#1871](https://github.com/vuejs/vue-cli/issues/1871)

## cli-plugin-eslint

#### Bug Fixes

* **pwa:** wrong config, closes [#1890](https://github.com/vuejs/vue-cli/issues/1890) ([f4aa40d](https://github.com/vuejs/vue-cli/commit/f4aa40d))

## cli-plugin-typescript

#### Bug Fixes

* **typescript:** fix ts + modern mode ([d6d2af5](https://github.com/vuejs/vue-cli/commit/d6d2af5)), closes [#1577](https://github.com/vuejs/vue-cli/issues/1577)
* **typescript:** default esModuleInterop to true ([a352bdc](https://github.com/vuejs/vue-cli/commit/a352bdc)), closes [#1895](https://github.com/vuejs/vue-cli/issues/1895)
#### Documentation

* mention ts peer dep change ([9bb74bc](https://github.com/vuejs/vue-cli/commit/9bb74bc))
#### Features

* **plugin-api:** prompts.js can now export a function which receives package info ([e33b04c](https://github.com/vuejs/vue-cli/commit/e33b04c))
* **typescript:** make typescript a peer dep so user can specify its version ([f278faf](https://github.com/vuejs/vue-cli/commit/f278faf))

## cli-plugin-unit-jest

#### Features

* **unit-jest:** run jest in the same process ([cd88cfa](https://github.com/vuejs/vue-cli/commit/cd88cfa))

## cli-service

#### Bug Fixes

* disable chunk sorting in html-webpack-plugin ([744c375](https://github.com/vuejs/vue-cli/commit/744c375)), closes [#1669](https://github.com/vuejs/vue-cli/issues/1669)
* **build:** avoid default import warning when lib entry has no default export ([d26cb86](https://github.com/vuejs/vue-cli/commit/d26cb86)), closes [#1641](https://github.com/vuejs/vue-cli/issues/1641)
* **build:** ensure consistent chunk id for async chunks ([db26361](https://github.com/vuejs/vue-cli/commit/db26361)), closes [#1916](https://github.com/vuejs/vue-cli/issues/1916)
* **build:** fix global object when building as lib with async chunks ([369f972](https://github.com/vuejs/vue-cli/commit/369f972)), closes [#1607](https://github.com/vuejs/vue-cli/issues/1607)
* **build:** respect productionSourceMap option for all targets ([dcf9931](https://github.com/vuejs/vue-cli/commit/dcf9931)), closes [#1898](https://github.com/vuejs/vue-cli/issues/1898)
* **dev-server:** pass 2nd argument to devServer.before ([#1854](https://github.com/vuejs/vue-cli/issues/1854)) ([8cdc9d1](https://github.com/vuejs/vue-cli/commit/8cdc9d1)), closes [#1833](https://github.com/vuejs/vue-cli/issues/1833)
* **web-component:** fix multiple wc-async bundles on the same page ([10aa996](https://github.com/vuejs/vue-cli/commit/10aa996)), closes [#1150](https://github.com/vuejs/vue-cli/issues/1150)
#### Features

* add corsUseCredentials option ([30215c2](https://github.com/vuejs/vue-cli/commit/30215c2)), closes [#1867](https://github.com/vuejs/vue-cli/issues/1867)
* Add link to Vue News to bootstrapped component ([#1920](https://github.com/vuejs/vue-cli/issues/1920)) ([098b63e](https://github.com/vuejs/vue-cli/commit/098b63e))
* demonstrate route-level code splitting in generated file ([7d46db9](https://github.com/vuejs/vue-cli/commit/7d46db9)), closes [#1928](https://github.com/vuejs/vue-cli/issues/1928)
* **build:** set output target before configureWebpack, close [#1941](https://github.com/vuejs/vue-cli/issues/1941) ([#1943](https://github.com/vuejs/vue-cli/issues/1943)) ([6c966f4](https://github.com/vuejs/vue-cli/commit/6c966f4))
* **serve:** allow specifying public network url via command line ([ccc90c9](https://github.com/vuejs/vue-cli/commit/ccc90c9))

## cli-shared-utils

#### Bug Fixes

* **ipc:** check connection ([9a8f49e](https://github.com/vuejs/vue-cli/commit/9a8f49e))
#### Performance Improvements

* improve CLI startup performance ([4b4e460](https://github.com/vuejs/vue-cli/commit/4b4e460))

## cli-ui

#### Bug Fixes

* **plugin api:** cwd is not a function [#1876](https://github.com/vuejs/vue-cli/issues/1876) ([#1877](https://github.com/vuejs/vue-cli/issues/1877)) ([24edd93](https://github.com/vuejs/vue-cli/commit/24edd93))
* **plugin api:** task hooks (non-vue cli project) ([0ee1983](https://github.com/vuejs/vue-cli/commit/0ee1983))
* **suggestions:** refresh list when locale changes ([c5ac93e](https://github.com/vuejs/vue-cli/commit/c5ac93e))
* **task:** shell mode (fix `cd`) + more robust error handing ([8e6622f](https://github.com/vuejs/vue-cli/commit/8e6622f))
* **task parameters:** revert to a modal ([d442de2](https://github.com/vuejs/vue-cli/commit/d442de2))
* **tasks:** parameters ([3936dfc](https://github.com/vuejs/vue-cli/commit/3936dfc))
* **tasks:** unset options ([4feddbd](https://github.com/vuejs/vue-cli/commit/4feddbd))
* typo ([ca7ad70](https://github.com/vuejs/vue-cli/commit/ca7ad70))
#### Features

* **task:** save/restore params ([d30475b](https://github.com/vuejs/vue-cli/commit/d30475b))
#### Performance Improvements

* **task:** better perceived perf with display priority ([7761808](https://github.com/vuejs/vue-cli/commit/7761808))

## docs

#### Bug Fixes

* vuepress docs branch ([cc9a6c2](https://github.com/vuejs/vue-cli/commit/cc9a6c2))
#### Features

* **build:** allow specifying chunks in multi-page mode ([8415622](https://github.com/vuejs/vue-cli/commit/8415622)), closes [#1923](https://github.com/vuejs/vue-cli/issues/1923)

## eslint-config-typescript

#### Bug Fixes

* **typescript:** avoid error when using ts + eslint + e2e-nightwatch ([87ad7fc](https://github.com/vuejs/vue-cli/commit/87ad7fc)), closes [#1922](https://github.com/vuejs/vue-cli/issues/1922)
* temporarily disable space-infix-ops for eslint + TS ([fe11774](https://github.com/vuejs/vue-cli/commit/fe11774)), closes [#1672](https://github.com/vuejs/vue-cli/issues/1672)


### BREAKING CHANGES

* `typescript` is now a peer dependency of
`@vue/cli-plugin-typescript`. If you are upgrading from a previous version, you
will need to explicitly install `typescript` in your project.



# [3.0.0-rc.5](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.4...v3.0.0-rc.5) (2018-07-16)

## cli-service

#### Bug Fixes

* **build:** modern plugin when building multi page applications with output in sub directories ([#1866](https://github.com/vuejs/vue-cli/issues/1866)) ([d3d827c](https://github.com/vuejs/vue-cli/commit/d3d827c))

## cli-ui

#### Bug Fixes

* clearer clone preset option ([d589d35](https://github.com/vuejs/vue-cli/commit/d589d35))
* invalidatePackage arguments ([8a09624](https://github.com/vuejs/vue-cli/commit/8a09624))
* plugin file serve issue ([51afe59](https://github.com/vuejs/vue-cli/commit/51afe59))
* remove read-pkg ([7ebaa8a](https://github.com/vuejs/vue-cli/commit/7ebaa8a))
* typo ([5983842](https://github.com/vuejs/vue-cli/commit/5983842))
* update all plugins ([4f910b1](https://github.com/vuejs/vue-cli/commit/4f910b1))
* **deps:** read-pkg not in direct deps, closes [#1846](https://github.com/vuejs/vue-cli/issues/1846) ([9e0b0e1](https://github.com/vuejs/vue-cli/commit/9e0b0e1))
* **serve:** force disable HTTP cache ([1ffcb21](https://github.com/vuejs/vue-cli/commit/1ffcb21))
#### Features

* **project-import:** loading on import button ([25171a5](https://github.com/vuejs/vue-cli/commit/25171a5))



# [3.0.0-rc.4](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.3...v3.0.0-rc.4) (2018-07-13)

## babel-preset-app

#### Bug Fixes

* **babel:** default polyfills need es6.array.iterator for IE ([#1769](https://github.com/vuejs/vue-cli/issues/1769)) ([bda6dea](https://github.com/vuejs/vue-cli/commit/bda6dea)), closes [#1642](https://github.com/vuejs/vue-cli/issues/1642)
* **babel:** set useBuiltins to false during MODERN_BUILD ([#1758](https://github.com/vuejs/vue-cli/issues/1758)) ([f32fdae](https://github.com/vuejs/vue-cli/commit/f32fdae))

## cli

#### Bug Fixes

* Don't allow duplicate injections of import statements and root options by plugins ([#1774](https://github.com/vuejs/vue-cli/issues/1774)) ([8eb7fc3](https://github.com/vuejs/vue-cli/commit/8eb7fc3))
* fix npmignore, prevent version cache from being published ([30dbad8](https://github.com/vuejs/vue-cli/commit/30dbad8))
* generate readme with code blocks ([8e79e2d](https://github.com/vuejs/vue-cli/commit/8e79e2d))
* Restore --offline option for legacy vue init API ([#1605](https://github.com/vuejs/vue-cli/issues/1605)) ([d8b06bb](https://github.com/vuejs/vue-cli/commit/d8b06bb))
* version check ignores cached version. fixes [#1613](https://github.com/vuejs/vue-cli/issues/1613) ([#1614](https://github.com/vuejs/vue-cli/issues/1614)) ([9f0bf08](https://github.com/vuejs/vue-cli/commit/9f0bf08))
#### Features

* **generator:** allow plugins to modify how configs are extracted ([#1130](https://github.com/vuejs/vue-cli/issues/1130)) ([e393be7](https://github.com/vuejs/vue-cli/commit/e393be7))
* Create .browserslistrc file when user chose "separate config files" ([#1773](https://github.com/vuejs/vue-cli/issues/1773)) ([7b3812e](https://github.com/vuejs/vue-cli/commit/7b3812e)), closes [#1236](https://github.com/vuejs/vue-cli/issues/1236)
* Generating README.md ([#1717](https://github.com/vuejs/vue-cli/issues/1717)) ([278e992](https://github.com/vuejs/vue-cli/commit/278e992))

## cli-plugin-e2e-nightwatch

#### Features

* **ui:** Add 'config' and 'env' options to nightwatch ui prompts ([#1646](https://github.com/vuejs/vue-cli/issues/1646)) ([77fc6d9](https://github.com/vuejs/vue-cli/commit/77fc6d9))

## cli-plugin-pwa

#### Features

* **pwa:** added options and updated readme ([#1752](https://github.com/vuejs/vue-cli/issues/1752)) ([050fe2a](https://github.com/vuejs/vue-cli/commit/050fe2a))
* Add robots.txt ([#1715](https://github.com/vuejs/vue-cli/issues/1715)) ([0f9d00e](https://github.com/vuejs/vue-cli/commit/0f9d00e))

## cli-plugin-unit-jest

#### Bug Fixes

* **unit:jest:** issue with Jest configuration regex not matching template. ([#1756](https://github.com/vuejs/vue-cli/issues/1756)) ([47794ae](https://github.com/vuejs/vue-cli/commit/47794ae))

## cli-service

#### Bug Fixes

* **build:** add charset to demo pages, fix [#1765](https://github.com/vuejs/vue-cli/issues/1765) ([#1793](https://github.com/vuejs/vue-cli/issues/1793)) ([3899b52](https://github.com/vuejs/vue-cli/commit/3899b52))
* **modern:** fix the failure of modern build when the output HTML filename contain subdirectories ([78174dc](https://github.com/vuejs/vue-cli/commit/78174dc))
* **modern:** send credentials when loading script modules. ([#1695](https://github.com/vuejs/vue-cli/issues/1695)) ([e2a7063](https://github.com/vuejs/vue-cli/commit/e2a7063))
* avoid using ES6 in code injected into --lib builds ([#1736](https://github.com/vuejs/vue-cli/issues/1736)) ([d601441](https://github.com/vuejs/vue-cli/commit/d601441))
* default html template, closes [#1679](https://github.com/vuejs/vue-cli/issues/1679) ([#1707](https://github.com/vuejs/vue-cli/issues/1707)) ([20bbff0](https://github.com/vuejs/vue-cli/commit/20bbff0))
* Fixed a bug that caused mode to be ignored if run together with watch ([#1700](https://github.com/vuejs/vue-cli/issues/1700)) ([1b1a89f](https://github.com/vuejs/vue-cli/commit/1b1a89f))
* when script has no attributes ([#1628](https://github.com/vuejs/vue-cli/issues/1628)) ([b1331ee](https://github.com/vuejs/vue-cli/commit/b1331ee))
#### Features

* **ui:** improved IpcMessenger with new options ([c2da5fc](https://github.com/vuejs/vue-cli/commit/c2da5fc))

## cli-ui

#### Bug Fixes

* **serve task:** unset host and port default values, closes [#1837](https://github.com/vuejs/vue-cli/issues/1837) ([1ec6cf3](https://github.com/vuejs/vue-cli/commit/1ec6cf3))
* **ui:** (dev) task: reset NODE_ENV ([14f2392](https://github.com/vuejs/vue-cli/commit/14f2392))
* **ui:** add 'projectTypes' to addView api ([be5ec5f](https://github.com/vuejs/vue-cli/commit/be5ec5f))
* **ui:** args dedupe crashing if an arg isn't a string ([6649988](https://github.com/vuejs/vue-cli/commit/6649988))
* **ui:** bus plugin error ([0872781](https://github.com/vuejs/vue-cli/commit/0872781))
* **ui:** chrome bug: grid element overflow ([c167797](https://github.com/vuejs/vue-cli/commit/c167797))
* **ui:** clear client addons on PluginApi reset ([3eb5116](https://github.com/vuejs/vue-cli/commit/3eb5116))
* **ui:** clear webpack stats before run ([6023c2e](https://github.com/vuejs/vue-cli/commit/6023c2e))
* **ui:** cli-service more info link ([701d02a](https://github.com/vuejs/vue-cli/commit/701d02a))
* **ui:** connection banner zindex ([346f95d](https://github.com/vuejs/vue-cli/commit/346f95d))
* **ui:** create: delete folder first, fix [#1627](https://github.com/vuejs/vue-cli/issues/1627) ([5b61f8f](https://github.com/vuejs/vue-cli/commit/5b61f8f))
* **ui:** darkMode lost on cache reset ([b4f6b3c](https://github.com/vuejs/vue-cli/commit/b4f6b3c))
* **ui:** deduplicate task arguments, closes [#1561](https://github.com/vuejs/vue-cli/issues/1561) ([f86597b](https://github.com/vuejs/vue-cli/commit/f86597b))
* **ui:** default tasks regex, closes [#1629](https://github.com/vuejs/vue-cli/issues/1629) ([cb0e646](https://github.com/vuejs/vue-cli/commit/cb0e646))
* **ui:** don't split on '=' ([c8224de](https://github.com/vuejs/vue-cli/commit/c8224de))
* **ui:** dropdown separator color ([e81fc65](https://github.com/vuejs/vue-cli/commit/e81fc65))
* **ui:** error in ProjectTaskDetails ([3000bdf](https://github.com/vuejs/vue-cli/commit/3000bdf))
* **ui:** error in updateQuery handlers on store reset ([92fe96e](https://github.com/vuejs/vue-cli/commit/92fe96e))
* **ui:** file diff netork-only ([48413fa](https://github.com/vuejs/vue-cli/commit/48413fa))
* **ui:** FileDiffView: display error message ([d5a2407](https://github.com/vuejs/vue-cli/commit/d5a2407))
* **ui:** folders on Windows ([4b44509](https://github.com/vuejs/vue-cli/commit/4b44509))
* **ui:** hasPlugin crash ([581e4ec](https://github.com/vuejs/vue-cli/commit/581e4ec))
* **ui:** homepage tooltip ([935f18e](https://github.com/vuejs/vue-cli/commit/935f18e))
* **ui:** identicon in dark mode ([d51f08d](https://github.com/vuejs/vue-cli/commit/d51f08d))
* **ui:** identicon size ([14b7ba7](https://github.com/vuejs/vue-cli/commit/14b7ba7))
* **ui:** more button color when active ([888352a](https://github.com/vuejs/vue-cli/commit/888352a))
* **ui:** package search input focus ([229e81e](https://github.com/vuejs/vue-cli/commit/229e81e))
* **ui:** prevent loading client addons multiple  times ([4683a7f](https://github.com/vuejs/vue-cli/commit/4683a7f))
* **ui:** refactoring and bug fixes ([4b9db7c](https://github.com/vuejs/vue-cli/commit/4b9db7c))
* **ui:** page scrolling ([06e445d](https://github.com/vuejs/vue-cli/commit/06e445d))
* **ui:** PluginApi light mode ([9929b70](https://github.com/vuejs/vue-cli/commit/9929b70))
* **ui:** running task from dropdown if no project is open ([c9f8920](https://github.com/vuejs/vue-cli/commit/c9f8920))
* **ui:** suggestion: actionLink not working ([6c8d220](https://github.com/vuejs/vue-cli/commit/6c8d220))
* **ui:** task arg deduplication with = ([4c96bea](https://github.com/vuejs/vue-cli/commit/4c96bea))
* **ui:** terminal background color in dark mode ([fd92852](https://github.com/vuejs/vue-cli/commit/fd92852))
* **ui:** use separate DB for dev ([841b470](https://github.com/vuejs/vue-cli/commit/841b470))
* **ui:** webpack dashboard fixes ([7a5964d](https://github.com/vuejs/vue-cli/commit/7a5964d))
* **ui:** wrong context for webpack config, closes 1611 ([4c69052](https://github.com/vuejs/vue-cli/commit/4c69052))
#### Features

* **ui:** Dependencies view ([#1740](https://github.com/vuejs/vue-cli/issues/1740)) ([286d75e](https://github.com/vuejs/vue-cli/commit/286d75e))
* **ui:** display task duration ([20b6f4e](https://github.com/vuejs/vue-cli/commit/20b6f4e))
* **ui:** enable Vue devtools ([ad415fa](https://github.com/vuejs/vue-cli/commit/ad415fa))
* **ui:** extract package search into own component ([1143c14](https://github.com/vuejs/vue-cli/commit/1143c14))
* **ui:** folder explorer: better loading indicator ([e5e65cb](https://github.com/vuejs/vue-cli/commit/e5e65cb))
* **ui:** forced theme via URL ([24b9874](https://github.com/vuejs/vue-cli/commit/24b9874))
* **ui:** import non- vue-cli projects ([bf9d30b](https://github.com/vuejs/vue-cli/commit/bf9d30b))
* **ui:** log store reset ([93765c9](https://github.com/vuejs/vue-cli/commit/93765c9))
* **ui:** open project in editor ([7a0cd08](https://github.com/vuejs/vue-cli/commit/7a0cd08))
* **ui:** recent projects in top bar dropdown ([ceccfbf](https://github.com/vuejs/vue-cli/commit/ceccfbf))
* local service plugins, closes [#1841](https://github.com/vuejs/vue-cli/issues/1841) ([0835281](https://github.com/vuejs/vue-cli/commit/0835281))
* **ui:** PluginApi: resolve + getProject ([eca54fc](https://github.com/vuejs/vue-cli/commit/eca54fc))
* **ui:** project homepage ([0199d72](https://github.com/vuejs/vue-cli/commit/0199d72))
* **ui:** projects: search input ([c04f69e](https://github.com/vuejs/vue-cli/commit/c04f69e))
* **ui:** restore webpack stats when switching projects ([657e425](https://github.com/vuejs/vue-cli/commit/657e425))
* **ui:** search fields ([6bc5d72](https://github.com/vuejs/vue-cli/commit/6bc5d72))
* **ui:** tasks dropdown: open task details ([81e5184](https://github.com/vuejs/vue-cli/commit/81e5184))
* vue config command  ([#1554](https://github.com/vuejs/vue-cli/issues/1554)) ([153c418](https://github.com/vuejs/vue-cli/commit/153c418))
* **ui:** tasks overview in projects ([c4f3358](https://github.com/vuejs/vue-cli/commit/c4f3358))
* **ui:** toggle favorite in top bar ([653cc30](https://github.com/vuejs/vue-cli/commit/653cc30))
* **ui:** use 'yarn info' if possible to get package metadata instead of npm.org api (which is slower) ([090c52d](https://github.com/vuejs/vue-cli/commit/090c52d))

## cli-ui-addon-webpack

#### Bug Fixes

* **ui:** build progress bar glitch ([162ab69](https://github.com/vuejs/vue-cli/commit/162ab69))
* **ui:** webpack logo ([c2c5e37](https://github.com/vuejs/vue-cli/commit/c2c5e37))
#### Features

* **ui:** better build progress ([55c2819](https://github.com/vuejs/vue-cli/commit/55c2819))
* **ui:** webpack: build status emphasize errors/warnings ([120be23](https://github.com/vuejs/vue-cli/commit/120be23))

## docs

#### Bug Fixes

* set minimum node version (from mini-css-extract) ([0b66a75](https://github.com/vuejs/vue-cli/commit/0b66a75))
* underscore escaping for dotfiles ([#1737](https://github.com/vuejs/vue-cli/issues/1737)) ([a9aa3de](https://github.com/vuejs/vue-cli/commit/a9aa3de)), closes [#1732](https://github.com/vuejs/vue-cli/issues/1732)
#### Features

* package.json: vuePlugins.resolveFrom option, closes [#1815](https://github.com/vuejs/vue-cli/issues/1815) ([d212dcd](https://github.com/vuejs/vue-cli/commit/d212dcd))
* pages support title option ([#1619](https://github.com/vuejs/vue-cli/issues/1619)) ([6729880](https://github.com/vuejs/vue-cli/commit/6729880))



# [3.0.0-rc.3](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.2...v3.0.0-rc.3) (2018-06-18)

## cli

#### Bug Fixes

* **invoke:** deep merge only plain objects ([a7f3c2c](https://github.com/vuejs/vue-cli/commit/a7f3c2c))
* **invoke:** merge data in config transforms ([35cb714](https://github.com/vuejs/vue-cli/commit/35cb714))
* **invoke:** not reading dot files ([49d56db](https://github.com/vuejs/vue-cli/commit/49d56db))
* better version check, closes [#1564](https://github.com/vuejs/vue-cli/issues/1564) ([8b9477f](https://github.com/vuejs/vue-cli/commit/8b9477f))

## cli-plugin-unit-mocha

#### Features

* **ui:** mocha task ([b0ed1e2](https://github.com/vuejs/vue-cli/commit/b0ed1e2))

## cli-service

#### Bug Fixes

* **ui:** put temp stats files in node_modules ([2a21434](https://github.com/vuejs/vue-cli/commit/2a21434))

## cli-shared-utils

#### Bug Fixes

* **ui:** process exit guard ([29fcee7](https://github.com/vuejs/vue-cli/commit/29fcee7))

## cli-ui

#### Bug Fixes

* **ui:** bail on error reading package.json, closes [#1599](https://github.com/vuejs/vue-cli/issues/1599) ([3ebb104](https://github.com/vuejs/vue-cli/commit/3ebb104))
* **ui:** Config prompts error ([bbc974d](https://github.com/vuejs/vue-cli/commit/bbc974d))
* **ui:** configurations: broken package.json mode, closes [#1598](https://github.com/vuejs/vue-cli/issues/1598) ([5885dd5](https://github.com/vuejs/vue-cli/commit/5885dd5))
* **ui:** create: package manager select ([61662c4](https://github.com/vuejs/vue-cli/commit/61662c4))
* **ui:** folder explorer: better performance + auto scroll to top ([d63cc0d](https://github.com/vuejs/vue-cli/commit/d63cc0d))
* **ui:** folder loading indicator + e2e tests ([6c4ebb0](https://github.com/vuejs/vue-cli/commit/6c4ebb0))
* **ui:** folder path parts style ([123fffa](https://github.com/vuejs/vue-cli/commit/123fffa))
* **ui:** images urls while serving the ui (dev) ([4144efc](https://github.com/vuejs/vue-cli/commit/4144efc))
* **ui:** improved performance ([c378658](https://github.com/vuejs/vue-cli/commit/c378658))
* **ui:** improved remote preset checking ([0ba5e09](https://github.com/vuejs/vue-cli/commit/0ba5e09))
* **ui:** list item hover background more subtle ([a5bb260](https://github.com/vuejs/vue-cli/commit/a5bb260))
* **ui:** more spacing in status bar ([80a847f](https://github.com/vuejs/vue-cli/commit/80a847f))
* **ui:** project create detials: bigger grid gap ([cfed833](https://github.com/vuejs/vue-cli/commit/cfed833))
* **ui:** project creation not reset ([9efdfaf](https://github.com/vuejs/vue-cli/commit/9efdfaf))
* **ui:** remove console.log ([04d76a2](https://github.com/vuejs/vue-cli/commit/04d76a2))
* **ui:** reset webpack.config.js service on correct CWD, closes [#1555](https://github.com/vuejs/vue-cli/issues/1555) ([dc2f8e8](https://github.com/vuejs/vue-cli/commit/dc2f8e8))
* **ui:** task logs performance regression ([0ea3a22](https://github.com/vuejs/vue-cli/commit/0ea3a22))
* **ui:** task logs queue not flushed if not enough logs ([8753971](https://github.com/vuejs/vue-cli/commit/8753971))
* **ui:** terminal dark theme background ([959ea07](https://github.com/vuejs/vue-cli/commit/959ea07))
* **ui:** translate link ([f365767](https://github.com/vuejs/vue-cli/commit/f365767))
* **ui:** tweak prompt style for more spacing ([d5d57fe](https://github.com/vuejs/vue-cli/commit/d5d57fe))
* **ui:** typo ([#1600](https://github.com/vuejs/vue-cli/issues/1600)) ([e261ddb](https://github.com/vuejs/vue-cli/commit/e261ddb))
#### Features

* **ui:** about button in project manager ([a242d73](https://github.com/vuejs/vue-cli/commit/a242d73))
* **ui:** allow partial GraphQL results ([e6d68ca](https://github.com/vuejs/vue-cli/commit/e6d68ca))
* **ui:** basic global error handler ([5566208](https://github.com/vuejs/vue-cli/commit/5566208))
* **ui:** better item logo animation ([22b92ba](https://github.com/vuejs/vue-cli/commit/22b92ba))
* **ui:** folder explorer: better UX + hide hidden folders by default ([545cc3f](https://github.com/vuejs/vue-cli/commit/545cc3f))
* **ui:** folder explorer: change position of error icon ([d62ad77](https://github.com/vuejs/vue-cli/commit/d62ad77))
* **ui:** folder explorer: create new folders ([ccde77c](https://github.com/vuejs/vue-cli/commit/ccde77c))
* **ui:** import project: missing modules modal ([99dc316](https://github.com/vuejs/vue-cli/commit/99dc316))
* **ui:** project create: folder already exists warning ([4d9a092](https://github.com/vuejs/vue-cli/commit/4d9a092))
* **ui:** project manager: back button ([4413dee](https://github.com/vuejs/vue-cli/commit/4413dee))
* **ui:** refresh plugin API button ([c658223](https://github.com/vuejs/vue-cli/commit/c658223))
* **ui:** remote preset support ([7402148](https://github.com/vuejs/vue-cli/commit/7402148))
* **ui:** suggestions animation ([82836f5](https://github.com/vuejs/vue-cli/commit/82836f5))
* **ui:** v-focus directive ([e1a0c4c](https://github.com/vuejs/vue-cli/commit/e1a0c4c))
* **ui:** validate new project folder name ([8957c3a](https://github.com/vuejs/vue-cli/commit/8957c3a))
* **ui:** vue-cli config ([2f0961d](https://github.com/vuejs/vue-cli/commit/2f0961d))



# [3.0.0-rc.2](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.1...v3.0.0-rc.2) (2018-06-14)

## cli

#### Bug Fixes

* **ui:** wrong NODE_ENV value if undefined ([09b72eb](https://github.com/vuejs/vue-cli/commit/09b72eb))

## cli-ui

#### Bug Fixes

* **ui:** sharedData watchers ([f486d7e](https://github.com/vuejs/vue-cli/commit/f486d7e))

## cli-ui-addon-webpack

#### Bug Fixes

* **ui:** wwebpack dashboard performance improvements ([9f5dda4](https://github.com/vuejs/vue-cli/commit/9f5dda4))
#### Features

* **ui:** modern build mode ([dbf7231](https://github.com/vuejs/vue-cli/commit/dbf7231))



# [3.0.0-rc.1](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.16...v3.0.0-rc.1) (2018-06-13)

## babel-preset-app

#### Features

* apply minimal transpilation when building as web component ([3b2cc6b](https://github.com/vuejs/vue-cli/commit/3b2cc6b))

## cli

#### Bug Fixes

* clear children modules from cache ([50027c6](https://github.com/vuejs/vue-cli/commit/50027c6))
* **ui:** CSS Pre-processors "More info" link leads to 404 ([#1534](https://github.com/vuejs/vue-cli/issues/1534)) ([919bcbb](https://github.com/vuejs/vue-cli/commit/919bcbb))
* **ui:** save db in user home ([6e1f735](https://github.com/vuejs/vue-cli/commit/6e1f735))

## cli-plugin-eslint

#### Features

* **ui:** open eslintrc suggestion ([a26669c](https://github.com/vuejs/vue-cli/commit/a26669c))

## cli-plugin-pwa

#### Features

* **ui:** pwa open vue config/manifest suggestions ([e57e749](https://github.com/vuejs/vue-cli/commit/e57e749))

## cli-plugin-unit-jest

#### Bug Fixes

* transform es modules syntax for Jest when not using Babel ([65d5d36](https://github.com/vuejs/vue-cli/commit/65d5d36)), closes [#1524](https://github.com/vuejs/vue-cli/issues/1524)

## cli-plugin-unit-mocha

#### Bug Fixes

* **unit-mocha:** node externals are unnecessary for testing client code ([460c200](https://github.com/vuejs/vue-cli/commit/460c200)), closes [#1548](https://github.com/vuejs/vue-cli/issues/1548)

## cli-service

#### Bug Fixes

* asset output relative check ([1195aee](https://github.com/vuejs/vue-cli/commit/1195aee)), closes [#1545](https://github.com/vuejs/vue-cli/issues/1545)
* fix custom mode NODE_ENV regression ([60de7c4](https://github.com/vuejs/vue-cli/commit/60de7c4)), closes [#1528](https://github.com/vuejs/vue-cli/issues/1528)
* runtimeCompiler default ([e15fa20](https://github.com/vuejs/vue-cli/commit/e15fa20))
* should repsect configureWebpack hooks when resolving app config ([a7564d6](https://github.com/vuejs/vue-cli/commit/a7564d6))
* **build:** --target app should respect inline entry as well ([323a38c](https://github.com/vuejs/vue-cli/commit/323a38c)), closes [#1533](https://github.com/vuejs/vue-cli/issues/1533)
* use devServer.public to build sockjsUrl, if defined. ([#1526](https://github.com/vuejs/vue-cli/issues/1526)) ([f0498f6](https://github.com/vuejs/vue-cli/commit/f0498f6))
#### Features

* modern mode ([204d8f0](https://github.com/vuejs/vue-cli/commit/204d8f0))
* vue-cli-service build --report/--report-json ([272ef5e](https://github.com/vuejs/vue-cli/commit/272ef5e))

## cli-ui

#### Bug Fixes

* **ui:** dark mode nav button badge counters ([0ba3920](https://github.com/vuejs/vue-cli/commit/0ba3920))
* **ui:** bail access denied folders ([5984a0d](https://github.com/vuejs/vue-cli/commit/5984a0d))
* **ui:** create: first feature removed if 'use config files' not checked ([b361473](https://github.com/vuejs/vue-cli/commit/b361473))
* **ui:** improve task logs performance ([36908a9](https://github.com/vuejs/vue-cli/commit/36908a9))
* **ui:** increase terminal output scrollback ([292c35f](https://github.com/vuejs/vue-cli/commit/292c35f))
* **ui:** IPC conflict ([1fcd2d0](https://github.com/vuejs/vue-cli/commit/1fcd2d0))
* **ui:** nav button bullet border color ([aee5c93](https://github.com/vuejs/vue-cli/commit/aee5c93))
* **ui:** nav button custom image align ([99b030a](https://github.com/vuejs/vue-cli/commit/99b030a))
* **ui:** reload plugin api after plugin update ([be3d538](https://github.com/vuejs/vue-cli/commit/be3d538))
* **ui:** reset apollo store on reconnect ([caf31a1](https://github.com/vuejs/vue-cli/commit/caf31a1))
* **ui:** Suggestions API fixes ([e7e2fb2](https://github.com/vuejs/vue-cli/commit/e7e2fb2))
* **ui:** task command too long ([9426f38](https://github.com/vuejs/vue-cli/commit/9426f38))
#### Features

* **ui:** api.hasPlugin(id) ([8fae98e](https://github.com/vuejs/vue-cli/commit/8fae98e))
* **ui:** config improvements ([#1487](https://github.com/vuejs/vue-cli/issues/1487)) ([dbef5e9](https://github.com/vuejs/vue-cli/commit/dbef5e9))
* **ui:** dark mode ([#1512](https://github.com/vuejs/vue-cli/issues/1512)) ([e258f5a](https://github.com/vuejs/vue-cli/commit/e258f5a))
* **ui:** devtools suggestion ([0a2ea1f](https://github.com/vuejs/vue-cli/commit/0a2ea1f))
* **ui:** git commit message + disable git ([#1541](https://github.com/vuejs/vue-cli/issues/1541)) ([29c1ce5](https://github.com/vuejs/vue-cli/commit/29c1ce5))
* **ui:** jest task ([692d463](https://github.com/vuejs/vue-cli/commit/692d463))
* **ui:** new hooks for plugins ([8ba6bcf](https://github.com/vuejs/vue-cli/commit/8ba6bcf))
* **ui:** PluginApi: notify ([e35ee25](https://github.com/vuejs/vue-cli/commit/e35ee25))
* **ui:** status color bullet on tasks with image icon ([9aec563](https://github.com/vuejs/vue-cli/commit/9aec563))
* **ui:** suggestion and progress PluginAPI + add vue-router/vuex suggestions ([9b068b1](https://github.com/vuejs/vue-cli/commit/9b068b1))

## other

#### Bug Fixes

* check more files for links ([182f3b7](https://github.com/vuejs/vue-cli/commit/182f3b7))



# [3.0.0-beta.16](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.15...v3.0.0-beta.16) (2018-06-08)

## babel-preset-app

#### Bug Fixes

* avoid injecting polyfills when targeting node ([586c8aa](https://github.com/vuejs/vue-cli/commit/586c8aa))

## cli

#### Bug Fixes

* avoid util.promisify when resolving webpack.config.js ([89a0e65](https://github.com/vuejs/vue-cli/commit/89a0e65)), closes [#1473](https://github.com/vuejs/vue-cli/issues/1473)
* bail when registry ping fails ([be5526e](https://github.com/vuejs/vue-cli/commit/be5526e)), closes [#1427](https://github.com/vuejs/vue-cli/issues/1427)
* use fallback module resolve for Node version < 10 ([12d51fd](https://github.com/vuejs/vue-cli/commit/12d51fd)), closes [#1486](https://github.com/vuejs/vue-cli/issues/1486)
#### Features

* **xdg-compliance:** rc file location hierarchy ([#1326](https://github.com/vuejs/vue-cli/issues/1326)) ([ec87266](https://github.com/vuejs/vue-cli/commit/ec87266)), closes [#1325](https://github.com/vuejs/vue-cli/issues/1325)

## cli-plugin-e2e-cypress

#### Features

* **e2e-cypress:** upgrade cypress to 3.0 ([a81f7ad](https://github.com/vuejs/vue-cli/commit/a81f7ad)), closes [#1477](https://github.com/vuejs/vue-cli/issues/1477)

## cli-plugin-pwa

#### Bug Fixes

* pwa plugin should be ignored when target is not app ([85e6e5e](https://github.com/vuejs/vue-cli/commit/85e6e5e)), closes [#1497](https://github.com/vuejs/vue-cli/issues/1497)

## cli-plugin-typescript

#### Features

* bump TypeScript to 2.9 ([7b90fdc](https://github.com/vuejs/vue-cli/commit/7b90fdc))
* **lint:** default to lint tsx files  ([#1460](https://github.com/vuejs/vue-cli/issues/1460)) ([838f6a2](https://github.com/vuejs/vue-cli/commit/838f6a2))

## cli-plugin-unit-jest

#### Bug Fixes

* should not inject babel-core shim if babel plugin is not used ([a91d022](https://github.com/vuejs/vue-cli/commit/a91d022)), closes [#1424](https://github.com/vuejs/vue-cli/issues/1424)
#### Features

* upgrade jest to 23.1.0 ([7e38f98](https://github.com/vuejs/vue-cli/commit/7e38f98))

## cli-service

#### Bug Fixes

* fine tune chunk splitting ([4db901c](https://github.com/vuejs/vue-cli/commit/4db901c)), closes [#1488](https://github.com/vuejs/vue-cli/issues/1488)
* fix invoke output ([d65a251](https://github.com/vuejs/vue-cli/commit/d65a251))
* only provide baseUrl fix if baseUrl provided ([#1421](https://github.com/vuejs/vue-cli/issues/1421)) ([af1151a](https://github.com/vuejs/vue-cli/commit/af1151a))
* **build:** default to development mode in build --watch ([#1430](https://github.com/vuejs/vue-cli/issues/1430)) ([3193b0d](https://github.com/vuejs/vue-cli/commit/3193b0d))
* **env:** preserve existing env vars so load in reverse order. ([#1503](https://github.com/vuejs/vue-cli/issues/1503)) ([7c1ef24](https://github.com/vuejs/vue-cli/commit/7c1ef24))
* **serve:** make sockjs url fixed with host ([#1476](https://github.com/vuejs/vue-cli/issues/1476)) ([2cbe373](https://github.com/vuejs/vue-cli/commit/2cbe373))
* **ui:** correct i18n mistake ([#1445](https://github.com/vuejs/vue-cli/issues/1445)) ([dc07315](https://github.com/vuejs/vue-cli/commit/dc07315))
* resolve.symlinks to false so that node_modules exclusion works ([5b4df14](https://github.com/vuejs/vue-cli/commit/5b4df14))
#### Features

* allow configuring css-loader options via css.loaderOptions.css ([7d06f09](https://github.com/vuejs/vue-cli/commit/7d06f09)), closes [#1484](https://github.com/vuejs/vue-cli/issues/1484)
* allow configuring postcss-loader via css.loaderOptions.postcss ([0ba111e](https://github.com/vuejs/vue-cli/commit/0ba111e))
* allow using relative baseUrl ([dc38211](https://github.com/vuejs/vue-cli/commit/dc38211))
* bail when user directly mutate output.publicPath ([1732007](https://github.com/vuejs/vue-cli/commit/1732007))
* **build:** support named exports when building --target lib with js/ts entry ([1dc47eb](https://github.com/vuejs/vue-cli/commit/1dc47eb)), closes [#1436](https://github.com/vuejs/vue-cli/issues/1436)
* **cli-service:** support --no-clean flag ([#1457](https://github.com/vuejs/vue-cli/issues/1457)) ([c19bbff](https://github.com/vuejs/vue-cli/commit/c19bbff)), closes [#1446](https://github.com/vuejs/vue-cli/issues/1446)

## cli-ui

#### Bug Fixes

* **ui:** top bar children margin ([cd88b47](https://github.com/vuejs/vue-cli/commit/cd88b47))
* **ui:** check current project still exists ([251509c](https://github.com/vuejs/vue-cli/commit/251509c))
* **ui:** int loading z-index ([68f273a](https://github.com/vuejs/vue-cli/commit/68f273a))
* **ui:** limit description length in plugin search ([588ad75](https://github.com/vuejs/vue-cli/commit/588ad75))
* **ui:** progress screen z-index ([0366ec3](https://github.com/vuejs/vue-cli/commit/0366ec3))
* **ui:** tests ([bfebc6d](https://github.com/vuejs/vue-cli/commit/bfebc6d))
* **ui:** yarn link [@vue](https://github.com/vue)/ui ([145492b](https://github.com/vuejs/vue-cli/commit/145492b))
#### Code Refactoring

* **ui:** Config & task icons ([#1450](https://github.com/vuejs/vue-cli/issues/1450)) ([1c8f195](https://github.com/vuejs/vue-cli/commit/1c8f195))
#### Features

* ui tweaks & fixes ([#1409](https://github.com/vuejs/vue-cli/issues/1409)) ([7354525](https://github.com/vuejs/vue-cli/commit/7354525))
* **ui:** Display cli-service in plugins view (so it can be upgraded) ([#1422](https://github.com/vuejs/vue-cli/issues/1422)) ([f42632b](https://github.com/vuejs/vue-cli/commit/f42632b))
* **ui:** update all plugin to wanted version button ([#1456](https://github.com/vuejs/vue-cli/issues/1456)) ([98b6d26](https://github.com/vuejs/vue-cli/commit/98b6d26))

## docs

#### Bug Fixes

* Remove duplicated "the" ([#1493](https://github.com/vuejs/vue-cli/issues/1493)) ([6e32164](https://github.com/vuejs/vue-cli/commit/6e32164))


### BREAKING CHANGES

* css.localIdentName has been deprecated. Use
css.loaderOptions.css.localIdentName instead.
* **e2e-cypress:** Cypress has been upgraded to 3.0. See changelog at
https://docs.cypress.io/guides/references/changelog.html
* **build:** When building a js/ts entry file with --target lib, the
library now exposes a Module with both default and named exports. This means
in the UMD build, the default export now needs to be accessed as
`window.yourLib.default`, and in the CommonJS build as
`const yourLib = require('yourLib').default`. If you don't have named exports
and want to retain the previous behavior, you can configure webpack to use
`output.libraryExport: 'default'` in `vue.config.js`.
* **ui:** - `file-icon` for the configurations is removed
- Configuration objects `icon` option changed and is now working differently: you can either use a material icon code or a custom image (see Public static files in the UI Plugin docs).
- Task objects have a new `icon` option wich works exactly the same
- By default, if no icon is provided for either the config or the task, the corresponding vue-cli plugin logo will be used instead (if any).
* jest is upgraded to 23.1.0 with minor breaking changes
but should not affect normal test cases



# [3.0.0-beta.15](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.12...v3.0.0-beta.15) (2018-05-30)

## cli

#### Bug Fixes

* require.resolve fallback on node < 8.10.0 ([#1404](https://github.com/vuejs/vue-cli/issues/1404)) ([ef2ecf5](https://github.com/vuejs/vue-cli/commit/ef2ecf5)), closes [#1369](https://github.com/vuejs/vue-cli/issues/1369)

## cli-plugin-e2e-cypress

#### Bug Fixes

* e2e runner args passing ([05391b6](https://github.com/vuejs/vue-cli/commit/05391b6)), closes [#1393](https://github.com/vuejs/vue-cli/issues/1393)
* remove console.log ([7d98d69](https://github.com/vuejs/vue-cli/commit/7d98d69))

## cli-plugin-typescript

#### Bug Fixes

* **typescript:** avoid including router file when router is not selected ([4d00161](https://github.com/vuejs/vue-cli/commit/4d00161))
#### Performance Improvements

* use importHelpers: true in tsconfig.json ([60f0a0a](https://github.com/vuejs/vue-cli/commit/60f0a0a))

## cli-service

#### Bug Fixes

* **cli-service:** make devBaseUrl work properly in serve command ([#1405](https://github.com/vuejs/vue-cli/issues/1405)) ([04600e6](https://github.com/vuejs/vue-cli/commit/04600e6))
* **unit-mocha:** ensure correct mode for webpack config ([e17f78c](https://github.com/vuejs/vue-cli/commit/e17f78c)), closes [#1389](https://github.com/vuejs/vue-cli/issues/1389)
* fix caching dependency (close [#1384](https://github.com/vuejs/vue-cli/issues/1384)) ([9846cd5](https://github.com/vuejs/vue-cli/commit/9846cd5))
#### Features

* respect baseUrl during development ([a9e1286](https://github.com/vuejs/vue-cli/commit/a9e1286))

## cli-ui

#### Bug Fixes

* **ui:** add missing dependency ([3bcc511](https://github.com/vuejs/vue-cli/commit/3bcc511))
* **ui:** fix beta.12 feedback ([#1386](https://github.com/vuejs/vue-cli/issues/1386)) ([a3b2be8](https://github.com/vuejs/vue-cli/commit/a3b2be8))
* UI fixes ([#1397](https://github.com/vuejs/vue-cli/issues/1397)) ([4f39461](https://github.com/vuejs/vue-cli/commit/4f39461))

## docs

#### Features

* add --copy option for vue-cli-service serve ([#1355](https://github.com/vuejs/vue-cli/issues/1355)) ([5e95b3d](https://github.com/vuejs/vue-cli/commit/5e95b3d))


### BREAKING CHANGES

* `devBaseUrl` option has been removed. `baseUrl` now works for
both development and production. To use different paths for prod/dev, use
conditional values based on `process.env.NODE_ENV` in `vue.config.js`.



# [3.0.0-beta.12](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.11...v3.0.0-beta.12) (2018-05-29)

## cli-plugin-babel

#### Performance Improvements

* adjust caching and parallelization ([1075576](https://github.com/vuejs/vue-cli/commit/1075576))
* revert babel/ts thread behavior ([e5101b4](https://github.com/vuejs/vue-cli/commit/e5101b4))

## cli-plugin-eslint

#### Bug Fixes

* **ui:** eslint lint on save default ([0f30639](https://github.com/vuejs/vue-cli/commit/0f30639))

## cli-plugin-pwa

#### Bug Fixes

* **ui:** pwa config: manifest.json indentation ([27e66a8](https://github.com/vuejs/vue-cli/commit/27e66a8))

## cli-plugin-typescript

#### Bug Fixes

* **typescript:** ensure ts-loader options can be stringified for thread-loader ([023e022](https://github.com/vuejs/vue-cli/commit/023e022)), closes [#1367](https://github.com/vuejs/vue-cli/issues/1367)
* **ui:** tsconfig ([7482244](https://github.com/vuejs/vue-cli/commit/7482244))

## cli-service

#### Bug Fixes

* **build:** only modify css extraction if its enabled ([9a4159d](https://github.com/vuejs/vue-cli/commit/9a4159d)), closes [#1378](https://github.com/vuejs/vue-cli/issues/1378)
* make umd build usable in Node ([c12f240](https://github.com/vuejs/vue-cli/commit/c12f240)), closes [#1348](https://github.com/vuejs/vue-cli/issues/1348)
#### Code Refactoring

* compiler -> runtimeCompiler ([ebffdf0](https://github.com/vuejs/vue-cli/commit/ebffdf0))
#### Features

* make public dir optional ([1719622](https://github.com/vuejs/vue-cli/commit/1719622)), closes [#1265](https://github.com/vuejs/vue-cli/issues/1265)
* re-introduce css.modules option ([1e98d96](https://github.com/vuejs/vue-cli/commit/1e98d96))
* support multi-page app via `pages` option ([869f005](https://github.com/vuejs/vue-cli/commit/869f005))
* tweak css extraction chunk name ([f0fd375](https://github.com/vuejs/vue-cli/commit/f0fd375))
#### Performance Improvements

* enable vue-loader template compilation caching ([8fe554c](https://github.com/vuejs/vue-cli/commit/8fe554c))

## cli-ui

#### Bug Fixes

* **ui:** chdir ([133cdfb](https://github.com/vuejs/vue-cli/commit/133cdfb))
* **ui:** env var names ([207a630](https://github.com/vuejs/vue-cli/commit/207a630))
* **ui:** force output colors ([4d0b690](https://github.com/vuejs/vue-cli/commit/4d0b690))
* **ui:** mock install/uninstall in debug mode ([e759b2c](https://github.com/vuejs/vue-cli/commit/e759b2c))
* **ui:** task terminated status on Windows ([ea95c52](https://github.com/vuejs/vue-cli/commit/ea95c52))
* **ui:** use debug mode ([24d5e7b](https://github.com/vuejs/vue-cli/commit/24d5e7b))
* **ui:** watch only locales folder if exists ([73a1c7a](https://github.com/vuejs/vue-cli/commit/73a1c7a))
* **ui:** webpack error after creating a new project ([1c95dc2](https://github.com/vuejs/vue-cli/commit/1c95dc2))
* **ui:** Windows compat ([bf76950](https://github.com/vuejs/vue-cli/commit/bf76950))
* **ui:** wrong env var name ([12129b3](https://github.com/vuejs/vue-cli/commit/12129b3))
* use mode development ([94de904](https://github.com/vuejs/vue-cli/commit/94de904))
#### Features

* **ui:** auto clean projects list ([d2a9d0f](https://github.com/vuejs/vue-cli/commit/d2a9d0f))
* **ui:** update to latest vue-cli-plugin-apollo ([873d14d](https://github.com/vuejs/vue-cli/commit/873d14d))


### BREAKING CHANGES

* `compiler` option has been renamed to `runtimeCompiler`
* internal webpack rules for CSS have been changed.



# [3.0.0-beta.11](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.10...v3.0.0-beta.11) (2018-05-21)

## cli

#### Bug Fixes

* fix transpileDependencies by always using babel.config.js ([1279b3e](https://github.com/vuejs/vue-cli/commit/1279b3e))
* handle failed git commit ([a1ccde8](https://github.com/vuejs/vue-cli/commit/a1ccde8)), closes [#1306](https://github.com/vuejs/vue-cli/issues/1306)
* stringifyJS should be used in all call sites ([07ac887](https://github.com/vuejs/vue-cli/commit/07ac887))
* **ui:** vue inspect localization ([9c17e2a](https://github.com/vuejs/vue-cli/commit/9c17e2a))
* **ui:** wrong import ([b220b18](https://github.com/vuejs/vue-cli/commit/b220b18))
#### Features

* **inspect:** add --rule and --plugin options for inspect command ([82349ba](https://github.com/vuejs/vue-cli/commit/82349ba))
* **inspect:** add --rules and --plugins options for inspect command ([fd1c0d5](https://github.com/vuejs/vue-cli/commit/fd1c0d5))
* ask for whether to use taobao registry when getting versions ([#1273](https://github.com/vuejs/vue-cli/issues/1273)) ([8fbbd35](https://github.com/vuejs/vue-cli/commit/8fbbd35))
* **ui:** babel feature description ([7e5bf61](https://github.com/vuejs/vue-cli/commit/7e5bf61))
* GeneratorAPI: addImports & addRootOptions ([8b32f4a](https://github.com/vuejs/vue-cli/commit/8b32f4a))
* make it possible to opt-out of Babel ([d75ea99](https://github.com/vuejs/vue-cli/commit/d75ea99)), closes [#1199](https://github.com/vuejs/vue-cli/issues/1199)

## cli-plugin-babel

#### Features

* temporarily fix source map by patching babel ([453597a](https://github.com/vuejs/vue-cli/commit/453597a))

## cli-plugin-e2e-cypress

#### Bug Fixes

* **ui:** more strings now localized ([69a817e](https://github.com/vuejs/vue-cli/commit/69a817e))
#### Features

* **ui:** cypress task ([7ecbd2a](https://github.com/vuejs/vue-cli/commit/7ecbd2a))

## cli-plugin-e2e-nightwatch

#### Features

* **ui:** nightwatch task ([76f95c8](https://github.com/vuejs/vue-cli/commit/76f95c8))

## cli-plugin-eslint

#### Bug Fixes

* **eslint:** ensure all config values are contained in config file ([83f5f4f](https://github.com/vuejs/vue-cli/commit/83f5f4f)), closes [#1006](https://github.com/vuejs/vue-cli/issues/1006) [#1313](https://github.com/vuejs/vue-cli/issues/1313)
#### Features

* **eslint:** add --max-warnings and --max-errors for cli-plugin-eslint ([#1289](https://github.com/vuejs/vue-cli/issues/1289)) ([ab877a2](https://github.com/vuejs/vue-cli/commit/ab877a2)), closes [#1268](https://github.com/vuejs/vue-cli/issues/1268)
* **eslint:** enable caching ([ff0f97b](https://github.com/vuejs/vue-cli/commit/ff0f97b))
* **eslint:** pass cli arguments to linter ([#1258](https://github.com/vuejs/vue-cli/issues/1258)) ([9ac2642](https://github.com/vuejs/vue-cli/commit/9ac2642)), closes [#1255](https://github.com/vuejs/vue-cli/issues/1255)

## cli-plugin-typescript

#### Bug Fixes

* fix ts/tsx rule separation ([41a56f1](https://github.com/vuejs/vue-cli/commit/41a56f1)), closes [#1315](https://github.com/vuejs/vue-cli/issues/1315)

## cli-plugin-unit-jest

#### Bug Fixes

* fix babel.config.js compat in vue-jest ([48d7e00](https://github.com/vuejs/vue-cli/commit/48d7e00))
* rename test-utils `shallow` to `shallowMount` ([#1269](https://github.com/vuejs/vue-cli/issues/1269)) ([5c54df7](https://github.com/vuejs/vue-cli/commit/5c54df7))

## cli-service

#### Bug Fixes

* **css:** css-loader importLoaders should account for vue-loader's injected ([853662c](https://github.com/vuejs/vue-cli/commit/853662c)), closes [#1267](https://github.com/vuejs/vue-cli/issues/1267)
* css sourceMap in production ([#1270](https://github.com/vuejs/vue-cli/issues/1270)) ([2d09a4c](https://github.com/vuejs/vue-cli/commit/2d09a4c))
* **ui:** upgrade DashboardPlugin to webpack 4 ([107f471](https://github.com/vuejs/vue-cli/commit/107f471))
* typo in vue-loader compilerOptions ([#1263](https://github.com/vuejs/vue-cli/issues/1263)) ([b2b277a](https://github.com/vuejs/vue-cli/commit/b2b277a))
#### Features

* **cli-service:** add assetsDir option to specify assets root directory ([#1322](https://github.com/vuejs/vue-cli/issues/1322)) ([9638d90](https://github.com/vuejs/vue-cli/commit/9638d90)), closes [#1311](https://github.com/vuejs/vue-cli/issues/1311)
* **inspect:** improve `vue inspect` output with webpack-chain hints ([f6bfb63](https://github.com/vuejs/vue-cli/commit/f6bfb63)), closes [#881](https://github.com/vuejs/vue-cli/issues/881)
* **ui:** add build watch parameter ([c6f2eea](https://github.com/vuejs/vue-cli/commit/c6f2eea))
* allow disabling serve progress via devServer.progress ([da38747](https://github.com/vuejs/vue-cli/commit/da38747)), closes [#1284](https://github.com/vuejs/vue-cli/issues/1284)
* allow router/vuex to be late added via `vue add` ([2a195f0](https://github.com/vuejs/vue-cli/commit/2a195f0)), closes [#1202](https://github.com/vuejs/vue-cli/issues/1202) [#1204](https://github.com/vuejs/vue-cli/issues/1204)
* support `<style lang="postcss">` ([#1259](https://github.com/vuejs/vue-cli/issues/1259)) ([1037b9c](https://github.com/vuejs/vue-cli/commit/1037b9c))
* support webp ([763cf7a](https://github.com/vuejs/vue-cli/commit/763cf7a)), closes [#1321](https://github.com/vuejs/vue-cli/issues/1321)

## cli-ui

#### Bug Fixes

* **ui:** client addon config ([0627609](https://github.com/vuejs/vue-cli/commit/0627609))
* **ui:** config: create first file if no file exists ([017e7b9](https://github.com/vuejs/vue-cli/commit/017e7b9))
* **ui:** config: more info bottom button style ([62609b9](https://github.com/vuejs/vue-cli/commit/62609b9))
* **ui:** eslint no-console warnings ([d4f41fc](https://github.com/vuejs/vue-cli/commit/d4f41fc))
* **ui:** more strings localized ([7f7374b](https://github.com/vuejs/vue-cli/commit/7f7374b))
* **ui:** prevent duplicate views ([e011bc0](https://github.com/vuejs/vue-cli/commit/e011bc0))
* terminated from warn to info ([3c78d90](https://github.com/vuejs/vue-cli/commit/3c78d90))
* **ui:** prompt confirm checked ([3426736](https://github.com/vuejs/vue-cli/commit/3426736))
* **ui:** prompt input being reset by lagging sync ([bafcaae](https://github.com/vuejs/vue-cli/commit/bafcaae))
* **ui:** prompt regression ([81a5afb](https://github.com/vuejs/vue-cli/commit/81a5afb))
* **ui:** remove console.log ([eab3c11](https://github.com/vuejs/vue-cli/commit/eab3c11))
#### Features

* **ui:** api.addTask() ([215cc20](https://github.com/vuejs/vue-cli/commit/215cc20))
* **ui:** auto select features ([0181223](https://github.com/vuejs/vue-cli/commit/0181223))
* **ui:** project create error ([2f94a85](https://github.com/vuejs/vue-cli/commit/2f94a85))
* **ui:** prompt type 'color' ([3742e65](https://github.com/vuejs/vue-cli/commit/3742e65))
* **ui:** task params modal info ([6661a13](https://github.com/vuejs/vue-cli/commit/6661a13))

## cli-ui-addon-webpack

#### Bug Fixes

* **ui:** eslint no-console warnings ([e777a16](https://github.com/vuejs/vue-cli/commit/e777a16))

## docs

#### Features

* **build:** add 'watch' option ([#1332](https://github.com/vuejs/vue-cli/issues/1332)) ([6ea17c9](https://github.com/vuejs/vue-cli/commit/6ea17c9))



# [3.0.0-beta.10](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.9...v3.0.0-beta.10) (2018-05-11)

## babel-preset-app

#### Features

* **babel:** better Babel polyfill defaults ([4e7d57f](https://github.com/vuejs/vue-cli/commit/4e7d57f))

## cli

#### Bug Fixes

* **ui:** missing cross-env ([eb9a604](https://github.com/vuejs/vue-cli/commit/eb9a604))
* **ui:** New update available message adapted ([1b77f51](https://github.com/vuejs/vue-cli/commit/1b77f51))
* **ui:** removed builtin japan locale ([77f0034](https://github.com/vuejs/vue-cli/commit/77f0034))
* **ui:** ui command: display URL ([aa2783d](https://github.com/vuejs/vue-cli/commit/aa2783d))
#### Features

* default preset save to no ([ab90d50](https://github.com/vuejs/vue-cli/commit/ab90d50)), closes [#1212](https://github.com/vuejs/vue-cli/issues/1212)
* **cli:** allow local .json files for presets ([#1201](https://github.com/vuejs/vue-cli/issues/1201)) ([9766db1](https://github.com/vuejs/vue-cli/commit/9766db1)), closes [#1068](https://github.com/vuejs/vue-cli/issues/1068)
* **ui:** dev mode ([fef2f78](https://github.com/vuejs/vue-cli/commit/fef2f78))
* support { prompts: true } for preset plugins ([3dd38da](https://github.com/vuejs/vue-cli/commit/3dd38da)), closes [#952](https://github.com/vuejs/vue-cli/issues/952)

## cli-plugin-eslint

#### Bug Fixes

* **ui:** remove eslint disable comment ([3b7f292](https://github.com/vuejs/vue-cli/commit/3b7f292))

## cli-plugin-pwa

#### Bug Fixes

* **ui:** App name prompt description ([b6928a3](https://github.com/vuejs/vue-cli/commit/b6928a3))
* pwa plugin compat with webpack 4 ([6d1716e](https://github.com/vuejs/vue-cli/commit/6d1716e))
#### Code Refactoring

* require Node 8 ([6b865db](https://github.com/vuejs/vue-cli/commit/6b865db))

## cli-plugin-typescript

#### Bug Fixes

* **tslint:** don't change working directory ([#1225](https://github.com/vuejs/vue-cli/issues/1225)) ([8dbe262](https://github.com/vuejs/vue-cli/commit/8dbe262))
* **typescript:** add node_modules/** to tslint default excludes ([#1200](https://github.com/vuejs/vue-cli/issues/1200)) ([a6e47ce](https://github.com/vuejs/vue-cli/commit/a6e47ce)), closes [#1194](https://github.com/vuejs/vue-cli/issues/1194)
* **typescript:** separate tsx shim ([51c8090](https://github.com/vuejs/vue-cli/commit/51c8090)), closes [#1198](https://github.com/vuejs/vue-cli/issues/1198)
#### Features

* **typescript:** support lang="tsx" in vue files ([718ba3c](https://github.com/vuejs/vue-cli/commit/718ba3c)), closes [#1219](https://github.com/vuejs/vue-cli/issues/1219)
* relex transpile includes + new transpileDependencies option ([da4d0b2](https://github.com/vuejs/vue-cli/commit/da4d0b2))

## cli-plugin-unit-jest

#### Code Refactoring

* rename test commands ([69ebd80](https://github.com/vuejs/vue-cli/commit/69ebd80)), closes [#876](https://github.com/vuejs/vue-cli/issues/876) [#878](https://github.com/vuejs/vue-cli/issues/878)

## cli-service

#### Bug Fixes

* **build:** fix --dest flag regression ([fd9d255](https://github.com/vuejs/vue-cli/commit/fd9d255)), closes [#1193](https://github.com/vuejs/vue-cli/issues/1193)
* **serve:** fix non-GET requests match error w/ multi-proxy config ([c4c4bff](https://github.com/vuejs/vue-cli/commit/c4c4bff)), closes [#1210](https://github.com/vuejs/vue-cli/issues/1210)
* css imports from js ([1b5bdde](https://github.com/vuejs/vue-cli/commit/1b5bdde))
* ensure dynamic publicPath is set early in lib/wc mode ([c3d246f](https://github.com/vuejs/vue-cli/commit/c3d246f)), closes [#1253](https://github.com/vuejs/vue-cli/issues/1253)
* improve error message when entry is missing w/ --target lib ([8b4a112](https://github.com/vuejs/vue-cli/commit/8b4a112)), closes [#1051](https://github.com/vuejs/vue-cli/issues/1051)
* respect chunk name in all build targets ([66bab8c](https://github.com/vuejs/vue-cli/commit/66bab8c)), closes [#1251](https://github.com/vuejs/vue-cli/issues/1251)
#### Code Refactoring

* adjust mode loading order ([d595ada](https://github.com/vuejs/vue-cli/commit/d595ada)), closes [#959](https://github.com/vuejs/vue-cli/issues/959)
#### Features

* **serve:** support entry in `vue-cli-service serve` ([05f9f3a](https://github.com/vuejs/vue-cli/commit/05f9f3a)), closes [#974](https://github.com/vuejs/vue-cli/issues/974)
* expose env variables as root level in index.html template ([4c5784d](https://github.com/vuejs/vue-cli/commit/4c5784d))
* new option "preserveWhitespace" ([ea83441](https://github.com/vuejs/vue-cli/commit/ea83441))
* remove DLL option ([6d4e51d](https://github.com/vuejs/vue-cli/commit/6d4e51d))
* upgrade to vue-loader 15 ([f5c0f58](https://github.com/vuejs/vue-cli/commit/f5c0f58))
* upgrade to webpack 4 ([2dcdedd](https://github.com/vuejs/vue-cli/commit/2dcdedd))
#### Reverts

* feat: new option "preserveWhitespace"" ([a8af883](https://github.com/vuejs/vue-cli/commit/a8af883))

## cli-ui

#### Bug Fixes

* **ui:** bump fs-extra ([adce5f0](https://github.com/vuejs/vue-cli/commit/adce5f0))
* **ui:** client addon config ([086b714](https://github.com/vuejs/vue-cli/commit/086b714))
* **ui:** CSS fixes ([5b5d754](https://github.com/vuejs/vue-cli/commit/5b5d754))
* **ui:** display tooltip on config list items in case description is too long ([a55cec7](https://github.com/vuejs/vue-cli/commit/a55cec7))
* **ui:** don't save loader results into cache ([3208844](https://github.com/vuejs/vue-cli/commit/3208844))
* **ui:** eslint errors ([3433658](https://github.com/vuejs/vue-cli/commit/3433658))
* **ui:** merge locales ([ae552a9](https://github.com/vuejs/vue-cli/commit/ae552a9))
* **ui:** missing log ([c135782](https://github.com/vuejs/vue-cli/commit/c135782))
* **ui:** moved watch to deps ([013a903](https://github.com/vuejs/vue-cli/commit/013a903))
* **ui:** open project: check if folder exists ([0e8e0ce](https://github.com/vuejs/vue-cli/commit/0e8e0ce))
* **ui:** project create change folder not working in Firefox ([2927095](https://github.com/vuejs/vue-cli/commit/2927095))
* **ui:** ProjectNav wide style tweaks ([3589818](https://github.com/vuejs/vue-cli/commit/3589818))
* **ui:** ProjectNavButton bullet position in wide mode ([9a852d6](https://github.com/vuejs/vue-cli/commit/9a852d6))
* **ui:** ProjectNavMore wide ([28558ea](https://github.com/vuejs/vue-cli/commit/28558ea))
* **ui:** remove unused script ([4f3337d](https://github.com/vuejs/vue-cli/commit/4f3337d))
* **ui:** unhandled auto project open error ([5b232f9](https://github.com/vuejs/vue-cli/commit/5b232f9))
* **ui:** unset last opened project if it is removed ([29e2d76](https://github.com/vuejs/vue-cli/commit/29e2d76))
* **ui:** use fs-extra instead of mkdirp ([8915a6f](https://github.com/vuejs/vue-cli/commit/8915a6f))
* **ui:** wide project nav buttons alignment ([855cbea](https://github.com/vuejs/vue-cli/commit/855cbea))
#### Features

* **ui:** config more info button ([98f6a16](https://github.com/vuejs/vue-cli/commit/98f6a16))
* **ui:** db click on task to run ([104aba2](https://github.com/vuejs/vue-cli/commit/104aba2))
* **ui:** dev: auto reload locales ([86c9674](https://github.com/vuejs/vue-cli/commit/86c9674))
* **ui:** ItemLogo recognize images in 'icon' field ([9898dc0](https://github.com/vuejs/vue-cli/commit/9898dc0))
* **ui:** PWA config + ESLint extra config ([2eac8ff](https://github.com/vuejs/vue-cli/commit/2eac8ff))
* **ui:** localize report bug button ([f32222f](https://github.com/vuejs/vue-cli/commit/f32222f))
* **ui:** plugin locales ([a66dabb](https://github.com/vuejs/vue-cli/commit/a66dabb))
* **ui:** ShareData two-way sync + watchSharedData + storage API + dev logs ([4cb15f3](https://github.com/vuejs/vue-cli/commit/4cb15f3))

## cli-ui-addon-webpack

#### Bug Fixes

* **ui:** eslint warnings ([9d87b35](https://github.com/vuejs/vue-cli/commit/9d87b35))
* deps cleanup ([46a559f](https://github.com/vuejs/vue-cli/commit/46a559f))

## docs

#### Features

* **ui:** JS config support ([8711636](https://github.com/vuejs/vue-cli/commit/8711636))


### BREAKING CHANGES

* `css.modules` option has been removed. To import css files (or
any other supported pre-processor files) as CSS Modules, append the request
with a `?module` resourceQuery.
* Upgrade wepback 4, all webpack option
modifications must be webpcak 4 compatible. Drop support
for webpack plugins that do not work with v4 or above.
* dll option has been removed.
* the "vueLoader" option has been removed. To modify vue-loader
options, use chainWebpack then `config.module.rule(vue).use(vue-loader).tap()`.
vue-loader has been upgraded to v15 and expects different options from v14.
* To include a dependency for Babel transpilation, tapping
babel-loader and adding .include() will no longer work. Use the new
transpileDependencies option instead.
* `cli-plugin-unit-jest` and `cli-plugin-unit-mocha` now register
"test:unit" command and script instead of "test"; `cli-plugin-e2e-cypress` now
register "test:e2e" with optional `--headless` flag instead of "e2e" and
"e2e:open"; `cli-plugin-e2e-nightwatch` now register "test:e2e" instead of "e2e".
* PluginAPI.setMode() has been removed. Instead, for a plugin to
sepcify the default mode for a registered command, the plugins should expose
`module.exports.defaultModes` in the form of `{ [commandName]: mode }`.
* @vue/cli-service and all plugins now require Node version 8+.



# [3.0.0-beta.9](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.8...v3.0.0-beta.9) (2018-04-28)

## cli

#### Bug Fixes

* **dependencies:** add deepmerge dependencies ([#1188](https://github.com/vuejs/vue-cli/issues/1188)) ([67fa39d](https://github.com/vuejs/vue-cli/commit/67fa39d)), closes [#1187](https://github.com/vuejs/vue-cli/issues/1187)

## cli-ui

#### Features

* **ui:** ProjectNav: display labels when screen is wide ([0340dee](https://github.com/vuejs/vue-cli/commit/0340dee))



# [3.0.0-beta.8](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.7...v3.0.0-beta.8) (2018-04-27)

## babel-preset-app

#### Features

* **babel:** expose loose option ([7a125d4](https://github.com/vuejs/vue-cli/commit/7a125d4))

## cli

#### Bug Fixes

* avoid emoji length problem in update log (close [#835](https://github.com/vuejs/vue-cli/issues/835)) ([fb7ccb6](https://github.com/vuejs/vue-cli/commit/fb7ccb6))
* **cli:** fix invoke glob node_modules ignore pattern ([#1004](https://github.com/vuejs/vue-cli/issues/1004)) ([708cde9](https://github.com/vuejs/vue-cli/commit/708cde9))
* deep merge objects when extending package.json via plugins ([#1070](https://github.com/vuejs/vue-cli/issues/1070)) ([6af7bbe](https://github.com/vuejs/vue-cli/commit/6af7bbe)), closes [#1053](https://github.com/vuejs/vue-cli/issues/1053)
* validate project name ([#1039](https://github.com/vuejs/vue-cli/issues/1039)) ([78ed155](https://github.com/vuejs/vue-cli/commit/78ed155)), closes [#1024](https://github.com/vuejs/vue-cli/issues/1024)
* vue invoke should delete renamed/removed files ([#1049](https://github.com/vuejs/vue-cli/issues/1049)) ([c648301](https://github.com/vuejs/vue-cli/commit/c648301))
#### Features

* **cli:** skip git if already in a git repo, add --skipGit option ([23480ae](https://github.com/vuejs/vue-cli/commit/23480ae)), closes [#967](https://github.com/vuejs/vue-cli/issues/967)
* **inspect:** add a -v/--verbose flag to inspect command to output full functions ([#1175](https://github.com/vuejs/vue-cli/issues/1175)) ([6ca86aa](https://github.com/vuejs/vue-cli/commit/6ca86aa)), closes [#1157](https://github.com/vuejs/vue-cli/issues/1157)
* support custom initial commit message ([#1116](https://github.com/vuejs/vue-cli/issues/1116)) ([11ccf64](https://github.com/vuejs/vue-cli/commit/11ccf64))
* **plugin-api:** allow non-semver versioned dependencies ([#1184](https://github.com/vuejs/vue-cli/issues/1184)) ([0f76b8e](https://github.com/vuejs/vue-cli/commit/0f76b8e)), closes [#1177](https://github.com/vuejs/vue-cli/issues/1177)
* allow specifying proxy when creating project ([b1512be](https://github.com/vuejs/vue-cli/commit/b1512be)), closes [#1009](https://github.com/vuejs/vue-cli/issues/1009)

## cli-plugin-babel

#### Bug Fixes

* **typescript,babel:** tests path for babel and typescript plugins ([#1058](https://github.com/vuejs/vue-cli/issues/1058)) ([b285b0b](https://github.com/vuejs/vue-cli/commit/b285b0b))

## cli-plugin-e2e-nightwatch

#### Features

* **e2e-nightwatch:** allow using custom config via --config flag ([#1016](https://github.com/vuejs/vue-cli/issues/1016)) ([e4d67d6](https://github.com/vuejs/vue-cli/commit/e4d67d6))

## cli-plugin-eslint

#### Bug Fixes

* **eslint:** fix --no-fix flag when linting with typescript plugin ([#1115](https://github.com/vuejs/vue-cli/issues/1115)) ([83171e4](https://github.com/vuejs/vue-cli/commit/83171e4))
* include test -> tests for eslint-loader ([3d29458](https://github.com/vuejs/vue-cli/commit/3d29458))

## cli-plugin-pwa

#### Features

* **pwa:** Make injected meta tags configurable and change defaults ([#961](https://github.com/vuejs/vue-cli/issues/961)) ([36f954b](https://github.com/vuejs/vue-cli/commit/36f954b))

## cli-plugin-typescript

#### Bug Fixes

* **typescript:** fix invalid tsconfig.json ([#1036](https://github.com/vuejs/vue-cli/issues/1036)) ([c49eeb7](https://github.com/vuejs/vue-cli/commit/c49eeb7))
#### Features

* **typescript:** improve tsx support ([#1168](https://github.com/vuejs/vue-cli/issues/1168)) ([3aa3743](https://github.com/vuejs/vue-cli/commit/3aa3743))

## cli-plugin-unit-jest

#### Bug Fixes

* allow user to define testMatch in package.json ([#1069](https://github.com/vuejs/vue-cli/issues/1069)) ([cac18f2](https://github.com/vuejs/vue-cli/commit/cac18f2)), closes [#1067](https://github.com/vuejs/vue-cli/issues/1067)
* **unit-jest:** handle static asset imports ([#1180](https://github.com/vuejs/vue-cli/issues/1180)) ([be3bede](https://github.com/vuejs/vue-cli/commit/be3bede))

## cli-service

#### Bug Fixes

* --target lib/wc should overwrite user entry/output ([92e136a](https://github.com/vuejs/vue-cli/commit/92e136a)), closes [#1072](https://github.com/vuejs/vue-cli/issues/1072)
* add name to chunk file output ([#1173](https://github.com/vuejs/vue-cli/issues/1173)) ([1fc9593](https://github.com/vuejs/vue-cli/commit/1fc9593))
* **build:** copy plugin should be loaded in all cases ([87892a5](https://github.com/vuejs/vue-cli/commit/87892a5)), closes [#1073](https://github.com/vuejs/vue-cli/issues/1073)
* **build-wc:** honor custom component name for single file wc builds ([#1182](https://github.com/vuejs/vue-cli/issues/1182)) ([2b236e0](https://github.com/vuejs/vue-cli/commit/2b236e0)), closes [#1146](https://github.com/vuejs/vue-cli/issues/1146)
* **cli-service:** should not add a leading slash to baseUrl when it is absolute ([#1172](https://github.com/vuejs/vue-cli/issues/1172)) ([abb82ab](https://github.com/vuejs/vue-cli/commit/abb82ab)), closes [#1084](https://github.com/vuejs/vue-cli/issues/1084)
* **serve:** don't set header origin if using an agent ([#1179](https://github.com/vuejs/vue-cli/issues/1179)) ([79bc088](https://github.com/vuejs/vue-cli/commit/79bc088))
* **ui:** analyze bundle error handling ([d5d0b76](https://github.com/vuejs/vue-cli/commit/d5d0b76))
* **ui:** DashboardPlugin clean up ([0ac38da](https://github.com/vuejs/vue-cli/commit/0ac38da))
* **ui:** max listeners error ([d5a3b1f](https://github.com/vuejs/vue-cli/commit/d5a3b1f))
* **ui:** open when server is ready ([602be03](https://github.com/vuejs/vue-cli/commit/602be03))
* **ui:** remove ui from built in plugin list ([2c7c63e](https://github.com/vuejs/vue-cli/commit/2c7c63e))
* **ui:** serve disconnect IPC after first run ([6bb64a9](https://github.com/vuejs/vue-cli/commit/6bb64a9))
* **ui:** undefined sources error ([14881ee](https://github.com/vuejs/vue-cli/commit/14881ee))
* css.extract options handling ([8e72943](https://github.com/vuejs/vue-cli/commit/8e72943)), closes [#1061](https://github.com/vuejs/vue-cli/issues/1061)
* **ui:** vue ui command moved from cli-service to cli ([8ebdb05](https://github.com/vuejs/vue-cli/commit/8ebdb05))
* pass all parameters to onProxyReq in proxy configuration ([#1083](https://github.com/vuejs/vue-cli/issues/1083)) ([65ee2fa](https://github.com/vuejs/vue-cli/commit/65ee2fa))
#### Features

* warn when user modifies output.path directly ([81d29ab](https://github.com/vuejs/vue-cli/commit/81d29ab))

## cli-ui

#### Bug Fixes

* **ui:** CSS fixes ([eb1c7e9](https://github.com/vuejs/vue-cli/commit/eb1c7e9))
* **ui:** disable example vue-cli-ui.js in prod ([d3924bd](https://github.com/vuejs/vue-cli/commit/d3924bd))
* **ui:** IPC API memory leak ([0a3686e](https://github.com/vuejs/vue-cli/commit/0a3686e))
* **ui:** moved necessary deps from devDeps to deps ([06a9870](https://github.com/vuejs/vue-cli/commit/06a9870))
* **ui:** plugin search pagination ([f633a3f](https://github.com/vuejs/vue-cli/commit/f633a3f))
* **ui:** ProjectNav error ([b5c5e71](https://github.com/vuejs/vue-cli/commit/b5c5e71))
* **ui:** prompts: missing await ([d122c35](https://github.com/vuejs/vue-cli/commit/d122c35))
* **ui:** removed tasks not being properly filtered ([093f762](https://github.com/vuejs/vue-cli/commit/093f762))
* **ui:** various bugs ([acd4ab4](https://github.com/vuejs/vue-cli/commit/acd4ab4))
#### Features

* **ui:** hooks ([a8c441c](https://github.com/vuejs/vue-cli/commit/a8c441c))
* **ui:** vue-cli-ui.js file example ([b0701ab](https://github.com/vuejs/vue-cli/commit/b0701ab))

## cli-ui-addon-webpack

#### Bug Fixes

* **ui:** DonutModule clean up ([802499e](https://github.com/vuejs/vue-cli/commit/802499e))
* **ui:** DonutModule visible threshold ([7341156](https://github.com/vuejs/vue-cli/commit/7341156))
* **ui:** eslint error ([9fbf860](https://github.com/vuejs/vue-cli/commit/9fbf860))
* **ui:** typo ([63383b4](https://github.com/vuejs/vue-cli/commit/63383b4))
* **ui:** yarn lock ([c72f728](https://github.com/vuejs/vue-cli/commit/c72f728))
#### Features

* **ui:** webpack analyzer ([c29669b](https://github.com/vuejs/vue-cli/commit/c29669b))
#### Performance Improvements

* **ui:** webpack analyzer optimization ([4b4a770](https://github.com/vuejs/vue-cli/commit/4b4a770))



# [3.0.0-beta.7](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.6...v3.0.0-beta.7) (2018-04-25)

## babel-preset-app

#### Bug Fixes

* babel legacy decorator ([#1163](https://github.com/vuejs/vue-cli/issues/1163)) ([fb013da](https://github.com/vuejs/vue-cli/commit/fb013da))
* pin babel version (fix [#1162](https://github.com/vuejs/vue-cli/issues/1162)) ([dbc3f10](https://github.com/vuejs/vue-cli/commit/dbc3f10))

## cli

#### Bug Fixes

* **invoke:** issue [#1037](https://github.com/vuejs/vue-cli/issues/1037) invoke binary files ([#1038](https://github.com/vuejs/vue-cli/issues/1038)) ([e65110f](https://github.com/vuejs/vue-cli/commit/e65110f))
#### Features

* allow vue add to work with plugins without a generator ([#1032](https://github.com/vuejs/vue-cli/issues/1032)) ([11956ac](https://github.com/vuejs/vue-cli/commit/11956ac))

## cli-plugin-eslint

#### Features

* **ui:** configurations 'files' option can be omitted ([a191d76](https://github.com/vuejs/vue-cli/commit/a191d76))

## cli-plugin-typescript

#### Features

* use `esnext` targets for downleveling and modules. ([#966](https://github.com/vuejs/vue-cli/issues/966)) ([ba5a375](https://github.com/vuejs/vue-cli/commit/ba5a375))

## cli-service

#### Bug Fixes

* **ui:** DashboardPlugin ack data ([96c95a8](https://github.com/vuejs/vue-cli/commit/96c95a8))
* **ui:** eslint disaled rule ([a4f6e1d](https://github.com/vuejs/vue-cli/commit/a4f6e1d))
* **ui:** express timeout ([021370d](https://github.com/vuejs/vue-cli/commit/021370d))
* allow user to define onProxyReq ([#955](https://github.com/vuejs/vue-cli/issues/955)) ([179033d](https://github.com/vuejs/vue-cli/commit/179033d))
* **ui:** process killed before ipc messages are sent ([53d5d4e](https://github.com/vuejs/vue-cli/commit/53d5d4e))
* **ui:** remove console.logs ([2e9cfab](https://github.com/vuejs/vue-cli/commit/2e9cfab))
* **ui:** throttle DashboardPlugin progress updates ([1d9a4d6](https://github.com/vuejs/vue-cli/commit/1d9a4d6))
#### Features

* vue.config devBaseUrl (fix [#1102](https://github.com/vuejs/vue-cli/issues/1102)) ([1b27231](https://github.com/vuejs/vue-cli/commit/1b27231))

## cli-shared-utils

#### Bug Fixes

* move request deps to shared-utils ([982c494](https://github.com/vuejs/vue-cli/commit/982c494))

## cli-ui

#### Bug Fixes

* **ui:** "More info" link cut when wrapped ([5fdb9b4](https://github.com/vuejs/vue-cli/commit/5fdb9b4))
* **ui:** client addon serve ([177059b](https://github.com/vuejs/vue-cli/commit/177059b))
* **ui:** client addon serve error ([a602b2c](https://github.com/vuejs/vue-cli/commit/a602b2c))
* **ui:** client addons serve ([7a01cd0](https://github.com/vuejs/vue-cli/commit/7a01cd0))
* **ui:** config.file ([3801d0a](https://github.com/vuejs/vue-cli/commit/3801d0a))
* **ui:** git FileDiff close modal before commit operation ([c7ade2c](https://github.com/vuejs/vue-cli/commit/c7ade2c))
* **ui:** ipc.send ([31e8c1d](https://github.com/vuejs/vue-cli/commit/31e8c1d))
* **ui:** ListItemInfo vertical align ([c7e4ca1](https://github.com/vuejs/vue-cli/commit/c7e4ca1))
* **ui:** LoggerView scrollToBottom ([6c2e99a](https://github.com/vuejs/vue-cli/commit/6c2e99a))
* **ui:** mergeData crash ([2ef6900](https://github.com/vuejs/vue-cli/commit/2ef6900))
* **ui:** open in editor fr tooltip ([bfa07f6](https://github.com/vuejs/vue-cli/commit/bfa07f6))
* **ui:** package logo loading only if necessaryx ([5139dbc](https://github.com/vuejs/vue-cli/commit/5139dbc))
* **ui:** PackageSearchItem link uses homepage field ([66cc127](https://github.com/vuejs/vue-cli/commit/66cc127))
* **ui:** Plugin actions ([e591ea4](https://github.com/vuejs/vue-cli/commit/e591ea4))
* **ui:** plugin items cursor ([9fbe07c](https://github.com/vuejs/vue-cli/commit/9fbe07c))
* **ui:** PluginAdd current plugin display ([33b1e20](https://github.com/vuejs/vue-cli/commit/33b1e20))
* **ui:** PluginAdd tab check ([ca01d95](https://github.com/vuejs/vue-cli/commit/ca01d95))
* **ui:** pormpts remove result in answers when disabled ([a29a3b4](https://github.com/vuejs/vue-cli/commit/a29a3b4))
* **ui:** stderr new lines + selected task status color ([b949406](https://github.com/vuejs/vue-cli/commit/b949406))
* **ui:** progress handler should not throw error (casuing process to exit) ([3d4d8f0](https://github.com/vuejs/vue-cli/commit/3d4d8f0))
* **ui:** ProjectNav padding ([4fd8885](https://github.com/vuejs/vue-cli/commit/4fd8885))
* **ui:** ProjectNavButton tooltip delay ([131cc46](https://github.com/vuejs/vue-cli/commit/131cc46))
* **ui:** prompt margins ([100a12e](https://github.com/vuejs/vue-cli/commit/100a12e))
* **ui:** Prompt validation ([009b880](https://github.com/vuejs/vue-cli/commit/009b880))
* **ui:** prompts async methods + fixes ([75e86c6](https://github.com/vuejs/vue-cli/commit/75e86c6))
* **ui:** prompts choices values ([a378dca](https://github.com/vuejs/vue-cli/commit/a378dca))
* **ui:** prompts deep objects ([fd3188d](https://github.com/vuejs/vue-cli/commit/fd3188d))
* **ui:** prompts for config/tasks getting confused ([8244973](https://github.com/vuejs/vue-cli/commit/8244973))
* **ui:** SharedData errors ([60b86eb](https://github.com/vuejs/vue-cli/commit/60b86eb))
* **ui:** status bar last log padding ([3b6c01f](https://github.com/vuejs/vue-cli/commit/3b6c01f))
* **ui:** StatusBar and scrolling fixes ([7440d0f](https://github.com/vuejs/vue-cli/commit/7440d0f))
* **ui:** Task parameter close label ([0a53836](https://github.com/vuejs/vue-cli/commit/0a53836))
* **ui:** tasks id + locale ([8e3198d](https://github.com/vuejs/vue-cli/commit/8e3198d))
* **ui:** terminal colors to match color palette ([0161b74](https://github.com/vuejs/vue-cli/commit/0161b74))
* **ui:** toolbars background color ([5851634](https://github.com/vuejs/vue-cli/commit/5851634))
* **ui:** wait for CWD reset when entering project main view ([751698e](https://github.com/vuejs/vue-cli/commit/751698e))
#### Features

* **ui:** better details tab title ([a46686e](https://github.com/vuejs/vue-cli/commit/a46686e))
* **ui:** client addons, ipc, shared data, plugin actions ([3c59d6f](https://github.com/vuejs/vue-cli/commit/3c59d6f))
* **ui:** clientAddonConfig ([e2c2b48](https://github.com/vuejs/vue-cli/commit/e2c2b48))
* **ui:** favorite projects ([120c13d](https://github.com/vuejs/vue-cli/commit/120c13d))
* **ui:** file diffs after plugin invoke + fixes ([e7198a4](https://github.com/vuejs/vue-cli/commit/e7198a4))
* **ui:** FileDiff open in editor ([7cb0dc8](https://github.com/vuejs/vue-cli/commit/7cb0dc8))
* **ui:** fr locale + related fixes ([1441c02](https://github.com/vuejs/vue-cli/commit/1441c02))
* **ui:** git FileDiff ([2b0ac9f](https://github.com/vuejs/vue-cli/commit/2b0ac9f))
* **ui:** git FileDiff auto-refresh on page focus ([794910b](https://github.com/vuejs/vue-cli/commit/794910b))
* **ui:** install/uninstall plugin ([63ccde8](https://github.com/vuejs/vue-cli/commit/63ccde8))
* **ui:** ItemLogo special vuejs styling ([da0d37e](https://github.com/vuejs/vue-cli/commit/da0d37e))
* **ui:** localization of cli-ui ([#987](https://github.com/vuejs/vue-cli/issues/987)) ([10202e9](https://github.com/vuejs/vue-cli/commit/10202e9))
* **ui:** LoggerMessage date ([9cf8348](https://github.com/vuejs/vue-cli/commit/9cf8348))
* **ui:** New StepWizard frame style ([921e99f](https://github.com/vuejs/vue-cli/commit/921e99f))
* **ui:** NotFound view ([11bb249](https://github.com/vuejs/vue-cli/commit/11bb249))
* **ui:** open last project ([f79cb6e](https://github.com/vuejs/vue-cli/commit/f79cb6e))
* **ui:** page title ([d51e5f1](https://github.com/vuejs/vue-cli/commit/d51e5f1))
* **ui:** plugin add prompts ([ce4cf9a](https://github.com/vuejs/vue-cli/commit/ce4cf9a))
* **ui:** Plugin add search (wip) ([83939c9](https://github.com/vuejs/vue-cli/commit/83939c9))
* **ui:** plugin invoke ([1a48c9f](https://github.com/vuejs/vue-cli/commit/1a48c9f))
* **ui:** plugin logo ([088d316](https://github.com/vuejs/vue-cli/commit/088d316))
* **ui:** PluginAdd config cta-text ([faac5e5](https://github.com/vuejs/vue-cli/commit/faac5e5))
* **ui:** PluginApi -> describeTask initial impl. ([e07abbb](https://github.com/vuejs/vue-cli/commit/e07abbb))
* **ui:** PluginApi validation: better errors ([a60dc4e](https://github.com/vuejs/vue-cli/commit/a60dc4e))
* **ui:** PluginApi: configurations ([05e0dd0](https://github.com/vuejs/vue-cli/commit/05e0dd0))
* **ui:** plugins update ([7571e80](https://github.com/vuejs/vue-cli/commit/7571e80))
* **ui:** Progress and Logs systems ([9f0eece](https://github.com/vuejs/vue-cli/commit/9f0eece))
* **ui:** Project creation working! ([61655b1](https://github.com/vuejs/vue-cli/commit/61655b1))
* **ui:** project/plugin notifs ([eab8b0a](https://github.com/vuejs/vue-cli/commit/eab8b0a))
* **ui:** ProjectCreate prompts tab ([239c4d4](https://github.com/vuejs/vue-cli/commit/239c4d4))
* **ui:** ProjectCreate save preset ([bea5df9](https://github.com/vuejs/vue-cli/commit/bea5df9))
* **ui:** ProjectNav plugin support ([9d8dc0b](https://github.com/vuejs/vue-cli/commit/9d8dc0b))
* **ui:** ProjectNavMore + About view ([63b0984](https://github.com/vuejs/vue-cli/commit/63b0984))
* **ui:** prompt error ui ([798445f](https://github.com/vuejs/vue-cli/commit/798445f))
* **ui:** Prompt groups + fixes + some vue eslint config ([6af029e](https://github.com/vuejs/vue-cli/commit/6af029e))
* **ui:** prompt-list default choice + config field auto-remove ([dde426a](https://github.com/vuejs/vue-cli/commit/dde426a))
* **ui:** Prompts can now be shown and disabled ([56c2aac](https://github.com/vuejs/vue-cli/commit/56c2aac))
* **ui:** Report bug button ([f7050c2](https://github.com/vuejs/vue-cli/commit/f7050c2))
* **ui:** Reset CWD to project path ([601fb1f](https://github.com/vuejs/vue-cli/commit/601fb1f))
* **ui:** restore last route ([65019d6](https://github.com/vuejs/vue-cli/commit/65019d6))
* **ui:** restore route mixin ([ec44835](https://github.com/vuejs/vue-cli/commit/ec44835))
* **ui:** route badges ([dbac02f](https://github.com/vuejs/vue-cli/commit/dbac02f))
* **ui:** serve static files in plugin `ui-public` folders + support custom icons in routes ([5df5427](https://github.com/vuejs/vue-cli/commit/5df5427))
* **ui:** StatusBar 'No logs yet' ([e20e21d](https://github.com/vuejs/vue-cli/commit/e20e21d))
* **ui:** StatusBar/LoggerView improvements ([e1dc6e7](https://github.com/vuejs/vue-cli/commit/e1dc6e7))
* **ui:** Task notifs ([0335d32](https://github.com/vuejs/vue-cli/commit/0335d32))
* **ui:** task run (wip stop not working) ([0a6891a](https://github.com/vuejs/vue-cli/commit/0a6891a))
* **ui:** Task stop + console output ([d7700ff](https://github.com/vuejs/vue-cli/commit/d7700ff))
* **ui:** tasks list ([5a80c24](https://github.com/vuejs/vue-cli/commit/5a80c24))
* **ui:** try to load logo.png in package search ([46567e3](https://github.com/vuejs/vue-cli/commit/46567e3))
* **ui:** webpack dashboard 'open app' button ([dc8b454](https://github.com/vuejs/vue-cli/commit/dc8b454))
* **ui:** wip plugins list ([b9a714c](https://github.com/vuejs/vue-cli/commit/b9a714c))

## cli-ui-addon-build

#### Bug Fixes

* **ui:** deps + dahsboard plugin ([a628b43](https://github.com/vuejs/vue-cli/commit/a628b43))
* **ui:** display 0 instead of NaN ([21d3e94](https://github.com/vuejs/vue-cli/commit/21d3e94))
#### Features

* **ui:** vue ui command ([cdf9d07](https://github.com/vuejs/vue-cli/commit/cdf9d07))

## cli-ui-addon-webpack

#### Bug Fixes

* **ui:** cli-ui-addon-webpack dev urls ([e33bec6](https://github.com/vuejs/vue-cli/commit/e33bec6))
#### Features

* **ui:** Webpack addon: progress status icon ([0c1c245](https://github.com/vuejs/vue-cli/commit/0c1c245))

## docs

#### Bug Fixes

* **ui:** docs images ([1d56cc0](https://github.com/vuejs/vue-cli/commit/1d56cc0))



# [3.0.0-beta.6](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.5...v3.0.0-beta.6) (2018-03-06)

## babel-preset-app

#### Bug Fixes

* fix babel preset jsx dependency ([2eb1ef9](https://github.com/vuejs/vue-cli/commit/2eb1ef9))

## cli

#### Bug Fixes

* fix [@vue](https://github.com/vue)/cli-service initial version ([08add21](https://github.com/vuejs/vue-cli/commit/08add21))

## cli-plugin-eslint

#### Bug Fixes

* do not exit with 1 on lint warnings (fix [#872](https://github.com/vuejs/vue-cli/issues/872)) ([b162cab](https://github.com/vuejs/vue-cli/commit/b162cab))

## cli-service

#### Bug Fixes

* fix cases where error fails to display ([dee7809](https://github.com/vuejs/vue-cli/commit/dee7809))
* fix devServer proxy when using object syntax (fix [#945](https://github.com/vuejs/vue-cli/issues/945)) ([114e085](https://github.com/vuejs/vue-cli/commit/114e085))
* use dynamic publicPath for web component bundles (fix [#949](https://github.com/vuejs/vue-cli/issues/949)) ([f744040](https://github.com/vuejs/vue-cli/commit/f744040))

## cli-ui

#### Features

* **ui:** Project select hide tabs when creating project ([db67f1e](https://github.com/vuejs/vue-cli/commit/db67f1e))
* **ui:** ProjectCreate features tab ([ee59f54](https://github.com/vuejs/vue-cli/commit/ee59f54))
* **ui:** ProjectCreate path preview ([d0703b0](https://github.com/vuejs/vue-cli/commit/d0703b0))
* **ui:** ProjectCreate saves formData ([d59b35e](https://github.com/vuejs/vue-cli/commit/d59b35e))



# [3.0.0-beta.5](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.4...v3.0.0-beta.5) (2018-03-05)

## babel-preset-app

#### Bug Fixes

* temporarily disable babel plugins that are not compatible with babel 7 yet ([389ea86](https://github.com/vuejs/vue-cli/commit/389ea86))

## cli

#### Bug Fixes

* resolve template extend source from the template location (fix [#943](https://github.com/vuejs/vue-cli/issues/943)) ([89f5cc3](https://github.com/vuejs/vue-cli/commit/89f5cc3))

## cli-ui

#### Features

* **ui:** Preset tab ([45e3c82](https://github.com/vuejs/vue-cli/commit/45e3c82))

## docs

#### Features

* allow specifying plugin versions in presets ([bdce865](https://github.com/vuejs/vue-cli/commit/bdce865))



# [3.0.0-beta.4](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.3...v3.0.0-beta.4) (2018-03-05)

## cli

#### Features

* add `vue add` command ([#936](https://github.com/vuejs/vue-cli/issues/936)) ([896aec5](https://github.com/vuejs/vue-cli/commit/896aec5))
* generatorAPI.exitLog ([#935](https://github.com/vuejs/vue-cli/issues/935)) ([0f2ee80](https://github.com/vuejs/vue-cli/commit/0f2ee80))
* read existing files during plugin invocation (close [#873](https://github.com/vuejs/vue-cli/issues/873)) ([de60d9f](https://github.com/vuejs/vue-cli/commit/de60d9f))
* support using remote preset (close [#884](https://github.com/vuejs/vue-cli/issues/884)) ([2d89c51](https://github.com/vuejs/vue-cli/commit/2d89c51))

## cli-plugin-pwa

#### Bug Fixes

* fix pwa + ts + lint (close [#937](https://github.com/vuejs/vue-cli/issues/937)) ([b878767](https://github.com/vuejs/vue-cli/commit/b878767))
* **pwa:** set cacheid in GenerateSW mode only ([#939](https://github.com/vuejs/vue-cli/issues/939)) ([43971d8](https://github.com/vuejs/vue-cli/commit/43971d8)), closes [#891](https://github.com/vuejs/vue-cli/issues/891)

## cli-plugin-typescript

#### Bug Fixes

* **test:** e2e w/ typescript ([#933](https://github.com/vuejs/vue-cli/issues/933)) ([b728624](https://github.com/vuejs/vue-cli/commit/b728624))

## cli-service

#### Bug Fixes

* mock process for 3rd party libs (close [#934](https://github.com/vuejs/vue-cli/issues/934)) ([a2ac6be](https://github.com/vuejs/vue-cli/commit/a2ac6be))
#### Features

* allow specifying additional configs in preset ([2b9a750](https://github.com/vuejs/vue-cli/commit/2b9a750))
* Generator now supports template inheritance ([1869aa2](https://github.com/vuejs/vue-cli/commit/1869aa2))
* initialize project with corresponding CSS pre-processor (close [#930](https://github.com/vuejs/vue-cli/issues/930)) ([811d056](https://github.com/vuejs/vue-cli/commit/811d056))

## cli-test-utils

#### Bug Fixes

* use same Puppeteer like in main package.json ([#942](https://github.com/vuejs/vue-cli/issues/942)) ([11192cf](https://github.com/vuejs/vue-cli/commit/11192cf))

## cli-ui

#### Bug Fixes

* **ui:** FolderExplorer favorites dropdown placement ([1a71164](https://github.com/vuejs/vue-cli/commit/1a71164))
* **ui:** Project select page class ([0a527d7](https://github.com/vuejs/vue-cli/commit/0a527d7))
#### Features

* **ui:** FolderExplorer ([3333c94](https://github.com/vuejs/vue-cli/commit/3333c94))
* **ui:** FolderExplorer favorites + Project select page ([376e4bb](https://github.com/vuejs/vue-cli/commit/376e4bb))
* **ui:** FolderExplorer list scrolling ([ae0d895](https://github.com/vuejs/vue-cli/commit/ae0d895))
* **ui:** FolderExplorer path edit + folder isPackage/isVueProject ([08514eb](https://github.com/vuejs/vue-cli/commit/08514eb))
* **ui:** Initial app ([8947a45](https://github.com/vuejs/vue-cli/commit/8947a45))
* **ui:** Initial schema and folder API ([1751ca1](https://github.com/vuejs/vue-cli/commit/1751ca1))
* **ui:** Project Create details form ([8399838](https://github.com/vuejs/vue-cli/commit/8399838))



# [3.0.0-beta.3](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.2...v3.0.0-beta.3) (2018-03-03)

## babel-preset-app

#### Features

* support dynamic import in jest tests (close [#922](https://github.com/vuejs/vue-cli/issues/922)) ([09ed0b1](https://github.com/vuejs/vue-cli/commit/09ed0b1))

## cli

#### Features

* support creating project in current directory ([#916](https://github.com/vuejs/vue-cli/issues/916)) ([6ae1569](https://github.com/vuejs/vue-cli/commit/6ae1569)), closes [#896](https://github.com/vuejs/vue-cli/issues/896)

## cli-plugin-eslint

#### Bug Fixes

* include root config files in lint (close [#913](https://github.com/vuejs/vue-cli/issues/913)) ([c40a88d](https://github.com/vuejs/vue-cli/commit/c40a88d))

## cli-plugin-typescript

#### Bug Fixes

* **e2e:** end to end test(s) folder ([#923](https://github.com/vuejs/vue-cli/issues/923)) ([852d26c](https://github.com/vuejs/vue-cli/commit/852d26c))
* **tsconfig.json:** typo in includes ([#917](https://github.com/vuejs/vue-cli/issues/917)) ([6adc0b5](https://github.com/vuejs/vue-cli/commit/6adc0b5))
* **tslint.json:** linting of test(s) folder ([#924](https://github.com/vuejs/vue-cli/issues/924)) ([549ff7f](https://github.com/vuejs/vue-cli/commit/549ff7f))

## cli-plugin-unit-mocha

#### Bug Fixes

* externalize vue-server-renderer + support dynamic import in mocha tests ([fe9aed8](https://github.com/vuejs/vue-cli/commit/fe9aed8))

## cli-service

#### Bug Fixes

* **dev-server:** dev server behind NAT network ([#868](https://github.com/vuejs/vue-cli/issues/868)) ([bbc931c](https://github.com/vuejs/vue-cli/commit/bbc931c)), closes [#828](https://github.com/vuejs/vue-cli/issues/828)
* fix baseUrl normalization (close [#900](https://github.com/vuejs/vue-cli/issues/900)) ([89982df](https://github.com/vuejs/vue-cli/commit/89982df))
* fix options for css optimize plugin (close [#918](https://github.com/vuejs/vue-cli/issues/918)) ([7681106](https://github.com/vuejs/vue-cli/commit/7681106))
* respect --dest when copying static assets (close [#909](https://github.com/vuejs/vue-cli/issues/909)) ([57ce32a](https://github.com/vuejs/vue-cli/commit/57ce32a))
* respect dotfiles in public dir (fix [#880](https://github.com/vuejs/vue-cli/issues/880)) ([59ac4f4](https://github.com/vuejs/vue-cli/commit/59ac4f4))
#### Features

* **css modules:** Add CSS Module localIdentName option to vue config ([#915](https://github.com/vuejs/vue-cli/issues/915)) ([31cdc86](https://github.com/vuejs/vue-cli/commit/31cdc86))



# [3.0.0-beta.2](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.1...v3.0.0-beta.2) (2018-02-28)

## cli

#### Features

* output help information on unknown CLI commands ([#857](https://github.com/vuejs/vue-cli/issues/857)) ([cd23858](https://github.com/vuejs/vue-cli/commit/cd23858)), closes [#849](https://github.com/vuejs/vue-cli/issues/849)

## cli-plugin-e2e-cypress

#### Bug Fixes

* **cypress:** upgrade cypress and properly set base url ([#879](https://github.com/vuejs/vue-cli/issues/879)) ([46358eb](https://github.com/vuejs/vue-cli/commit/46358eb))
#### Code Refactoring

* change default test directory name to "tests" ([64b4515](https://github.com/vuejs/vue-cli/commit/64b4515)), closes [#877](https://github.com/vuejs/vue-cli/issues/877)

## cli-plugin-e2e-nightwatch

#### Bug Fixes

* nightwatch helper compat with airbnb linter ([f4d1841](https://github.com/vuejs/vue-cli/commit/f4d1841)), closes [#870](https://github.com/vuejs/vue-cli/issues/870)

## cli-plugin-pwa

#### Features

* **cli-plugin-pwa:** Upgrade workbox-webpack-plugin to 3.0.0-beta.1 ([#897](https://github.com/vuejs/vue-cli/issues/897)) ([6d7985a](https://github.com/vuejs/vue-cli/commit/6d7985a))

## cli-plugin-typescript

#### Bug Fixes

* ts generator & airbnb import/extensions rule compatibility ([88726a3](https://github.com/vuejs/vue-cli/commit/88726a3)), closes [#871](https://github.com/vuejs/vue-cli/issues/871)

## cli-service

#### Bug Fixes

* do not swallow vue.config.js errors ([14a2dc7](https://github.com/vuejs/vue-cli/commit/14a2dc7)), closes [#874](https://github.com/vuejs/vue-cli/issues/874) [#866](https://github.com/vuejs/vue-cli/issues/866)
* enable html doctype by default for pug ([e15a930](https://github.com/vuejs/vue-cli/commit/e15a930)), closes [#894](https://github.com/vuejs/vue-cli/issues/894)
* fix friendly-error plugin name typo ([#882](https://github.com/vuejs/vue-cli/issues/882)) ([73ad2f8](https://github.com/vuejs/vue-cli/commit/73ad2f8))
#### Features

* add ability to use environment variables in vue.config.js ([#867](https://github.com/vuejs/vue-cli/issues/867)) ([92ddd09](https://github.com/vuejs/vue-cli/commit/92ddd09))
* add default <noscript> content ([#856](https://github.com/vuejs/vue-cli/issues/856)) ([a489803](https://github.com/vuejs/vue-cli/commit/a489803)), closes [#854](https://github.com/vuejs/vue-cli/issues/854)
* preserveWhitespace: false ([1864cef](https://github.com/vuejs/vue-cli/commit/1864cef))


### BREAKING CHANGES

* all tests are now located in "tests" instead of "test"
* preserveWhitespace now defaults to false in vue-loader options.



# [3.0.0-beta.1](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.13...v3.0.0-beta.1) (2018-02-16)

## babel-preset-app

#### Bug Fixes

* **babel preset:** allow setting `useBuiltIns` to be `false`. ([#843](https://github.com/vuejs/vue-cli/issues/843)) ([a9ac1a9](https://github.com/vuejs/vue-cli/commit/a9ac1a9))

## cli-plugin-eslint

#### Bug Fixes

* also include import rule in eslint plugin ([e8f036b](https://github.com/vuejs/vue-cli/commit/e8f036b))
* fix eslint-loader for TypeScript ([9f5d0b9](https://github.com/vuejs/vue-cli/commit/9f5d0b9))

## cli-plugin-typescript

#### Bug Fixes

* eslint + airbnb compat with TypeScript ([d391e47](https://github.com/vuejs/vue-cli/commit/d391e47))

## cli-service-global

#### Bug Fixes

* fix core-js import for global service ([3a5d125](https://github.com/vuejs/vue-cli/commit/3a5d125)), closes [#837](https://github.com/vuejs/vue-cli/issues/837)



# [3.0.0-alpha.13](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.12...v3.0.0-alpha.13) (2018-02-13)

## cli

#### Bug Fixes

* include missing dep (fix [#831](https://github.com/vuejs/vue-cli/issues/831)) ([6a0bc17](https://github.com/vuejs/vue-cli/commit/6a0bc17))



# [3.0.0-alpha.12](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.11...v3.0.0-alpha.12) (2018-02-12)

## babel-preset-app

#### Features

* expose useBuiltIns options in [@vue](https://github.com/vue)/babel-preset-app ([8e0661e](https://github.com/vuejs/vue-cli/commit/8e0661e)), closes [#812](https://github.com/vuejs/vue-cli/issues/812)

## cli

#### Bug Fixes

* fix usage with https proxy by switching from axios to request ([#829](https://github.com/vuejs/vue-cli/issues/829)) ([e8aa688](https://github.com/vuejs/vue-cli/commit/e8aa688)), closes [#785](https://github.com/vuejs/vue-cli/issues/785)

## cli-plugin-e2e-cypress

#### Features

* allow e2e plugins to sepcify which mode the server should start in ([8f8fe6d](https://github.com/vuejs/vue-cli/commit/8f8fe6d)), closes [#814](https://github.com/vuejs/vue-cli/issues/814)
* use eslint-plugin-cypress ([9410442](https://github.com/vuejs/vue-cli/commit/9410442)), closes [#815](https://github.com/vuejs/vue-cli/issues/815)

## cli-plugin-eslint

#### Features

* lintOnSave no longer causes compilation to fail ([9040df8](https://github.com/vuejs/vue-cli/commit/9040df8)), closes [#817](https://github.com/vuejs/vue-cli/issues/817)

## cli-plugin-typescript

#### Bug Fixes

* only enable TSLint when tslint.json exists ([76d7f77](https://github.com/vuejs/vue-cli/commit/76d7f77))

## cli-service

#### Bug Fixes

* make extension test for font files case-insensitive ([#830](https://github.com/vuejs/vue-cli/issues/830)) ([d7cfa00](https://github.com/vuejs/vue-cli/commit/d7cfa00))
#### Features

* use more descriptive classNames for CSS modules ([fd13106](https://github.com/vuejs/vue-cli/commit/fd13106)), closes [#813](https://github.com/vuejs/vue-cli/issues/813)



# [3.0.0-alpha.11](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.10...v3.0.0-alpha.11) (2018-02-09)

## cli-plugin-eslint

#### Bug Fixes

* eslint config should be root ([ea74da1](https://github.com/vuejs/vue-cli/commit/ea74da1))
* **eslint:** load node env by default (fix [#806](https://github.com/vuejs/vue-cli/issues/806)) ([c2e3228](https://github.com/vuejs/vue-cli/commit/c2e3228))

## cli-service

#### Bug Fixes

* respect user configured output path ([b5564af](https://github.com/vuejs/vue-cli/commit/b5564af)), closes [#809](https://github.com/vuejs/vue-cli/issues/809)



# [3.0.0-alpha.10](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.9...v3.0.0-alpha.10) (2018-02-08)

## cli-plugin-pwa

#### Bug Fixes

* fix pwa info link (close [#801](https://github.com/vuejs/vue-cli/issues/801)) ([a0004ea](https://github.com/vuejs/vue-cli/commit/a0004ea))

## cli-plugin-typescript

#### Bug Fixes

* vue-class-component and vue-property-decorators should be dependencies ([c26559d](https://github.com/vuejs/vue-cli/commit/c26559d))
#### Features

* support using ESLint to lint TypeScript ([dd04add](https://github.com/vuejs/vue-cli/commit/dd04add))

## eslint-config-prettier

#### Features

* include eslint:recommended in prettier config ([e261718](https://github.com/vuejs/vue-cli/commit/e261718))



# [3.0.0-alpha.9](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.8...v3.0.0-alpha.9) (2018-02-06)

## cli

#### Bug Fixes

* handle vue invoke config merging for existing files ([46166fb](https://github.com/vuejs/vue-cli/commit/46166fb)), closes [#788](https://github.com/vuejs/vue-cli/issues/788)
* only support taobao check and inline registry when using npm ([67df3eb](https://github.com/vuejs/vue-cli/commit/67df3eb)), closes [#789](https://github.com/vuejs/vue-cli/issues/789)

## cli-plugin-pwa

#### Features

* Use the Workbox webpack plugin in pwa template ([#769](https://github.com/vuejs/vue-cli/issues/769)) ([9095483](https://github.com/vuejs/vue-cli/commit/9095483))

## cli-plugin-unit-mocha

#### Bug Fixes

* **unit-mocha:** fix test glob to avoid running e2e tests ([172e8eb](https://github.com/vuejs/vue-cli/commit/172e8eb)), closes [#790](https://github.com/vuejs/vue-cli/issues/790)

## cli-service

#### Bug Fixes

* object returned from api.configureWebpack should be merged ([920d8fa](https://github.com/vuejs/vue-cli/commit/920d8fa))



# [3.0.0-alpha.8](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.7...v3.0.0-alpha.8) (2018-02-04)

## cli

#### Bug Fixes

* fix overwrite prompt ([7871c5c](https://github.com/vuejs/vue-cli/commit/7871c5c))
* **inspect:** correct usage of `resolve` ([#773](https://github.com/vuejs/vue-cli/issues/773)) ([0f9a44a](https://github.com/vuejs/vue-cli/commit/0f9a44a))

## cli-plugin-e2e-cypress

#### Bug Fixes

* fix eslint errors when using airbnb + cypress ([313533d](https://github.com/vuejs/vue-cli/commit/313533d))

## cli-plugin-unit-jest

#### Bug Fixes

* fix jest test match ([2c61d23](https://github.com/vuejs/vue-cli/commit/2c61d23)), closes [#771](https://github.com/vuejs/vue-cli/issues/771)

## cli-service

#### Bug Fixes

* move plugin data extraction into GeneratorAPI ([4f2f6f0](https://github.com/vuejs/vue-cli/commit/4f2f6f0))
* shim global for node modules ([691cfa2](https://github.com/vuejs/vue-cli/commit/691cfa2)), closes [#774](https://github.com/vuejs/vue-cli/issues/774)
#### Features

* build --target wc-async ([50fdd9b](https://github.com/vuejs/vue-cli/commit/50fdd9b))
* polish build output ([dc29e88](https://github.com/vuejs/vue-cli/commit/dc29e88))
* update default component content ([59f5913](https://github.com/vuejs/vue-cli/commit/59f5913))

## other

#### Bug Fixes

* include version marker in workspace ([d3d040a](https://github.com/vuejs/vue-cli/commit/d3d040a)), closes [#772](https://github.com/vuejs/vue-cli/issues/772)



# [3.0.0-alpha.7](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.6...v3.0.0-alpha.7) (2018-02-02)

## cli

#### Features

* check and show newer version on create ([3df1289](https://github.com/vuejs/vue-cli/commit/3df1289))
* support prompts when invoking plugins ([c1142e2](https://github.com/vuejs/vue-cli/commit/c1142e2))

## cli-init

#### Bug Fixes

* ensure vue init works when installed with npm ([6ce8565](https://github.com/vuejs/vue-cli/commit/6ce8565))



# [3.0.0-alpha.6](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.5...v3.0.0-alpha.6) (2018-02-02)

## cli

#### Bug Fixes

* do not extract vue.config.js in tests ([7874b0e](https://github.com/vuejs/vue-cli/commit/7874b0e))
* fix project creation when path contains spaces (fix [#742](https://github.com/vuejs/vue-cli/issues/742)) ([5be05f3](https://github.com/vuejs/vue-cli/commit/5be05f3))
* fix version check ([e5ef34d](https://github.com/vuejs/vue-cli/commit/e5ef34d))
* move linkBin into [@vue](https://github.com/vue)/cli since it requires node 8 ([120d5c5](https://github.com/vuejs/vue-cli/commit/120d5c5))
#### Features

* vue inspect that proxies to vue-cli-service ([4c00cfa](https://github.com/vuejs/vue-cli/commit/4c00cfa))

## cli-plugin-eslint

#### Bug Fixes

* allow console during dev ([5ad8fae](https://github.com/vuejs/vue-cli/commit/5ad8fae))

## cli-plugin-typescript

#### Bug Fixes

* ensure loaders exist ([fcfb099](https://github.com/vuejs/vue-cli/commit/fcfb099))
* fix --force flag ([6661ac2](https://github.com/vuejs/vue-cli/commit/6661ac2))
* TS 2.7 compat ([c7e28fd](https://github.com/vuejs/vue-cli/commit/c7e28fd))
* typescript caching problems ([a80cf18](https://github.com/vuejs/vue-cli/commit/a80cf18))
* **typescript:** explicitly include global types ([31c1261](https://github.com/vuejs/vue-cli/commit/31c1261)), closes [#762](https://github.com/vuejs/vue-cli/issues/762)

## cli-service

#### Bug Fixes

* --target for global build ([4fb4e35](https://github.com/vuejs/vue-cli/commit/4fb4e35))
* avoid deepmerge on project config ([7d590d8](https://github.com/vuejs/vue-cli/commit/7d590d8))
* compatible with safari 10 ([#755](https://github.com/vuejs/vue-cli/issues/755)) ([199c754](https://github.com/vuejs/vue-cli/commit/199c754))
#### Features

* build --target lib/wc ([faadadf](https://github.com/vuejs/vue-cli/commit/faadadf))
* build --target web-component (WIP) ([6db7735](https://github.com/vuejs/vue-cli/commit/6db7735))
* complete --target wc & multi-wc + tests ([9a07eeb](https://github.com/vuejs/vue-cli/commit/9a07eeb))
* improve build lib/web-component ([1c4943b](https://github.com/vuejs/vue-cli/commit/1c4943b))
* improve inspect output ([fd87394](https://github.com/vuejs/vue-cli/commit/fd87394))
* inject styles under shadow root in web component mode ([98afd07](https://github.com/vuejs/vue-cli/commit/98afd07))
* make env variables available in HTML template ([b626ef1](https://github.com/vuejs/vue-cli/commit/b626ef1))
* parallel mode ([b8f2487](https://github.com/vuejs/vue-cli/commit/b8f2487))
* vue build --target multi-wc [pattern] ([0f59c03](https://github.com/vuejs/vue-cli/commit/0f59c03))
#### Reverts

* feat: load config w/ cosmiconfig ([702b539](https://github.com/vuejs/vue-cli/commit/702b539))



# [3.0.0-alpha.5](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2018-01-29)

## cli

#### Features

* allow saving multiple presets ([f372f55](https://github.com/vuejs/vue-cli/commit/f372f55))
* support config in dedicated files ([01edb46](https://github.com/vuejs/vue-cli/commit/01edb46))

## cli-plugin-typescript

#### Bug Fixes

* cache-loader doesnt seem to work well with ts-loader ([63c8f65](https://github.com/vuejs/vue-cli/commit/63c8f65))

## cli-plugin-unit-jest

#### Bug Fixes

* jest should only run files in given directory ([4a7fd64](https://github.com/vuejs/vue-cli/commit/4a7fd64)), closes [#740](https://github.com/vuejs/vue-cli/issues/740)

## cli-service

#### Features

* load config w/ cosmiconfig ([5288122](https://github.com/vuejs/vue-cli/commit/5288122))



# [3.0.0-alpha.4](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2018-01-26)

## cli-plugin-eslint

#### Features

* move babel-preset and eslint-plugin as deps of plugins ([c2583e4](https://github.com/vuejs/vue-cli/commit/c2583e4))

## cli-plugin-typescript

#### Bug Fixes

* temp pinning vue-jest to github branch ([2d6a0d9](https://github.com/vuejs/vue-cli/commit/2d6a0d9))

## cli-service

#### Bug Fixes

* skip postcss-loader if no postcss config is present ([1142339](https://github.com/vuejs/vue-cli/commit/1142339))

## cli-shared-utils

#### Bug Fixes

* pin joi to 12.x for node version compat ([3bd447a](https://github.com/vuejs/vue-cli/commit/3bd447a))



# [3.0.0-alpha.3](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2018-01-26)

## cli

#### Bug Fixes

* clone options before mutating ([7471f94](https://github.com/vuejs/vue-cli/commit/7471f94))
* packageManager flag ([0c9ecd5](https://github.com/vuejs/vue-cli/commit/0c9ecd5))

## cli-plugin-babel

#### Bug Fixes

* fix sync script for generators ([134ac58](https://github.com/vuejs/vue-cli/commit/134ac58))
* more global service resolve fixes ([76dda73](https://github.com/vuejs/vue-cli/commit/76dda73))

## cli-plugin-typescript

#### Bug Fixes

* **typescript:** fix tsconfig.json ([235676f](https://github.com/vuejs/vue-cli/commit/235676f))
* **typescript:** include [@types](https://github.com/types)/node instead of shimming process ([f9c8849](https://github.com/vuejs/vue-cli/commit/f9c8849))
* ensure cache-loader apply to both babel and ts ([5f76980](https://github.com/vuejs/vue-cli/commit/5f76980))
#### Features

* use cache-loader for ts ([4680544](https://github.com/vuejs/vue-cli/commit/4680544))

## cli-plugin-unit-jest

#### Bug Fixes

* force babel-core version when using ts + babel ([d7c6af7](https://github.com/vuejs/vue-cli/commit/d7c6af7))

## cli-service

#### Bug Fixes

* more global resolve fixes + better error message for missing loaders ([367b78b](https://github.com/vuejs/vue-cli/commit/367b78b))
* resolve for global service ([8f0b52f](https://github.com/vuejs/vue-cli/commit/8f0b52f))



# [3.0.0-alpha.2](https://github.com/vuejs/vue-cli/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2018-01-25)

## cli-plugin-babel

#### Bug Fixes

* use babel-loader@8 ([c769110](https://github.com/vuejs/vue-cli/commit/c769110))

## cli-service

#### Bug Fixes

* avoid dotfiles not being published to npm ([2e3fe07](https://github.com/vuejs/vue-cli/commit/2e3fe07))

## other

#### Bug Fixes

* do not update dep if latest tag is older then specified ([b913047](https://github.com/vuejs/vue-cli/commit/b913047))



# 3.0.0-alpha.1 (2018-01-25)

## babel-preset-app

#### Bug Fixes

* typo {mdoule => module} ([#721](https://github.com/vuejs/vue-cli/issues/721)) ([4765cc6](https://github.com/vuejs/vue-cli/commit/4765cc6))

## cli

#### Bug Fixes

* avoid scrolling when picking features ([d57208d](https://github.com/vuejs/vue-cli/commit/d57208d))
#### Features

* core ([a923afb](https://github.com/vuejs/vue-cli/commit/a923afb))
* css preprocessors ([d3bb381](https://github.com/vuejs/vue-cli/commit/d3bb381))
* improve generator hasPlugin check + invoke output ([52dad9d](https://github.com/vuejs/vue-cli/commit/52dad9d))
* improve prompt flow ([06af371](https://github.com/vuejs/vue-cli/commit/06af371))
* tweak invoke command ([65cc27d](https://github.com/vuejs/vue-cli/commit/65cc27d))
* wip invoke command ([132b0db](https://github.com/vuejs/vue-cli/commit/132b0db))

## cli-plugin-babel

#### Features

* add caching for babel ([7605bd6](https://github.com/vuejs/vue-cli/commit/7605bd6))

## cli-plugin-e2e-cypress

#### Features

* e2e cypress ([8a3ac7e](https://github.com/vuejs/vue-cli/commit/8a3ac7e))

## cli-plugin-e2e-nightwatch

#### Features

* e2e nightwatch ([655202f](https://github.com/vuejs/vue-cli/commit/655202f))

## cli-plugin-pwa

#### Features

* pwa ([902f6c0](https://github.com/vuejs/vue-cli/commit/902f6c0))

## cli-plugin-typescript

#### Features

* experimental support for compiling TS with Babel ([e4dcc2f](https://github.com/vuejs/vue-cli/commit/e4dcc2f))
* make tslint work for vue files ([52b587e](https://github.com/vuejs/vue-cli/commit/52b587e))
* preliminary TS plugin imeplementation ([54a902d](https://github.com/vuejs/vue-cli/commit/54a902d))
* use Babel w/ TS for polyfills ([5b19826](https://github.com/vuejs/vue-cli/commit/5b19826))

## cli-plugin-unit-jest

#### Features

* make jest plugin work with TypeScript ([ea2648e](https://github.com/vuejs/vue-cli/commit/ea2648e))

## cli-plugin-unit-mocha-webpack

#### Features

* mocha-webpack plugin ([21187b4](https://github.com/vuejs/vue-cli/commit/21187b4))

## cli-service

#### Bug Fixes

* ensure paths + make html optional ([2c1ad14](https://github.com/vuejs/vue-cli/commit/2c1ad14))
#### Features

* auto DLL ([8dff383](https://github.com/vuejs/vue-cli/commit/8dff383))
* enable caching for uglifyjs plugin ([abaed00](https://github.com/vuejs/vue-cli/commit/abaed00))
* optimize minification ([bd1ffd3](https://github.com/vuejs/vue-cli/commit/bd1ffd3))
* router & vuex ([88e9d46](https://github.com/vuejs/vue-cli/commit/88e9d46))

## cli-shared-utils

#### Features

* better validation error message ([5fef42c](https://github.com/vuejs/vue-cli/commit/5fef42c))

## eslint-config-prettier

#### Features

* complete prettier integration ([100c5c6](https://github.com/vuejs/vue-cli/commit/100c5c6))
* support Prettier eslint config (pending) ([d84df9a](https://github.com/vuejs/vue-cli/commit/d84df9a))

## other

#### Bug Fixes

* bump root deps as well ([f52ff70](https://github.com/vuejs/vue-cli/commit/f52ff70))
#### Features

* WIP jest plugin ([bb5d968](https://github.com/vuejs/vue-cli/commit/bb5d968))



