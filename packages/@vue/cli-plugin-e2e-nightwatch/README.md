# @vue/cli-plugin-e2e-nightwatch

> e2e-nightwatch plugin for vue-cli

## Injected Commands

- **`vue-cli-service test:e2e`**

  Run end-to-end tests with [Nightwatch.js](https://nightwatchjs.org).

  Options:

  ```
  --url                 run the tests against given url instead of auto-starting dev server
  --config              use custom nightwatch config file (overrides internals)
  --headless            use chrome or firefox in headless mode
  --parallel            enable parallel mode via test workers (only available in chromedriver)
  --use-selenium        use Selenium standalone server instead of chromedriver or geckodriver
  -e, --env             specify comma-delimited browser envs to run in (default: chrome)
  -t, --test            specify a test to run by name
  -f, --filter          glob to filter tests by filename
  ```

  Additionally, all [Nightwatch CLI options](https://nightwatchjs.org/guide/running-tests/#command-line-options) are also supported.
  E.g.: `--verbose`, `--retries` etc.


## Project Structure

The following structure will be generated when installing this plugin. There are examples for most testing concepts in Nightwatch available.

```
tests/e2e/
  ├── custom-assertions/
  |   └── elementCount.js
  ├── custom-commands/
  |   ├── customExecute.js
  |   ├── openHomepage.js
  |   └── openHomepageClass.js
  ├── page-objects/
  |   └── homepage.js
  ├── specs/
  |   ├── test.js
  |   └── test-with-pageobjects.js
  └── globals.js
```

#### `specs`
The main location where tests are located. Can contain sub-folders which can be targeted during the run using the `--group` argument. [More info](https://nightwatchjs.org/guide/running-tests/#test-groups).

#### `custom-assertions`
Files located here are loaded automatically by Nightwatch and placed onto the `.assert` and `.verify` api namespaces to extend the Nightwatch built-in assertions. See [writing custom assertions](https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-assertions) for details.

#### `custom-commands`
Files located here are loaded automatically by Nightwatch and placed onto the main `browser` api object to extend the built-in Nightwatch commands. See [writing custom commands](https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-commands) for details.

#### `page objects`
Working with page objects is a popular methodology in end-to-end UI testing. Files placed in this folder are automatically loaded onto the `.page` api namespace, with the name of the file being the name of the page object. See [working with page objects](https://nightwatchjs.org/guide/working-with-page-objects/) section for details.

#### `globals.js`
The external globals file which can hold global properties or hooks. See [test globals](https://nightwatchjs.org/gettingstarted/configuration/#test-globals) section.

## Installing in an Already Created Project

```bash
vue add e2e-nightwatch
```

## Configuration

We've pre-configured Nightwatch to run with Chrome by default. Firefox is also available via `--env firefox`. If you wish to run end-to-end tests in additional browsers (e.g. Safari, Microsoft Edge), you will need to add a `nightwatch.conf.js` or `nightwatch.json` in your project root to configure additional browsers. The config will be merged into the [internal Nightwatch config](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-plugin-e2e-nightwatch/nightwatch.config.js).

Alternatively, you can completely replace the internal config with a custom config file using the `--config` option.

Consult Nightwatch docs for [configuration options](https://nightwatchjs.org/gettingstarted/configuration/) and how to [setup browser drivers](http://nightwatchjs.org/gettingstarted#browser-drivers-setup).

## Running Tests

By default, all tests inside the `specs` folder will be run using Chrome. If you'd like to run end-to-end tests against Chrome (or Firefox) in headless mode, simply pass the `--headless` argument.

```bash
$ vue-cli-service test:e2e
```

**Running a single test**

To run a single test supply the filename path. E.g.:

```bash
$ vue-cli-service test:e2e tests/e2e/specs/test.js
```

**Skip Dev server auto-start**

If the development server is already running and you want to skip starting it automatically, pass the `--url` argument:

```bash
$ vue-cli-service test:e2e --url http://localhost:8080/
```

**Running in Firefox**

Support for running tests in Firefox is also available by default. Simply run the following (optionally add `--headless` to run Firefox in headless mode):

```bash
$ vue-cli-service test:e2e --env firefox [--headless]
```

**Running in Firefox and Chrome simultaneously**

You can also run the tests simultaneously in both browsers by supplying both test environments separated by a comma (",") - no spaces.

```bash
$ vue-cli-service test:e2e --env firefox,chrome [--headless]
```

**Running Tests in Parallel**

For a significantly faster test run, you can enable parallel test running when there are several test suites. Concurrency is performed at the file level and is distributed automatically per available CPU core.

For now, this is only available in Chromedriver. Read more about [parallel running](https://nightwatchjs.org/guide/running-tests/#parallel-running) in the Nightwatch docs.

```bash
$ vue-cli-service test:e2e --parallel
```

**Running with Selenium**

Since `v4`, the Selenium standalone server is not included anymore in this plugin and in most cases running with Selenium is not required since Nightwatch v1.0.

It is still possible to use the Selenium server, by following these steps:

__1.__ Install `selenium-server` NPM package:

  ```bash
  $ npm install selenium-server --save-dev
  ```

__2.__ Run with `--use-selenium` cli argument:

  ```bash
  $ vue-cli-service test:e2e --use-selenium
  ```
