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
Некоторые параметры webpack устанавливаются на основе значений из `vue.config.js` и не должны изменяться напрямую. Например, вместо изменения `output.path` нужно использовать опцию `outputDir` в `vue.config.js`; а вместо `output.publicPath` нужно использовать опцию `publicPath` в `vue.config.js`. Это связано с тем, что значения из `vue.config.js` используются в нескольких местах внутри конфигурации и необходимо гарантировать что всё вместе будет работать правильно.
:::

Если необходимо условное поведение, в зависимости от окружения, или вы хотите напрямую изменять конфигурацию — используйте функцию (будет лениво выполняться после установки переменных окружения). Она получает итоговую конфигурацию в качестве аргумента. Внутри функции можно напрямую изменить конфигурацию, ИЛИ вернуть объект для объединения:

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

Внутренняя конфигурация webpack поддерживается с использованием [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain). Библиотека предоставляет абстракцию над обычной конфигурацией webpack, добавляет возможность задавать именованные правила для загрузчиков и плагинов, а затем выбирать эти правила по имени и изменять их параметры.

Это позволяет осуществлять более тонкий контроль над встроенной конфигурацией. Ниже вы увидите примеры изменений, выполненных с помощью опции `chainWebpack` в `vue.config.js`.

::: tip Совет
Команда [vue inspect](#просмотр-конфигурации-webpack-проекта) пригодится, когда вы будете пробовать добраться до определённого загрузчика в цепочке.
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
Для загрузчиков связанных с CSS, рекомендуется использовать [css.loaderOptions](../config/#css-loaderoptions) вместо изменения напрямую через chaining. Это связано с тем, что для каждого типа CSS-файлов существуют несколько правил, а `css.loaderOptions` гарантирует, что вы сможете повлиять на все эти правила в одном месте.
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

Если вы хотите заменить существующий [базовый загрузчик](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config/base.js), например воспользоваться `vue-svg-loader` для вставки SVG-файлов инлайн вместо загрузки обычными файлами:

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

Вам потребуется ознакомиться с [API webpack-chain](https://github.com/mozilla-neutrino/webpack-chain#getting-started) и [изучить исходный код](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config) чтобы понять как использовать всю мощь этой опции, но она даст вам более выразительный и безопасный способ изменения конфигурации webpack в отличие от изменения значений напрямую.

Например, предположим, необходимо изменить местоположение `index.html` по умолчанию с `/Users/test/proj/public/index.html` на `/Users/test/proj/app/templates/index.html`. По ссылке [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options) перечислен список параметров, которые можем передавать. Чтобы изменить шаблон, передадим новый путь к шаблону следующей конфигурацией:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = '/Users/test/proj/app/templates/index.html'
        return args
      })
  }
}
```

Вы можете убедиться, что изменение произошло, изучив конфигурацию webpack с помощью команды `vue inspect`, о которой мы поговорим дальше.

## Просмотр конфигурации Webpack проекта

Поскольку `@vue/cli-service` абстрагируется от конфигурации webpack, может быть сложнее понять, что включено в конфигурацию, особенно когда вносите изменения самостоятельно.

`vue-cli-service` предоставляет команду `inspect` для проверки итоговой конфигурации webpack. Глобальный бинарник `vue` также предоставляет команду `inspect`, которая просто проксируется в `vue-cli-service inspect` вашего проекта.

Команда выведет в stdout итоговую конфигурацию webpack, которая будет также снабжена подсказками, как обращаться к правилам и плагинам через chaining.

Вы можете перенаправить вывод в файл для более удобного изучения:

``` bash
vue inspect > output.js
```

Обратите внимание, что вывод не является файлом рабочей конфигурации webpack, это только сериализованный формат предназначенный для проверки.

Вы также можете указать подмножество конфигурации для проверки, указав путь:

``` bash
# показать только первое правило
vue inspect module.rules.0
```

Или указать именованное правило или плагин:

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

Некоторым инструментам может потребоваться файл итоговой конфигурации webpack, например для IDE или утилит командной строки, которым необходимо указывать путь до конфигурации webpack. В таком случае вы можете использовать следующий путь:

```
<projectRoot>/node_modules/@vue/cli-service/webpack.config.js
```

Этот файл динамически разрешается и экспортирует ту же конфигурацию webpack, которая используется в командах `vue-cli-service`, в том числе из плагинов и даже ваших пользовательских конфигураций.
