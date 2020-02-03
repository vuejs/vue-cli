# @vue/cli-plugin-pwa

> pwa plugin for vue-cli

The service worker added with this plugin is only enabled in the production environment (e.g. only if you run `npm run build` or `yarn build`). Enabling service worker in a development mode is not a recommended practice, because it can lead to the situation when previously cached assets are used and the latest local changes are not included.

Instead, in the development mode the `noopServiceWorker.js` is included. This service worker file is effectively a 'no-op' that will reset any previous service worker registered for the same host:port combination.

If you need to test a service worker locally, build the application and run a simple HTTP-server from your build directory. It's recommended to use a browser incognito window to avoid complications with your browser cache.

## Configuration

Configuration is handled via the `pwa` property of either the `vue.config.js`
file, or the `"vue"` field in `package.json`.

- **pwa.workboxPluginMode**

  This allows you to the choose between the two modes supported by the underlying
  [`workbox-webpack-plugin`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin).

  - `'GenerateSW'` (default), will lead to a new service worker file being created
  each time you rebuild your web app.

  - `'InjectManifest'` allows you to start with an existing service worker file,
  and creates a copy of that file with a "precache manifest" injected into it.

  The "[Which Plugin to Use?](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#which_plugin_to_use)"
  guide can help you choose between the two modes.

- **pwa.workboxOptions**

  These options are passed on through to the underlying `workbox-webpack-plugin`.

  For more information on what values are supported, please see the guide for
  [`GenerateSW`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_generatesw_config)
  or for [`InjectManifest`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_injectmanifest_config).

- **pwa.name**

  - Default: "name" field in `package.json`

    Used as the value for the `apple-mobile-web-app-title` meta tag in the generated HTML. Note you will need to edit `public/manifest.json` to match this.

- **pwa.themeColor**

  - Default: `'#4DBA87'`

- **pwa.msTileColor**

  - Default: `'#000000'`

- **pwa.appleMobileWebAppCapable**

  - Default: `'no'`

    This defaults to `'no'` because iOS before 11.3 does not have proper PWA support. See [this article](https://medium.com/@firt/dont-use-ios-web-app-meta-tag-irresponsibly-in-your-progressive-web-apps-85d70f4438cb) for more details.

- **pwa.appleMobileWebAppStatusBarStyle**

  - Default: `'default'`

- **pwa.assetsVersion**

  - Default: `''`

    This option is used if you need to add a version to your icons and manifest, against browser’s cache. This will append `?v=<pwa.assetsVersion>` to the URLs of the icons and manifest.

- **pwa.manifestPath**

  - Default: `'manifest.json'`

    The path of app’s manifest. If the path is an URL, the plugin won't generate a manifest.json in the dist directory during the build.

- **pwa.manifestOptions**

  - Default: `{}`

    The object will be used to generate the `manifest.json`

    If the following attributes are not defined in the object, the options of `pwa` or default options will be used instead.
      - name: `pwa.name`
      - short_name: `pwa.name`
      - start_url: `'.'`
      - display: `'standalone'`
      - theme_color: `pwa.themeColor`

- **pwa.iconPaths**

  - Defaults:

    ```js
    {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    }
    ```

    Change these values to use different paths for your icons.

### Example Configuration

```js
// Inside vue.config.js
module.exports = {
  // ...other vue-cli plugin options...
  pwa: {
    name: 'My App',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    // configure the workbox plugin
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: 'dev/sw.js',
      // ...other Workbox options...
    }
  }
}
```

## Installing in an Already Created Project

``` sh
vue add pwa
```

## Injected webpack-chain Rules

- `config.plugin('workbox')`
