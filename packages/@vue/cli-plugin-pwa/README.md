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

### Example Configuration

```js
// Inside vue.config.js
module.exports = {
  // ...other vue-cli plugin options...
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: 'dev/sw.js',
      // ...other Workbox options...
    },
    themeColor: '#4DBA87',
    msTileColor: '#000000',
  },
};
```

## Installing in an Already Created Project

``` sh
npm install -D @vue/cli-plugin-pwa
vue invoke pwa
```

## Injected webpack-chain Rules

- `config.plugin('workbox')`
