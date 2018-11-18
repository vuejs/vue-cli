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
You can add new command to the list of project npm scripts inside the `package.json` file [via Generator](#extending-package).
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

### Modifying existing cli-service command

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

In the example above we retrieve the `serve` command from the list of existing commands; then we modify its `fn` part (`fn` is the third parameter passed when you create a new command; it specifies the function to run when running the command). With the modification done the console message will be printed after `serve` command has run successfully.

### Specifying Mode for Commands

If a plugin-registered command needs to run in a specific default mode, the plugin needs to expose it via `module.exports.defaultModes` in the form of `{ [commandName]: mode }`:

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

## Generator

A CLI plugin published as a package can contain a `generator.js` or `generator/index.js` file. The generator inside a plugin will be invoked in two possible scenarios:

- During a project's initial creation, if the CLI plugin is installed as part of the project creation preset.

- When the plugin is installed after project's creation and invoked individually via `vue invoke`.

The [GeneratorAPI](generator-api.md) allows a generator to inject additional dependencies or fields into `package.json` and add files to the project.

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

For a 3rd party plugin, the options will be resolved from the prompts or command line arguments when the user executes `vue invoke` (see [Prompts for 3rd party plugins](#prompts-for-3rd-party-plugins)).

3. The entire preset (`presets.foo`) will be passed as the third argument.

### Extending package

If you need to add an additional dependency to the project, create a new npm script or modify `package.json` somehow else, you can use API `extendPackage` method:

```js
// generator/index.js

module.exports = api => {
  api.extendPackage({
    dependencies: {
      'vue-router-layout': '^0.1.2'
    },
    devDependencies: {
      'vue-auto-routing': '^0.3.0'
    },
    scripts: {
      greet: 'vue-cli-service greet'
    }
  });
```

In the example above we added one dependency, one dev dependency and the `greet` npm script to execute a [new vue-cli service command](#add-a-new-cli-service-command)

### Changing main file

With generator `onCreateComplete` hook you can make changes to the project files. The most usual case is some modifications to `main.js` or `main.ts` file: new imports, new `Vue.use()` calls etc. To do so, let's first create a new content string you plan to add:

```js
const newLines = `\nimport VueRx from 'vue-rx';\n\nVue.use(VueRx);`;
```

Then in `onCreateComplete` hook you need to define if you have `main.js` or `main.ts` file (the latter is the case for projects using TypeScript):

```js
module.exports = (api, options, rootOptions) => {
  const rxLines = `\nimport VueRx from 'vue-rx';\n\nVue.use(VueRx);`;

  api.onCreateComplete(() => {

    // checking if project uses TypeScript
    const fs = require('fs');
    const ext = api.hasPlugin('typescript') ? 'ts' : 'js';
    const mainPath = api.resolve(`./src/main.${ext}`);
  });
};
```

Then you need to read file content with Node `fs` module (which provides an API for interacting with the file system) and split this content on lines:

```js
  let contentMain = fs.readFileSync(mainPath, { encoding: 'utf-8' });
  const lines = contentMain.split(/\r?\n/g).reverse();
```

:::tip
We need `reverse` because in the next step we will look for the last line of imports and it's easy to find if we reverse the lines order and then check for the first import occurrence
:::

Now you need to find the last import (first one with the reverted lines) and add our `newLines` to it

```js
  const lastImportIndex = lines.findIndex(line => line.match(/^import/));
  lines[lastImportIndex] += newLines;
```

Finally, you need to reverse lines order back, join them and write the content to the main file:

```js
  contentMain = lines.reverse().join('\n');
  fs.writeFileSync(mainPath, contentMain, { encoding: 'utf-8' });
```

### Templating

When you call `api.render('./template')`, the generator will render files in `./template` (resolved relative to the generator file) with [EJS](https://github.com/mde/ejs).

Let's imagine we're creating [vue-cli-auto-routing](https://github.com/ktsn/vue-cli-plugin-auto-routing) plugin and we want to make the following changes to the project on plugin invoke:

- create a `layouts` folder with a default layout file;
- create a `pages` folder with `about` and `home` pages;
- add a `router.js` to the `src` folder root

To render this structure, you need to create it first inside the `generator/template` folder:

![Generator structure](/generator-template.png)

After template is created, you should add `api.render` call to the `generator/index.js` file:

```js
api.render('./template')
```

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

### Filename edge cases

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

## Prompts

Prompts are required to handle user choices when creating a new project or adding a new plugin to the existing one. All prompts logic is stored inside the `prompts.js` file. The prompts are presented using [inquirer](https://github.com/SBoudrias/Inquirer.js) under the hood

### Prompts for Built-in Plugins

Only built-in plugins have the ability to customize the initial prompts when creating a new project, and the prompt modules are located [inside the `@vue/cli` package][prompt-modules].

A prompt module should export a function that receives a [PromptModuleAPI][prompt-api] instance.

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

### Prompts for 3rd Party Plugins

When user initialize the plugin by calling `vue invoke`, if the plugin contains a `prompts.js` in its root directory, it will be used during invocation. The file should export an array of [Questions](https://github.com/SBoudrias/Inquirer.js#question) that will be handled by Inquirer.js. The resolved answers object will be passed to the plugin's generator as options.

Alternatively, the user can skip the prompts and directly initialize the plugin by passing options via the command line, e.g.:

``` bash
vue invoke my-plugin --mode awesome
```

Prompt can have [different types](https://github.com/SBoudrias/Inquirer.js#prompt-types) but the most widely used in CLI are `checkbox` and `confirm`. Let's add a `confirm` prompt and then use it in plugin generator to create a condition for [template rendering](#templating).

```js
// prompts.js

module.exports = [
  {
    name: `addExampleRoutes`,
    type: 'confirm',
    message: 'Add example routes?',
    default: false,
  }
]
```

On plugin invoke user will be prompted with the question about example routes and the default answer will be `No`

![Prompts example](/prompts-example.png)

If you want to use the result of the user's choice in generator, it will be accessible with the prompt name. We can add a modification to `generator/index.js`:

```js
module.exports = (api, options) => {
  if (options.addExample) {
    api.render('./template');
  }
}
```

Now template will be rendered only if user agreed to create example routes.




