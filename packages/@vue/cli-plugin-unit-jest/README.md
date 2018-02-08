# @vue/cli-plugin-unit-jest

> unit-jest plugin for vue-cli

## Injected Commands

- **`vue-cli-service test`**

  Run unit tests with Jest. Default files matches are:

  - Any files in `test/unit` that end in `.spec.(js|ts)`;
  - Any js/ts files inside `__tests__` directories.

  Usage: `vue-cli-service test [options] <regexForTestFiles>`

  All [Jest command line options](https://facebook.github.io/jest/docs/en/cli.html) are also supported.

## Configuration

Jest can be configured via `jest.config.js` in your project root, or the `jest` field in `package.json`.

## Installing in an Already Created Project

``` sh
npm install -D @vue/cli-plugin-unit-jest
vue invoke unit-jest
```
