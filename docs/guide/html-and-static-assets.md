# HTML and Static Assets

## HTML

### The Index File

The file `public/index.html` is a template that will be processed with [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin). During build, asset links will be injected automatically. In addition, Vue CLI also automatically injects resource hints (`preload/prefetch`), manifest/icon links (when PWA plugin is used), and the asset links for the JavaScript and CSS files produced during the build.

### Interpolation

Since the index file is used as a template, you can use the [lodash template](https://lodash.com/docs/4.17.10#template) syntax to interpolate values in it. In addition to the [default values exposed by `html-webpack-plugin`](https://github.com/jantimon/html-webpack-plugin#writing-your-own-templates), all [client-side env variables](./mode-and-env.md#using-env-variables-in-client-side-code) are also available directly. For example, to use the `BASE_URL` value:

``` html
<link rel="icon" href="<%= BASE_URL %>favicon.ico">
```

See also: [baseUrl](../config/#baseurl)

### Preload

[`<link rel="preload">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) is a type of resource hint that is used to specify resources that your pages will need very soon after loading, which you therefore want to start preloading early in the lifecycle of a page load, before the browser's main rendering machinery kicks in.

By default, a Vue CLI app will automatically generate preload hints for all files that are needed for the initial rendering the your app.

The hints are injected using [@vue/preload-webpack-plugin](https://github.com/vuejs/preload-webpack-plugin) and can be modified / deleted via `chainWebpack` as `config.plugin('preload')`.

### Prefetch

[`<link rel="prefetch">`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ) is a type of resource hint that tells the browser to prefetch content that the user may visit in the near future in the browser's idle time, after the page finishes loading.

By default, a Vue CLI app will automatically generate prefetch hints for all JavaScript files generated for async chunks (as a result of [on-demand code splitting via dynamic `import()`](https://webpack.js.org/guides/code-splitting/#dynamic-imports)).

The hints are injected using [@vue/preload-webpack-plugin](https://github.com/vuejs/preload-webpack-plugin) and can be modified / deleted via `chainWebpack` as `config.plugin('prefetch')`.

::: tip
Prefetch links will consume bandwidth. If you have a large app with many async chunks and your user are primarily mobile and thus bandwidth-aware, you may want to disable prefetch links.
:::

### Building a Multi-Page App

Not every app has to be an SPA. Vue CLI supports building a multi-paged app using the [`pages` option in `vue.config.js`](../config/#pages). The built app will efficiently share common chunks between multiple entries for optimal loading performance.

## Static Assets Handling

Static assets can be handled in two different ways:

- Imported in JavaScript or referenced in templates/CSS via relative paths. Such references will be handled by webpack.

- Placed in the `public` directory and referenced via absolute paths. These assets will simply be copied and not go through webpack.

### Relative Path Imports

When you reference a static asset using relative path (must start with `.`) inside JavaScript, CSS or `*.vue` files, the asset will be included into webpack's dependency graph. During this compilation process, all asset URLs such as `<img src="...">`, `background: url(...)` and CSS `@import` are **resolved as module dependencies**.

For example, `url(./image.png)` will be translated into `require('./image.png')`, and

``` html
<img src="./image.png">
```

will be compiled into:

``` js
h('img', { attrs: { src: require('./image.png') }})
```

Internally, we use `file-loader` to determine the final file location with version hashes and correct public base paths, and use `url-loader` to conditionally inline assets that are smaller than 10kb, reducing the amount of HTTP requests.

### URL Transform Rules

- If the URL is an absolute path (e.g. `/images/foo.png`), it will be preserved as-is.

- If the URL starts with `.`, it's interpreted as a relative module request and resolved based on the folder structure on your file system.

- If the URL starts with `~`, anything after it is interpreted as a module request. This means you can even reference assets inside node modules:

  ``` html
  <img src="~/some-npm-package/foo.png">
  ```

- If the URL starts with `@`, it's also interpreted as a module request. This is useful because Vue CLI by default aliases `@` to `<projectRoot>/src`.

### The `public` Folder

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

- In templates, you will need to first pass the base URL to your component:

  ``` js
  data () {
    return {
      baseUrl: process.env.BASE_URL
    }
  }
  ```

  Then:

  ``` html
  <img :src="`${baseUrl}my-image.png`">
  ```

### When to use the `public` folder

- You need a file with a specific name in the build output.
- You have thousands of images and need to dynamically reference their paths.
- Some library may be incompatible with Webpack and you have no other option but to include it as a `<script>` tag.
