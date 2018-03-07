# @vue/babel-preset-app

This is the default Babel preset used in all Vue CLI projects.

## Included

- [babel-preset-env](https://github.com/babel/babel/tree/master/packages/babel-preset-env)
  - `modules: false`
    - auto set to `'commonjs'` in Jest tests
  - [`useBuiltIns: 'usage'`](https://github.com/babel/babel/tree/master/packages/babel-preset-env#usebuiltins-usage)
    - ensures polyfills are imported on-demand
  - `targets` is determined:
    - using `browserslist` field in `package.json` when building for browsers
    - set to `{ node: 'current' }` when running unit tests in Node.js
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

- **modules**

  Default:
  - `false` when building with webpack
  - `'commonjs'` when running tests in Jest.

  Explicitly set `modules` option for `babel-preset-env`. See [babel-preset-env docs](https://github.com/babel/babel/tree/master/packages/babel-preset-env#modules) for more details.

- **targets**

  Default:
  - determined from `browserslist` field in `package.json` when building for browsers
  - set to `{ node: 'current' }` when running unit tests in Node.js

  Explicitly set `targets` option for `babel-preset-env`. See [babel-preset-env docs](https://github.com/babel/babel/tree/master/packages/babel-preset-env#targets) for more details.

- **useBuiltIns**

  Default: `'usage'`

  Explicitly set `useBuiltIns` option for `babel-preset-env`. See [babel-preset-env docs](https://github.com/babel/babel/tree/master/packages/babel-preset-env#usebuiltins) for more details.

- **jsx**

  Default: `true`. Set to `false` to disable JSX support.
