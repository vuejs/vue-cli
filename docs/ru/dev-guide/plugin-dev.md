---
sidebarDepth: 3
---

# Разработка плагинов

## Основные концепции

Существуют две основные части системы:

- `@vue/cli`: установленный глобально, предоставляет команду `vue create <app>`;
- `@vue/cli-service`: установленный локально, предоставляет команду `vue-cli-service`.

Обе части используют архитектуру, основанную на плагинах.

### Creator

[Creator][creator-class] — это класс, создаваемый при вызове `vue create <app>`. Отвечает за запросы пользователю для получения настроек, запускает генераторы и устанавливает зависимости.

### Service

[Service][service-class] — это класс, создаваемый при вызове `vue-cli-service <command> [...args]`. Отвечает за управление внутренней конфигурацией webpack, и предоставляет команды для запуска и сборки проекта.

### Плагин для CLI (CLI Plugin)

Плагин для CLI — это npm-пакет, который может добавлять дополнительные возможности в проект `@vue/cli`. Он должен всегда содержать [плагин для сервиса](#service-plugin) в качестве основного экспорта, и может опционально содержать [Generator](#generator) и [файл подсказок](#prompts-for-3rd-party-plugins).

Типичная структура каталогов плагина для CLI выглядит следующим образом:

```
.
├── README.md
├── generator.js  # генератор (опционально)
├── prompts.js    # файл подсказок (опционально)
├── index.js      # плагин для сервиса
└── package.json
```

### Плагин для сервиса (Service Plugin)

Сервисные плагины загружаются автоматически при создании экземпляра сервиса — т.е. каждый раз когда команда `vue-cli-service` вызывается внутри проекта.

Обратите внимание, что концепция «плагина для сервиса», которую мы обсуждаем здесь, несколько уже, чем концепция «плагина для CLI», который публикуется как npm-пакет. Первый относится только к модулю, который будет загружен `@vue/cli-service` когда он инициализирован, и обычно является частью последнего.

Кроме того, [встроенные команды][commands] и [конфигурация модулей][config] `@vue/cli-service` также реализованы как плагины для сервиса.

Плагин для сервиса должен экспортировать функцию, которая принимает два аргумента:

- Экземпляр [PluginAPI][plugin-api]

- Объект, содержащий локальные настройки проекта, указанные в `vue.config.js`, или в поле `"vue"` в `package.json`.

API позволяет плагинам для сервиса расширять / изменять внутреннюю конфигурацию webpack для разных окружений и внедрять дополнительные команды в `vue-cli-service`. Например:

``` js
module.exports = (api, projectOptions) => {
  api.chainWebpack(webpackConfig => {
    // изменение конфигурации webpack с помощью webpack-chain
  })

  api.configureWebpack(webpackConfig => {
    // изменение конфигурации webpack
    // или возвращение объекта, который будет объединён с помощью webpack-merge
  })

  api.registerCommand('test', args => {
    // регистрация команды `vue-cli-service test`
  })
}
```

#### Установка режимов для команд

> Примечание: установка режимов плагинами была изменена в beta.10.

Если зарегистрированная в плагине команда должна запускаться в определённом режиме по умолчанию,
плагин должен предоставлять её через `module.exports.defaultModes` в формате `{ [commandName]: mode }`:

``` js
module.exports = api => {
  api.registerCommand('build', () => {
    // ...
  })
}

module.exports.defaultModes = {
  build: 'production'
}
```

Это связано с тем, что ожидаемый режим для команды должен быть известен до загрузки переменных окружения, что в свою очередь должно произойти до загрузки пользовательских настроек / применения плагинов.

#### Получение итоговой конфигурации Webpack в плагинах

Плагин может получить итоговую конфигурацию webpack вызвав `api.resolveWebpackConfig()`. Каждый вызов генерирует новую конфигурацию webpack, которая может быть дополнительно изменена при необходимости:

``` js
module.exports = api => {
  api.registerCommand('my-build', args => {
    const configA = api.resolveWebpackConfig()
    const configB = api.resolveWebpackConfig()

    // изменение configA и configB для разных целей...
  })
}

// не забудьте указать режим по умолчанию для правильных переменных окружения
module.exports.defaultModes = {
  'my-build': 'production'
}
```

В качестве альтернативы, плагин также может получить новую [конфигурацию в формате chainable](https://github.com/mozilla-neutrino/webpack-chain) вызвав `api.resolveChainableWebpackConfig()`:

``` js
api.registerCommand('my-build', args => {
  const configA = api.resolveChainableWebpackConfig()
  const configB = api.resolveChainableWebpackConfig()

  // изменяем цепочки configA и configB для разных целей...

  const finalConfigA = configA.toConfig()
  const finalConfigB = configB.toConfig()
})
```

#### Пользовательские настройки для сторонних плагинов

Экспорт из `vue.config.js` [валидируется по схеме](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/options.js#L3) чтобы избежать опечаток и неправильных значений конфигурации. Тем не менее, можно настраивать поведение сторонних плагинов через поле `pluginOptions`. Например, для следующего `vue.config.js`:

``` js
module.exports = {
  pluginOptions: {
    foo: { /* ... */ }
  }
}
```

Сторонний плагин может получить доступ к свойству `projectOptions.pluginOptions.foo` для определения собственной конфигурации.

### Генератор (Generator)

Плагин для CLI, опубликованный как пакет, может содержать файл `generator.js` или `generator/index.js`. Генератор внутри плагина вызывается в двух возможных сценариях:

- Во время первоначального создания проекта, если плагин для CLI установлен как часть пресета для создания проекта.

- Когда плагин устанавливается после создания проекта и вызывается через `vue invoke`.

[GeneratorAPI][generator-api] позволяет генератору внедрять дополнительные зависимости или поля в `package.json` и добавлять файлы в проект.

Генератор должен экспортировать функцию, которая принимает три аргумента:

1. Экземпляр `GeneratorAPI`;

2. Настройки генератора для этого плагина. Они будут получены во время интерактивного выбора пользователем на этапе создания проекта, или загружаются из сохранённого пресета в `~/.vuerc`. Например, если сохранённый файл `~/.vuerc` выглядит так:

    ``` json
    {
      "presets" : {
        "foo": {
          "plugins": {
            "@vue/cli-plugin-foo": { "option": "bar" }
          }
        }
      }
    }
    ```

    И если пользователь создаёт проект с использованием пресета `foo`, тогда генератор `@vue/cli-plugin-foo` получит `{ option: 'bar' }` в качестве второго аргумента.

    Для стороннего плагина эти параметры будут получены из интерактивного выбора пользователем или аргументов командной строки, когда выполняется команда `vue invoke` (см. [Интерактивные подсказки для сторонних плагинов](#интерактивные-подсказки-дnя-сторонних-пnагинов)).

3. Весь пресет (`presets.foo`) будет передан в качестве третьего аргумента.

**Например:**

``` js
module.exports = (api, options, rootOptions) => {
  // изменение полей package.json
  api.extendPackage({
    scripts: {
      test: 'vue-cli-service test'
    }
  })

  // копирование и рендеринг всех файлов в ./template с помощью ejs
  api.render('./template')

  if (options.foo) {
    // генерация файлов по условию
  }
}
```

#### Шаблоны генератора

Когда вы вызываете `api.render('./template')`, генератор будет рендерить файлы в `./template` (разрешённые относительно файла генератора) с помощью [EJS](https://github.com/mde/ejs).

Кроме того, вы можете наследовать и заменять части существующего файла шаблона (даже из другого пакета) с помощью YAML front-matter:

``` ejs
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace: !!js/regexp /<script>[^]*?<\/script>/
---

<script>
export default {
  // Заменяем скрипт по умолчанию
}
</script>
```

Также возможно выполнять несколько замен в файле, хотя вам потребуется обернуть строки для замены в блоки из `<%# REPLACE %>` и `<%# END_REPLACE %>`:

``` ejs
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace:
  - !!js/regexp /Welcome to Your Vue\.js App/
  - !!js/regexp /<script>[^]*?<\/script>/
---

<%# REPLACE %>
Заменяем приветственное сообщение
<%# END_REPLACE %>

<%# REPLACE %>
<script>
export default {
  // Заменяем скрипт по умолчанию
}
</script>
<%# END_REPLACE %>
```

#### Ограничения имён файлов

Если вы хотите отрендерить файл шаблона, имя которого начинается с точки (т.е. `.env`) вам необходимо следовать определённому соглашению по именованию, поскольку файлы именуемые с точки (dotfiles) игнорируются при публикации вашего плагина в npm:
```
# dotfile шаблоны должны использовать символ подчёркивания вместо точки:

/generator/template/_env

# При вызове api.render('./template'), это будет отрендерено в каталоге проекта как:

.env
```
Следовательно, это значит, что необходимо также следовать специальному соглашению по именованию если вы хотите отрендерить файл, чьё имя начинается с подчёркивания:
```
# такие шаблоны должны иметь два символа подчёркивания вместо точки:

/generator/template/__variables.scss

# При вызове api.render('./template'), это будет отрендерено в каталоге проекта как:

_variables.scss
```

### Интерактивные подсказки

#### Интерактивные подсказки для встроенных плагинов

Только встроенные плагины имеют возможность настраивать исходные подсказки при создании нового проекта, а модули подсказок расположены [внутри пакета `@vue/cli`][prompt-modules].

Модуль подсказок должен экспортировать функцию, которая получает экземпляр [PromptModuleAPI][prompt-api]. Подсказки представлены с помощью [inquirer](https://github.com/SBoudrias/Inquirer.js) под капотом:

``` js
module.exports = api => {
  // объект возможности должен быть корректным объектом выбора inquirer
  api.injectFeature({
    name: 'Какая-то суперская возможность',
    value: 'my-feature'
  })

  // injectPrompt ожидает корректный объект подсказки inquirer
  api.injectPrompt({
    name: 'someFlag',
    // убедитесь, что подсказка отображается только если выбрана ваша функция
    when: answers => answers.features.include('my-feature'),
    message: 'Вы хотите включить флаг foo?',
    type: 'confirm'
  })

  // когда все подсказки завершены, внедряйте ваш плагин в настройки,
  // которые будут передаваться генераторам
  api.onPromptComplete((answers, options) => {
    if (answers.features.includes('my-feature')) {
      options.plugins['vue-cli-plugin-my-feature'] = {
        someFlag: answers.someFlag
      }
    }
  })
}
```

#### Интерактивные подсказки для сторонних плагинов

Плагины сторонних разработчиков обычно устанавливаются вручную после того, как проект уже создан, и пользователь будет инициализировать плагин вызовом команды `vue invoke`. Если плагин содержит `prompts.js` в своём корневом каталоге, он будет использован во время вызова. Файл должен экспортировать массив [вопросов](https://github.com/SBoudrias/Inquirer.js#question), которые будут обрабатываться Inquirer.js. Объект с ответами будет передаваться генератору плагина в качестве настроек.

В качестве альтернативы, пользователь может пропустить подсказки и напрямую инициализировать плагин, передав параметры через командную строку, например:

``` bash
vue invoke my-plugin --mode awesome
```

## Распространение плагина

Чтобы CLI-плагин мог использоваться другими разработчиками, он должен быть опубликован на npm придерживаясь соглашения по именованию `vue-cli-plugin-<name>`. Следуя соглашению по именованию позволит вашему плагину быть:

- Легко находимым с помощью `@vue/cli-service`;
- Легко находимым другими разработчиками через поиск;
- Устанавливаться через `vue add <name>` или `vue invoke <name>`.

## Примечание о разработке Core-плагинов

::: tip Примечание
Этот раздел применим только в случае, если вы работаете над встроенным плагином непосредственно внутри `vuejs/vue-cli` репозитория.
:::

Плагин с генератором, который внедряет дополнительные зависимости, отличные от пакетов в репозитории (например, `chai` внедряется `@vue/cli-plugin-unit-mocha/generator/index.js`) должен перечислять эти зависимости в собственном поле `devDependencies`. Это гарантирует:

1. что пакет всегда существует в корневом `node_modules` репозитория, поэтому нам не нужно их переустанавливать при каждом тестировании.

2. что `yarn.lock` остаётся постоянным, поэтому CI сможет лучше применять его кэширование.

[creator-class]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/Creator.js
[service-class]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/Service.js
[generator-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/GeneratorAPI.js
[commands]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/commands
[config]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/config
[plugin-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/PluginAPI.js
[prompt-modules]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/promptModules
[prompt-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/PromptModuleAPI.js
