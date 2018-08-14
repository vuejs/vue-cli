# Environment Variables and Modes

You can specify env variables by placing the following files in your project root:

``` bash
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

An env file simply contains key=value pairs of environment variables:

```
FOO=bar
VUE_APP_SECRET=secret
```

Loaded variables will become available to all `vue-cli-service` commands, plugins and dependencies.

::: tip Env Loading Priorities

An env file for a specific mode (e.g. `.env.production`) will take higher priority than a generic one (e.g. `.env`).

In addition, environment variables that already exist when Vue CLI is bootstrapped have the highest priority and will not be overwritten by `.env` files.
:::

::: warning NODE_ENV
If you have a default `NODE_ENV` in your environment, you should either remove it or explicitly set `NODE_ENV` when running `vue-cli-service` commands.
:::

## Modes

**Mode** is an important concept in Vue CLI projects. By default, there are three modes in a Vue CLI project:

- `development` is used by `vue-cli-service serve`
- `production` is used by `vue-cli-service build` and `vue-cli-service test:e2e`
- `test` is used by `vue-cli-service test:unit`

Note that a mode is different from `NODE_ENV`, as a mode can contain multiple environment variables. That said, each mode does set `NODE_ENV` to the same value by default - for example, `NODE_ENV` will be set to `"development"` in development mode.

You can set environment variables only available to a certain mode by postfixing the `.env` file. For example, if you create a file named `.env.development` in your project root, then the variables declared in that file will only be loaded in development mode.

You can overwrite the default mode used for a command by passing the `--mode` option flag. For example, if you want to use development variables in the build command, add this to your `package.json` scripts:

```
"dev-build": "vue-cli-service build --mode development",
```

## Example: Staging Mode

Assuming we have an app with the following `.env` file:

```
VUE_APP_TITLE=My App
```

And the following `.env.staging` file:

```
NODE_ENV=production
VUE_APP_TITLE=My App (staging)
```

- `vue-cli-service build` builds a production app, loading `.env`, `.env.production` and `.env.production.local` if they are present;

- `vue-cli-service build --mode staging` builds a production app in staging mode, using `.env`, `.env.staging` and `.env.staging.local` if they are present.

In both cases, the app is built as a production app because of the `NODE_ENV`, but in the staging version, `process.env.VUE_APP_TITLE` is overwritten with a different value.

## Using Env Variables in Client-side Code

Only variables that start with `VUE_APP_` will be statically embedded into the client bundle with `webpack.DefinePlugin`. You can access them in your application code:

``` js
console.log(process.env.VUE_APP_SECRET)
```

During build, `process.env.VUE_APP_SECRET` will be replaced by the corresponding value. In the case of `VUE_APP_SECRET=secret`, it will be replaced by `"secret"`.

In addition to `VUE_APP_*` variables, there are also two special variables that will always be available in your app code:

- `NODE_ENV` - this will be one of `"development"`, `"production"` or `"test"` depending on the [mode](#modes) the app is running in.
- `BASE_URL` - this corresponds to the `baseUrl` option in `vue.config.js` and is the base path your app is deployed at.

All resolved env variables will be available inside `public/index.html` as discussed in [HTML - Interpolation](./html-and-static-assets.md#interpolation).

::: tip
You can have computed env vars in your `vue.config.js` file. They still need to be prefixed with `VUE_APP_`. This is useful for version info `process.env.VUE_APP_VERSION = require('./package.json').version`
:::

## Local Only Variables

Sometimes you might have env variables that should not be committed into the codebase, especially if your project is hosted in a public repository. In that case you should use an `.env.local` file instead. Local env files are ignored in `.gitignore` by default.

`.local` can also be appended to mode-specific env files, for example `.env.development.local` will be loaded during development, and is ignored by git.
