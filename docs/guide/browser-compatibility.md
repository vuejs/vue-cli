# Browser Compatibility

## browserslist

You will notice a `browserslist` field in `package.json` specifying a range of browsers the project is targeting. This value will be used by [@babel/preset-env][babel-preset-env] and [autoprefixer][autoprefixer] to automatically determine the JavaScript features that need to be transpiled and the CSS vendor prefixes needed.

See [here][browserslist] for how to specify browser ranges.

## Polyfills

A default Vue CLI project uses [@vue/babel-preset-app][babel-preset-env], which uses `@babel/preset-env` and the `browserslist` config to determine the Polyfills needed for your project.

By default, it passes [`useBuiltIns: 'usage'`](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) to `@babel/preset-env` which automatically detects the polyfills needed based on the language features used in your source code. This ensures only the minimum amount of polyfills are included in your final bundle. However, this also means **if one of your dependencies has specific requirements on polyfills, by default Babel won't be able to detect it.**

If one of your dependencies need polyfills, you have a few options:

1. **If the dependency is written in an ES version that your target environments do not support:** Add that dependency to the [`transpileDependencies`](../config/#transpiledependencies) option in `vue.config.js`. This would enable both syntax transforms and usage-based polyfill detection for that dependency.

2. **If the dependency ships ES5 code and explicitly lists the polyfills needed:** you can pre-include the needed polyfills using the [polyfills](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app#polyfills) option for `@vue/babel-preset-app`. **Note that `es6.promise` is included by default because it's very common for libs to depend on Promises.**

    ``` js
    // babel.config.js
    module.exports = {
      presets: [
        ['@vue/app', {
          polyfills: [
            'es6.promise',
            'es6.symbol'
          ]
        }]
      ]
    }
    ```

    ::: tip
    It's recommended to add polyfills this way instead of directly importing them in your source code, because polyfills listed here can be automatically excluded if your `browserslist` targets don't need them.
    :::

3. **If the dependency ships ES5 code, but uses ES6+ features without explicitly listing polyfill requirements (e.g. Vuetify):** Use `useBuiltIns: 'entry'` and then add `import '@babel/polyfill'` to your entry file. This will import **ALL** polyfills based on your `browserslist` targets so that you don't need to worry about dependency polyfills anymore, but will likely increase your final bundle size with some unused polyfills.

See [@babel-preset/env docs](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) for more details.

## Modern Mode

> TODO

[autoprefixer]: https://github.com/postcss/autoprefixer
[babel-preset-env]: https://new.babeljs.io/docs/en/next/babel-preset-env.html
[browserslist]: https://github.com/ai/browserslist
