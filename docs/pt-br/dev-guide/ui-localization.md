# UI Localization

## Translate the standard UI

Follow those simple steps to propose a new language for the CLI UI!

1. Run `navigator.languages` or `navigator.language` to get the language code for the new locale. *For example: `'fr'`.*

2. Search NPM to see if a package called `vue-cli-locale-<language code>` doesn't already exist. If it does, please contribute to it by submitting PRs! If you don't find any, create a new package called `vue-cli-locale-<language code>`. *For example: `vue-cli-locale-fr`*

3. Put the locale JSON file in a `locales` folder and give it the name of the language code. *For example: `locales/fr.json`*

4. In the `package.json` file, set the `unpkg` field to the path to the locale file. *For example: `"unpkg": "./locales/fr.json"`*

5. Publish the package on NPM.

The English reference locale is [here](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/locales/en.json).

Take a look at [the french localization package](https://github.com/Akryum/vue-cli-locale-fr) as an example.

## Translate your plugin

You can put locale files compatible with [vue-i18n](https://github.com/kazupon/vue-i18n) in a `locales` folder at the root of your plugin. They will be automatically loaded into the client when the project is opened. You can then use `$t` to translate strings in your components and other vue-i18n helpers. Also, the strings used in the UI API (like `describeTask`) will go through vue-i18n as well to you can localize them.

Example `locales` folder:

```
vue-cli-plugin/locales/en.json
vue-cli-plugin/locales/fr.json
```

Example usage in API:

```js
api.describeConfig({
  // vue-i18n path
  description: 'com.my-name.my-plugin.config.foo'
})
```

::: danger
Make sure to namespace the id correctly, since it must be unique across all plugins. It's recommended to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

Example usage in components:

```html
<VueButton>{{ $t('com.my-name.my-plugin.actions.bar') }}</VueButton>
```

You can also load the locale files in a client addon if you prefer, using the `ClientAddonApi`:

```js
// Load the locale files (uses vue-i18n)
const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
locales.keys().forEach(key => {
  const locale = key.match(/([a-z0-9]+)\./i)[1]
  ClientAddonApi.addLocalization(locale, locales(key))
})
```
