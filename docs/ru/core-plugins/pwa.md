# @vue/cli-plugin-pwa

> Плагин pwa для vue-cli

Добавляемый этим плагином service worker включается только в production окружении (к примеру, только при запуске сборки через `npm run build` или `yarn build`). Использование service worker при разработке не рекомендуется, так как может привести к ситуации, когда используются кэшированные ранее ресурсы и не учитываются последние локальные изменения.

Вместо этого в режиме разработки добавляется файл `noopServiceWorker.js`. Этот файл service worker является эффективным 'no-op', который сбрасывает любые другие service worker, зарегистрированные ранее для такой же комбинации host:port.

При необходимости протестировать service worker локально, соберите приложение и запустите простой HTTP-сервер из каталога сборки. Рекомендуется использовать браузер в инкогнито-режиме для избежания осложнений с кэшем вашего браузера.

## Конфигурация

Конфигурация осуществляется через свойство `pwa` в файле `vue.config.js`, или через поле `"vue"` в файле `package.json`.

- **pwa.workboxPluginMode**

  Выбор один из двух режимов, поддерживаемых используемым [`workbox-webpack-plugin`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin).

  - `'GenerateSW'` (по умолчанию) создание нового файла service worker каждый раз при пересборке приложения.

  - `'InjectManifest'` использование существующего файла service worker и создание копии этого файла с внедрённым в него «precache manifest».

  Руководство «[Какой плагин использовать?](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#which_plugin_to_use)» поможет выбрать один из двух режимов.

- **pwa.workboxOptions**

  Настройки, передаваемые в используемый `workbox-webpack-plugin`.

  При использовании шаблона App Shell в режиме `GenerateSW` можно настроить точку входа таким образом, чтобы убедиться, что все страницы загружаются в оффлайне:
  ```js
  navigateFallback: 'index.html'
  ```

  Для получения дополнительной информации о поддерживаемых значениях обратитесь к руководству для [`GenerateSW`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_generatesw_config) или для [`InjectManifest`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_injectmanifest_config).

- **pwa.name**

  - По умолчанию: поле "name" в файле `package.json`

    Используется в качестве значения мета-тега `apple-mobile-web-app-title` в сгенерированном HTML. Обратите внимание, необходимо отредактировать файл `public/manifest.json` для соответствия этому значению.

- **pwa.themeColor**

  - По умолчанию: `'#4DBA87'`

- **pwa.msTileColor**

  - По умолчанию: `'#000000'`

- **pwa.appleMobileWebAppCapable**

  - По умолчанию: `'no'`

    По умолчанию значение `'no'`, потому что iOS до версии 11.3 не имела надлежащей поддержки PWA. См. [эту статью](https://medium.com/@firt/dont-use-ios-web-app-meta-tag-irresponsibly-in-your-progressive-web-apps-85d70f4438cb) для более подробной информации.

- **pwa.appleMobileWebAppStatusBarStyle**

  - По умолчанию: `'default'`

- **pwa.assetsVersion**

  - По умолчанию: `''`

    Эта опция используется, если необходимо добавить версию к иконкам и манифесту для игнорирования кэша браузера. В результате добавится `?v=<pwa.assetsVersion>` к URL-адресам иконок и манифеста.

- **pwa.manifestPath**

  - По умолчанию: `'manifest.json'`

    Путь к манифесту приложения.

- **pwa.manifestOptions**

  - По умолчанию: `{}`

    Объект будет использоваться для генерации `manifest.json`

    Если не определить следующие значения в объекте, то вместо них будут использованы значения опции `pwa` или значения по умолчанию.
      - name: `pwa.name`
      - short_name: `pwa.name`
      - start_url: `'.'`
      - display: `'standalone'`
      - theme_color: `pwa.themeColor`

- **pwa.iconPaths**

  - По умолчанию:

    ```js
    {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    }
    ```

    Измените эти значения при необходимости использовать различные пути для иконок.

### Пример конфигурации

```js
// Файл vue.config.js
module.exports = {
  // ...настройки других vue-cli плагинов...
  pwa: {
    name: 'My App',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    // настройки манифеста
    manifestOptions: {
      display: 'landscape',
      background_color: '#42B883'
      // ...другие настройки манифеста...
    },

    // настройка workbox-плагина
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc необходимо в режиме InjectManifest
      swSrc: 'dev/sw.js',
      // ...другие настройки Workbox...
    }
  }
}
```

## Установка в уже созданный проект

```sh
vue add pwa
```

## Внедряемые правила webpack-chain

- `config.plugin('workbox')`
