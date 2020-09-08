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

### Internal Packages

#### `@vue/cli-shared-utils`

- Bump [chalk](https://github.com/chalk/chalk) from v2 to v4
-
