# @vue/cli-plugin-e2e-nightwatch

> e2e-nightwatch plugin for vue-cli

## Injected Commands

- **`vue-cli-service test:e2e`**

  run e2e tests with [NightwatchJS](http://nightwatchjs.org).

  Options:

  ```
  --url        run e2e tests against given url instead of auto-starting dev server
  --config     use custom nightwatch config file (overrides internals)
  -e, --env    specify comma-delimited browser envs to run in (default: chrome)
  -t, --test   specify a test to run by name
  -f, --filter glob to filter tests by filename
  ```

  > Note: this plugin currently uses Nightwatch v0.9.x. We are waiting for Nightwatch 1.0 to stabilize before upgrading.

  Additionally, [all Nightwatch CLI options are also supported](https://github.com/nightwatchjs/nightwatch/blob/master/lib/runner/cli/cli.js).

## Configuration

We've pre-configured Nightwatch to run with Chrome by default. If you wish to run e2e tests in additional browsers, you will need to add a `nightwatch.config.js` or `nightwatch.json` in your project root to configure additional browsers. The config will be merged into the [internal Nightwatch config](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-plugin-e2e-nightwatch/nightwatch.config.js).

Alternatively, you can completely replace the internal config with a custom config file using the `--config` option.

Consult Nightwatch docs for [configuration options](http://nightwatchjs.org/gettingstarted#settings-file) and how to [setup browser drivers](http://nightwatchjs.org/gettingstarted#browser-drivers-setup).

## Installing in an Already Created Project

``` sh
vue add @vue/e2e-nightwatch
```
