## Configuring webpack

- [Basic Configuration](#basic-configuration)
- [Chaining](#chaining-advanced)
- [Inspecting the Config](#inspecting-the-projects-webpack-config)
- [Using Resolved Config as a File](#using-resolved-config-as-a-file)

### Basic Configuration

The easiest way to tweak the webpack config is provide an object to the `configureWebpack` option in `vue.config.js`:

``` js
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      new MyAwesomeWebpackPlugin()
    ]
  }
}
```

The object will be merged into the final webpack config using [webpack-merge](https://github.com/survivejs/webpack-merge).

If you need conditional behavior based on the environment, or want to directly mutate the config, use a function (which will be lazy evaluated after the env variables are set). The function receives the resolved config as the argument. Inside the function, you can either mutate the config directly, OR return an object which will be merged:

``` js
// vue.config.js
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
      // mutate for development...
    }
  }
}
```

### Chaining (Advanced)

The internal webpack config is maintained using [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain). The library provides an abstraction over the raw webpack config, with the ability to define named loader rules and named plugins, and later "tap" into those rules and modify their options.

This allows us finer-grained control over the internal config. Here are some examples:

#### Transpiling a Dependency Module

By default the Babel configuration skips

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('js')
        .include
          .add(/some-module-to-transpile/)
  }
}
```

#### Modifying Loader Options

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('scss')
      .use('sass-loader')
      .tap(options =>
        merge(options, {
          includePaths: [path.resolve(__dirname, 'node_modules')],
        })
      )
  }
}
```

#### Replace existing Base Loader

If you want to replace an existing [Base Loader](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config/base.js), for example using `vue-svg-loader` to inline SVG files instead of loading the file:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('svg')
      .use('file-loader')
        .loader('vue-svg-loader')
  }
}
```

#### Modifying Plugin Options

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        return [/* new args to pass to html-webpack-plugin's constructor */]
      })
  }
}
```

You will need to familiarize yourself with [webpack-chain's API](https://github.com/mozilla-neutrino/webpack-chain#getting-started) and [read some source code](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config) in order to understand how to leverage the full power of this option, but it gives you a more expressive and safer way to modify the webpack config than directly mutation values.

For example, say you want to change the default location of index.html from */Users/username/proj/public/index.html* to */Users/username/proj/app/templates/index.html*.  By referencing [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options) you can see a list of options you can pass in. To change our template path we can pass in a new template path with the following config:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = '/Users/username/proj/app/templates/index.html'
        return args
      })
  }
}
```

You can confirm that this change has taken place by examining the vue webpack config with the **vue inspect** utility, which we will discuss next.

### Inspecting the Project's Webpack Config

Since `@vue/cli-service` abstracts away the webpack config, it may be more difficult to understand what is included in the config, especially when you are trying to make tweaks yourself.

`vue-cli-service` exposes the `inspect` command for inspecting the resolved webpack config. The global `vue` binary also provides the `inspect` command, and it simply proxies to `vue-cli-service inspect` in your project.

The command prints to stdout by default, so you can redirect that into a file for easier inspection:

``` sh
vue inspect > output.js
```

Note the output is not a valid webpack config file, it's a serialized format only meant for inspection.

You can also inspect a certain path of the config to narrow it down:

``` sh
# only inspect the first rule
vue inspect module.rules.0
```

### Using Resolved Config as a File

Some external tools may need access to the resolved webpack config as a file, for example IDEs or command line tools that expects a webpack config path. In that case you can use the following path:

```
<projectRoot>/node_modules/@vue/cli-service/webpack.config.js
```

This file dynamically resolves and exports the exact same webpack config used in `vue-cli-service` commands, including those from plugins and even your custom configurations.
