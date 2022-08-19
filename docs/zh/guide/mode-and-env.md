# 模式和环境变量

## 模式

**模式**是 Vue CLI 项目中一个重要的概念。默认情况下，一个 Vue CLI 项目有三个模式：

- `development` 模式用于 `vue-cli-service serve`
- `test` 模式用于 `vue-cli-service test:unit`
- `production` 模式用于 `vue-cli-service build` 和 `vue-cli-service test:e2e`

你可以通过传递 `--mode` 选项参数为命令行覆写默认的模式。例如，如果你想要在构建命令中使用开发环境变量：

```
vue-cli-service build --mode development
```

当运行 `vue-cli-service` 命令时，所有的环境变量都从对应的[环境文件](#环境变量)中载入。如果文件内部不包含 `NODE_ENV` 变量，它的值将取决于模式，例如，在 `production` 模式下被设置为 `"production"`，在 `test` 模式下被设置为 `"test"`，默认则是 `"development"`。

`NODE_ENV` 将决定您的应用运行的模式，是开发，生产还是测试，因此也决定了创建哪种 webpack 配置。

例如通过将 `NODE_ENV` 设置为 `"test"`，Vue CLI 会创建一个优化过后的，并且旨在用于单元测试的 webpack 配置，它并不会处理图片以及一些对单元测试非必需的其他资源。

同理，`NODE_ENV=development` 创建一个 webpack 配置，该配置启用热更新，不会对资源进行 hash 也不会打出 vendor bundles，目的是为了在开发的时候能够快速重新构建。

当你运行 `vue-cli-service build` 命令时，无论你要部署到哪个环境，应该始终把 `NODE_ENV` 设置为 `"production"` 来获取可用于部署的应用程序。

::: warning NODE_ENV
如果在环境中有默认的 `NODE_ENV`，你应该移除它或在运行 `vue-cli-service` 命令的时候明确地设置 `NODE_ENV`。
:::

## 环境变量

你可以在你的项目根目录中放置下列文件来指定环境变量：

```bash
.env                # 在所有的环境中被载入
.env.local          # 在所有的环境中被载入，但会被 git 忽略
.env.[mode]         # 只在指定的模式中被载入
.env.[mode].local   # 只在指定的模式中被载入，但会被 git 忽略
```

一个环境文件只包含环境变量的“键=值”对：

```
FOO=bar
VUE_APP_NOT_SECRET_CODE=some_value
```

::: warning 警告
不要在你的应用程序中存储任何机密信息（例如私有 API 密钥）！

环境变量会随着构建打包嵌入到输出代码，意味着任何人都有机会能够看到它。
:::

请注意，只有 `NODE_ENV`，`BASE_URL` 和以 `VUE_APP_` 开头的变量将通过 `webpack.DefinePlugin` 静态地嵌入到*客户端侧*的代码中。这是为了避免意外公开机器上可能具有相同名称的私钥。

想要了解解析环境文件规则的细节，请参考 [dotenv](https://github.com/motdotla/dotenv#rules)。我们也使用 [dotenv-expand](https://github.com/motdotla/dotenv-expand) 来实现变量扩展 (Vue CLI 3.5+ 支持)。例如：

```bash
FOO=foo
BAR=bar

CONCAT=$FOO$BAR # CONCAT=foobar
```

被载入的变量将会对 `vue-cli-service` 的所有命令、插件和依赖可用。

::: tip 环境文件加载优先级

为一个特定模式准备的环境文件 (例如 `.env.production`) 将会比一般的环境文件 (例如 `.env`) 拥有更高的优先级。

此外，Vue CLI 启动时已经存在的环境变量拥有最高优先级，并不会被 `.env` 文件覆写。

`.env` 环境文件是通过运行 `vue-cli-service` 命令载入的，因此环境文件发生变化，你需要重启服务。
:::

## 示例：Staging 模式

假设我们有一个应用包含以下 `.env` 文件：

```
VUE_APP_TITLE=My App
```

和 `.env.staging` 文件：

```
NODE_ENV=production
VUE_APP_TITLE=My App (staging)
```

- `vue-cli-service build` 会加载可能存在的 `.env`、`.env.production` 和 `.env.production.local` 文件然后构建出生产环境应用。

- `vue-cli-service build --mode staging` 会在 staging 模式下加载可能存在的 `.env`、`.env.staging` 和 `.env.staging.local` 文件然后构建出生产环境应用。

这两种情况下，根据 `NODE_ENV`，构建出的应用都是生产环境应用，但是在 staging 版本中，`process.env.VUE_APP_TITLE` 被覆写成了另一个值。

## 在客户端侧代码中使用环境变量

只有以 `VUE_APP_` 开头的变量会被 `webpack.DefinePlugin` 静态嵌入到客户端侧的包中。你可以在应用的代码中这样访问它们：

``` js
console.log(process.env.VUE_APP_SECRET)
```

在构建过程中，`process.env.VUE_APP_SECRET` 将会被相应的值所取代。在 `VUE_APP_SECRET=secret` 的情况下，它会被替换为 `"secret"`。

除了 `VUE_APP_*` 变量之外，在你的应用代码中始终可用的还有两个特殊的变量：

- `NODE_ENV` - 会是 `"development"`、`"production"` 或 `"test"` 中的一个。具体的值取决于应用运行的[模式](#模式)。
- `BASE_URL` - 会和 `vue.config.js` 中的 `publicPath` 选项相符，即你的应用会部署到的基础路径。

所有解析出来的环境变量都可以在 `public/index.html` 中以 [HTML 插值](./html-and-static-assets.md#插值)中介绍的方式使用。

::: tip 提示
你可以在 `vue.config.js` 文件中计算环境变量。它们仍然需要以 `VUE_APP_` 前缀开头。这可以用于版本信息:
```js
process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  // config
}
```
:::

## 只在本地有效的变量

有的时候你可能有一些不应该提交到代码仓库中的变量，尤其是当你的项目托管在公共仓库时。这种情况下你应该使用一个 `.env.local` 文件取而代之。本地环境文件默认会被忽略，且出现在 `.gitignore` 中。

`.local` 也可以加在指定模式的环境文件上，比如 `.env.development.local` 将会在 development 模式下被载入，且被 git 忽略。
