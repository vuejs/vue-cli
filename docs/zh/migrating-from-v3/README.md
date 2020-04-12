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
