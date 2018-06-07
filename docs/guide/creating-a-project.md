# Creating a Project

## Installation

::: tip
Vue CLI requires [Node.js](https://nodejs.org/) version 8+. You can manage multiple versions of Node on the same machine with [nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows).
:::

``` bash
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

After installation, you will have access to the `vue` binary in your command line. You can verify that it is properly installed by simply running `vue`, which should present you with a help message listing all available commands.

## vue create

To create a new project, run:

``` bash
vue create hello-world
```

You will be prompted to pick a preset. You can either choose the default preset which comes with a basic Babel + ESLint setup, or select "Manually select features" to pick the features you need.

![CLI preview](/cli-new-project.png)

The default setup is great for quickly prototyping a new project, while the manual setup provides more options that are likely needed for more production-oriented projects.

![CLI preview](/cli-select-features.png)

If you chose to manually select features, at the end of the prompts you also have the option to save your selections as a preset so that you can reuse it in the future. We will discuss presets and plugins in the next section.

::: tip
During the project creation process, you may get prompted to use the [Taobao npm registry mirror](https://npm.taobao.org/) for faster dependency installation. You choice will be saved in a file called `~/.vuerc` for future uses. If you wish you change this later, you can do so by editing `~/.vuerc`.
:::

The `vue create` command has a number of options and you can explore them all by running:

``` bash
vue create --help
```

```
Usage: create [options] <app-name>

create a new project powered by vue-cli-service


Options:

  -p, --preset <presetName>       Skip prompts and use saved or remote preset
  -d, --default                   Skip prompts and use default preset
  -i, --inlinePreset <json>       Skip prompts and use inline JSON string as preset
  -m, --packageManager <command>  Use specified npm client when installing dependencies
  -r, --registry <url>            Use specified npm registry when installing dependencies (only for npm)
  -g, --git [message|false]       Force / skip git intialization, optionally specify initial commit message
  -f, --force                     Overwrite target directory if it exists
  -c, --clone                     Use git clone when fetching remote preset
  -x, --proxy                     Use specified proxy when creating project
  -h, --help                      output usage information
```

## Using the GUI

You can also create and manage projects using a graphical interface with the `vue ui` command:

``` bash
vue ui
```

The above command will open a browser window with a GUI that guides you through the project creation process.

![UI preview](/ui-new-project.png)

## Pulling 2.x Templates (Legacy)

Vue CLI 3 uses the same `vue` binary, so it overwrites Vue CLI 2 (`vue-cli`). If you still need the legacy `vue init` functionality, you can install a global bridge:

``` bash
npm install -g @vue/cli-init
# vue init now works exactly the same as vue-cli@2.x
vue init webpack my-project
```
