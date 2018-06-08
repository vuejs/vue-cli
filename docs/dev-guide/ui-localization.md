# UI Localization

## Translate the UI

Follow those simple steps to propose a new language for the CLI UI!

1. Run `navigator.languages` or `navigator.language` to get the language code for the new locale. *For example: `'fr'`.*

2. Search NPM to see if a package called `vue-cli-locale-<language code>` doesn't already exist. If it does, please contribute to it by submitting PRs! If you don't find any, create a new package called `vue-cli-locale-<language code>`. *For example: `vue-cli-locale-fr`*

3. Put the locale JSON file in a `locales` folder and give it the name of the language code. *For example: `locales/fr.json`*

4. In the `package.json` file, set the `unpkg` field to the path to the locale file. *For example: `"unpkg": "./locales/fr.json"`*

5. Publish the package on NPM.

The English reference locale is [here](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/locales/en.json).

Take a look at [the french localization package](https://github.com/Akryum/vue-cli-locale-fr) as an example.
