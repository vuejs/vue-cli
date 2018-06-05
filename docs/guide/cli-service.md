# CLI Service

## Using the Binary

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

## serve

```
Usage: vue-cli-service serve [options]

Options:

  --open    open browser on server start
  --copy    copy url to clipboard on server start
  --mode    specify env mode (default: development)
  --host    specify host (default: 0.0.0.0)
  --port    specify port (default: 8080)
  --https   use https (default: false)
```

## build

```
Usage: vue-cli-service build [options] [entry|pattern]

Options:

  --mode    specify env mode (default: production)
  --dest    specify output directory (default: dist)
  --target  app | lib | wc | wc-async (default: app)
  --name    name for lib or web-component mode (default: "name" in package.json or entry filename)
  --watch   watch for changes
```

`vue-cli-service build` produces a production-ready bundle in the `dist/` directory, with minification for JS/CSS/HTML and auto vendor chunk splitting for better caching. The chunk manifest is inlined into the HTML.

### Caching and Parallel Mode

- `cache-loader` is enabled for Vue/Babel/TypeScript compilations by default. Files are cached inside `node_modules/.cache` - if running into compilation issues, always try deleting the cache directory first.

- `thread-loader` will be enabled for Babel/TypeScript transpilation when the machine has more than 1 CPU cores.

## Building as Library or Web Components

It is also possible to build any component(s) inside your project as a library or as web components. See [Build Targets](./build-targets.md) for more details.

## inspect

```
Usage: vue-cli-service inspect [options] [...paths]

Options:

  --mode    specify env mode (default: development)
```

You can use `vue-cli-service inspect` to inspect the webpack config inside a Vue CLI project. See [Inspecting Webpack Config](../config/#inspecting-the-projects-webpack-config) for more details.

## Checking All Available Commands

Some CLI plugins  will inject additional commands to `vue-cli-service`. For example, `@vue/cli-plugin-eslint` injects the `vue-cli-service lint` command. You can see all injected commands by running:

``` bash
./node_modules/.bin/vue-cli-service help
```

You can also learn about the available options of each command with:

``` bash
./node_modules/.bin/vue-cli-service help [command]
```

## Git Hooks
