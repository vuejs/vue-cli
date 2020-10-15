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

### The `vue` Command (The Global `@vue/cli` Package)

### `@vue/cli-service`

Updated several underlying loaders and plugins:

* Updated `copy-webpack-plugin` from v5 to v6. If you never customized its config through `config.plugin('copy')`, there should be no user-facing breaking changes. A full list of breaking changes is available at <https://github.com/webpack-contrib/copy-webpack-plugin/releases/tag/v6.0.0>.
* Updated `file-loader` from v4 to v6, and `url-loader` from v2 to v4. The `esModule` option is now turned on by default for non-Vue-2 projects. Full changelog available at <https://github.com/webpack-contrib/file-loader/blob/master/CHANGELOG.md> and <https://github.com/webpack-contrib/url-loader/blob/master/CHANGELOG.md>
* Updated `terser-webpack-plugin` from v2 to v4, using terser 5 and some there are some changes in the options format. Full changelog at <https://github.com/webpack-contrib/terser-webpack-plugin/blob/master/CHANGELOG.md>

### ESLint Plugin

* `eslint-loader` is upgraded [from v2 to v4](https://github.com/webpack-contrib/eslint-loader/blob/master/CHANGELOG.md). The only major change is that it dropped support for ESLint < v6.

### TypeScript Plugin

* Dropped TSLint support. As [TSLint has been deprecated](https://github.com/palantir/tslint/issues/4534), we [removed](https://github.com/vuejs/vue-cli/pull/5065) all TSLint-related code in this version.
Please consider switching to ESLint. You can check out [`tslint-to-eslint-config`](https://github.com/typescript-eslint/tslint-to-eslint-config) for a mostly automatic migration experience.
* Updated `ts-loader` from v6 to v8. It now only supports TypeScript >= 3.6.
* Updated `fork-ts-checker-webpack-plugin` from v3.x to v5.x, you can see the detailed breaking changes at <https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v4.0.0> and <https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/releases/tag/v5.0.0>

### E2E-Cypress Plugin

* Cypress is updated from v3 to v5. See <https://docs.cypress.io/guides/references/migration-guide.html> for a detailed migration guide.

### Unit-Mocha Plugin

* Updated `mocha` from v6 to v7, please refer to the release notes of [mocha v7](https://github.com/mochajs/mocha/releases/tag/v7.0.0) for a complete list of breaking changes.
* Updated `jsdom` from v15 to v16, the breaking changes are listed at <https://github.com/jsdom/jsdom/releases/tag/16.0.0>

### Internal Packages

#### `@vue/cli-shared-utils`

* Bump [chalk](https://github.com/chalk/chalk) from v2 to v4
