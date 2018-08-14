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

``` sh
# macOS or linux
node --inspect-brk ./node_modules/.bin/vue-cli-service test:unit

# Windows
node --inspect-brk ./node_modules/@vue/cli-service/bin/vue-cli-service.js test:unit
```

## Configuration

Jest can be configured via `jest.config.js` in your project root, or the `jest` field in `package.json`.

## Installing in an Already Created Project

``` sh
vue add @vue/unit-jest
```
