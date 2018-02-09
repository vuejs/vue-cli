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

```
Usage: create [options] <app-name>

create a new project powered by vue-cli-service


Options:

  -p, --preset <presetName>       Skip prompts and use saved preset
  -d, --default                   Skip prompts and use default preset
  -i, --inlinePreset <json>       Skip prompts and use inline JSON string as preset
  -m, --packageManager <command>  Use specified npm client when installing dependencies
  -r, --registry <url>            Use specified npm registry when installing dependencies (only for npm)
  -f, --force                     Overwrite target directory if it exists
  -h, --help                      output usage information
```

``` sh
vue create my-project
```

<p align="center">
  <img width="682px" src="https://raw.githubusercontent.com/vuejs/vue-cli/dev/docs/screenshot.png">
</p>

#### Presets

After you've selected features, you can optionally save it as a preset so that you can reuse it for future projects. If you want to delete a saved preset, you can do that by editing `~/.vuerc`.

### Zero-config Prototyping

You can rapidly prototype with just a single `*.vue` file with the `vue serve` and `vue build` commands, but they require an additional global addon to be installed first:

``` sh
npm install -g @vue/cli-service-global
```

The drawback of `vue serve` is that it relies on globally installed dependencies which may be inconsistent on different machines. Therefore this is only recommended for rapid prototyping.

#### vue serve

```
Usage: serve [options] [entry]

serve a .js or .vue file in development mode with zero config


Options:

  -o, --open  Open browser
  -h, --help  output usage information
```

All you need is a `*.vue` file:

``` sh
echo '<template><h1>Hello!</h1></template>' > App.vue
vue serve
```

`vue serve` uses the same default setup (webpack, babel, postcss & eslint) as projects created by `vue create`. It automatically infers the entry file in the current directory - the entry can be one of `main.js`, `index.js`, `App.vue` or `app.vue`. You can also explicitly specify the entry file:

``` sh
vue serve MyComponent.vue
```

If needed, you can also provide an `index.html`, `package.json`, install and use local dependencies, or even configure babel, postcss & eslint with corresponding config files.

#### vue build

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

``` sh
vue build MyComponent.vue
```

`vue build` also provides the ability to build the component as a library or a web component. See [Build Targets](./build-targets.md) for more details.

### Installing Plugins in an Existing Project

Each CLI plugin ships with a generator (which creates files) and a runtime plugin (which tweaks the core webpack config and injects commands). When you use `vue create` to create a new project, some plugins will be pre-installed for you based on your feature selection. In case you want to install a plugin into an already created project, simply install it first:

``` sh
npm install -D @vue/cli-plugin-eslint
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

You can use `vue inspect` to inspect the webpack config inside a Vue CLI project. See [Inspecting Webpack Config](./webpack.md#inspecting-the-projects-webpack-config) for more details.

### Pulling `vue-cli@2.x` Templates (Legacy)

`@vue/cli` uses the same `vue` binary, so it overwrites `vue-cli@2.x`. If you still need the legacy `vue init` functionality, you can install a global bridge:

``` sh
npm install -g @vue/cli-init
# vue init now works exactly the same as vue-cli@2.x
vue init webpack my-project
```
