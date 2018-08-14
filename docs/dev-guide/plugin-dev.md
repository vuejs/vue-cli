---
sidebarDepth: 3
---

# Plugin Development Guide

## Core Concepts

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

- An object containing project local options specified in `vue.config.js`, or in the `"vue"` field in `package.json`.

The API allows service plugins to extend/modify the internal webpack config for different environments and inject additional commands to `vue-cli-service`. Example:

``` js
module.exports = (api, projectOptions) => {
  api.chainWebpack(webpackConfig => {
    // modify webpack config with webpack-chain
  })

  api.configureWebpack(webpackConfig => {
    // modify webpack config
    // or return object to be merged with webpack-merge
  })

  api.registerCommand('test', args => {
    // register `vue-cli-service test`
  })
}
```

#### Specifying Mode for Commands

> Note: the way plugins set modes has been changed in beta.10.

If a plugin-registered command needs to run in a specific default mode,
the plugin needs to expose it via `module.exports.defaultModes` in the form
of `{ [commandName]: mode }`:

``` js
module.exports = api => {
  api.registerCommand('build', () => {
    // ...
  })
}

module.exports.defaultModes = {
  build: 'production'
}
```

This is because the command's expected mode needs to be known before loading environment variables, which in turn needs to happen before loading user options / applying the plugins.

#### Resolving Webpack Config in Plugins

A plugin can retrieve the resolved webpack config by calling `api.resolveWebpackConfig()`. Every call generates a fresh webpack config which can be further mutated as needed:

``` js
module.exports = api => {
  api.registerCommand('my-build', args => {
    const configA = api.resolveWebpackConfig()
    const configB = api.resolveWebpackConfig()

    // mutate configA and configB for different purposes...
  })
}

// make sure to specify the default mode for correct env variables
module.exports.defaultModes = {
  'my-build': 'production'
}
```

Alternatively, a plugin can also obtain a fresh [chainable config](https://github.com/mozilla-neutrino/webpack-chain) by calling `api.resolveChainableWebpackConfig()`:

``` js
api.registerCommand('my-build', args => {
  const configA = api.resolveChainableWebpackConfig()
  const configB = api.resolveChainableWebpackConfig()

  // chain-modify configA and configB for different purposes...

  const finalConfigA = configA.toConfig()
  const finalConfigB = configB.toConfig()
})
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

#### Generator Templating

When you call `api.render('./template')`, the generator will render files in `./template` (resolved relative to the generator file) with [EJS](https://github.com/mde/ejs).

In addition, you can inherit and replace parts of an existing template file (even from another package) using YAML front-matter:

``` ejs
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace: !!js/regexp /<script>[^]*?<\/script>/
---

<script>
export default {
  // Replace default script
}
</script>
```

It's also possible to do multiple replaces, although you will need to wrap your replace strings within `<%# REPLACE %>` and `<%# END_REPLACE %>` blocks:

``` ejs
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace:
  - !!js/regexp /Welcome to Your Vue\.js App/
  - !!js/regexp /<script>[^]*?<\/script>/
---

<%# REPLACE %>
Replace Welcome Message
<%# END_REPLACE %>

<%# REPLACE %>
<script>
export default {
  // Replace default script
}
</script>
<%# END_REPLACE %>
```

#### Filename edge cases

If you want to render a template file that either begins with a dot (i.e. `.env`) you will have to follow a specific naming convention, since dotfiles are ignored when publishing your plugin to npm:
```
# dotfile templates have to use an underscore instead of the dot:

/generator/template/_env

# When calling api.render('./template'), this will be rendered in the project folder as:

.env
```
Consequently, this means that you also have to follow a special naming convention if you want to render file whose name actually begins with an underscore:
```
# such templates have to use two underscores instead of the dot:

/generator/template/__variables.scss

# When calling api.render('./template'), this will be rendered in the project folder as:

_variables.scss
```


### Prompts

#### Prompts for Built-in Plugins

Only built-in plugins have the ability to customize the initial prompts when creating a new project, and the prompt modules are located [inside the `@vue/cli` package][prompt-modules].

A prompt module should export a function that receives a [PromptModuleAPI][prompt-api] instance. The prompts are presented using [inquirer](https://github.com/SBoudrias/Inquirer.js) under the hood:

``` js
module.exports = api => {
  // a feature object should be a valid inquirer choice object
  api.injectFeature({
    name: 'Some great feature',
    value: 'my-feature'
  })

  // injectPrompt expects a valid inquirer prompt object
  api.injectPrompt({
    name: 'someFlag',
    // make sure your prompt only shows up if user has picked your feature
    when: answers => answers.features.include('my-feature'),
    message: 'Do you want to turn on flag foo?',
    type: 'confirm'
  })

  // when all prompts are done, inject your plugin into the options that
  // will be passed on to Generators
  api.onPromptComplete((answers, options) => {
    if (answers.features.includes('my-feature')) {
      options.plugins['vue-cli-plugin-my-feature'] = {
        someFlag: answers.someFlag
      }
    }
  })
}
```

#### Prompts for 3rd Party Plugins

3rd party plugins are typically installed manually after a project is already created, and the user will initialize the plugin by calling `vue invoke`. If the plugin contains a `prompts.js` in its root directory, it will be used during invocation. The file should export an array of [Questions](https://github.com/SBoudrias/Inquirer.js#question) that will be handled by Inquirer.js. The resolved answers object will be passed to the plugin's generator as options.

Alternatively, the user can skip the prompts and directly initialize the plugin by passing options via the command line, e.g.:

``` bash
vue invoke my-plugin --mode awesome
```

## Distributing the Plugin

For a CLI plugin to be usable by other developers, it must be published on npm following the name convention `vue-cli-plugin-<name>`. Following the name convention allows your plugin to be:

- Discoverable by `@vue/cli-service`;
- Discoverable by other developers via searching;
- Installable via `vue add <name>` or `vue invoke <name>`.

## Note on Development of Core Plugins

::: tip Note
This section only applies if you are working on a built-in plugin inside the `vuejs/vue-cli` repository itself.
:::

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
