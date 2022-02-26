# Browser Compatibility

## browserslist

You will notice a `browserslist` field in `package.json` (or a separate `.browserslistrc` file) specifying a range of browsers the project is targeting. This value will be used by [@babel/preset-env][babel-preset-env] and [autoprefixer][autoprefixer] to automatically determine the JavaScript features that need to be transpiled and the CSS vendor prefixes needed.

See [here][browserslist] for how to specify browser ranges.

## Polyfills

A default Vue CLI project uses [@vue/babel-preset-app][babel-preset-app], which uses `@babel/preset-env` and the `browserslist` config to determine the Polyfills needed for your project.

### useBuiltIns: 'usage'

By default, it passes [`useBuiltIns: 'usage'`](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) to `@babel/preset-env` which automatically detects the polyfills needed based on the language features used in your source code. This ensures only the minimum amount of polyfills are included in your final bundle. However, this also means **if one of your dependencies has specific requirements on polyfills, by default Babel won't be able to detect it.**

If one of your dependencies need polyfills, you have a few options:

1. **If the dependency is written in an ES version that your target environments do not support:** Add that dependency to the [`transpileDependencies`](../config/#transpiledependencies) option in `vue.config.js`. This would enable both syntax transforms and usage-based polyfill detection for that dependency.

2. **If the dependency ships ES5 code and explicitly lists the polyfills needed:** you can pre-include the needed polyfills using the [polyfills](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app#polyfills) option for `@vue/babel-preset-app`. **Note that `es.promise` is included by default because it's very common for libs to depend on Promises.**

    ``` js
    // babel.config.js
    module.exports = {
      presets: [
        ['@vue/app', {
          polyfills: [
            'es.promise',
            'es.symbol'
          ]
        }]
      ]
    }
    ```

    ::: tip
    It's recommended to add polyfills this way instead of directly importing them in your source code, because polyfills listed here can be automatically excluded if your `browserslist` targets don't need them.
    :::

3. **If the dependency ships ES5 code, but uses ES6+ features without explicitly listing polyfill requirements (e.g. Vuetify):** Use `useBuiltIns: 'entry'` and then add `import 'core-js/stable'; import 'regenerator-runtime/runtime';` to your entry file. This will import **ALL** polyfills based on your `browserslist` targets so that you don't need to worry about dependency polyfills anymore, but will likely increase your final bundle size with some unused polyfills.

See [@babel/preset-env docs](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) for more details.

### Polyfills when Building as Library or Web Components

When using Vue CLI to [build a library or Web Components](./build-targets.md), it is recommended to pass `useBuiltIns: false` to `@vue/babel-preset-app` to disable automatic polyfill injection. This ensures you don't include unnecessary polyfills in your code, as it should be the responsibility of the consuming app to include polyfills.

## Modern Mode

With Babel we are able to leverage all the newest language features in ES2015+, but that also means we have to ship transpiled and polyfilled bundles in order to support older browsers. These transpiled bundles are often more verbose than the original native ES2015+ code, and also parse and run slower. Given that today a good majority of the modern browsers have decent support for native ES2015, it is a waste that we have to ship heavier and less efficient code to those browsers just because we have to support older ones.

Vue CLI offers a "Modern Mode" to help you solve this problem. When building for production with the following command:

```bash
vue-cli-service build --modern
```

Vue CLI will produce two versions of your app: one modern bundle targeting modern browsers that support [ES modules](https://jakearchibald.com/2017/es-modules-in-browsers/), and one legacy bundle targeting older browsers that do not.

The cool part though is that there are no special deployment requirements. The generated HTML file automatically employs the techniques discussed in [Phillip Walton's excellent post](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/):

- The modern bundle is loaded with `<script type="module">`, in browsers that support it; they are also preloaded using `<link rel="modulepreload">` instead.

- The legacy bundle is loaded with `<script nomodule>`, which is ignored by browsers that support ES modules.

- A fix for `<script nomodule>` in Safari 10 is also automatically injected.

For a Hello World app, the modern bundle is already 16% smaller. In production, the modern bundle will typically result in significantly faster parsing and evaluation, improving your app's loading performance.

::: tip
`<script type="module">` is loaded [with CORS always enabled](https://jakearchibald.com/2017/es-modules-in-browsers/#always-cors). This means your server must return valid CORS headers such as `Access-Control-Allow-Origin: *`. If you want to fetch the scripts with credentials, set the [crossorigin](../config/#crossorigin) option to `use-credentials`.

::: tip Detecting the Current Mode in Config
Sometimes you may need to change the webpack config only for the legacy build, or only for the modern build.

Vue CLI uses two environment variables to communicate this:

* `VUE_CLI_MODERN_MODE`: The build was started with the `--modern` flag
* `VUE_CLI_MODERN_BUILD`: when true, the current config is for the modern build. Otherwise it's for the legacy build.

**Important:** These variables are only accessible when/after `chainWebpack()` and `configureWebpack()` functions are evaluated, (so not directly in the `vue.config.js` module's root scope). That means it's also available in the postcss config file.
:::

::: warning Caveat: Adjusting webpack plugins
Some Plugins, i.e. `html-webpack-plugin`, `preload-plugin` etc. are only included in the config for modern mode. Trying to tap into their options in the legacy config can throw an error as the plugins don't exist.

Use the above tip about *Detecting the Current Mode* to manipulate plugins in the right mode only, and/or check if the plugin actually exists in the current mode's config before trying to tap into their options.
:::

[autoprefixer]: https://github.com/postcss/autoprefixer
[babel-preset-env]: https://new.babeljs.io/docs/en/next/babel-preset-env.html
[babel-preset-app]: https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app
[browserslist]: https://github.com/ai/browserslist
