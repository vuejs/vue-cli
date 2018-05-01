# @vue/cli-plugin-unit-jest

> unit-jest plugin for vue-cli

## Injected Commands

- **`vue-cli-service test:unit`**

  Run unit tests with Jest. Default `testMatch` is `<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))` which matches:

  - Any files in `tests/unit` that end in `.spec.(js|jsx|ts|tsx)`;
  - Any js(x)/ts(x) files inside `__tests__` directories.

  Usage: `vue-cli-service test:unit [options] <regexForTestFiles>`

  All [Jest command line options](https://facebook.github.io/jest/docs/en/cli.html) are also supported.

## Configuration

Jest can be configured via `jest.config.js` in your project root, or the `jest` field in `package.json`.

## Installing in an Already Created Project

``` sh
vue add unit-jest
```
