# [3.2.0](https://github.com/vuejs/vue-cli/compare/v3.1.1...v3.2.0) (2018-11-27)

## babel-preset-app

#### Features

* add `decoratorsBeforeExport` option ([bfb78a9](https://github.com/vuejs/vue-cli/commit/bfb78a9)), closes [#2974](https://github.com/vuejs/vue-cli/issues/2974)

## cli

#### Bug Fixes

* display project name validation warnings ([#2769](https://github.com/vuejs/vue-cli/issues/2769)) ([42c51c0](https://github.com/vuejs/vue-cli/commit/42c51c0))
* plugin.options can be missing when runGenerator is directly called ([d1cd4aa](https://github.com/vuejs/vue-cli/commit/d1cd4aa)), closes [#2906](https://github.com/vuejs/vue-cli/issues/2906)
#### Features

* add envinfo package via `vue info` in cli ([#2863](https://github.com/vuejs/vue-cli/issues/2863)) ([4324afb](https://github.com/vuejs/vue-cli/commit/4324afb))
* new release strategy ([#3020](https://github.com/vuejs/vue-cli/issues/3020)) ([31ffcfe](https://github.com/vuejs/vue-cli/commit/31ffcfe)), closes [#2956](https://github.com/vuejs/vue-cli/issues/2956)

## cli-plugin-eslint

#### Bug Fixes

* add cwd path prefix to globby patterns ([0149444](https://github.com/vuejs/vue-cli/commit/0149444))
* check if glob patterns matches any files before linting ([ccc146b](https://github.com/vuejs/vue-cli/commit/ccc146b)), closes [#2854](https://github.com/vuejs/vue-cli/issues/2854) [#2860](https://github.com/vuejs/vue-cli/issues/2860)
* should fallback to local eslint, fixes instant prototyping ([becde30](https://github.com/vuejs/vue-cli/commit/becde30)), closes [#2866](https://github.com/vuejs/vue-cli/issues/2866)
* specify eslintPath for eslint-loader ([077343b](https://github.com/vuejs/vue-cli/commit/077343b)), closes [#2924](https://github.com/vuejs/vue-cli/issues/2924)

## cli-plugin-typescript

#### Features

* **typescript:** respect excluded globs in tslint ([#2961](https://github.com/vuejs/vue-cli/issues/2961)) ([af4e498](https://github.com/vuejs/vue-cli/commit/af4e498))

## cli-service

#### Bug Fixes

* assetsDir can be an empty string ([5d49d57](https://github.com/vuejs/vue-cli/commit/5d49d57)), closes [#2511](https://github.com/vuejs/vue-cli/issues/2511)
* relax webpack version requirement ([73923de](https://github.com/vuejs/vue-cli/commit/73923de)), closes [#2873](https://github.com/vuejs/vue-cli/issues/2873) [#2892](https://github.com/vuejs/vue-cli/issues/2892)
* **cli-service:** do not display absolute baseUrl ([#2900](https://github.com/vuejs/vue-cli/issues/2900)) ([6d35461](https://github.com/vuejs/vue-cli/commit/6d35461))
#### Features

* add support for loading WebAssembly and ES Modules ([#2819](https://github.com/vuejs/vue-cli/issues/2819)) ([2db8d18](https://github.com/vuejs/vue-cli/commit/2db8d18))

## cli-service-global

#### Bug Fixes

* remove extraneous dependency ([7a3de17](https://github.com/vuejs/vue-cli/commit/7a3de17))

## cli-ui

#### Bug Fixes

* **plugins:** local install ([bd06cd4](https://github.com/vuejs/vue-cli/commit/bd06cd4))
* refresh page & switching between views doesn't lose selected item ([11e59f8](https://github.com/vuejs/vue-cli/commit/11e59f8))
* remove last route restore ([305c4bf](https://github.com/vuejs/vue-cli/commit/305c4bf))
* restore route making a view unnavigable ([1a34618](https://github.com/vuejs/vue-cli/commit/1a34618))
* typo in plugin invoke notification ([#2937](https://github.com/vuejs/vue-cli/issues/2937)) ([6b27ca7](https://github.com/vuejs/vue-cli/commit/6b27ca7)), closes [#2917](https://github.com/vuejs/vue-cli/issues/2917)
* **tasks:** new terminate process implementation ([2baddaa](https://github.com/vuejs/vue-cli/commit/2baddaa))
#### Features

* **plugin:** quick local plugin refresh ([91a4b2e](https://github.com/vuejs/vue-cli/commit/91a4b2e))
* **status bar:** last log animation ([ebc0ea2](https://github.com/vuejs/vue-cli/commit/ebc0ea2))

## other

#### Bug Fixes

* should publish exact version ([e87a29e](https://github.com/vuejs/vue-cli/commit/e87a29e))



