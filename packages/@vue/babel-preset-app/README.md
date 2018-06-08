# @vue/babel-preset-app

This is the default Babel preset used in all Vue CLI projects.

## Included

- [@babel/preset-env](https://new.babeljs.io/docs/en/next/babel-preset-env.html)
  - `modules: false`
    - auto set to `'commonjs'` in Jest tests
  - [`useBuiltIns: 'usage'`](#usebuiltins)
  - `targets` is determined:
    - using `browserslist` field in `package.json` when building for browsers
    - set to `{ node: 'current' }` when running unit tests in Node.js
- Includes `Promise` polyfill by default so that they are usable even in non-transpiled dependencies (only for environments that need it)
- [@babel/plugin-transform-runtime](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-runtime)
  - Only enabled for helpers since polyfills are handled by `babel-preset-env`
- [dynamic import syntax](https://github.com/tc39/proposal-dynamic-import)
- [Object rest spread](https://github.com/tc39/proposal-object-rest-spread)
- [babel-preset-stage-2](https://github.com/babel/babel/tree/master/packages/babel-preset-stage-2)
- Vue JSX support
  - [@babel/plugin-syntax-jsx](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-jsx)
  - [babel-plugin-transform-vue-jsx](https://github.com/vuejs/babel-plugin-transform-vue-jsx)
  - ~~[babel-plugin-jsx-event-modifiers](https://github.com/nickmessing/babel-plugin-jsx-event-modifiers)~~ (temporarily disabled until fixed for Babel 7)
  - ~~[babel-plugin-jsx-v-model](https://github.com/nickmessing/babel-plugin-jsx-v-model)~~ (temporarily disabled until fixed for Babel 7)

## Options

### modules

- Default:
  - `false` when building with webpack
  - `'commonjs'` when running tests in Jest.

Explicitly set `modules` option for `babel-preset-env`. See [babel-preset-env docs](https://github.com/babel/babel/tree/master/packages/babel-preset-env#modules) for more details.

### targets

- Default:
  - determined from `browserslist` field in `package.json` when building for browsers
  - set to `{ node: 'current' }` when running unit tests in Node.js

Explicitly set `targets` option for `babel-preset-env`. See [babel-preset-env docs](https://github.com/babel/babel/tree/master/packages/babel-preset-env#targets) for more details.

### useBuiltIns

- Default: `'usage'`
- Allowed values: `'usage' | 'entry' | false`

Explicitly set `useBuiltIns` option for `babel-preset-env`.

The default value is `'usage'`, which adds imports to polyfills based on the usage in transpiled code. For example, if you use `Object.assign` in your code, the corresponding polyfill will be auto-imported if your target environment does not supports it.

Note that the usage detection does not apply to your dependencies (which are excluded by `cli-plugin-babel` by default). If one of your dependencies need polyfills, you have a few options:

1. **If the dependency is written in an ES version that your target environments do not support:** Add that dependency to the `transpileDependencies` option in `vue.config.js`. This would enable both syntax transforms and usage-based polyfill detection for that dependency.

2. **If the dependency ships ES5 code and explicitly lists the polyfills needed:** you can pre-include the needed polyfills using the [polyfills](#polyfills) option for this preset.

3. **If the dependency ships ES5 code, but uses ES6+ features without explicitly listing polyfill requirements (e.g. Vuetify):** Use `useBuiltIns: 'entry'` and then add `import '@babel/polyfill'` to your entry file. This will import **ALL** polyfills based on your `browserslist` targets so that you don't need to worry about dependency polyfills anymore, but will likely increase your final bundle size with some unused polyfills.

See [@babel/preset-env docs](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) for more details.

### polyfills

- Default: `['es6.promise']`

A list of [core-js](https://github.com/zloirock/core-js) polyfills to pre-include when using `useBuiltIns: 'usage'`. **These polyfills are automatically excluded if they are not needed for your target environments**.

Use this option when you have 3rd party dependencies that are not processed by Babel but have specific polyfill requirements (e.g. Axios and Vuex require Promise support).

### jsx

- Default: `true`.

Set to `false` to disable JSX support.

### loose

- Default: `false`.

Setting this to `true` will generate code that is more performant but less spec-compliant.
