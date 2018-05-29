## CLI

- [Installation](#installation)
- [Usage](#usage)
- [Launch the GUI](#launch-the-gui)
- [Creating a New Project](#creating-a-new-project)
- [Presets](#presets)
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
  ui [options]                     start and open the vue-cli ui
  init <template> <app-name>       generate a project from a remote template (legacy API, requires @vue/cli-init)
```

For each command, you can also use `vue <command> --help` to see more detailed usage.

### Launch the GUI

```
Usage: ui [options]

start and open the vue-cli ui


Options:

  -p, --port <port>  Port used for the UI server (by default search for awailable port)
  -h, --help         output usage information
```

![Vue-cli UI preview](./vue-cli-ui-preview.gif)

### Creating a New Project

```
Usage: create [options] <app-name>

create a new project powered by vue-cli-service


Options:

  -p, --preset <presetName>       Skip prompts and use saved or remote preset
  -d, --default                   Skip prompts and use default preset
  -i, --inlinePreset <json>       Skip prompts and use inline JSON string as preset
  -m, --packageManager <command>  Use specified npm client when installing dependencies
  -r, --registry <url>            Use specified npm registry when installing dependencies (only for npm)
  -g, --git [message]             Force / skip git intialization, optionally specify initial commit message
  -f, --force                     Overwrite target directory if it exists
  -c, --clone                     Use git clone when fetching remote preset
  -x, --proxy                     Use specified proxy when creating project
  -h, --help                      output usage information
```

``` sh
vue create my-project
```

<p align="center">
  <img width="682px" src="https://raw.githubusercontent.com/vuejs/vue-cli/dev/docs/screenshot.png">
</p>

### Presets

After you've selected features, you can optionally save it as a preset so that you can reuse it for future projects. If you want to delete or tweak a saved preset, you can do that by editing `~/.vuerc`.

A preset is defined in JSON. If you have saved a preset via the command line and then open `~/.vuerc`, you will find something like the following:

``` json
{
  "useConfigFiles": true,
  "router": true,
  "vuex": true,
  "cssPreprocessor": "sass",
  "plugins": {
    "@vue/cli-plugin-babel": {},
    "@vue/cli-plugin-eslint": {
      "config": "airbnb",
      "lintOn": ["save", "commit"]
    }
  }
}
```

The preset data is used by plugin generators to generate corresponding project files. In addition to the above fields, you can also add additional configuration for integrated tools:

``` js
{
  "useConfigFiles": true,
  "plugins": {...},
  "configs": {
    "vue": {...},
    "postcss": {...},
    "eslintConfig": {...},
    "jest": {...}
  }
}
```

These additional configurations will be merged into `package.json` or corresponding config files, depending on the value of `useConfigFiles`. For example, with `"useConfigFiles": true`, the value of `configs.vue` will be merged into `vue.config.js`.

#### Preset Plugin Versioning

You can explicitly specify versions of the plugins being used:

``` js
{
  "plugins": {
    "@vue/cli-plugin-eslint": {
      "version": "^3.0.0",
      // ... other options for this plugin
    }
  }
}
```

Note this is not required for official plugins - when omitted, the CLI will automatically use the latest version available in the registry. However, **it is recommended to provide a explicit version range for any 3rd party plugins listed in a preset**.

#### Remote Presets

You can share a preset with other developers by publishing it in a git repo. The repo should contain a `preset.json` file containing the preset data. You can then use the `--preset` option to use the remote preset when creating a project:

``` sh
# use preset from GitHub repo
vue create --preset username/repo my-project
```

GitLab and BitBucket are also supported. Make sure to use the `--clone` option if fetching from private repos:

``` sh
vue create --preset gitlab:username/repo --clone my-project
vue create --preset bitbucket:username/repo --clone my-project
```

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
  -c, --copy  Copy local url to clipboard
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

Each CLI plugin ships with a generator (which creates files) and a runtime plugin (which tweaks the core webpack config and injects commands). When you use `vue create` to create a new project, some plugins will be pre-installed for you based on your feature selection. In case you want to install a plugin into an already created project, you can do so with the `vue add` command:

``` sh
vue add @vue/eslint
```

> Note: it is recommended to commit your project's current state before running `vue add`, since the command will invoke the plugin's file generator and potentially make changes to your existing files.

The command resolves `@vue/eslint` to the full package name `@vue/cli-plugin-eslint`, installs it from npm, and invokes its generator.

``` sh
# these are equivalent to the previous usage
vue add @vue/cli-plugin-eslint
```

Without the `@vue` prefix, the command will resolve to an unscoped package instead. For example, to install the 3rd party plugin `vue-cli-plugin-apollo`:

``` sh
# installs and invokes vue-cli-plugin-apollo
vue add apollo
```

You can also use 3rd party plugins under a specific scope. For example, if a plugin is named `@foo/vue-cli-plugin-bar`, you can add it with:

``` sh
vue add @foo/bar
```

Finally, you can pass generator options to the installed plugin:

``` sh
vue add @vue/eslint --config airbnb --lintOn save
```

If a plugin is already installed, you can skip the installation and only invoke its generator with the `vue invoke` command. The command takes the same arguments as `vue add`.

### Inspecting the Project's Webpack Config

You can use `vue inspect` to inspect the webpack config inside a Vue CLI project. See [Inspecting Webpack Config](./webpack.md#inspecting-the-projects-webpack-config) for more details.

### Pulling `vue-cli@2.x` Templates (Legacy)

`@vue/cli` uses the same `vue` binary, so it overwrites `vue-cli@2.x`. If you still need the legacy `vue init` functionality, you can install a global bridge:

``` sh
npm install -g @vue/cli-init
# vue init now works exactly the same as vue-cli@2.x
vue init webpack my-project
```
