# vue-cli [![Build Status](https://circleci.com/gh/vuejs/vue-cli/tree/dev.svg?style=shield)](https://circleci.com/gh/vuejs/vue-cli/tree/dev) [![Windows Build status](https://ci.appveyor.com/api/projects/status/487fqt71e4kf46iv/branch/dev?svg=true)](https://ci.appveyor.com/project/yyx990803/vue-cli-6b0a6/branch/dev)

> This is the branch for `@vue/cli` 3.0.

**Status: alpha**

## Install

``` sh
npm install -g @vue/cli
# or
yarn global add @vue/cli
```

## Usage

### Creating a New Project

``` sh
vue create my-project
```

### Zero-config Prototyping

You can rapidly prototype with just a single `*.vue` file with the `vue serve` and `vue build` commands, but they require an additional global addon to be installed:

``` sh
yarn global add @vue/cli-service-global
echo '<template><h1>Hello!</h1></template>' > App.vue
vue serve
```

`vue serve` uses the same default setup (webpack, babel, postcss & eslint) as projects created by `vue create`. It automatically infers the entry file in the current directory - the entry can be one of `main.js`, `index.js`, `App.vue` or `app.vue`. If needed, you can also provide an `index.html`, install and use local dependencies, or even configure babel, postcss & eslint with corresponding config files.

The drawback of `vue serve` is that it relies on globally installed dependencies which may be inconsistent on different machines. Therefore this is only recommended for rapid prototyping.

### Installing Plugins in an Existing Project

Each CLI plugin ships with a generator (which creates files) and a runtime plugin (which tweaks the core webpack config and injects commands). When you use `vue create` to create a new project, some plugins will be pre-installed for you based on your feature selection. In case you want to install a plugin into an already created project, simply install it first:

``` sh
yarn add @vue/cli-plugin-eslint
```

Then you can invoke the plugin's generator so it generates files into your project:

``` sh
vue invoke eslint # the prefix can be omitted
```

It is recommended to commit your project's current state before running `vue invoke`, so that after file generation you can review the changes and revert if needed.

### Pulling `vue-cli@2.x` Templates (Legacy)

`@vue/cli` uses the same `vue` binary, so it overwrites `vue-cli@2.x`. If you still need the legacy `vue init` functionality, you can install a global bridge:

``` sh
yarn global add @vue/cli-init
# vue init now works exactly the same as vue-cli@2.x
vue init webpack my-project
```

### Customization and Plugin Usage

For a detailed guide on how to customize a project, recipes for common tasks, detailed usage for each plugin, please see the [full documentation](https://github.com/vuejs/vue-cli/blob/dev/docs/README.md).

## Contributing

Please see [contributing guide](https://github.com/vuejs/vue-cli/blob/dev/.github/CONTRIBUTING.md).

## License

MIT
