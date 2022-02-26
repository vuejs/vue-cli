# @vue/cli-plugin-e2e-webdriverio

> e2e-webdriverio plugin for vue-cli

## Injected Commands

- **`vue-cli-service test:e2e`**

  Run end-to-end tests with [WebdriverIO](https://webdriver.io/).

  Options:

  ```
  --remote          Run tests remotely on SauceLabs

  All WebdriverIO CLI options are also supported.

  ```

  Additionally, all [WebdriverIO CLI options](https://webdriver.io/docs/clioptions.html) are also supported.
  E.g.: `--baseUrl`, `--bail` etc.


## Project Structure

The following structure will be generated when installing this plugin:

```
tests/e2e/
  ├── pageobjects/
  |   └── app.page.js
  ├── specs/
  |   ├── app.spec.js
  └── .eslintrc.js
```

In addition to that there will be 3 configuration files generated:

- `wdio.shared.conf.js`: a shared configuration with all options defined for all environments
- `wdio.local.conf.js`: a local configuration for local testing
- `wdio.sauce.conf.js`: a remote configuration for testing on a cloud provider like [Sauce Labs](https://saucelabs.com/)

The directories contain:

#### `pageobjects`
Contains an example for an page object. Read more on using [PageObjects](https://webdriver.io/docs/pageobjects.html) with WebdriverIO.

#### `specs`
Your e2e tests.

## Installing in an Already Created Project

```bash
vue add e2e-webdriverio
```

For users with older CLI versions you may need to run `vue add @vue/e2e-webdriverio`.

## Running Tests

By default, all tests inside the `specs` folder will be run using Chrome. If you'd like to run end-to-end tests against Chrome (or Firefox) in headless mode, simply pass the `--headless` argument. Tests will be automatically run in parallel when executed in the cloud.

```bash
$ vue-cli-service test:e2e
```

**Running a single test**

To run a single test supply the filename path. E.g.:

```bash
$ vue-cli-service test:e2e --spec tests/e2e/specs/test.js
```

**Skip Dev server auto-start**

If the development server is already running and you want to skip starting it automatically, pass the `--url` argument:

```bash
$ vue-cli-service test:e2e --baseUrl=http://localhost:8080/
```
