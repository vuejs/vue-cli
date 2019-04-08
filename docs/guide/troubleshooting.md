# Troubleshooting

This document covers some common Vue CLI issues and how to resolve them. You should always follow these steps before opening a new issue.

## Running installation with `sudo` or as `root`

If you install `@vue/cli-service` as `root` user or with `sudo`, there might be issues when running package `postinstall` scripts.

This is a security feature of npm. You should always avoid running npm with root privileges because install scripts can be unintentionally malicious.

If you must however, you can workaround this error by setting the `--unsafe-perm` flag of npm. This can be done by prefixing the command with an environment variable, i.e.

```bash
npm_config_unsafe_perm=true vue create my-project
```

## Symbolic Links in `node_modules`

If there're dependencies installed by `npm link` or `yarn link`, ESLint (and sometimes Babel as well) may not work properly for those symlinked dependencies. It is because [webpack resolves symlinks to their real locations by default](https://webpack.js.org/configuration/resolve/#resolvesymlinks), thus breaks ESLint / Babel config lookup.

A workaround for this issue is to manually disable symlinks resolution in webpack:

```js
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    config.resolve.symlinks(false)
  }
}
```

::: warning
Disabling `resolve.symlinks` may break hot module reloading if your dependencies are installed by third-party npm clients that utilized symbolic links, such as`cnpm` or `pnpm`.
