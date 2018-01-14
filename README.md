# vue-cli

> WIP: this is the work in progress branch of the upcoming vue-cli 3.0.
> Only for preview for template maintainers.

## Development Setup

This project uses a monorepo setup that requires using [Yarn](https://yarnpkg.com) because it relies on [Yarn workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/).

``` sh
# install dependencies
yarn

# link `vue` executable
# if you have the old vue-cli installed globally, you may
# need to uninstall it first.
cd packages/@vue/cli
yarn link

# create test projects in /packages/test
cd -
cd packages/test
vue create test-app
cd test-app
yarn serve
```

### Testing Tips

The full test suite is rather slow, because it has a number of e2e tests that performs full webpack builds of actual projects. To limit the tests to only the plugin / files you are working on, you can use the `test-changed` script, which automatically runs only tests that are related to the files that have been modified/added since the last commit:

``` sh
yarn test-changed
```

Alternatively, you can run tests for a specific plugin (note this only matches files ending in `.spec.js` in the given plugin):

``` sh
yarn test-plugin pwa
```

Or, just specify your own regex:

``` sh
yarn test <fileRegex>
```

### Plugin Development

See [dedicated section in docs](https://github.com/vuejs/vue-cli/tree/next/docs/Plugin.md).
