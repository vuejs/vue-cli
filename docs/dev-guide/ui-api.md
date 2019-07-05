# UI API

The cli-ui exposes an API that allows augmenting the project configurations and tasks, as well as sharing data and communicating with other processes.

![UI Plugin architecture](/vue-cli-ui-schema.png)

## UI files

Inside each installed vue-cli plugins, the cli-ui will try to load an optional `ui.js` file in the root folder of the plugin. Note that you can also use folders (for example `ui/index.js`).

The file should export a function which gets the api object as argument:

```js
module.exports = api => {
  // Use the API here...
}
```

**⚠️ The files will be reloaded when fetching the plugin list in the 'Project plugins' view. To apply changes, click on the 'Project plugins' button in the navigation sidebar on the left in the UI.**

Here is an example folder structure for a vue-cli plugin using the UI API:

```
- vue-cli-plugin-test
  - package.json
  - index.js
  - generator.js
  - prompts.js
  - ui.js
  - logo.png
```

### Project local plugins

If you need access to the plugin API in your project and don't want to create a full plugin for it, you can use the `vuePlugins.ui` option in your `package.json` file:

```json
{
  "vuePlugins": {
    "ui": ["my-ui.js"]
  }
}
```

Each file will need to export a function taking the plugin API as the first argument.

## Dev mode

While building your plugin, you may want to run the cli-ui in Dev mode, so it will output useful logs to you:

```
vue ui --dev
```

Or:

```
vue ui -D
```

## Project configurations

![Configuration ui](/config-ui.png)

You can add a project configuration with the `api.describeConfig` method.

First you need to pass some information:

```js
api.describeConfig({
  // Unique ID for the config
  id: 'org.vue.eslintrc',
  // Displayed name
  name: 'ESLint configuration',
  // Shown below the name
  description: 'Error checking & Code quality',
  // "More info" link
  link: 'https://eslint.org'
})
```

::: danger
Make sure to namespace the id correctly, since it must be unique across all plugins. It's recommended to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

### Config icon

It can be either a [Material icon](https://material.io/tools/icons) code or a custom image (see [Public static files](#public-static-files)):

```js
api.describeConfig({
  /* ... */
  // Config icon
  icon: 'application_settings'
})
```

If you don't specify an icon, the plugin logo will be displayed if any (see [Logo](./ui-info.md#logo)).

### Config files

By default, a configuration UI might read and write to one or more configuration files, for example both `.eslintrc.js` and `vue.config.js`.

You can provide what are the possible files to be detected in the user project:

```js
api.describeConfig({
  /* ... */
  // All possible files for this config
  files: {
    // eslintrc.js
    eslint: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      // Will read from `package.json`
      package: 'eslintConfig'
    },
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

Supported types: `json`, `yaml`, `js`, `package`. The order is important: the first filename in the list will be used to create the config file if it doesn't exist.

### Display config prompts

Use the `onRead` hook to return a list of prompts to be displayed for the configuration:

```js
api.describeConfig({
  /* ... */
  onRead: ({ data, cwd }) => ({
    prompts: [
      // Prompt objects
    ]
  })
})
```

Those prompts will be displayed in the configuration details pane.

See [Prompts](#prompts) for more info.

The `data` object contains the JSON result of each config file content.

For example, let's say the user has the following `vue.config.js` in his project:

```js
module.exports = {
  lintOnSave: false
}
```

We declare the config file in our plugin like this:

```js
api.describeConfig({
  /* ... */
  // All possible files for this config
  files: {
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

Then the `data` object will be:

```js
{
  // File
  vue: {
    // File data
    lintOnSave: false
  }
}
```

Multiple files example: if we add the following `eslintrc.js` file in the user project:

```js
module.exports = {
  root: true,
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ]
}
```

And change the `files` option in our plugin to this:

```js
api.describeConfig({
  /* ... */
  // All possible files for this config
  files: {
    // eslintrc.js
    eslint: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      // Will read from `package.json`
      package: 'eslintConfig'
    },
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

Then the `data` object will be:

```js
{
  eslint: {
    root: true,
    extends: [
      'plugin:vue/essential',
      '@vue/standard'
    ]
  },
  vue: {
    lintOnSave: false
  }
}
```

### Configuration tabs

You can organize the prompts into several tabs:

```js
api.describeConfig({
  /* ... */
  onRead: ({ data, cwd }) => ({
    tabs: [
      {
        id: 'tab1',
        label: 'My tab',
        // Optional
        icon: 'application_settings',
        prompts: [
          // Prompt objects
        ]
      },
      {
        id: 'tab2',
        label: 'My other tab',
        prompts: [
          // Prompt objects
        ]
      }
    ]
  })
})
```

### Save config changes

Use the `onWrite` hook to write the data to the configuration file (or execute any nodejs code):

```js
api.describeConfig({
  /* ... */
  onWrite: ({ prompts, answers, data, files, cwd, api }) => {
    // ...
  }
})
```

Arguments:

- `prompts`: current prompts runtime objects (see below)
- `answers`: answers data from the user inputs
- `data`: read-only initial data read from the config files
- `files`: descriptors of the found files (`{ type: 'json', path: '...' }`)
- `cwd`: current working directory
- `api`: `onWrite API` (see below)

Prompts runtime objects:

```js
{
  id: data.name,
  type: data.type,
  name: data.short || null,
  message: data.message,
  group: data.group || null,
  description: data.description || null,
  link: data.link || null,
  choices: null,
  visible: true,
  enabled: true,
  // Current value (not filtered)
  value: null,
  // true if changed by user
  valueChanged: false,
  error: null,
  tabId: null,
  // Original inquirer prompt object
  raw: data
}
```

`onWrite` API:

- `assignData(fileId, newData)`: use `Object.assign` to update the config data before writing.
- `setData(fileId, newData)`: each key of `newData` will be deeply set (or removed if `undefined` value) to the config data before writing.
- `async getAnswer(id, mapper)`: retrieve answer for a given prompt id and map it through `mapper` function if provided (for example `JSON.parse`).

Example (from the ESLint plugin):

```js
api.describeConfig({
  // ...

  onWrite: async ({ api, prompts }) => {
    // Update ESLint rules
    const result = {}
    for (const prompt of prompts) {
      result[`rules.${prompt.id}`] = await api.getAnswer(prompt.id, JSON.parse)
    }
    api.setData('eslint', result)
  }
})
```

## Project tasks

![Tasks ui](/tasks-ui.png)

Tasks are generated from the `scripts` field in the project `package.json` file.

You can 'augment' the tasks with additional info and hooks thanks to the `api.describeTask` method:

```js
api.describeTask({
  // RegExp executed on script commands to select which task will be described here
  match: /vue-cli-service serve/,
  description: 'Compiles and hot-reloads for development',
  // "More info" link
  link: 'https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#serve'
})
```

You can also use a function for `match`:

```js
api.describeTask({
  match: (command) => /vue-cli-service serve/.test(command),
})
```

### Task icon

It can be either a [Material icon](https://material.io/tools/icons) code or a custom image (see [Public static files](#public-static-files)):

```js
api.describeTask({
  /* ... */
  // Task icon
  icon: 'application_settings'
})
```

If you don't specify an icon, the plugin logo will be displayed if any (see [Logo](./ui-info.md#logo)).

### Tasks parameters

You can add prompts to modify the command arguments. They will be displayed in a 'Parameters' modal.

Example:

```js
api.describeTask({
  // ...

  // Optional parameters (inquirer prompts)
  prompts: [
    {
      name: 'open',
      type: 'confirm',
      default: false,
      description: 'Open browser on server start'
    },
    {
      name: 'mode',
      type: 'list',
      default: 'development',
      choices: [
        {
          name: 'development',
          value: 'development'
        },
        {
          name: 'production',
          value: 'production'
        },
        {
          name: 'test',
          value: 'test'
        }
      ],
      description: 'Specify env mode'
    }
  ]
})
```

See [Prompts](#prompts) for more info.

### Task hooks

Several hooks are available:

- `onBeforeRun`
- `onRun`
- `onExit`

For example, you can use the answers to the prompts (see above) to add new arguments to the command:

```js
api.describeTask({
  // ...

  // Hooks
  // Modify arguments here
  onBeforeRun: async ({ answers, args }) => {
    // Args
    if (answers.open) args.push('--open')
    if (answers.mode) args.push('--mode', answers.mode)
    args.push('--dashboard')
  },
  // Immediately after running the task
  onRun: async ({ args, child, cwd }) => {
    // child: node child process
    // cwd: process working directory
  },
  onExit: async ({ args, child, cwd, code, signal }) => {
    // code: exit code
    // signal: kill signal used if any
  }
})
```

### Task views

You can display custom views in the task details pane using the `ClientAddon` API:

```js
api.describeTask({
  // ...

  // Additional views (for example the webpack dashboard)
  // By default, there is the 'output' view which displays the terminal output
  views: [
    {
      // Unique ID
      id: 'vue-webpack-dashboard-client-addon',
      // Button label
      label: 'Dashboard',
      // Button icon
      icon: 'dashboard',
      // Dynamic component to load (see 'Client addon' section below)
      component: 'vue-webpack-dashboard'
    }
  ],
  // Default selected view when displaying the task details (by default it's the output)
  defaultView: 'vue-webpack-dashboard-client-addon'
})
```

See [Client addon](#client-addon) for more info.


### Add new tasks

You can also add entirely new tasks which aren't in the `package.json` scripts with `api.addTask` instead of `api.describeTask`. Those tasks will only appear in the cli UI.

**You need to provide a `command` option instead of `match`.**

Example:

```js
api.addTask({
  // Required
  name: 'inspect',
  command: 'vue-cli-service inspect',
  // Optional
  // The rest is like `describeTask` without the `match` option
  description: '...',
  link: 'https://github.com/vuejs/vue-cli/...',
  prompts: [ /* ... */ ],
  onBeforeRun: () => {},
  onRun: () => {},
  onExit: () => {},
  views: [ /* ... */ ],
  defaultView: '...'
})
```

**⚠️ The `command` will run a node context. This means you can call node bin commands like you would normally do in the `package.json` scripts.**

## Prompts

The prompt objects must be valid [inquirer](https://github.com/SBoudrias/Inquirer.js) objects.

However, you can add the following additional fields (which are optional and only used by the UI):

```js
{
  /* ... */
  // Used to group the prompts into sections
  group: 'Strongly recommended',
  // Additional description
  description: 'Enforce attribute naming style in template (`my-prop` or `myProp`)',
  // "More info" link
  link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/attribute-hyphenation.md',
}
```

Supported inquirer types: `checkbox`, `confirm`, `input`, `password`, `list`, `rawlist`, `editor`.

In addition to those, the UI supports special types that only works with it:

- `color`: displays a color picker.

### Switch example

```js
{
  name: 'open',
  type: 'confirm',
  default: false,
  description: 'Open the app in the browser'
}
```

### Select example

```js
{
  name: 'mode',
  type: 'list',
  default: 'development',
  choices: [
    {
      name: 'Development mode',
      value: 'development'
    },
    {
      name: 'Production mode',
      value: 'production'
    },
    {
      name: 'Test mode',
      value: 'test'
    }
  ],
  description: 'Build mode',
  link: 'https://link-to-docs'
}
```

### Input example

```js
{
  name: 'host',
  type: 'input',
  default: '0.0.0.0',
  description: 'Host for the development server'
}
```

### Checkbox example

Displays multiple switches.

```js
{
  name: 'lintOn',
  message: 'Pick additional lint features:',
  when: answers => answers.features.includes('linter'),
  type: 'checkbox',
  choices: [
    {
      name: 'Lint on save',
      value: 'save',
      checked: true
    },
    {
      name: 'Lint and fix on commit' + (hasGit() ? '' : chalk.red(' (requires Git)')),
      value: 'commit'
    }
  ]
}
```

### Color picker example

```js
{
  name: 'themeColor',
  type: 'color',
  message: 'Theme color',
  description: 'This is used to change the system UI color around the app',
  default: '#4DBA87'
}
```

### Prompts for invocation

In your vue-cli plugin, you may already have a `prompts.js` file which asks the user a few questions when installing the plugin (with the CLI or the UI). You can add the additional UI-only fields (see above) to those prompt objects as well so they will provide more information if the user is using the UI.

**⚠️ Currently, the inquirer types which aren't supported (see above) will not work properly in the UI.**

## Client addon

A Client addon is a JS bundle which is dynamically loaded into the cli-ui. It is useful to load custom components and routes.

### Create a client addon

The recommended way to create a Client addon is by creating a new project using vue cli. You can either do this in a subfolder of your plugin or in a different npm package.

Install `@vue/cli-ui` as a dev dependency.

Then add a `vue.config.js` file with the following content:

```js
const { clientAddonConfig } = require('@vue/cli-ui')

module.exports = {
  ...clientAddonConfig({
    id: 'org.vue.webpack.client-addon',
    // Development port (default 8042)
    port: 8042
  })
}
```

The `clientAddonConfig` method will generate the needed vue-cli configuration. Among other things, it disables CSS extraction and outputs the code to `./dist/index.js` in the client addon folder.

::: danger
Make sure to namespace the id correctly, since it must be unique across all plugins. It's recommended to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

Then modify the `.eslintrc.json` file to add some allowed global objects:

```json
{
  // ...
  "globals": {
    "ClientAddonApi": false,
    "mapSharedData": false,
    "Vue": false
  }
}
```

You can now run the `serve` script in development and the `build` one when you are ready to publish your plugin.

### ClientAddonApi

Open the `main.js` file in the client addon sources and remove all the code.

**⚠️ Don't import Vue in the client addon sources, use the global `Vue` object from the browser `window`.**

Here is an example of code for `main.js`:

```js
import VueProgress from 'vue-progress-path'
import WebpackDashboard from './components/WebpackDashboard.vue'
import TestView from './components/TestView.vue'

// You can install additional vue plugins
// using the global 'Vue' variable
Vue.use(VueProgress, {
  defaultShape: 'circle'
})

// Register a custom component
// (works like 'Vue.component')
ClientAddonApi.component('org.vue.webpack.components.dashboard', WebpackDashboard)

// Add routes to vue-router under a /addon/<id> parent route.
// For example, addRoutes('foo', [ { path: '' }, { path: 'bar' } ])
// will add the /addon/foo/ and the /addon/foo/bar routes to vue-router.
// Here we create a new '/addon/vue-webpack/' route with the 'test-webpack-route' name
ClientAddonApi.addRoutes('org.vue.webpack', [
  { path: '', name: 'org.vue.webpack.routes.test', component: TestView }
])

// You can translate your plugin components
// Load the locale files (uses vue-i18n)
const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
locales.keys().forEach(key => {
  const locale = key.match(/([a-z0-9]+)\./i)[1]
  ClientAddonApi.addLocalization(locale, locales(key))
})
```

::: danger
Make sure to namespace the ids correctly, since they must be unique across all plugins. It's recommended to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

The cli-ui registers `Vue` and `ClientAddonApi` as global variables in the `window` scope.

In your components, you can use all the components and the CSS classes of [@vue/ui](https://github.com/vuejs/ui) and [@vue/cli-ui](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-ui/src/components) in order to keep the look and feel consistent. You can also translate the strings with [vue-i18n](https://github.com/kazupon/vue-i18n) which is included.

### Register the client addon

Back to the `ui.js` file, use the `api.addClientAddon` method with a require query to the built folder:

```js
api.addClientAddon({
  id: 'org.vue.webpack.client-addon',
  // Folder containing the built JS files
  path: '@vue/cli-ui-addon-webpack/dist'
})
```

This will use the nodejs `require.resolve` API to find the folder and serve the `index.js` file built from the client addon.

Or specify an url when developing the plugin (ideally you want to do this in the `vue-cli-ui.js` file in your test vue project):

```js
// Useful for dev
// Will override path if already defined in a plugin
api.addClientAddon({
  id: 'org.vue.webpack.client-addon',
  // Use the same port you configured earlier
  url: 'http://localhost:8042/index.js'
})
```

### Use the client addon

You can now use the client addon in the views. For example, you can specify a view in a described task:

```js
api.describeTask({
  /* ... */
  // Additional views (for example the webpack dashboard)
  // By default, there is the 'output' view which displays the terminal output
  views: [
    {
      // Unique ID
      id: 'org.vue.webpack.views.dashboard',
      // Button label
      label: 'Dashboard',
      // Button icon (material-icons)
      icon: 'dashboard',
      // Dynamic component to load, registered using ClientAddonApi
      component: 'org.vue.webpack.components.dashboard'
    }
  ],
  // Default selected view when displaying the task details (by default it's the output)
  defaultView: 'org.vue.webpack.views.dashboard'
})
```

Here is the client addon code that register the `'org.vue.webpack.components.dashboard'` component (like we saw earlier):

```js
/* In `main.js` */
// Import the component
import WebpackDashboard from './components/WebpackDashboard.vue'
// Register a custom component
// (works like 'Vue.component')
ClientAddonApi.component('org.vue.webpack.components.dashboard', WebpackDashboard)
```

![Task view example](/task-view.png)

## Custom views

You can add a new view below the standard 'Project plugins', 'Project configuration' and 'Project tasks' ones using the `api.addView` method:

```js
api.addView({
  // Unique id
  id: 'org.vue.webpack.views.test',

  // Route name (from vue-router)
  // Use the same name used in the 'ClientAddonApi.addRoutes' method (see above in the Client addon section)
  name: 'org.vue.webpack.routes.test',

  // Button icon (material-icons)
  icon: 'pets',
  // You can also specify a custom image (see Public static files section below):
  // icon: 'http://localhost:4000/_plugin/%40vue%2Fcli-service/webpack-icon.svg',

  // Button tooltip
  tooltip: 'Test view from webpack addon'
})
```

Here is the code in the client addon that register the `'org.vue.webpack.routes.test'` (like we saw earlier):

```js
/* In `main.js` */
// Import the component
import TestView from './components/TestView.vue'
// Add routes to vue-router under a /addon/<id> parent route.
// For example, addRoutes('foo', [ { path: '' }, { path: 'bar' } ])
// will add the /addon/foo/ and the /addon/foo/bar routes to vue-router.
// Here we create a new '/addon/vue-webpack/' route with the 'test-webpack-route' name
ClientAddonApi.addRoutes('org.vue.webpack', [
  { path: '', name: 'org.vue.webpack.routes.test', component: TestView }
])
```

![Custom view example](/custom-view.png)

## Shared data

Use Shared data to communicate info with custom components in an easy way.

> For example, the Webpack dashboard shares the build stats between the UI client and the UI server using this API.

In the plugin `ui.js` (nodejs):

```js
// Set or update
api.setSharedData('com.my-name.my-variable', 'some-data')

// Get
const sharedData = api.getSharedData('com.my-name.my-variable')
if (sharedData) {
  console.log(sharedData.value)
}

// Remove
api.removeSharedData('com.my-name.my-variable')

// Watch for changes
const watcher = (value, id) => {
  console.log(value, id)
}
api.watchSharedData('com.my-name.my-variable', watcher)
// Unwatch
api.unwatchSharedData('com.my-name.my-variable', watcher)

// Namespaced versions
const {
  setSharedData,
  getSharedData,
  removeSharedData,
  watchSharedData,
  unwatchSharedData
} = api.namespace('com.my-name.')
```

::: danger
Make sure to namespace the ids correctly, since they must be unique across all plugins. It's recommended to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

In the custom component:

```js
// Vue component
export default {
  // Sync Shared data
  sharedData () {
    return {
      // You can use `myVariable` in template
      myVariable: 'com.my-name.my-variable'
      // You can also map namespaced Shared data
      ...mapSharedData('com.my-name.', {
        myVariable2: 'my-variable2'
      })
    }
  },

  // Manual methods
  async created () {
    const value = await this.$getSharedData('com.my-name.my-variable')

    this.$watchSharedData(`com.my-name.my-variable`, value => {
      console.log(value)
    })

    await this.$setSharedData('com.my-name.my-variable', 'new-value')
  }
}
```

If you use the `sharedData` option, the shared data can be updated by assigning a new value to the corresponding property.

```html
<template>
  <VueInput v-model="message"/>
</template>

<script>
export default {
  sharedData: {
    // Will sync the 'my-message' shared data on the server
    message: 'com.my-name.my-message'
  }
}
</script>
```

This is very useful if you create a settings component for example.

## Plugin actions

Plugin actions are calls sent between the cli-ui (browser) and plugins (nodejs).

> For example, you might have a button in a custom component (see [Client addon](#client-addon)) which calls some nodejs code on the server using this API.

In the `ui.js` file in the plugin (nodejs), you can use two methods from `PluginApi`:

```js
// Call an action
api.callAction('com.my-name.other-action', { foo: 'bar' }).then(results => {
  console.log(results)
}).catch(errors => {
  console.error(errors)
})
```

```js
// Listen for an action
api.onAction('com.my-name.test-action', params => {
  console.log('test-action called', params)
})
```

::: danger
Make sure to namespace the ids correctly, since they must be unique across all plugins. It's recommended to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

You can use namespaced versions with `api.namespace` (similar to Shared data):

```js
const { onAction, callAction } = api.namespace('com.my-name.')
```

In the client addon components (browser), you have access to `$onPluginActionCalled`, `$onPluginActionResolved` and `$callPluginAction`:

```js
// Vue component
export default {
  created () {
    this.$onPluginActionCalled(action => {
      // When the action is called
      // before being run
      console.log('called', action)
    })
    this.$onPluginActionResolved(action => {
      // After the action is run and completed
      console.log('resolved', action)
    })
  },

  methods: {
    testPluginAction () {
      // Call a plugin action
      this.$callPluginAction('com.my-name.test-action', {
        meow: 'meow'
      })
    }
  }
}
```

## Inter-process communication (IPC)

IPC stands for Inter-Process Communication. This system allows you to easily send messages from child processes (for example, tasks!). And it's pretty fast and lightweight.

> To display the data in the webpack dashboard UI, the `serve` and `build` commands from `@vue/cli-service` send IPC messages to the cli-ui nodejs server when the `--dashboard` argument is passed in.

In you process code (which can be a Webpack plugin or a nodejs task script), you can use the `IpcMessenger` class from `@vue/cli-shared-utils`:

```js
const { IpcMessenger } = require('@vue/cli-shared-utils')

// Create a new IpcMessenger instance
const ipc = new IpcMessenger()

function sendMessage (data) {
  // Send a message to the cli-ui server
  ipc.send({
    'com.my-name.some-data': {
      type: 'build',
      value: data
    }
  })
}

function messageHandler (data) {
  console.log(data)
}

// Listen for message
ipc.on(messageHandler)

// Don't listen anymore
ipc.off(messageHandler)

function cleanup () {
  // Disconnect from the IPC network
  ipc.disconnect()
}
```

Manual connection:

```js
const ipc = new IpcMessenger({
  autoConnect: false
})

// This message will be queued
ipc.send({ ... })

ipc.connect()
```

Auto disconnect on idle (after some time without sending any message):

```js
const ipc = new IpcMessenger({
  disconnectOnIdle: true,
  idleTimeout: 3000 // Default
})

ipc.send({ ... })

setTimeout(() => {
  console.log(ipc.connected) // false
}, 3000)
```

Connect to another IPC network:

```js
const ipc = new IpcMessenger({
  networkId: 'com.my-name.my-ipc-network'
})
```

In a vue-cli plugin `ui.js` file, you can use the `ipcOn`, `ipcOff` and `ipcSend` methods:

```js
function onWebpackMessage ({ data: message }) {
  if (message['com.my-name.some-data']) {
    console.log(message['com.my-name.some-data'])
  }
}

// Listen for any IPC message
api.ipcOn(onWebpackMessage)

// Don't listen anymore
api.ipcOff(onWebpackMessage)

// Send a message to all connected IpcMessenger instances
api.ipcSend({
  webpackDashboardMessage: {
    foo: 'bar'
  }
})
```

## Local storage

A plugin can save and load data from the local [lowdb](https://github.com/typicode/lowdb) database used by the ui server.

```js
// Store a value into the local DB
api.storageSet('com.my-name.an-id', { some: 'value' })

// Retrieve a value from the local DB
console.log(api.storageGet('com.my-name.an-id'))

// Full lowdb instance
api.db.get('posts')
  .find({ title: 'low!' })
  .assign({ title: 'hi!'})
  .write()

// Namespaced helpers
const { storageGet, storageSet } = api.namespace('my-plugin.')
```

::: danger
Make sure to namespace the ids correctly, since they must be unique across all plugins. It's recommended to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

## Notification

You can display notifications using the user OS notification system:

```js
api.notify({
  title: 'Some title',
  message: 'Some message',
  icon: 'path-to-icon.png'
})
```

There are some builtin icons:

- `'done'`
- `'error'`

## Progress screen

You can display a progress screen with some text and a progress bar:

```js
api.setProgress({
  status: 'Upgrading...',
  error: null,
  info: 'Step 2 of 4',
  progress: 0.4 // from 0 to 1, -1 means hidden progress bar
})
```

Remove the progress screen:

```js
api.removeProgress()
```

## Hooks

Hooks allows to react to certain cli-ui events.

### onProjectOpen

Called when the plugin is loaded for the first time for the current project.

```js
api.onProjectOpen((project, previousProject) => {
  // Reset data
})
```

### onPluginReload

Called when the plugin is reloaded.

```js
api.onPluginReload((project) => {
  console.log('plugin reloaded')
})
```

### onConfigRead

Called when a configuration screen is open or refreshed.

```js
api.onConfigRead(({ config, data, onReadData, tabs, cwd }) => {
  console.log(config.id)
})
```

### onConfigWrite

Called when the user saves in a configuration screen.

```js
api.onConfigWrite(({ config, data, changedFields, cwd }) => {
  // ...
})
```

### onTaskOpen

Called when the user open a task details pane.

```js
api.onTaskOpen(({ task, cwd }) => {
  console.log(task.id)
})
```

### onTaskRun

Called when the user run a task.

```js
api.onTaskRun(({ task, args, child, cwd }) => {
  // ...
})
```

### onTaskExit

Called when a task exists. It can be called both called on success or failure.

```js
api.onTaskExit(({ task, args, child, signal, code, cwd }) => {
  // ...
})
```

### onViewOpen

Called when the users open a view (like 'Plugins', 'Configurations' or 'Tasks').

```js
api.onViewOpen(({ view, cwd }) => {
  console.log(view.id)
})
```

## Suggestions

Suggestions are buttons meant to propose an action to the user. They are displayed in the top bar. For example, we can have a button that suggest installing vue-router if the package isn't detected in the app.

```js
api.addSuggestion({
  id: 'com.my-name.my-suggestion',
  type: 'action', // Required (more types in the future)
  label: 'Add vue-router',
  // This will be displayed in a details modal
  message: 'A longer message for the modal',
  link: 'http://link-to-docs-in-the-modal',
  // Optional image
  image: '/_plugin/my-package/screenshot.png',
  // Function called when suggestion is activated by user
  async handler () {
    // ...
    return {
      // By default removes the button
      keep: false
    }
  }
})
```

::: danger
Make sure to namespace the id correctly, since it must be unique across all plugins. It's recommended to use the [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

![UI Suggestion](/suggestion.png)

Then you can remove the suggestion:

```js
api.removeSuggestion('com.my-name.my-suggestion')
```

You can also open a page instead when the user activates the suggestion with `actionLink`:

```js
api.addSuggestion({
  id: 'com.my-name.my-suggestion',
  type: 'action', // Required
  label: 'Add vue-router',
  // Open a new tab
  actionLink: 'https://vuejs.org/'
})
```

Typically, you will use hooks to display the suggestion in the right context:

```js
const ROUTER = 'vue-router-add'

api.onViewOpen(({ view }) => {
  if (view.id === 'vue-project-plugins') {
    if (!api.hasPlugin('router')) {
      api.addSuggestion({
        id: ROUTER,
        type: 'action',
        label: 'org.vue.cli-service.suggestions.vue-router-add.label',
        message: 'org.vue.cli-service.suggestions.vue-router-add.message',
        link: 'https://router.vuejs.org/',
        async handler () {
          await install(api, 'router')
        }
      })
    }
  } else {
    api.removeSuggestion(ROUTER)
  }
})
```

In this example we only display the vue-router suggestion in the plugins view and if the project doesn't have vue-router installed already.

Note: `addSuggestion` and `removeSuggestion` can be namespaced with `api.namespace()`.

## Widgets

You can register a widget for the project dashboard in your plugin ui file:

```js
registerWidget({
  // Unique ID
  id: 'org.vue.widgets.news',
  // Basic infos
  title: 'org.vue.widgets.news.title',
  description: 'org.vue.widgets.news.description',
  icon: 'rss_feed',
  // Main component used to render the widget
  component: 'org.vue.widgets.components.news',
  // (Optional) Secondary component for widget 'fullscreen' view
  detailsComponent: 'org.vue.widgets.components.news',
  // Size
  minWidth: 2,
  minHeight: 1,
  maxWidth: 6,
  maxHeight: 6,
  defaultWidth: 2,
  defaultHeight: 3,
  // (Optional) Limit the maximum number of this widget on the dashboard
  maxCount: 1,
  // (Optional) Add a 'fullscreen' button in widget header
  openDetailsButton: true,
  // (Optional) Default configuration for the widget
  defaultConfig: () => ({
    url: 'https://vuenews.fireside.fm/rss'
  }),
  // (Optional) Require user to configure widget when added
  // You shouldn't use `defaultConfig` with this
  needsUserConfig: true,
  // (Optional) Display prompts to configure the widget
  onConfigOpen: async ({ context }) => {
    return {
      prompts: [
        {
          name: 'url',
          type: 'input',
          message: 'org.vue.widgets.news.prompts.url',
          validate: input => !!input // Required
        }
      ]
    }
  }
})
```

Note: `registerWidget` can be namespaced with `api.namespace()`.

## Other methods

### hasPlugin

Returns `true` if the project uses the plugin.

```js
api.hasPlugin('eslint')
api.hasPlugin('apollo')
api.hasPlugin('vue-cli-plugin-apollo')
```

### getCwd

Retrieve the current working directory.

```js
api.getCwd()
```

### resolve

Resolves a file within the current project.

```js
api.resolve('src/main.js')
```

### getProject

Get currently open project.

```js
api.getProject()
```

### requestRoute

Switch the user on a specific route in the web client.

```js
api.requestRoute({
  name: 'foo',
  params: {
    id: 'bar'
  }
})

api.requestRoute('/foobar')
```

## Public static files

You may need to expose some static files over the cli-ui builtin HTTP server (typically if you want to specify an icon to a custom view).

Any file in an optional `ui-public` folder in the root of the plugin package folder will be exposed to the `/_plugin/:id/*` HTTP route.

For example, if you put a `my-logo.png` file into the `vue-cli-plugin-hello/ui-public/` folder, it will be available with the `/_plugin/vue-cli-plugin-hello/my-logo.png` URL when the cli-ui loads the plugin.

```js
api.describeConfig({
  /* ... */
  // Custom image
  icon: '/_plugin/vue-cli-plugin-hello/my-logo.png'
})
```
