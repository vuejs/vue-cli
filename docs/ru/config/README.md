---
sidebar: auto
---

# Конфигурация

## Глобальная конфигурация CLI

Некоторые глобальные настройки для `@vue/cli`, такие как предпочитаемый менеджер пакетов и ваши локальные пресеты настроек, сохранены в JSON-файле `.vuerc` в вашем домашнем каталоге. Вы можете использовать любой редактор для изменения этих настроек.

Также можно воспользоваться командой `vue config` для изучения или изменения глобальной конфигурации CLI.

## Целевые браузеры

Подробнее в разделе [совместимость с браузерами](../guide/browser-compatibility.md#browserslist).

## vue.config.js

`vue.config.js` — опциональный файл конфигурации, которую автоматически загружает `@vue/cli-service` если находит его в корневом каталоге вашего проекта (рядом с файлом `package.json`). Вы также можете использовать поле `vue` в `package.json`, но, обратите внимание, в таком случае вы будете ограничены только JSON-совместимыми значениями.

Файл должен экспортировать объект с настройками:

``` js
// vue.config.js
module.exports = {
  // настройки...
}
```

### baseUrl

Устаревшая опция, начиная с версии Vue CLI 3.3, используйте вместо неё [`publicPath`](#publicpath).

### publicPath

- Тип: `string`
- По умолчанию: `'/'`

  Базовый URL-адрес сборки вашего приложения, по которому оно будет опубликовано (именуемая как `baseUrl` до версии Vue CLI 3.3). Это аналог опции webpack `output.publicPath`, но Vue CLI также использует это значение в других целях, поэтому вы должны **всегда использовать `publicPath` вместо изменения опции `output.publicPath`**.

  По умолчанию Vue CLI считает, что публикация будет выполнена в корень домена, например `https://www.my-app.com/`. Если приложение публикуется в подкаталог, то необходимо указать этот путь с помощью этой опции. Например, если приложение будет публиковаться по адресу `https://www.foobar.com/my-app/`, установите `publicPath` в значение `'/my-app/'`.

  Значение также может быть пустой строкой (`''`) или относительным путём (`./`), чтобы все ресурсы подключались через относительные пути. Это позволит публиковать сборку в любой публичный каталог, или использовать в окружении файловой системы, например в гибридном приложении Cordova.

  ::: warning Ограничения относительного publicPath
  Относительный `publicPath` имеет некоторые ограничения и его следует избегать если:

  - Вы используете маршрутизацию HTML5 `history.pushState`;

  - Вы используете опцию `pages` для создания многостраничного приложения (MPA).
  :::

  Опция может быть полезна и на этапе разработки. Если вы хотите запускать сервер разработки из корня сайта, то можно устанавливать значение по условию:

  ``` js
  module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
      ? '/production-sub-path/'
      : '/'
  }
  ```

### outputDir

- Тип: `string`
- По умолчанию: `'dist'`

  Каталог, в котором при запуске `vue-cli-service build` будут создаваться файлы сборки для production. Обратите внимание, что этот каталог удаляется каждый раз перед началом сборки (это поведение можно отключить опцией `--no-clean` в команде сборки).

  ::: tip Совет
  Всегда используйте `outputDir` вместо изменения опции webpack `output.path`.
  :::

### assetsDir

- Тип: `string`
- По умолчанию: `''`

  Каталог (относительно `outputDir`) для хранения сгенерированных статических ресурсов (js, css, img, fonts).

  ::: tip Совет
  `assetsDir` игнорируется при перезаписи опций имени файла (filename) или имени фрагментов (chunkFilename) сгенерированных ресурсов.
  :::

### indexPath

- Тип: `string`
- По умолчанию: `'index.html'`

  Путь к сгенерированному `index.html` (относительно `outputDir`). Также можно указать абсолютный путь.

### filenameHashing

- Тип: `boolean`
- По умолчанию: `true`

  По умолчанию генерируемые статические ресурсы содержат хэши в именах файлов для лучшего управления кэшированием. Однако для этого требуется чтобы индексный HTML автоматически генерировался Vue CLI. Если вы не можете использовать индексный HTML, генерируемый CLI, можно отключить хэширование в именах файлов, установив параметр в значение `false`.

### pages

- Тип: `Object`
- По умолчанию: `undefined`

  Сборка приложения в многостраничном режиме (MPA). У каждой «страницы» должна быть соответствующая точка входа (entry) в виде JavaScript-файла. Значением может быть объект, где ключ — имя точки входа, а значение:

  - объектом, который определяет свои `entry`, `template`, `filename`, `title` и `chunks` (все опциональные, за исключением `entry`). Любые другие свойства, указанные рядом с ними будут переданы непосредственно в `html-webpack-plugin`, для возможности более тонкой настройки этого плагина;
  - или строкой, определяющей свою `entry`.

  ``` js
  module.exports = {
    pages: {
      index: {
        // точка входа для страницы
        entry: 'src/index/main.js',
        // исходный шаблон
        template: 'public/index.html',
        // в результате будет dist/index.html
        filename: 'index.html',
        // когда используется опция title, то <title> в шаблоне
        // должен быть <title><%= htmlWebpackPlugin.options.title %></title>
        title: 'Index Page',
        // все фрагменты, добавляемые на этой странице, по умолчанию
        // это извлеченные общий фрагмент и вендорный фрагмент.
        chunks: ['chunk-vendors', 'chunk-common', 'index']
      },
      // когда используется строковый формат точки входа, то
      // шаблон будет определяться как `public/subpage.html`,
      // а если таковой не будет найден, то `public/index.html`.
      // Выходное имя файла будет определено как `subpage.html`.
      subpage: 'src/subpage/main.js'
    }
  }
  ```

  ::: tip Совет
  При сборке в многостраничном режиме, конфигурация webpack будет содержать разные плагины (будут несколько экземпляров `html-webpack-plugin` и `preload-webpack-plugin`). Чтобы убедиться в корректности, проверяйте конфигурацию командой `vue inspect`, если вы изменяете настройки для этих плагинов.
  :::

### lintOnSave

- Тип: `boolean | 'error'`
- По умолчанию: `true`

  Выполнять ли линтинг кода при сохранении во время разработки с помощью [eslint-loader](https://github.com/webpack-contrib/eslint-loader). Эта опция действует только когда установлен плагин [`@vue/cli-plugin-eslint`](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint).

  Когда значение `true`, `eslint-loader` показывает ошибки линтинга как предупреждения. По умолчанию предупреждения выводятся в терминал и не останавливают сборку ошибкой.

  Чтобы ошибки линтинга отображались в браузере, можно указать `lintOnSave: 'error'`. Тогда `eslint-loader` будет всегда генерировать ошибки. Это также означает, что ошибки линтинга будут останавливать сборку ошибкой.

  Кроме того, вы можете настроить отображение в браузере предупреждений и ошибок:

  ``` js
  // vue.config.js
  module.exports = {
    devServer: {
      overlay: {
        warnings: true,
        errors: true
      }
    }
  }
  ```

  Когда значение `lintOnSave` приводится к `true`, `eslint-loader` будет применяться как в разработке, так и в production. Если вы хотите отключить `eslint-loader` при сборке в production, можете воспользоваться следующей конфигурацией:

  ``` js
  // vue.config.js
  module.exports = {
    lintOnSave: process.env.NODE_ENV !== 'production'
  }
  ```

### runtimeCompiler

- Тип: `boolean`
- По умолчанию: `false`

  Использование сборки Vue которая содержит компилятор шаблонов. Установка значения в `true` позволит вам использовать опцию `template` в компонентах Vue, но дополнительно добавит 10 КБайт кода в ваше приложение.

  См. также: [Runtime + Компилятор vs. Runtime-only](https://ru.vuejs.org/v2/guide/installation.html#Runtime-Компилятор-vs-Runtime-only).

### transpileDependencies

- Тип: `Array<string | RegExp>`
- По умолчанию: `[]`

  По умолчанию `babel-loader` игнорирует все файлы из `node_modules`. Если вы хотите явно транспилировать зависимость с помощью Babel, то вы можете перечислить её в этой опции.

### productionSourceMap

- Тип: `boolean`
- По умолчанию: `true`

  Установка в `false` может ускорить сборку для production, если не требуются source maps.

### crossorigin

- Тип: `string`
- По умолчанию: `undefined`

  Настройка атрибутов `crossorigin` для тегов `<link rel="stylesheet">` и `<script>` в сгенерированном HTML.

  Обратите внимание, это повлияет только на теги, внедряемые `html-webpack-plugin` — теги, добавленные непосредственно в шаблон (`public/index.html`) не затрагиваются.

  См. также: [настройка атрибутов CORS](https://developer.mozilla.org/ru/docs/Web/HTML/CORS_settings_attributes)

### integrity

- Тип: `boolean`
- По умолчанию: `false`

  Установите в значение `true`, чтобы использовать [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) (SRI) для тегов `<link rel="stylesheet">` и `<script>` в сгенерированном HTML. Если файлы сборки будут размещены на CDN, то рекомендуется включать опцию для дополнительной безопасности.

  Обратите внимание, это повлияет только на теги внедряемые `html-webpack-plugin` — теги добавленные непосредственно в шаблон (`public/index.html`) не затрагиваются.

  Кроме того, когда включён SRI, подсказки preload ресурсов отключены из-за [ошибки в Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=677022), которая заставляет ресурсы загружаться дважды.

### configureWebpack

- Тип: `Object | Function`

  Если значение объект — он будет объединён в финальную конфигурацию с помощью [webpack-merge](https://github.com/survivejs/webpack-merge).

  Если значение функция — она получит итоговую конфигурацию в качестве аргумента. Функция может либо изменить конфигурацию, либо ничего не возвращать, ИЛИ вернуть клонированную или объединённую версию конфигурации.

  См. также: [Работа с Webpack — Простая конфигурация](../guide/webpack.md#простая-конфигурация)

### chainWebpack

- Тип: `Function`

  Функция, которая получает экземпляр `ChainableConfig` с помощью [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain). Позволяет производить более тонкую настройку внутренней конфигурации webpack.

  См. также: [Работа с Webpack — Chaining (Продвинутый вариант)](../guide/webpack.md#chaining-продвинутый-вариант)

### css.modules

- Тип: `boolean`
- По умолчанию: `false`

  По умолчанию, только файлы заканчивающиеся на `*.module.[ext]` обрабатываются как CSS-модули. Установка в значение `true` позволит вам убрать `.module` из имён файлов и обрабатывать все `*.(css|scss|sass|less|styl(us)?)` файлы как CSS-модули.

  См. также: [Работа с CSS — CSS-модули](../guide/css.md#css-модуnи)

### css.extract

- Тип: `boolean | Object`
- По умолчанию: `true` в режиме production, `false` в режиме development

  Извлечение CSS из ваших компонентов в отдельные CSS-файлы (вместо инлайна в JavaScript и динамического внедрения).

  Это всегда отключается при сборке веб-компонентов (в этом случае инлайн стили внедряются в shadowRoot).

  При сборке библиотеки вы можете также установить значение в `false` чтобы вашим пользователям не приходилось импортировать CSS самостоятельно.

  Извлечение CSS отключено по умолчанию в режиме `development`, поскольку оно несовместимо с горячей перезагрузкой CSS. Тем не менее, вы всё равно можете принудительно использовать извлечение стилей всегда, установив значение в `true`.

### css.sourceMap

- Тип: `boolean`
- По умолчанию: `false`

  Использование source maps для CSS. Установка этого значения в `true` может повлиять на производительность сборки.

### css.loaderOptions

- Тип: `Object`
- По умолчанию: `{}`

  Передача настроек в загрузчики относящиеся к CSS. Например:

  ``` js
  module.exports = {
    css: {
      loaderOptions: {
        css: {
          // эти настройки будут переданы в css-loader
        },
        postcss: {
          // эти настройки будут переданы в postcss-loader
        }
      }
    }
  }
  ```

  Поддерживаемые загрузчики:

  - [css-loader](https://github.com/webpack-contrib/css-loader)
  - [postcss-loader](https://github.com/postcss/postcss-loader)
  - [sass-loader](https://github.com/webpack-contrib/sass-loader)
  - [less-loader](https://github.com/webpack-contrib/less-loader)
  - [stylus-loader](https://github.com/shama/stylus-loader)

  См. также: [Передача настроек в загрузчики пре-процессоров](../guide/css.md#передача-настроек-в-загрузчики-пре-процессоров)

  ::: tip Совет
  Этот способ предпочтительнее, чем менять вручную конкретные загрузчики через `chainWebpack`, так как эти параметры могут применяться в нескольких местах, где используется соответствующий загрузчик.
  :::

### devServer

- Тип: `Object`

  Поддерживаются [все настройки для `webpack-dev-server`](https://webpack.js.org/configuration/dev-server/), но следует обратить внимание:

  - Некоторые значения, такие как `host`, `port` и `https`, могут перезаписываться флагами командной строки.

  - Некоторые значения, такие как `publicPath` и `historyApiFallback`, нельзя изменять, поскольку они должны быть синхронизированы с [publicPath](#publicpath) для правильной работы сервера разработки.

### devServer.proxy

- Тип: `string | Object`

  Если ваше фронтенд-приложение и бэкенд сервер API не работают на одном хосте, то вам понадобится на этапе разработки проксировать запросы к API. Это можно настроить с помощью опции `devServer.proxy` в файле `vue.config.js`.

  `devServer.proxy` может быть строкой, указывающей на сервер API для разработки:

  ``` js
  module.exports = {
    devServer: {
      proxy: 'http://localhost:4000'
    }
  }
  ```

  Это скажет серверу разработки проксировать любые неизвестные запросы (запросы, которые не соответствуют статическому файлу) на адрес `http://localhost:4000`.

  Если вам нужно больше контроля поведения прокси-сервера, вы также можете использовать объект с парами опций `path: options`. См. полный список опций [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#proxycontext-config):

  ``` js
  module.exports = {
    devServer: {
      proxy: {
        '^/api': {
          target: '<url>',
          ws: true,
          changeOrigin: true
        },
        '^/foo': {
          target: '<other_url>'
        }
      }
    }
  }
  ```

### parallel

- Тип: `boolean`
- По умолчанию: `require('os').cpus().length > 1`

  Использовать ли `thread-loader` для транспиляции Babel или TypeScript. Включается для production-сборок, когда система имеет более 1 процессорных ядер.

### pwa

- Тип: `Object`

  Конфигурация для [плагина PWA](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa).

### pluginOptions

- Тип: `Object`

  Этот объект не проходит никакой валидации своей структуры, поэтому можно его использовать для передачи произвольных параметров сторонним плагинам. Например:

  ``` js
  module.exports = {
    pluginOptions: {
      foo: {
        // плагины могут получить доступ к этим настройкам
        // через `options.pluginOptions.foo`.
      }
    }
  }
  ```

## Babel

Babel можно настроить через файл конфигурации `babel.config.js`.

::: tip Совет
Vue CLI использует `babel.config.js` — новый формат конфигурации Babel 7. В отличие от `.babelrc` или поля `babel` в `package.json`, этот файл конфигурации не использует разрешение на основе расположения файлов в проекте и последовательно применяется к каждому файлу, включая зависимости внутри `node_modules`. Рекомендуется всегда использовать `babel.config.js` в проектах Vue CLI  вместо других форматов.
:::

Все приложения Vue CLI используют `@vue/babel-preset-app`, который включает в себя `babel-preset-env`, поддержку JSX и оптимизированную конфигурацию для получения итоговой сборки минимального размера. Подробнее [в его документации](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app) и опциях пресета.

Подробнее в разделе [Полифилы](../guide/browser-compatibility.md#поnифиnы) этого руководства.

## ESLint

ESLint можно настроить через `.eslintrc` или поле `eslintConfig` в файле `package.json`.

Подробнее на странице плагина [@vue/cli-plugin-eslint](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint).

## TypeScript

TypeScript можно настроить через `tsconfig.json`.

Подробнее на странице плагина [@vue/cli-plugin-typescript](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript).

## Модульное тестирование

### Jest

Подробнее на странице плагина [@vue/cli-plugin-unit-jest](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest).

### Mocha (через `mocha-webpack`)

Подробнее на странице плагина [@vue/cli-plugin-unit-mocha](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-mocha).

## E2E тестирование

### Cypress

Подробнее на странице плагина [@vue/cli-plugin-e2e-cypress](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-cypress).

### Nightwatch

Подробнее на странице плагина [@vue/cli-plugin-e2e-nightwatch](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch).
