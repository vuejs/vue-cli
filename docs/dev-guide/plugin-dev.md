---
sidebarDepth: 3
---

# Plugin Development Guide

## Getting started

A CLI plugin is an npm package that can add additional features to a `@vue/cli` project. It should always contain a [Service Plugin](#service-plugin) as its main export, and can optionally contain a Generator, a Prompt File and a Vue UI integration.

As a npm package, CLI plugin must have a `package.json` file. It's also recommended to have a plugin description in `README.md` to help others find your plugin on npm

So, typical CLI plugin folder structure looks like the following:

```
.
├── README.md
├── generator.js  # generator (optional)
├── index.js      # service plugin
├── package.json
├── prompts.js    # prompts file (optional)
└── ui.js         # Vue UI integration (optional)
```

## Service Plugin

Service plugins are loaded automatically when a Service instance is created - i.e. every time the `vue-cli-service` command is invoked inside a project. It's located in the `index.js` file in CLI plugin root folder.

A service plugin should export a function which receives two arguments:

- A [PluginAPI](plugin-api.md) instance

- An object containing project local options specified in `vue.config.js`, or in the `"vue"` field in `package.json`.

The minimal required code in the service plugin file is the following:

```js
module.exports = (api, options) => {}
```

### Modifying webpack config

The API allows service plugins to extend/modify the internal webpack config for different environments. For example, here we're modifying webpack config with webpack-chain to include `vue-auto-routing` webpack plugin:

```js
const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin')

module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    // prettier-ignore
    webpackConfig
      .plugin('vue-auto-routing')
        .use(VueAutoRoutingPlugin, [
          {
            pages: 'src/pages',
            nested: true
          }
        ])
  })
}
```

You can also use `configureWebpack` method to modify the  webpack config or return object to be merged with webpack-merge.

### Add a new cli-service command

With a service plugin you can also register a new cli-service command in addition to standard ones (i.e. `serve` and `build`) or modify existing ones. Here is an example of creating a simple new command that will print a greeting to developer console:

```js
  api.registerCommand(
    'greet',
    {
      description: 'Writes a greeting to the console',
      usage: 'vue-cli-service greet'
    },
    () => {
      console.log(chalk.bold(chalk.blue(`👋  Hello, fellow developer!`)))
    }
  )
```

If you want to modify an existing cli-service command, you can retrieve it with `api.service.commands` and add some changes. We're going to print a message to the console again with a port where application is running:

```js
  const { serve } = api.service.commands

  const serveFn = serve.fn

  serve.fn = (...args) => {
    return serveFn(...args).then(res => {
      if (res && res.url) {
        console.log(
          chalk.green(`Project is running now at`),
          chalk.blue(res.url)
        )
      }
    })
  }
```


