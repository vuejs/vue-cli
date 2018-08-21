# @vue/cli-ui

### Local development

Before starting a local cli-ui instance,
consider following the [contributing guide](https://github.com/vuejs/vue-cli/blob/dev/.github/CONTRIBUTING.md)
in order to download all required dependencies of vue-cli's packages.

Just after, you should serve `@vue/cli-ui-addon-webpack` by running:
```bash
cd ../cli-ui-addon-webpack
yarn serve
```

Then you should open a new terminal and start the ui server (based on Apollo):

```
cd ../cli-ui
yarn run apollo
```

And then in another terminal, you should serve the ui web app:

```
yarn run serve
```

#### Testing

Before running E2E tests, you should start a new local testing apollo server with the following command:

```
yarn run test:e2e
```

Then in another terminal:

```
yarn run test:e2e:dev
```

This will open a new [Cypress](https://www.cypress.io/) window.
You can now run all or specific integration tests.
