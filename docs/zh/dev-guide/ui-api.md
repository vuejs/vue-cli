# UI API

这个 cli-ui 暴露一个 API，允许增强项目的配置和任务，也可以分享数据和在进程间进行交流。

![UI 插件架构](/vue-cli-ui-schema.png)

## UI 文件

在每个安装好的 vue-cli 插件里，cli-ui 都会尝试从其插件的根目录加载一个可选的 `ui.js` 文件。你也可以在用户项目的根目录尝试加载一个 `vue-cli-ui.js` 文件以使得 UI 可以基于每个项目的基础进行手动扩展 (对于快速创建插件原型来说也非常有用)。注意你也可以使用文件夹 (例如 `ui/index.js`)。

该文件应该导出一个函数，函数会以 API 对象作为第一个参数：

```js
module.exports = api => {
  // 在这里使用 API...
}
```

::: warning 警告
当试图在“项目插件 (Project plugins)”中获取插件列表时，这些文件将会被重新加载。点击 UI 左侧边栏导航“项目插件 (Project plugins)”按钮可以应用更改。
:::

这里是一个使用 UI API 的 vue-cli 插件的文件夹结构示例：

```
- vue-cli-plugin-test
  - package.json
  - index.js
  - generator.js
  - prompts.js
  - ui.js
  - logo.png
```

## 开发模式

当构建你自己的插件时，你可能想在开发环境下运行 cli-ui，所以这样运行会输出较为实用的日志：

```
vue ui --dev
```

或：

```
vue ui -D
```

## 项目配置

![配置 UI](/config-ui.png)

你可以通过 `api.describeConfig` 方法添加一个项目配置。

首先你需要传入一些信息：

```js
api.describeConfig({
  // 唯一的配置 ID
  id: 'eslintrc',
  // 展示名称
  name: 'ESLint configuration',
  // 展示在名称下方的描述
  description: 'Error checking & Code quality',
  // “更多信息 (More info)”链接
  link: 'https://eslint.org'
})
```

### 配置图标

可以是一个 [Material 图标](https://material.io/tools/icons)代码或一个自定义的图片 (查阅[公共静态文件](#公共静态文件))：

```js
api.describeConfig({
  /* ... */
  // 配置图标
  icon: 'application_settings'
})
```

如果你没有定义图标，那就展示该插件可能存在的 logo (见 [Logo](#logo))。

### 配置文件

默认情况下，配置 UI 可能会读写一个或多个配置文件，例如 `.eslintrc` 和 `vue.config.js`。

你可以提供可能需要在用户项目中检测的文件：

```js
api.describeConfig({
  /* ... */
  // 该配置所有可能的文件
  files: {
    // eslintrc.js
    eslint: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      // 会从 `package.json` 读取
      package: 'eslintConfig'
    },
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

支持的类型有：`json`、`yaml`、`js`、`package`。这个顺序是很重要的：如果这项配置不存在，则会创建列表中的第一个文件。

### 展示配置提示符

使用 `onRead` 钩子来返回一个提示符列表，用以配置展示：

```js
api.describeConfig({
  /* ... */
  onRead: ({ data, cwd }) => ({
    prompts: [
      // 提示符对象
    ]
  })
})
```

这些提示符会展示在配置的详情面板中。

查阅[提示符](#提示符)了解更多信息。

这个 `data` 对象包含了每个配置文件内容的 JSON 结果。

例如，假设用户在其项目中的 `vue.config.js` 有以下内容：

```js
module.exports = {
  lintOnSave: false
}
```

我们在插件中像这样声明配置文件：

```js
api.describeConfig({
  /* ... */
  // 该配置所有可能的文件
  files: {
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

则这个 `data` 对象会是：

```js
{
  // 文件
  vue: {
    // 文件数据
    lintOnSave: false
  }
}
```

多个文件的例子：如果我们在用户的项目中添加以下 `eslintrc.js` 文件：

```js
module.exports = {
  root: true,
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ]
}
```

那么在我们的插件中将 `files` 选项改变成为：

```js
api.describeConfig({
  /* ... */
  // 该配置所有可能的文件
  files: {
    // eslintrc.js
    eslint: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      // 会从 `package.json` 读取
      package: 'eslintConfig'
    },
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

则这个 `data` 对象会是：

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

### 配置选项卡

你可以将这些提示符组织成为几个选项卡：

```js
api.describeConfig({
  /* ... */
  onRead: ({ data, cwd }) => ({
    tabs: [
      {
        id: 'tab1',
        label: 'My tab',
        // 可选的
        icon: 'application_settings',
        prompts: [
          // 提示符对象们
        ]
      },
      {
        id: 'tab2',
        label: 'My other tab',
        prompts: [
          // 提示符对象们
        ]
      }
    ]
  })
})
```

### 保存配置变更

使用 `onWrite` 钩子将数据写入配置文件 (或者执行任何 Node.js 代码)：

```js
api.describeConfig({
  /* ... */
  onWrite: ({ prompts, answers, data, files, cwd, api }) => {
    // ...
  }
})
```

参数：

- `prompts`: 当前提示符们的运行时对象 (见下方)
- `answers`: 来自用户输入的回答数据
- `data`: 从配置文件读取的只读的初始化数据
- `files`: 被找到的文件的描述器 (`{ type: 'json', path: '...' }`)
- `cwd`: 当前工作目录
- `api`: `onWrite API` (见下方)

提示符的运行时对象：

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
  // 当前值 (未被过滤的)
  value: null,
  // 如果用户修改过了则为 true
  valueChanged: false,
  error: null,
  tabId: null,
  // 原始的 inquirer 提示符对象
  raw: data
}
```

`onWrite` API:

- `assignData(fileId, newData)`: 在写入前使用 `Object.assign` 来更新配置文件。
- `setData(fileId, newData)`: `newData` 的每个 key 在写入之前都将会被深设置在配置数据上 (或当值为 `undefined` 时被移除)。
- `async getAnswer(id, mapper)`: 为一个给定的提示符 id 获取答复并通过可能提供了的 `mapper` 函数 (例如 `JSON.parse`) 进行 map 处理。

示例 (来自 ESLint 插件)：

```js
api.describeConfig({
  // ...

  onWrite: async ({ api, prompts }) => {
    // 更新 ESLint 规则
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

### Task icon

It can be either a [Material icon](https://material.io/tools/icons) code or a custom image (see [Public static files](#public-static-files)):

```js
api.describeTask({
  /* ... */
  // Task icon
  icon: 'application_settings'
})
```

If you don't specify an icon, the plugin logo will be displayed if any (see [Logo](#logo)).

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
  // Immediatly after running the task
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

Supported inquirer types: `checkbox`, `confirm`, `input`, `password`, `list`, `rawlist`.

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

The recommended way to create a Client addon is by creating a new project using vue-cli 3. You can either do this in a subfolder of your plugin or in a different npm package.

Install `@vue/cli-ui` as a dev dependency.

Then add a `vue.config.js` file with the following content:

```js
const { clientAddonConfig } = require('@vue/cli-ui')

module.exports = {
  ...clientAddonConfig({
    id: '<client-addon-id>',
    // Development port (default 8042)
    port: 8042
  })
}
```

The `clientAddonConfig` method will generate the needed vue-cli configuration. Among other things, it disables CSS extraction and outputs the code to `./dist/index.js` in the client addon folder.

**⚠️ Don't forget to replace `<client-addon-id>` in the `id` field with the id of your new client addon!**

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
ClientAddonApi.component('vue-webpack-dashboard', WebpackDashboard)

// Add routes to vue-router under a /addon/<id> parent route.
// For example, addRoutes('foo', [ { path: '' }, { path: 'bar' } ])
// will add the /addon/foo/ and the /addon/foo/bar routes to vue-router.
// Here we create a new '/addon/vue-webpack/' route with the 'test-webpack-route' name
ClientAddonApi.addRoutes('vue-webpack', [
  { path: '', name: 'test-webpack-route', component: TestView }
])

// You can translate your plugin components
// Load the locale files (uses vue-i18n)
const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
locales.keys().forEach(key => {
  const locale = key.match(/([a-z0-9]+)\./i)[1]
  ClientAddonApi.addLocalization(locale, locales(key))
})
```

The cli-ui registers `Vue` and `ClientAddonApi` as global variables in the `window` scope.

In your components, you can use all the components and the CSS classes of [@vue/ui](https://github.com/vuejs/ui) and [@vue/cli-ui](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-ui/src/components) in order to keep the look and feel consistent. You can also translate the strings with [vue-i18n](https://github.com/kazupon/vue-i18n) which is included.
### Register the client addon

Back to the `ui.js` file, use the `api.addClientAddon` method with a require query to the built folder:

```js
api.addClientAddon({
  id: 'vue-webpack',
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
  id: 'vue-webpack',
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
      id: 'vue-webpack-dashboard-client-addon',
      // Button label
      label: 'Dashboard',
      // Button icon (material-icons)
      icon: 'dashboard',
      // Dynamic component to load, registered using ClientAddonApi
      component: 'vue-webpack-dashboard'
    }
  ],
  // Default selected view when displaying the task details (by default it's the output)
  defaultView: 'vue-webpack-dashboard-client-addon'
})
```

Here is the client addon code that register the `'vue-webpack-dashboard'` component (like we saw earlier):

```js
/* In `main.js` */
// Import the component
import WebpackDashboard from './components/WebpackDashboard.vue'
// Register a custom component
// (works like 'Vue.component')
ClientAddonApi.component('vue-webpack-dashboard', WebpackDashboard)
```

![Task view example](/task-view.png)

## 自定义视图

你可以使用 `api.addView` 方法在标准的“Project plugins”、“Project configuration”和“Project tasks”之下添加一个新的视图：

```js
api.addView({
  // 唯一的 id
  id: 'vue-webpack-test-view',

  // 路由名称 (来自 Vue Router)
  // 使用 'ClientAddonApi.addRoutes' 方法中相同的名字 (详见之前的客户端 addon 章节)
  name: 'test-webpack-route',

  // 按钮图标 (material-icons)
  icon: 'pets',
  // 你也可以指定一个自定义图片 (详见之前的公共静态文件章节)：
  // icon: 'http://localhost:4000/_plugin/%40vue%2Fcli-service/webpack-icon.svg',

  // 按钮的提示文字
  tooltip: 'Test view from webpack addon'
})
```

这里是注册了 `'test-webpack-route'` 的客户端 addon 里的代码：

```js
/* 在 `main.js` 里 */
// 导入组件
import TestView from './components/TestView.vue'
// 为 Vue Router 添加一个基于 /addon/<id> 的路由。
// 例如，addRoutes('foo', [ { path: '' }, { path: 'bar' } ])
// 将为 Vue Router 添加 /addon/foo/ 和 /addon/foo/bar 路由。
// 我们这里创建一个新的 '/addon/vue-webpack/' 路由，并命名为 'test-webpack-route'。
ClientAddonApi.addRoutes('vue-webpack', [
  { path: '', name: 'test-webpack-route', component: TestView }
])
```

![自定义视图示例](/custom-view.png)

## 共享的数据

一种简易的自定义组件之间通过共享的数据互通信息的方式。

> 例如，webpack 仪表盘在 UI 客户端和 UI 服务端之间通过这个 API 共享了构建的统计信息。

在插件 `ui.js` (Node.js) 中：

```js
// 设置或更新
api.setSharedData('my-variable', 'some-data')

// 获取
const sharedData = api.getSharedData('my-variable')
if (sharedData) {
  console.log(sharedData.value)
}

// 移除
api.removeSharedData('my-variable')

// 侦听变化
const watcher = (value, id) => {
  console.log(value, id)
}
api.watchSharedData('my-variable', watcher)
// 取消侦听
api.unwatchSharedData('my-variable', watcher)

// 带命名空间的版本
const {
  setSharedData,
  getSharedData,
  removeSharedData,
  watchSharedData,
  unwatchSharedData
} = api.namespace('webpack-dashboard-')
```

在其自定义组件中：

```js
// Vue 组件
export default {
  // 同步共享的数据
  sharedData () {
    return {
      // 你可以在模板中使用 `status`
      status: `webpack-dashboard-${this.mode}-status`
      // 也可以映射带命名空间的共享数据
      ...mapSharedData('webpack-dashboard-', {
        status: `${this.mode}-status`,
        progress: `${this.mode}-progress`,
        operations: `${this.mode}-operations`
      })
    }
  },

  // 手动方法
  async created () {
    const value = await this.$getSharedData('my-variable')

    this.$watchSharedData(`my-variable`, value => {
      console.log(value)
    })

    await this.$setSharedData('my-variable', 'new-value')
  }
}
```

如果你使用了 `sharedData` 选项，共享的数据就可以一个相应的属性被赋值时进行更新。

```html
<template>
  <VueInput v-model="message"/>
</template>

<script>
export default {
  sharedData: {
    // 将会在服务端同步 'my-message' 共享的数据
    message: 'my-message'
  }
}
</script>
```

例如在创建一个设置组件时，这个特性是非常有用的。

## 插件的 action

插件的 action 就是在 cli-ui (浏览器) 和插件 (Node.js) 直接的调用。

> 例如，你可能有一个自定义组件里的按钮 (详见[客户端 addon](#客户端-addon))，这个按钮会通过这个 API 向服务端调用一些 Node.js 代码。

在插件 (Node.js) 的 `ui.js` 文件里，你可以从 `PluginApi` 使用两个方法：

```js
// 调用一个 action
api.callAction('other-action', { foo: 'bar' }).then(results => {
  console.log(results)
}).catch(errors => {
  console.error(errors)
})
```

```js
// 监听一个 action
api.onAction('test-action', params => {
  console.log('test-action called', params)
})
```

你可以通过 `api.namespace` 使用带命名空间的版本 (类似共享的数据)：

```js
const { onAction, callAction } = api.namespace('vue-webpack-')
```

在客户端 addon 组件 (浏览器) 中，你可以访问 `$onPluginActionCalled`、`$onPluginActionResolved` 和 `$callPluginAction`：

```js
// Vue 组件
export default {
  created () {
    this.$onPluginActionCalled(action => {
      // 当 action 被调用时
      // 且在运行之前
      console.log('called', action)
    })
    this.$onPluginActionResolved(action => {
      // 当 action 运行完毕之后
      console.log('resolved', action)
    })
  },

  methods: {
    testPluginAction () {
      // 调用一个插件的 action
      this.$callPluginAction('test-action', {
        meow: 'meow'
      })
    }
  }
}
```

## 进程间通信 (IPC)

IPC 就是进程间通信 (Inter-Process Communication) 的缩写。该系统允许你轻松的从子进程 (例如任务) 发送消息，并且轻量快速。

> 为了在 webpack 仪表盘 UI 上展示数据，`@vue/cli-service` 的 `serve` 和 `build` 命令会在 `--dashboard` 参数被传入时向 cli-ui Node.js 服务器发送 IPC 消息。

在进程代码中 (可以是一个 webpack 插件或一个 Node.js 的任务脚步)，你可以使用 `@vue/cli-shared-utils` 中的 `IpcMessenger` 类：

```js
const { IpcMessenger } = require('@vue/cli-shared-utils')

// 创建一个新的 IpcMessenger 实例
const ipc = new IpcMessenger()

// 连接到 vue-cli IPC 网络
ipc.connect()

function sendMessage (data) {
  // 发送一条消息给 cli-ui 服务器
  ipc.send({
    webpackDashboardData: {
      type: 'build',
      value: data
    }
  })
}

function messageHandler (data) {
  console.log(data)
}

// 监听消息
ipc.on(messageHandler)

// 不再监听
ipc.off(messageHandler)

function cleanup () {
  // 从 IPC 网络断开连接
  ipc.disconnect()
}
```

在一个 vue-cli 插件的 `ui.js` 文件中，你可以使用 `ipcOn`、`ipcOff` 和 `ipcSend` 方法：

```js
function onWebpackMessage ({ data: message }) {
  if (message.webpackDashboardData) {
    console.log(message.webpackDashboardData)
  }
}

// 监听任何 IPC 消息
api.ipcOn(onWebpackMessage)

// 不监听任何消息
api.ipcOff(onWebpackMessage)

// 向所有已连接的 IpcMessenger 实例发送一条消息
api.ipcSend({
  webpackDashboardMessage: {
    foo: 'bar'
  }
})
```

## 本地存储

一个插件可以从 UI 服务器本地的 [lowdb](https://github.com/typicode/lowdb) 数据库保存和加载数据。

```js
// 向本地的数据库保存一个值
api.storageSet('my-plugin.an-id', { some: 'value' })

// 从本地的数据库取回一个值
console.log(api.storageGet('my-plugin.an-id'))

// 完整的 lowdb 实例
api.db.get('posts')
  .find({ title: 'low!' })
  .assign({ title: 'hi!'})
  .write()

// 带命名空间的辅助函数
const { storageGet, storageSet } = api.namespace('my-plugin.')
```

## Notification

你可以基于用户操作系统的 notification 系统展示 notification：

```js
api.notify({
  title: 'Some title',
  message: 'Some message',
  icon: 'path-to-icon.png'
})
```

这里有一些内建的图标；

- `'done'`
- `'error'`

## 进度界面

你可以用一些文字或进度条来展示进度界面：

```js
api.setProgress({
  status: 'Upgrading...',
  error: null,
  info: 'Step 2 of 4',
  progress: 0.4 // 从 0 到 1, -1 表示隐藏进度条
})
```

移除进度界面：

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
  id: 'my-suggestion',
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

![UI Suggestion](/suggestion.png)

Then you can remove the suggestion:

```js
api.removeSuggestion('my-suggestion')
```

You can also open a page instead when the user activates the suggestion with `actionLink`:

```js
api.addSuggestion({
  id: 'my-suggestion',
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
    if (!api.hasPlugin('vue-router')) {
      api.addSuggestion({
        id: ROUTER,
        type: 'action',
        label: 'cli-service.suggestions.vue-router-add.label',
        message: 'cli-service.suggestions.vue-router-add.message',
        link: 'https://router.vuejs.org/',
        async handler () {
          await install(api, 'vue-router')
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

## Public static files

You may need to expose some static files over the cli-ui builtin HTTP server (typically if you want to specify an icon to a custom view).

Any file in an optional `ui-public` folder in the root of the plugin package folder will be exposed to the `/_plugin/:id/*` HTTP route.

For example, if you put a `my-logo.png` file into the `my-package/ui-public/` folder, it will be available with the `/_plugin/my-package/my-logo.png` URL when the cli-ui loads the plugin.

```js
api.describeConfig({
  /* ... */
  // Custom image
  icon: '/_plugin/my-package/my-logo.png'
})
```
