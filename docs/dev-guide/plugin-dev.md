---
sidebarDepth: 3
---

# Plugin Development Guide

## Getting started

A CLI plugin is an npm package that can add additional features to the project using Vue CLI. These features can include:

- changing project webpack config - for example, you can add a new webpack resolve rule for a certain file extension, if your plugin is supposed to work with this type of files. Say, `@vue/cli-plugin-typescript` adds such rule to resolve `.ts` and `.tsx` extensions;
- adding new vue-cli-service command - for example, `@vue/cli-plugin-unit-jest` adds a new command `test:unit` that allows developer to run unit tests;
- extending `package.json` - a useful option when your plugin adds some dependencies to the project and you need to add them to package dependencies section;
- creating new files in the project and/or modifying old ones. Sometimes it's a good idea to create an example component or modify a main file to add some imports;
- prompting user to select certain options - for example, you can ask user if they want to create the example component mentioned above.

:::tip
Don't overuse vue-cli plugins! If you want just to include a certain dependency, e.g. [Lodash](https://lodash.com/) - it's easier to do it manually with npm than create a specific plugin only to do so.
:::

CLI Plugin should always contain a [Service Plugin](#service-plugin) as its main export, and can optionally contain a [Generator](#generator), a [Prompt File](#prompts) and a [Vue UI integration](#ui-integration).

As an npm package, CLI plugin must have a `package.json` file. It's also recommended to have a plugin description in `README.md` to help others find your plugin on npm.

So, typical CLI plugin folder structure looks like the following:

```bash
.
├── README.md
├── generator.js  # generator (optional)
├── index.js      # service plugin
├── package.json
├── prompts.js    # prompts file (optional)
└── ui.js         # Vue UI integration (optional)
```

## Naming and discoverability

For a CLI plugin to be usable in a Vue CLI project, it must follow the name convention `vue-cli-plugin-<name>` or `@scope/vue-cli-plugin-<name>`. It allows your plugin to be:

- Discoverable by `@vue/cli-service`;
- Discoverable by other developers via searching;
- Installable via `vue add <name>` or `vue invoke <name>`.

:::warning Warning
Make sure to name the plugin correctly, otherwise it will be impossible to install it via `vue add` command or find it with Vue UI plugins search!
:::

For better discoverability when a user searches for your plugin, put keywords describing your plugin in the `description` field of the plugin `package.json` file.

Example:

```json
{
  "name": "vue-cli-plugin-apollo",
  "version": "0.7.7",
  "description": "vue-cli plugin to add Apollo and GraphQL"
}
```

You should add the url to the plugin website or repository in the `homepage` or `repository` field so that a 'More info' button will be displayed in your plugin description:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Akryum/vue-cli-plugin-apollo.git"
  },
  "homepage": "https://github.com/Akryum/vue-cli-plugin-apollo#readme"
}
```

![Plugin search item](/plugin-search-item.png)

## Generator

A Generator part of the CLI plugin is usually needed when you want to extend your package with new dependencies, create new files in your project or edit existing ones.

Inside the CLI plugin the generator should be placed in a `generator.js` or `generator/index.js` file. It will be invoked in two possible scenarios:

- During a project's initial creation, if the CLI plugin is installed as part of the project creation preset.

- When the plugin is installed after project's creation and invoked individually via `vue add` or `vue invoke`.

A generator should export a function which receives three arguments:

1. A [GeneratorAPI](generator-api.md) instance;

2. The generator options for this plugin. These options are resolved during the [prompt](#prompts) phase of project creation, or loaded from a saved preset in `~/.vuerc`. For example, if the saved `~/.vuerc` looks like this:

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

For a 3rd party plugin, the options will be resolved from the prompts or command line arguments when the user executes `vue invoke` (see [Prompts](#prompts)).

3. The entire preset (`presets.foo`) will be passed as the third argument.

### Creating new templates

When you call `api.render('./template')`, the generator will render files in `./template` (resolved relative to the generator file) with [EJS](https://github.com/mde/ejs).

Let's imagine we're creating [vue-cli-auto-routing](https://github.com/ktsn/vue-cli-plugin-auto-routing) plugin and we want to make the following changes to the project on plugin invoke:

- create a `layouts` folder with a default layout file;
- create a `pages` folder with `about` and `home` pages;
- add a `router.js` to the `src` folder root

To render this structure, you need to create it first inside the `generator/template` folder:

![Generator structure](/generator-template.png)

After template is created, you should add `api.render` call to the `generator/index.js` file:

```js
module.exports = api => {
  api.render('./template')
}
```

### Editing existing templates

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

```bash
# dotfile templates have to use an underscore instead of the dot:

/generator/template/_env

# When calling api.render('./template'), this will be rendered in the project folder as:

/generator/template/.env
```

Consequently, this means that you also have to follow a special naming convention if you want to render file whose name actually begins with an underscore:

```bash
# such templates have to use two underscores instead of one:

/generator/template/__variables.scss

# When calling api.render('./template'), this will be rendered in the project folder as:

/generator/template/_variables.scss
```


### Extending package

If you need to add an additional dependency to the project, create a new npm script or modify `package.json` in any other way, you can use API `extendPackage` method.

```js
// generator/index.js

module.exports = api => {
  api.extendPackage({
    dependencies: {
      'vue-router-layout': '^0.1.2'
    }
  })
}
```

In the example above we added one dependency: `vue-router-layout`. During the plugin invocation this npm module will be installed and this dependency will be added to the user `package.json` file.

With the same API method we can add new npm tasks to the project. To do so, we need to specify task name and a command that should be run in the `scripts` section of the user `package.json`:

```js
// generator/index.js

module.exports = api => {
  api.extendPackage({
    scripts: {
      greet: 'vue-cli-service greet'
    }
  })
}
```

In the example above we're adding a new `greet` task to run a custom vue-cli service command created in [Service section](#add-a-new-cli-service-command).

### Changing main file

With generator methods you can make changes to the project files. The most usual case is some modifications to `main.js` or `main.ts` file: new imports, new `Vue.use()` calls etc.

Let's consider the case where we have created a `router.js` file via [templating](#creating-new-templates) and now we want to import this router to the main file. We will use two Generator API methods: `entryFile` will return the main file of the project (`main.js` or `main.ts`) and `injectImports` serves for adding new imports to this file:

```js
// generator/index.js

api.injectImports(api.entryFile, `import router from './router'`)
```

Now, when we have a router imported, we can inject this router to the Vue instance in the main file. We will use `afterInvoke` hook which is to be called when the files have been written to disk.

First, we need to read main file content with Node `fs` module (which provides an API for interacting with the file system) and split this content on lines:

```js
// generator/index.js

module.exports.hooks = (api) => {
  api.afterInvoke(() => {
    const fs = require('fs')
    const contentMain = fs.readFileSync(api.resolve(api.entryFile), { encoding: 'utf-8' })
    const lines = contentMain.split(/\r?\n/g)
  })
}
```

Then we should to find the string containing `render` word (it's usually a part of Vue instance) and add our `router` as a next string:

```js{9-10}
// generator/index.js

module.exports.hooks = (api) => {
  api.afterInvoke(() => {
    const fs = require('fs')
    const contentMain = fs.readFileSync(api.resolve(api.entryFile), { encoding: 'utf-8' })
    const lines = contentMain.split(/\r?\n/g)

    const renderIndex = lines.findIndex(line => line.match(/render/))
    lines[renderIndex] += `\n  router,`
  })
}
```

Finally, you need to write the content back to the main file:

```js{12-13}
// generator/index.js

module.exports.hooks = (api) => {
  api.afterInvoke(() => {
    const { EOL } = require('os')
    const fs = require('fs')
    const contentMain = fs.readFileSync(api.resolve(api.entryFile), { encoding: 'utf-8' })
    const lines = contentMain.split(/\r?\n/g)

    const renderIndex = lines.findIndex(line => line.match(/render/))
    lines[renderIndex] += `${EOL}  router,`

    fs.writeFileSync(api.resolve(api.entryFile), lines.join(EOL), { encoding: 'utf-8' })
  })
}
```

## Service Plugin

Service plugin serves for modifying webpack config, creating new vue-cli service commands or changing existing commands (such as `serve` and `build`).

Service plugins are loaded automatically when a Service instance is created - i.e. every time the `vue-cli-service` command is invoked inside a project. It's located in the `index.js` file in CLI plugin root folder.

A service plugin should export a function which receives two arguments:

- A [PluginAPI](plugin-api.md) instance

- An object containing project local options specified in `vue.config.js`, or in the `"vue"` field in `package.json`.

The minimal required code in the service plugin file is the following:

```js
module.exports = () => {}
```

### Modifying webpack config

The API allows service plugins to extend/modify the internal webpack config for different environments. For example, here we're modifying webpack config with webpack-chain to include `vue-auto-routing` webpack plugin with given parameters:

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

With service plugin you can register a new cli-service command in addition to standard ones (i.e. `serve` and `build`). You can do it with a `registerCommand` API method.

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

In this example we provided the command name (`'greet'`), an object of command options with `description` and `usage`, and a function that will be run on `vue-cli-service greet` command.

:::tip
You can add new command to the list of project npm scripts inside the `package.json` file [via Generator](#extending-package).
:::

If you try to run a new command in the project with your plugin installed, you will see the following output:

```bash
$ vue-cli-service greet
👋 Hello!
```

You can also specify a list of available options for a new command. Let's add the option `--name` and change the function to print this name if it's provided.

```js
api.registerCommand(
  'greet',
  {
    description: 'Writes a greeting to the console',
    usage: 'vue-cli-service greet [options]',
    options: { '--name': 'specifies a name for greeting' }
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

## Prompts

Prompts are required to handle user choices when creating a new project or adding a new plugin to the existing one. All prompts logic is stored inside the `prompts.js` file. The prompts are presented using [inquirer](https://github.com/SBoudrias/Inquirer.js) under the hood.

When user initialize the plugin by calling `vue invoke`, if the plugin contains a `prompts.js` in its root directory, it will be used during invocation. The file should export an array of [Questions](https://github.com/SBoudrias/Inquirer.js#question) that will be handled by Inquirer.js.

You should export directly array of questions, or export function that return those.

e.g. directly array of questions:
```js
// prompts.js

module.exports = [
  {
    type: 'input',
    name: 'locale',
    message: 'The locale of project localization.',
    validate: input => !!input,
    default: 'en'
  },
  // ...
]
```

e.g. function that return array of questions:
```js
// prompts.js

// pass `package.json` of project to function argument
module.exports = pkg => {
  const prompts = [
    {
      type: 'input',
      name: 'locale',
      message: 'The locale of project localization.',
      validate: input => !!input,
      default: 'en'
    }
  ]

  // add dynamically prompt
  if ('@vue/cli-plugin-eslint' in (pkg.devDependencies || {})) {
    prompts.push({
      type: 'confirm',
      name: 'useESLintPluginVueI18n',
      message: 'Use ESLint plugin for Vue I18n ?'
    })
  }

  return prompts
}
```

The resolved answers object will be passed to the plugin's generator as options.

Alternatively, the user can skip the prompts and directly initialize the plugin by passing options via the command line, e.g.:

```bash
vue invoke my-plugin --mode awesome
```

Prompt can have [different types](https://github.com/SBoudrias/Inquirer.js#prompt-types) but the most widely used in CLI are `checkbox` and `confirm`. Let's add a `confirm` prompt and then use it in plugin generator to create a condition for [template rendering](#creating-new-templates).

```js
// prompts.js

module.exports = [
  {
    name: `addExampleRoutes`,
    type: 'confirm',
    message: 'Add example routes?',
    default: false
  }
]
```

On plugin invoke user will be prompted with the question about example routes and the default answer will be `No`.

![Prompts example](/prompts-example.png)

If you want to use the result of the user's choice in generator, it will be accessible with the prompt name. We can add a modification to `generator/index.js`:

```js
if (options.addExampleRoutes) {
  api.render('./template', {
    ...options
  })
}
```

Now template will be rendered only if user agreed to create example routes.


## Installing plugin locally

While working on your plugin, you need to test it and check how it works locally on a project using Vue CLI. You can use an existing project or create a new one just for testing purposes:

```bash
vue create test-app
```

To add the plugin, run the following command in the root folder of the project:

```bash
npm install --save-dev file:/full/path/to/your/plugin
vue invoke <your-plugin-name>
```

You need to repeat these steps every time you make changes to your plugin.

Another way to add a plugin is to leverage the power of Vue UI. You can run it with:

```bash
vue ui
```

You will have a UI open in browser window on `localhost:8000`. Go to the `Vue Project Manager` tab:

![Vue Project Manager](/ui-project-manager.png)

And look for your test project name there:

![UI Plugins List](/ui-select-plugin.png)

Click on your application name, go to the Plugins tab (it has a puzzle icon) and then click the `Add new plugin` button on the top right. In the new view you will see a list of Vue CLI plugins accessible via npm. There is also a `Browse local plugin` button on the bottom of the page:

![Browse local plugins](/ui-browse-local-plugin.png)

After you click it, you can easily search for you plugin and add it to the project. After this you will be able to see it in plugins list and apply all changes done to the plugin via simply clicking on `Refresh` icon:

![Refresh plugin](/ui-plugin-refresh.png)

## UI Integration

Vue CLI has a great UI tool which allows user to scaffold and manage a project with a nice graphical interface. The Vue CLI plugin can be integrated to this interface. UI provides an additional functionality to CLI plugins:

- you can run npm tasks, including plugin-specific ones, directly from the UI;
- you can display custom configurations for your plugin. For example, [vue-cli-plugin-apollo](https://github.com/Akryum/vue-cli-plugin-apollo) provides the following configuration screen for Apollo server:

![UI Configuration Screen](/ui-configuration.png)
- when creating the project, you can display [prompts](#prompts) visually
- you can add localizations for your plugin if you want to support multiple languages
- you can make your plugin discoverable in the Vue UI search

All the logic connected to Vue UI should be placed to `ui.js` file in the root folder or in the `ui/index.js`. The file should export a function which gets the api object as argument:

```js
module.exports = api => {
  // Use the API here...
}
```

### Augment the task in the UI

Vue CLI plugin allows you not only add new npm tasks to the project [via Generator](#extending-package) but also create a view for them in Vue UI. It's useful when you want to run the the task right from the UI and see its output there.

Let's add a `greet` task created with [Generator](#extending-package) to the UI. Tasks are generated from the `scripts` field in the project `package.json` file. You can 'augment' the tasks with additional info and hooks thanks to the `api.describeTask` method. Let's provide some additional information about our task:

```js
module.exports = api => {
  api.describeTask({
    match: /greet/,
    description: 'Prints a greeting in the console',
    link: 'https://cli.vuejs.org/dev-guide/plugin-dev.html#core-concepts'
  })
}
```

Now if you explore your project in the Vue UI, you will find your task added to the `Tasks` section. You can see a name of the task, provided description, a link icon that leads to the provided URL and also an output screen to show the task output:

![UI Greet task](/ui-greet-task.png)

### Display a configuration screen

Sometimes your project can have custom configuration files for different features or libraries. With Vue CLI plugin you can display this config in Vue UI, change it and save (saving will change the corresponding config file in your project). By default, Vue CLI project has a main configuration screen representing `vue.config.js` settings. If you included ESLint to your project, you will see also a ESLint configuration screen:

![UI Configuration Screen](/ui-configuration-default.png)

Let's build a custom configuration for our plugin. First of all, after you add your plugin to the existing project, there should be a file containing this custom config. This means you need to add this file to `template` folder on the [templating step](#creating-new-templates).

By default, a configuration UI might read and write to the following file types: `json`, `yaml`, `js`, `package`. Let's name our new file `myConfig.js` and place in it the root of `template` folder:

```
.
└── generator
    ├── index.js
    └── template
        ├── myConfig.js
        └── src
            ├── layouts
            ├── pages
            └── router.js
```

Now you need to add some actual config to this file:

```js
// myConfig.js

module.exports = {
  color: 'black'
}
```

After your plugin is invoked, the `myConfig.js` file will be rendered in the project root directory. Now let's add a new configuration screen with the `api.describeConfig` method in the `ui.js` file:

First you need to pass some information:

```js
// ui.js

api.describeConfig({
  // Unique ID for the config
  id: 'org.ktsn.vue-auto-routing.config',
  // Displayed name
  name: 'Greeting configuration',
  // Shown below the name
  description: 'This config defines the color of the greeting printed',
  // "More info" link
  link: 'https://github.com/ktsn/vue-cli-plugin-auto-routing#readme'
})
```

:::danger Warning
Make sure to namespace the id correctly, since it must be unique across all plugins. It's recommended to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation)
:::

#### Config logo

You can also select an icon for your config. It can be either a [Material icon](https://material.io/tools/icons/?style=baseline) code or a custom image (see [Public static files](ui-api.md#public-static-files)).

```js
// ui.js

api.describeConfig({
  /* ... */
  // Config icon
  icon: 'color_lens'
})
```

If you don't specify an icon, the plugin logo will be displayed if any (see [Logo](#logo)).

#### Config files

Now you need to provide your configuration file to UI: this way you could read its content and save changes to it. You need to choose a name for your config file, select its format and provide a path to the file:

```js
api.describeConfig({
  // other config properties
  files: {
    myConfig: {
      js: ['myConfig.js']
    }
  }
})
```

There can be more than one file provided. Say, if we have `myConfig.json`, we can provide it with `json: ['myConfig.json']` property. The order is important: the first filename in the list will be used to create the config file if it doesn't exist.

#### Display config prompts

We want to display an input field for color property on the configuration screen. To do so, we need a `onRead` hook that will return a list of prompts to be displayed:

```js
api.describeConfig({
  // other config properties
  onRead: ({ data }) => ({
    prompts: [
      {
        name: `color`,
        type: 'input',
        message: 'Define the color for greeting message',
        value: 'white'
      }
    ]
  })
})
```

In the example above we specified the input prompt with the value of 'white'. This is how our configuration screen will look with all the settings provided above:

![UI Config Start](/ui-config-start.png)

Now let's replace hardcoded `white` value with the property from the config file. In the `onRead` hook `data` object contains the JSON result of each config file content. In our case, the content of `myConfig.js` was

```js
// myConfig.js

module.exports = {
  color: 'black'
}
```

So, the `data` object will be

```js
{
  // File
  myConfig: {
    // File data
    color: 'black'
  }
}
```

It's easy to see that we need `data.myConfig.color` property. Let's change `onRead` hook:

```js
// ui.js

onRead: ({ data }) => ({
  prompts: [
    {
      name: `color`,
      type: 'input',
      message: 'Define the color for greeting message',
      value: data.myConfig && data.myConfig.color
    }
  ]
}),
```

::: tip
Note that `myConfig` may be undefined if the config file doesn't exist when the screen is loaded.
:::

You can see that on the configuration screen `white` is replaced with `black`.

We can also provide a default value if the config file is not present:

```js
// ui.js

onRead: ({ data }) => ({
  prompts: [
    {
      name: `color`,
      type: 'input',
      message: 'Define the color for greeting message',
      value: data.myConfig && data.myConfig.color,
      default: 'black',
    }
  ]
}),
```

#### Save config changes

We just read the content of `myConfig.js` and used it on the configuration screen. Now let's try to save any changes done in the color input field to the file. We can do it with the `onWrite` hook:

```js
// ui.js

api.describeConfig({
  /* ... */
  onWrite: ({ prompts, api }) => {
    // ...
  }
})
```

`onWrite` hook can take a lot of [arguments](ui-api.html#save-config-changes) but we will need only two of them: `prompts` and `api`. First one is current prompts runtime objects - we will get a prompt id from it and retrieve an answer with this id. To retrieve the answer we'll use `async getAnswer()` method from the `api`:

```js
// ui.js

async onWrite({ api, prompts }) {
  const result = {}
  for (const prompt of prompts) {
    result[`${prompt.id}`] = await api.getAnswer(prompt.id)
  }
  api.setData('myConfig', result)
}
```

Now if you try to change the value in the color input field from `black` to `red` on the config screen and press `Save the changes`, you will observe that `myConfig.js` file in your project has been changed as well:

```js
// myConfig.js

module.exports = {
  color: 'red'
}
```

### Display prompts

If you want, you can display [prompts](#prompts) in the Vue UI as well. When installing your plugin through the UI, prompts will be shown on the plugin invocation step.

You can extend the [inquirer object](#prompts-for-3rd-party-plugins) with additional properties. They are optional and only used by the UI:

```js
// prompts.js

module.exports = [
  {
    // basic prompt properties
    name: `addExampleRoutes`,
    type: 'confirm',
    message: 'Add example routes?',
    default: false,
    // UI-related prompt properties
    group: 'Strongly recommended',
    description: 'Adds example pages, layouts and correct router config',
    link:
      'https://github.com/ktsn/vue-cli-plugin-auto-routing/#vue-cli-plugin-auto-routing'
  }
]
```

As a result, you will have this screen on plugin invocation:

![UI Prompts](/ui-prompts.png)

### Logo

You can put a `logo.png` file in the root directory of the folder that will be published on npm. It will be displayed in several places:
 - When searching for a plugin to install
 - In the installed plugin list
 - In the configurations list (by default)
 - In the tasks list for augmented tasks (by default)

![Plugins](/plugins.png)

The logo should be a square non-transparent image (ideally 84x84).

## Publish Plugin to npm

To publish your plugin, you need to be registered an [npmjs.com](https://www.npmjs.com) and you should have `npm` installed globally. If it's your first npm module, please run

```bash
npm login
```

Enter your username and password. This will store the credentials so you don’t have to enter it for every publish.

:::tip
Before publishing a plugin, make sure you choose a right name for it! Name convention is `vue-cli-plugin-<name>`. Check [Discoverability](#discoverability) section for more information
:::

To publish a plugin, go to the plugin root folder and run this command in the terminal:

```bash
npm publish
```

After successful publish, you should be able to add your plugin to the project created with Vue CLI with `vue add <plugin-name>` command.
