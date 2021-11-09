# @vue/cli-plugin-e2e-webdriverio

> e2e-webdriverio plugin for vue-cli

## Внедряемые команды

- **`vue-cli-service test:e2e`**

  Запуск E2E тестов с помощью [WebdriverIO](https://webdriver.io/).

  Опции:

  ```
  --remote          Запустить тесты удалённо на SauceLabs
  ```

  Поддерживаются все [опции WebdriverIO CLI](https://webdriver.io/docs/clioptions.html). Например: `--baseUrl`, `--bail` и т.д.


## Структура проекта

При установке плагина генерируется следующая структура каталогов:

```
tests/e2e/
  ├── pageobjects/
  |   └── app.page.js
  ├── specs/
  |   ├── app.spec.js
  └── .eslintrc.js
```

Кроме того будут сгенерированы 3 конфигурационных файла:

- `wdio.shared.conf.js`: общая конфигурация со всеми опциями, определёнными для всех окружений
- `wdio.local.conf.js`: конфигурация для локального тестирования
- `wdio.sauce.conf.js`: конфигурация для удалённого тестирования в облачном провайдере, таком как [Sauce Labs](https://saucelabs.com/)

Каталоги содержат:

#### `pageobjects`
Содержит пример для объекта страницы. Подробнее об использовании [PageObjects](https://webdriver.io/docs/pageobjects.html) в WebdriverIO.

#### `specs`
Файлы e2e тестов.

## Установка в уже созданный проект

```bash
vue add e2e-webdriverio
```

Для пользователей со старыми версиями CLI потребуется выполнить `vue add @vue/e2e-webdriverio`.

## Запуск тестов

По умолчанию все тесты в каталоге `specs` будут запущены с помощью Chrome. Если необходимо запустить end-to-end тесты в Chrome (или Firefox) в безголовом режиме следует передать аргумент `--headless`. Тесты будут автоматически запускаться параллельно при выполнении в облаке.

```bash
$ vue-cli-service test:e2e
```

**Запуск одного теста**

Для запуска одного теста укажите путь к файлу. Например:

```bash
$ vue-cli-service test:e2e --spec tests/e2e/specs/test.js
```

**Пропустить автоматический запуск сервера разработки**

Если сервер разработки уже запущен и необходимо пропустить автоматический запуск, укажите аргумент `--url`:

```bash
$ vue-cli-service test:e2e --baseUrl=http://localhost:8080/
```
