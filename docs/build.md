# vue build

`vue build` command gives you a zero-configuration development setup, install once and build everywhere.

## Features

- **Not a boilerplate**: run a single command to development your app
- **Out of the box**: ES2015, single-file component with hot reloading and custom CSS preprocessors
- **Customizable**: populate a `~/.vue/webpack.config.js` for custom webpack config
- **Single-file component mode**: just run `vue build Component.vue` and boom!

## Get started

```bash
$ vue build entry.js
# or
$ vue build component.vue
```

To build for production:

```bash
$ vue build entry.js --prod
```

For CLI usages:

```bash
$ vue build -h
```

## Configuration files

By default, we use `~/.vue/config.js` and `~/.vue/webpack.config.js` if they exist. You can use `--config [dir]` to set a custom config directory which is relative to `process.cwd()` instead of using `.vue` directory.

To disable config files, simply `--no-config`.

### config.js

CLI options will be assign to configs here.

#### port

Type: `number`

Port of dev server.

#### webpack(webpackConfig, options, webpack)

Type: `function`

- webpackConfig: current webpack config
- options: CLI options (assigned with config.js)
- webpack: The `webpack` module

Return a new webpack config.

### webpack.config.js

All the webpack options and [`devServer`](http://webpack.github.io/docs/webpack-dev-server.html#api) options are available here.

## Recipes

### Custom CSS preprocessors

CSS preprocessors (and CSS extraction) work out of the box, just install relevant loaders and you're all set! For example, add `sass` support:

```bash
$ npm i -D node-sass sass-loader
```

### Using Babel

By default we use [buble](buble.surge.sh/guide) to transpile ES2015 code, if you want to use Babel for ES2015+ code:

```js
// .vue/webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/, 
        loader: 'babel-loader', 
        exclude: [/node_modules/],
        options: {/* babel presets and plugins */}
      }
    ]
  }
}
```

Don't forget to install `babel-core` `babel-loader` and relevant presets in your project or `.vue` directory.