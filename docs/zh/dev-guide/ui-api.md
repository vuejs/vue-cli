# UI API

这个 cli-ui 暴露一个 API，允许增强项目的配置和任务，也可以分享数据和在进程间进行通信。

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

## 项目的配置

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

可以是一个 [Material 图标](https://material.io/tools/icons)代码或一个自定义的图片 (详见[公共静态文件](#公共静态文件))：

```js
api.describeConfig({
  /* ... */
  // 配置图标
  icon: 'application_settings'
})
```

如果你没有定义图标，那就展示该插件可能存在的 logo (详见 [Logo](#logo))。

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

- `prompts`: 当前提示符们的运行时对象 (详见下方)
- `answers`: 来自用户输入的回答数据
- `data`: 从配置文件读取的只读的初始化数据
- `files`: 被找到的文件的描述器 (`{ type: 'json', path: '...' }`)
- `cwd`: 当前工作目录
- `api`: `onWrite API` (详见下方)

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

## 项目的任务

![任务 UI](/tasks-ui.png)

任务是从项目 `package.json` 文件的 `scripts` 字段生成的。

因为有 `api.describeTask` 方法，你可以为任务“增强”额外的信息和钩子：

```js
api.describeTask({
  // 用于匹配脚本命令的 RegExp 对象，来选择要被描述的任务
  match: /vue-cli-service serve/,
  description: 'Compiles and hot-reloads for development',
  // “More info”链接
  link: 'https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#serve'
})
```

### 任务图标

可以是一个 [Material 图标](https://material.io/tools/icons)代码或一个自定义的图片 (详见[公共静态文件](#公共静态文件))：

```js
api.describeTask({
  /* ... */
  // 任务图标
  icon: 'application_settings'
})
```

如果你没有定义图标，那就展示该插件可能存在的 logo (详见 [Logo](#logo))。

### 任务参数

你可以添加提示符来修改命令参数。它们会展示在一个“参数”模态框中。

Example:

```js
api.describeTask({
  // ...

  // 选填参数 (inquirer 提示符)
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

详见[提示符](#提示符)。

### 任务钩子

有一些钩子是可用的：

- `onBeforeRun`
- `onRun`
- `onExit`

例如，你可以将 (上述) 提示符的回答作为一个新参数添加到命令上：

```js
api.describeTask({
  // ...

  // 钩子
  // 在这里修改参数
  onBeforeRun: async ({ answers, args }) => {
    // 参数
    if (answers.open) args.push('--open')
    if (answers.mode) args.push('--mode', answers.mode)
    args.push('--dashboard')
  },
  // 任务运行之后立即执行
  onRun: async ({ args, child, cwd }) => {
    // child: Node 子进程
    // cwd: 进程所在目录
  },
  onExit: async ({ args, child, cwd, code, signal }) => {
    // code: 退出码
    // signal: 可能会被使用的杀进程信号
  }
})
```

### 任务视图

你可以在任务详情面板中使用 `ClientAddon` API 展示自定义视图：

```js
api.describeTask({
  // ...

  // 额外的视图 (例如 webpack 仪表盘)
  // 默认情况下，这里是展示终端输出的 `output` 视图
  views: [
    {
      // 唯一 ID
      id: 'vue-webpack-dashboard-client-addon',
      // 按钮文字
      label: 'Dashboard',
      // 按钮图标
      icon: 'dashboard',
      // 要加载的动态组件 (详见下述“客户端 addon”章节)
      component: 'vue-webpack-dashboard'
    }
  ],
  // 展示任务详情时默认选择的视图 (默认是 `output`)
  defaultView: 'vue-webpack-dashboard-client-addon'
})
```

详见[客户端 addon](#客户端-addon)。


### 新增任务

你也可以不使用 `api.describeTask`，而是通过 `api.addTask` 添加一个 `package.json` 脚本中没有的全新任务。这些任务只会出现在 cli UI 中。

**你需要提供一个 `command` 选项替代掉 `match` 选项。**

示例：

```js
api.addTask({
  // 必填
  name: 'inspect',
  command: 'vue-cli-service inspect',
  // 选填
  // 其余部分类似 `describeTask` 但是没有 `match` 选项
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

::: warning 警告
`command` 将会运行一个 Node 上下文。也就是说你可以像在 `package.json` 脚本中一样调用 Node 的 bin 命令。
:::

## 提示符

提示符对象必须是合法的 [inquirer](https://github.com/SBoudrias/Inquirer.js) 对象。

不过你也可以添加下列额外的字段 (只会被 UI 使用的可选项)：

```js
{
  /* ... */
  // 用来将提示符按章节分组
  group: 'Strongly recommended',
  // 附加描述
  description: 'Enforce attribute naming style in template (`my-prop` or `myProp`)',
  // “More info”链接
  link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/attribute-hyphenation.md',
}
```

支持的 inquirer 类型有：`checkbox`、`confirm`、`input`、`password`、`list`、`rawlist`。

此外，UI 还支持了仅在这里工作的特殊类型：

- `color`：展示一个取色器。

### Switch 示例

```js
{
  name: 'open',
  type: 'confirm',
  default: false,
  description: 'Open the app in the browser'
}
```

### Select 示例

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

### Input 示例

```js
{
  name: 'host',
  type: 'input',
  default: '0.0.0.0',
  description: 'Host for the development server'
}
```

### Checkbox 示例

展示多个 switch。

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

### 取色器示例

```js
{
  name: 'themeColor',
  type: 'color',
  message: 'Theme color',
  description: 'This is used to change the system UI color around the app',
  default: '#4DBA87'
}
```

### 提示符的改进

在 vue-cli 插件中，你可能已经有一个 `prompts.js` 文件，在 (用 CLI 或 UI) 安装该插件的时候询问用户一些问题。你可以向那些提示符对象额外添加只支持 UI 的上述字段，这样的话如果用户使用 UI 的话可以看到更多的信息。

::: warning 警告
目前，那些不支持的 inquirer 类型不会在 UI 中正常工作。
:::

## 客户端 addon

客户端 addon 是一个动态加载到 cli-ui 中的 JS 包。用于加载自定义组件和路由。

### 创建一个客户端 addon

推荐的创建一个客户端 addon 的方式是通过 vue-cli 3 创建一个新项目。你也可以在插件的子目录或不同的 npm 包中这样做。

作为开发依赖安装 `@vue/cli-ui`。

然后添加一个 `vue.config.js` 文件并附带以下内容：

```js
const { clientAddonConfig } = require('@vue/cli-ui')

module.exports = {
  ...clientAddonConfig({
    id: '<client-addon-id>',
    // 开发环境端口 (默认值 8042)
    port: 8042
  })
}
```

这个 `clientAddonConfig` 方法将会生成需要的 vue-cli 配置。除此之外，它会禁用 CSS extraction 并将代码输出到在客户端 addon 目录的 `./dist/index.js`。

::: warning 警告
不要忘记将 `id` 字段替换里的 `<client-addon-id>` 为你的新客户端 addon 的 id！
:::

然后修改 `.eslintrc.json` 文件以添加一些允许的全局对象：

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

你现在可以在开发环境下运行 `serve` 脚本，也可以在准备发布时运行 `build` 脚本。

### ClientAddonApi

在客户端 addon 资源中打开 `main.js` 文件并删除所有代码。

::: warning 警告
别在客户端 addon 源文件总导入 Vue ，请从浏览器 `window` 使用全局的 `Vue` 对象。
:::

这里是一个 `main.js` 的示例代码：

```js
import VueProgress from 'vue-progress-path'
import WebpackDashboard from './components/WebpackDashboard.vue'
import TestView from './components/TestView.vue'

// 你可以安装额外的 Vue 插件
// 使用全局的 'Vue' 变量
Vue.use(VueProgress, {
  defaultShape: 'circle'
})

// 注册一个自定义组件
// (工作原理类似 'Vue.component')
ClientAddonApi.component('vue-webpack-dashboard', WebpackDashboard)

// 在 vue-router 中为 /addon/<id> 添加子路由。
// 例如，addRoutes('foo', [ { path: '' }, { path: 'bar' } ])
// 将会向路由器添加 /addon/foo/ 和 /addon/foo/bar。
// 我们在此用 'test-webpack-route' 名称创建一个新的 '/addon/vue-webpack/' 路由
ClientAddonApi.addRoutes('vue-webpack', [
  { path: '', name: 'test-webpack-route', component: TestView }
])

// 你可以翻译插件组件
// (通过使用 vue-i18n) 加载语言文件
const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
locales.keys().forEach(key => {
  const locale = key.match(/([a-z0-9]+)\./i)[1]
  ClientAddonApi.addLocalization(locale, locales(key))
})
```

cli-ui 在 `window` 作用域内注册了 `Vue` 和 `ClientAddonApi` 作为全局变量。

你可以在自己的组件里使用 [@vue/ui](https://github.com/vuejs/ui) 和 [@vue/cli-ui](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-ui/src/components) 所有的组件和 CSS class 以保持样式和体验的一致性。你也可以用内置的 [vue-i18n](https://github.com/kazupon/vue-i18n) 翻译字符串。

### 注册客户端 addon

回到 `ui.js` 文件，使用 `api.addClientAddon` 方法并带一个指向构建后的文件夹的 require 字符串：

```js
api.addClientAddon({
  id: 'vue-webpack',
  // 包含构建出来的 JS 文件的文件夹
  path: '@vue/cli-ui-addon-webpack/dist'
})
```

这会使用 Node.js 的 `require.resolve` API 查找文件夹并为从客户端 addon 构建的文件 `index.js` 启动一个服务器。

或者当开发插件时指定一个 URL (理想中你需要在 Vue 的测试项目的 `vue-cli-ui.js` 中做这些)

```js
// 用于开发环境
// 如果已经在插件中定义过，则会覆写路径
api.addClientAddon({
  id: 'vue-webpack',
  // 使用你之前配置过低同样的端口
  url: 'http://localhost:8042/index.js'
})
```

### 使用客户端 addon

现在你可以在这些视图中使用客户端 addon 了。例如，你可以在一个被描述的任务中指定一个视图：

```js
api.describeTask({
  /* ... */
  // 额外的视图 (例如 webpack dashboard)
  // 默认情况下，这是展示终端输出的 'output' 视图
  views: [
    {
      // 唯一的 ID
      id: 'vue-webpack-dashboard-client-addon',
      // 按钮文字
      label: 'Dashboard',
      // 按钮图标 (material-icons)
      icon: 'dashboard',
      // 加载的动态组件，会用 ClientAddonApi 进行注册
      component: 'vue-webpack-dashboard'
    }
  ],
  // 展示任务详情时默认选择的视图 (默认情况下就是 output)
  defaultView: 'vue-webpack-dashboard-client-addon'
})
```

这是一个客户端 addon 代码，注册了 `'vue-webpack-dashboard' 组件 (像我们之前看到的一样)：

```js
/* 在 `main.js` 中 */
// 导入组件
import WebpackDashboard from './components/WebpackDashboard.vue'
// 注册自定义组件
// (工作原理类似 'Vue.component')
ClientAddonApi.component('vue-webpack-dashboard', WebpackDashboard)
```

![任务视图示例](/task-view.png)

## Custom views

You can add a new view below the standard 'Project plugins', 'Project configuration' and 'Project tasks' ones using the `api.addView` method:

```js
api.addView({
  // Unique id
  id: 'vue-webpack-test-view',

  // Route name (from vue-router)
  // Use the same name used in the 'ClientAddonApi.addRoutes' method (see above in the Client addon section)
  name: 'test-webpack-route',

  // Button icon (material-icons)
  icon: 'pets',
  // You can also specify a custom image (see Public static files section below):
  // icon: 'http://localhost:4000/_plugin/%40vue%2Fcli-service/webpack-icon.svg',

  // Button tooltip
  tooltip: 'Test view from webpack addon'
})
```

Here is the code in the client addon that register the `'test-webpack-route'` (like we saw earlier):

```js
/* In `main.js` */
// Import the component
import TestView from './components/TestView.vue'
// Add routes to vue-router under a /addon/<id> parent route.
// For example, addRoutes('foo', [ { path: '' }, { path: 'bar' } ])
// will add the /addon/foo/ and the /addon/foo/bar routes to vue-router.
// Here we create a new '/addon/vue-webpack/' route with the 'test-webpack-route' name
ClientAddonApi.addRoutes('vue-webpack', [
  { path: '', name: 'test-webpack-route', component: TestView }
])
```

![Custom view example](/custom-view.png)

## Shared data

Use Shared data to communicate info with custom components in an easy way.

> For example, the Webpack dashboard shares the build stats between the UI client and the UI server using this API.

In the plugin `ui.js` (nodejs):

```js
// Set or update
api.setSharedData('my-variable', 'some-data')

// Get
const sharedData = api.getSharedData('my-variable')
if (sharedData) {
  console.log(sharedData.value)
}

// Remove
api.removeSharedData('my-variable')

// Watch for changes
const watcher = (value, id) => {
  console.log(value, id)
}
api.watchSharedData('my-variable', watcher)
// Unwatch
api.unwatchSharedData('my-variable', watcher)

// Namespaced versions
const {
  setSharedData,
  getSharedData,
  removeSharedData,
  watchSharedData,
  unwatchSharedData
} = api.namespace('webpack-dashboard-')
```

In the custom component:

```js
// Vue component
export default {
  // Sync Shared data
  sharedData () {
    return {
      // You can use `status` in template
      status: `webpack-dashboard-${this.mode}-status`
      // You can also map namespaced Shared data
      ...mapSharedData('webpack-dashboard-', {
        status: `${this.mode}-status`,
        progress: `${this.mode}-progress`,
        operations: `${this.mode}-operations`
      })
    }
  },

  // Manual methods
  async created () {
    const value = await this.$getSharedData('my-variable')

    this.$watchSharedData(`my-variable`, value => {
      console.log(value)
    })

    await this.$setSharedData('my-variable', 'new-value')
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
    message: 'my-message'
  }
}
</script>
```

This is very usefull if you create a settings component for example.

## Plugin actions

Plugin actions are calls sent between the cli-ui (browser) and plugins (nodejs).

> For example, you might have a button in a custom component (see [Client addon](#client-addon)) which calls some nodejs code on the server using this API.

In the `ui.js` file in the plugin (nodejs), you can use two methods from `PluginApi`:

```js
// Call an action
api.callAction('other-action', { foo: 'bar' }).then(results => {
  console.log(results)
}).catch(errors => {
  console.error(errors)
})
```

```js
// Listen for an action
api.onAction('test-action', params => {
  console.log('test-action called', params)
})
```

You can use namespaced versions with `api.namespace` (similar to Shared data):

```js
const { onAction, callAction } = api.namespace('vue-webpack-')
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
      this.$callPluginAction('test-action', {
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

// Connect to the vue-cli IPC network
ipc.connect()

function sendMessage (data) {
  // Send a message to the cli-ui server
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

// Listen for message
ipc.on(messageHandler)

// Don't listen anymore
ipc.off(messageHandler)

function cleanup () {
  // Disconnect from the IPC network
  ipc.disconnect()
}
```

In a vue-cli plugin `ui.js` file, you can use the `ipcOn`, `ipcOff` and `ipcSend` methods:

```js
function onWebpackMessage ({ data: message }) {
  if (message.webpackDashboardData) {
    console.log(message.webpackDashboardData)
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
api.storageSet('my-plugin.an-id', { some: 'value' })

// Retrieve a value from the local DB
console.log(api.storageGet('my-plugin.an-id'))

// Full lowdb instance
api.db.get('posts')
  .find({ title: 'low!' })
  .assign({ title: 'hi!'})
  .write()

// Namespaced helpers
const { storageGet, storageSet } = api.namespace('my-plugin.')
```

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

## 钩子

钩子可以用来响应某些 cli-ui 的事件。

### onProjectOpen

当插件在当前项目中第一次被加载时触发。

```js
api.onProjectOpen((project, previousProject) => {
  // 重置数据
})
```

### onPluginReload

当插件被重新加载时触发。

```js
api.onPluginReload((project) => {
  console.log('plugin reloaded')
})
```

### onConfigRead

当一个配置界面被打开或刷新时触发。

```js
api.onConfigRead(({ config, data, onReadData, tabs, cwd }) => {
  console.log(config.id)
})
```

### onConfigWrite

当用户在保存界面里保存时触发。

```js
api.onConfigWrite(({ config, data, changedFields, cwd }) => {
  // ...
})
```

### onTaskOpen

当用户打开一项任务的详情面板时触发。

```js
api.onTaskOpen(({ task, cwd }) => {
  console.log(task.id)
})
```

### onTaskRun

当用户运行一项任务时触发。

```js
api.onTaskRun(({ task, args, child, cwd }) => {
  // ...
})
```

### onTaskExit

当一项任务退出时触发。不论任务成功或失败它都会触发。

```js
api.onTaskExit(({ task, args, child, signal, code, cwd }) => {
  // ...
})
```

### onViewOpen

当用户打开一个视图 (如 'Plugins'、'Configurations' 或 'Tasks') 时触发。

```js
api.onViewOpen(({ view, cwd }) => {
  console.log(view.id)
})
```

## 建议

这里的建议是指为用户提议执行 action 的按钮。它们展示在界面的顶栏上。例如我们可以放一个按钮，在应用里没有检测到 Vue Router 包的时候建议将其安装。

```js
api.addSuggestion({
  id: 'my-suggestion',
  type: 'action', // 必填 (未来会加入更多类型)
  label: 'Add vue-router',
  // 该消息会展示在一个详情模态框里
  message: 'A longer message for the modal',
  link: 'http://link-to-docs-in-the-modal',
  // 可选的图片
  image: '/_plugin/my-package/screenshot.png',
  // 当该项建议被用户激活时调用的函数
  async handler () {
    // ...
    return {
      // 默认移除这个按钮
      keep: false
    }
  }
})
```

![UI 建议](/suggestion.png)

之后你可以移除这项建议：

```js
api.removeSuggestion('my-suggestion')
```

你也可以给建议附带 `actionLink`，当用户激活它时，会换做打开一个页面：

```js
api.addSuggestion({
  id: 'my-suggestion',
  type: 'action', // Required
  label: 'Add vue-router',
  // 打开一个新标签
  actionLink: 'https://vuejs.org/'
})
```

通常情况下，你会选择适当的上下文用钩子来展示建议：

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

在这个例子中，如果 Vue Router 没有安装好，我们只会在插件视图中展示安装 Vue Router 的建议。

::: tip 注意
`addSuggestion` 和 `removeSuggestion` 可以通过 `api.namespace()` 指定命名空间。
:::

## 其它方法

### hasPlugin

如果项目使用了该插件则返回 `true`。

```js
api.hasPlugin('eslint')
api.hasPlugin('apollo')
api.hasPlugin('vue-cli-plugin-apollo')
```

### getCwd

获取当前工作目录。

```js
api.getCwd()
```

## 公共静态文件

你可能需要在 cli-ui 内建的 HTTP 服务器上暴露一些静态文件 (通常是为自定义视图指定图标)。

在插件包跟目录里可选的放置一个 `ui-public` 文件夹，这个文件夹里的任何文件都会暴露至 `/_plugin/:id/*` 的 HTTP 路由。

例如，如果你将 `my-logo.png` 文件放置到 `my-package/ui-public` 文件夹，那么 cli-ui 加载插件的时候可以通过 `/_plugin/my-package/my-logo.png` 这个 URL 来访问它。

```js
api.describeConfig({
  /* ... */
  // 自定义图片
  icon: '/_plugin/my-package/my-logo.png'
})
```
