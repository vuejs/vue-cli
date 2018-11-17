---
sidebarDepth: 3
---

# Plugin Development Guide

## Getting started

A CLI plugin is an npm package that can add additional features to a `@vue/cli` project. It should always contain a [Service Plugin](#service-plugin) as its main export, and can optionally contain a Generator, a Prompt File and a Vue UI integration.

As a npm package, CLI plugin must have a `package.json` file. It's also recommended to have a plugin description in `README.md` to help others find your plugin on npm

So, typical CLI plugin folder structure looks like the following:

```
.
├── README.md
├── generator.js  # generator (optional)
├── index.js      # service plugin
├── package.json
├── prompts.js    # prompts file (optional)
└── ui.js         # Vue UI integration (optional)
```

## Installing plugin locally

In order to check how your CLI plugin works locally, you need to add it to existing project or create a new one just for testing purposes:

```bash
vue create test-app
```

To add the plugin, run the following command in the root folder of the project:

```bash
cd test-app
npm install --save-dev file:/full/path/to/your/plugin
vue invoke <your-plugin-name>
```

You need to repeat these steps every time you make changes to your plugin.

Another way to add a plugin is to leverage the power of Vue UI. You can run it with

```bash
vue ui
```

You will have a UI open in browser window on `localhost:8000`. Go to the `Vue Project Manager` tab:

![Vue Project Manager](/ui-project-manager.png)

And look for your test project name there

![UI Plugins List](/ui-select-plugin.png)

Click on your application name, go to the Plugins tab (it has a puzzle icon) and then click the `Add new plugin` button on the top right. In the new view you will see a list of Vue CLI plugins accessible via npm. There is also a `Browse local plugin` button on the bottom of the page

![Browse local plugins](/ui-browse-local-plugin.png)

After you click it, you can easily search for you plugin and add it to the project. After this you will be able to see it in plugins list and apply all changes done to the plugin via simply clicking on `Refresh` icon

![Refresh plugin](/ui-plugin-refresh.png)


## Service Plugin

Service plugins are loaded automatically when a Service instance is created - i.e. every time the `vue-cli-service` command is invoked inside a project. It's located in the `index.js` file in CLI plugin root folder.

A service plugin should export a function which receives two arguments:

- A [PluginAPI](plugin-api.md) instance

- An object containing project local options specified in `vue.config.js`, or in the `"vue"` field in `package.json`.

The minimal required code in the service plugin file is the following:

```js
module.exports = () => {}
```

### Modifying webpack config

The API allows service plugins to extend/modify the internal webpack config for different environments. For example, here we're modifying webpack config with webpack-chain to include `vue-auto-routing` webpack plugin:

```js
const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin')

module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    webpackConfig
      .plugin('vue-auto-routing')
        .use(VueAutoRoutingPlugin, [
          {
            pages: 'src/pages',
            nested: true
          }
        ])
  })
}
```

You can also use `configureWebpack` method to modify the  webpack config or return object to be merged with webpack-merge.

### Add a new cli-service command

With a service plugin you can register a new cli-service command in addition to standard ones (i.e. `serve` and `build`). You can do it with a `registerCommand` API method.

Here is an example of creating a simple new command that will print a greeting to developer console:

```js
  api.registerCommand(
    'greet',
    {
      description: 'Writes a greeting to the console',
      usage: 'vue-cli-service greet'
    },
    () => {
      console.log(`👋  Hello`)
    }
  )
```

In this example we provided the command name (`'greet`), an object of command options with `description` and `usage`, and a function that will be run on `vue-cli-service greet` command.

:::tip
You can add new command to the list of project npm tasks inside the `package.json` file [via Generator](#adding-new-npm-task).
:::

If you try to run new command in the project with your plugin installed, you will see the folowing output:

```bash
$ vue-cli-service greet
👋 Hello!
```

You can also specify a list of available options for a new command. Let's add the option `--name` and change the function to print this name if it's provided.

```js
  const OPTIONS = {
    '--name': 'specifies a name for greeting'
  };

  api.registerCommand(
    'greet',
    {
      description: 'Writes a greeting to the console',
      usage: 'vue-cli-service greet [options]',
      options: OPTIONS
    },
    args => {
      if (args.name) {
        console.log(`👋 Hello, ${args.name}!`);
      } else {
        console.log(`👋 Hello!`);
      }
    }
  );
```

Now, if you a `greet` command with a specified `--name` option, this name will be added to console message:

```bash
$ vue-cli-service greet --name 'John Doe'
👋 Hello, John Doe!
```

## Modifying existing cli-service command

If you want to modify an existing cli-service command, you can retrieve it with `api.service.commands` and add some changes. We're going to print a message to the console with a port where application is running:

```js
  const { serve } = api.service.commands

  const serveFn = serve.fn

  serve.fn = (...args) => {
    return serveFn(...args).then(res => {
      if (res && res.url) {
        console.log(`Project is running now at ${res.url}`)
      }
    })
  }
```

In the example above we retrieve the `serve` command from the list of existing commands; then we modify its `fn` part (`fn` is the third parameter passed when you create a new command; it specifies the function to run when running the command). With the modification done the console mesage will be printed after `serve` command has run successfully.

## Generator

A CLI plugin published as a package can contain a `generator.js` or `generator/index.js` file. The generator inside a plugin will be invoked in two possible scenarios:

- During a project's initial creation, if the CLI plugin is installed as part of the project creation preset.

- When the plugin is installed after project's creation and invoked individually via `vue invoke`.

The [GeneratorAPI]() allows a generator to inject additional dependencies or fields into `package.json` and add files to the project.

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

    For a 3rd party plugin, the options will be resolved from the prompts or command line arguments when the user executes `vue invoke` (see [Prompts]()).

3. The entire preset (`presets.foo`) will be passed as the third argument.

### Adding new npm task

### Adding dependencies to the project

### Templating

## Prompts

### Prompts for Built-in Plugins

### Prompts for 3rd Party Plugins




