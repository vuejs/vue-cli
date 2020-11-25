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

### `@vue/cli-service`

#### Webpack 5

We've upgraded the underlying webpack version to 5. There are plenty of breaking changes underlyingly, listed in the release announcement page [Webpack 5 release (2020-10-10)](https://webpack.js.org/blog/2020-10-10-webpack-5-release/).

Besides the internal changes that are only noticeable for custom configurations, there're several notable changes for user-land code too:

1. named exports from JSON modules are no longer supported. Instead of `import { version } from './package.json'; console.log(version);` use `import package from './package.json'; console.log(package.version);`
2. webpack 5 does no longer include polyfills for Node.js modules by default

#### Opt Out to Webpack 4

Considering many ecosystem packages haven't catched up yet, we provided a way to opt out to webpack 4 for easier migration.

To use webpack 4, you need to use Yarn as the package manager, and specify the `"resolutions"` field in your `package.json`:

```json
{
  "resolutions": {
    "@vue/cli-*/webpack": "^4.44.2"
  }
}
```

#### Underlying Loaders and Plugins

* `copy-webpack-plugin` is upgraded from v5 to v6. If you never customized its config through `config.plugin('copy')`, there should be no user-facing breaking changes. A full list of breaking changes is available at [`copy-webpack-plugin` v6.0.0 release](https://github.com/webpack-contrib/copy-webpack-plugin/releases/tag/v6.0.0).
* `file-loader` is upgraded from v4 to v6, and `url-loader` from v2 to v4. The `esModule` option is now turned on by default for non-Vue-2 projects. Full changelog available at [`file-loader` changelog](https://github.com/webpack-contrib/file-loader/blob/master/CHANGELOG.md) and [`url-loader` changelog](https://github.com/webpack-contrib/url-loader/blob/master/CHANGELOG.md)
<!-- * `terser-webpack-plugin` is upgraded from v2 to v4, using terser 5 and some there are some changes in the options format. Full changelog at <https://github.com/webpack-contrib/terser-webpack-plugin/blob/master/CHANGELOG.md> -->

### ESLint Plugin

* `eslint-loader` is upgraded [from v2 to v4](https://github.com/webpack-contrib/eslint-loader/blob/master/CHANGELOG.md). The only major change is that it dropped support for ESLint < v6.

### TypeScript Plugin

* Dropped TSLint support. As [TSLint has been deprecated](https://github.com/palantir/tslint/issues/4534), we [removed](https://github.com/vuejs/vue-cli/pull/5065) all TSLint-related code in this version.
Please consider switching to ESLint. You can check out [`tslint-to-eslint-config`](https://github.com/typescript-eslint/tslint-to-eslint-config) for a mostly automatic migration experience.
* `ts-loader` is upgraded from v6 to v8. It now only supports TypeScript >= 3.6.
* `fork-ts-checker-webpack-plugin` is upgraded from v3.x to v5.x, you can see the detailed breaking changes at [`fork-ts-checker=webpack-plugin` v4.0.0 release](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v4.0.0) and [`fork-ts-checker=webpack-plugin` v5.0.0 release](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v5.0.0)

### E2E-Cypress Plugin

* Cypress is required as a peer dependency.
* Cypress is updated from v3 to v5. See [Cypress Migration Guide](https://docs.cypress.io/guides/references/migration-guide.html) for detailed instructions of the migration process.

### Unit-Mocha Plugin

* `mocha` is upgraded from v6 to v7, please refer to the [release notes of mocha v7](https://github.com/mochajs/mocha/releases/tag/v7.0.0) for a complete list of breaking changes.
* `jsdom` is upgraded from v15 to v16, the breaking changes are listed at [`jsdom` v16.0.0 release](https://github.com/jsdom/jsdom/releases/tag/16.0.0)

### Internal Packages

#### `@vue/cli-shared-utils`

* [chalk](https://github.com/chalk/chalk) is upgraded from v2 to v4
* [joi](https://github.com/sideway/joi) is upgraded from v15 (used to be `@hapi/joi`) to v17
