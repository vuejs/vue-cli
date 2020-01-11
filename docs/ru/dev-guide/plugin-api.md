# API плагина

## version

Тип: `string`

Строка с версией `@vue/cli-service` загружающей плагин.

## assertVersion

- **Аргументы**
  - `{integer | string} range` — semver диапазон, которому должен соответствовать `@vue/cli-service`

- **Использование**

  Хотя `api.version` и может быть полезным, иногда приятнее просто объявить требуемую версию. Данный API предоставляет простой способ сделать это.

  Ничего не произойдёт, если предоставленная версия устраивает. В противном случае, будет выдана ошибка.

  Примечание: Рекомендуется использовать [поле `peerDependencies` в файле `package.json`](https://docs.npmjs.com/files/package.json#peerdependencies) в большинстве случаев.

## getCwd

- **Использование**:
Возвращает текущий рабочий каталог

## resolve

- **Аргументы**
  - `{string} path` — относительный путь от корня проекта

- **Возвращает**
  - `{string}` — разрешённый (resolved) абсолютный путь

- **Использование**:
Разрешение пути для текущего проекта

## hasPlugin

- **Аргументы**
  - `{string} id` — идентификатор плагина, можно опустить префикс (@vue/|vue-|@scope/vue)-cli-plugin-

- **Возвращает**
  - `{boolean}`

- **Использование**:
Проверяет есть ли в проекте плагин с указанным идентификатором

## registerCommand

- **Аргументы**
  - `{string} name`
  - `{object} [opts]`
  ```js
  {
    description: string,
    usage: string,
    options: { [string]: string }
  }
  ```
  - `{function} fn`
  ```js
  (args: { [string]: string }, rawArgs: string[]) => ?Promise
  ```

- **Использование**:
Регистрация команды, доступной как `vue-cli-service [name]`.

## chainWebpack

- **Аргументы**
  - `{function} fn`

- **Использование**:
Регистрация функции, которая получит chainable-конфигурацию webpack. Эта функция ленива и не будет вызываться до вызова функции `resolveWebpackConfig`.


## configureWebpack

- **Аргументы**
  - `{object | function} fn`

- **Использование**:
Регистрация объекта конфигурации webpack, который будет объединён с конфигурацией **ИЛИ** функция, которая получит исходную конфигурацию webpack. Функция может либо мутировать конфигурацию напрямую, либо возвращать объект, который будет объединён с конфигурацией webpack.

## configureDevServer

- **Аргументы**
  - `{object | function} fn`

- **Использование**:
Регистрация функции для конфигурирования сервера разработки. Она получает `app` экземпляр express сервера разработки.

## resolveWebpackConfig

- **Аргументы**
  - `{ChainableWebpackConfig} [chainableConfig]`

- **Возвращает**
  - `{object}` — исходная конфигурация webpack

- **Использование**:
Разрешение финальной конфигурации webpack, которая и будет передана в webpack.

## resolveChainableWebpackConfig

- **Возвращает**
  - `{ChainableWebpackConfig}`

- **Использование**:
Разрешение промежуточной chainable-конфигурации webpack, которую можно дополнительно настроить перед генерированием финальной конфигурации webpack. Можно вызывать несколько раз для генерации различных ветвей от базовой конфигурации webpack.

Подробнее см. [https://github.com/mozilla-neutrino/webpack-chain](https://github.com/mozilla-neutrino/webpack-chain)

## genCacheConfig

- **Аргументы**
  - `id`
  - `partialIdentifier`
  - `configFiles`

- **Возвращает**
  - `{object}`
  ```js
  {
    cacheDirectory: string,
    cacheIdentifier: string
  }
  ```

- **Использование**:
Генерация идентификатора кэша из нескольких переменных.
