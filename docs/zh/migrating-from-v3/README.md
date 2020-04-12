---
sidebar: auto
---

# 从 v3 迁移

首先，全局安装最新版的 Vue CLI：

```sh
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

## 一次性更新所有插件

在已有的项目里运行：

```sh
vue upgrade
```

之后细节请参看各章节的重大更新。

------

## 一步步手动移植

如果你想要手动渐进式移植，这里有一些建议：

### 全局的 `@vue/cli`

#### [全新设计的](https://github.com/vuejs/vue-cli/pull/4090) `vue upgrade`

- 之前运行：`vue upgrade [patch | minor | major]`，这个命令只会安装最新版的插件。
- 现在运行：`vue upgrade [plugin-name]`。 除了升级插件外，该命令还可以运行移植工具来帮助你自动化移植过程。关于这个命令的更多选项，请执行 `vue upgrade --help`。

#### `vue --version` 输出格式变更

当执行 `vue --version`时：

- 3.x：输出 `3.12.0`
- 4.x：输出 `@vue/cli 4.0.0`

#### 额外的验证步骤来防止覆盖

当执行 `vue invoke` / `vue add` / `vue upgrade`时，当你当前的项目里有未提交代码时，会有一个[额外的验证步骤](https://github.com/vuejs/vue-cli/pull/4275)

![image](https://user-images.githubusercontent.com/3277634/65588457-23db5a80-dfba-11e9-9899-9dd72efc111e.png)

#### Vue Router 和 Vuex 现在有了对应的 CLI 插件

当运行 `vue add vuex` 或 `vue add router`时：

- 在 v3 版中: 只有 `vuex` 或 `vue-router` 会被添加到项目中；
- 在 v4 版中: 同时会把 `@vue/cli-plugin-vuex` 或 `@vue/cli-plugin-router` 安装到项目中。

当前不会对终端用户产生影响，但是这个设计可以允许我们以后为 Vuex 或 Vue Router用户添加更多新特性。

对 Preset 和 插件作者来说，在这两个插件中有许多值得注意的改变:

- 默认的目录结构变更：
  - `src/store.js` 搬到了 `src/store/index.js`；
  - `src/router.js` 重命名为 `src/router/index.js`；
- 为了兼容更早的版本， `preset.json` 里的 `router` 和 `routerHistoryMode` 选项仍然支持。但是现在为了保持更好的一致性推荐使用 `plugins: { '@vue/cli-plugin-router': { historyMode: true } }`。

- 现在已经不再支持 `api.hasPlugin('vue-router')` 的写法。现在的写法是 `api.hasPlugin('router')`。

### `@vue/cli-service`

#### 在模板中处理空格

为了获得一个更小的打包，我们在 Vue CLI v3 中默认禁用了 `vue-template-compiler` 的 `preserveWhitespace` 选项。

然而这项改进有一些需要注意的地方。

好消息是，自从 Vue 2.6 发布以来，我们可以用 [新的 `whitespace` 选项](https://github.com/vuejs/vue/issues/9208#issuecomment-450012518) 来更好的处理空格。

使用以下模板作为参考：

```html
<p>Welcome to <b>Vue.js</b> <i>world</i>. Have fun!</p>
```
设置 `preserveWhitespace: false`，所有tag中的空格已经被移除，编译后为：

```html
<p>Welcome to <b>Vue.js</b><i>world</i>. Have fun!</p>
```
设置 `whitespace: 'condense'`， 编译后为：

```html
<p>Welcome to <b>Vue.js</b> <i>world</i>. Have fun!</p>
```

注意 tag中 **inline** 样式的空格会保留。

#### `vue-cli-service build --mode development`

在过去，在 `development`模式下执行 `build` 命令，`dist` 文件夹的结构会与 `production` 的不同。现在随着下面两项改变，文件夹的结构在所有模式下都会相同 (文件名仍然会不同 - 在 `development` 模式下文件名没有哈希)：

- [#4323](https://github.com/vuejs/vue-cli/pull/4323) ensure consistent directory structure for all modes
- [#4302](https://github.com/vuejs/vue-cli/pull/4302) move dev configs into serve command

#### 对 SASS/SCSS 用户

之前在 Vue CLI v3 中，我们使用了 `sass-loader@7`。

最近 `sass-loader@8` 已经发布而且在配置文件格式上有了很多变化。这里是更新日志：<https://github.com/webpack-contrib/sass-loader/releases/tag/v8.0.0>

`@vue/cli-service` 在 v4 版中还会继续支持 `sass-loader@7`，但是我们强烈建议你看一下 v8 版本，并且更新到最新版。

#### 对 Less 用户

`less-loader` v4 与 `less` >= 3.10 的版本不兼容，查看<https://github.com/less/less.js/issues/3414>。
如果你的项目依赖它，强烈建议升级到 `less-loader@5`。

#### 对 CSS Module 用户

- [为了便于使用 `css.requireModuleExtension` 已弃用 `css.modules`](https://github.com/vuejs/vue-cli/pull/4387)。

#### `vue.config.js` 选项

已弃用的 [`baseUrl` option](https://cli.vuejs.org/config/#baseurl) 现在已经 [被移除](https://github.com/vuejs/vue-cli/pull/4388)

#### `chainWebpack` / `configureWebpack`

##### The `minimizer` Method in `chainWebpack`

如果你已经自定义了 `chainWebpack` 的内置rules，请注意现在 `webpack-chain` 已经从 v4 升级到了 v6，最值得注意的改变是 `minimizer` 配置

举例来说，如果你想要在 terser 插件中启用 `drop_console` 选项。
在 v3 中，你可以在 `chainWebpack` 中这么做:

```js
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
  chainWebpack: config => {
    config.optimization.minimizer([
      new TerserPlugin({ terserOptions: { compress: { drop_console: true } } })
    ])
  }
}
```

在 v4 中，变成了:

```js
module.exports = {
  chainWebpack: config => {
    config.optimization.minimizer('terser').tap(args => {
      args[0].terserOptions.compress.drop_console = true
      return args
    })
  }
}
```

##### Other Changes

- [The `pug-plain` rule 改名为 `pug-plain-loader`](https://github.com/vuejs/vue-cli/pull/4230)

#### 基础 Loaders / Plugins

不会影响用户除非你使用 `chainWebpack` / `configureWebpack` 自定义了配置

`css-loader` 已经从 v1 升级到了 v3:

- [v2 更新日志](https://github.com/webpack-contrib/css-loader/releases/tag/v2.0.0)
- [v3 更新日志](https://github.com/webpack-contrib/css-loader/releases/tag/v3.0.0)

若干个基础的 webpack loader 和插件已经升级，其中的绝大多数不太重要:

- `url-loader` [从 v1 to v2](https://github.com/webpack-contrib/url-loader/releases/tag/v2.0.0)
- `file-loader` [从 v3 to v4](https://github.com/webpack-contrib/file-loader/releases/tag/v4.0.0)
- `copy-webpack-plugin` [从 v4 to v5](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md#500-2019-02-20)
- `terser-webpack-plugin` [从 v1 to v2](https://github.com/vuejs/vue-cli/pull/4676)

### `@vue/cli-plugin-babel`, `@vue/babel-preset-app`

#### core-js

Babel 插件需要一个 peer dependency，用来帮助执行转译后的代码

在 Vue CLI v3中，要求的 `core-js` 版本是 2.x，现在已经升级为 3.x。

如果你是通过 `vue upgrade babel` 升级，移植过程是完全自动化的。
但是如果你在一个项目中有自定义配置，你可能需要手动更新这些字段 (更多详情，请查看[core-js 更新日志](https://github.com/zloirock/core-js/blob/master/CHANGELOG.md#L279-L297))。

#### Babel Preset
如果你是通过 `vue upgrade babel` 升级，这个移植过程是完全自动化的。

- 在 v3 中，`babel.config.js` 中默认的 babel preset 是 `@vue/app`。
- 在 v4 中，我们把它移动到了 plugin 中，所以现在改名为 `@vue/cli-plugin-babel/preset`

这是因为 `@vue/babel-preset-app` 是项目的一个非直接依赖。
它能工作是由于 npm 的 package hoisting。
但是如果你在一个项目中有若干个同 package 的多个互相冲突的非直接依赖版本，或者包管理工具对依赖解决方案有更严格的限制 (例如 yarn plug'n'play 或 pnpm)，仍然可能会有潜在的问题。
所以我们把它移到了项目的直接依赖 (`@vue/cli-plugin-babel`) 好让它能更符合标准且减少出错。

### `@vue/cli-plugin-eslint`

这个 plugin 现在 [需要 ESLint 作为 peer dependency](https://github.com/vuejs/vue-cli/pull/3852)。

这不会影响使用 Vue CLI 3.1 或之后版本生成的项目脚手架。

如果你的项目是使用 Vue CLI 3.0.x 或更早版本搭建的，你可能需要把 `eslint@4` 添加到项目的依赖 (如果你使用 `vue upgrade eslint` 升级，这个过程是完全自动的)。

同时建议升级你的 ESLint 到 v5，以及 ESLint config 到最新版。(ESLint v6 支持工作进行中)

------

#### The Prettier Preset

我们之前实现的 prettier preset 是有缺陷的。我们已经在 Vue CLI 3.10中更新了预置模板。

它现在需要 `eslint`，`eslint-plugin-prettier` 和 `prettier` 作为 peer dependencies，已符合[ESLint 生态系统中的标准实践](https://github.com/eslint/eslint/issues/3458)。

对于更早的项目，如果你遇到了问题，例如 `Cannot find module: eslint-plugin-prettier`，请执行下面的命令来修复:

```sh
npm install --save-dev eslint@5 @vue/eslint-config-prettier@5 eslint-plugin-prettier prettier
```

------

#### `lintOnSave` options

(以下内容只影响开发过程)

`lintOnSave` 的默认值 (当没有指定时) 现在已经 [从 `true` 变成 `'default'`](https://github.com/vuejs/vue-cli/pull/3975)。你可以在这里找到更多详细的原因解释 [文档](https://cli.vuejs.org/config/#lintonsave)。

总结:

- 在 v3 中，默认情况下，lint warning 以及 error 会显示为 error 样式
- 在 v4 中，默认情况下，只有 lint error 会打断你的开发过程。Warning 现在只会在终端中打印出来。

### `@vue/cli-plugin-pwa`

底层的 workbox-webpack-plugin 已经从 v3 更新到了 v4。在这里查看 [更新日志](https://github.com/GoogleChrome/workbox/releases/tag/v4.0.0)。

现在还有了一个新的 `pwa.manifestOptions` 字段可用 (你可以在 `vue.config.js` 中设置)。随着这个新选项，`manifest.json`将会生成一个 config 对象而不是直接从 `public` 文件夹拷贝一个。(注意，这是一个可选特性。相关PR: [#2981](https://github.com/vuejs/vue-cli/pull/2981)，[#4664](https://github.com/vuejs/vue-cli/pull/4664))

### `@vue/cli-plugin-e2e-cypress`

在 Vue CLI v3.0.0-beta.10 之前，E2E 测试的默认命令是 `vue-cli-service e2e`。之后我们把它改成了 `vue-cli-service test:e2e`。 之前的命令已经过期，但仍然可以使用。
现在我们彻底 [停用了旧的命令](https://github.com/vuejs/vue-cli/pull/3774)。

### `@vue/cli-plugin-e2e-nightwatch`

Nightwatch.js 已经从 0.9 升级到了 1.x。请先阅读 [Nightwatch 移植指南](https://github.com/nightwatchjs/nightwatch/wiki/Migrating-to-Nightwatch-1.0)。

Bundled config 以及 generated test [已经被完全重写了](https://github.com/vuejs/vue-cli/pull/4541)。 更多细节请看链接。大多数用例在 Vue CLI v3 中仍旧支持。它们只是新功能。

由于 ChromeDriver 自从73版本之后改变了发版策略，我们把它放到了项目的 peer dependency。
在插件中新增了一个简单浏览器版本检测，如果你升级到了一个不兼容版本的 Chrome，现在会有一个 warning 来提醒你升级到依赖的版本。

------

### `@vue/cli-plugin-typescript`

当使用 Typescript 时，webpack resolve 选项现在 [相比 `js(x)`更倾向于使用 `ts(x)` 文件后缀](https://github.com/vuejs/vue-cli/pull/3909)。

### `@vue/cli-plugin-unit-jest`

我们升级了内置的 Jest 从 v23 到 v23，所以请先阅读他们的 [更新日志](https://jestjs.io/blog/2019/01/25/jest-24-refreshing-polished-typescript-friendly)。
以及 [这个链接](https://github.com/facebook/jest/blob/20ba4be9499d50ed0c9231b86d4a64ec8a6bd303/CHANGELOG.md#user-content-2400) 来查看完整更新日志。

`unit-jest` plugin 现在自带了4套配置 preset:

- `@vue/cli-plugin-unit-jest` 默认的 preset 适合大多数普通类型的项目
- `@vue/cli-plugin-unit-jest/presets/no-babel` 如果你没有安装 `@vue/cli-plugin-babel` 并且不想在项目中看到 babel 文件
- `@vue/cli-plugin-unit-jest/presets/typescript` preset 支持 TypeScript (但是不支持 TSX)
- `@vue/cli-plugin-unit-jest/presets/typescript-and-babel` preset 支持 TypeScript (以及 TSX) 还有 babel。

如果你自项目创建都没有改过默认的 Jest 配置 (一般在 `jest.config.js` 或 `package.json` 中的 `jest` 字段)，现在你可以用一个单一字段来替换掉之前大篇幅的配置:

```js
module.exports = {
  // Replace the following preset name with the one you want to use from the above list
  preset: '@vue/cli-plugin-unit-jest'
}
```

(`ts-jest`，`babel-jest` 的依赖在配置文件移植到使用preset后也可以移除了)

::: tip 一个小提示
在新preset中默认的测试环境是 jsdom@15，这和 Jest 24 中默认的 (jsdom@11) 不同。
这是为了与即将到来的 Jest 25 更新保持一致。
绝大多数用户不会因为这项改变受到影响。
关于 jsdom 更详细的更新日志，请查阅 <https://github.com/jsdom/jsdom/blob/master/Changelog.md>
:::

