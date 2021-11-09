# @vue/cli-plugin-e2e-cypress

> e2e-cypress plugin for vue-cli

This adds E2E testing support using [Cypress](https://www.cypress.io/).

Cypress offers a rich interactive interface for running E2E tests in Firefox and Chromium based browsers (Chrome, MS Edge, Brave, Electron). To learn more about cross browser testing, visit the [Cypress Cross Browser Testing Guide](https://on.cypress.io/cross-browser-testing).

> **Note:** If you have a hard requirement on E2E testing in IE or Safari, consider using the Selenium-based [@vue/cli-plugin-e2e-nightwatch](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch).

## Injected Commands

- **`vue-cli-service test:e2e`**

  Run e2e tests with `cypress run`.

  By default it launches Cypress in interactive mode with a GUI (via `cypress open`). If you want to run the tests in headless mode (e.g. for CI), you can do so with the `--headless` option.

  The command automatically starts a server in production mode to run the e2e tests against. If you want to run the tests multiple times without having to restart the server every time, you can start the server with `vue-cli-service serve --mode production` in one terminal, and then run e2e tests against that server using the `--url` option.

  Options:

  ```
  --headless run in headless mode without GUI
  --mode     specify the mode the dev server should run in. (default: production)
  --url      run e2e tests against given url instead of auto-starting dev server
  -s, --spec (headless only) runs a specific spec file. defaults to "all"
  ```

  Additionally:

  - In GUI mode, [all Cypress CLI options for `cypress open` are also supported](https://docs.cypress.io/guides/guides/command-line.html#cypress-open);
  - In `--headless` mode, [all Cypress CLI options for `cypress run` are also supported](https://docs.cypress.io/guides/guides/command-line.html#cypress-run).

  Examples :
  - Run Cypress in headless mode for a specific file: `vue-cli-service test:e2e --headless --spec tests/e2e/specs/actions.spec.js`

## Configuration

We've pre-configured Cypress to place most of the e2e testing related files under `<projectRoot>/tests/e2e`. You can also check out [how to configure Cypress via `cypress.json`](https://docs.cypress.io/guides/references/configuration.html#Options).

## Environment Variables

Cypress doesn't load .env files for your test files the same way as `vue-cli` does for your [application code](https://cli.vuejs.org/guide/mode-and-env.html#using-env-variables-in-client-side-code). Cypress supports a few ways to [define env variables](https://docs.cypress.io/guides/guides/environment-variables.html#) but the easiest one is to use .json files (either `cypress.json` or `cypress.env.json`) to define environment variables. Keep in mind those variables are accessible via `Cypress.env` function instead of regular `process.env` object.

## Installing in an Already Created Project

```bash
vue add e2e-cypress
```
