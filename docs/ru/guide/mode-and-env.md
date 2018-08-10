# Переменные окружения и режимы работы

Вы можете указать переменные окружения в специальных файлах в корне вашего проекта:

``` bash
.env                # загружается во всех случаях
.env.local          # загружается во всех случаях, игнорируется git
.env.[mode]         # загружается только в указанном режиме работы
.env.[mode].local   # загружается только в указанном режиме работы, игнорируется git
```

Такой `.env` файл просто содержит пары ключ=значение требуемых переменных окружения:

```
FOO=bar
VUE_APP_SECRET=secret
```

Эти переменные будут доступны для всех команд `vue-cli-service`, плагинов и зависимостей.

::: tip Приоритет загрузки переменных окружения
Файл с переменными для определённого режима работы (например, `.env.production`) имеет более высокий приоритет, чем общий файл (например, `.env`).

Кроме того, переменные окружения, которые уже существуют при загрузке Vue CLI будут иметь наивысший приоритет и не будут перезаписаны значениями из файлов `.env`.
:::

::: warning Предупреждение об использовании NODE_ENV
Если в вашем окружении по умолчанию установлен `NODE_ENV`, вы должны либо удалить его, либо явно установить `NODE_ENV` при выполнении команд `vue-cli-service`.
:::

## Режимы работы

**Режимы работы** — важная часть проектов Vue CLI. По умолчанию, есть три режима работы:

- `development` используется `vue-cli-service serve`
- `production` используется `vue-cli-service build` и `vue-cli-service test:e2e`
- `test` используется `vue-cli-service test:unit`

Note that a mode is different from `NODE_ENV`, as a mode can contain multiple environment variables. That said, each mode does set `NODE_ENV` to the same value by default - for example, `NODE_ENV` will be set to `"development"` in development mode.

You can set environment variables only available to a certain mode by postfixing the `.env` file. For example, if you create a file named `.env.development` in your project root, then the variables declared in that file will only be loaded in development mode.

You can overwrite the default mode used for a command by passing the `--mode` option flag. For example, if you want to use development variables in the build command, add this to your `package.json` scripts:

```
"dev-build": "vue-cli-service build --mode development",
```

## Пример: Staging Mode

Assuming we have an app with the following `.env` file:

```
VUE_APP_TITLE=My App
```

And the following `.env.staging` file:

```
NODE_ENV=production
VUE_APP_TITLE=My App (staging)
```

- `vue-cli-service build` builds a production app, loading `.env`, `.env.production` and `.env.production.local` if they are present;

- `vue-cli-service build --mode staging` builds a production app in staging mode, using `.env`, `.env.staging` and `.env.staging.local` if they are present.

In both cases, the app is built as a production app because of the `NODE_ENV`, but in the staging version, `process.env.VUE_APP_TITLE` is overwritten with a different value.

## Использование переменных окружения в клиентском коде

Только переменные с префиксом `VUE_APP_` статически внедряются в клиентскую сборку используя `webpack.DefinePlugin`. К ним можно получить доступ из кода вашего приложения:

``` js
console.log(process.env.VUE_APP_SECRET)
```

На этапе сборки `process.env.VUE_APP_SECRET` будет заменяться соответствующим значением. Когда в файле указано `VUE_APP_SECRET=secret` — после сборки значением будет `"secret"`.

In addition to `VUE_APP_*` variables, there are also two special variables that will always be available in your app code:

- `NODE_ENV` - this will be one of `"development"`, `"production"` or `"test"` depending on the [mode](#режимы-работы) the app is running in.
- `BASE_URL` - this corresponds to the `baseUrl` option in `vue.config.js` and is the base path your app is deployed at.

All resolved env variables will be available inside `public/index.html` as discussed in [HTML - Interpolation](./html-and-static-assets.md#интерпоnяции).

::: tip Совет
Можно добавлять вычисляемые переменные окружения в `vue.config.js`. Они по-прежнему должны именоваться с префикса `VUE_APP_`. Это может пригодиться например для получения информации о версии `process.env.VUE_APP_VERSION = require('./package.json').version`
:::

## Переменные только для локального окружения

Sometimes you might have env variables that should not be committed into the codebase, especially if your project is hosted in a public repository. In that case you should use an `.env.local` file instead. Local env files are ignored in `.gitignore` by default.

`.local` can also be appended to mode-specific env files, for example `.env.development.local` will be loaded during development, and is ignored by git.
