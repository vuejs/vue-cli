# Работа с Webpack

## Простая конфигурация

Самый простой способ изменять конфигурацию webpack — использовать объект в опции `configureWebpack` в файле `vue.config.js`:

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

Объект будет объединён в итоговую конфигурацию webpack с помощью [webpack-merge](https://github.com/survivejs/webpack-merge).

::: warning Предупреждение
Некоторые параметры webpack устанавливаются на основе значений из `vue.config.js` и не должны изменяться напрямую. Например, вместо изменения `output.path` нужно использовать опцию `outputDir` в `vue.config.js`; а вместо `output.publicPath` нужно использовать опцию `baseUrl` в `vue.config.js`. Это связано с тем, что значения из `vue.config.js` будут использоваться в нескольких местах внутри конфигурации и необходимо гарантировать что всё вместе будет работать правильно.
:::

Если необходимо условное поведение, в зависимости от окружения, или вы хотите напрямую изменять конфигурацию — используйте функцию (она будет лениво выполняться уже после установки переменных окружения). Функция принимает итоговую конфигурацию в качестве аргумента. Внутри функции можно напрямую изменить конфигурацию, ИЛИ вернуть объект, который будет объединён:

``` js
// vue.config.js
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // изменение конфигурации для production...
    } else {
      // изменения для разработки...
    }
  }
}
```

## Chaining (Продвинутый вариант)

Внутренняя конфигурация webpack поддерживается с помощью [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain). Библиотека предоставляет абстракцию над обычной конфигурацией webpack, позволяя определять именованные правила для загрузчиков и именованные плагины, а затем выбирать эти правила по имени и изменять их параметры.

Это позволяет осуществлять более тонкий контроль над встроенной конфигурацией. Ниже вы увидите примеры изменений, выполненных с помощью опции `chainWebpack` в `vue.config.js`.

::: tip Совет
Команда [vue inspect](#inspecting-the-project-s-webpack-config) будет крайне полезна, когда вы будете пробовать добраться до определённого загрузчика в цепочке.
:::

### Изменение настроек загрузчика

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
          // изменение настроек...
          return options
        })
  }
}
```

::: tip Совет
Для загрузчиков связанных с CSS, рекомендуется использовать [css.loaderOptions](../config/#css-loaderoptions) вместо изменения напрямую через chaining. Это связано с тем, что для каждого типа CSS файлов существуют несколько правил, а `css.loaderOptions` гарантирует, что вы сможете повлиять на все эти правила в одном месте.
:::

### Добавление нового загрузчика

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    // Загрузчик GraphQL
    config.module
      .rule('graphql')
      .test(/\.graphql$/)
      .use('graphql-tag/loader')
        .loader('graphql-tag/loader')
        .end()
  }
}
```

### Замена загрузчиков для правила

Если вы хотите заменить существующий [базовый загрузчик](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config/base.js), например использовать `vue-svg-loader` для вставки SVG-файлов инлайн вместо загрузки обычными файлами:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')

    // очищаем все существующие загрузчики.
    // если вы этого не сделаете, загрузчик ниже будет добавлен
    // к уже существующим загрузчикам для этого правила.
    svgRule.uses.clear()

    // добавляем загрузчик для замены
    svgRule
      .use('vue-svg-loader')
        .loader('vue-svg-loader')
  }
}
```

### Изменение настроек плагина

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        return [/* новые args для передачи в конструктор html-webpack-plugin */]
      })
  }
}
```

You will need to familiarize yourself with [webpack-chain's API](https://github.com/mozilla-neutrino/webpack-chain#getting-started) and [read some source code](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config) in order to understand how to leverage the full power of this option, but it gives you a more expressive and safer way to modify the webpack config than directly mutation values.

For example, say you want to change the default location of `index.html` from `/Users/username/proj/public/index.html` to `/Users/username/proj/app/templates/index.html`. By referencing [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options) you can see a list of options you can pass in. To change our template path we can pass in a new template path with the following config:

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

You can confirm that this change has taken place by examining the vue webpack config with the `vue inspect` utility, which we will discuss next.

## Просмотр конфигурации Webpack проекта

Since `@vue/cli-service` abstracts away the webpack config, it may be more difficult to understand what is included in the config, especially when you are trying to make tweaks yourself.

`vue-cli-service` exposes the `inspect` command for inspecting the resolved webpack config. The global `vue` binary also provides the `inspect` command, and it simply proxies to `vue-cli-service inspect` in your project.

The command will print the resolved webpack config to stdout, which also contains hints on how to access rules and plugins via chaining.

You can redirect the output into a file for easier inspection:

``` bash
vue inspect > output.js
```

Note the output is not a valid webpack config file, it's a serialized format only meant for inspection.

You can also inspect a subset of the config by specifying a path:

``` bash
# показать только первое правило
vue inspect module.rules.0
```

Or, target a named rule or plugin:

``` bash
vue inspect --rule vue
vue inspect --plugin html
```

Наконец, вы можете вывести все именованные правила и плагины:

``` bash
vue inspect --rules
vue inspect --plugins
```

## Использование файла итоговой конфигурации

Некоторым внешним инструментам может потребоваться файл итоговой конфигурации webpack, например для IDE или утилит командной строки, которым необходимо указать путь до конфигурации webpack. В этом случае вы можете использовать следующий путь:

```
<projectRoot>/node_modules/@vue/cli-service/webpack.config.js
```

This file dynamically resolves and exports the exact same webpack config used in `vue-cli-service` commands, including those from plugins and even your custom configurations.
