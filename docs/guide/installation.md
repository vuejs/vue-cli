# Installation

::: tip Node Version Requirement
Vue CLI 4.x requires [Node.js](https://nodejs.org/) version 8.9 or above (v10+ recommended). You can manage multiple versions of Node on the same machine with [n](https://github.com/tj/n), [nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows).
:::

To install the new package, use one of the following commands. You need administrator privileges to execute these unless npm was installed on your system through a Node.js version manager (e.g. n or nvm).

```bash
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

After installation, you will have access to the `vue` binary in your command line. You can verify that it is properly installed by simply running `vue`, which should present you with a help message listing all available commands.

You can check you have the right version with this command:

```bash
vue --version
```

### Upgrading

To upgrade the global Vue CLI package, you need to run:

```bash
npm update -g @vue/cli

# OR
yarn global upgrade --latest @vue/cli
```

#### Project Dependencies

Upgrade commands shown above apply to the global Vue CLI installation. To upgrade one or more `@vue/cli` related packages (including packages starting with `@vue/cli-plugin-` or `vue-cli-plugin-`) inside your project, run `vue upgrade` inside the project directory:

```
Usage: upgrade [options] [plugin-name]

(experimental) upgrade vue cli service / plugins

Options:
  -t, --to <version>    Upgrade <plugin-name> to a version that is not latest
  -f, --from <version>  Skip probing installed plugin, assuming it is upgraded from the designated version
  -r, --registry <url>  Use specified npm registry when installing dependencies
  --all                 Upgrade all plugins
  --next                Also check for alpha / beta / rc versions when upgrading
  -h, --help            output usage information
```
