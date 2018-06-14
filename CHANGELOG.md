<a name="3.0.0-rc.2"></a>
# [3.0.0-rc.2](https://github.com/vuejs/vue-cli/compare/v3.0.0-rc.1...v3.0.0-rc.2) (2018-06-14)


### Bug Fixes

* **ui:** sharedData watchers ([f486d7e](https://github.com/vuejs/vue-cli/commit/f486d7e))
* **ui:** wrong NODE_ENV value if undefined ([09b72eb](https://github.com/vuejs/vue-cli/commit/09b72eb))
* **ui:** wwebpack dashboard performance improvements ([9f5dda4](https://github.com/vuejs/vue-cli/commit/9f5dda4))


### Features

* **ui:** modern build mode ([dbf7231](https://github.com/vuejs/vue-cli/commit/dbf7231))



<a name="3.0.0-rc.1"></a>
# [3.0.0-rc.1](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.16...v3.0.0-rc.1) (2018-06-13)


### Bug Fixes

* asset output relative check ([1195aee](https://github.com/vuejs/vue-cli/commit/1195aee)), closes [#1545](https://github.com/vuejs/vue-cli/issues/1545)
* check more files for links ([182f3b7](https://github.com/vuejs/vue-cli/commit/182f3b7))
* clear children modules from cache ([50027c6](https://github.com/vuejs/vue-cli/commit/50027c6))
* fix custom mode NODE_ENV regression ([60de7c4](https://github.com/vuejs/vue-cli/commit/60de7c4)), closes [#1528](https://github.com/vuejs/vue-cli/issues/1528)
* runtimeCompiler default ([e15fa20](https://github.com/vuejs/vue-cli/commit/e15fa20))
* should repsect configureWebpack hooks when resolving app config ([a7564d6](https://github.com/vuejs/vue-cli/commit/a7564d6))
* **ui:** dark mode nav button badge counters ([0ba3920](https://github.com/vuejs/vue-cli/commit/0ba3920))
* transform es modules syntax for Jest when not using Babel ([65d5d36](https://github.com/vuejs/vue-cli/commit/65d5d36)), closes [#1524](https://github.com/vuejs/vue-cli/issues/1524)
* **build:** --target app should respect inline entry as well ([323a38c](https://github.com/vuejs/vue-cli/commit/323a38c)), closes [#1533](https://github.com/vuejs/vue-cli/issues/1533)
* **ui:** bail access denied folders ([5984a0d](https://github.com/vuejs/vue-cli/commit/5984a0d))
* **ui:** create: first feature removed if 'use config files' not checked ([b361473](https://github.com/vuejs/vue-cli/commit/b361473))
* **ui:** CSS Pre-processors "More info" link leads to 404 ([#1534](https://github.com/vuejs/vue-cli/issues/1534)) ([919bcbb](https://github.com/vuejs/vue-cli/commit/919bcbb))
* **ui:** improve task logs performance ([36908a9](https://github.com/vuejs/vue-cli/commit/36908a9))
* **ui:** increase terminal output scrollback ([292c35f](https://github.com/vuejs/vue-cli/commit/292c35f))
* use devServer.public to build sockjsUrl, if defined. ([#1526](https://github.com/vuejs/vue-cli/issues/1526)) ([f0498f6](https://github.com/vuejs/vue-cli/commit/f0498f6))
* **ui:** IPC conflict ([1fcd2d0](https://github.com/vuejs/vue-cli/commit/1fcd2d0))
* **ui:** nav button bullet border color ([aee5c93](https://github.com/vuejs/vue-cli/commit/aee5c93))
* **ui:** nav button custom image align ([99b030a](https://github.com/vuejs/vue-cli/commit/99b030a))
* **ui:** reload plugin api after plugin update ([be3d538](https://github.com/vuejs/vue-cli/commit/be3d538))
* **ui:** reset apollo store on reconnect ([caf31a1](https://github.com/vuejs/vue-cli/commit/caf31a1))
* **ui:** save db in user home ([6e1f735](https://github.com/vuejs/vue-cli/commit/6e1f735))
* **ui:** Suggestions API fixes ([e7e2fb2](https://github.com/vuejs/vue-cli/commit/e7e2fb2))
* **ui:** task command too long ([9426f38](https://github.com/vuejs/vue-cli/commit/9426f38))
* **unit-mocha:** node externals are unnecessary for testing client code ([460c200](https://github.com/vuejs/vue-cli/commit/460c200)), closes [#1548](https://github.com/vuejs/vue-cli/issues/1548)


### Features

* **ui:** api.hasPlugin(id) ([8fae98e](https://github.com/vuejs/vue-cli/commit/8fae98e))
* **ui:** config improvements ([#1487](https://github.com/vuejs/vue-cli/issues/1487)) ([dbef5e9](https://github.com/vuejs/vue-cli/commit/dbef5e9))
* **ui:** dark mode ([#1512](https://github.com/vuejs/vue-cli/issues/1512)) ([e258f5a](https://github.com/vuejs/vue-cli/commit/e258f5a))
* **ui:** devtools suggestion ([0a2ea1f](https://github.com/vuejs/vue-cli/commit/0a2ea1f))
* **ui:** git commit message + disable git ([#1541](https://github.com/vuejs/vue-cli/issues/1541)) ([29c1ce5](https://github.com/vuejs/vue-cli/commit/29c1ce5))
* apply minimal transpilation when building as web component ([3b2cc6b](https://github.com/vuejs/vue-cli/commit/3b2cc6b))
* modern mode ([204d8f0](https://github.com/vuejs/vue-cli/commit/204d8f0))
* vue-cli-service build --report/--report-json ([272ef5e](https://github.com/vuejs/vue-cli/commit/272ef5e))
* **ui:** jest task ([692d463](https://github.com/vuejs/vue-cli/commit/692d463))
* **ui:** new hooks for plugins ([8ba6bcf](https://github.com/vuejs/vue-cli/commit/8ba6bcf))
* **ui:** open eslintrc suggestion ([a26669c](https://github.com/vuejs/vue-cli/commit/a26669c))
* **ui:** PluginApi: notify ([e35ee25](https://github.com/vuejs/vue-cli/commit/e35ee25))
* **ui:** pwa open vue config/manifest suggestions ([e57e749](https://github.com/vuejs/vue-cli/commit/e57e749))
* **ui:** status color bullet on tasks with image icon ([9aec563](https://github.com/vuejs/vue-cli/commit/9aec563))
* **ui:** suggestion and progress PluginAPI + add vue-router/vuex suggestions ([9b068b1](https://github.com/vuejs/vue-cli/commit/9b068b1))


### BREAKING CHANGES

* **ui:** - The configuration API has changed.
- The `files` options now accept an object of different config files:

```js
api.describeConfig({
  /* ... */
  // All possible files for this config
  files: {
    // eslintrc.js
    eslint: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      // Will read from `package.json`
      package: 'eslintConfig'
    },
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

- The `onWrite` api has changed: `setData` and `assignData` have now `fileId` as the first argument:

```js
api.describeConfig({
  onWrite: async ({ api, prompts }) => {
    const eslintData = {}
    const vueData = {}
    for (const prompt of prompts) {
      // eslintrc
      if (prompt.id.indexOf('vue/') === 0) {
        eslintData[`rules.${prompt.id}`] = await api.getAnswer(prompt.id, JSON.parse)
      } else {
        // vue.config.js
        vueData[prompt.id] = await api.getAnswer(prompt.id)
      }
    }
    api.setData('eslint', eslintData)
    api.setData('vue', vueData)
  }
})
```

Other changes

- Config tabs (optional):

```js
api.describeConfig({
  /* ... */
  onRead: ({ data, cwd }) => ({
    tabs: [
      {
        id: 'tab1',
        label: 'My tab',
        // Optional
        icon: 'application_settings',
        prompts: [
          // Prompt objects
        ]
      },
      {
        id: 'tab2',
        label: 'My other tab',
        prompts: [
          // Prompt objects
        ]
      }
    ]
  })
})
```



<a name="3.0.0-beta.16"></a>
# [3.0.0-beta.16](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.15...v3.0.0-beta.16) (2018-06-08)


### Bug Fixes

* avoid injecting polyfills when targeting node ([586c8aa](https://github.com/vuejs/vue-cli/commit/586c8aa))
* avoid util.promisify when resolving webpack.config.js ([89a0e65](https://github.com/vuejs/vue-cli/commit/89a0e65)), closes [#1473](https://github.com/vuejs/vue-cli/issues/1473)
* bail when registry ping fails ([be5526e](https://github.com/vuejs/vue-cli/commit/be5526e)), closes [#1427](https://github.com/vuejs/vue-cli/issues/1427)
* fine tune chunk splitting ([4db901c](https://github.com/vuejs/vue-cli/commit/4db901c)), closes [#1488](https://github.com/vuejs/vue-cli/issues/1488)
* fix invoke output ([d65a251](https://github.com/vuejs/vue-cli/commit/d65a251))
* **ui:** top bar children margin ([cd88b47](https://github.com/vuejs/vue-cli/commit/cd88b47))
* only provide baseUrl fix if baseUrl provided ([#1421](https://github.com/vuejs/vue-cli/issues/1421)) ([af1151a](https://github.com/vuejs/vue-cli/commit/af1151a))
* **build:** default to development mode in build --watch ([#1430](https://github.com/vuejs/vue-cli/issues/1430)) ([3193b0d](https://github.com/vuejs/vue-cli/commit/3193b0d))
* **env:** preserve existing env vars so load in reverse order. ([#1503](https://github.com/vuejs/vue-cli/issues/1503)) ([7c1ef24](https://github.com/vuejs/vue-cli/commit/7c1ef24))
* **serve:** make sockjs url fixed with host ([#1476](https://github.com/vuejs/vue-cli/issues/1476)) ([2cbe373](https://github.com/vuejs/vue-cli/commit/2cbe373))
* **ui:** check current project still exists ([251509c](https://github.com/vuejs/vue-cli/commit/251509c))
* **ui:** correct i18n mistake ([#1445](https://github.com/vuejs/vue-cli/issues/1445)) ([dc07315](https://github.com/vuejs/vue-cli/commit/dc07315))
* **ui:** int loading z-index ([68f273a](https://github.com/vuejs/vue-cli/commit/68f273a))
* Remove duplicated "the" ([#1493](https://github.com/vuejs/vue-cli/issues/1493)) ([6e32164](https://github.com/vuejs/vue-cli/commit/6e32164))
* **ui:** limit description length in plugin search ([588ad75](https://github.com/vuejs/vue-cli/commit/588ad75))
* **ui:** progress screen z-index ([0366ec3](https://github.com/vuejs/vue-cli/commit/0366ec3))
* **ui:** tests ([bfebc6d](https://github.com/vuejs/vue-cli/commit/bfebc6d))
* **ui:** yarn link [@vue](https://github.com/vue)/ui ([145492b](https://github.com/vuejs/vue-cli/commit/145492b))
* pwa plugin should be ignored when target is not app ([85e6e5e](https://github.com/vuejs/vue-cli/commit/85e6e5e)), closes [#1497](https://github.com/vuejs/vue-cli/issues/1497)
* resolve.symlinks to false so that node_modules exclusion works ([5b4df14](https://github.com/vuejs/vue-cli/commit/5b4df14))
* should not inject babel-core shim if babel plugin is not used ([a91d022](https://github.com/vuejs/vue-cli/commit/a91d022)), closes [#1424](https://github.com/vuejs/vue-cli/issues/1424)
* use fallback module resolve for Node version < 10 ([12d51fd](https://github.com/vuejs/vue-cli/commit/12d51fd)), closes [#1486](https://github.com/vuejs/vue-cli/issues/1486)


### Code Refactoring

* **ui:** Config & task icons ([#1450](https://github.com/vuejs/vue-cli/issues/1450)) ([1c8f195](https://github.com/vuejs/vue-cli/commit/1c8f195))


### Features

* allow configuring css-loader options via css.loaderOptions.css ([7d06f09](https://github.com/vuejs/vue-cli/commit/7d06f09)), closes [#1484](https://github.com/vuejs/vue-cli/issues/1484)
* allow configuring postcss-loader via css.loaderOptions.postcss ([0ba111e](https://github.com/vuejs/vue-cli/commit/0ba111e))
* allow using relative baseUrl ([dc38211](https://github.com/vuejs/vue-cli/commit/dc38211))
* bail when user directly mutate output.publicPath ([1732007](https://github.com/vuejs/vue-cli/commit/1732007))
* **xdg-compliance:** rc file location hierarchy ([#1326](https://github.com/vuejs/vue-cli/issues/1326)) ([ec87266](https://github.com/vuejs/vue-cli/commit/ec87266)), closes [#1325](https://github.com/vuejs/vue-cli/issues/1325)
* bump TypeScript to 2.9 ([7b90fdc](https://github.com/vuejs/vue-cli/commit/7b90fdc))
* ui tweaks & fixes ([#1409](https://github.com/vuejs/vue-cli/issues/1409)) ([7354525](https://github.com/vuejs/vue-cli/commit/7354525))
* upgrade jest to 23.1.0 ([7e38f98](https://github.com/vuejs/vue-cli/commit/7e38f98))
* **build:** support named exports when building --target lib with js/ts entry ([1dc47eb](https://github.com/vuejs/vue-cli/commit/1dc47eb)), closes [#1436](https://github.com/vuejs/vue-cli/issues/1436)
* **cli-service:** support --no-clean flag ([#1457](https://github.com/vuejs/vue-cli/issues/1457)) ([c19bbff](https://github.com/vuejs/vue-cli/commit/c19bbff)), closes [#1446](https://github.com/vuejs/vue-cli/issues/1446)
* **e2e-cypress:** upgrade cypress to 3.0 ([a81f7ad](https://github.com/vuejs/vue-cli/commit/a81f7ad)), closes [#1477](https://github.com/vuejs/vue-cli/issues/1477)
* **lint:** default to lint tsx files  ([#1460](https://github.com/vuejs/vue-cli/issues/1460)) ([838f6a2](https://github.com/vuejs/vue-cli/commit/838f6a2))
* **ui:** Display cli-service in plugins view (so it can be upgraded) ([#1422](https://github.com/vuejs/vue-cli/issues/1422)) ([f42632b](https://github.com/vuejs/vue-cli/commit/f42632b))
* **ui:** update all plugin to wanted version button ([#1456](https://github.com/vuejs/vue-cli/issues/1456)) ([98b6d26](https://github.com/vuejs/vue-cli/commit/98b6d26))


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



<a name="3.0.0-beta.15"></a>
# [3.0.0-beta.15](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.14...v3.0.0-beta.15) (2018-05-30)


### Bug Fixes

* **cli-service:** make devBaseUrl work properly in serve command ([#1405](https://github.com/vuejs/vue-cli/issues/1405)) ([04600e6](https://github.com/vuejs/vue-cli/commit/04600e6))
* **typescript:** avoid including router file when router is not selected ([4d00161](https://github.com/vuejs/vue-cli/commit/4d00161))
* **unit-mocha:** ensure correct mode for webpack config ([e17f78c](https://github.com/vuejs/vue-cli/commit/e17f78c)), closes [#1389](https://github.com/vuejs/vue-cli/issues/1389)
* e2e runner args passing ([05391b6](https://github.com/vuejs/vue-cli/commit/05391b6)), closes [#1393](https://github.com/vuejs/vue-cli/issues/1393)
* remove console.log ([7d98d69](https://github.com/vuejs/vue-cli/commit/7d98d69))
* require.resolve fallback on node < 8.10.0 ([#1404](https://github.com/vuejs/vue-cli/issues/1404)) ([ef2ecf5](https://github.com/vuejs/vue-cli/commit/ef2ecf5)), closes [#1369](https://github.com/vuejs/vue-cli/issues/1369)
* UI fixes ([#1397](https://github.com/vuejs/vue-cli/issues/1397)) ([4f39461](https://github.com/vuejs/vue-cli/commit/4f39461))


### Features

* respect baseUrl during development ([a9e1286](https://github.com/vuejs/vue-cli/commit/a9e1286))


### Performance Improvements

* use importHelpers: true in tsconfig.json ([60f0a0a](https://github.com/vuejs/vue-cli/commit/60f0a0a))


### BREAKING CHANGES

* `devBaseUrl` option has been removed. `baseUrl` now works for
both development and production. To use different paths for prod/dev, use
conditional values based on `process.env.NODE_ENV` in `vue.config.js`.



<a name="3.0.0-beta.14"></a>
# [3.0.0-beta.14](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.12...v3.0.0-beta.14) (2018-05-29)


### Bug Fixes

* **ui:** add missing dependency ([3bcc511](https://github.com/vuejs/vue-cli/commit/3bcc511))
* fix caching dependency (close [#1384](https://github.com/vuejs/vue-cli/issues/1384)) ([9846cd5](https://github.com/vuejs/vue-cli/commit/9846cd5))
* **ui:** fix beta.12 feedback ([#1386](https://github.com/vuejs/vue-cli/issues/1386)) ([a3b2be8](https://github.com/vuejs/vue-cli/commit/a3b2be8))


### Features

* add --copy option for vue-cli-service serve ([#1355](https://github.com/vuejs/vue-cli/issues/1355)) ([5e95b3d](https://github.com/vuejs/vue-cli/commit/5e95b3d))



<a name="3.0.0-beta.12"></a>
# [3.0.0-beta.12](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.11...v3.0.0-beta.12) (2018-05-29)


### Bug Fixes

* **build:** only modify css extraction if its enabled ([9a4159d](https://github.com/vuejs/vue-cli/commit/9a4159d)), closes [#1378](https://github.com/vuejs/vue-cli/issues/1378)
* **typescript:** ensure ts-loader options can be stringified for thread-loader ([023e022](https://github.com/vuejs/vue-cli/commit/023e022)), closes [#1367](https://github.com/vuejs/vue-cli/issues/1367)
* **ui:** chdir ([133cdfb](https://github.com/vuejs/vue-cli/commit/133cdfb))
* **ui:** env var names ([207a630](https://github.com/vuejs/vue-cli/commit/207a630))
* **ui:** eslint lint on save default ([0f30639](https://github.com/vuejs/vue-cli/commit/0f30639))
* **ui:** force output colors ([4d0b690](https://github.com/vuejs/vue-cli/commit/4d0b690))
* **ui:** mock install/uninstall in debug mode ([e759b2c](https://github.com/vuejs/vue-cli/commit/e759b2c))
* **ui:** pwa config: manifest.json indentation ([27e66a8](https://github.com/vuejs/vue-cli/commit/27e66a8))
* **ui:** task terminated status on Windows ([ea95c52](https://github.com/vuejs/vue-cli/commit/ea95c52))
* **ui:** tsconfig ([7482244](https://github.com/vuejs/vue-cli/commit/7482244))
* make umd build usable in Node ([c12f240](https://github.com/vuejs/vue-cli/commit/c12f240)), closes [#1348](https://github.com/vuejs/vue-cli/issues/1348)
* **ui:** use debug mode ([24d5e7b](https://github.com/vuejs/vue-cli/commit/24d5e7b))
* **ui:** watch only locales folder if exists ([73a1c7a](https://github.com/vuejs/vue-cli/commit/73a1c7a))
* **ui:** webpack error after creating a new project ([1c95dc2](https://github.com/vuejs/vue-cli/commit/1c95dc2))
* **ui:** Windows compat ([bf76950](https://github.com/vuejs/vue-cli/commit/bf76950))
* **ui:** wrong env var name ([12129b3](https://github.com/vuejs/vue-cli/commit/12129b3))
* use mode development ([94de904](https://github.com/vuejs/vue-cli/commit/94de904))


### Code Refactoring

* compiler -> runtimeCompiler ([ebffdf0](https://github.com/vuejs/vue-cli/commit/ebffdf0))


### Features

* **ui:** auto clean projects list ([d2a9d0f](https://github.com/vuejs/vue-cli/commit/d2a9d0f))
* **ui:** update to latest vue-cli-plugin-apollo ([873d14d](https://github.com/vuejs/vue-cli/commit/873d14d))
* make public dir optional ([1719622](https://github.com/vuejs/vue-cli/commit/1719622)), closes [#1265](https://github.com/vuejs/vue-cli/issues/1265)
* re-introduce css.modules option ([1e98d96](https://github.com/vuejs/vue-cli/commit/1e98d96))
* support multi-page app via `pages` option ([869f005](https://github.com/vuejs/vue-cli/commit/869f005))
* tweak css extraction chunk name ([f0fd375](https://github.com/vuejs/vue-cli/commit/f0fd375))


### Performance Improvements

* adjust caching and parallelization ([1075576](https://github.com/vuejs/vue-cli/commit/1075576))
* enable vue-loader template compilation caching ([8fe554c](https://github.com/vuejs/vue-cli/commit/8fe554c))
* revert babel/ts thread behavior ([e5101b4](https://github.com/vuejs/vue-cli/commit/e5101b4))


### BREAKING CHANGES

* `compiler` option has been renamed to `runtimeCompiler`
* internal webpack rules for CSS have been changed.



<a name="3.0.0-beta.11"></a>
# [3.0.0-beta.11](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.10...v3.0.0-beta.11) (2018-05-21)


### Bug Fixes

* **css:** css-loader importLoaders should account for vue-loader's injected ([853662c](https://github.com/vuejs/vue-cli/commit/853662c)), closes [#1267](https://github.com/vuejs/vue-cli/issues/1267)
* **eslint:** ensure all config values are contained in config file ([83f5f4f](https://github.com/vuejs/vue-cli/commit/83f5f4f)), closes [#1006](https://github.com/vuejs/vue-cli/issues/1006) [#1313](https://github.com/vuejs/vue-cli/issues/1313)
* **ui:** client addon config ([0627609](https://github.com/vuejs/vue-cli/commit/0627609))
* **ui:** config: create first file if no file exists ([017e7b9](https://github.com/vuejs/vue-cli/commit/017e7b9))
* **ui:** config: more info bottom button style ([62609b9](https://github.com/vuejs/vue-cli/commit/62609b9))
* **ui:** eslint no-console warnings ([d4f41fc](https://github.com/vuejs/vue-cli/commit/d4f41fc))
* **ui:** eslint no-console warnings ([e777a16](https://github.com/vuejs/vue-cli/commit/e777a16))
* **ui:** more strings localized ([7f7374b](https://github.com/vuejs/vue-cli/commit/7f7374b))
* **ui:** more strings now localized ([69a817e](https://github.com/vuejs/vue-cli/commit/69a817e))
* **ui:** prevent duplicate views ([e011bc0](https://github.com/vuejs/vue-cli/commit/e011bc0))
* css sourceMap in production ([#1270](https://github.com/vuejs/vue-cli/issues/1270)) ([2d09a4c](https://github.com/vuejs/vue-cli/commit/2d09a4c))
* fix babel.config.js compat in vue-jest ([48d7e00](https://github.com/vuejs/vue-cli/commit/48d7e00))
* fix transpileDependencies by always using babel.config.js ([1279b3e](https://github.com/vuejs/vue-cli/commit/1279b3e))
* fix ts/tsx rule separation ([41a56f1](https://github.com/vuejs/vue-cli/commit/41a56f1)), closes [#1315](https://github.com/vuejs/vue-cli/issues/1315)
* handle failed git commit ([a1ccde8](https://github.com/vuejs/vue-cli/commit/a1ccde8)), closes [#1306](https://github.com/vuejs/vue-cli/issues/1306)
* rename test-utils `shallow` to `shallowMount` ([#1269](https://github.com/vuejs/vue-cli/issues/1269)) ([5c54df7](https://github.com/vuejs/vue-cli/commit/5c54df7))
* stringifyJS should be used in all call sites ([07ac887](https://github.com/vuejs/vue-cli/commit/07ac887))
* terminated from warn to info ([3c78d90](https://github.com/vuejs/vue-cli/commit/3c78d90))
* **ui:** prompt confirm checked ([3426736](https://github.com/vuejs/vue-cli/commit/3426736))
* **ui:** prompt input being reset by lagging sync ([bafcaae](https://github.com/vuejs/vue-cli/commit/bafcaae))
* **ui:** prompt regression ([81a5afb](https://github.com/vuejs/vue-cli/commit/81a5afb))
* **ui:** remove console.log ([eab3c11](https://github.com/vuejs/vue-cli/commit/eab3c11))
* **ui:** upgrade DashboardPlugin to webpack 4 ([107f471](https://github.com/vuejs/vue-cli/commit/107f471))
* **ui:** vue inspect localization ([9c17e2a](https://github.com/vuejs/vue-cli/commit/9c17e2a))
* typo in vue-loader compilerOptions ([#1263](https://github.com/vuejs/vue-cli/issues/1263)) ([b2b277a](https://github.com/vuejs/vue-cli/commit/b2b277a))
* **ui:** wrong import ([b220b18](https://github.com/vuejs/vue-cli/commit/b220b18))


### Features

* **build:** add 'watch' option ([#1332](https://github.com/vuejs/vue-cli/issues/1332)) ([6ea17c9](https://github.com/vuejs/vue-cli/commit/6ea17c9))
* **cli-service:** add assetsDir option to specify assets root directory ([#1322](https://github.com/vuejs/vue-cli/issues/1322)) ([9638d90](https://github.com/vuejs/vue-cli/commit/9638d90)), closes [#1311](https://github.com/vuejs/vue-cli/issues/1311)
* **eslint:** add --max-warnings and --max-errors for cli-plugin-eslint ([#1289](https://github.com/vuejs/vue-cli/issues/1289)) ([ab877a2](https://github.com/vuejs/vue-cli/commit/ab877a2)), closes [#1268](https://github.com/vuejs/vue-cli/issues/1268)
* **eslint:** enable caching ([ff0f97b](https://github.com/vuejs/vue-cli/commit/ff0f97b))
* **eslint:** pass cli arguments to linter ([#1258](https://github.com/vuejs/vue-cli/issues/1258)) ([9ac2642](https://github.com/vuejs/vue-cli/commit/9ac2642)), closes [#1255](https://github.com/vuejs/vue-cli/issues/1255)
* **inspect:** add --rule and --plugin options for inspect command ([82349ba](https://github.com/vuejs/vue-cli/commit/82349ba))
* **inspect:** add --rules and --plugins options for inspect command ([fd1c0d5](https://github.com/vuejs/vue-cli/commit/fd1c0d5))
* **inspect:** improve `vue inspect` output with webpack-chain hints ([f6bfb63](https://github.com/vuejs/vue-cli/commit/f6bfb63)), closes [#881](https://github.com/vuejs/vue-cli/issues/881)
* ask for whether to use taobao registry when getting versions ([#1273](https://github.com/vuejs/vue-cli/issues/1273)) ([8fbbd35](https://github.com/vuejs/vue-cli/commit/8fbbd35))
* **ui:** add build watch parameter ([c6f2eea](https://github.com/vuejs/vue-cli/commit/c6f2eea))
* **ui:** api.addTask() ([215cc20](https://github.com/vuejs/vue-cli/commit/215cc20))
* **ui:** auto select features ([0181223](https://github.com/vuejs/vue-cli/commit/0181223))
* **ui:** babel feature description ([7e5bf61](https://github.com/vuejs/vue-cli/commit/7e5bf61))
* **ui:** cypress task ([7ecbd2a](https://github.com/vuejs/vue-cli/commit/7ecbd2a))
* **ui:** nightwatch task ([76f95c8](https://github.com/vuejs/vue-cli/commit/76f95c8))
* **ui:** project create error ([2f94a85](https://github.com/vuejs/vue-cli/commit/2f94a85))
* **ui:** prompt type 'color' ([3742e65](https://github.com/vuejs/vue-cli/commit/3742e65))
* allow disabling serve progress via devServer.progress ([da38747](https://github.com/vuejs/vue-cli/commit/da38747)), closes [#1284](https://github.com/vuejs/vue-cli/issues/1284)
* allow router/vuex to be late added via `vue add` ([2a195f0](https://github.com/vuejs/vue-cli/commit/2a195f0)), closes [#1202](https://github.com/vuejs/vue-cli/issues/1202) [#1204](https://github.com/vuejs/vue-cli/issues/1204)
* **ui:** task params modal info ([6661a13](https://github.com/vuejs/vue-cli/commit/6661a13))
* GeneratorAPI: addImports & addRootOptions ([8b32f4a](https://github.com/vuejs/vue-cli/commit/8b32f4a))
* make it possible to opt-out of Babel ([d75ea99](https://github.com/vuejs/vue-cli/commit/d75ea99)), closes [#1199](https://github.com/vuejs/vue-cli/issues/1199)
* support `<style lang="postcss">` ([#1259](https://github.com/vuejs/vue-cli/issues/1259)) ([1037b9c](https://github.com/vuejs/vue-cli/commit/1037b9c))
* support webp ([763cf7a](https://github.com/vuejs/vue-cli/commit/763cf7a)), closes [#1321](https://github.com/vuejs/vue-cli/issues/1321)
* temporarily fix source map by patching babel ([453597a](https://github.com/vuejs/vue-cli/commit/453597a))



<a name="3.0.0-beta.10"></a>
# [3.0.0-beta.10](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.9...v3.0.0-beta.10) (2018-05-11)


### Bug Fixes

* **build:** fix --dest flag regression ([fd9d255](https://github.com/vuejs/vue-cli/commit/fd9d255)), closes [#1193](https://github.com/vuejs/vue-cli/issues/1193)
* **serve:** fix non-GET requests match error w/ multi-proxy config ([c4c4bff](https://github.com/vuejs/vue-cli/commit/c4c4bff)), closes [#1210](https://github.com/vuejs/vue-cli/issues/1210)
* **tslint:** don't change working directory ([#1225](https://github.com/vuejs/vue-cli/issues/1225)) ([8dbe262](https://github.com/vuejs/vue-cli/commit/8dbe262))
* **typescript:** add node_modules/** to tslint default excludes ([#1200](https://github.com/vuejs/vue-cli/issues/1200)) ([a6e47ce](https://github.com/vuejs/vue-cli/commit/a6e47ce)), closes [#1194](https://github.com/vuejs/vue-cli/issues/1194)
* **typescript:** separate tsx shim ([51c8090](https://github.com/vuejs/vue-cli/commit/51c8090)), closes [#1198](https://github.com/vuejs/vue-cli/issues/1198)
* **ui:** App name prompt description ([b6928a3](https://github.com/vuejs/vue-cli/commit/b6928a3))
* **ui:** bump fs-extra ([adce5f0](https://github.com/vuejs/vue-cli/commit/adce5f0))
* **ui:** client addon config ([086b714](https://github.com/vuejs/vue-cli/commit/086b714))
* **ui:** CSS fixes ([5b5d754](https://github.com/vuejs/vue-cli/commit/5b5d754))
* **ui:** display tooltip on config list items in case description is too long ([a55cec7](https://github.com/vuejs/vue-cli/commit/a55cec7))
* **ui:** don't save loader results into cache ([3208844](https://github.com/vuejs/vue-cli/commit/3208844))
* **ui:** eslint errors ([3433658](https://github.com/vuejs/vue-cli/commit/3433658))
* **ui:** eslint warnings ([9d87b35](https://github.com/vuejs/vue-cli/commit/9d87b35))
* **ui:** merge locales ([ae552a9](https://github.com/vuejs/vue-cli/commit/ae552a9))
* deps cleanup ([46a559f](https://github.com/vuejs/vue-cli/commit/46a559f))
* **ui:** missing cross-env ([eb9a604](https://github.com/vuejs/vue-cli/commit/eb9a604))
* **ui:** missing log ([c135782](https://github.com/vuejs/vue-cli/commit/c135782))
* **ui:** moved watch to deps ([013a903](https://github.com/vuejs/vue-cli/commit/013a903))
* **ui:** New update available message adapted ([1b77f51](https://github.com/vuejs/vue-cli/commit/1b77f51))
* **ui:** open project: check if folder exists ([0e8e0ce](https://github.com/vuejs/vue-cli/commit/0e8e0ce))
* **ui:** project create change folder not working in Firefox ([2927095](https://github.com/vuejs/vue-cli/commit/2927095))
* **ui:** ProjectNav wide style tweaks ([3589818](https://github.com/vuejs/vue-cli/commit/3589818))
* css imports from js ([1b5bdde](https://github.com/vuejs/vue-cli/commit/1b5bdde))
* ensure dynamic publicPath is set early in lib/wc mode ([c3d246f](https://github.com/vuejs/vue-cli/commit/c3d246f)), closes [#1253](https://github.com/vuejs/vue-cli/issues/1253)
* **ui:** remove eslint disable comment ([3b7f292](https://github.com/vuejs/vue-cli/commit/3b7f292))
* improve error message when entry is missing w/ --target lib ([8b4a112](https://github.com/vuejs/vue-cli/commit/8b4a112)), closes [#1051](https://github.com/vuejs/vue-cli/issues/1051)
* **ui:** ProjectNavButton bullet position in wide mode ([9a852d6](https://github.com/vuejs/vue-cli/commit/9a852d6))
* pwa plugin compat with webpack 4 ([6d1716e](https://github.com/vuejs/vue-cli/commit/6d1716e))
* **ui:** ProjectNavMore wide ([28558ea](https://github.com/vuejs/vue-cli/commit/28558ea))
* **ui:** remove unused script ([4f3337d](https://github.com/vuejs/vue-cli/commit/4f3337d))
* respect chunk name in all build targets ([66bab8c](https://github.com/vuejs/vue-cli/commit/66bab8c)), closes [#1251](https://github.com/vuejs/vue-cli/issues/1251)
* **ui:** removed builtin japan locale ([77f0034](https://github.com/vuejs/vue-cli/commit/77f0034))
* **ui:** ui command: display URL ([aa2783d](https://github.com/vuejs/vue-cli/commit/aa2783d))
* **ui:** unhandled auto project open error ([5b232f9](https://github.com/vuejs/vue-cli/commit/5b232f9))
* **ui:** unset last opened project if it is removed ([29e2d76](https://github.com/vuejs/vue-cli/commit/29e2d76))
* **ui:** use fs-extra instead of mkdirp ([8915a6f](https://github.com/vuejs/vue-cli/commit/8915a6f))
* **ui:** wide project nav buttons alignment ([855cbea](https://github.com/vuejs/vue-cli/commit/855cbea))


### Code Refactoring

* adjust mode loading order ([d595ada](https://github.com/vuejs/vue-cli/commit/d595ada)), closes [#959](https://github.com/vuejs/vue-cli/issues/959)
* rename test commands ([69ebd80](https://github.com/vuejs/vue-cli/commit/69ebd80)), closes [#876](https://github.com/vuejs/vue-cli/issues/876) [#878](https://github.com/vuejs/vue-cli/issues/878)
* require Node 8 ([6b865db](https://github.com/vuejs/vue-cli/commit/6b865db))


### Features

* default preset save to no ([ab90d50](https://github.com/vuejs/vue-cli/commit/ab90d50)), closes [#1212](https://github.com/vuejs/vue-cli/issues/1212)
* **babel:** better Babel polyfill defaults ([4e7d57f](https://github.com/vuejs/vue-cli/commit/4e7d57f))
* **cli:** allow local .json files for presets ([#1201](https://github.com/vuejs/vue-cli/issues/1201)) ([9766db1](https://github.com/vuejs/vue-cli/commit/9766db1)), closes [#1068](https://github.com/vuejs/vue-cli/issues/1068)
* **serve:** support entry in `vue-cli-service serve` ([05f9f3a](https://github.com/vuejs/vue-cli/commit/05f9f3a)), closes [#974](https://github.com/vuejs/vue-cli/issues/974)
* **typescript:** support lang="tsx" in vue files ([718ba3c](https://github.com/vuejs/vue-cli/commit/718ba3c)), closes [#1219](https://github.com/vuejs/vue-cli/issues/1219)
* **ui:** config more info button ([98f6a16](https://github.com/vuejs/vue-cli/commit/98f6a16))
* **ui:** db click on task to run ([104aba2](https://github.com/vuejs/vue-cli/commit/104aba2))
* **ui:** dev mode ([fef2f78](https://github.com/vuejs/vue-cli/commit/fef2f78))
* **ui:** dev: auto reload locales ([86c9674](https://github.com/vuejs/vue-cli/commit/86c9674))
* **ui:** ItemLogo recognize images in 'icon' field ([9898dc0](https://github.com/vuejs/vue-cli/commit/9898dc0))
* **ui:** JS config support ([8711636](https://github.com/vuejs/vue-cli/commit/8711636))
* **ui:** PWA config + ESLint extra config ([2eac8ff](https://github.com/vuejs/vue-cli/commit/2eac8ff))
* expose env variables as root level in index.html template ([4c5784d](https://github.com/vuejs/vue-cli/commit/4c5784d))
* new option "preserveWhitespace" ([ea83441](https://github.com/vuejs/vue-cli/commit/ea83441))
* **ui:** localize report bug button ([f32222f](https://github.com/vuejs/vue-cli/commit/f32222f))
* **ui:** plugin locales ([a66dabb](https://github.com/vuejs/vue-cli/commit/a66dabb))
* relex transpile includes + new transpileDependencies option ([da4d0b2](https://github.com/vuejs/vue-cli/commit/da4d0b2))
* remove DLL option ([6d4e51d](https://github.com/vuejs/vue-cli/commit/6d4e51d))
* support { prompts: true } for preset plugins ([3dd38da](https://github.com/vuejs/vue-cli/commit/3dd38da)), closes [#952](https://github.com/vuejs/vue-cli/issues/952)
* upgrade to vue-loader 15 ([f5c0f58](https://github.com/vuejs/vue-cli/commit/f5c0f58))
* upgrade to webpack 4 ([2dcdedd](https://github.com/vuejs/vue-cli/commit/2dcdedd))
* **ui:** ShareData two-way sync + watchSharedData + storage API + dev logs ([4cb15f3](https://github.com/vuejs/vue-cli/commit/4cb15f3))


### Reverts

* feat: new option "preserveWhitespace"" ([a8af883](https://github.com/vuejs/vue-cli/commit/a8af883))


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



<a name="3.0.0-beta.9"></a>
# [3.0.0-beta.9](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.8...v3.0.0-beta.9) (2018-04-28)


### Bug Fixes

* **dependencies:** add deepmerge dependencies ([#1188](https://github.com/vuejs/vue-cli/issues/1188)) ([67fa39d](https://github.com/vuejs/vue-cli/commit/67fa39d)), closes [#1187](https://github.com/vuejs/vue-cli/issues/1187)


### Features

* **ui:** ProjectNav: display labels when screen is wide ([0340dee](https://github.com/vuejs/vue-cli/commit/0340dee))



<a name="3.0.0-beta.8"></a>
# [3.0.0-beta.8](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.7...v3.0.0-beta.8) (2018-04-27)


### Bug Fixes

* --target lib/wc should overwrite user entry/output ([92e136a](https://github.com/vuejs/vue-cli/commit/92e136a)), closes [#1072](https://github.com/vuejs/vue-cli/issues/1072)
* add name to chunk file output ([#1173](https://github.com/vuejs/vue-cli/issues/1173)) ([1fc9593](https://github.com/vuejs/vue-cli/commit/1fc9593))
* allow user to define testMatch in package.json ([#1069](https://github.com/vuejs/vue-cli/issues/1069)) ([cac18f2](https://github.com/vuejs/vue-cli/commit/cac18f2)), closes [#1067](https://github.com/vuejs/vue-cli/issues/1067)
* **ui:** CSS fixes ([eb1c7e9](https://github.com/vuejs/vue-cli/commit/eb1c7e9))
* avoid emoji length problem in update log (close [#835](https://github.com/vuejs/vue-cli/issues/835)) ([fb7ccb6](https://github.com/vuejs/vue-cli/commit/fb7ccb6))
* **build:** copy plugin should be loaded in all cases ([87892a5](https://github.com/vuejs/vue-cli/commit/87892a5)), closes [#1073](https://github.com/vuejs/vue-cli/issues/1073)
* **build-wc:** honor custom component name for single file wc builds ([#1182](https://github.com/vuejs/vue-cli/issues/1182)) ([2b236e0](https://github.com/vuejs/vue-cli/commit/2b236e0)), closes [#1146](https://github.com/vuejs/vue-cli/issues/1146)
* **cli:** fix invoke glob node_modules ignore pattern ([#1004](https://github.com/vuejs/vue-cli/issues/1004)) ([708cde9](https://github.com/vuejs/vue-cli/commit/708cde9))
* **cli-service:** should not add a leading slash to baseUrl when it is absolute ([#1172](https://github.com/vuejs/vue-cli/issues/1172)) ([abb82ab](https://github.com/vuejs/vue-cli/commit/abb82ab)), closes [#1084](https://github.com/vuejs/vue-cli/issues/1084)
* **eslint:** fix --no-fix flag when linting with typescript plugin ([#1115](https://github.com/vuejs/vue-cli/issues/1115)) ([83171e4](https://github.com/vuejs/vue-cli/commit/83171e4))
* **serve:** don't set header origin if using an agent ([#1179](https://github.com/vuejs/vue-cli/issues/1179)) ([79bc088](https://github.com/vuejs/vue-cli/commit/79bc088))
* **typescript:** fix invalid tsconfig.json ([#1036](https://github.com/vuejs/vue-cli/issues/1036)) ([c49eeb7](https://github.com/vuejs/vue-cli/commit/c49eeb7))
* **typescript,babel:** tests path for babel and typescript plugins ([#1058](https://github.com/vuejs/vue-cli/issues/1058)) ([b285b0b](https://github.com/vuejs/vue-cli/commit/b285b0b))
* **ui:** analyze bundle error handling ([d5d0b76](https://github.com/vuejs/vue-cli/commit/d5d0b76))
* **ui:** DashboardPlugin clean up ([0ac38da](https://github.com/vuejs/vue-cli/commit/0ac38da))
* **ui:** disable example vue-cli-ui.js in prod ([d3924bd](https://github.com/vuejs/vue-cli/commit/d3924bd))
* **ui:** DonutModule clean up ([802499e](https://github.com/vuejs/vue-cli/commit/802499e))
* **ui:** DonutModule visible threshold ([7341156](https://github.com/vuejs/vue-cli/commit/7341156))
* **ui:** eslint error ([9fbf860](https://github.com/vuejs/vue-cli/commit/9fbf860))
* **ui:** IPC API memory leak ([0a3686e](https://github.com/vuejs/vue-cli/commit/0a3686e))
* **ui:** max listeners error ([d5a3b1f](https://github.com/vuejs/vue-cli/commit/d5a3b1f))
* **ui:** moved necessary deps from devDeps to deps ([06a9870](https://github.com/vuejs/vue-cli/commit/06a9870))
* **ui:** open when server is ready ([602be03](https://github.com/vuejs/vue-cli/commit/602be03))
* **ui:** plugin search pagination ([f633a3f](https://github.com/vuejs/vue-cli/commit/f633a3f))
* **ui:** ProjectNav error ([b5c5e71](https://github.com/vuejs/vue-cli/commit/b5c5e71))
* **ui:** prompts: missing await ([d122c35](https://github.com/vuejs/vue-cli/commit/d122c35))
* **ui:** remove ui from built in plugin list ([2c7c63e](https://github.com/vuejs/vue-cli/commit/2c7c63e))
* **ui:** removed tasks not being properly filtered ([093f762](https://github.com/vuejs/vue-cli/commit/093f762))
* **ui:** serve disconnect IPC after first run ([6bb64a9](https://github.com/vuejs/vue-cli/commit/6bb64a9))
* **ui:** typo ([63383b4](https://github.com/vuejs/vue-cli/commit/63383b4))
* include test -> tests for eslint-loader ([3d29458](https://github.com/vuejs/vue-cli/commit/3d29458))
* **ui:** undefined sources error ([14881ee](https://github.com/vuejs/vue-cli/commit/14881ee))
* **ui:** various bugs ([acd4ab4](https://github.com/vuejs/vue-cli/commit/acd4ab4))
* css.extract options handling ([8e72943](https://github.com/vuejs/vue-cli/commit/8e72943)), closes [#1061](https://github.com/vuejs/vue-cli/issues/1061)
* **ui:** vue ui command moved from cli-service to cli ([8ebdb05](https://github.com/vuejs/vue-cli/commit/8ebdb05))
* **ui:** yarn lock ([c72f728](https://github.com/vuejs/vue-cli/commit/c72f728))
* **unit-jest:** handle static asset imports ([#1180](https://github.com/vuejs/vue-cli/issues/1180)) ([be3bede](https://github.com/vuejs/vue-cli/commit/be3bede))
* deep merge objects when extending package.json via plugins ([#1070](https://github.com/vuejs/vue-cli/issues/1070)) ([6af7bbe](https://github.com/vuejs/vue-cli/commit/6af7bbe)), closes [#1053](https://github.com/vuejs/vue-cli/issues/1053)
* pass all parameters to onProxyReq in proxy configuration ([#1083](https://github.com/vuejs/vue-cli/issues/1083)) ([65ee2fa](https://github.com/vuejs/vue-cli/commit/65ee2fa))
* validate project name ([#1039](https://github.com/vuejs/vue-cli/issues/1039)) ([78ed155](https://github.com/vuejs/vue-cli/commit/78ed155)), closes [#1024](https://github.com/vuejs/vue-cli/issues/1024)
* vue invoke should delete renamed/removed files ([#1049](https://github.com/vuejs/vue-cli/issues/1049)) ([c648301](https://github.com/vuejs/vue-cli/commit/c648301))


### Features

* **babel:** expose loose option ([7a125d4](https://github.com/vuejs/vue-cli/commit/7a125d4))
* **cli:** skip git if already in a git repo, add --skipGit option ([23480ae](https://github.com/vuejs/vue-cli/commit/23480ae)), closes [#967](https://github.com/vuejs/vue-cli/issues/967)
* **e2e-nightwatch:** allow using custom config via --config flag ([#1016](https://github.com/vuejs/vue-cli/issues/1016)) ([e4d67d6](https://github.com/vuejs/vue-cli/commit/e4d67d6))
* **inspect:** add a -v/--verbose flag to inspect command to output full functions ([#1175](https://github.com/vuejs/vue-cli/issues/1175)) ([6ca86aa](https://github.com/vuejs/vue-cli/commit/6ca86aa)), closes [#1157](https://github.com/vuejs/vue-cli/issues/1157)
* support custom initial commit message ([#1116](https://github.com/vuejs/vue-cli/issues/1116)) ([11ccf64](https://github.com/vuejs/vue-cli/commit/11ccf64))
* **plugin-api:** allow non-semver versioned dependencies ([#1184](https://github.com/vuejs/vue-cli/issues/1184)) ([0f76b8e](https://github.com/vuejs/vue-cli/commit/0f76b8e)), closes [#1177](https://github.com/vuejs/vue-cli/issues/1177)
* **pwa:** Make injected meta tags configurable and change defaults ([#961](https://github.com/vuejs/vue-cli/issues/961)) ([36f954b](https://github.com/vuejs/vue-cli/commit/36f954b))
* allow specifying proxy when creating project ([b1512be](https://github.com/vuejs/vue-cli/commit/b1512be)), closes [#1009](https://github.com/vuejs/vue-cli/issues/1009)
* **typescript:** improve tsx support ([#1168](https://github.com/vuejs/vue-cli/issues/1168)) ([3aa3743](https://github.com/vuejs/vue-cli/commit/3aa3743))
* **ui:** hooks ([a8c441c](https://github.com/vuejs/vue-cli/commit/a8c441c))
* **ui:** vue-cli-ui.js file example ([b0701ab](https://github.com/vuejs/vue-cli/commit/b0701ab))
* **ui:** webpack analyzer ([c29669b](https://github.com/vuejs/vue-cli/commit/c29669b))
* warn when user modifies output.path directly ([81d29ab](https://github.com/vuejs/vue-cli/commit/81d29ab))


### Performance Improvements

* **ui:** webpack analyzer optimization ([4b4a770](https://github.com/vuejs/vue-cli/commit/4b4a770))



<a name="3.0.0-beta.7"></a>
# [3.0.0-beta.7](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.6...v3.0.0-beta.7) (2018-04-25)


### Bug Fixes

* **invoke:** issue [#1037](https://github.com/vuejs/vue-cli/issues/1037) invoke binary files ([#1038](https://github.com/vuejs/vue-cli/issues/1038)) ([e65110f](https://github.com/vuejs/vue-cli/commit/e65110f))
* **ui:** "More info" link cut when wrapped ([5fdb9b4](https://github.com/vuejs/vue-cli/commit/5fdb9b4))
* **ui:** cli-ui-addon-webpack dev urls ([e33bec6](https://github.com/vuejs/vue-cli/commit/e33bec6))
* **ui:** client addon serve ([177059b](https://github.com/vuejs/vue-cli/commit/177059b))
* **ui:** client addon serve error ([a602b2c](https://github.com/vuejs/vue-cli/commit/a602b2c))
* **ui:** client addons serve ([7a01cd0](https://github.com/vuejs/vue-cli/commit/7a01cd0))
* **ui:** config.file ([3801d0a](https://github.com/vuejs/vue-cli/commit/3801d0a))
* **ui:** DashboardPlugin ack data ([96c95a8](https://github.com/vuejs/vue-cli/commit/96c95a8))
* **ui:** deps + dahsboard plugin ([a628b43](https://github.com/vuejs/vue-cli/commit/a628b43))
* **ui:** display 0 instead of NaN ([21d3e94](https://github.com/vuejs/vue-cli/commit/21d3e94))
* **ui:** docs images ([1d56cc0](https://github.com/vuejs/vue-cli/commit/1d56cc0))
* **ui:** eslint disaled rule ([a4f6e1d](https://github.com/vuejs/vue-cli/commit/a4f6e1d))
* **ui:** express timeout ([021370d](https://github.com/vuejs/vue-cli/commit/021370d))
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
* allow user to define onProxyReq ([#955](https://github.com/vuejs/vue-cli/issues/955)) ([179033d](https://github.com/vuejs/vue-cli/commit/179033d))
* babel legacy decorator ([#1163](https://github.com/vuejs/vue-cli/issues/1163)) ([fb013da](https://github.com/vuejs/vue-cli/commit/fb013da))
* move request deps to shared-utils ([982c494](https://github.com/vuejs/vue-cli/commit/982c494))
* **ui:** stderr new lines + selected task status color ([b949406](https://github.com/vuejs/vue-cli/commit/b949406))
* pin babel version (fix [#1162](https://github.com/vuejs/vue-cli/issues/1162)) ([dbc3f10](https://github.com/vuejs/vue-cli/commit/dbc3f10))
* **ui:** process killed before ipc messages are sent ([53d5d4e](https://github.com/vuejs/vue-cli/commit/53d5d4e))
* **ui:** progress handler should not throw error (casuing process to exit) ([3d4d8f0](https://github.com/vuejs/vue-cli/commit/3d4d8f0))
* **ui:** ProjectNav padding ([4fd8885](https://github.com/vuejs/vue-cli/commit/4fd8885))
* **ui:** ProjectNavButton tooltip delay ([131cc46](https://github.com/vuejs/vue-cli/commit/131cc46))
* **ui:** prompt margins ([100a12e](https://github.com/vuejs/vue-cli/commit/100a12e))
* **ui:** Prompt validation ([009b880](https://github.com/vuejs/vue-cli/commit/009b880))
* **ui:** prompts async methods + fixes ([75e86c6](https://github.com/vuejs/vue-cli/commit/75e86c6))
* **ui:** prompts choices values ([a378dca](https://github.com/vuejs/vue-cli/commit/a378dca))
* **ui:** prompts deep objects ([fd3188d](https://github.com/vuejs/vue-cli/commit/fd3188d))
* **ui:** prompts for config/tasks getting confused ([8244973](https://github.com/vuejs/vue-cli/commit/8244973))
* **ui:** remove console.logs ([2e9cfab](https://github.com/vuejs/vue-cli/commit/2e9cfab))
* **ui:** SharedData errors ([60b86eb](https://github.com/vuejs/vue-cli/commit/60b86eb))
* **ui:** status bar last log padding ([3b6c01f](https://github.com/vuejs/vue-cli/commit/3b6c01f))
* **ui:** StatusBar and scrolling fixes ([7440d0f](https://github.com/vuejs/vue-cli/commit/7440d0f))
* **ui:** Task parameter close label ([0a53836](https://github.com/vuejs/vue-cli/commit/0a53836))
* **ui:** tasks id + locale ([8e3198d](https://github.com/vuejs/vue-cli/commit/8e3198d))
* **ui:** terminal colors to match color palette ([0161b74](https://github.com/vuejs/vue-cli/commit/0161b74))
* **ui:** throttle DashboardPlugin progress updates ([1d9a4d6](https://github.com/vuejs/vue-cli/commit/1d9a4d6))
* **ui:** toolbars background color ([5851634](https://github.com/vuejs/vue-cli/commit/5851634))
* **ui:** wait for CWD reset when entering project main view ([751698e](https://github.com/vuejs/vue-cli/commit/751698e))


### Features

* **ui:** better details tab title ([a46686e](https://github.com/vuejs/vue-cli/commit/a46686e))
* **ui:** client addons, ipc, shared data, plugin actions ([3c59d6f](https://github.com/vuejs/vue-cli/commit/3c59d6f))
* **ui:** clientAddonConfig ([e2c2b48](https://github.com/vuejs/vue-cli/commit/e2c2b48))
* **ui:** configurations 'files' option can be omitted ([a191d76](https://github.com/vuejs/vue-cli/commit/a191d76))
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
* **ui:** vue ui command ([cdf9d07](https://github.com/vuejs/vue-cli/commit/cdf9d07))
* **ui:** Webpack addon: progress status icon ([0c1c245](https://github.com/vuejs/vue-cli/commit/0c1c245))
* **ui:** webpack dashboard 'open app' button ([dc8b454](https://github.com/vuejs/vue-cli/commit/dc8b454))
* **ui:** wip plugins list ([b9a714c](https://github.com/vuejs/vue-cli/commit/b9a714c))
* allow vue add to work with plugins without a generator ([#1032](https://github.com/vuejs/vue-cli/issues/1032)) ([11956ac](https://github.com/vuejs/vue-cli/commit/11956ac))
* use `esnext` targets for downleveling and modules. ([#966](https://github.com/vuejs/vue-cli/issues/966)) ([ba5a375](https://github.com/vuejs/vue-cli/commit/ba5a375))
* vue.config devBaseUrl (fix [#1102](https://github.com/vuejs/vue-cli/issues/1102)) ([1b27231](https://github.com/vuejs/vue-cli/commit/1b27231))



<a name="3.0.0-beta.6"></a>
# [3.0.0-beta.6](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.5...v3.0.0-beta.6) (2018-03-06)


### Bug Fixes

* do not exit with 1 on lint warnings (fix [#872](https://github.com/vuejs/vue-cli/issues/872)) ([b162cab](https://github.com/vuejs/vue-cli/commit/b162cab))
* fix [@vue](https://github.com/vue)/cli-service initial version ([08add21](https://github.com/vuejs/vue-cli/commit/08add21))
* fix babel preset jsx dependency ([2eb1ef9](https://github.com/vuejs/vue-cli/commit/2eb1ef9))
* fix cases where error fails to display ([dee7809](https://github.com/vuejs/vue-cli/commit/dee7809))
* fix devServer proxy when using object syntax (fix [#945](https://github.com/vuejs/vue-cli/issues/945)) ([114e085](https://github.com/vuejs/vue-cli/commit/114e085))
* use dynamic publicPath for web component bundles (fix [#949](https://github.com/vuejs/vue-cli/issues/949)) ([f744040](https://github.com/vuejs/vue-cli/commit/f744040))


### Features

* **ui:** Project select hide tabs when creating project ([db67f1e](https://github.com/vuejs/vue-cli/commit/db67f1e))
* **ui:** ProjectCreate features tab ([ee59f54](https://github.com/vuejs/vue-cli/commit/ee59f54))
* **ui:** ProjectCreate path preview ([d0703b0](https://github.com/vuejs/vue-cli/commit/d0703b0))
* **ui:** ProjectCreate saves formData ([d59b35e](https://github.com/vuejs/vue-cli/commit/d59b35e))



<a name="3.0.0-beta.5"></a>
# [3.0.0-beta.5](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.4...v3.0.0-beta.5) (2018-03-05)


### Bug Fixes

* resolve template extend source from the template location (fix [#943](https://github.com/vuejs/vue-cli/issues/943)) ([89f5cc3](https://github.com/vuejs/vue-cli/commit/89f5cc3))
* temporarily disable babel plugins that are not compatible with babel 7 yet ([389ea86](https://github.com/vuejs/vue-cli/commit/389ea86))


### Features

* allow specifying plugin versions in presets ([bdce865](https://github.com/vuejs/vue-cli/commit/bdce865))
* **ui:** Preset tab ([45e3c82](https://github.com/vuejs/vue-cli/commit/45e3c82))



<a name="3.0.0-beta.4"></a>
# [3.0.0-beta.4](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.3...v3.0.0-beta.4) (2018-03-05)


### Bug Fixes

* fix pwa + ts + lint (close [#937](https://github.com/vuejs/vue-cli/issues/937)) ([b878767](https://github.com/vuejs/vue-cli/commit/b878767))
* mock process for 3rd party libs (close [#934](https://github.com/vuejs/vue-cli/issues/934)) ([a2ac6be](https://github.com/vuejs/vue-cli/commit/a2ac6be))
* **pwa:** set cacheid in GenerateSW mode only ([#939](https://github.com/vuejs/vue-cli/issues/939)) ([43971d8](https://github.com/vuejs/vue-cli/commit/43971d8)), closes [#891](https://github.com/vuejs/vue-cli/issues/891)
* **test:** e2e w/ typescript ([#933](https://github.com/vuejs/vue-cli/issues/933)) ([b728624](https://github.com/vuejs/vue-cli/commit/b728624))
* **ui:** FolderExplorer favorites dropdown placement ([1a71164](https://github.com/vuejs/vue-cli/commit/1a71164))
* **ui:** Project select page class ([0a527d7](https://github.com/vuejs/vue-cli/commit/0a527d7))
* use same Puppeteer like in main package.json ([#942](https://github.com/vuejs/vue-cli/issues/942)) ([11192cf](https://github.com/vuejs/vue-cli/commit/11192cf))


### Features

* add `vue add` command ([#936](https://github.com/vuejs/vue-cli/issues/936)) ([896aec5](https://github.com/vuejs/vue-cli/commit/896aec5))
* allow specifying additional configs in preset ([2b9a750](https://github.com/vuejs/vue-cli/commit/2b9a750))
* **ui:** FolderExplorer ([3333c94](https://github.com/vuejs/vue-cli/commit/3333c94))
* Generator now supports template inheritance ([1869aa2](https://github.com/vuejs/vue-cli/commit/1869aa2))
* generatorAPI.exitLog ([#935](https://github.com/vuejs/vue-cli/issues/935)) ([0f2ee80](https://github.com/vuejs/vue-cli/commit/0f2ee80))
* initialize project with corresponding CSS pre-processor (close [#930](https://github.com/vuejs/vue-cli/issues/930)) ([811d056](https://github.com/vuejs/vue-cli/commit/811d056))
* read existing files during plugin invocation (close [#873](https://github.com/vuejs/vue-cli/issues/873)) ([de60d9f](https://github.com/vuejs/vue-cli/commit/de60d9f))
* support using remote preset (close [#884](https://github.com/vuejs/vue-cli/issues/884)) ([2d89c51](https://github.com/vuejs/vue-cli/commit/2d89c51))
* **ui:** FolderExplorer favorites + Project select page ([376e4bb](https://github.com/vuejs/vue-cli/commit/376e4bb))
* **ui:** FolderExplorer list scrolling ([ae0d895](https://github.com/vuejs/vue-cli/commit/ae0d895))
* **ui:** FolderExplorer path edit + folder isPackage/isVueProject ([08514eb](https://github.com/vuejs/vue-cli/commit/08514eb))
* **ui:** Initial app ([8947a45](https://github.com/vuejs/vue-cli/commit/8947a45))
* **ui:** Initial schema and folder API ([1751ca1](https://github.com/vuejs/vue-cli/commit/1751ca1))
* **ui:** Project Create details form ([8399838](https://github.com/vuejs/vue-cli/commit/8399838))



<a name="3.0.0-beta.3"></a>
# [3.0.0-beta.3](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.2...v3.0.0-beta.3) (2018-03-03)


### Bug Fixes

* **dev-server:** dev server behind NAT network ([#868](https://github.com/vuejs/vue-cli/issues/868)) ([bbc931c](https://github.com/vuejs/vue-cli/commit/bbc931c)), closes [#828](https://github.com/vuejs/vue-cli/issues/828)
* **e2e:** end to end test(s) folder ([#923](https://github.com/vuejs/vue-cli/issues/923)) ([852d26c](https://github.com/vuejs/vue-cli/commit/852d26c))
* **tsconfig.json:** typo in includes ([#917](https://github.com/vuejs/vue-cli/issues/917)) ([6adc0b5](https://github.com/vuejs/vue-cli/commit/6adc0b5))
* **tslint.json:** linting of test(s) folder ([#924](https://github.com/vuejs/vue-cli/issues/924)) ([549ff7f](https://github.com/vuejs/vue-cli/commit/549ff7f))
* externalize vue-server-renderer + support dynamic import in mocha tests ([fe9aed8](https://github.com/vuejs/vue-cli/commit/fe9aed8))
* fix baseUrl normalization (close [#900](https://github.com/vuejs/vue-cli/issues/900)) ([89982df](https://github.com/vuejs/vue-cli/commit/89982df))
* fix options for css optimize plugin (close [#918](https://github.com/vuejs/vue-cli/issues/918)) ([7681106](https://github.com/vuejs/vue-cli/commit/7681106))
* include root config files in lint (close [#913](https://github.com/vuejs/vue-cli/issues/913)) ([c40a88d](https://github.com/vuejs/vue-cli/commit/c40a88d))
* respect --dest when copying static assets (close [#909](https://github.com/vuejs/vue-cli/issues/909)) ([57ce32a](https://github.com/vuejs/vue-cli/commit/57ce32a))
* respect dotfiles in public dir (fix [#880](https://github.com/vuejs/vue-cli/issues/880)) ([59ac4f4](https://github.com/vuejs/vue-cli/commit/59ac4f4))


### Features

* **css modules:** Add CSS Module localIdentName option to vue config ([#915](https://github.com/vuejs/vue-cli/issues/915)) ([31cdc86](https://github.com/vuejs/vue-cli/commit/31cdc86))
* support creating project in current directory ([#916](https://github.com/vuejs/vue-cli/issues/916)) ([6ae1569](https://github.com/vuejs/vue-cli/commit/6ae1569)), closes [#896](https://github.com/vuejs/vue-cli/issues/896)
* support dynamic import in jest tests (close [#922](https://github.com/vuejs/vue-cli/issues/922)) ([09ed0b1](https://github.com/vuejs/vue-cli/commit/09ed0b1))



<a name="3.0.0-beta.2"></a>
# [3.0.0-beta.2](https://github.com/vuejs/vue-cli/compare/v3.0.0-beta.1...v3.0.0-beta.2) (2018-02-28)


### Bug Fixes

* **cypress:** upgrade cypress and properly set base url ([#879](https://github.com/vuejs/vue-cli/issues/879)) ([46358eb](https://github.com/vuejs/vue-cli/commit/46358eb))
* do not swallow vue.config.js errors ([14a2dc7](https://github.com/vuejs/vue-cli/commit/14a2dc7)), closes [#874](https://github.com/vuejs/vue-cli/issues/874) [#866](https://github.com/vuejs/vue-cli/issues/866)
* enable html doctype by default for pug ([e15a930](https://github.com/vuejs/vue-cli/commit/e15a930)), closes [#894](https://github.com/vuejs/vue-cli/issues/894)
* fix friendly-error plugin name typo ([#882](https://github.com/vuejs/vue-cli/issues/882)) ([73ad2f8](https://github.com/vuejs/vue-cli/commit/73ad2f8))
* nightwatch helper compat with airbnb linter ([f4d1841](https://github.com/vuejs/vue-cli/commit/f4d1841)), closes [#870](https://github.com/vuejs/vue-cli/issues/870)
* ts generator & airbnb import/extensions rule compatibility ([88726a3](https://github.com/vuejs/vue-cli/commit/88726a3)), closes [#871](https://github.com/vuejs/vue-cli/issues/871)


### Code Refactoring

* change default test directory name to "tests" ([64b4515](https://github.com/vuejs/vue-cli/commit/64b4515)), closes [#877](https://github.com/vuejs/vue-cli/issues/877)


### Features

* add ability to use environment variables in vue.config.js ([#867](https://github.com/vuejs/vue-cli/issues/867)) ([92ddd09](https://github.com/vuejs/vue-cli/commit/92ddd09))
* add default <noscript> content ([#856](https://github.com/vuejs/vue-cli/issues/856)) ([a489803](https://github.com/vuejs/vue-cli/commit/a489803)), closes [#854](https://github.com/vuejs/vue-cli/issues/854)
* **cli-plugin-pwa:** Upgrade workbox-webpack-plugin to 3.0.0-beta.1 ([#897](https://github.com/vuejs/vue-cli/issues/897)) ([6d7985a](https://github.com/vuejs/vue-cli/commit/6d7985a))
* output help information on unknown CLI commands ([#857](https://github.com/vuejs/vue-cli/issues/857)) ([cd23858](https://github.com/vuejs/vue-cli/commit/cd23858)), closes [#849](https://github.com/vuejs/vue-cli/issues/849)
* preserveWhitespace: false ([1864cef](https://github.com/vuejs/vue-cli/commit/1864cef))


### BREAKING CHANGES

* all tests are now located in "tests" instead of "test"
* preserveWhitespace now defaults to false in vue-loader options.



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



