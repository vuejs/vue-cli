# Migrating from v3

First, install the latest Vue CLI globally:

```sh
npm install -g @vue/cli@4
```

## Upgrade All Plugins at Once

In your existing projects, run:

```sh
vue upgrade --next
```

And then see the following section for detailed breaking changes introduced in each package.

------

## One-By-One Manual Migration

If you want to do the migration manually and gradually, here are the tips:

### The Global `@vue/cli` Package

The `vue upgrade` command was [redesigned](https://github.com/vuejs/vue-cli/pull/4090).

- Before: `vue upgrade [patch | minor | major]`, and it does nothing more than install the latest versions of Vue CLI plugins.
- After: `vue upgrade [plugin-name]`. Aside from upgrading the plugins, it can run migrators from plugins to help you automate the migration process. For more options for this command, please run `vue upgrade --help`.

------

When running `vue invoke` / `vue add` / `vue upgrade`, there's now an [extra confirmation step](https://github.com/vuejs/vue-cli/pull/4275) if you have uncommitted changes in the current repository.

![image](https://user-images.githubusercontent.com/3277634/65588457-23db5a80-dfba-11e9-9899-9dd72efc111e.png)

------

When running `vue add vuex` or `vue add router`:

- in v3, only `vuex` or `vue-router` will be added to the project;
- in v4, there will also be `@vue/cli-plugin-vuex` & `@vue/cli-plugin-router` installed.

This currently does not make an actual difference for end users, but such design allows us to add more features for vuex & vue-router users later.

### `@vue/cli-service`

#### `vue-cli-service build --mode development`

In the past, when running the `build` command in the `development` mode, the `dist` folder layout would be different from the `production` mode. Now with the following two changes, the directory structures across all modes would be the same (file names are still different - no hashes in `development` mode):

- [#4323](https://github.com/vuejs/vue-cli/pull/4323) ensure consistent directory structure for all modes
- [#4302](https://github.com/vuejs/vue-cli/pull/4302) move dev configs into serve command

#### For SASS/SCSS Users

Previously in Vue CLI v3, we shipped with `sass-loader@7` by default.

Recently `sass-loader@8` has been out and has changed its configuration format quite a lot. Here's the release notes: <https://github.com/webpack-contrib/sass-loader/releases/tag/v8.0.0>

`@vue/cli-service` will continue to support `sass-loader@7` in v4, but we strongly recommend you to take a look at the v8 release and upgrade to the latest version.

#### For Less Users

- [TODO: notes on less-loader version]

#### For CSS Module Users

- [deprecate `css.modules` in favor of `css.requireModuleExtension`](https://github.com/vuejs/vue-cli/pull/4387). This is because we've upgraded to css-loader v3 and the config format has been changed. For more detailed explanation please follow the link.

#### Other Noticealbe Changes in `vue.config.js`

- The already-deprecated [`baseUrl` option](https://cli.vuejs.org/config/#baseurl) is now [removed](https://github.com/vuejs/vue-cli/pull/4388)

- [Upgraded versions of several underlying webpack loaders](https://github.com/vuejs/vue-cli/pull/4331) [TODO elaborate this]

If you've customized the internal rules with `chainWebpack`, please notice that `webpack-chain` was updated from v4 to v6, the most noticeable change is the `minimizer` config. [TODO: add example here].

Please also notice that the following rules/loaders have been updated:

1. [`copy-webpack-plugin`](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md#500-2019-02-20), the `debug` option was renamed to `logLevel`
2. [use EnvironmentPlugin instead of DefinePlugin for `process.env.*` vars](https://github.com/vuejs/vue-cli/pull/3782), [TODO: detailed explanation]
3. [The `pug-plain` rule was renamed to `pug-plain-loader`](https://github.com/vuejs/vue-cli/pull/4230)

### `@vue/babel-preset-app`, `@vue/cli-plugin-babel`

- [Upgrade to core-js v3](https://github.com/vuejs/vue-cli/pull/3912). [TODO: detailed explanation]
- Use `@vue/cli-plugin-babel/preset` [TODO: auto migration & elaborate on this]

------

### `@vue/cli-plugin-eslint`

This plugin now [requires ESLint as a peer dependency]((https://github.com/vuejs/vue-cli/pull/3852)).

This won't affect projects scaffolded with Vue CLI 3.1 or later.

If your project was scaffolded with Vue CLI 3.0.x or earlier, you may need to add `eslint@4` to your project dependencies (This is automated if you upgrade the plugin using `vue upgrade eslint --next`).

It's also recommended to upgrade your ESLint to v5, and ESLint config versions to latest. (ESLint v6 support is still on the way)

------

[TODO][Notes on prettier config version]

------

(the following only affects development)

The default value of `lintOnSave` option (when not specified) was [changed from `true` to `'default'`](https://github.com/vuejs/vue-cli/pull/3975). You can read more on the detailed explanation in the [documentation](https://cli.vuejs.org/config/#lintonsave).

In a nutshell:

- In v3, by default, lint warnings, along with errors, will be displayed in the error overlay
- In v4, by default, only lint errors will interrupt your development process. Warnings are only logged in the terminal console.

### `@vue/cli-plugin-pwa`

- [Upgraded to workbox v4](https://github.com/vuejs/vue-cli/pull/3915)
- [`manifest.json` is now generated by the plugin itself](https://github.com/vuejs/vue-cli/pull/2981)

### `@vue/cli-plugin-e2e-cypress`

Before Vue CLI v3.0.0-beta.10, the default command for E2E testing was `vue-cli-service e2e`. Later we changed it to `vue-cli-service test:e2e`. The previous command was since deprecated but still supported.
We have now completely [dropped support for this legacy command](https://github.com/vuejs/vue-cli/pull/3774).

### `@vue/cli-plugin-e2e-nightwatch`

- [#3388](https://github.com/vuejs/vue-cli/pull/3388) upgrade to nightwatch v1
- [#3916](https://github.com/vuejs/vue-cli/pull/3916) upgrade to chromedriver v74 and make it a peer dependency
- [#3774](https://github.com/vuejs/vue-cli/pull/3774) remove support for legacy `vue-cli-service e2e` command

### `@vue/cli-plugin-typescript`

When using Typescript, the webpack resolve options now [prefer `ts(x)` file extensions over `js(x)` ones](https://github.com/vuejs/vue-cli/pull/3909).

### `@vue/cli-plugin-unit-jest`

We've upgraded the bundled Jest from v23 to v24, so please read their [release notes](https://jestjs.io/blog/2019/01/25/jest-24-refreshing-polished-typescript-friendly) first. The full changelog is at <https://github.com/facebook/jest/blob/20ba4be9499d50ed0c9231b86d4a64ec8a6bd303/CHANGELOG.md#2400>.

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
