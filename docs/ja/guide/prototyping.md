# Instant Prototyping

You can rapidly prototype with just a single `*.vue` file with the `vue serve` and `vue build` commands, but they require an additional global addon to be installed first:

``` bash
npm install -g @vue/cli-service-global
# or
yarn global add @vue/cli-service-global
```

The drawback of `vue serve` is that it relies on globally installed dependencies which may be inconsistent on different machines. Therefore this is only recommended for rapid prototyping.

### vue serve

```
Usage: serve [options] [entry]

serve a .js or .vue file in development mode with zero config


Options:

  -o, --open         Open browser
  -c, --copy         Copy local url to clipboard
  -p, --port <port>  Port used by the server (default: 8080 or next available port)
  -h, --help         Output usage information
```

All you need is an `App.vue` file:

``` vue
<template>
  <h1>Hello!</h1>
</template>
```

Then in the directory with the `App.vue` file, run:

``` bash
vue serve
```

`vue serve` uses the same default setup (webpack, babel, postcss & eslint) as projects created by `vue create`. It automatically infers the entry file in the current directory - the entry can be one of `main.js`, `index.js`, `App.vue` or `app.vue`. You can also explicitly specify the entry file:

``` bash
vue serve MyComponent.vue
```

If needed, you can also provide an `index.html`, `package.json`, install and use local dependencies, or even configure babel, postcss & eslint with corresponding config files.

### vue build

```
Usage: build [options] [entry]

build a .js or .vue file in production mode with zero config


Options:

  -t, --target <target>  Build target (app | lib | wc | wc-async, default: app)
  -n, --name <name>      name for lib or web-component (default: entry filename)
  -d, --dest <dir>       output directory (default: dist)
  -h, --help             output usage information
```

You can also build the target file into a production bundle for deployment with `vue build`:

``` bash
vue build MyComponent.vue
```

`vue build` also provides the ability to build the component as a library or a web component. See [Build Targets](./build-targets.md) for more details.
