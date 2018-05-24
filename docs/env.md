## Environment Variables and Modes

- [Overview](#overview)
- [Modes](#modes)
- [Using Env Variables in Client-side Code](#using-env-variables-in-client-side-code)
- [Local Only Variables](#local-only-variables)

### Overview

You can specify env variables by placing the following files in your project root:

``` sh
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

### Modes

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

### Using Env Variables in Client-side Code

Only variables that start with `VUE_APP_` will be statically embedded into the client bundle with `webpack.DefinePlugin`. You can access them in your application code:

``` js
console.log(process.env.VUE_APP_SECRET)
```

During build, `process.env.VUE_APP_SECRET` will be replaced by the corresponding value. In the case of `VUE_APP_SECRET=secret`, it will be replaced by `"secret"`.

In addition to `VUE_APP_*` variables, there are also two special variables that will always be available in your app code:

- `NODE_ENV` - this will be one of `"development"`, `"production"` or `"test"` depending on the [mode](#modes) the app is running in.
- `BASE_URL` - this corresponds to the `baseUrl` option in `vue.config.js` and is the base path your app is deployed at.

### Env Variables in Index HTML

All resolved env variables will be available inside `public/index.html` via [lodash template interpolation](https://lodash.com/docs/4.17.5#template):

- `<%= VAR %>` for unescaped interpolation;
- `<%- VAR %>` for HTML-escaped interpolation;
- `<% expression %>` for JavaScript control flows.

For example, to reference static assets copied from the root of `public`, you will need to use the `BASE_URL` variable:

``` html
<link rel="shortcut icon" href="<%= BASE_URL %>favicon.ico">
```

### Local Only Variables

Sometimes you might have env variables that should not be committed into the codebase, especially if your project is hosted in a public repository. In that case you should use an `.env.local` file instead. Local env files are ignored in `.gitignore` by default.

`.local` can also be appended to mode-specific env files, for example `.env.development.local` will be loaded during development, and is ignored by git.
