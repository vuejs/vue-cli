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

The full test suite is rather slow, because it has a number of e2e tests that perform full webpack builds of actual projects. To narrow down the tests needed to run during development, you can pass a list of packages to the `test` script:

``` sh
yarn test cli cli-services
```

If the package is a plugin, you can ommit the `cli-plugin-` prefix:

``` sh
yarn test typescript
```

To further narrow down tests, you can also specify your own regex:

``` sh
yarn test -g <filenameRegex>
```

You can also pass `--watch` to run tests in watch mode.

Note that `jest --onlyChanged` isn't always accurate because some tests spawn child processes.

### Plugin Development

See [dedicated section in docs](https://github.com/vuejs/vue-cli/tree/dev/docs/Plugin.md).
