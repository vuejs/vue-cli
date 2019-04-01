# @vue/cli-plugin-unit-jest

> unit-jest plugin for vue-cli

## Injected Commands

- **`vue-cli-service test:unit`**

  Run unit tests with Jest. Default `testMatch` is `<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))` which matches:

  - Any files in `tests/unit` that end in `.spec.(js|jsx|ts|tsx)`;
  - Any js(x)/ts(x) files inside `__tests__` directories.

  Usage: `vue-cli-service test:unit [options] <regexForTestFiles>`

  All [Jest command line options](https://facebook.github.io/jest/docs/en/cli.html) are also supported.

## Debugging Tests

Note that directly running `jest` will fail because the Babel preset requires hints to make your code work in Node.js, so you must run your tests with `vue-cli-service test:unit`.

If you want to debug your tests via the Node inspector, you can run the following:

```sh
# macOS or linux
node --inspect-brk ./node_modules/.bin/vue-cli-service test:unit

# Windows
node --inspect-brk ./node_modules/@vue/cli-service/bin/vue-cli-service.js test:unit
```

## Configuration

Jest can be configured via `jest.config.js` in your project root, or the `jest` field in `package.json`.

## Installing in an Already Created Project

```sh
vue add @vue/unit-jest
```

## Transform dependencies from `/node_modules`

By default, jest doesn't transform anything from `/node_modules`.

Since jest runs in node, we also don't have to transpile anything that uses modern ECMAScript features as Node >=8 already supports these features, so it's a sensible default. cli-plugin-jest also doesn't respect the `transpileDependencies` option in `vue.config.js` for the same reason.

However, we have (at least) three cases where we do need to transpile code from `/node_modules` in jest:

1. Usage of ES6 `import`/`export` statements, which have to be compiled to commonjs `module.exports`
2. Single File Components (`.vue` files) which have to be run through `vue-jest`
3. Typescript code

To do this, we need to add an exception to the `tranformIgnorePatterns` option of jest. This is its default value:

```javascript
transformIgnorePatterns: ['/node_modules/']
```

We have to add exceptions to this pattern with a RegExp negative lookahead:

```javascript
transformIgnorePatterns: ['/node_modules/(?!name-of-lib-o-transform)']
```

To exclude multiple libraries:

```javascript
transformIgnorePatterns: ['/node_modules/(?!lib-to-transform|other-lib)']
```
