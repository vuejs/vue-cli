# vue-cli [![Build Status](https://circleci.com/gh/vuejs/vue-cli/tree/next.svg?style=shield)](https://circleci.com/gh/vuejs/vue-loader/tree/next) [![Windows Build status](https://ci.appveyor.com/api/projects/status/487fqt71e4kf46iv/branch/next?svg=true)](https://ci.appveyor.com/project/yyx990803/vue-cli-6b0a6/branch/next)

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

The full test suite is rather slow, because it has a number of e2e tests that performs full webpack builds of actual projects. Therefore the default `test` script automatically runs only tests that are related to the files that have been modified/added since the last commit.

To run the full test suite, run `yarn test-all` instead. CI always runs all tests.

Alternatively, you can run tests for a specific plugin (note this only matches files ending in `.spec.js` in the given plugin):

``` sh
yarn test-plugin pwa
```

Or, just specify your own regex:

``` sh
yarn test <fileRegex>
```

You can also pass `--watch` to any of the test scripts, but note the matched tests are determined from the modified files when the script is started.

### Plugin Development

See [dedicated section in docs](https://github.com/vuejs/vue-cli/tree/next/docs/Plugin.md).
