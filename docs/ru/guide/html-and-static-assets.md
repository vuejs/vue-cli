# HTML и статические ресурсы

## HTML

### Стартовый файл

Файл `public/index.html` — шаблон, который будет обрабатываться [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin). На этапе сборки, ссылки на все ресурсы будут внедряться автоматически. Кроме того, также Vue CLI автоматически внедряет подсказки для ресурсов (`preload/prefetch`), ссылки на манифест/иконки (когда используется плагин PWA), и ссылки на ресурсы для файлов JavaScript и CSS, созданных во время сборки.

### Интерполяции

Поскольку стартовый файл используется в качестве шаблона, вы можете использотвать синтаксис [lodash template](https://lodash.com/docs/4.17.10#template) для интерполяции значений в нём:

- `<%= VALUE %>` для неэкранированной подстановки;
- `<%- VALUE %>` для экранированного HTML-кода;
- `<% expression %>` для потоков управления JavaScript.

В дополнение к [значениям по умолчанию, предоставляемым `html-webpack-plugin`](https://github.com/jantimon/html-webpack-plugin#writing-your-own-templates), все [переменные окружения в клиентском коде](./mode-and-env.md#испоnьзование-переменных-окружения-в-кnиентском-коде) также доступны напрямую. Например, чтобы использовать значение `BASE_URL`:

``` html
<link rel="icon" href="<%= BASE_URL %>favicon.ico">
```

См. также:
- [baseUrl](../config/#baseurl)

### Preload

[`<link rel="preload">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) is a type of resource hint that is used to specify resources that your pages will need very soon after loading, which you therefore want to start preloading early in the lifecycle of a page load, before the browser's main rendering machinery kicks in.

By default, a Vue CLI app will automatically generate preload hints for all files that are needed for the initial rendering the your app.

The hints are injected using [@vue/preload-webpack-plugin](https://github.com/vuejs/preload-webpack-plugin) and can be modified / deleted via `chainWebpack` as `config.plugin('preload')`.

### Prefetch

[`<link rel="prefetch">`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ) is a type of resource hint that tells the browser to prefetch content that the user may visit in the near future in the browser's idle time, after the page finishes loading.

By default, a Vue CLI app will automatically generate prefetch hints for all JavaScript files generated for async chunks (as a result of [on-demand code splitting via dynamic `import()`](https://webpack.js.org/guides/code-splitting/#dynamic-imports)).

The hints are injected using [@vue/preload-webpack-plugin](https://github.com/vuejs/preload-webpack-plugin) and can be modified / deleted via `chainWebpack` as `config.plugin('prefetch')`.

Например:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    // удаляем prefetch плагин:
    config.plugins.delete('prefetch')

    // ИЛИ
    // изменяем его настройки:
    config.plugin('prefetch').tap(options => {
      options.fileBlackList.push([/myasyncRoute(.)+?\.js$/])
      return options
    })
  }
}
```

::: tip Совет
Использование prefetch ссылок нагружает канал связи. Если у вас большое приложение с множеством асинхронных фрагментов (chunks) и ваши пользователи в основном используют мобильные устройства, а значит, чувствительны к использованию канала связи, вы можете пожелать отключить использование prefetch ссылок.
:::

### Создание многостраничного приложения

Не каждое приложение должно быть SPA. Vue CLI поддерживает создание много-страничных приложений с помощью [опции `pages` в `vue.config.js`](../config/#pages). Код приложения будет эффективно переиспользоваться между его частями для оптимизации скорости загрузки приложения.

## Обработка статических ресурсов

Статические ресурсы могут обрабатываться двумя различными способами:

- Импорт в JavaScript или указание ссылки на них в шаблоне/CSS с использованием относительных путей. Такие ресурсы будут обрабатываться webpack.

- Расположение в каталоге `public` и добавление ссылки на них с использованием абсолютных путей. Такие ресурсы просто копируются и не обрабатываются webpack.

### Импорты относительных путей

Если вы ссылаетесь на статический ресурс используя относительный путь (должен начинаться с `.`) внутри JavaScript, CSS или `*.vue` файлов, то он будет добавлен в дерево зависимостей webpack. В процессе компиляции все URL ресурсов, такие как `<img src="...">`, `background: url(...)` и CSS `@import` будут обрабатываться **как зависимости модуля**.

Например, `url(./image.png)` будет преобразован в `require('./image.png')`, а тег шаблона

``` html
<img src="./image.png">
```

будет скомпилирован в:

``` js
h('img', { attrs: { src: require('./image.png') }})
```

Внутри используется `file-loader` для определения конечного расположения файла с хэшем версии и правильный путь относительно корня, а также `url-loader` для встраивания ресурсов инлайн чей размер  меньше 10КБайт, что уменьшит количество HTTP-запросов к серверу.

### Правила преобразования URL

- Если в URL абсолютный путь (например, `/images/foo.png`), он будет оставлен как есть.

- Если URL начинается с `.`, он будет интерпретироваться как запрос модуля относительно текущего каталога и разрешаться на основе структуры каталогов вашей файловой системы.

- Если URL начинается с `~`, то всё что после него будет интерпретироваться как запрос модуля. Это означает, что вы можете ссылаться на ресурсы даже внутри `node_modules`:

  ``` html
  <img src="~/some-npm-package/foo.png">
  ```

- Если URL начинается с `@`, то он также будет интерпретироваться как запрос модуля. Это удобно, потому что Vue CLI по умолчанию добавляет псевдоним `@` для `<projectRoot>/src`.

### Каталог `public`

Any static assets placed in the `public` folder will simply be copied and not go through webpack. You need to reference to them using absolute paths.

Note we recommended importing assets as part of your module dependency graph so that they will go through webpack with the following benefits:

- Scripts and stylesheets get minified and bundled together to avoid extra network requests.
- Missing files cause compilation errors instead of 404 errors for your users.
- Result filenames include content hashes so you don’t need to worry about browsers caching their old versions.

The `public` directory is provided as an **escape hatch**, and when you reference it via absolute path, you need to take into account where your app will be deployed. If your app is not deployed at the root of a domain, you will need to prefix your URLs with the [baseUrl](../config/#baseurl):

- In `public/index.html` or other HTML files used as templates by `html-webpack-plugin`, you need to prefix the link with `<%= BASE_URL %>`:

  ``` html
  <link rel="icon" href="<%= BASE_URL %>favicon.ico">
  ```

- В шаблонах потребуется сначала передать base URL в ваш компонент:

  ``` js
  data () {
    return {
      baseUrl: process.env.BASE_URL
    }
  }
  ```

  Затем:

  ``` html
  <img :src="`${baseUrl}my-image.png`">
  ```

### Когда использовать каталог `public`

- Вам требуется файл с определённым именем в каталоге сборки.
- У вас тысячи изображений и необходимо динамически ссылаться на их пути.
- Какая-нибудь библиотека несовместима с Webpack и у вас нет другого варианта, кроме как подключать её через тег `<script>`.
