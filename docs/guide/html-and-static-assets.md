# HTML and Static Assets

## Understanding `baseUrl`

## HTML

### The Index File

The file `public/index.html` is a template that will be processed with [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin). During build, asset links will be injected automatically. In addition, Vue CLI also automatically injects resource hints (`preload/prefetch`), manifest/icon links (when PWA plugin is used) and inlines the webpack runtime / chunk manifest for optimal performance.

### Prefetch & Preload

### Building a Multi-Page App

## Static Assets Handling

Static assets can be handled in two different ways:

- Imported in JavaScript or referenced in templates/CSS via relative paths. Such references will be handled by webpack.

- Placed in the `public` directory and referenced via absolute paths. These assets will simply be copied and not go through webpack.

### Relative Path Imports

When you reference a static asset using relative path inside JavaScript, CSS or `*.vue` files, the asset will be included into webpack's dependency graph. During this compilation process, all asset URLs such as `<img src="...">`, `background: url(...)` and CSS `@import` are **resolved as module dependencies**.

For example, `url(./image.png)` will be translated into `require('./image.png')`, and

``` html
<img src="./image.png">
```

will be compiled into:

``` js
createElement('img', { attrs: { src: require('./image.png') }})
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

The `public` directory is provided as an **escape hatch**, and when you reference it via absolute path, you need to take into account where your app will be deployed. If your app is not deployed at the root of a domain, you will need to prefix your URLs with the base path:

- In `public/index.html`, you need to prefix the link with `<%= webpackConfig.output.publicPath %>`:

  ``` html
  <link rel="shortcut icon" href="<%= webpackConfig.output.publicPath %>favicon.ico">
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
