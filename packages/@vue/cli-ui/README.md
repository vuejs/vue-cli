# @vue/cli-ui

### Local development

Before starting a local cli-ui instance, 
consider following the [contributing guide](https://github.com/vuejs/vue-cli/blob/dev/.github/CONTRIBUTING.md) 
in order to download all required dependencies of vue-cli's packages.
 
Just after, you should build `@vue/cli-ui-addon-webpack` by running:
```bash
cd ../cli-ui-addon-webpack
yarn build
cd -
```

Then you should start a local Apollo server:

```
yarn run apollo
```

And then in another terminal, you should serve cli-ui:

```
yarn run serve
```
