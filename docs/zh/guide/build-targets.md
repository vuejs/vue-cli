# 构建目标

当你运行 `vue-cli-service build` 时，你可以通过 `--target` 选项指定不同的构建目标。它允许你将相同的源代码根据不同的用例生成不同的构建。

## 应用

应用模式是默认的模式。在这个模式中：

- `index.html` 会带有注入的资源和资源暗示
- 供应的库会被分到一个独立包以便更好的缓存
- 小于 10kb 的静态资源会被内联在 JavaScript 中
- `public` 中的静态资源会被复制到输出目录中

## 库

::: tip Note on Vue Dependency
在库模式中，Vue 是*外置的*。这意味着包中不会有 Vue，甚至你在代码中导入了 Vue。如果这个库会通过一个打包器使用，它将会在打包器内尝试作为一个依赖加载 Vue；否则就会回退到一个全局的 `Vue` 变量。
:::

你可以通过下面的命令对一个单独的入口构建为一个库：

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

- `dist/myLib.common.js`：一个用来被打包器消费的 CommonJS 包 (不幸的是，webpack 目前还并没有支持 ES modules 输出格式的包)

- `dist/myLib.umd.js`：一个用来直接在浏览器中或通过 AMD loader 消费的 UMD 包

- `dist/myLib.umd.min.js`：压缩后的 UMD 构建版本

- `dist/myLib.css`：提取出来的 CSS 文件 (可以通过在 `vue.config.js` 中设置 `css: { extract: false }` 强制内联)

### Vue vs. JS/TS Entry Files

When using a `.vue` file as entry, your library will directly expose the Vue component itself, because the component is always the default export.

However, when you are using a `.js` or `.ts` file as your entry, it may contain named exports, so your library will be exposed as a Module. This means the default export of your library must be accessed as `window.yourLib.default` in UMD builds, or as `const myLib = require('mylib').default` in CommonJS builds. If you don't have any named exports and wish to directly expose the default export, you can use the following webpack configuration in `vue.config.js`:

``` js
module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default'
    }
  }
}
```

## Web Components

::: tip Note on Compatibility
Web Component mode does not support IE11 and below. [More details](https://github.com/vuejs/vue-web-component-wrapper#compatibility)
:::

::: tip Note on Vue Dependency
In web component mode, Vue is *externalized.* This means the bundle will not bundle Vue even if your code imports Vue. The bundle will assume `Vue` is available on the host page as a global variable.
:::

你可以通过下面的命令对一个单独的入口构建为一个库：

```
vue-cli-service build --target wc --name my-element [entry]
```

这将会产生一个单独的 JavaScript 文件 (及其压缩后的版本) 将所有的东西都内联起来。当这个脚本被引入网页时，会注册自定义组件 `<my-element>`，其使用 `@vue/web-component-wrapper` 包裹了目标的 Vue 组件。这个包裹器会自动代理属性、特性、事件和插槽。请查阅 [`@vue/web-component-wrapper` 的文档](https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-web-component-wrapper/README.md)了解更多细节。

**注意这个包依赖了在页面上全局可用的 `Vue`。**

这个模式允许你的组件的消费者以一个普通 DOM 元素的方式使用这个 Vue 组件：

``` html
<script src="https://unpkg.com/vue"></script>
<script src="path/to/my-element.js"></script>

<!-- 可在普通 HTML 中或者其它任何框架中使用 -->
<my-element></my-element>
```

### 注册多个 Web Components 的包

当你构建一个 Web Components 组件包的时候，你也可以使用一个 glob 表达式作为入口指定多个组件目标：

```
vue-cli-service build --target wc --name foo 'src/components/*.vue'
```

当你构建多个 web component 时，`--name` 将会用于设置前缀，同时自定义元素的名称会由组件的文件名推导得出。比如一个名为 `HelloWorld.vue` 的组件携带 `--name foo` 将会生成的自定义元素名为 `<foo-hello-world>`。

### 异步 Web Components

当指定多个 Web Components 组件作为目标时，这个包可能会变得非常大，并且用户可能只想使用你的包中注册的一部分组件。这时异步 Web Components 模式会生成一个分割代码的包，带一个只提供所有组件共享的运行时，并预先注册所有的自定义组件小入口文件。一个组件真正的实现只会在页面中用到自定义元素相应的一个实例时按需获取：

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

<!-- foo-one 的实现块会在用到的时候自动获取 -->
<foo-one></foo-one>
```
