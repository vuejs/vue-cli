# vue-cli

> WIP: this is the work in progress branch of the upcoming vue-cli 3.0.
> Only for preview for template maintainers.

## Development Setup

This project uses a monorepo setup that requires using [Yarn](https://yarnpkg.com) because it relies on [Yarn workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/).

``` sh
# install dependencies
yarn

# link `vue` executable
cd packages/@vue/cli
yarn link

# create test projects in /packages/test
export VUE_CLI_DEBUG=true
cd -
cd packages/test
vue create test-app
cd test-app
yarn dev
```

## Core Concepts

There are two major parts of the system:

- `@vue/cli`: globally installed, exposes the `vue create <app>` command;
- `@vue/cli-service`: locally installed, exposes the `vue-cli-service` commands.

Both utilize a plugin-based architecture.

### Creator

[Creator][1] is the class created when invoking `vue create <app>`. Responsible for prompting for preferences, invoking generators and installing dependencies.

### Service

[Service][4] is the class created when invoking `vue-cli-service <command> [...args]`. Responsible for managing the internal webpack configuration, and exposes commands for serving and building the project.

### Plugin

Plugins are locally installed into the project as devDependencies. `@vue/cli-service` ships with a number of [built-in][5] [plugins][6]. This repo also contains a number of plugins that are published as individual packages.

A plugin should export a function which receives two arguments:

- A [PluginAPI][7] instance
- Project local options specified in `vue.config.js`, or in the `"vue-cli"` field in `package.json`.

The API allows plugins to extend/modify the internal webpack config for different environments and inject additional commands to `vue-cli-service`. Example:

``` js
module.exports = (api, options) => {
  api.configureWepback(config => {
    // modify webpack config
  })

  api.regsiterCommand('test', args => {
    // register `vue-cli-service test`
  })
}
```

### Generator

A plugin published as a package can also contain a `generator.js` file or a `generator` directory with `index.js`. The generator inside a plugin will be invoked after the plugin is installed.

A generator should export a function which receives a [GeneratorAPI][3] instance as the only argument. The API allows a generator to inject additional dependencies or fields into `package.json` and add files to the project. Example:

``` js
module.exports = (api, options) => {
  api.extendPackage({
    scripts: {
      test: 'vue-cli-service test'
    }
  })

  api.renderFiles('./files')
}
```

[1]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli/lib/Creator.js
[3]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli/lib/GeneratorAPI.js
[4]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/Service.js
[5]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/command-plugins
[6]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/config-plugins
[7]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/PluginAPI.js
