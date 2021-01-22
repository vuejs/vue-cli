---
sidebar: auto
---

# Migrate from v4

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

And then follow the command line instructions.

See the following section for detailed breaking changes introduced in each package.

------

## One-By-One Manual Migration

If you want to migrate manually and gradually, you can run `vue upgrade <the-plugin-name>` to upgrade a specific Vue CLI plugin.

------

## Breaking Changes

### For All Packages

* Drop support of Node.js 8, 11, 13
* Drop support of NPM 5

### The `vue` Command (The Global `@vue/cli` Package)

The [instant prototyping functionalities](https://v4.cli.vuejs.org/guide/prototyping.html) are removed. Now the `vue serve` / `vue build` commands are aliases to `npm run serve` / `npm run build`, which in turn execute the scripts specified in the project `package.json`.

If you need a minimum setup for developing standalone `.vue` components, please use [`vite`](https://github.com/vitejs/vite/#readme) instead.

### `@vue/cli-service`

#### Webpack 5

We've upgraded the underlying webpack version to 5. There are plenty of breaking changes underlyingly, listed in the release announcement page [Webpack 5 release (2020-10-10)](https://webpack.js.org/blog/2020-10-10-webpack-5-release/).

Besides the internal changes that are only noticeable for custom configurations, there're several notable changes for user-land code too:

1. Named exports from JSON modules are no longer supported. Instead of `import { version } from './package.json'; console.log(version);` use `import package from './package.json'; console.log(package.version);`
2. Webpack 5 does no longer include polyfills for Node.js modules by default. You shall see an informative error message if your code relies on any of these modules. A detailed list of previously polyfilled modules is also available [here](https://github.com/webpack/webpack/pull/8460/commits/a68426e9255edcce7822480b78416837617ab065).

#### Opt Out to Webpack 4

Considering many ecosystem packages haven't catched up yet, we provided a plugin to opt out to webpack 4 for easier migration.

It's as simple as running

```sh
vue add webpack-4
```

at the project root.

Underlyingly, it uses the [`resolutions`](https://classic.yarnpkg.com/en/docs/selective-version-resolutions) field for Yarn and PNPM users, and [`module-alias`](https://github.com/ilearnio/module-alias) for NPM users.

Though both work in all our tests, please be aware that the `module-alias` approach is still considered hacky, and may not be as stable as the `"resolutions"` one.

#### Sass/SCSS

No longer supports generating project with `node-sass`. It has been [deprecated](https://sass-lang.com/blog/libsass-is-deprecated#how-do-i-migrate) for a while. Please use the `sass` package instead.

#### Underlying Loaders and Plugins

* `html-webpack-plugin` is upgraded from v3 to v4, see more details in the [release announcement](https://dev.to/jantimon/html-webpack-plugin-4-has-been-released-125d).
* `sass-loader` v7 support is dropped. See the v8 breaking changes at its [changelog](https://github.com/webpack-contrib/sass-loader/blob/master/CHANGELOG.md#800-2019-08-29).
* `postcss-loader` is upgraded from v3 to v4. Most notably, `PostCSS` options (`plugin` / `syntax` / `parser` / `stringifier`) are moved into the `postcssOptions` field. More details available at the [changelog](https://github.com/webpack-contrib/postcss-loader/blob/master/CHANGELOG.md#400-2020-09-07).
* `copy-webpack-plugin` is upgraded from v5 to v6. If you never customized its config through `config.plugin('copy')`, there should be no user-facing breaking changes. A full list of breaking changes is available at [`copy-webpack-plugin` v6.0.0 release](https://github.com/webpack-contrib/copy-webpack-plugin/releases/tag/v6.0.0).
* `file-loader` is upgraded from v4 to v6, and `url-loader` from v2 to v4. The `esModule` option is now turned on by default for non-Vue-2 projects. Full changelog available at [`file-loader` changelog](https://github.com/webpack-contrib/file-loader/blob/master/CHANGELOG.md) and [`url-loader` changelog](https://github.com/webpack-contrib/url-loader/blob/master/CHANGELOG.md)
* `terser-webpack-plugin` is upgraded from v2 to v4, using terser 5 and some there are some changes in the options format. See full details in its [changelog](https://github.com/webpack-contrib/terser-webpack-plugin/blob/master/CHANGELOG.md#400-2020-08-04).

### ESLint Plugin

* `eslint-loader` is replaced by [eslint-webpack-plugin](https://github.com/webpack-contrib/eslint-webpack-plugin), dropping support for ESLint <= 6.
* New projects are now generated with `eslint-plugin-vue` v7, see its [release notes](https://github.com/vuejs/eslint-plugin-vue/releases/tag/v7.0.0) for breaking changes.

### PWA Plugin

* The underlying `workbox-webpack-plugin` is upgraded from v4 to v6. Detailed migration guides available on workbox's website:
  * [From Workbox v4 to v5](https://developers.google.com/web/tools/workbox/guides/migrations/migrate-from-v4)
  * [From Workbox v5 to v6](https://developers.google.com/web/tools/workbox/guides/migrations/migrate-from-v5)

### TypeScript Plugin

* Dropped TSLint support. As [TSLint has been deprecated](https://github.com/palantir/tslint/issues/4534), we [removed](https://github.com/vuejs/vue-cli/pull/5065) all TSLint-related code in this version.
Please consider switching to ESLint. You can check out [`tslint-to-eslint-config`](https://github.com/typescript-eslint/tslint-to-eslint-config) for a mostly automatic migration experience.
* `ts-loader` is upgraded from v6 to v8. It now only supports TypeScript >= 3.6.
* `fork-ts-checker-webpack-plugin` is upgraded from v3.x to v6.x, you can see the detailed breaking changes in its release notes:
  * [v4.0.0](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v4.0.0)
  * [v5.0.0](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v5.0.0)
  * [v6.0.0](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v6.0.0)

### E2E-Cypress Plugin

* Cypress is required as a peer dependency.
* Cypress is updated from v3 to v6. See [Cypress Migration Guide](https://docs.cypress.io/guides/references/migration-guide.html) for detailed instructions of the migration process.

### Unit-Jest Plugin

* The underlying `jest`-related packages are upgraded from v24 to v26. For most users the transition would be seamless. See their corresponding changelogs for more detail:
  * [jest, babel-jest](https://github.com/facebook/jest/blob/v26.6.3/CHANGELOG.md)
  * [ts-jest](https://github.com/kulshekhar/ts-jest/blob/v26.4.4/CHANGELOG.md)

### Unit-Mocha Plugin

* `mocha` is upgraded from v6 to v8, please refer to the release notes of [mocha v7](https://github.com/mochajs/mocha/releases/tag/v7.0.0) and [mocha v8](https://github.com/mochajs/mocha/releases/tag/v8.0.0) for a complete list of breaking changes.
* `jsdom` is upgraded from v15 to v16, the breaking changes are listed at [`jsdom` v16.0.0 release](https://github.com/jsdom/jsdom/releases/tag/16.0.0)

### Internal Packages

#### `@vue/cli-shared-utils`

* [chalk](https://github.com/chalk/chalk) is upgraded from v2 to v4
* [joi](https://github.com/sideway/joi) is upgraded from v15 (used to be `@hapi/joi`) to v17
