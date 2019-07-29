# API плагина для UI

С помощью API `cli-ui` возможно дополнять конфигурацию и задачи проекта, а также обмениваться данными и взаимодействовать с другими процессами.

![UI Plugin architecture](/ru/vue-cli-ui-schema.png)

## Файлы UI

Внутри каждого установленного vue-cli плагина cli-ui попытается загрузить опциональный файл `ui.js` из корневого каталога плагина. Обратите внимание, также можно использовать каталоги (например, `ui/index.js`).

Файл должен экспортировать функцию, которая получает объект `api` в качестве аргумента:

```js
module.exports = api => {
  // Используйте API здесь...
}
```

**⚠️ Файлы будут перезагружены при получении списка плагинов на странице «Плагины проекта». Чтобы применить изменения, нажмите кнопку «Плагины проекта» в боковой панели слева в UI.**

Вот пример структуры каталога для vue-cli плагина, использующего UI API:

```
- vue-cli-plugin-test
  - package.json
  - index.js
  - generator.js
  - prompts.js
  - ui.js
  - logo.png
```

### Локальные плагины проекта

Если необходим доступ к API плагина в вашем проекте и вы не хотите создавать полноценный плагин для этого, вы можете использовать опцию `vuePlugins.ui` в файле `package.json`:

```json
{
  "vuePlugins": {
    "ui": ["my-ui.js"]
  }
}
```

Каждый файл должен экспортировать функцию, получающую API плагина первым аргументом.

## Режим разработки

При разработке плагина может потребоваться запустить cli-ui в режиме разработки, чтобы использовать логи с полезной информацией:

```
vue ui --dev
```

Или:

```
vue ui -D
```

## Конфигурации проекта

![Configuration ui](/config-ui.png)

Вы можете добавить конфигурацию проекта с помощью метода `api.describeConfig`.

Сначала вам нужно передать некоторую информацию:

```js
api.describeConfig({
  // Уникальный ID для конфигурации
  id: 'org.vue.eslintrc',
  // Отображаемое имя
  name: 'Конфигурация ESLint',
  // Показывается под названием
  description: 'Проверка ошибок & качество кода',
  // Ссылка "More info"
  link: 'https://eslint.org'
})
```

::: danger Убедитесь!
В правильно указанном пространстве имён; оно должно быть уникальным для всех плагинов. Рекомендуется применять [нотацию перевёрнутого доменного имени](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

### Конфигурация иконки

Может быть кодом [иконки из Material](https://material.io/tools/icons) или пользовательским изображением (см. [Публичные статические файлы](#пубnичные-статические-файnы)):

```js
api.describeConfig({
  /* ... */
  // Конфигурация иконки
  icon: 'application_settings'
})
```

Если не указать иконку, будет отображаться логотип плагина, если таковой есть (см. [Логотип](./ui-info.md#логотип)).

### Файлы конфигураций

По умолчанию конфигурация UI может читать и записывать в один или несколько файлов, например как в `.eslintrc.js` так и в `vue.config.js`.

Вы можете указать, какие файлы обнаруживать в проекте пользователя:

```js
api.describeConfig({
  /* ... */
  // Все возможные файлы для этой конфигурации
  files: {
    // eslintrc.js
    eslint: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      // Будет читать из `package.json`
      package: 'eslintConfig'
    },
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

Поддерживаемые типы: `json`, `yaml`, `js`, `package`. Порядок важен: первое имя файла в списке будет использоваться для создания файла конфигурации, если он не существует.

### Отображение подсказок конфигурации

Используйте хук `onRead` чтобы вернуть список подсказок, которые будут отображаться для конфигурации:

```js
api.describeConfig({
  /* ... */
  onRead: ({ data, cwd }) => ({
    prompts: [
      // объекты подсказок
    ]
  })
})
```

Эти подсказки будут отображаться на панели конфигурации.

Для получения дополнительной информации см. [Интерактивные подсказки](#интерактивные-подсказки).

Объект `data` содержит JSON с результатом контента каждого файла конфигурации.

Например, допустим, что у пользователя есть следующий `vue.config.js` в проекте:

```js
module.exports = {
  lintOnSave: false
}
```

Мы объявляем конфигурационный файл в плагине следующим образом:

```js
api.describeConfig({
  /* ... */
  // Все возможные файлы в этой конфигурации
  files: {
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

Объект `data` будет:

```js
{
  // Файл
  vue: {
    // Данные файла
    lintOnSave: false
  }
}
```

Пример с несколькими файлами: если мы добавим файл `eslintrc.js` в проект пользователя:

```js
module.exports = {
  root: true,
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ]
}
```

И изменим опцию `files` в нашем плагине на это:

```js
api.describeConfig({
  /* ... */
  // Все возможные файлы в этой конфигурации
  files: {
    // eslintrc.js
    eslint: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      // Будет читать из `package.json`
      package: 'eslintConfig'
    },
    // vue.config.js
    vue: {
      js: ['vue.config.js']
    }
  },
})
```

Объект `data` будет:

```js
{
  eslint: {
    root: true,
    extends: [
      'plugin:vue/essential',
      '@vue/standard'
    ]
  },
  vue: {
    lintOnSave: false
  }
}
```

### Вкладки конфигурации

Вы можете организовать подсказки на нескольких вкладках:

```js
api.describeConfig({
  /* ... */
  onRead: ({ data, cwd }) => ({
    tabs: [
      {
        id: 'tab1',
        label: 'Моя вкладка',
        // Опционально
        icon: 'application_settings',
        prompts: [
          // Объекты подсказок
        ]
      },
      {
        id: 'tab2',
        label: 'Моя вторая вкладка',
        prompts: [
          // Объекты подсказок
        ]
      }
    ]
  })
})
```

### Сохранение изменений конфигурации

Используйте хук `onWrite` для записи данных в файл (или выполнения любого кода nodejs):

```js
api.describeConfig({
  /* ... */
  onWrite: ({ prompts, answers, data, files, cwd, api }) => {
    // ...
  }
})
```

Аргументы:

- `prompts`: текущие объекты подсказок для runtime (см. ниже)
- `answers`: данные ответов от пользовательского ввода
- `data`: начальные данные только для чтения, считанные из файлов конфигурации
- `files`: дескрипторы найденных файлов (`{ type: 'json', path: '...' }`)
- `cwd`: текущий рабочий каталог
- `api`: `onWrite API` (см. ниже)

Объекты подсказок для runtime:

```js
{
  id: data.name,
  type: data.type,
  name: data.short || null,
  message: data.message,
  group: data.group || null,
  description: data.description || null,
  link: data.link || null,
  choices: null,
  visible: true,
  enabled: true,
  // Текущее значение (не фильтруется)
  value: null,
  // true если было изменено пользователем
  valueChanged: false,
  error: null,
  tabId: null,
  // Оригинальный объект подсказок inquirer
  raw: data
}
```

`onWrite` API:

- `assignData(fileId, newData)`: использует `Object.assign` для обновление данных конфигурации перед записью.
- `setData(fileId, newData)`: каждый ключ из `newData` будет установлен (или удалён если значение `undefined`) в данные конфигурации перед записью.
- `async getAnswer(id, mapper)`: получает ответ для заданного id подсказки и обрабатывает его с помощью функции `mapper`, если она предоставлена (например, `JSON.parse`).

Пример (из плагина для ESLint):

```js
api.describeConfig({
  // ...

  onWrite: async ({ api, prompts }) => {
    // Обновление правил ESLint
    const result = {}
    for (const prompt of prompts) {
      result[`rules.${prompt.id}`] = await api.getAnswer(prompt.id, JSON.parse)
    }
    api.setData('eslint', result)
  }
})
```

## Задачи проекта

![Tasks ui](/tasks-ui.png)

Задачи создаются из поля `scripts` файла `package.json` проекта.

Можно «расширять» задачи дополнительной информацией и хуками через `api.describeTask`:

```js
api.describeTask({
  // RegExp выполняется по командам скриптов для определения задачи описываемой здесь
  match: /vue-cli-service serve/,
  description: 'Компиляция и горячая замена модулей для разработки',
  // Ссылка "More info"
  link: 'https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#serve'
})
```

Также можно использовать функцию для `match`:

```js
api.describeTask({
  match: (command) => /vue-cli-service serve/.test(command),
})
```

### Иконка задачи

Может быть кодом [иконки из Material](https://material.io/tools/icons) или пользовательским изображением (см. [Публичные статические файлы](#пубnичные-статические-файnы)):

```js
api.describeTask({
  /* ... */
  // Иконка задачи
  icon: 'application_settings'
})
```

Если не указать иконку, будет отображаться логотип плагина, если таковой есть (см. [Логотип](./ui-info.md#логотип)).

### Параметры задачи

Вы можете добавлять подсказки для изменения аргументов команды. Они будут отображаться в модальном окне «Параметры».

Например:

```js
api.describeTask({
  // ...

  // Опциональные параметры (подсказки inquirer)
  prompts: [
    {
      name: 'open',
      type: 'confirm',
      default: false,
      description: 'Открывать браузер при старте сервера'
    },
    {
      name: 'mode',
      type: 'list',
      default: 'development',
      choices: [
        {
          name: 'development',
          value: 'development'
        },
        {
          name: 'production',
          value: 'production'
        },
        {
          name: 'test',
          value: 'test'
        }
      ],
      description: 'Указать режим env'
    }
  ]
})
```

См. [Интерактивные подсказки](#интерактивные-подсказки) для более подробной информации.

### Хуки задачи

Доступно несколько хуков:

- `onBeforeRun`
- `onRun`
- `onExit`

Например, использовать ответы подсказок (см. выше) для добавления аргументов в команду:

```js
api.describeTask({
  // ...

  // Хуки
  // Изменяем аргументы здесь
  onBeforeRun: async ({ answers, args }) => {
    // Аргументы
    if (answers.open) args.push('--open')
    if (answers.mode) args.push('--mode', answers.mode)
    args.push('--dashboard')
  },
  // Сразу после запуска задачи
  onRun: async ({ args, child, cwd }) => {
    // child: дочерний процесс node
    // cwd: рабочий каталог процесса
  },
  onExit: async ({ args, child, cwd, code, signal }) => {
    // code: код выхода
    // signal: сигнал kill, если использовался
  }
})
```

### Страницы задачи

Вы можете отображать пользовательские представления в панели сведений задачи с помощью `ClientAddon` API:

```js
api.describeTask({
  // ...

  // Дополнительные представления (например для панели webpack)
  // По умолчанию есть представление 'output' которое отображает вывод терминала
  views: [
    {
      // Уникальный ID
      id: 'vue-webpack-dashboard-client-addon',
      // Текст кнопки
      label: 'Dashboard',
      // Иконка кнопки
      icon: 'dashboard',
      // Динамический компонент для загрузки (см. секцию "Клиентское дополнение" ниже)
      component: 'vue-webpack-dashboard'
    }
  ],
  // Стартовый вид отображения сведений о задаче (по умолчанию это output)
  defaultView: 'vue-webpack-dashboard-client-addon'
})
```

См. [Клиентское дополнение](#кnиентское-допоnнение) для более подробной информации.


### Добавление новых задач

Также можно добавлять совершенно новые задачи, которые не указаны в `package.json` с помощью `api.addTask` вместо `api.describeTask`. Эти задачи будут отображаться только в пользовательском интерфейсе cli UI.

**Вам необходимо указать опцию `command` вместо `match`.**

Например:

```js
api.addTask({
  // Обязательно
  name: 'inspect',
  command: 'vue-cli-service inspect',
  // Опционально
  // Остальное похоже на `describeTask` без опции `match`
  description: '...',
  link: 'https://github.com/vuejs/vue-cli/...',
  prompts: [ /* ... */ ],
  onBeforeRun: () => {},
  onRun: () => {},
  onExit: () => {},
  views: [ /* ... */ ],
  defaultView: '...'
})
```

**⚠️ `command` запускается в контексте node. Это означает, что вы можете использовать команды к бинарникам node как обычно, будто из скриптов `package.json`.**

## Интерактивные подсказки

Объекты подсказок должен быть корректными объектами [inquirer](https://github.com/SBoudrias/Inquirer.js).

Однако, вы можете добавить следующие дополнительные поля (которые являются опциональными и используются только пользовательским интерфейсом):

```js
{
  /* ... */
  // Используется для группировки подсказок на разделы
  group: 'Настоятельно рекомендуется',
  // Дополнительное описание
  description: 'Принудительный стиль именования атрибутов в шаблоне (`my-prop` или `myProp`)',
  // Ссылка "More info"
  link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/attribute-hyphenation.md',
}
```

Поддерживаемые inquirer типы: `checkbox`, `confirm`, `input`, `password`, `list`, `rawlist`.

В дополнение к ним пользовательский интерфейс поддерживает специальные типы, которые работают только с ним:

- `color`: интерфейс выбора цвета.

### Пример с переключателем

```js
{
  name: 'open',
  type: 'confirm',
  default: false,
  description: 'Открыть приложение в браузере'
}
```

### Пример со списком вариантов

```js
{
  name: 'mode',
  type: 'list',
  default: 'development',
  choices: [
    {
      name: 'Режим разработки',
      value: 'development'
    },
    {
      name: 'Режим production',
      value: 'production'
    },
    {
      name: 'Режим тестирования',
      value: 'test'
    }
  ],
  description: 'Режим сборки',
  link: 'https://link-to-docs'
}
```

### Пример с полем ввода

```js
{
  name: 'host',
  type: 'input',
  default: '0.0.0.0',
  description: 'Хост для сервера разработки'
}
```

### Пример с чекбоксом

Отображает несколько переключателей.

```js
{
  name: 'lintOn',
  message: 'Выберите дополнительные возможности линтинга:',
  when: answers => answers.features.includes('linter'),
  type: 'checkbox',
  choices: [
    {
      name: 'Линтинг при сохранении',
      value: 'save',
      checked: true
    },
    {
      name: 'Линтинг и исправление при коммите' + (hasGit() ? '' : chalk.red(' (требуется Git)')),
      value: 'commit'
    }
  ]
}
```

### Пример с выбором цвета

```js
{
  name: 'themeColor',
  type: 'color',
  message: 'Цвет темы',
  description: 'Используется для изменения цвета интерфейса системы вокруг приложения',
  default: '#4DBA87'
}
```

### Подсказки для вызова

В плагине vue-cli может быть файл `prompts.js`, который задаёт пользователю несколько вопросов при установке плагина (через CLI или UI). Можно добавить дополнительные поля только для UI (см. выше) к этим объектам подсказок, чтобы они предоставили больше информации, если пользователь использует UI.

**⚠️ В настоящее время типы inquirer, которые не поддерживаются (см. выше), не будут работать в UI.**

## Клиентское дополнение

Клиентское дополнение — это сборка JS, которая динамически загружается в cli-ui. Она полезна для загрузки пользовательских компонентов и маршрутов.

### Создание клиентского дополнения

Рекомендуемый способ создания клиентского дополнения — создать новый проект с помощью vue cli. Вы можете либо сделать это в подкаталоге вашего плагина, либо в другом npm пакете.

Установите `@vue/cli-ui` в качестве зависимости для разработки (dev dependency).

Затем добавьте файл `vue.config.js` со следующим содержимым:

```js
const { clientAddonConfig } = require('@vue/cli-ui')

module.exports = {
  ...clientAddonConfig({
    id: 'org.vue.webpack.client-addon',
    // Порт разработки (по умолчанию 8042)
    port: 8042
  })
}
```

Метод `clientAddonConfig` генерирует необходимую конфигурацию vue-cli. Кроме того, он отключает извлечение CSS и выводит код в `./dist/index.js` в папку клиентского дополнения.

::: danger Убедитесь!
В правильно указанном пространстве имён; оно должно быть уникальным для всех плагинов. Рекомендуется применять [нотацию перевёрнутого доменного имени](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

Затем измените файл `.eslintrc.json`, чтобы добавить несколько глобальных объектов:

```json
{
  // ...
  "globals": {
    "ClientAddonApi": false,
    "mapSharedData": false,
    "Vue": false
  }
}
```

Теперь можно запустить скрипт `serve` для разработки и `build`, когда будете готовы опубликовать свой плагин.

### ClientAddonApi

Откройте файл `main.js` в исходном коде клиентского дополнения и удалите весь код.

**⚠️ Не импортируйте Vue в исходном коде клиентского дополнения, используйте глобальный объект `Vue` из `window` браузера.**

Вот пример кода для `main.js`:

```js
import VueProgress from 'vue-progress-path'
import WebpackDashboard from './components/WebpackDashboard.vue'
import TestView from './components/TestView.vue'

// Вы можете устанавливать дополнительные Vue-плагины
// используя глобальную переменную 'Vue'
Vue.use(VueProgress, {
  defaultShape: 'circle'
})

// Регистрировать пользовательские компоненты
// (работает аналогично 'Vue.component')
ClientAddonApi.component('org.vue.webpack.components.dashboard', WebpackDashboard)

// Добавлять маршруты во vue-router в соответствии с родительским маршрутом /addon/<id>.
// Например, addRoutes('foo', [ { path: '' }, { path: 'bar' } ])
// будет добавлять маршруты /addon/foo/ и the /addon/foo/bar во vue-router.
// Здесь мы создаём новый маршрут '/addon/vue-webpack/' с именем 'test-webpack-route'
ClientAddonApi.addRoutes('org.vue.webpack', [
  { path: '', name: 'org.vue.webpack.routes.test', component: TestView }
])

// Вы можете переводить компоненты своего плагина
// Загрузите файлы локализаций (используется vue-i18n)
const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
locales.keys().forEach(key => {
  const locale = key.match(/([a-z0-9]+)\./i)[1]
  ClientAddonApi.addLocalization(locale, locales(key))
})
```

::: danger Убедитесь!
В правильно указанном пространстве имён; оно должно быть уникальным для всех плагинов. Рекомендуется применять [нотацию перевёрнутого доменного имени](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

Также cli-ui регистрирует `Vue` и `ClientAddonApi` глобальными переменными в `window`.

В компонентах можно использовать все компоненты и CSS классы [@vue/ui](https://github.com/vuejs/ui) и [@vue/cli-ui](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-ui/src/components), чтобы обеспечить одинаковый внешний вид. Переводить тексты можно с помощью [vue-i18n](https://github.com/kazupon/vue-i18n), который используется по умолчанию.

### Регистрация клиентского дополнения

Возвращаясь к файлу `ui.js`, используйте метод `api.addClientAddon` с строкой запроса к встроенному каталогу:

```js
api.addClientAddon({
  id: 'org.vue.webpack.client-addon',
  // Каталог содержащий все собранные JS файлы
  path: '@vue/cli-ui-addon-webpack/dist'
})
```

Будет использован Node.js API `require.resolve` для поиска каталога в файловой системе и использоваться файл `index.js`, созданный из клиентского дополнения.

Или укажите URL-адрес при разработке плагина (в идеале вы захотите сделать это в файле `vue-cli-ui.js` в вашем тестовом проекте vue):

```js
// Полезно для разработки
// Перезапишет путь, если он уже определён в плагине
api.addClientAddon({
  id: 'org.vue.webpack.client-addon',
  // Используйте тот же порт, который указали ранее
  url: 'http://localhost:8042/index.js'
})
```

### Использование клиентского дополнения

Теперь можно использовать клиентское дополнение в представлениях. Например, вы можете указать представление в описании задачи:

```js
api.describeTask({
  /* ... */
  // Дополнительные представления (например для панели webpack)
  // По умолчанию есть представление 'output', которое отображает вывод терминала
  views: [
    {
      // Уникальный ID
      id: 'org.vue.webpack.views.dashboard',
      // Текст кнопки
      label: 'Dashboard',
      // Иконка кнопки (material-icons)
      icon: 'dashboard',
      // Динамический компонент для загрузки, зарегистрированный через ClientAddonApi
      component: 'org.vue.webpack.components.dashboard'
    }
  ],
  // Стартовое представление при отображении сведений о задаче (по умолчанию output)
  defaultView: 'org.vue.webpack.views.dashboard'
})
```

Вот код клиентского дополнения, который регистрирует компонент `'org.vue.webpack.components.dashboard'` (как мы видели ранее):

```js
/* В `main.js` */
// Импортируем компонент
import WebpackDashboard from './components/WebpackDashboard.vue'
// Регистрируем пользовательский компонент
// (работает аналогично 'Vue.component')
ClientAddonApi.component('org.vue.webpack.components.dashboard', WebpackDashboard)
```

![Task view example](/task-view.png)

## Пользовательские страницы

Можно добавить новую страницу под стандартными «Плагины проекта», «Конфигурация проекта» и «Задачи проекта» с помощью метода `api.addView`:

```js
api.addView({
  // Уникальный ID
  id: 'org.vue.webpack.views.test',

  // Имя маршрута (из vue-router)
  // Использует то же имя, как и в методе 'ClientAddonApi.addRoutes' (см. выше в разлеле клиентское дополнение)
  name: 'org.vue.webpack.routes.test',

  // Иконка кнопки (material-icons)
  icon: 'pets',
  // Можно указать собственное изображение (см. ниже раздел публичных статичных файлов):
  // icon: 'http://localhost:4000/_plugin/%40vue%2Fcli-service/webpack-icon.svg',

  // Подсказка для кнопки
  tooltip: 'Тестовая страница из дополнения webpack'
})
```

Вот пример кода в клиентском дополнении, который регистрирует `'org.vue.webpack.routes.test'` (как мы видели ранее):

```js
/* В `main.js` */
// Импортируем компонент
import TestView from './components/TestView.vue'
// Добавляем маршруты в vue-router под родительским маршрутом /addon/<id>.
// Например, addRoutes('foo', [ { path: '' }, { path: 'bar' } ])
// добавит маршруты /addon/foo/ и /addon/foo/bar во vue-router.
// Теперь создаём новый маршрут '/addon/vue-webpack/' с именем 'test-webpack-route'
ClientAddonApi.addRoutes('org.vue.webpack', [
  { path: '', name: 'org.vue.webpack.routes.test', component: TestView }
])
```

![Custom view example](/custom-view.png)

## Общие данные

Используйте общие данные для обмена информацией с пользовательскими компонентами.

> Например, панель Webpack предоставляет данные статистики сборки как UI-клиенту так и UI-серверу с помощью этого API.

В файле `ui.js` плагина (Node.js):

```js
// Установка или обновление
api.setSharedData('com.my-name.my-variable', 'some-data')

// Получение
const sharedData = api.getSharedData('com.my-name.my-variable')
if (sharedData) {
  console.log(sharedData.value)
}

// Удаление
api.removeSharedData('com.my-name.my-variable')

// Отслеживание изменений
const watcher = (value, id) => {
  console.log(value, id)
}
api.watchSharedData('com.my-name.my-variable', watcher)
// Прекращение отслеживания изменений
api.unwatchSharedData('com.my-name.my-variable', watcher)

// Версии для пространства имён
const {
  setSharedData,
  getSharedData,
  removeSharedData,
  watchSharedData,
  unwatchSharedData
} = api.namespace('com.my-name.')
```

::: danger Убедитесь!
В правильно указанном пространстве имён; оно должно быть уникальным для всех плагинов. Рекомендуется применять [нотацию перевёрнутого доменного имени](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

В пользовательском компоненте:

```js
// Компонент Vue
export default {
  // Синхронизируем общие данные
  sharedData () {
    return {
      // Можно использовать `myVariable` в шаблоне
      myVariable: 'com.my-name.my-variable'
      // Можно указывать общие данные нужного пространства имён
      ...mapSharedData('com.my-name.', {
        myVariable2: 'my-variable2'
      })
    }
  },

  // Ручные методы
  async created () {
    const value = await this.$getSharedData('com.my-name.my-variable')

    this.$watchSharedData(`com.my-name.my-variable`, value => {
      console.log(value)
    })

    await this.$setSharedData('com.my-name.my-variable', 'new-value')
  }
}
```

При использовании опции `sharedData` общие данные можно обновлять просто присвоением нового значения соответствующему свойству.

```html
<template>
  <VueInput v-model="message"/>
</template>

<script>
export default {
  sharedData: {
    // Синхронизирует общие данные 'my-message' на сервере
    message: 'com.my-name.my-message'
  }
}
</script>
```

Это очень удобно, например при создании компонента настроек.

## Действия плагина

Действия плагина — это вызовы между cli-ui (браузером) и плагинами (nodejs).

> Например, может быть кнопка в пользовательском компоненте (см. [клиентское дополнение](#кnиентское-допоnнение)), которая вызывает некоторый код nodejs на сервере с помощью этого API.

В файле `ui.js` в плагине (nodejs), вы можете использовать два метода из `PluginApi`:

```js
// Вызов действия
api.callAction('com.my-name.other-action', { foo: 'bar' }).then(results => {
  console.log(results)
}).catch(errors => {
  console.error(errors)
})
```

```js
// Отслеживание действия
api.onAction('com.my-name.test-action', params => {
  console.log('test-action called', params)
})
```

::: danger Убедитесь!
В правильно указанном пространстве имён; оно должно быть уникальным для всех плагинов. Рекомендуется применять [нотацию перевёрнутого доменного имени](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

Можно указывать версии для пространства имён через `api.namespace` (как и в общих данных):

```js
const { onAction, callAction } = api.namespace('com.my-name.')
```

В клиентском дополнении (браузере) можно получить доступ к `$onPluginActionCalled`, `$onPluginActionResolved` и `$callPluginAction`:

```js
// Компонент Vue
export default {
  created () {
    this.$onPluginActionCalled(action => {
      // Когда действие вызывается
      // до того как будет выполнено
      console.log('called', action)
    })
    this.$onPluginActionResolved(action => {
      // После того как действие запущено и завершено
      console.log('resolved', action)
    })
  },

  methods: {
    testPluginAction () {
      // Вызов действия плагина
      this.$callPluginAction('com.my-name.test-action', {
        meow: 'meow'
      })
    }
  }
}
```

## Коммуникация между процессами (IPC)

IPC означает коммуникацию между процессами. Эта система позволяет легко отправлять сообщения из дочерних процессов (например, задач!). И это довольно быстро и просто.

> Для отображения данных в UI на панели управления webpack, команды `serve` и `build` из `@vue/cli-service` отправляют IPC-сообщения на сервер cli-ui nodejs, когда передаётся аргумент `--dashboard`.

В коде процесса (который может быть Webpack-плагином или скриптом задачи для nodejs), можно использовать класс `IpcMessenger` из `@vue/cli-shared-utils`:

```js
const { IpcMessenger } = require('@vue/cli-shared-utils')

// Создание нового экземпляра IpcMessenger
const ipc = new IpcMessenger()

function sendMessage (data) {
  // Отправка сообщения на сервер cli-ui
  ipc.send({
    'com.my-name.some-data': {
      type: 'build',
      value: data
    }
  })
}

function messageHandler (data) {
  console.log(data)
}

// Отслеживание сообщения
ipc.on(messageHandler)

// Прекращение отслеживания
ipc.off(messageHandler)

function cleanup () {
  // Отключение от сети IPC
  ipc.disconnect()
}
```

Подключение вручную:

```js
const ipc = new IpcMessenger({
  autoConnect: false
})

// Это сообщение будет добавлено в очередь
ipc.send({ ... })

ipc.connect()
```

Автоотключение при простое (спустя некоторое время без отправляемых сообщений):

```js
const ipc = new IpcMessenger({
  disconnectOnIdle: true,
  idleTimeout: 3000 // По умолчанию
})

ipc.send({ ... })

setTimeout(() => {
  console.log(ipc.connected) // false
}, 3000)
```

Подключение к другой IPC-сети:

```js
const ipc = new IpcMessenger({
  networkId: 'com.my-name.my-ipc-network'
})
```

В файле `ui.js` плагина vue-cli, можно использовать методы `ipcOn`, `ipcOff` и `ipcSend`:

```js
function onWebpackMessage ({ data: message }) {
  if (message['com.my-name.some-data']) {
    console.log(message['com.my-name.some-data'])
  }
}

// Отслеживание любого IPC-сообщения
api.ipcOn(onWebpackMessage)

// Прекращение отслеживания
api.ipcOff(onWebpackMessage)

// Отправка сообщения во все подключённые экземпляры IpcMessenger
api.ipcSend({
  webpackDashboardMessage: {
    foo: 'bar'
  }
})
```

## Локальное хранилище

Плагин может сохранять и загружать данные из локальной базы данных [lowdb](https://github.com/typicode/lowdb), используемой сервером UI.

```js
// Сохранение значения в локальной базе данных
api.storageSet('com.my-name.an-id', { some: 'value' })

// Получение значения из локальной базы данных
console.log(api.storageGet('com.my-name.an-id'))

// Полноценный экземпляр lowdb
api.db.get('posts')
  .find({ title: 'low!' })
  .assign({ title: 'hi!'})
  .write()

// Использование версий для пространства имён
const { storageGet, storageSet } = api.namespace('my-plugin.')
```

::: danger Убедитесь!
В правильно указанном пространстве имён; оно должно быть уникальным для всех плагинов. Рекомендуется применять [нотацию перевёрнутого доменного имени](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

## Уведомления

Можно показывать уведомления через систему уведомлений операционной системы:

```js
api.notify({
  title: 'Какой-то заголовок',
  message: 'Сообщение пользователю',
  icon: 'path-to-icon.png'
})
```

Есть несколько встроенных иконок:

- `'done'`
- `'error'`

## Экран прогресса

Можно показывать экран прогресса с текстом и индикатором:

```js
api.setProgress({
  status: 'Обновление...',
  error: null,
  info: 'Шаг 2 из 4',
  progress: 0.4 // значение от 0 до 1, -1 означает скрытый индикатор прогресса
})
```

Удаление экрана прогресса:

```js
api.removeProgress()
```

## Хуки

Хуки позволяют реагировать на определённые события в интерфейсе `cli-ui`.

### onProjectOpen

Вызывается когда плагин был загружен впервые для текущего проекта.

```js
api.onProjectOpen((project, previousProject) => {
  // Сброс данных
})
```

### onPluginReload

Вызывается при перезагрузке плагина.

```js
api.onPluginReload((project) => {
  console.log('плагин перезагружен')
})
```

### onConfigRead

Вызывается при открытии или обновлении экрана конфигурации.

```js
api.onConfigRead(({ config, data, onReadData, tabs, cwd }) => {
  console.log(config.id)
})
```

### onConfigWrite

Вызывается при сохранении настроек пользователем на экране конфигурации.

```js
api.onConfigWrite(({ config, data, changedFields, cwd }) => {
  // ...
})
```

### onTaskOpen

Вызывается при открытии пользователем вкладки с детализацией задачи.

```js
api.onTaskOpen(({ task, cwd }) => {
  console.log(task.id)
})
```

### onTaskRun

Вызывается при запуске задачи пользователем.

```js
api.onTaskRun(({ task, args, child, cwd }) => {
  // ...
})
```

### onTaskExit

Вызывается при завершении задачи. Вызывается и при успешном выполнении, и при ошибке.

```js
api.onTaskExit(({ task, args, child, signal, code, cwd }) => {
  // ...
})
```

### onViewOpen

Вызывается при открытии страницы (например «Плагины», «Конфигурации» или «Задачи»).

```js
api.onViewOpen(({ view, cwd }) => {
  console.log(view.id)
})
```

## Предположения

Предположения — это кнопки, предназначенные чтобы предложить действия пользователю. Они отображаются в верхней панели. Например, у нас может быть кнопка, предлагающая установить vue-router, если пакет не был обнаружен в приложении.

```js
api.addSuggestion({
  id: 'com.my-name.my-suggestion',
  type: 'action', // Обязательно (больше типов в будущем)
  label: 'Add vue-router',
  // Это будет показано в модальном окне подробностей
  message: 'A longer message for the modal',
  link: 'http://link-to-docs-in-the-modal',
  // Опциональное изображение
  image: '/_plugin/my-package/screenshot.png',
  // Функция вызывается когда предположение активируется пользователем
  async handler () {
    // ...
    return {
      // По умолчанию удаляет кнопку
      keep: false
    }
  }
})
```

::: danger Убедитесь!
В правильно указанном пространстве имён; оно должно быть уникальным для всех плагинов. Рекомендуется применять [нотацию перевёрнутого доменного имени](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

![UI Suggestion](/suggestion.png)

Затем вы можете удалить предположение:

```js
api.removeSuggestion('com.my-name.my-suggestion')
```

Можно открыть страницу, когда пользователь активирует предположение, через `actionLink`:

```js
api.addSuggestion({
  id: 'com.my-name.my-suggestion',
  type: 'action', // Обязательно
  label: 'Add vue-router',
  // Открыть новую вкладку
  actionLink: 'https://vuejs.org/'
})
```

Как правило, лучше использовать хуки для показа предположений в правильном контексте:

```js
const ROUTER = 'vue-router-add'

api.onViewOpen(({ view }) => {
  if (view.id === 'vue-project-plugins') {
    if (!api.hasPlugin('router')) {
      api.addSuggestion({
        id: ROUTER,
        type: 'action',
        label: 'org.vue.cli-service.suggestions.vue-router-add.label',
        message: 'org.vue.cli-service.suggestions.vue-router-add.message',
        link: 'https://router.vuejs.org/',
        async handler () {
          await install(api, 'router')
        }
      })
    }
  } else {
    api.removeSuggestion(ROUTER)
  }
})
```

В этом примере мы отображаем только предположение vue-router в представлении плагинов, только если в проекте нет уже установленного vue-router.

Примечание: `addSuggestion` и `removeSuggestion` могут задаваться к пространству имён с помощью `api.namespace()`.

## Другие методы

### hasPlugin

Возвращает `true` если проект использует плагин.

```js
api.hasPlugin('eslint')
api.hasPlugin('apollo')
api.hasPlugin('vue-cli-plugin-apollo')
```

### getCwd

Возвращает текущий рабочий каталог.

```js
api.getCwd()
```

### resolve

Разрешает файл внутри текущего проекта.

```js
api.resolve('src/main.js')
```

### getProject

Получает текущий открытый проект.

```js
api.getProject()
```

## Публичные статические файлы

Вам может потребоваться предоставлять некоторые статические файлы поверх встроенного HTTP-сервера cli-ui (обычно, чтобы указать значок для пользовательского представления).

Любой файл в опциональном каталоге `ui-public` в корневом каталоге пакета плагина станет доступен по HTTP-маршруту `/_plugin/:id/*`.

Например, если поместить файл `my-logo.png` в `vue-cli-plugin-hello/ui-public/`, он будет доступен по URL `/_plugin/vue-cli-plugin-hello/my-logo.png`, когда cli-ui загружает плагин.

```js
api.describeConfig({
  /* ... */
  // Пользовательское изображение
  icon: '/_plugin/vue-cli-plugin-hello/my-logo.png'
})
```
