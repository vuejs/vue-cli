---
sidebarDepth: 3
---

# 插件开发指南

## 核心概念

系统里有两个主要的部分：

- `@vue/cli`：全局安装的，暴露 `vue create <app>` 命令；
- `@vue/cli-service`：局部安装，暴露 `vue-cli-service` 命令。

两者皆应用了基于插件的架构。

### Creator

[Creator][creator-class] 是调用 `vue create <app>` 时创建的类。负责偏好对话、调用 generator 和安装依赖。

### Service

[Service][service-class] 是调用 `vue-cli-service <command> [...args]` 时创建的类。负责管理内部的 webpack 配置、暴露服务和构建项目的命令等。

### CLI 插件

CLI 插件是一个可以为 `@vue/cli` 项目添加额外特性的 npm 包。它应该始终包含一个 [Service 插件](#service-插件)作为其主要导出，且可选的包含一个 [Generator](#generator) 和一个 [Prompt 文件](#第三方插件的对话)。

一个典型的 CLI 插件的目录结构看起来是这样的：

```
.
├── README.md
├── generator.js  # generator (可选)
├── prompts.js    # prompt 文件 (可选)
├── index.js      # service 插件
└── package.json
```

### Service 插件

Service 插件会在一个 Service 实例被创建时自动加载——比如每次 `vue-cli-service` 命令在项目中被调用时。

注意我们这里讨论的“service 插件”的概念要比发布为一个 npm 包的“CLI 插件”的要更窄。前者涉及一个会被 `@vue/cli-service` 在初始化时加载的模块，也经常是后者的一部分。

此外，`@vue/cli-service` 的[内建命令][commands]和[配置模块][config]也是全部以 service 插件实现的。

一个 service 插件应该导出一个函数，这个函数接受两个参数：

- 一个 [PluginAPI][plugin-api] 实例

- 一个包含 `vue.config.js` 内指定的项目本地选项的对象，或者在 `package.json` 内的 `vue` 字段。

这个 API 允许 service 插件针对不同的环境扩展/修改内部的 webpack 配置，并向 `vue-cli-service` 注入额外的命令。例如：

``` js
module.exports = (api, projectOptions) => {
  api.chainWebpack(webpackConfig => {
    // 通过 webpack-chain 修改 webpack 配置
  })

  api.configureWebpack(webpackConfig => {
    // 修改 webpack 配置
    // 或返回通过 webpack-merge 合并的配置对象
  })

  api.registerCommand('test', args => {
    // 注册 `vue-cli-service test`
  })
}
```

#### 为命令指定模式

<!-- 对于环境变量来说，有一个值得注意的重要的事情，就是了解它们何时被解析。一般情况下，像 `vue-cli-service serve` 或 `vue-cli-service build` 这样的命令会始终调用 `api.setMode()` 作为它的第一件事。然而，这也意味着这些环境变量可能在 service 插件被调用的时候还不可用： -->
> 注意：插件设置模式的方式从 beta.10 开始已经改变了。

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

#### 在插件中解析 webpack 配置

一个插件可以通过调用 `api.resolveWebpackConfig()` 取回解析好的 webpack 配置。每次调用都会新生成一个 webpack 配置用来在需要时进一步修改。

``` js
module.exports = api => {
  api.registerCommand('my-build', args => {
    const configA = api.resolveWebpackConfig()
    const configB = api.resolveWebpackConfig()

    // 针对不同的目的修改 `configA` 和 `configB`...
  })
}

// 请确保为正确的环境变量指定默认模式
module.exports.defaultModes = {
  'my-build': 'production'
}
```

或者，一个插件也可以通过调用 `api.resolveChainableWebpackConfig()` 获得一个新生成的[链式配置](https://github.com/mozilla-neutrino/webpack-chain)：

``` js
api.registerCommand('my-build', args => {
  const configA = api.resolveChainableWebpackConfig()
  const configB = api.resolveChainableWebpackConfig()

  // 针对不同的目的链式修改 `configA` 和 `configB`...

  const finalConfigA = configA.toConfig()
  const finalConfigB = configB.toConfig()
})
```

#### 第三方插件的自定义选项

`vue.config.js` 的导出将会[通过一个 schema 的验证](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/options.js#L3)以避免笔误和错误的配置值。然而，一个第三方插件仍然允许用户通过 `pluginOptions` 字段配置其行为。例如，对于下面的 `vue.config.js`：

``` js
module.exports = {
  pluginOptions: {
    foo: { /* ... */ }
  }
}
```

该第三方插件可以读取 `projectOptions.pluginOptions.foo` 来做条件式的决定配置。

### Generator

一个发布为 npm 包的 CLI 插件可以包含一个 `generator.js` 或 `generator/index.js` 文件。插件内的 generator 将会在两种场景下被调用：

- 在一个项目的初始化创建过程中，如果 CLI 插件作为项目创建 preset 的一部分被安装。

- 插件在项目创建好之后通过 `vue invoke` 独立调用时被安装。

这里的 [GeneratorAPI][generator-api] 允许一个 generator 向 `package.json` 注入额外的依赖或字段，并向项目中添加文件。

一个 generator 应该导出一个函数，这个函数接收三个参数：

1. 一个 `GeneratorAPI` 实例：

2. 这个插件的 generator 选项。这些选项会在项目创建对话过程中被解析，或从一个保存在 `~/.vuerc` 中的 preset 中加载。例如，如果保存好的 `~/.vuerc` 像如下的这样：

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

    如果用户使用 preset `foo` 创建了一个项目，那么 `@vue/cli-plugin-foo` 的 generator 就会收到 `{ option: 'bar' }` 作为第二个参数。

    对于一个第三方插件来说，该选项将会解析自对话或用户执行 `vue invoke` 时的命令行参数中 (详见[第三方插件的对话](#第三方插件的对话))。

3. 整个 preset (`presets.foo`) 将会作为第三个参数传入。

**示例：**

``` js
module.exports = (api, options, rootOptions) => {
  // 修改 `package.json` 里的字段
  api.extendPackage({
    scripts: {
      test: 'vue-cli-service test'
    }
  })

  // 复制并用 ejs 渲染 `./template` 内所有的文件
  api.render('./template')

  if (options.foo) {
    // 有条件地生成文件
  }
}
```

#### Generator 的模板处理

当你调用 `api.render('./template')` 时，该 generator 将会使用 [EJS](https://github.com/mde/ejs) 渲染 `./template` 中的文件 (相对于 generator 中的文件路径进行解析)

此外，你可以使用 YAML 前置元信息继承并替换已有的模板文件的一部分：

``` ejs
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

你也可以完成多处替换，当然你需要将要替换的字符串用 `<%# REPLACE %>` 和 `<%# END_REPLACE %>` 块包裹起来：

``` ejs
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace:
  - !!js/regexp /欢迎来到你的 Vue\.js 应用/
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

#### 文件名的极端情况

如果你想要渲染一个以点开头的模板文件 (例如 `.env`)，则需要遵循一个特殊的命名约定，因为以点开头的文件会在插件发布到 npm 的时候被忽略：

```
# 以点开头的模板需要使用下划线取代那个点：

/generator/template/_env

# 调用 api.render('./template') 会在项目目录中渲染成为：

.env
```

同时这也意味着当你想渲染以下划线开头的文件时，同样需要遵循一个特殊的命名约定：

```
# 这种模板需要使用两个下划线来取代单个下划线：

/generator/template/__variables.scss

# 调用 api.render('./template') 会在项目目录中渲染成为：

_variables.scss
```


### Prompts

#### 内建插件的对话

只有内建插件可以定制创建新项目时的初始化对话，且这些对话模块放置在 [`@vue/cli` 包的内部][prompt-modules]。

一个对话模块应该导出一个函数，这个函数接收一个 [PromptModuleAPI][prompt-api] 实例。这些对话的底层使用 [inquirer](https://github.com/SBoudrias/Inquirer.js) 进行展示：

``` js
module.exports = api => {
  // 一个特性对象应该是一个有效的 inquirer 选择对象
  api.injectFeature({
    name: 'Some great feature',
    value: 'my-feature'
  })

  // injectPrompt 期望接收一个有效的 inquirer 对话对象
  api.injectPrompt({
    name: 'someFlag',
    // 确认对话只在用户已经选取了特性的时候展示
    when: answers => answers.features.include('my-feature'),
    message: 'Do you want to turn on flag foo?',
    type: 'confirm'
  })

  // 当所有的对话都完成之后，将你的插件注入到
  // 即将传递给 Generator 的 options 中
  api.onPromptComplete((answers, options) => {
    if (answers.features.includes('my-feature')) {
      options.plugins['vue-cli-plugin-my-feature'] = {
        someFlag: answers.someFlag
      }
    }
  })
}
```

#### 第三方插件的对话

第三方插件通常会在一个项目创建完毕后被手动安装，且用户将会通过调用 `vue invoke` 来初始化这个插件。如果这个插件在其根目录包含一个 `prompts.js`，那么它将会用在该插件被初始化调用的时候。这个文件应该导出一个用于 Inquirer.js 的[问题](https://github.com/SBoudrias/Inquirer.js#question)的数组。这些被解析的答案对象会作为选项被传递给插件的 generator。

或者，用户可以通过在命令行传递选项来跳过对话直接初始化插件，比如：

``` bash
vue invoke my-plugin --mode awesome
```

## 发布插件

为了让一个 CLI 插件能够被其它开发者使用，你必须遵循 `vue-cli-plugin-<name>` 的命名约定将其发布到 npm 上。插件遵循命名约定之后就可以：

- 被 `@vue/cli-service` 发现；
- 被其它开发者搜索到；
- 通过 `vue add <name>` 或 `vue invoke <name>` 安装下来。

## 开发核心插件的注意事项

::: tip 注意
这个章节只用于 `vuejs/vue-cli` 仓库内部的内建插件工作。
:::

一个带有为本仓库注入额外依赖的 generator 的插件 (比如 `chai` 会通过 `@vue/cli-plugin-unit-mocha/generator/index.js` 被注入) 应该将这些依赖列入其自身的 `devDependencies` 字段。这会确保：

1. 这个包始终存在于该仓库的根 `node_modules` 中，因此我们不必在每次测试的时候重新安装它们。

2. `yarn.lock` 会保持其一致性，因此 CI 程序可以更好地利用缓存。

[creator-class]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/Creator.js
[service-class]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/Service.js
[generator-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/GeneratorAPI.js
[commands]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/commands
[config]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/config
[plugin-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/PluginAPI.js
[prompt-modules]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/promptModules
[prompt-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/PromptModuleAPI.js
