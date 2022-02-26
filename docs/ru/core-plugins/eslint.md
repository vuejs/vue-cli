# @vue/cli-plugin-eslint

> Плагин eslint для vue-cli

## Внедряемые команды

- **`vue-cli-service lint`**

  ```
  Использование: vue-cli-service lint [options] [...files]

  Опции:

    --format [formatter] определяет форматтер (по умолчанию: stylish)
    --no-fix             отключает автоматическое исправление ошибок
    --max-errors         количество ошибок, по достижению которого сборка заканчивается ошибкой (по умолчанию: 0)
    --max-warnings       количество предупреждений, по достижению которого сборка заканчивается ошибкой (по умолчанию: Infinity)
  ```

  Проверяет и исправляет файлы. Если не указаны конкретные файлы для проверки, то будут проверяться все файлы в `src` и `tests`, а также все файлы JavaScript в корневом каталоге (чаще всего это файлы конфигурации, например `babel.config.js` или `.eslintrc.js`).

  Также поддерживаются и другие [настройки ESLint CLI](https://eslint.org/docs/user-guide/command-line-interface#options).

  :::tip Совет
  По умолчанию `vue-cli-service lint` проверяет файлы, именуемые с точки `.*.js`. Если вместо этого требуется поведение ESLint по умолчанию, то следует добавить в проект файл `.eslintignore`.
  :::

## Конфигурация

ESLint можно настраивать через `.eslintrc` или поле `eslintConfig` в файле `package.json`. Подробнее см. в [документации конфигурации ESLint](https://eslint.org/docs/user-guide/configuring).

::: tip СОВЕТ
Следующая опция находится в разделе [`vue.config.js`](../config/index.md#vue-config-js). Это соблюдается только при установке `@vue/cli-plugin-eslint`.
:::

Линтинг при сохранении (Lint-on-save) при разработке с помощью `eslint-loader` включён по умолчанию. Это можно отключить с помощью опции `lintOnSave` в файле `vue.config.js`:

```js
module.exports = {
  lintOnSave: false
}
```

Если установлено `true`, `eslint-loader` будет показывать ошибки линтинга в виде предупреждений. По умолчанию предупреждения только логируются в терминале и не завершают компиляцию ошибкой.

Чтобы показывать ошибки линтинга в браузере, можно использовать `lintOnSave: 'error'`. Это заставит `eslint-loader` всегда генерировать ошибки. Это также означает, что ошибки линтинга будут завершать компиляцию ошибкой.

Кроме того, можно настроить отображение в браузере как предупреждений, так и ошибок:

```js
// vue.config.js
module.exports = {
  devServer: {
    overlay: {
      warnings: true,
      errors: true
    }
  }
}
```

Когда значение `lintOnSave` приводится к истине, `eslint-loader` будет применяться как в разработке, так и в production. Если необходимо отключить `eslint-loader` при сборке production, можно использовать следующую конфигурацию:

```js
// vue.config.js
module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production'
}
```

## Установка в уже созданный проект

```bash
vue add eslint
```

## Внедряемые правила webpack-chain

- `config.module.rule('eslint')`
- `config.module.rule('eslint').use('eslint-loader')`
