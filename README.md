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
cd -
cd packages/test
vue create test-app
cd test-app
yarn
yarn dev
```

## Core Concepts

There are two major parts of the system:

- `@vue/cli`: globally installed, exposes the `vue create <app>` command;
- `@vue/cli-service`: locally installed, exposes the `vue-cli-service` commands.

Both utilize a plugin-based architecture.

### Creator

[Creator][1] is the class created when invoking `vue create <app>`. Responsible for prompting for preferences, generating the project files and installing dependencies.

### Generator

Generator are globally-installed plugins for the Creator. `@vue/cli` ships with a number of [built-in generators][2].

A generator should export a function which receives a [GeneratorAPI][3] instance as the only argument. The API allows a generator to inject prompts, `package.json` fields and files to the project being created.

### Service

[Service][4] is the class created when invoking `vue-cli-service <command> [...args]`. Responsible for managing the internal webpack configuration, and exposes commands for serving and building the project.

### Plugin

Plugins are locally installed into the project as devDependencies. `@vue/cli-service` ships with a number of [built-in][5] [plugins][6].

A plugin should export a function which receives two arguments:

- A [PluginAPI][7] instance
- Project local options specified in `vue.config.js`

The API allows plugins to extend/modify the internal webpack config for different environments and inject additional commands to `vue-cli-service`.

[1]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli/lib/Creator.js
[2]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli/lib/generators
[3]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli/lib/GeneratorAPI.js
[4]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/Service.js
[5]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/command-plugins
[6]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/config-plugins
[7]: https://github.com/vuejs/vue-cli/tree/next/packages/@vue/cli-service/lib/PluginAPI.js
