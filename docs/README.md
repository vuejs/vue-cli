## Table of Contents

- [Introduction](#introduction)
- [CLI](#cli)
- [CLI Service](#cli-service)
- [Configuration](#configuration)
  - [webpack](#webpack)
  - [browserslist](#browserslist)
  - [Babel](#babel)
  - [CSS](#css)
  - [ESLint](#eslint)
  - [TypeScript](#typescript)
  - [Unit Testing](#unit-testing)
  - [E2E Testing](#e2e-testing)
- [Environment Variables and Modes](#environment-variables-and-modes)
- [Development](#development)

## Introduction

Vue CLI is a full system for rapid Vue.js development, providing:

- Interactive project scaffolding via `@vue/cli`.
- Zero config rapid prototyping via `@vue/cli` + `@vue/cli-service-global`.
- A runtime dependency (`@vue/cli-service`) that is:
  - Upgradeable;
  - Built on top of webpack, with sensible defaults;
  - Configurable via in-project config file;
  - Extensible via plugins
- A rich collection of official plugins integrating the best tools in the frontend ecosystem.

Vue CLI aims to be the standard tooling baseline for the Vue ecosystem. It ensures the various build tools work smoothly together with sensible defaults so you can focus on writing your app instead of spending days wrangling with configurations. At the same time, it still offers the flexibility to tweak the config of each tool without the need for ejecting.

## CLI

The CLI is installed globally and provides the `vue` command in your terminal:

``` sh
npm install -g @vue/cli
vue create my-project
```

For full details on what the `vue` command can do, see the [full CLI docs](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli/README.md).

## CLI Service

`@vue/cli-service` is a dependency installed locally into every project created by `@vue/cli`. It contains the core service that loads other plugins, resolves the final webpack config, and provides the `vue-cli-service` binary to your project. The binary exposes commands such as `vue-cli-service serve`, which can be used in npm scripts. If you are familiar with [create-react-app](https://github.com/facebookincubator/create-react-app), `@vue/cli-service` is essentially the equivalent of `react-scripts`, but more flexible.

## Configuration

Projects created from `vue create` are ready to go out-of-the-box. The plugins are designed to work with one another so in most cases, all you need to do is pick the features you want during the interactive prompts.

However, we also understand that it's impossible to cater to every possible need, and the need of a project may also change over time. Projects created by Vue CLI allows you to configure almost every aspect of the tooling without ever needing to eject.

### vue.config.js

Many aspects of a Vue CLI project can be configured by placing a `vue.config.js` file at the root of your project. The file may already exist depending on the features you selected when creating the project.

`vue.config.js` should export an object, for example:

``` js
// vue.config.js
module.exports = {
  lintOnSave: true
}
```

Check [here](./config.md) for full list of possible options.

### webpack

Probably the most common configuration need is tweaking the internal webpack config. Vue CLI provides flexible ways to achieve that without ejecting.

See [here](./webpack.md) for full details.

### browserlist

You will notice a `browserlist` field in `package.json` specifying a range of browsers the project is targeting. This value will be used by `babel-preset-env` and `autoprefixer` to automatically determine the JavaScript polyfills and CSS vendor prefixes needed.

See [here](https://github.com/ai/browserslist) for how to specify browser ranges.

### Babel

Babel can be configured via `.babelrc` or the `babel` field in `package.json`.

All Vue CLI apps use `@vue/babel-preset-app` by default, which includes:

- [babel-preset-env](https://github.com/babel/babel/tree/master/packages/babel-preset-env)
- [dynamic import syntax](https://github.com/tc39/proposal-dynamic-import)
- [Object rest spread](https://github.com/tc39/proposal-object-rest-spread)
- [babel-preset-stage-2](https://github.com/babel/babel/tree/master/packages/babel-preset-stage-2)
- Vue JSX support

See [@vue/babel-preset-app](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app) for preset options.

### CSS

Vue CLI projects comes with support for [PostCSS](http://postcss.org/), [CSS Modules](https://github.com/css-modules/css-modules) and pre-processors including [Sass](https://sass-lang.com/), [Less](http://lesscss.org/) and [Stylus](http://stylus-lang.com/).

See [here](./css.md) for more details on CSS related configurations.

### ESLint

ESLint can be configured via `.eslintrc` or `eslintConfig` field in `package.json`.

See [@vue/cli-plugin-eslint](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint) for more details.

### TypeScript

TypeScript can be configured via `tsconfig.json`.

See [@vue/cli-plugin-typescript](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript) for more details.

### Unit Testing

- #### Jest

  See [@vue/cli-plugin-unit-jest](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest) for more details.

- #### Mocha (via `mocha-webpack`)

  See [@vue/cli-plugin-unit-mocha](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-mocha) for more details.

### E2E Testing

- #### Cypress

  See [@vue/cli-plugin-e2e-cypress](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-cypress) for more details.

- #### Nightwatch

  See [@vue/cli-plugin-e2e-nightwatch](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch) for more details.

## Environment Variables and Modes

It is a common need to customize the app's behavior based on the target environment - for example, you may want the app to use different API endpoints or credentials during development / staging / production environments.

Vue CLI has comprehensive support for specifying different environment variables - see the [dedicated section](./env.md) for more details.

## Development

- [Contributing Guide](https://github.com/vuejs/vue-cli/blob/dev/.github/CONTRIBUTING.md)
- [Plugin Development Guide](https://github.com/vuejs/vue-cli/blob/dev/docs/plugin.md).
