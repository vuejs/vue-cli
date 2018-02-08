## CLI

- [Installation](#installation)
- [Usage](#usage)
- [Creating a New Project](#creating-a-new-project)
- [Zero-config Prototyping](#zero-config-prototyping)
- [Installing Plugins in an Existing Project](#installing-plugins-in-an-existing-project)
- [Inspecting the webpack Config](#inspecting-the-projects-webpack-config)
- [Pulling 2.x Templates](#pulling-vue-cli2x-templates-legacy)

### Installation

``` sh
npm install -g @vue/cli
vue create my-project
```

### Usage

```
Usage: vue <command> [options]

Commands:

  create [options] <app-name>      create a new project powered by vue-cli-service
  invoke <plugin> [pluginOptions]  invoke the generator of a plugin in an already created project
  inspect [options] [paths...]     inspect the webpack config in a project with vue-cli-service
  serve [options] [entry]          serve a .js or .vue file in development mode with zero config
  build [options] [entry]          build a .js or .vue file in production mode with zero config
  init <template> <app-name>       generate a project from a remote template (legacy API, requires @vue/cli-init)
```

For each command, you can also use `vue <command> --help` to see more detailed usage.

### Creating a New Project

``` sh
vue create my-project
```

<p align="center">
  <img width="682px" src="https://raw.githubusercontent.com/vuejs/vue-cli/dev/docs/screenshot.png">
</p>

### Zero-config Prototyping

You can rapidly prototype with just a single `*.vue` file with the `vue serve` and `vue build` commands, but they require an additional global addon to be installed:

``` sh
yarn global add @vue/cli-service-global
echo '<template><h1>Hello!</h1></template>' > App.vue
vue serve
```

`vue serve` uses the same default setup (webpack, babel, postcss & eslint) as projects created by `vue create`. It automatically infers the entry file in the current directory - the entry can be one of `main.js`, `index.js`, `App.vue` or `app.vue`. If needed, you can also provide an `index.html`, install and use local dependencies, or even configure babel, postcss & eslint with corresponding config files.

The drawback of `vue serve` is that it relies on globally installed dependencies which may be inconsistent on different machines. Therefore this is only recommended for rapid prototyping.

### Installing Plugins in an Existing Project

Each CLI plugin ships with a generator (which creates files) and a runtime plugin (which tweaks the core webpack config and injects commands). When you use `vue create` to create a new project, some plugins will be pre-installed for you based on your feature selection. In case you want to install a plugin into an already created project, simply install it first:

``` sh
yarn add @vue/cli-plugin-eslint
```

Then you can invoke the plugin's generator so it generates files into your project:

``` sh
# the @vue/cli-plugin- prefix can be omitted
vue invoke eslint
```

In addition, you can pass options to the plugin:

``` sh
vue invoke eslint --config airbnb --lintOn save
```

It is recommended to commit your project's current state before running `vue invoke`, so that after file generation you can review the changes and revert if needed.

### Inspecting the Project's Webpack Config

Since `@vue/cli-service` abstracts away the webpack config, it may be more difficult to understand what is included in the config, especially when you are trying to make tweaks yourself.

`vue-cli-service` exposes the `inspect` command for inspecting the resolved webpack config. The global `vue` binary also provides the `inspect` command, and it simply proxies to `vue-cli-service inspect` in your project.

The command prints to stdout by default, so you can redirect that into a file for easier inspection:

``` sh
vue inspect > output.js
```

Note the output is not a valid webpack config file, it's a serialized format only meant for inspection.

You can also inspect a certain path of the config to narrow it down:

``` sh
# only inspect the first rule
vue inspect module.rules.0
```

### Pulling `vue-cli@2.x` Templates (Legacy)

`@vue/cli` uses the same `vue` binary, so it overwrites `vue-cli@2.x`. If you still need the legacy `vue init` functionality, you can install a global bridge:

``` sh
yarn global add @vue/cli-init
# vue init now works exactly the same as vue-cli@2.x
vue init webpack my-project
```
