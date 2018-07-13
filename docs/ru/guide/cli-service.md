# Сервис CLI

## Использование Binary

Внутри проекта Vue CLI, `@vue/cli-service` устанавливает бинарник с именем `vue-cli-service`. Вы можете получить к нему доступ через `vue-cli-service` в npm-скриптах, или через `./node_modules/.bin/vue-cli-service` из терминала.

Это то, что вы увидите в `package.json` проекта с пресетом настроек по умолчанию:

``` json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build"
  }
}
```

Вы можете вызвать эти команды, как с помощью npm, так и Yarn:

``` bash
npm run serve
# ИЛИ
yarn serve
```

Если у вас установлен [npx](https://github.com/zkat/npx) (должен поставляться в комплекте с последней версией npm), то вы также можете запустить бинарник напрямую с помощью:

``` bash
npx vue-cli-service serve
```

::: tip Совет
Вы можете запускать команды с дополнительными возможностями через графический интерфейс, запускаемый командой `vue ui`.
:::

Пример работы Webpack Analyzer запущенного из GUI:

![UI Webpack Analyzer](/ui-analyzer.png)

## vue-cli-service serve

```
Использование: vue-cli-service serve [options] [entry]

Опции:

  --open    открыть браузер при запуске сервера
  --copy    скопировать url в буфер обмена при запуске сервера
  --mode    определить режим сборки (по умолчанию: development)
  --host    определить хост (по умолчанию: 0.0.0.0)
  --port    определить порт (по умолчанию: 8080)
  --https   использовать https (по умолчанию: false)
```

The `serve` command starts a dev server (based on [webpack-dev-server](https://github.com/webpack/webpack-dev-server)) that comes with Hot-Module-Replacement (HMR) working out of the box.

In addition to the command line flags, you can also configure the dev server using the [devServer](../config/#devserver) field in `vue.config.js`.

## vue-cli-service build

```
Использование: vue-cli-service build [options] [entry|pattern]

Опции:

  --mode        определить режим сборки (по умолчанию: production)
  --dest        определить каталог сборки (по умолчанию: dist)
  --modern      собирать приложение для современных браузеров с авто-фоллбэком для старых
  --target      app | lib | wc | wc-async (по умолчанию: app)
  --name        имя библиотеки или режим веб-компонента (по умолчанию: "name" в package.json или имя файла точки входа)
  --no-clean    не удалять каталог dist перед сборкой проекта
  --report      сгенерировать report.html для анализа содержимого бандла
  --report-json сгенерировать report.json для анализа содержимого бандла
  --watch       отслеживать изменения
```

`vue-cli-service build` produces a production-ready bundle in the `dist/` directory, with minification for JS/CSS/HTML and auto vendor chunk splitting for better caching. The chunk manifest is inlined into the HTML.

There are a few useful flags:

- `--modern` собирает ваше приложение используя [Современный режим](./browser-compatibility.md#современный-режим), shipping native ES2015 code to modern browsers that support it, with auto fallback to a legacy bundle.

- `--target` allows you to build any component(s) inside your project as a library or as web components. See [Build Targets](./build-targets.md) for more details.

- `--report` and `--report-json` will generate reports based on your build stats that can help you analyze the size of the modules included in your bundle.

## vue-cli-service inspect

```
Использование: vue-cli-service inspect [options] [...paths]

Опции:

  --mode    определить режим сборки (по умолчанию: development)
```

You can use `vue-cli-service inspect` to inspect the webpack config inside a Vue CLI project. See [Inspecting Webpack Config](./webpack.md#inspecting-the-project-s-webpack-config) for more details.

## Проверка всех доступных команд

Some CLI plugins  will inject additional commands to `vue-cli-service`. For example, `@vue/cli-plugin-eslint` injects the `vue-cli-service lint` command. You can see all injected commands by running:

``` bash
npx vue-cli-service help
```

You can also learn about the available options of each command with:

``` bash
npx vue-cli-service help [command]
```

## Кэширование и параллелизация

- `cache-loader` is enabled for Vue/Babel/TypeScript compilations by default. Files are cached inside `node_modules/.cache` - if running into compilation issues, always try deleting the cache directory first.

- `thread-loader` will be enabled for Babel/TypeScript transpilation when the machine has more than 1 CPU cores.

## Git хуки

When installed, `@vue/cli-service` also installs [yorkie](https://github.com/yyx990803/yorkie), which allows you to easily specify Git hooks using the `gitHooks` field in your `package.json`:

``` json
{
  "gitHooks": {
    "pre-commit": "lint-staged"
  }
}
```

::: warning Предупреждение
`yorkie` is a fork of [`husky`](https://github.com/typicode/husky) and is not compatible with the latter.
:::

## Конфигурация без извлечения

Projects created via `vue create` are ready to go without the need for additional configuration. The plugins are designed to work with one another so in most cases, all you need to do is pick the features you want during the interactive prompts.

However, we also understand that it's impossible to cater to every possible need, and the need of a project may also change over time. Projects created by Vue CLI allows you to configure almost every aspect of the tooling without ever needing to eject. Check out the [Config Reference](../config/) for more details.
