# @vue/cli-plugin-e2e-nightwatch

> e2e-webdriverio plugin for vue-cli

## Injected Commands

- **`vue-cli-service test:e2e`**

  Run end-to-end tests with [WebdriverIO](https://webdriver.io/).

  Options:

  ```
  --url                 run the tests against given url instead of auto-starting dev server
  --headless            use chrome or firefox in headless mode
  --remote              run e2e tests on a cloud provider
  ```

  Additionally, all [WebdriverIO CLI options](https://webdriver.io/docs/clioptions.html) are also supported.
  E.g.: `--spec`, `--watch` etc.


## Project Structure

The following structure will be generated when installing this plugin. It includes a spec file a page object definition for the Vue.js app as example.

```
tests/e2e/
  ├── pageobjects/
  |   └── app.page.js
  ├── specs/
  |   ├── app.spec.js
  └── .eslintrc.js
```

#### `pageobjects`
Working with page objects is a popular methodology in end-to-end UI testing. See [working with page objects](https://webdriver.io/docs/pageobjects.html) section for details.

#### `specs`
The main location where tests are located. You can specify specific tests or define suites to run various subsets of these tests. [More info](https://webdriver.io/docs/organizingsuites.html).

## Installing in an Already Created Project

``` sh
vue add e2e-webdriverio
```

## Running Tests

By default, all tests inside the `specs` folder will be run using Chrome. If you'd like to run end-to-end tests against Chrome (or Firefox) in headless mode, simply pass the `--headless` argument.

```sh
$ vue-cli-service test:e2e
```

This will run the tests automatically in parallel on Firefox and Chrome.

**Running a single test**

To run a single test supply the filename path. E.g.:

```sh
$ vue-cli-service test:e2e --spec tests/e2e/specs/test.js
```
