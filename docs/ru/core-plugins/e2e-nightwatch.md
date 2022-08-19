# @vue/cli-plugin-e2e-nightwatch

> Плагин e2e-nightwatch для vue-cli

## Внедряемые команды

- **`vue-cli-service test:e2e`**

  Запускает E2E тесты с помощью [Nightwatch.js](https://nightwatchjs.org).

  Опции:

  ```
  --url          запуск E2E-тестов по указанному URL, вместо авто-запуска сервера
  --config       использовать пользовательский файл конфигурации nightwatch (перезаписывает внутренние настройки)
  --headless     использовать chrome или firefox в headless-режиме
  --parallel     использовать параллельный режим через test workers (доступно только в chromedriver)
  --use-selenium использовать сервер Selenium вместо chromedriver или geckodriver
  -e, --env      окружения браузеров через запятую для тестирования (по умолчанию: chrome)
  -t, --test     запустить тест по указанному пути к файлу
  -f, --filter   glob для фильтрации тестов по имени файла
  ```

  [Поддерживаются все опции Nightwatch CLI](https://nightwatchjs.org/guide/running-tests/#command-line-options). Например: `--verbose`, `--retries` и т.д.

## Структура проекта

При установке плагина генерируется следующая структура каталогов. В ней будут примеры для большинства концептов тестирования доступных в Nightwatch.

```
tests/e2e/
  ├── custom-assertions/
  |   └── elementCount.js
  ├── custom-commands/
  |   ├── customExecute.js
  |   ├── openHomepage.js
  |   └── openHomepageClass.js
  ├── page-objects/
  |   └── homepage.js
  ├── specs/
  |   ├── test.js
  |   └── test-with-pageobjects.js
  └── globals.js
```

#### `specs`
Основное место расположения тестов. Может содержать вложенные каталоги, которые можно выбирать при запуске с помощью аргумента `--group`. [Подробнее](https://nightwatchjs.org/guide/running-tests/#test-groups).

#### `custom-assertions`
Расположенные здесь файлы будут автоматически загружаться Nightwatch и добавляться в API `.assert` и `.verify` для расширения встроенных методов утверждений Nightwatch. Подробнее в документации [по созданию пользовательских утверждений](https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-assertions).

#### `custom-commands`
Расположенные здесь файлы будут автоматически загружаться Nightwatch и добавляться в API объекта `browser` для расширения встроенных команд Nightwatch. Подробнее в документации [по созданию пользовательских команд](https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-commands).

#### `page objects`
Работа с объектами страниц — популярная методология в E2E-тестировании UI. Расположенные здесь файлы будут автоматически добавляться в API `.page`, при этом имя файла определит имя объекта страницы. Подробнее в документации [по работе с объектами страниц](https://nightwatchjs.org/guide/working-with-page-objects/).

#### `globals.js`
Файл внешних глобальных переменных, который может содержать глобальные свойства или хуки. Подробнее в документации [по глобальным свойствам тестов](https://nightwatchjs.org/gettingstarted/configuration/#test-globals).

## Установка в уже созданный проект

```bash
vue add e2e-nightwatch
```

## Конфигурация

Nightwatch предварительно сконфигурирован для запуска в Chrome по умолчанию. Доступен также Firefox через `--env firefox`. При необходимости запускать end-to-end тесты в других браузерах (например, Safari, Microsoft Edge), нужно добавить `nightwatch.conf.js` или `nightwatch.json` в корневой каталог проекта для настройки дополнительных браузеров. Конфигурация будет объединена во [внутреннюю конфигурацию Nightwatch](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-plugin-e2e-nightwatch/nightwatch.config.js).

При необходимости можно полностью заменить внутреннюю конфигурацию собственной с помощью опции `--config`.

Обратитесь к документации Nightwatch для информации о [параметрах конфигурации](https://nightwatchjs.org/gettingstarted/configuration/) и как [устанавливать драйверы браузеров](http://nightwatchjs.org/gettingstarted#browser-drivers-setup).

## Запуск тестов

По умолчанию, все тесты внутри каталога `specs` будут запускаться с использованием Chrome. Если необходимо запустить end-to-end тесты в headless-режиме в Chrome (или Firefox), укажите аргумент `--headless`.

```bash
$ vue-cli-service test:e2e
```

**Запуск одного теста**

Для запуска одного теста укажите путь к файлу. Например:

```bash
$ vue-cli-service test:e2e tests/e2e/specs/test.js
```

**Пропустить автоматический запуск сервера разработки**

Если сервер разработки уже запущен и необходимо пропустить автоматический запуск, укажите аргумент `--url`:

```bash
$ vue-cli-service test:e2e --url http://localhost:8080/
```

**Запуск тестов в Firefox**

По умолчанию также поддерживается запуск тестов в Firefox. Выполните следующую команду (опционально можно добавить `--headless` для запуска Firefox в безголовом режиме):

```bash
$ vue-cli-service test:e2e --env firefox [--headless]
```

**Запуск тестов в Firefox и Chrome одновременно**

Можно запускать тесты одновременно в обоих браузерах, определяя требуемые тестовые окружения через запятую (",") — не используя пробелы.

```bash
$ vue-cli-service test:e2e --env firefox,chrome [--headless]
```

**Запуск тестов в параллельном режиме**

Для значительного увеличения скорости тестирования можно включить параллельный запуск тестов если имеются в наличии несколько тестовых наборов. Согласование осуществляется на файловом уровне и автоматически распределяется по доступным ядрам процессора.

На данный момент возможность доступна только в Chromedriver. Подробнее о [режиме параллельной работы](https://nightwatchjs.org/guide/running-tests/#parallel-running) можно прочитать в документации Nightwatch.

```bash
$ vue-cli-service test:e2e --parallel
```

**Запуск тестов с Selenium**

Поскольку с версии `v4` автономный сервер Selenium больше не включён в этот плагин, да и в большинстве случаев работа с Selenium не требуется с версии Nightwatch v1.0.

Но возможность использования сервера Selenium по-прежнему имеется, для этого необходимо выполнить следующие шаги:

__1.__ Установите NPM-пакет `selenium-server`:

  ```bash
  $ npm install selenium-server --save-dev
  ```

__2.__ Запустите команду с аргументом `--use-selenium`:

  ```bash
  $ vue-cli-service test:e2e --use-selenium
  ```
