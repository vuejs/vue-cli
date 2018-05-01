# @vue/cli-plugin-e2e-cypress

> e2e-cypress plugin for vue-cli

This adds E2E testing support using [Cypress](https://www.cypress.io/).

Cypress offers a rich interactive interface for running E2E tests, but currently only supports running the tests in Chromium. If you have a hard requirement on E2E testing in multiple browsers, consider using the Selenium-based [@vue/cli-plugin-e2e-nightwatch](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch).

## Injected Commands

- **`vue-cli-service test:e2e`**

  Run e2e tests with `cypress run`.

  By default it launches Cypress in interactive mode with a GUI. If you want to run the tests in headless mode (e.g. for CI), you can do so with the `--headless` option.

  The command automatically starts a server in production mode to run the e2e tests against. If you want to run the tests multiple times without having to restart the server every time, you can start the server with `vue-cli-service serve --mode production` in one terminal, and then run e2e tests against that server using the `--url` option.

  Options:

  ```
  --headless run in headless mode without GUI
  --mode     specify the mode the dev server should run in. (default: production)
  --url      run e2e tests against given url instead of auto-starting dev server
  -s, --spec (headless only) runs a specific spec file. defaults to "all"
  ```

  Additionally, [all Cypress CLI options for `cypress run` are also supported](https://docs.cypress.io/guides/guides/command-line.html#cypress-run).

## Configuration

We've pre-configured Cypress to place most of the e2e testing related files under `<projectRoot>/tests/e2e`. You can also check out [how to configure Cypress via `cypress.json`](https://docs.cypress.io/guides/references/configuration.html#Options).

## Installing in an Already Created Project

``` sh
vue add e2e-cypress
```
