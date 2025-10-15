---
sidebarDepth: 3
---

# 插件开发指南

## 开始

一个 CLI 插件是一个 npm 包，它能够为 Vue CLI 创建的项目添加额外的功能，这些功能包括：

- 修改项目的 webpack 配置 - 例如，如果你的插件希望去针对某种类型的文件工作，你可以为这个特定的文件扩展名添加新的 webpack 解析规则。比如说，`@vue/cli-plugin-typescript` 就添加这样的规则来解析 `.ts` 和 `.tsx` 扩展的文件；
- 添加新的 vue-cli-service 命令 - 例如，`@vue/cli-plugin-unit-jest` 添加了 `test:unit` 命令，允许开发者运行单元测试；
- 扩展 `package.json` - 当你的插件添加了一些依赖到项目中，你需要将他们添加到 package 的 dependencies 部分时，这是一个有用的选项；
- 在项目中创建新文件、或者修改老文件。有时创建一个示例组件或者通过给入口文件（main.js）添加导入（imports）是一个好的主意；
- 提示用户选择一个特定的选项 - 例如，你可以询问用户是否创建我们前面提到的示例组件。

:::tip
不要过度使用 vue-cli 插件！如果你仅希望包含特定的插件，例如，[Lodash](https://lodash.com/) - 相比创建一个特定的插件，通过 npm 手动安装更加简单。
:::

CLI 插件应该总是包含一个 [service 插件](#service-插件) 做为主的导出，并且他能够选择性的包含 [generator](#generator), [prompt 文件](#对话) 和 [Vue UI 集成](#ui-集成)。

作为一个 npm 包，CLI 插件必须有一个 `package.json` 文件。通常建议在 `README.md` 中包含插件的描述，来帮助其他人在 npm 上发现你的插件。

所以，通常的 CLI 插件目录结构看起来像下面这样：

```bash
.
├── README.md
├── generator.js  # generator（可选）
├── index.js      # service 插件
├── package.json
├── prompts.js    # prompt 文件（可选）
└── ui.js         # Vue UI 集成（可选）
```

## 命名和可发现性

为了让一个 CLI 插件在 Vue CLI 项目中被正常使用，它必须遵循 `vue-cli-plugin-<name>` 或者 `@scope/vue-cli-plugin-<name>` 这样的命名惯例。这样你的插件才能够：

- 被 `@vue/cli-service` 发现；
- 被其他开发者通过搜索发现；
- 通过 `vue add <name>` 或者 `vue invoke <name>` 安装。

:::warning Warning
确保插件的名字是正确的，否则他将不能通过 `vue add` 安装并且不能在 UI 插件中搜索得到！
:::

为了能够被用户在搜索时更好的发现，可以将插件的关键描述放到 `package.json` 文件的 `description` 字段中。

例如：

```json
{
  "name": "vue-cli-plugin-apollo",
  "version": "0.7.7",
  "description": "vue-cli plugin to add Apollo and GraphQL"
}
```

你应该在 `homepage` 或者 `repository` 字段添加创建插件的官网地址或者仓库的地址，这样你的插件详情里就会出现一个 `查看详情` 按钮：

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

插件的 Generator 部分通常在你想要为项目扩展包依赖，创建新的文件或者编辑已经存在的文件时需要。

在 CLI 插件内部，generator 应该放在 `generator.js` 或者 `generator/index.js` 文件中。它将在以下两个场景被调用：

- 项目初始创建期间，CLI 插件被作为项目创建 preset 的一部分被安装时。

- 当插件在项目创建完成和通过 `vue add` 或者 `vue invoke` 单独调用被安装时。

一个 generator 应该导出一个接收三个参数的函数：

1. 一个 [GeneratorAPI](/dev-guide/generator-api.md) 实例；

2. 插件的 generator 选项。这些选项在项目创建，或者从 `~/.vuerc` 载入预设时被解析。例如：如果保存的 `~/.vuerc` 像这样：

```json
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

如果用户使用 preset `foo` 创建了一个项目，那么 `@vue/cli-plugin-foo` 的 generator 就会收到 `{ option: 'bar' }` 作为第二个参数。

对于第三方插件，这个选项将在用户执行 `vue invoke` 时，从提示或者命令行参数中被解析(详见 [对话](#对话))。

3. 整个 preset (presets.foo) 将会作为第三个参数传入。

### 创建新的模板

当你调用 `api.render('./template')` 时，该 generator 将会使用 [EJS](https://github.com/mde/ejs) 渲染 `./template` 中的文件 (相对于 generator 中的文件路径进行解析)

想象我们正在创建 [vue-cli-auto-routing](https://github.com/ktsn/vue-cli-plugin-auto-routing) 插件，我们希望当插件在项目中被引用时做以下的改变：

- 创建一个 `layouts` 文件夹包含默认布局文件；
- 创建一个 `pages` 文件夹包含 `about` 和 `home` 页面；
- 在 `src` 文件夹中添加 `router.js` 文件

为了渲染这个结构，你需要在 `generator/template` 文件夹内创建它：

![Generator structure](/generator-template.png)

模板创建完之后，你应该在 `generator/index.js` 文件中添加 `api.render` 调用：

```js
module.exports = api => {
  api.render('./template')
}
```

### 编辑已经存在的模板

此外，你可以使用 YAML 前置元信息继承并替换已有的模板文件的一部分（即使来自另一个包）：

```ejs
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace: !!js/regexp /<script>[^]*?<\/script>/
---

<script>
export default {
  // 替换默认脚本
}
</script>
```

也可以替换多处，只不过你需要将替换的字符串包裹在 `<%# REPLACE %>` 和 `<%# END_REPLACE %>` 块中：

```ejs
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace:
  - !!js/regexp /Welcome to Your Vue\.js App/
  - !!js/regexp /<script>[^]*?<\/script>/
---

<%# REPLACE %>
替换欢迎信息
<%# END_REPLACE %>

<%# REPLACE %>
<script>
export default {
  // 替换默认脚本
}
</script>
<%# END_REPLACE %>
```

### 文件名的边界情况

如果你想要渲染一个以点开头的模板文件 (例如 `.env`)，则需要遵循一个特殊的命名约定，因为以点开头的文件会在插件发布到 npm 的时候被忽略：

```bash
# 以点开头的模板需要使用下划线取代那个点：

/generator/template/_env

# 当调用 api.render('./template') 时，它在项目文件夹中将被渲染为：

/generator/template/.env
```

同时这也意味着当你想渲染以下划线开头的文件时，同样需要遵循一个特殊的命名约定：

```bash
# 这种模板需要使用两个下划线来取代单个下划线：

/generator/template/__variables.scss

# 当调用 api.render('./template') 时，它在项目文件夹中将被渲染为：

/generator/template/_variable.scss
```

### 扩展包

如果你需要向项目中添加额外的依赖，创建一个 npm 脚本或者修改 `package.json` 的其他任何一处，你可以使用 API `extendPackage` 方法。

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

在上面这个例子中，我们添加了一个依赖：`vue-router-layout`。在插件调用时，这个 npm 模块将被安装，这个依赖将被添加到用户项目的 `package.json` 文件。

同样使用这个 API 我们可以添加新的 npm 任务到项目中。为了实现这个，我们需要定义一个任务名和一个命令，这样他才能够在用户 `package.json` 文件的 `scripts` 部分运行：

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

在上面这个例子中，我们添加了一个新的 `greet` 任务来执行一个创建在 [Service 部分](#添加一个新的-cli-service-命令) 的自定义 vue-cli 服务命令。

### 修改主文件

通过 generator 方法你能够修改项目中的文件。最有用的场景是针对 `main.js` 或 `main.ts` 文件的一些修改：新的导入，新的 `Vue.use()` 调用等。

让我们来思考一个场景，当我们通过 [模板](#创建新的模板) 创建了一个 `router.js` 文件，现在我们希望导入这个路由到主文件中。我们将用到两个 generator API 方法： `entryFile` 将返回项目的主文件（`main.js` 或 `main.ts`），`injectImports` 用于添加新的导入到主文件中：

```js
// generator/index.js

api.injectImports(api.entryFile, `import router from './router'`)
```

现在，当我们路由被导入时，我们可以在主文件中将这个路由注入到 Vue 实例。我们可以使用 `afterInvoke` 钩子，这个钩子将在文件被写入硬盘之后被调用。

首先，我们需要通过 Node 的 `fs` 模块（提供了文件交互 API）读取文件内容，将内容拆分

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

然后我们需要找到包含 `render` 单词的字符串（它通常是 Vue 实例的一部分），`router` 就是下一个字符串：

```js{9-10}
// generator/index.js

module.exports.hooks = (api) => {
  api.afterInvoke(() => {
    const fs = require('fs')
    const contentMain = fs.readFileSync(api.resolve(api.entryFile), { encoding: 'utf-8' })
    const lines = contentMain.split(/\r?\n/g)

    const renderIndex = lines.findIndex(line => line.match(/render/))
    lines[renderIndex] += `\n router,`
  })
}
```

最后，你需要将内容写入主文件：

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

    fs.writeFileSync(api.entryFile, lines.join(EOL), { encoding: 'utf-8' })
  })
}
```

## Service 插件

Service 插件可以修改 webpack 配置，创建新的 vue-cli service 命令或者修改已经存在的命令（如 `serve` 和 `build`）。

Service 插件在 Service 实例被创建后自动加载 - 例如，每次 `vue-cli-service` 命令在项目中被调用的时候。它位于 CLI 插件根目录的 `index.js` 文件。

一个 service 插件应该导出一个函数，这个函数接受两个参数：

- 一个 [PluginAPI](/dev-guide/plugin-api.md) 实例

- 一个包含 `vue.config.js` 内指定的项目本地选项的对象，或者在 `package.json` 内的 `vue` 字段。

一个 service 插件至少应包含如下代码：

```js
module.exports = () => {}
```

### 修改 webpack 配置

这个 API 允许 service 插件针对不同的环境扩展/修改内部的 webpack 配置。例如，这里我们在 webpack-chain 中添加 `vue-auto-routing` 这个 webpack 插件，并指定参数：

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

你也可以使用 `configureWebpack` 方法修改 webpack 配置或者返回一个对象，返回的对象将通过 webpack-merge 被合并到配置中。

### 添加一个新的 cli-service 命令

通过 service 插件你可以注册一个新的 cli-service 命令，除了标准的命令（即 `serve` 和 `build`）。你可以使用 `registerCommand` API 方法实现。

下面的例子创建了一个简单的新命令，可以向开发控制台输出一条问候语：

```js
api.registerCommand(
  'greet',
  {
    description: 'Write a greeting to the console',
    usage: 'vue-cli-service greet'
  },
  () => {
    console.log(`👋  Hello`)
  }
)
```

在这个例子中，我们提供了命令的名字（`'greet'`）、一个有 `description` 和 `usage` 选项的对象，和一个在执行 `vue-cli-service greet` 命令时会调用的函数。

:::tip
你可以 [通过 Generator](#扩展包) 添加一个新的命令到项目 `package.json` 文件的 npm 脚本列表中。
:::

如果你在已经安装了插件的项目中运行新命令，你将看到下面的输出：

```bash
$ vue-cli-service greet
👋 Hello!
```

你也可以给新命令定义一系列可能的选项。接下来我们添加一个 `--name` 选项，并修改实现函数，当提供了 name 参数时把它也打印出来。

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
)
```

现在，如果 `greet` 命令携带了特定的 `--name` 选项，这个 name 被添加到控制台输出：

```bash
$ vue-cli-service greet --name 'John Doe'
👋 Hello, John Doe!
```

### 修改已经存在的 cli-service 命令

如果你想修改一个已经存在的 cli-service 命令，你可以使用 `api.service.commands` 获取到命令对象并且做些改变。我们将在应用程序运行的端口打印一条信息到控制台：

```js
const { serve } = api.service.commands

const serveFn = serve.fn

serve.fn = (...args) => {
  return serveFn(...args).then(res => {
    if(res && res.url) {
      console.log(`Project is running now at ${res.url}`)
    }
  })
}
```

在上面的这个例子中，我们从已经存在的命令列表中获取到命令对象 `serve`；然后我们修改了他的 `fn` 部分（`fn` 是创建这个新命令时传入的第三个参数；它定义了在执行这个命令时要执行的函数）。修改完后，这个控制台消息将在 `serve` 命令成功运行后打印。

### 为命令指定模式

如果一个已注册的插件命令需要运行在特定的默认模式下，则该插件需要通过 `module.exports.defaultModes` 以 `{ [commandName]: mode }` 的形式来暴露：

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

这是因为我们需要在加载环境变量之前知道该命令的预期模式，所以需要提前加载用户选项/应用插件。

## 对话

对话是在创建一个新的项目或者在已有项目中添加新的插件时处理用户选项时需要的。所有的对话逻辑都存储在 `prompts.js` 文件中。对话内部是通过 [inquirer](https://github.com/SBoudrias/Inquirer.js) 实现。

当用户通过调用 `vue invoke` 初始化插件时，如果插件根目录包含 `prompts.js`，他将在调用时被使用。这个文件应该导出一个[问题](https://github.com/SBoudrias/Inquirer.js#question)数组 -- 将被 Inquirer.js 处理。

你应该直接导出一个问题数组，或者导出一个返回这些内容的函数。

例如，直接是问题数组：
```js
// prompts.js

module.exports = [
  {
    type: 'input',
    name: 'locale',
    message: 'The locale of project localization.',
    validate: input => !!input,
    default: 'en'
  }
  // ...
]
```

例如，一个返回问题数组的函数：
```js
// prompts.js

// 将 `package.json` 作为参数传入函数
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

  // 添加动态对话
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

解析到的答案对象将作为选项传入到插件的 generator。

或者，用户可以通过在命令行传入选项跳过对话直接初始化插件，例如：

```bash
vue invoke my-plugin --mode awesome
```

对话可以有[不同的类型](https://github.com/SBoudrias/Inquirer.js#prompt-types)，但是在 CLI 大多数使用的是 `checkbox` 和 `confirm`。让我们添加一个 `confirm` 对话，然后在插件的 generator 使用它，来创建一个有条件的[模板渲染](#创建新的模板)。

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

插件被调用时，用户将被问到示例路由的问题，默认的答案是 `No`。

![Prompts example](/prompts-example.png)

如果你想在 generator 中使用用户的选择结果，你可以通过对话名字获得。我们可以修改一下 `generator/index.js`：

```js
if (options.addExampleRoutes) {
  api.render('./template', {
    ...options
  })
}
```

现在如果用户同意创建示例路由，那么模板将被渲染。

## 安装本地插件

当你开发自己的插件时，你需要测试它、查看它在使用 Vue CLI 创建的项目中如何工作。你可以使用已经存在的项目或者创建一个新的项目用来测试：

```bash
vue create test-app
```

安装插件，在项目根目录运行下面的命令：

```bash
npm install --save-dev file:/full/path/to/your/plugin
vue invoke <your-plugin-name>
```

每次插件修改后，你需要重复这个步骤。

另一个方式是利用 Vue UI 的能力来添加插件。你可以运行它：

```bash
vue ui
```

将打开浏览器的窗口地址 `localhost:8000`。到 `Vue 项目管理` 菜单栏：

![Vue Project Manager](/ui-project-manager.png)

然后找到你的测试项目的名字：

![UI Plugins List](/ui-select-plugin.png)

点击应用名字，到插件菜单（有个拼图图标）然后点击右上角的 `添加新的插件` 按钮。在新页面中你将看到一系列能够通过 npm 获得的 Vue CLI 插件。在页面底部有一个 `浏览本地插件` 的按钮：

![Browse local plugins](/ui-browse-local-plugin.png)

点击它之后，你能够轻松的搜索到你的插件并添加到项目中。在这之后你可以在插件列表中看到这个插件，并且简单的点击下 `刷新` 图标即可同步对插件代码所做的修改：

![Refresh plugin](/ui-plugin-refresh.png)

## UI 集成

Vue CLI 有一个非常强大的 UI 工具 -- 允许用户通过图形接口来架构和管理项目。Vue CLI 插件能够集成到接口中。UI 为 CLI 插件提供了额外的功能：

- 你可以执行 npm 任务，直接在 UI 中执行插件中定义的命令；
- 你可以展示插件的自定义配置。例如： [vue-cli-plugin-apollo](https://github.com/Akryum/vue-cli-plugin-apollo) 针对 Apollo 服务器提供了如下的配置：

![UI Configuration Screen](/ui-configuration.png)
- 当创建项目时，你可以展示 [对话](#对话)
- 如果你想支持多种语言，你可以为你的插件添加本地化
- 你可以使插件在 Vue UI 搜索中被搜索到

所有关于 Vue UI 的逻辑都应该放到根目录的 `ui.js` 文件 或者 `ui/index.js`。这个文件应该导出一个函数 -- 这个函数接收 api 对象作为参数：

```js
module.exports = api => {
  // Use the API here
}
```

### 为任务增加 UI 界面

Vue CLI 插件不仅允许你[通过 Generator](#扩展包) 为项目添加新的 npm 任务，也可以在 Vue UI 中为它们创建一个图形界面。如果你想通过 UI 运行任务并且直接看到输出，这是很有用的。

让我们把之前通过 [Generator](#扩展包) 创建的 `greet` 任务添加到 UI 中。任务列表是从项目的 `package.json` 文件的 `scripts` 字段生成的。你可以根据 `api.describeTask` 方法 '补充' 额外的信息和钩子。让我们为任务添加一些额外的信息：

```js
module.exports = api => {
  api.describeTask({
    match: /greet/,
    description: 'Prints a greeting in the console',
    link: 'https://cli.vuejs.org/dev-guide/plugin-dev.html#core-concepts'
  })
}
```

现在如果你在 Vue UI 中浏览你的项目，你会发现添加到 `Tasks` 部分的任务。你可以看见任务的名字、描述信息、指向你提供的 URL 的链接图标和一个展示任务输出的输出窗口：

![UI Greet task](/ui-greet-task.png)

### 展示配置页面

有时你的项目针对不同的功能或者库，有自定义的配置文件。通过 Vue CLI 插件，你可以在 Vue UI 中展示配置，修改它和保存它（保存将修改你项目中相应的配置）。默认情况下，Vue CLI 项目有个主配置页面对应 `vue.config.js` 的配置。如果你将 ESLint 包含到项目中，你可以看到一个 ESLint 的配置页面：

![UI Configuration Screen](/ui-configuration-default.png)

让我们为你的插件建一个自定义的配置。第一步，在你的插件添加到已经存在的项目中之后，应该有个配置文件。这意味着你需要在[模板步骤](#创建新的模板)将这个文件添加到 `template` 文件夹中。

默认情况下，一个可配置的 UI 能够读取和写入以下文件类型：`json`，`yaml`，`js`，`package`。让我们命名文件为 `myConfig.js` 将它放入 `template` 的根文件夹：

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

现在你需要添加一些真实的配置到这个文件中：

```js
// myConfig.js

module.exports = {
  color: 'black'
}
```

当你的插件被应用后，`myConfig.js` 文件将被渲染到项目根目录。现在让我们在 `ui.js` 文件中通过 `api.describeConfig` 方法添加一个新的配置页面。

首先你需要传入一些信息：

```js
// ui.js

api.describeConfig({
  // 配置的唯一id
  id: 'org.ktsn.vue-auto-routing.config',
  // 展示的名字
  name: 'Greeting configuration',
  // 展示在名字下面
  description: 'This config defines the color of the greeting printed',
  // “查看详情” 的链接
  link: 'https://github.com/ktsn/vue-cli-plugin-auto-routing#readme'
})
```

:::danger Warning
确保正确地为 id 设置命名空间，它必须在所有的插件中唯一。建议使用 [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation) 命名方法
:::

### 配置 logo

你也可以为你的配置选择一个图标。他既可以是 [Material icon](https://material.io/tools/icons/?style=baseline) 代码，也可以是自定义图片（看这里 [Public static files](ui-api.md#public-static-files)）。

```js
// ui.js

api.describeConfig({
  /* ... */
  // Config icon
  icon: 'color_lens'
})
```

如果你不定义图标，将展示插件logo (看这里 [Logo](#logo))。

#### 配置文件

现在你需要将配置文件提供给 UI：这样你可以读取它的内容或者修改它。你需要为你的配置文件选择一个名字，选择格式和提供文件路径：

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

这里可以提供多个文件。如果我们有 `myConfig.json`，我们使用 `json: ['myConfig.json']` 属性提供它。顺序很重要：如果配置文件不存在，列表中的第一个文件名将被用于创建它。

#### 展示配置的对话

我们希望在配置页面中展示一个颜色属性的输入框。为了完成它，我们需要 `onRead` 钩子，它将返回一个被展示的对话列表：

```js
api.describeConfig({
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

上面这个例子中，我们定义值为 'white' 的输入对话。加了以上所有设置后，我们的配置页面看起来会是这样的：

![UI Config Start](/ui-config-start.png)

现在让我们使用来自配置文件的属性，替换硬编码的 `white` 值。在 `onRead` 钩子中 `data` 对象包含每一个配置文件内容的 JSON 结果。在我们的情况下，`myConfig.js` 的内容是

```js
// myConfig.js

module.exports = {
  color: 'black'
}
```

所以，`data` 对象将是

```js
{
  // File
  myConfig: {
    // File data
    color: 'black'
  }
}
```

容易看到，我们需要 `data.myConfig.color` 属性。让我们修改 `onRead` 钩子：

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
注意，当页面加载时，如果配置文件不存在 `myConfig` 可能是 undefined。
:::

你可以看见，在配置页面中 `white` 被 `black` 替换了。

如果配置文件不存在，我们可以提供一个默认值：

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

#### 保存配置变化

我们刚刚读取了 `myConfig.js` 的内容并且在配置页面使用它。现在让我们尝试将颜色输入框的内容保存到文件中。我们可以使用 `onWrite` 钩子：

```js
// ui.js

api.describeConfig({
  /* ... */
  onWrite: ({ prompts, api }) => {
    // ...
  }
})
```

`onWrite` 钩子能够得到许多[参数](ui-api.html#save-config-changes) 但我们仅仅需要其中的两个：`prompts` 和 `api`。第一个是当前对话运行时对象 - 我们将得到对话 id 并且通过 id 拿到答案。为了获取答案我们需要使用来自 `api` 的 `async getAnswer()` 方法：

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

现在如果你通过配置页面修改颜色输入框的内容，有 `black` 变为 `red`，然后按下 `保存修改` 按钮，你会发现你的项目中的 `myConfig.js` 文件也发生了变化：

```js
// myConfig.js

module.exports = {
  color: 'red'
}
```

### 展示对话

如果你想，你可以在 Vue UI 中展示[对话](#对话)。当你通过 UI 安装插件时，对话将在插件的调用步骤中展示。

你可以通过添加额外属性扩展  [inquirer 对象](#prompts-for-3rd-party-plugins)。他们是可选项且仅仅被 UI 使用：

```js
// prompts.js

module.exports = [
  {
    // 基本对话属性
    name: `addExampleRoutes`,
    type: 'confirm',
    message: 'Add example routes?',
    default: false,
    // UI 关联的对话属性
    group: 'Strongly recommended',
    description: 'Adds example pages, layouts and correct router config',
    link:
      'https://github.com/ktsn/vue-cli-plugin-auto-routing/#vue-cli-plugin-auto-routing'
  }
]
```
现在，你将在插件调用时看到：

![UI Prompts](/ui-prompts.png)

### Logo

你可以放一个 `logo.png` 文件到文件夹根目录，它将被发布到 npm。将在以下几个地方展示：
- 在搜索要安装的插件时
- 在已安装的插件列表中
- 在配置列表中（默认情况）
- 在添加任务的任务列表中（默认情况）

![Plugins](/plugins.png)

Logo 应该是方形非透明图片（理想尺寸 84*84）。

### 发布插件到 npm

为了发布插件，你需要在 [npmjs.com](https://www.npmjs.com) 上注册并且全局安装 `npm`。如果这是你的第一个发布的 npm 模块，请执行

```bash
npm login
```

输入你的名字和密码。这将存储你的凭证，这样你就不必每次发布时都输入。

:::tip
发布插件之前，确保你为它选择了正确的名字！名字规范是 `vue-cli-plugin-<name>`。在 [Discoverability](#discoverability) 查看更多信息
:::

接下来发布插件，到插件的根目录，在命令行执行下面的命令：

```bash
npm publish
```

成功发布后，你应该能够使用 `vue add <plugin-name>` 命令将你的插件添加到使用 Vue CLI 创建的项目。
