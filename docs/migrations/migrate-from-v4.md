---
sidebar: auto
---

# Migrate from v4

First, install the latest Vue CLI globally:

```bash
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

## Upgrade All Plugins at Once

In your existing projects, run:

```bash
vue upgrade
```

And then follow the command line instructions.

Note that the migrator is not complete yet and doesn't cover all cases.
Please read the following section for detailed breaking changes introduced in each package.

::: tip Note
If you see errors like `setup compilation vue-loader-plugin(node:44156) UnhandledPromiseRejectionWarning: TypeError: The 'compilation' argument must be an instance of Compilation` after upgrading, please remove the lockfile (`yarn.lock` or `package-lock.json`) and `node_modules` in the project and reinstall all the dependencies.
:::

------

## One-By-One Manual Migration

If you want to migrate manually and gradually, you can run `vue upgrade <the-plugin-name>` to upgrade a specific Vue CLI plugin.

------

## Breaking Changes

### For All Packages

* Drop support of Node.js 8-11 and 13
* Drop support of NPM 5

### The `vue` Command (The Global `@vue/cli` Package)

The [instant prototyping functionalities](https://v4.cli.vuejs.org/guide/prototyping.html) are removed. Now the `vue serve` / `vue build` commands are aliases to `npm run serve` / `npm run build`, which in turn execute the scripts specified in the project `package.json`.

If you need a minimum setup for developing standalone `.vue` components, please use <https://sfc.vuejs.org/> or <https://vite.new/vue> instead.

### `@vue/cli-service`

#### Webpack 5

We've upgraded the underlying webpack version to 5. There are plenty of breaking changes underlyingly, listed in the release announcement page [Webpack 5 release (2020-10-10)](https://webpack.js.org/blog/2020-10-10-webpack-5-release/).

Besides the internal changes that are only noticeable for custom configurations, there're several notable changes for user-land code too:

1. Named exports from JSON modules are no longer supported. Instead of `import { version } from './package.json'; console.log(version);` use `import package from './package.json'; console.log(package.version);`
2. Webpack 5 does no longer include polyfills for Node.js modules by default. You shall see an informative error message if your code relies on any of these modules. A detailed list of previously polyfilled modules is also available [here](https://github.com/webpack/webpack/pull/8460/commits/a68426e9255edcce7822480b78416837617ab065).

#### Dev Server

`webpack-dev-server` has been updated from v3 to v4. So there are breaking changes with regard to the `devServer` option in `vue.config.js`. Please check out the [`webpack-dev-server` migration guide](https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md) for more details.

Most notably:

* The `disableHostCheck` option was removed in favor `allowedHosts: 'all'`;
* `public`, `sockHost`, `sockPath`, and `sockPort` options were removed in favor `client.webSocketURL` option.
* IE9 support of the dev server is not enabled by default. If you need to develop under IE9, please manually set the `devServer.webSocketServer` option to `sockjs`.

#### The `build` Command and Modern Mode

Starting with v5.0.0-beta.0, running `vue-cli-service build` will automatically generate different bundles based on your browserslist configurations.
The `--modern` flag is no longer needed because it is turned on by default.

Say we are building a simple single-page app with the default setup, here are some possible scenarios:

* With the default browserslist target of Vue 2 projects (`> 1%, last 2 versions, not dead`), `vue-cli-service build` will produce two types of bundles:
  * One for modern target browsers that support `<script type="module">` (`app.[contenthash].js` and `chunk-vendors.[contenthash].js`). The bundle size will be much smaller because it drops polyfills and transformations for legacy browsers.
  * One for those do not (`app-legacy.[contenthash].js` and `chunk-vendors-legacy.[contenthash].js`), and will be loaded via `<script nomodule>`.
* You can opt-out this behavior by appending a `--no-module` flag to the build command. `vue-cli-service build --no-module` will only output the legacy bundles that support all target browsers (loaded via plain `<script>`s).
* With the default browserslist target of Vue 3 projects (`> 1%, last 2 versions, not dead, not ie 11`), all target browsers supports `<script type="module">`, there's no point (and no way) differentiating them, thus `vue-cli-service build` will only produce one type of bundle: `app.[contenthash].js` and `chunk-vendors.[contenthash].js` (loaded via plain `<script>`s).

#### CSS Modules

The `css.requireModuleExtension` option is removed. If you do need to strip the `.module` part in CSS Module file names, please refer to [Working with CSS > CSS Modules](../guide/css.md#css-modules) for more guidance.

`css-loader` is upgraded from v3 to v6, a few CSS Module related options have been renamed, along with other changes. See [full changelog](https://github.com/webpack-contrib/css-loader/blob/master/CHANGELOG.md) for additional details.

#### Sass/SCSS

No longer supports generating project with `node-sass`. It has been [deprecated](https://sass-lang.com/blog/libsass-is-deprecated#how-do-i-migrate) for a while. Please use the `sass` package instead.

#### Asset Modules

`url-loader` and `file-loader` are removed in favor of [Asset Modules](https://webpack.js.org/guides/asset-modules/). If you want to adjust the size limit of inline image assets, now you need to set the [`Rule.parser.dataUrlCondition.maxSize`](https://webpack.js.org/configuration/module/#ruleparserdataurlcondition) option:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('images')
        .set('parser', {
          dataUrlCondition: {
            maxSize: 4 * 1024 // 4KiB
          }
        })
  }
}
```

#### Underlying Loaders and Plugins

* `html-webpack-plugin` is upgraded from v3 to v5. More details are available in the [release announcement of `html-webpack-plugin` v4](https://dev.to/jantimon/html-webpack-plugin-4-has-been-released-125d) and the [full changelog](https://github.com/jantimon/html-webpack-plugin/blob/master/CHANGELOG.md).
* `sass-loader` v7 support is dropped. See the v8 breaking changes at its [changelog](https://github.com/webpack-contrib/sass-loader/blob/master/CHANGELOG.md#800-2019-08-29).
* `postcss-loader` is upgraded from v3 to v5. Most notably, `PostCSS` options (`plugin` / `syntax` / `parser` / `stringifier`) are moved into the `postcssOptions` field. More details available at the [changelog](https://github.com/webpack-contrib/postcss-loader/blob/master/CHANGELOG.md#400-2020-09-07).
* `copy-webpack-plugin` is upgraded from v5 to v8. If you never customized its config through `config.plugin('copy')`, there should be no user-facing breaking changes. A full list of breaking changes is available at [`copy-webpack-plugin` v6.0.0 changelog](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md).
* `terser-webpack-plugin` is upgraded from v2 to v5, using terser 5 and some there are some changes in the options format. See full details in its [changelog](https://github.com/webpack-contrib/terser-webpack-plugin/blob/master/CHANGELOG.md).
* When creating new projects, the default `less-loader` is updated from [v5 to v8](https://github.com/webpack-contrib/less-loader/blob/master/CHANGELOG.md); `less` from [v3 to v4](https://github.com/less/less.js/pull/3573); `sass-loader` from [v8 to v11](https://github.com/webpack-contrib/sass-loader/blob/master/CHANGELOG.md); `stylus-loader` from [v3 to v5](https://github.com/webpack-contrib/stylus-loader/blob/master/CHANGELOG.md).
* `mini-css-extract-plugin` is upgraded from [v1 to v2](https://github.com/webpack-contrib/mini-css-extract-plugin/blob/master/CHANGELOG.md).
* `cache-loader` is removed. If you want to use it, please install it manually.

### Babel Plugin

The [`transpileDependencies` option](../config/#transpiledependencies) now accepts a boolean value. Setting it to `true` will transpile all dependencies inside `node_modules`.

### ESLint Plugin

* `eslint-loader` is replaced by [eslint-webpack-plugin](https://github.com/webpack-contrib/eslint-webpack-plugin), dropping support for ESLint <= 6.
* New projects are now generated with `eslint-plugin-vue` v8, see the  release notes ([v7](https://github.com/vuejs/eslint-plugin-vue/releases/tag/v7.0.0), [v8](https://github.com/vuejs/eslint-plugin-vue/releases/tag/v8.0.0)) for breaking changes.
* `@vue/eslint-config-prettier` is deprecated. See <https://github.com/vuejs/eslint-config-prettier> for the migration guide.

### PWA Plugin

* The underlying `workbox-webpack-plugin` is upgraded from v4 to v6. Detailed migration guides available on workbox's website:
  * [From Workbox v4 to v5](https://developers.google.com/web/tools/workbox/guides/migrations/migrate-from-v4)
  * [From Workbox v5 to v6](https://developers.google.com/web/tools/workbox/guides/migrations/migrate-from-v5)

### TypeScript Plugin

* Dropped TSLint support. As [TSLint has been deprecated](https://github.com/palantir/tslint/issues/4534), we [removed](https://github.com/vuejs/vue-cli/pull/5065) all TSLint-related code in this version.
Please consider switching to ESLint. You can check out [`tslint-to-eslint-config`](https://github.com/typescript-eslint/tslint-to-eslint-config) for a mostly automatic migration experience.
* `ts-loader` is upgraded from v6 to v9. It now only supports TypeScript >= 3.6.
* `fork-ts-checker-webpack-plugin` is upgraded from v3.x to v6.x, you can see the detailed breaking changes in its release notes:
  * [v4.0.0](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v4.0.0)
  * [v5.0.0](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v5.0.0)
  * [v6.0.0](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v6.0.0)

### E2E-Cypress Plugin

* Cypress is required as a peer dependency.
* Cypress is updated from v3 to v8. See [Cypress Migration Guide](https://docs.cypress.io/guides/references/migration-guide.html) for detailed instructions of the migration process.

### E2E-WebDriverIO Plugin

* WebDriverIO is updated from v6 to v7. Not many user-facing breaking changes. See the [blog post on release](https://webdriver.io/blog/2021/02/09/webdriverio-v7-released) for more details.

### E2E-Nightwatch Plugin

* Nightwatch is updated from v1 to v2. See the [blog post](https://nightwatchjs.org/guide/getting-started/whats-new-v2.html) for more details. And there's a [migration guide](https://github.com/nightwatchjs/nightwatch/wiki/Migrating-to-Nightwatch-2.0), too.

### Unit-Jest Plugin

* For Vue 2 projects, `@vue/vue2-jest` is now required as a peer dependency, please install `@vue/vue2-jest` as a dev dependency to the project.
* For TypeScript projects, `ts-jest` is now required as a peer dependency. Users need to install `ts-jest@27` manually to the project root.
* The underlying `jest`-related packages are upgraded from v24 to v27. For most users the transition would be seamless. See their corresponding changelogs for more detail:
  * [jest, babel-jest](https://github.com/facebook/jest/blob/v27.1.0/CHANGELOG.md)
  * [ts-jest](https://github.com/kulshekhar/ts-jest/blob/v27.0.0/CHANGELOG.md)

### Unit-Mocha Plugin

* `mocha` is upgraded from v6 to v8, please refer to the release notes of [mocha v7](https://github.com/mochajs/mocha/releases/tag/v7.0.0) and [mocha v8](https://github.com/mochajs/mocha/releases/tag/v8.0.0) for a complete list of breaking changes.
* `jsdom` is upgraded from v15 to v18, user-facing breaking changes are listed in the [`jsdom` v16.0.0 release notes](https://github.com/jsdom/jsdom/releases/tag/16.0.0) and [v18.0.0 release notes](https://github.com/jsdom/jsdom/releases/tag/18.0.0).

### Internal Packages

#### `@vue/cli-shared-utils`

* [chalk](https://github.com/chalk/chalk) is upgraded from v2 to v4
* [joi](https://github.com/sideway/joi) is upgraded from v15 (used to be `@hapi/joi`) to v17
