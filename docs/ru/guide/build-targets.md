# Цели сборки

При запуске `vue-cli-service build` вы можете определить цели сборки опцией `--target`. Это позволит использовать одну кодовую базу для создания сборок под различные случаи.

## Приложение (App)

Приложение — цель сборки по умолчанию. В этом режиме:

- `index.html` с внедрением ресурсов и подсказок для пред-загрузки
- сторонние библиотеки разделяются на отдельные чанки для лучшего кэширования
- статические ресурсы менее 10КБайт будут вставлены инлайн в JavaScript
- статические ресурсы в `public` будут скопированы в каталог сборки

## Библиотека (Library)

::: tip Примечание о зависимости Vue
В режиме библиотеки Vue is *externalized*. This means the bundle will not bundle Vue even if your code imports Vue. If the lib is used via a bundler, it will attempt to load Vue as a dependency through the bundler; otherwise, it falls back to a global `Vue` variable.
:::

Вы можете запустить сборку одной точки входа в качестве библиотеки с помощью:

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

Точка входа может быть `.js` или `.vue` файлом. Если точка входа не указана, то будет использоваться `src/App.vue`.

Сборка библиотеки сгенерирует:

- `dist/myLib.common.js`: A CommonJS bundle for consuming via bundlers (unfortunately, webpack currently does not support ES modules output format for bundles yet)

- `dist/myLib.umd.js`: A UMD bundle for consuming directly in browsers or with AMD loaders

- `dist/myLib.umd.min.js`: Minified version of the UMD build.

- `dist/myLib.css`: Extracted CSS file (can be forced into inlined by setting `css: { extract: false }` in `vue.config.js`)

### Vue vs. JS / TS файлы точек входа

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

## Веб-компонент (Web Component)

::: tip Примечание совместимости
Режим веб-компонентов не поддерживается IE11 и ниже. [Подробнее](https://github.com/vuejs/vue-web-component-wrapper#compatibility)
:::

::: tip Примечание зависимости Vue
In web component mode, Vue is *externalized.* This means the bundle will not bundle Vue even if your code imports Vue. The bundle will assume `Vue` is available on the host page as a global variable.
:::

Вы можете запустить сборку одной точки входа в качестве веб-компонента с помощью:

```
vue-cli-service build --target wc --name my-element [entry]
```

This will produce a single JavaScript file (and its minified version) with everything inlined. The script, when included on a page, registers the `<my-element>` custom element, which wraps the target Vue component using `@vue/web-component-wrapper`. The wrapper automatically proxies properties, attributes, events and slots. See the [docs for `@vue/web-component-wrapper`](https://github.com/vuejs/vue-web-component-wrapper) for more details.

**Note the bundle relies on `Vue` being globally available on the page.**

This mode allows consumers of your component to use the Vue component as a normal DOM element:

``` html
<script src="https://unpkg.com/vue"></script>
<script src="path/to/my-element.js"></script>

<!-- use in plain HTML, or in any other framework -->
<my-element></my-element>
```

### Сборка, регистрирующая несколько веб-компонентов

При создании веб-компонентов можно также указать несколько компонентов с помощью glob в качестве входной точки:

```
vue-cli-service build --target wc --name foo 'src/components/*.vue'
```

When building multiple web components, `--name` will be used as the prefix and the custom element name will be inferred from the component filename. For example, with `--name foo` and a component named `HelloWorld.vue`, the resulting custom element will be registered as `<foo-hello-world>`.

### Асинхронный веб-компонент (Async Web Component)

When targeting multiple web components, the bundle may become quite large, and the user may only use a few of the components your bundle registers. The async web component mode produces a code-split bundle with a small entry file that provides the shared runtime between all the components, and registers all the custom elements upfront. The actual implementation of a component is then fetched on-demand only when an instance of the corresponding custom element is used on the page:

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

Now on the page, the user only needs to include Vue and the entry file:

``` html
<script src="https://unpkg.com/vue"></script>
<script src="path/to/foo.min.js"></script>

<!-- foo-one's implementation chunk is auto fetched when it's used -->
<foo-one></foo-one>
```
