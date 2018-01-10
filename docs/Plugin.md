# Plugin Development Guide

#### Important Development Note

A plugin with a generator that injects additional dependencies other than packages in this repo (e.g. `chai` is conditionally injected by `@vue/cli-plugin-unit-mocha-webpack/generator/index.js`) should have those dependencies listed in its own `devDependencies` field. This ensures that:

1. the package always exist in this repo's root `node_modules` so that we don't have to reinstall them on every test.

2. `yarn.lock` stays consistent so that CI can better use it for inferring caching behavior.

## Core Concepts

There are two major parts of the system:

- `@vue/cli`: globally installed, exposes the `vue create <app>` command;
- `@vue/cli-service`: locally installed, exposes the `vue-cli-service` commands.

Both utilize a plugin-based architecture.

### Creator

[Creator][creator-class] is the class created when invoking `vue create <app>`. Responsible for prompting for preferences, invoking generators and installing dependencies.

### Service

[Service][service-class] is the class created when invoking `vue-cli-service <command> [...args]`. Responsible for managing the internal webpack configuration, and exposes commands for serving and building the project.

### Plugin

Plugins are locally installed into the project as dependencies. `@vue/cli-service`'s [built-in commands][commands] and [config modules][config] are also all implemented as plugins. This repo also contains a number of plugins that are published as individual packages.

A plugin should export a function which receives two arguments:

- A [PluginAPI][plugin-api] instance

- Project local options specified in `vue.config.js`, or in the `"vue-cli"` field in `package.json`.

The API allows plugins to extend/modify the internal webpack config for different environments and inject additional commands to `vue-cli-service`. Example:

``` js
module.exports = (api, projectOptions) => {
  api.chainWebpack(webpackConfig => {
    // modify webpack config with webpack-chain
  })

  api.configureWepback(webpackConfig => {
    // modify webpack config
    // or return object to be merged with webpack-merge
  })

  api.regsiterCommand('test', args => {
    // register `vue-cli-service test`
  })
}
```

### Generator

A plugin published as a package can also contain a `generator.js` or `generator/index.js` file. The generator inside a plugin will be invoked after the plugin is installed.

The [GeneratorAPI][generator-api] allows a generator to inject additional dependencies or fields into `package.json` and add files to the project.

A generator should export a function which receives three arguments:

1. A `GeneratorAPI` instance;

2. The generator options for this plugin. These options are resolved during the prompt phase of project creation, or loaded from a saved `~/.vuerc`. For example, if the saved `~/.vuerc` looks like this:

    ``` json
    {
      "plugins": {
        "@vue/cli-plugin-foo": { "option": "bar" }
      }
    }
    ```

    Then the plugin `@vue/cli-plugin-foo` will receive `{ option: 'bar' }` as its second argument.

3. The entire `.vuerc` object will be passed as the third argument.

**Example:**

``` js
module.exports = (api, options, rootOptions) => {
  // modify package.json fields
  api.extendPackage({
    scripts: {
      test: 'vue-cli-service test'
    }
  })

  // copy and render all files in ./template with ejs
  api.render('./template')

  if (options.foo) {
    // conditionally generate files
  }
}
```

### Prompt Modules

Currently, only built-in plugins have the ability to customize the prompts when creating a new project, and the prompt modules are located [inside the `@vue/cli` package][prompt-modules].

A prompt module should export a function that recieves a [PromptModuleAPI][prompt-api] instance. The prompts uses [inquirer](https://github.com/SBoudrias/Inquirer.js) under the hood:

``` js
module.exports = api => {
  // a feature object should be a valid inquirer choice object
  cli.injectFeature({
    name: 'Some great feature',
    value: 'my-feature'
  })

  // injectPrompt expects a valid inquirer prompt object
  cli.injectPrompt({
    name: 'someFlag',
    // make sure your prompt only shows up if user has picked your feature
    when: answers => answers.features.include('my-feature'),
    message: 'Do you want to turn on flag foo?',
    type: 'confirm'
  })

  // when all prompts are done, inject your plugin into the options that
  // will be passed on to Generators
  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('my-feature')) {
      options.plugins['vue-cli-plugin-my-feature'] = {
        someFlag: answers.someFlag
      }
    }
  })
}
```

[creator-class]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli/lib/Creator.js
[service-class]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/Service.js
[generator-api]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli/lib/GeneratorAPI.js
[commands]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/commands
[config]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/config
[plugin-api]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/PluginAPI.js
[prompt-modules]: https://github.com/vuejs/vue-cli/tree/next/packages/%40vue/cli/lib/promptModules
