# @vue/cli-plugin-e2e-cypress

> Плагин e2e-cypress для vue-cli

Он добавляет поддержку E2E тестирования с помощью [Cypress](https://www.cypress.io/).

Cypress предлагает богатый интерактивный интерфейс для запуска E2E тестов, но в настоящее время поддерживается запуск тестов только в Chromium. При наличии жёстких требований к E2E тестированию в нескольких браузерах, обратите внимание на плагин [@vue/cli-plugin-e2e-nightwatch](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch), основанный на Selenium.

## Внедряемые команды

- **`vue-cli-service test:e2e`**

  Запуск E2E тестов через `cypress run`.

  По умолчанию Cypress запускается в интерактивном режиме с графическим интерфейсом. Если необходимо запустить тесты в безголовом (headless) режиме (например, для CI), то следует указывать опцию `--headless`.

  Команда автоматически запустит сервер в режиме production для выполнения E2E тестов. Если требуется запускать тесты несколько раз без необходимости перезапускать сервер каждый раз, можно запустить сервер с `vue-cli-service serve --mode production` в одном терминале, а затем запускать E2E тесты на этом сервере с помощью опции `--url`.

  Опции:

  ```
  --headless запуск headless-режиме без GUI
  --mode     указывает режим запуска сервера (по умолчанию: production)
  --url      запускать E2E тесты с заданным URL вместо авто-запуска сервера
  -s, --spec (только в headless-режиме) запуск определённого файла. По умолчанию "all"
  ```

  Дополнительно:

  - В режиме GUI, [все опции Cypress CLI для `cypress open`](https://docs.cypress.io/guides/guides/command-line.html#cypress-open) поддерживаются;
  - В режиме `--headless`, [все опции Cypress CLI для `cypress run`](https://docs.cypress.io/guides/guides/command-line.html#cypress-run) поддерживаются.

  Примеры:
  - Запуск Cypress в headless-режиме для конкретного файла: `vue-cli-service test:e2e --headless --spec tests/e2e/specs/actions.spec.js`

## Конфигурация

Cypress пред-настроен под размещение всех файлов, связанных с E2E тестированием, в каталоге `<projectRoot>/tests/e2e`. При необходимости можно [настраивать Cypress через `cypress.json`](https://docs.cypress.io/guides/references/configuration.html#Options).

## Переменные окружения

Cypress не загружает .env файлы для ваших файлов тестов, как это делает `vue-cli` для [кода приложения](../guide/mode-and-env.md#%D0%B8%D1%81%D0%BF%D0%BEn%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D0%BF%D0%B5%D1%80%D0%B5%D0%BC%D0%B5%D0%BD%D0%BD%D1%8B%D1%85-%D0%BE%D0%BA%D1%80%D1%83%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B2-%D0%BAn%D0%B8%D0%B5%D0%BD%D1%82%D1%81%D0%BA%D0%BE%D0%BC-%D0%BA%D0%BE%D0%B4%D0%B5). Cypress поддерживает несколько способов для [определения переменных окружения](https://docs.cypress.io/guides/guides/environment-variables.html#), но самым простым будем использование .json файлов (`cypress.json` или `cypress.env.json`) для определения переменных окружения. Обратите внимание, что эти переменные доступны через функцию `Cypress.env`, а не через объект `process.env`.

## Установка в уже созданный проект

```bash
vue add e2e-cypress
```
