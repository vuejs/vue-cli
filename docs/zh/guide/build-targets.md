# 构建目标

当你运行 `vue-cli-service build` 时，你可以通过 `--target` 选项指定不同的构建目标。它允许你将相同的源代码根据不同的用例生成不同的构建。

## 应用

应用模式是默认的模式。在这个模式中：

- `index.html` 会带有注入的资源和 resource hint
- 第三方库会被分到一个独立包以便更好的缓存
- 小于 4kb 的静态资源会被内联在 JavaScript 中
- `public` 中的静态资源会被复制到输出目录中

## 库

::: tip 关于 IE 兼容性的提醒
在库模式中，项目的 `publicPath` 是根据主文件的加载路径[动态设置](https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/commands/build/setPublicPath.js)的（用以支持动态的资源加载能力）。但是这个功能用到了 `document.currentScript`，而 IE 浏览器并不支持这一特性。所以如果网站需要支持 IE 的话，建议使用库之前先在页面上引入 [current-script-polyfill](https://www.npmjs.com/package/current-script-polyfill)。
:::

::: tip 注意对 Vue 的依赖
在库模式中，Vue 是*外置的*。这意味着包中不会有 Vue，即便你在代码中导入了 Vue。如果这个库会通过一个打包器使用，它将尝试通过打包器以依赖的方式加载 Vue；否则就会回退到一个全局的 `Vue` 变量。

要避免此行为，可以在`build`命令中添加`--inline-vue`标志。
```
vue-cli-service build --target lib --inline-vue
```
:::


你可以通过下面的命令将一个单独的入口构建为一个库：

```
vue-cli-service build --target lib --name myLib [entry]
```

```
File                     Size                     Gzipped

dist/myLib.umd.min.js    13.28 kb                 8.42 kb
dist/myLib.umd.js        20.95 kb                 10.22 kb
dist/myLib.common.js     20.57 kb                 10.09 kb
dist/myLib.css           0.33 kb                  0.23 kb
```

这个入口可以是一个 `.js` 或一个 `.vue` 文件。如果没有指定入口，则会使用 `src/App.vue`。

构建一个库会输出：

- `dist/myLib.common.js`：一个给打包器用的 CommonJS 包 (不幸的是，webpack 目前还并没有支持 ES modules 输出格式的包)

- `dist/myLib.umd.js`：一个直接给浏览器或 AMD loader 使用的 UMD 包

- `dist/myLib.umd.min.js`：压缩后的 UMD 构建版本

- `dist/myLib.css`：提取出来的 CSS 文件 (可以通过在 `vue.config.js` 中设置 `css: { extract: false }` 强制内联)

::: warning 警告
如果你在开发一个库或多项目仓库 (monorepo)，请注意导入 CSS **是具有副作用的**。请确保在 `package.json` 中**移除** `"sideEffects": false`，否则 CSS 代码块会在生产环境构建时被 webpack 丢掉。
:::

### Vue vs. JS/TS 入口文件

当使用一个 `.vue` 文件作为入口时，你的库会直接暴露这个 Vue 组件本身，因为组件始终是默认导出的内容。

然而，当你使用一个 `.js` 或 `.ts` 文件作为入口时，它可能会包含具名导出，所以库会暴露为一个模块。也就是说你的库必须在 UMD 构建中通过 `window.yourLib.default` 访问，或在 CommonJS 构建中通过 `const myLib = require('mylib').default` 访问。如果你没有任何具名导出并希望直接暴露默认导出，你可以在 `vue.config.js` 中使用以下 webpack 配置：

``` js
module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default'
    }
  }
}
```

## Web Components 组件

::: tip 兼容性提示
Web Components 模式不支持 IE11 及更低版本。[更多细节](https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-web-component-wrapper/README.md#兼容性)
:::

::: tip 注意对 Vue 的依赖
在 Web Components 模式中，Vue 是*外置的*。这意味着包中不会有 Vue，即便你在代码中导入了 Vue。这里的包会假设在页面中已经有一个可用的全局变量 `Vue`。
:::

你可以通过下面的命令将一个单独的入口构建为一个 Web Components 组件：

```
vue-cli-service build --target wc --name my-element [entry]
```

注意这里的入口应该是一个 `*.vue` 文件。Vue CLI 将会把这个组件自动包裹并注册为 Web Components 组件，无需在 `main.js` 里自行注册。也可以在开发时把 `main.js` 作为 demo app 单独使用。

该构建将会产生一个单独的 JavaScript 文件 (及其压缩后的版本) 将所有的东西都内联起来。当这个脚本被引入网页时，会注册自定义组件 `<my-element>`，其使用 `@vue/web-component-wrapper` 包裹了目标的 Vue 组件。这个包裹器会自动代理属性、特性、事件和插槽。请查阅 [`@vue/web-component-wrapper` 的文档](https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-web-component-wrapper/README.md)了解更多细节。

**注意这个包依赖了在页面上全局可用的 `Vue`。**

这个模式允许你的组件的使用者以一个普通 DOM 元素的方式使用这个 Vue 组件：

``` html
<script src="https://unpkg.com/vue"></script>
<script src="path/to/my-element.js"></script>

<!-- 可在普通 HTML 中或者其它任何框架中使用 -->
<my-element></my-element>
```

### 注册多个 Web Components 组件的包

当你构建一个 Web Components 组件包的时候，你也可以使用一个 glob 表达式作为入口指定多个组件目标：

```
vue-cli-service build --target wc --name foo 'src/components/*.vue'
```

当你构建多个 web component 时，`--name` 将会用于设置前缀，同时自定义元素的名称会由组件的文件名推导得出。比如一个名为 `HelloWorld.vue` 的组件携带 `--name foo` 将会生成的自定义元素名为 `<foo-hello-world>`。

### 异步 Web Components 组件

当指定多个 Web Components 组件作为目标时，这个包可能会变得非常大，并且用户可能只想使用你的包中注册的一部分组件。这时异步 Web Components 模式会生成一个 code-split 的包，带一个只提供所有组件共享的运行时，并预先注册所有的自定义组件小入口文件。一个组件真正的实现只会在页面中用到自定义元素相应的一个实例时按需获取：

```
vue-cli-service build --target wc-async --name foo 'src/components/*.vue'
```

```
File                Size                        Gzipped

dist/foo.0.min.js    12.80 kb                    8.09 kb
dist/foo.min.js      7.45 kb                     3.17 kb
dist/foo.1.min.js    2.91 kb                     1.02 kb
dist/foo.js          22.51 kb                    6.67 kb
dist/foo.0.js        17.27 kb                    8.83 kb
dist/foo.1.js        5.24 kb                     1.64 kb
```

现在用户在该页面上只需要引入 Vue 和这个入口文件即可：

``` html
<script src="https://unpkg.com/vue"></script>
<script src="path/to/foo.min.js"></script>

<!-- foo-one 的实现的 chunk 会在用到的时候自动获取 -->
<foo-one></foo-one>
```
