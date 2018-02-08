# @vue/cli-plugin-unit-mocha

> unit-mocha plugin for vue-cli

## Injected Commands

- **`vue-cli-service test`**

  Run unit tests with [mocha-webpack](https://github.com/zinserjan/mocha-webpack) + [chai](http://chaijs.com/).

  **Note the tests are run inside Node.js with browser environment simulated with JSDOM.**

  ```
  Usage: vue-cli-service test [options] [...files]

  Options:

    --watch, -w   run in watch mode
    --grep, -g    only run tests matching <pattern>
    --slow, -s    "slow" test threshold in milliseconds
    --timeout, -t timeout threshold in milliseconds
    --bail, -b    bail after first test failure
    --require, -r require the given module before running tests
    --include     include the given module into test bundle
  ```

  Default files matches are: any files in `test/unit` that end in `.spec.(ts|js)`.

  All [mocha-wepback command line options](http://zinserjan.github.io/mocha-webpack/docs/installation/cli-usage.html) are also supported.

## Configuration

Jest can be configured via `jest.config.js` in your project root, or the `jest` field in `package.json`.

## Installing in an Already Created Project

``` sh
npm install -D @vue/cli-plugin-unit-mocha
vue invoke unit-mocha
```
