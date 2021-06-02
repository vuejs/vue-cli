# Работа с CSS

Проекты Vue CLI предоставляют поддержку для [PostCSS](http://postcss.org/), [CSS-модулей](https://github.com/css-modules/css-modules), а также пре-процессоров, включая [Sass](https://sass-lang.com/), [Less](http://lesscss.org/) и [Stylus](http://stylus-lang.com/).

## Указание ссылок на ресурсы

Весь скомпилированный CSS обрабатывается [css-loader](https://github.com/webpack-contrib/css-loader), который будет парсить `url()` и разрешать их как зависимостями модуля. Это означает, что вы можете ссылаться на ресурсы, используя относительные пути на основе локальной файловой структуры. Обратите внимание, что если вы хотите ссылаться на файл внутри npm-зависимости или через псевдоним webpack, путь должен начинаться с префикса `~` для избежания двусмысленности. Подробнее в разделе [Обработка статических ресурсов](./html-and-static-assets.md#обработка-статических-ресурсов).

## Пре-процессоры

Вы можете выбрать пре-процессоры (Sass/Less/Stylus) при создании проекта. Если вы этого не сделали, то внутренняя конфигурация webpack всё равно настроена для их использования. Вам лишь требуется вручную доустановить соответствующие загрузчики для webpack:

```bash
# Sass
npm install -D sass-loader sass

# Less
npm install -D less-loader less

# Stylus
npm install -D stylus-loader stylus
```

:::tip Примечание при использовании webpack 4
При использовании `webpack` версии 4, по умолчанию во Vue CLI 4, следует убедиться в совместимости используемых загрузчиков. В противном случае будут появляться ошибки о конфликтующих зависимостях. В таких случаях можно использовать более старую версию загрузчика, которая всё ещё совместима с `webpack` 4.

```bash
# Sass
npm install -D sass-loader@^10 sass
```
:::

Теперь вы можете импортировать соответствующие типы файлов, или использовать их синтаксис внутри файлов `*.vue` с помощью:

```vue
<style lang="scss">
$color: red;
</style>
```

::: tip Совет по производительности Sass
Обратите внимание, при использовании Dart Sass **синхронная компиляция вдвое быстрее асинхронной** по умолчанию, из-за накладных расходов на асинхронные коллбэки. Чтобы избежать их можно воспользоваться пакетом [fibers](https://www.npmjs.com/package/fibers) для вызова асинхронных импортёров по пути синхронного кода. Для этого просто установите `fibers` в качестве зависимости проекта:

```
npm install -D fibers
```

Также имейте в виду, поскольку это нативный модуль, то могут возникнуть различные проблемы совместимости, в зависимости от ОС и окружения сборки. В таких случаях выполните `npm uninstall -D fibers` для устранения проблемы.
:::

### Автоматические импорты

Если вы хотите автоматически импортировать файлы (для цветов, переменных, примесей...), можно использовать [style-resources-loader](https://github.com/yenshih/style-resources-loader). Вот пример для stylus, который импортирует `./src/styles/imports.styl` в каждый однофайловый компонент и в каждый файл stylus:

```js
// vue.config.js
const path = require('path')

module.exports = {
  chainWebpack: config => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResource(config.module.rule('stylus').oneOf(type)))
  },
}

function addStyleResource (rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/styles/imports.styl'),
      ],
    })
}
```

Вы также можете использовать [vue-cli-plugin-style-resources-loader](https://www.npmjs.com/package/vue-cli-plugin-style-resources-loader).

## PostCSS

Vue CLI использует PostCSS внутри себя.

Вы можете настроить PostCSS через `.postcssrc` или любую другую конфигурацию, которая поддерживается [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config), а также настраивать [postcss-loader](https://github.com/postcss/postcss-loader) через опцию `css.loaderOptions.postcss` в файле `vue.config.js`.

Плагин [autoprefixer](https://github.com/postcss/autoprefixer) включён по умолчанию. Чтобы определить целевые браузеры используйте поле [browserslist](../guide/browser-compatibility.html#browserslist) в файле `package.json`.

::: tip Примечание о префиксных CSS правилах
В сборке для production Vue CLI оптимизирует ваш CSS и удаляет ненужные префиксные правила CSS, основываясь на целевых браузерах. С `autoprefixer` включённым по умолчанию, вы должны всегда использовать только CSS-правила без префиксов.
:::

## CSS-модули

[CSS-модули в файлах `*.vue`](https://vue-loader.vuejs.org/ru/guide/css-modules.html) доступны из коробки с помощью `<style module>`.

Для импорта CSS или других файлов пре-процессоров в качестве CSS-модулей в JavaScript, необходимо чтобы имя файла заканчивалось на `.module.(css|less|sass|scss|styl)`:

```js
import styles from './foo.module.css'
// работает для всех поддерживаемых пре-процессоров
import sassStyles from './foo.module.scss'
```

Если вы не хотите указывать `.module` в именах файлов, установите `css.requireModuleExtension` в `false` внутри файла `vue.config.js`:

```js
// vue.config.js
module.exports = {
  css: {
    requireModuleExtension: false
  }
}
```

Если вы хотите настроить генерируемые имена классов для CSS-модулей, вы можете сделать это с помощью опции `css.loaderOptions.css` в `vue.config.js`. Все настройки `css-loader` поддерживаются, например `localIdentName` и `camelCase`:

```js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      css: {
        // Примечание: формат конфигурации отличается между Vue CLI v4 и v3
        // Для пользователей Vue CLI v3, обратитесь к документации css-loader v1
        // https://github.com/webpack-contrib/css-loader/tree/v1.0.1
        modules: {
          localIdentName: '[name]-[hash]'
        },
        localsConvention: 'camelCaseOnly'
      }
    }
  }
}
```

## Передача настроек в загрузчики пре-процессоров

Иногда может возникнуть необходимость передать настройки в загрузчик пре-процессора для webpack. Вы можете сделать это с помощью опции `css.loaderOptions` в `vue.config.js`. Например, для передачи глобальных переменных во все стили Sass/Less:

```js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      // передача настроек в sass-loader
      // @/ это псевдоним к каталогу src/ поэтому предполагается,
      // что у вас в проекте есть файл `src/variables.scss`
      // Примечание: эта опция называется "prependData" в sass-loader v8
      sass: {
        additionalData: `@import "~@/variables.sass"`
      },
      // по умолчанию опция `sass` будет применяться к обоим синтаксисам
      // потому что синтаксис `scss` по сути также обрабатывается sass-loader
      // но при настройке опции `prependData` синтаксис `scss` требует точку с запятой
      // в конце оператора, в то время как для `sass` точки с запятой не требуется
      // в этом случае синтаксис `scss` можно настроить отдельно с помощью опции `scss`
      scss: {
        additionalData: `@import "~@/variables.scss";`
      },
      // передача настроек Less.js в less-loader
      less:{
        // http://lesscss.org/usage/#less-options-strict-units `Global Variables`
        // `primary` — имя поля глобальных переменных
        globalVars: {
          primary: '#fff'
        }
      }
    }
  }
}
```

Загрузчики которые можно настраивать с помощью опции `loaderOptions`:

- [css-loader](https://github.com/webpack-contrib/css-loader)
- [postcss-loader](https://github.com/postcss/postcss-loader)
- [sass-loader](https://github.com/webpack-contrib/sass-loader)
- [less-loader](https://github.com/webpack-contrib/less-loader)
- [stylus-loader](https://github.com/shama/stylus-loader)

::: tip Совет
Это предпочтительнее, чем вручную обращаться к конкретным загрузчикам, используя `chainWebpack`, потому что настройки необходимо применять в нескольких местах, где используется соответствующий загрузчик.
:::
