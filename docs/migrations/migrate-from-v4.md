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

And then see the following section for detailed breaking changes introduced in each package.

------

## One-By-One Manual Migration

If you want to migrate manually and gradually, you can run `vue upgrade <the-plugin-name>` to upgrade a specific Vue CLI plugin.

------

## Breaking Changes

### For All Packages

* Drop support of Node.js 8, 11, 13

### The Global `@vue/cli` and The `vue` Command

### `@vue/cli-plugin-eslint`

* `eslint-loader` is upgraded [from v2 to v4](https://github.com/webpack-contrib/eslint-loader/blob/master/CHANGELOG.md). The only major change is that it dropped support for ESLint < v6.

### `@vue/cli-plugin-typescript`

#### Dropped TSLint support

As [TSLint has been deprecated](https://github.com/palantir/tslint/issues/4534), we [removed](https://github.com/vuejs/vue-cli/pull/5065) all TSLint-related code in this version.
Please consider switching to ESLint. You can check out [`tslint-to-eslint-config`](https://github.com/typescript-eslint/tslint-to-eslint-config) for a mostly automatic migration experience.

### Internal Packages

#### `@vue/cli-shared-utils`

- Bump [chalk](https://github.com/chalk/chalk) from v2 to v4
