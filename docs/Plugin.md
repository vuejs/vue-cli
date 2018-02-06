# Plugin Development Guide

## Core Concepts

- [Creator](#creator)
- [Service](#service)
- [CLI Plugin](#cli-plugin)
- [Service Plugin](#service-plugin)
- [Generator](#generator)
- [Prompts](#prompts)

There are two major parts of the system:

- `@vue/cli`: globally installed, exposes the `vue create <app>` command;
- `@vue/cli-service`: locally installed, exposes the `vue-cli-service` commands.

Both utilize a plugin-based architecture.

### Creator

[Creator][creator-class] is the class created when invoking `vue create <app>`. Responsible for prompting for preferences, invoking generators and installing dependencies.

### Service

[Service][service-class] is the class created when invoking `vue-cli-service <command> [...args]`. Responsible for managing the internal webpack configuration, and exposes commands for serving and building the project.

### CLI Plugin

A CLI plugin is an npm package that can add additional features to a `@vue/cli` project. It should always contain a [Service Plugin](#service-plugin) as its main export, and can optionally contain a [Generator](#generator) and a [Prompt File](#prompts-for-3rd-party-plugins).

A typical CLI plugin's folder structure looks like the following:

```
.
├── README.md
├── generator.js  # generator (optional)
├── prompts.js    # prompts file (optional)
├── index.js      # service plugin
└── package.json
```

### Service Plugin

Service plugins are loaded automatically when a Service instance is created - i.e. every time the `vue-cli-service` command is invoked inside a project.

Note the concept of a "service plugin" we are discussing here is narrower than that of a "CLI plugin", which is published as an npm package. The former only refers to a module that will be loaded by `@vue/cli-service` when it's initialized, and is usually a part of the latter.

In addition, `@vue/cli-service`'s [built-in commands][commands] and [config modules][config] are also all implemented as service plugins.

A service plugin should export a function which receives two arguments:

- A [PluginAPI][plugin-api] instance

- An object containing project local options specified in `vue.config.js`, or in the `"vue-cli"` field in `package.json`.

The API allows service plugins to extend/modify the internal webpack config for different environments and inject additional commands to `vue-cli-service`. Example:

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

#### Environment Variables in Service Plugins

An important thing to note about env variables is knowing when they are resolved. Typically, a command like `vue-cli-service serve` or `vue-cli-service build` will always call `api.setMode()` as the first thing it does. However, this also means those env variables may not yet be available when a service plugin is invoked:

``` js
module.exports = api => {
  process.env.NODE_ENV // may not be resolved yet

  api.regsiterCommand('build', () => {
    api.setMode('production')
  })
}
```

Instead, it's safer to rely on env variables in `configureWebpack` or `chainWebpack` functions, which are called lazily only when `api.resolveWebpackConfig()` is finally called:

``` js
module.exports = api => {
  api.configureWebpack(config => {
    if (process.env.NODE_ENV === 'production') {
      // ...
    }
  })
}
```

#### Custom Options for 3rd Party Plugins

The exports from `vue.config.js` will be [validated against a schema](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/options.js#L3) to avoid typos and wrong config values. However, a 3rd party plugin can still allow the user to configure its behavior via the `pluginOptions` field. For example, with the following `vue.config.js`:

``` js
module.exports = {
  pluginOptions: {
    foo: { /* ... */ }
  }
}
```

The 3rd party plugin can read `projectOptions.pluginOptions.foo` to determine conditional configurations.

### Generator

A CLI plugin published as a package can contain a `generator.js` or `generator/index.js` file. The generator inside a plugin will be invoked in two possible scenarios:

- During a project's initial creation, if the CLI plugin is installed as part of the project creation preset.

- When the plugin is installed after project's creation and invoked individually via `vue invoke`.

The [GeneratorAPI][generator-api] allows a generator to inject additional dependencies or fields into `package.json` and add files to the project.

A generator should export a function which receives three arguments:

1. A `GeneratorAPI` instance;

2. The generator options for this plugin. These options are resolved during the prompt phase of project creation, or loaded from a saved preset in `~/.vuerc`. For example, if the saved `~/.vuerc` looks like this:

    ``` json
    {
      "presets" : {
        "foo": {
          "plugins": {
            "@vue/cli-plugin-foo": { "option": "bar" }
          }
        }
      }
    }
    ```

    And if the user creates a project using the `foo` preset, then the generator of `@vue/cli-plugin-foo` will receive `{ option: 'bar' }` as its second argument.

    For a 3rd party plugin, the options will be resolved from the prompts or command line arguments when the user executes `vue invoke` (see [Prompts for 3rd Party Plugins](#prompts-for-3rd-party-plugins)).

3. The entire preset (`presets.foo`) will be passed as the third argument.

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

### Prompts

#### Prompts for Built-in Plugins

Only built-in plugins have the ability to customize the initial prompts when creating a new project, and the prompt modules are located [inside the `@vue/cli` package][prompt-modules].

A prompt module should export a function that receives a [PromptModuleAPI][prompt-api] instance. The prompts are presented using [inquirer](https://github.com/SBoudrias/Inquirer.js) under the hood:

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

#### Prompts for 3rd Party Plugins

3rd party plugins are typically installed manually after a project is already created, and the user will initialize the plugin by calling `vue invoke`. If the plugin contains a `prompt.js` in its root directory, it will be used during invocation. The file should export an array of [Questions](https://github.com/SBoudrias/Inquirer.js#question) that will be handled by Inquirer.js. The resolved answers object will be passed to the plugin's generator as options.

Alternatively, the user can skip the prompts and directly initialize the plugin by passing options via the command line, e.g.:

``` sh
vue invoke my-plugin --mode awesome
```

## Note on Development of Core Plugins

> This section only applies if you are working on a built-in plugin inside this very repository.

A plugin with a generator that injects additional dependencies other than packages in this repo (e.g. `chai` is injected by `@vue/cli-plugin-unit-mocha/generator/index.js`) should have those dependencies listed in its own `devDependencies` field. This ensures that:

1. the package always exist in this repo's root `node_modules` so that we don't have to reinstall them on every test.

2. `yarn.lock` stays consistent so that CI can better use it for inferring caching behavior.

[creator-class]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/Creator.js
[service-class]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/Service.js
[generator-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/GeneratorAPI.js
[commands]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/commands
[config]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/config
[plugin-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/PluginAPI.js
[prompt-modules]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/promptModules
[prompt-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/PromptModuleAPI.js
