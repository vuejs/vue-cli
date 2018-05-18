# @vue/cli-plugin-pwa

> pwa plugin for vue-cli

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
vue add @vue/pwa
```

## Injected webpack-chain Rules

- `config.plugin('workbox')`
