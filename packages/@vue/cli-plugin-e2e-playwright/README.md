# @vue/cli-plugin-e2e-playwright

> e2e-playwright plugin for vue-cli

This adds E2E testing support using [Playwright](https://playwright.dev/).

Playwright enables reliable end-to-end testing for modern web apps. It has a single API to run your tests across any platform and any browser (Chromium, Firefox, WebKit), Electron and Android.

> **Note:** If you have a hard requirement on E2E testing in IE, consider using the Selenium-based [@vue/cli-plugin-e2e-nightwatch](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch).

## Configuration

We've pre-configured Playwright to place most of the e2e testing related files under `<projectRoot>/e2e`. You can also check out [how to configure Playwright via `playwright.config.ts/js`](https://playwright.dev/docs/next/test-configuration).

## Environment Variables

Playwright doesn't load `.env` files for your test files the same way as `vue-cli` does for your [application code](https://cli.vuejs.org/guide/mode-and-env.html#using-env-variables-in-client-side-code). Playwright recommends to use `dotenv` inside your Playwright config see [here](https://playwright.dev/docs/next/test-parameterize#env-files).

## Getting started

To run tests, run `npx playwright test` from your command-line. For more information, see [Playwright documentation](https://playwright.dev/docs/intro).

## Installing in an Already Created Project

```bash
vue add e2e-playwright
```
