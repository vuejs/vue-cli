# UI Localization

## Translate the standard UI

To make collaboration and synchronisation easier, the English source locale from the `dev` branch is automatically imported to [Transifex](https://www.transifex.com/vuejs/vue-cli/dashboard/), a platform for collaborative translation.

For existing languages, you can [sign up as a translator](https://www.transifex.com/vuejs/vue-cli/dashboard/).
For new languages, you can [request the new language](https://www.transifex.com/vuejs/vue-cli/dashboard/) after signing up.

In either case you will be able to translate keys as they are added or changed in the source locale.

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
