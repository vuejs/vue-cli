---
sidebar: auto
---

# Migrating from v3

First, install the latest Vue CLI globally:

```sh
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

## Upgrade All Plugins at Once

In your existing projects, run:

```sh
vue upgrade
```

And then see the following section for detailed breaking changes introduced in each package.

------

## One-By-One Manual Migration

If you want to migrate manually and gradually, here are the tips:

### The Global `@vue/cli`

#### [Redesigned](https://github.com/vuejs/vue-cli/pull/4090) `vue upgrade`

- Before: `vue upgrade [patch | minor | major]`, and it does nothing more than installing the latest versions of Vue CLI plugins.
- After: `vue upgrade [plugin-name]`. Aside from upgrading the plugins, it can run migrators from plugins to help you automate the migration process. For more options for this command, please run `vue upgrade --help`.

#### `vue --version` Output Format Change

When running `vue --version`:

- 3.x: outputs `3.12.0`
- 4.x: outputs `@vue/cli 4.0.0`

#### Extra Confirmation Step To Avoid Overwriting

When running `vue invoke` / `vue add` / `vue upgrade`, there's now an [extra confirmation step](https://github.com/vuejs/vue-cli/pull/4275) if you have uncommitted changes in the current repository.

![image](https://user-images.githubusercontent.com/3277634/65588457-23db5a80-dfba-11e9-9899-9dd72efc111e.png)

#### Vue Router and Vuex Now Have Corresponding CLI Plugins

When running `vue add vuex` or `vue add router`:

- In v3, only `vuex` or `vue-router` will be added to the project;
- In v4, there will also be `@vue/cli-plugin-vuex` or `@vue/cli-plugin-router` installed.

This currently does not make an actual difference for end-users, but such design allows us to add more features for Vuex and Vue Router users later.

For preset and plugin authors, there are several noteworthy changes in the two plugins:

- The default directory structure was changed:
  - `src/store.js` moved to `src/store/index.js`;
  - `src/router.js` renamed to `src/router/index.js`;
- The `router` & `routerHistoryMode` options in `preset.json` are still supported for compatibility reasons. But it's now recommended to use `plugins: { '@vue/cli-plugin-router': { historyMode: true } }` for better consistency.
- `api.hasPlugin('vue-router')` is no longer supported. It's now `api.hasPlugin('router')`.

### `@vue/cli-service`

#### Whitespace handling in the template block

To get a smaller bundle, we've disabled the `preserveWhitespace` option of `vue-template-compiler` by default in Vue CLI v3.

This set comes with some caveats, however.

Luckily, since the Vue 2.6 release, we can now have finer control over the whitespace handling, with the [new `whitespace` option](https://github.com/vuejs/vue/issues/9208#issuecomment-450012518). So we decided to switch over to use this new option by default in Vue CLI v4.

Take the following template as an example:

```html
<p>
  Welcome to <b>Vue.js</b> <i>world</i>.
  Have fun!
</p>
```

With `preserveWhitespace: false`, all whitespaces between tags are removed, so it was compiled as:

```html
<p> Welcome to <b>Vue.js</b><i>world</i>. Have fun! </p>
```

With `whitespace: 'condense'`, it is now compiled as:

```html
<p> Welcome to <b>Vue.js</b> <i>world</i>. Have fun! </p>
```

Note the **inline** whitespace between tags is now preserved.

#### `vue-cli-service build --mode development`

In the past, when running the `build` command in the `development` mode, the `dist` folder layout would be different from the `production` mode. Now with the following two changes, the directory structures across all modes would be the same (file names are still different - no hashes in `development` mode):

- [#4323](https://github.com/vuejs/vue-cli/pull/4323) ensure consistent directory structure for all modes
- [#4302](https://github.com/vuejs/vue-cli/pull/4302) move dev configs into serve command

#### For SASS/SCSS Users

Previously in Vue CLI v3, we shipped with `sass-loader@7` by default.

Recently `sass-loader@8` has been out and has changed its configuration format quite a lot. Here's the release notes: <https://github.com/webpack-contrib/sass-loader/releases/tag/v8.0.0>

`@vue/cli-service` will continue to support `sass-loader@7` in v4, but we strongly recommend you to take a look at the v8 release and upgrade to the latest version.

#### For Less Users

`less-loader` v4 is incompatible with `less` >= v3.10, see <https://github.com/less/less.js/issues/3414>.
It's strongly recommended to upgrade to `less-loader@5` if your project depends on it.

#### For CSS Module Users

- [Deprecate `css.modules` in favor of `css.requireModuleExtension`](https://github.com/vuejs/vue-cli/pull/4387). This is because we've upgraded to `css-loader` v3 and the config format has been changed. For a more detailed explanation please follow the link.

#### `vue.config.js` options

The already-deprecated [`baseUrl` option](https://cli.vuejs.org/config/#baseurl) is now [removed](https://github.com/vuejs/vue-cli/pull/4388)

#### `chainWebpack` / `configureWebpack`

##### The `minimizer` Method in `chainWebpack`

If you've customized the internal rules with `chainWebpack`, please notice that `webpack-chain` was updated from v4 to v6, the most noticeable change is the `minimizer` config

For example, if you want to enable the `drop_console` option in the terser plugin.
In v3, you may do this in `chainWebpack`:

```js
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
  chainWebpack: (config) => {
    config.optimization.minimizer([
      new TerserPlugin({ terserOptions: { compress: { drop_console: true } } })
    ])
  }
}
```

In v4, it's changed to:

```js
module.exports = {
  chainWebpack: (config) => {
    config.optimization.minimizer('terser').tap((args) => {
      args[0].terserOptions.compress.drop_console = true
      return args
    })
  }
}
```

##### Other Changes

- [The `pug-plain` rule was renamed to `pug-plain-loader`](https://github.com/vuejs/vue-cli/pull/4230)

#### Underlying Loaders / Plugins

Not likely to affect users unless you've customized their options via `chainWebpack` / `configureWebpack`

`css-loader` was upgraded from v1 to v3:

- [v2 changelog](https://github.com/webpack-contrib/css-loader/releases/tag/v2.0.0)
- [v3 changelog](https://github.com/webpack-contrib/css-loader/releases/tag/v3.0.0)

Several other underlying webpack loaders and plugins have been upgraded, with mostly trivial changes:

- `url-loader` [from v1 to v2](https://github.com/webpack-contrib/url-loader/releases/tag/v2.0.0)
- `file-loader` [from v3 to v4](https://github.com/webpack-contrib/file-loader/releases/tag/v4.0.0)
- `copy-webpack-plugin` [from v4 to v5](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md#500-2019-02-20)
- `terser-webpack-plugin` [from v1 to v2](https://github.com/vuejs/vue-cli/pull/4676)

### `@vue/cli-plugin-babel`, `@vue/babel-preset-app`

#### core-js

The babel plugin requires a peer dependency, for the polyfills used in the transpiled code.

In Vue CLI v3, the required `core-js` version is 2.x, it is now upgraded to 3.x.

This migration is automated if you upgrade it through `vue upgrade babel`. But if you have custom polyfills introduced, you may need to manually update the polyfill names (For more details, see [core-js changelog](https://github.com/zloirock/core-js/blob/master/CHANGELOG.md#L279-L297)).

#### Babel Preset

This migration is also automated if you upgrade it through `vue upgrade babel`.

- In v3, the default babel preset used in `babel.config.js` is `@vue/app`.
- In v4, we moved it to the plugin, so now it's named as `@vue/cli-plugin-babel/preset`

It is because that `@vue/babel-preset-app` is indeed an indirect dependency on the project.
It works because of npm's package hoisting.
But potential problems could still occur if the project has multiple conflicting indirect dependencies of the same package, or if the package manager puts stricter constraints on the dependency resolution (e.g. yarn plug'n'play or pnpm).
So we now moved it to the project's direct dependency (`@vue/cli-plugin-babel`) to make it more standard-compliant and less error-prone.

------

### `@vue/cli-plugin-eslint`

This plugin now [requires ESLint as a peer dependency](https://github.com/vuejs/vue-cli/pull/3852).

This won't affect projects scaffolded with Vue CLI 3.1 or later.

If your project was scaffolded with Vue CLI 3.0.x or earlier, you may need to add `eslint@4` to your project dependencies (This is automated if you upgrade the plugin using `vue upgrade eslint`).

It's also recommended to upgrade your ESLint to v5, and ESLint config versions to the latest. (ESLint v6 support is still on the way)

------

#### The Prettier Preset

The old implementation of our prettier preset is flawed. We've updated the default template since Vue CLI v3.10.

It now requires `eslint`, `eslint-plugin-prettier` and `prettier` as peer dependencies, following the [standard practice in the ESLint ecosystem](https://github.com/eslint/eslint/issues/3458).

For older projects, if you encountered issues like `Cannot find module: eslint-plugin-prettier`, please run the following command to fix it:

```sh
npm install --save-dev eslint@5 @vue/eslint-config-prettier@5 eslint-plugin-prettier prettier
```

------

#### `lintOnSave` options

(the following only affects development)

The default value of `lintOnSave` option (when not specified) was [changed from `true` to `'default'`](https://github.com/vuejs/vue-cli/pull/3975). You can read more on the detailed explanation in the [documentation](https://cli.vuejs.org/config/#lintonsave).

In a nutshell:

- In v3, by default, lint warnings, along with errors, will be displayed in the error overlay
- In v4, by default, only lint errors will interrupt your development process. Warnings are only logged in the terminal console.

### `@vue/cli-plugin-pwa`

The underlying workbox-webpack-plugin has been upgraded from v3 to v4. See [the release notes here](https://github.com/GoogleChrome/workbox/releases/tag/v4.0.0).

There's also a `pwa.manifestOptions` field available (you can set it in the `vue.config.js`). With this new option, `manifest.json` will be generated from the config object rather than directly copied from the `public` folder. This provides a more consistent interface to manage your PWA configurations. (Note, it is an opt-in feature. Related PRs: [#2981](https://github.com/vuejs/vue-cli/pull/2981), [#4664](https://github.com/vuejs/vue-cli/pull/4664))

### `@vue/cli-plugin-e2e-cypress`

Before Vue CLI v3.0.0-beta.10, the default command for E2E testing was `vue-cli-service e2e`. Later we changed it to `vue-cli-service test:e2e`. The previous command was since deprecated but still supported.
We have now completely [dropped support for this legacy command](https://github.com/vuejs/vue-cli/pull/3774).

### `@vue/cli-plugin-e2e-nightwatch`

Nightwatch.js has been upgraded from 0.9 to 1.x. Be sure to read the [Nightwatch migration guides](https://github.com/nightwatchjs/nightwatch/wiki/Migrating-to-Nightwatch-1.0) first.

The bundled config and generated tests [have been completely overhauled](https://github.com/vuejs/vue-cli/pull/4541). Please follow the link for more details. Most use cases in Vue CLI v3 are still supported. They are just new features.

As ChromeDriver has changed its version strategy since version 73, we've made it a peer dependency in the project.
A simple browser version check is implemented in the plugin, so if you've upgraded to an incompatible version of Chrome, there will be a warning to prompt you to upgrade the depended ChromeDriver version.

------

As in the cypress plugin, the support for legacy `vue-cli-service e2e` command has also been removed.

### `@vue/cli-plugin-typescript`

When using Typescript, the webpack resolve options now [prefer `ts(x)` file extensions over `js(x)` ones](https://github.com/vuejs/vue-cli/pull/3909).

### `@vue/cli-plugin-unit-jest`

We've upgraded the bundled Jest from v23 to v24, so please read their [release notes](https://jestjs.io/blog/2019/01/25/jest-24-refreshing-polished-typescript-friendly) first.
Follow [this link](https://github.com/facebook/jest/blob/20ba4be9499d50ed0c9231b86d4a64ec8a6bd303/CHANGELOG.md#user-content-2400) for the full changelog.

The `unit-jest` plugin now comes with 4 configuration presets:

- `@vue/cli-plugin-unit-jest` The default preset for the most common type of projects
- `@vue/cli-plugin-unit-jest/presets/no-babel` If you don't have `@vue/cli-plugin-babel` installed and don't want to see babel files in the project
- `@vue/cli-plugin-unit-jest/presets/typescript` The preset with TypeScript support (but no TSX support)
- `@vue/cli-plugin-unit-jest/presets/typescript-and-babel` The preset with TypeScript (and TSX) and babel support.

If you haven't changed the default Jest configurations (lies in either `jest.config.js` or the `jest` field in `package.json`) ever since project creation, you can now replace the massive configuration object with one single field:

```js
module.exports = {
  // Replace the following preset name with the one you want to use from the above list
  preset: '@vue/cli-plugin-unit-jest'
}
```

(the `ts-jest`, `babel-jest` dependencies can also be removed after migrating config to use presets)

::: tip A Reminder
The default test environment in the new presets is jsdom@15, which differs from the default one in Jest 24 (jsdom@11).
This is to be aligned with the upcoming Jest 25 updates.
Most users won't be affected by this change.
For a detailed changelog with regard to jsdom, see <https://github.com/jsdom/jsdom/blob/master/Changelog.md>
:::

### `@vue/cli-plugin-unit-mocha`

- Use mochapack instead of mocha-webpack, see changelog at <https://github.com/sysgears/mochapack/releases>. This change is not likely to affect actual usage.
- Upgraded to mocha 6, see [Mocha's changelog](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#600-0--2019-01-01) for more details.

### `@vue/cli-service-global`

See breaking changes in the [`@vue/cli-service`](#vue-cli-service) & [`@vue/cli-plugin-eslint`](#vue-cli-plugin-eslint) packages.
