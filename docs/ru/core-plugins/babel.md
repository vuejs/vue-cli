# @vue/cli-plugin-babel

> Плагин babel для vue-cli

## Конфигурация

По умолчанию используется Babel 7 + `babel-loader` + [@vue/babel-preset-app](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app), но есть возможность конфигурации через `babel.config.js` для использования любых других пресетов Babel или плагинов.

По умолчанию `babel-loader` исключает файлы внутри зависимостей из `node_modules`. Если вы хотите явно транспилировать модуль какой-то зависимости, необходимо указать его в опции `transpileDependencies` в файле `vue.config.js`:

```js
module.exports = {
  transpileDependencies: [
    // может быть строкой или regex
    'my-dep',
    /other-dep/
  ]
}
```

## Кэширование

[cache-loader](https://github.com/webpack-contrib/cache-loader) используется по умолчанию, кэш хранится в `<projectRoot>/node_modules/.cache/babel-loader`.

## Параллелизация

[thread-loader](https://github.com/webpack-contrib/thread-loader) используется по умолчанию, если машина имеет более 1 ядра CPU. Это можно отключить указав `parallel: false` в файле `vue.config.js`.

Опция `parallel` должна быть установлена в `false` при использовании Babel в комбинации с не-сериализуемыми опциями загрузчика, таким как регулярные выражения, даты и функции. Такие опции не будут корректно переданы в `babel-loader`, что может привести к неожиданным ошибкам.

## Установка в уже созданный проект

```bash
vue add babel
```

## Внедряемые правила webpack-chain

- `config.rule('js')`
- `config.rule('js').use('babel-loader')`
- `config.rule('js').use('cache-loader')`
