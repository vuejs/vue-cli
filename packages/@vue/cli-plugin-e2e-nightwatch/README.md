# @vue/cli-plugin-e2e-nightwatch

> e2e-nightwatch plugin for vue-cli

## Injected Commands

### `vue-cli-service e2e`

run e2e tests with [NightwatchJS](nightwatchjs.org).

Options:

```
--url        run e2e tests against given url instead of auto-starting dev server
-e, --env    specify comma-delimited browser envs to run in (default: chrome)
-t, --test   sepcify a test to run by name
-f, --filter glob to filter tests by filename
```

Additionally, [all Nightwatch CLI options are also supported](https://github.com/nightwatchjs/nightwatch/blob/master/lib/runner/cli/cli.js).

## Configuration

We've pre-configured Nightwatch to run with Chrome by default. If you wish to run e2e tests in additional browsers, you will need to add a `nightwatch.config.js` or `nightwatch.json` in your project root to configure additional browsers. The config will be merged into the [internal Nightwatch config](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-plugin-e2e-nightwatch/nightwatch.config.js).

Consult Nightwatch docs for [configuration options](http://nightwatchjs.org/gettingstarted#settings-file) and how to [setup browser drivers](http://nightwatchjs.org/gettingstarted#browser-drivers-setup).

## Installing in an Already Created Project

``` sh
npm install -D @vue/cli-plugin-e2e-nightwatch
vue invoke e2e-nightwatch
```
