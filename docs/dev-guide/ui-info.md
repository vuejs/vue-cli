# UI Plugin Info

When used in the UI, your plugin can show additional information to make it more discoverable and recognizable.

## Logo

You can put a `logo.png` file in the root directory of the folder that will be published on npm. It will be displayed in several places:
 - When searching for a plugin to install
 - In the installed plugin list

![Plugins](/plugins.png)

The logo should be a square non-transparent image (ideally 84x84).

## Discoverability

For better discoverability when a user searches for your plugin, put keywords describing your plugin in the `description` field of the plugin `package.json` file.

Example:

```json
{
  "name": "vue-cli-plugin-apollo",
  "version": "0.7.7",
  "description": "vue-cli plugin to add Apollo and GraphQL"
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

![Plugin search item](/plugin-search-item.png)
