## CLI Service

- [Using the Binary](#using-the-binary)
- [serve](#serve)
  - [Configuring Proxy](#configuring-proxy)
- [build](#build)
  - [Caching and Parallel Mode](#caching-and-parallel-mode)
  - [Building as Library or Web Component](#building-as-library-or-web-component)
  - [DLL Mode](#dll-mode)
- [inspect](#inspect)
- [Checking All Available Commands](#checking-all-available-commands)

### Using the Binary

Inside a Vue CLI project, `@vue/cli-service` installs a binary named `vue-cli-service`. You can access the binary directly as `vue-cli-service` in npm scripts, or as `./node_modules/.bin/vue-cli-service` from the terminal.

This is what you will see in the `package.json` of a project using the default preset:

``` json
{
  "scripts": {
    "serve": "vue-cli-service serve --open",
    "build": "vue-cli-service build"
  }
}
```

### serve

```
Usage: vue-cli-service serve [options]

Options:

  --open    open browser on server start
  --mode    specify env mode (default: development)
  --host    specify host (default: 0.0.0.0)
  --port    specify port (default: 8080)
  --https   use https (default: false)
```

`vue-cli-service serve` starts a dev server based on [webpack-dev-server](https://github.com/webpack/webpack-dev-server). It comes with hot-module-replacement (HMR) out of the box.

You can configure the dev server's behavior using the `devServer` option in `vue.config.js`:

``` js
module.exports = {
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: null, // string | Object
    before: app => {
      // app is an express instance
    }
  }
}
```

In addition to these default values, [all options for `webpack-dev-server`](https://webpack.js.org/configuration/dev-server/) are also supported.

#### Configuring Proxy

`devServer.proxy` can be a string pointing to the development API server:

``` js
module.exports = {
  devServer: {
    proxy: 'http://localhost:4000'
  }
}
```

This will tell the dev server to proxy any unknown requests (requests that did not match a static file) to `http://localhost:4000`.

If you want to have more control over the proxy behavior, you can also use an object with `path: options` pairs. Consult [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#proxycontext-config) for full options:

``` js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: '<url>',
        ws: true
      },
      '/foo': {
        target: '<other_url>'
      }
    }
  }
}
```

### build

```
Usage: vue-cli-service build [options] [entry|pattern]

Options:

  --mode    specify env mode (default: production)
  --dest    specify output directory (default: dist)
  --target  app | lib | wc | wc-async (default: app)
  --name    name for lib or web-component mode (default: "name" in package.json or entry filename)
```

`vue-cli-service build` produces a production-ready bundle in the `dist/` directory, with minification for JS/CSS/HTML and auto vendor chunk splitting for better caching. The chunk manifest is inlined into the HTML.

#### Caching and Parallel Mode

- `cache-laoder` is enabled for Babel/TypeScript transpilation by default.
- `thread-loader` will be enabled for Babel/TypeScript transpilation when the machine has more than 1 CPI cores.

#### Building as Library or Web Components

It is also possible to build any component(s) inside your project as a library or as web components. See [Build Targets](./build-targets.md) for more details.

#### DLL Mode

If your app has a large amount of dependency libraries, you can improve the build performance by opting into DLL mode. DLL mode builds your dependencies into a separate vendor bundle which will be reused on future builds as long as your dependencies did not change.

To enable DLL mode, set the `dll` option in `vue.config.js` to `true`:

``` js
// vue.config.js
module.exports = {
  dll: true
}
```

This by default builds **all the modules listed in the `dependencies` field in `package.json`** into the DLL bundle. It is important that you correctly list your dependencies, otherwise it may end up including unnecessary code.

If you wish to have finer grained control over what modules to be included in the DLL bundle, you can also provide an Array of modules to the `dll` option:

``` js
// vue.config.js
module.exports = {
  dll: [
    'dep-a',
    'dep-b/some/nested/file.js'
  ]
}
```

### inspect

```
Usage: vue-cli-service inspect [options] [...paths]

Options:

  --mode    specify env mode (default: development)
```

You can use `vue-cli-service inspect` to inspect the webpack config inside a Vue CLI project. See [Inspecting Webpack Config](./webpack.md#inspecting-the-projects-webpack-config) for more details.

### Checking All Available Commands

Some CLI plugins  will inject additional commands to `vue-cli-service`. For example, `@vue/cli-plugin-eslint` injects the `vue-cli-service lint` command. You can see all injected commands by running:

``` sh
./node_modules/.bin/vue-cli-service help
```

You can also learn about the available options of each command with:

``` sh
./node_modules/.bin/vue-cli-service help [command]
```
