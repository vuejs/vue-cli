# 构建目标

当您运行 `vue-cli-service build` 的时候，您可以通过 `--target` 选项指定不同的构建目标。这使得您可以使用相同的代码来输出针对不同用途的代码。

## 应用

应用是默认的目标。在这个模式下：

- 包含资源和注入了为浏览器的资源提示的 `index.html`
- 依赖库被分割成单独的块以实现更好的缓存
- 10kb 以下的静态资源被内嵌到 JavaScript 中
- `public` 中的静态资源被复制到输出目录中

## 库

::: tip Vue 依赖的注意事项

在库模式下，Vue 是*外部化的*。这意味着即使您的代码导入了 Vue，最终的构建也不会包含 Vue。如果通过打包工具使用库，它将尝试作为依赖加载 Vue; 否则，它会回滚到全局 `Vue` 变量。
:::

您可以通过以下方式构建单一入口的库

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

入口既可以是 `.js` 文件，也可以是 `.vue` 文件。如果不指定入口，则为 `src/App.vue`。

库的构建会输出：

- `dist/myLib.common.js`: 给打包工具使用的 CommonJS 构建。（很不幸, webpack 目前不支持以 ES 模块的格式来输出）

- `dist/myLib.umd.js`：可以直接在浏览器中或通过 AMD 加载器使用的 UMD 构建。

- `dist/myLib.umd.min.js`：压缩过 UMD 构建。

- `dist/myLib.css`：提取出来的 CSS 文件（可以通过在 `vue.config.js` 中设置 `css: { extract: false }` 来强制内嵌 CSS）

### Vue 与 JS/TS 入口文件

当使用`.vue`文件作为入口时，您的库将直接公开 Vue 组件本身，因为组件始终是默认导出的

但是，当您使用 `.js` 或 `.ts` 文件作为您的入口时，它可能包含命名导出，因此您的库将以模块的方式公开。 这意味着您的库的默认导出必须在 UMD 构建中通过 `window.yourLib.default` 访问，或者在 CommonJS 版本中通过 `const myLib = require('mylib').default` 访问。如果您没有任何命名导出并希望直接公开默认导出，则可以在 `vue.config.js` 中使用以下 webpack 配置：

``` js
module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default'
    }
  }
}
```

## Web Component

::: tip 兼容性问题
Web Component 模式不支持 IE11 及以下的浏览器。[更多信息](https://github.com/vuejs/vue-web-component-wrapper#compatibility)
:::

::: tip Vue 依赖的注意事项
在 web 组件模式下，Vue 是*外部化的*。这意味着即使您的代码导入了 Vue，最终的构建也不会包含 Vue。`Vue` 将被假定为在宿主页面上可用的全局变量。
:::

您可以通过以下方式构建单一入口的库

```
vue-cli-service build --target wc --name my-element [entry]
```

这将生成一个内嵌所有内容的单个 JavaScript 文件（及其压缩过的版本）。脚本包含在页面中时，会注册 `<my-element>` 自定义元素，该元素使用 `@vue/web-component-wrapper` 封装目标 Vue 组件。该 wrapper 自动代理属性、事件、插槽。更多详细信息，请参阅 [docs for `@vue/web-component-wrapper`](https://github.com/vuejs/vue-web-component-wrapper)。

**注意最终的构建依赖页面上可用的全局变量 `Vue`。**

该模式允许组件的使用者使用 Vue 组件作为普通的 DOM 元素：

``` html
<script src="https://unpkg.com/vue"></script>
<script src="path/to/my-element.js"></script>

<!-- 在纯 HTML 或任何其它框架中使用 -->
<my-element></my-element>
```

### 构建并注册多个 Web Components

在构建 Web 组件时，您还可以使用 glob 作为入口来指定多个组件：

```
vue-cli-service build --target wc --name foo 'src/components/*.vue'
```

在构建多个Web组件时，`--name` 将作为前缀，并从组件文件名中推断自定义元素名称。 例如，使用 `--name foo` 和一个名为 `HelloWorld.vue` 的组件，生成的自定义元素将被注册为 `<foo-hello-world>`。

### 异步 Web Component

当指定多个 Web 组件时，构建可能会变得非常大，但用户只使用您已注册的组件的一部分。异步 web 组件模式会生成一个拆分过的代码构建，其中包含一个小的入口文件，用于提供所有组件共享的运行时，并预先注册所有自定义元素。只有在页面上使用相应的自定义元素的实例时，才会按需获取组件的实际实现：

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

现在在页面上，用户只需要包含 Vue 和入口文件：

``` html
<script src="https://unpkg.com/vue"></script>
<script src="path/to/foo.min.js"></script>

<!-- foo-one 的实现会在使用时自动获取 -->
<foo-one></foo-one>
```
