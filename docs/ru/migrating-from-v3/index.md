---
sidebar: auto
---

# Миграция с версии v3

Для начала глобально установите последнюю версию Vue CLI:

```bash
npm install -g @vue/cli
# ИЛИ
yarn global add @vue/cli
```

## Обновление всех плагинов сразу

В существующих проектах запустите команду:

```bash
vue upgrade
```

После чего ознакомьтесь со следующим разделом с информацией о крупных изменениях (breaking changes) в каждом пакете.

------

## Миграция вручную по одному пакету

При желании выполнить миграцию постепенно и вручную несколько советов:

### Глобальный пакет `@vue/cli`

#### [Переработана команда](https://github.com/vuejs/vue-cli/pull/4090) `vue upgrade`

- Было: `vue upgrade [patch | minor | major]` — выполняла только установку последних версий плагинов Vue CLI.
- Стало: `vue upgrade [plugin-name]` — кроме обновления плагинов, запускает миграции из них для автоматизации процесса обновления. Для получения информации о дополнительных опциях этой команды выполните `vue upgrade --help`.

#### Изменён формат вывода `vue --version`

При запуске `vue --version`:

- 3.x: выводит `3.12.0`
- 4.x: выводит `@vue/cli 4.0.0`

#### Добавлен дополнительный шаг подтверждения во избежание перезаписи

При запуске `vue invoke` / `vue add` / `vue upgrade` теперь появляется [дополнительный шаг подтверждения](https://github.com/vuejs/vue-cli/pull/4275) при наличии незафиксированных изменений в текущем репозитории.

![image](https://user-images.githubusercontent.com/3277634/65588457-23db5a80-dfba-11e9-9899-9dd72efc111e.png)

#### Vue Router и Vuex теперь имеют сопутствующие CLI-плагины

При запуске `vue add vuex` или `vue add router`:

- В версии 3, только `vuex` или `vue-router` добавляется в проект;
- В версии 4, также устанавливается `@vue/cli-plugin-vuex` или `@vue/cli-plugin-router`.

В настоящее время это не привносит ничего особенного для конечных пользователей, но такой подход позволяет добавлять больше возможностей для пользователей Vuex и Vue Router позднее.

Для разработчиков пресетов и плагинов есть ещё несколько изменений в этих двух плагинах:

- Структура каталогов по умолчанию изменена:
  - `src/store.js` перемещён в `src/store/index.js`;
  - `src/router.js` перемещён в `src/router/index.js`;
- Опции `router` и `routerHistoryMode` в файле `preset.json` по-прежнему поддерживаются для совместимости. Но рекомендуется использовать `plugins: { '@vue/cli-plugin-router': { historyMode: true } }` для консистентности.
- `api.hasPlugin('vue-router')` больше не поддерживается. Теперь `api.hasPlugin('router')`.

### `@vue/cli-service`

#### Обработка пробелов в шаблонах

Во Vue CLI v3 для уменьшения размеров итоговой сборки по умолчанию отключена опция `preserveWhitespace` для `vue-template-compiler`.

Однако это привносило свои тонкости использования.

Но после релиза Vue 2.6 теперь можно управлять обработкой пробелов с помощью [новой опции `whitespace`](https://github.com/vuejs/vue/issues/9208#issuecomment-450012518). Поэтому во Vue CLI v4 перешли на использование этой новой опции по умолчанию.

Возьмём в качестве примера следующий шаблон:

```html
<p>
  Welcome to <b>Vue.js</b> <i>world</i>.
  Have fun!
</p>
```

С опцией `preserveWhitespace: false` все пробелы между тегами будут удалены, поэтому он скомпилируется в:

```html
<p> Welcome to <b>Vue.js</b><i>world</i>. Have fun! </p>
```

С опцией `whitespace: 'condense'` он скомпилируется в:

```html
<p> Welcome to <b>Vue.js</b> <i>world</i>. Have fun! </p>
```

Обратите внимание, что теперь сохраняется **инлайновый** пробел между тегами.

#### `vue-cli-service build --mode development`

Раньше при запуске команды `build` в режиме `development` расположение каталога `dist` отличалось от расположения в режиме `production`. Теперь, с учётом указанных ниже двух пулл-реквестов, структура и расположение каталогов будет во всех режимах одинакова (имена файлов всё ещё различаются — никаких хэшей в режиме `development`):

- [#4323](https://github.com/vuejs/vue-cli/pull/4323) ensure consistent directory structure for all modes
- [#4302](https://github.com/vuejs/vue-cli/pull/4302) move dev configs into serve command

#### Для пользователей SASS/SCSS

Раньше во Vue CLI v3 использовался `sass-loader@7` по умолчанию.

Недавно вышел `sass-loader@8` в котором довольно сильно изменился формат конфигурации. Примечания к релизу: <https://github.com/webpack-contrib/sass-loader/releases/tag/v8.0.0>

`@vue/cli-service` продолжает поддерживать `sass-loader@7` в v4, но настоятельно рекомендуем обратить внимание на релиз `sass-loader@8` и обновиться до последней версии.

#### Для пользователей Less

`less-loader` v4 несовместим с `less` >= v3.10, см. <https://github.com/less/less.js/issues/3414>.
Настоятельно рекомендуем обновиться до `less-loader@5`, если в проекте используется Less.

#### Для пользователей CSS модулей

- [Устаревшая опция `css.modules` заменена на `css.requireModuleExtension`](https://github.com/vuejs/vue-cli/pull/4387). Это связано с обновлением `css-loader` до v3 и изменением формата конфигурации. С подробным объяснением можно ознакомиться по ссылке.

#### Настройки `vue.config.js`

Уже объявленная как устаревшая [опция `baseUrl`](../config/#baseurl) теперь [удалена](https://github.com/vuejs/vue-cli/pull/4388).

#### `chainWebpack` / `configureWebpack`

##### Метод `minimizer` в `chainWebpack`

Если настраивали правила через `chainWebpack`, то обратите внимание, что `webpack-chain` обновлён с версии v4 до v6. Наиболее заметным изменением является конфигурация `minimizer`.

Например, если необходимо включить опцию `drop_console` в плагине terser.
В версии v3 это можно сделать через `chainWebpack` так:

```js
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
  chainWebpack: (config) => {
    config.optimization.minimizer([
      new TerserPlugin({ terserOptions: { compress: { drop_console: true } } })
    ])
  }
}
```

В версии v4 необходимо изменить таким образом:

```js
module.exports = {
  chainWebpack: (config) => {
    config.optimization.minimizer('terser').tap((args) => {
      args[0].terserOptions.compress.drop_console = true
      return args
    })
  }
}
```

##### Другие изменения

- [Правило `pug-plain` переименовано в `pug-plain-loader`](https://github.com/vuejs/vue-cli/pull/4230)

#### Базовые загрузчики / плагины

Скорее всего это вряд ли повлияет на пользователей, если не настраивали опции через `chainWebpack` / `configureWebpack`

`css-loader` был обновлён с версии v1 до v3:

- [История изменений v2](https://github.com/webpack-contrib/css-loader/releases/tag/v2.0.0)
- [История изменений v3](https://github.com/webpack-contrib/css-loader/releases/tag/v3.0.0)

Несколько базовых загрузчиков и плагинов webpack обновлены, с незначительными изменениями:

- `url-loader` [с версии v1 до v2](https://github.com/webpack-contrib/url-loader/releases/tag/v2.0.0)
- `file-loader` [с версии v3 до v4](https://github.com/webpack-contrib/file-loader/releases/tag/v4.0.0)
- `copy-webpack-plugin` [с версии v4 до v5](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md#500-2019-02-20)
- `terser-webpack-plugin` [с версии v1 до v2](https://github.com/vuejs/vue-cli/pull/4676)

### `@vue/cli-plugin-babel`, `@vue/babel-preset-app`

#### core-js

Требуется плагину babel в качестве peer-зависимости для полифилов, используемых в транспилированном коде.

Во Vue CLI v3 использовалась `core-js` версии 2.x, теперь она обновлена до 3.x.

Эта миграция автоматизирована, достаточно выполнить команду `vue upgrade babel`. Но если добавлялись пользовательские полифилы, может потребоваться обновить имена полифилов (подробную информацию можно найти в [истории изменений core-js](https://github.com/zloirock/core-js/blob/master/CHANGELOG.md#L279-L297)).

#### Пресет Babel

Эта миграция также автоматизирована, при обновлении командой `vue upgrade babel`.

- В версии v3, babel пресет по умолчанию в `babel.config.js` был `@vue/app`.
- В версии v4, пресет перемещён в плагин и теперь называется `@vue/cli-plugin-babel/preset`

Необходимость этого в том, что `@vue/babel-preset-app` в действительности является косвенной зависимостью проекта. Это работает благодаря «поднятию» (hoisting) npm-пакета. Однако может стать причиной потенциальных проблем, если у проекта несколько косвенных зависимостей одного и того же пакета, или если менеджер пакетов накладывает более строгие ограничения при разрешении зависимостей (например, yarn plug'n'play или pnpm). Поэтому он вынесен отдельной зависимостью проекта (`@vue/cli-plugin-babel`) для большей совместимости со стандартами и меньшей подверженности ошибкам.

------

### `@vue/cli-plugin-eslint`

Плагин теперь [требует ESLint в качестве peer-зависимости](https://github.com/vuejs/vue-cli/pull/3852).

Это не повлияет на проекты, созданные с помощью Vue CLI 3.1 или более поздних версий.

Если проект был создан с помощью Vue CLI 3.0.x или более ранних версий, то потребуется добавить `eslint@4` к зависимостям проекта (это автоматизированно при обновлении плагина с помощью команды `vue upgrade eslint`).

Также рекомендуется обновить ESLint до версии v5, а конфигурацию ESLint до последней версии (поддержка ESLint v6 будет добавлена в ближайшем будущем).

------

#### Пресет Prettier

Старая реализация пресета prettier была несовершенной. Шаблон по умолчанию обновлён с версии Vue CLI v3.10.

Теперь требуются `eslint`, `eslint-plugin-prettier` и `prettier` в качестве peer-зависимостей, следуя [стандартным практикам экосистемы ESLint](https://github.com/eslint/eslint/issues/3458).

В старых проектах при возникновении проблем как `Cannot find module: eslint-plugin-prettier` необходимо выполнить следующую команду для их исправления:

```bash
npm install --save-dev eslint@5 @vue/eslint-config-prettier@5 eslint-plugin-prettier prettier
```

------

#### Настройки `lintOnSave`

(затрагивает только процесс разработки)

Значение по умолчанию для опции `lintOnSave` (если не было указано) [изменено с `true` на `'default'`](https://github.com/vuejs/vue-cli/pull/3975). Ознакомиться с подробным объяснением можно [в документации](../config/#lintonsave).

Вкратце:

- В версии v3, по умолчанию, предупреждения линтинга и ошибки отображаются в браузере в слое для ошибок поверх приложения.
- В версии v4, по умолчанию, только ошибки линтинга будут таким образом прерывать процесс разработки. Предупреждения будут отображаться в консоли терминала.

### `@vue/cli-plugin-pwa`

Базовый плагин workbox-webpack-plugin обновлён с версии v3 до v4. См. [примечания к релизу](https://github.com/GoogleChrome/workbox/releases/tag/v4.0.0).

Теперь доступно поле `pwa.manifestOptions` (его можно указать в файле `vue.config.js`). Благодаря этой опции можно сгенерировать `manifest.json` из объекта конфигурации, а не копировать из каталога `public`. Это обеспечивает более консистентный интерфейс управления конфигурацией PWA (Обратите внимание, что это опциональная возможность. Связанные пулл-реквесты: [#2981](https://github.com/vuejs/vue-cli/pull/2981), [#4664](https://github.com/vuejs/vue-cli/pull/4664)).

### `@vue/cli-plugin-e2e-cypress`

До Vue CLI v3.0.0-beta.10 команда для E2E-тестирования по умолчанию была `vue-cli-service e2e`. Позднее изменена на `vue-cli-service test:e2e`. Предыдущая команда объявлена устаревшей, но всё ещё поддерживалась. Теперь [поддержка старой команды удалена](https://github.com/vuejs/vue-cli/pull/3774).

### `@vue/cli-plugin-e2e-nightwatch`

Nightwatch.js обновлён с версии 0.9 до 1.x. Рекомендуем сначала изучить [руководство по миграции Nightwatch](https://github.com/nightwatchjs/nightwatch/wiki/Migrating-to-Nightwatch-1.0).

Поставляемая в комплекте конфигурация и генерируемые тесты [были полностью переработаны](https://github.com/vuejs/vue-cli/pull/4541). Перейдите по ссылке для получения более подробной информации. Большинство используемых кейсов во Vue CLI v3 по-прежнему поддерживаются. Это просто добавление новых возможностей.

Поскольку ChromeDriver изменил свою стратегию версионирования с 73-й версии, теперь он сделан peer-зависимостью проекта. В плагине реализована простая проверка версии браузера, поэтому при обновлении до несовместимой версии Chrome появится предупреждение с предложением обновить до соответствующей версии и ChromeDriver.

------

Аналогично плагину для cypress, поддержка устаревшей команды `vue-cli-service e2e` удалена.

### `@vue/cli-plugin-typescript`

При импорте файла без расширения, настройки webpack по разрешению модулей теперь [отдают предпочтение файлам с расширениями `ts(x)` вместо `js(x)` и `.vue`](https://github.com/vuejs/vue-cli/pull/3909). Настоятельно рекомендуется всегда указывать расширение файла при импорте `.vue` файлов.

### `@vue/cli-plugin-unit-jest`

Обновлён Jest с версии v23 до v24, поэтому рекомендуем сначала изучить [примечания к релизу](https://jestjs.io/blog/2019/01/25/jest-24-refreshing-polished-typescript-friendly). А также, при необходимости, ознакомиться с [полной историей изменений](https://github.com/facebook/jest/blob/20ba4be9499d50ed0c9231b86d4a64ec8a6bd303/CHANGELOG.md#user-content-2400).

Плагин `unit-jest` теперь поставляется с 4 пресетами конфигурации:

- `@vue/cli-plugin-unit-jest` — пресет по умолчанию для наиболее распространённых типов проектов
- `@vue/cli-plugin-unit-jest/presets/no-babel` — если не установлен `@vue/cli-plugin-babel` и требуется не использовать babel в проекте
- `@vue/cli-plugin-unit-jest/presets/typescript` — пресет с поддержкой TypeScript (но без поддержки TSX)
- `@vue/cli-plugin-unit-jest/presets/typescript-and-babel` — пресет с поддержкой TypeScript (в том числе TSX) и babel.

Если после создания проекта стандартная конфигурация Jest не изменялась (расположена в файле `jest.config.js` или в поле `jest` в `package.json`), то можно просто заменить массивный объект конфигурации одним единственным полем:

```js
module.exports = {
  // Замените имя пресета на одно из списка выше по необходимости
  preset: '@vue/cli-plugin-unit-jest'
}
```

(зависимости `ts-jest`, `babel-jest` можно удалить после миграции конфигурации на использование пресета)

::: tip Напоминание
По умолчанию тестовое окружение в новых пресетах использует jsdom@15, что отличается от среды по умолчанию в Jest 24 (jsdom@11). Это должно быть согласовано в предстоящем обновлении Jest 25. Большинство пользователей не будут затронуты этим изменением. Подробную информацию, связанную с jsdom, можно найти в истории изменений <https://github.com/jsdom/jsdom/blob/master/Changelog.md>
:::

### `@vue/cli-plugin-unit-mocha`

- Теперь используется mochapack вместо mocha-webpack, см. историю изменений <https://github.com/sysgears/mochapack/releases>. Это изменение вряд ли повлияет на фактическое использование.
- Обновление mocha до версии 6, см. [историю изменений Mocha](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#600-0--2019-01-01) для подробной информации.

### `@vue/cli-service-global`

См. подробные изменения в пакетах [`@vue/cli-service`](#vue-cli-service) и [`@vue/cli-plugin-eslint`](#vue-cli-plugin-eslint).
