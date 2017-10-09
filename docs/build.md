# vue build

`vue build` command gives you a zero-configuration development setup, install once and build everywhere.

## Features

- **Not a boilerplate**: run a single command to develop your app
- **Out of the box**: ES2015, single-file component with hot reloading and custom CSS preprocessors
- **Customizable**: populate a `~/.vue/webpack.config.js` for custom webpack config
- **Single-file component mode**: simply run `vue build Component.vue` and test it out in the browser!

## Get started

Make sure that you've installed `vue-cli` with `npm >= 3` or `yarn >= 0.7`.

Populate an app entry `./index.js` in your project:

```js
import Vue from 'vue'

new Vue({
  el: '#app',
  render: h => h('h2', 'hello world')
})
```

And then run `vue build index.js` and go to `http://localhost:4000`

**To build for production (minimized and optimized):**

```bash
$ vue build index.js --prod
```

If you want to directly test a component without manually create a Vue instance for it, try:

```bash
$ vue build Component.vue
```

<details><summary>How does this work?</summary><br>
When the input file ends with `.vue` extension, we use a [default app entry](/lib/default-entry.es6) to load the given component, otherwise we treat it as a normal webpack entry. For jsx component which ends with `.js` extension, you can enable this behavior manually by adding `--mount`.
</details>

**To distribute component:**

```bash
$ vue build Component.vue --prod --lib
```

This will create an optimized bundle in UMD format, and the name of exported library is set to `Component`, you can use `--lib [CustomLibraryName]` to customize it.

Note that in some cases you may use [`externals`](https://webpack.js.org/configuration/externals/) to exclude some modules from your bundle.

**Watch mode:**

```bash
$ vue build index.js --watch
```

It's similar to `development mode` but does not add hot-reloading support and uses a real file system.

**For more CLI usages:**

```bash
$ vue build -h
```

## Configuration files

By default, we use `~/.vue/config.js` and `~/.vue/webpack.config.js` if they exist.

To use a custom config file, add `--config [file]`

To use a custom webpack config file, add `--webpack [file]`

### config.js

You can define CLI options in this file.

#### entry

Type: `string` `Array` `Object`

It's the first argument of `vue build` command, eg: `vue build entry.js`. You can set it here to omit it in CLI arguments.

The single-component mode (`--mount`) will not work if you set `entry` to an `Array` or `Object`.

- `Array`: Override `webpackConfig.entry.client`
- `Object`: Override `webpackConfig.entry`
- `string`: Added to `webpackConfig.entry.client` or used as `webpackConfig.resolve.alias['your-tasteful-component']` in single-component mode.

#### port

Type: `number`<br>
Default: `4000`

Port of dev server.

#### webpack

Type: `function` `string` `object`

##### function

`webpack(webpackConfig, options, webpack)`

- webpackConfig: current webpack config
- options: CLI options (assigned with config.js)
- webpack: The `webpack` module

Return a new webpack config.

##### string

Used as the path to webpack config file, eg: `--webpack webpack.config.js`

##### object

Directly use as webpack config.

Note that we use [webpack-merge](https://github.com/survivejs/webpack-merge) to merge your webpack config with default webpack config.

#### autoprefixer

Type: `object`

Autoprefixer options, default value:

```js
{
  browsers: ['ie > 8', 'last 5 versions']
}
```

#### postcss

Type: `Object` `Array` `Function`

PostCSS options, if it's an `Array` or `Function`, the default value will be override:

```js
{
  plugins: [
    require('autoprefixer')(options.autoprefixer)
  ]
}
```

#### babel

Type: `Object`

[Babel options](https://github.com/babel/babel-loader#options). You can set `babel.babelrc` to false to disable using `.babelrc`.

#### html

Type: `Object` `Array` `boolean`

[html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) options, use this option to customize `index.html` output, default value:

```js
{
  title: 'Vue App',
  template: path.join(__dirname, '../lib/template.html')
}
```

Check out the [default template](/lib/template.html) file we use. To disable generating html file, you can set `html` to `false`.

#### filename

Set custom filename for `js` `css` `static` files:

```js
{
  filename: {
    js: 'index.js',
    css: 'style.css',
    static: 'static/[name].[ext]'  
  }
}
```

#### disableCompress

Type: `boolean`

In production mode, all generated files will be compressed and produce sourcemaps file. You can use `--disableCompress` to disable this behavior.

#### hmrEntries

Type: `Array`<br>
Default: `['client']`

Add `webpack-hot-middleware` HMR client to specific webpack entries. By default your app is loaded in `client` entry, so we insert it here.

#### proxy

Type: `string`, `Object`

To tell the development server to serve any `/api/*` request to your API server in development, use the `proxy` options:

```js
module.exports = {
  proxy: 'http://localhost:8080/api'
}
```

This way, when you fetch `/api/todos` in your Vue app, the development server will proxy your request to `http://localhost:8080/api/todos`.

We use [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) under the hood, so the `proxy` option can also be an object:

```js
module.exports = {
  proxy: {
    '/api/foo': 'http://localhost:8080/api',
    '/api/fake-data': {
      target: 'http://jsonplaceholder.typicode.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/fake-data': ''
      }
    }
  }
}
```

Keep in mind that proxy only has effect in development.

#### setup

Type: `function`

Perform some custom logic to development server:

```js
module.exports = {
  setup(app) {
    app.get('/api', (req, res) => {
      res.end('This is the API')
    })
  }
}
```

#### run(webpackConfig, options)

Type: `function`

You can use a custom `run` function to perform your own build process instead of the default one. For example, run karma with the processed webpack config:

```js
const Server = require('karma').Server

module.exports = {
  run(webpackConfig) {
    const server = new Server({
      webpack: webpackConfig,
      // other karma options...
    }, exitCode => {
      console.log('Karma has exited with ' + exitCode)
      process.exit(exitCode)
    })
    server.start()
  }
}
```

### webpack.config.js

All the webpack options are available here.

## Recipes

### Custom CSS preprocessors

CSS preprocessors (and CSS extraction) work out of the box, install relevant loaders and you're all set! For example, add `sass` support:

```bash
$ npm i -D node-sass sass-loader
```

Since all CSS will be piped through `postcss-loader`, `autoprefixer` and `postcss` options will always work no matter what CSS preprocessors you're using.

### Custom babel config

By default we only use a single babel preset: [babel-preset-vue-app](https://github.com/egoist/babel-preset-vue-app) which includes following features:

- ES2015/2016/2017 and Stage-2 features
- Transform `async/await` and `generator`
- Transform Vue JSX

You can set `babel` option in config file or populate a `.babelrc` in project root directory to override it.

### Copy static files

Everything in `./static` folder will be copied to dist folder, for example: `static/favicon.ico` will be copied to `dist/favicon.ico`.
