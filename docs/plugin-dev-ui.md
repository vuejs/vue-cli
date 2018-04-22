# Plugin UI Development Guide

> Work-in-progress documentation

## Plugin Info

When used in the UI, your plugin can show additional information to make it more discoverable and recognizable.

### Logo

You can put a `logo.png` file in the root directory of the folder that will be published on npm. It will be displayed in several places:
 - When searching for a plugin to install
 - In the installed plugin list

<p align="center">
  <img width="911px" src="https://raw.githubusercontent.com/vuejs/vue-cli/dev/docs/plugins.png">
</p>

The logo should be a square non-transparent image (ideally 84x84).

### Discoverability

For better discoverability when a user searches for your plugin, put keywords describing your plugin in the `description` field of the plugin `package.json` file.

Example:

```json
{
  "name": "vue-cli-plugin-apollo",
  "version": "0.7.7",
  "description": "vue-cli 3 plugin to add Apollo and GraphQL"
}
```

You should add the url to the plugin website or repository in the `homepage` or `repository` field so that a 'More info' button will be displayed in your plugin description:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Akryum/vue-cli-plugin-apollo.git"
  },
  "homepage": "https://github.com/Akryum/vue-cli-plugin-apollo#readme"
}
```

## UI API

The cli-ui exposes an API that allows augmenting the project configurations and tasks, as well as sharing data and communicating with other processes.

### UI files

Inside each installed vue-cli plugins, the cli-ui will try to load an optional `ui.js` file in the root folder of the plugin. It will also try to load a `vue-cli-ui.js` file in the user project root so the UI can be manually extended on a per-project basis (also useful to quickly prototype a plugin).

The file should export a function which gets the api object as argument:

```js
module.exports = api => {
  // Use the API here...
}
```

### Project configurations

### Project tasks

### Client addon

### Shared data

### Plugin actions

### IPC

### Custom views

### Public static files

Any file in an optional `ui-public` folder in the root of the plugin package folder will be exposed to the `/_plugin/:id/*` HTTP route.

For example, if you put a `my-logo.png` file into the `my-package/ui-public/` folder, it will be available with the `http://localhost:8000/_plugin/my-package/my-logo.png` URL when the cli-ui loads the plugin.
