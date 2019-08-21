# @vue/cli-plugin-e2e-nightwatch

> Плагин e2e-nightwatch для vue-cli

## Внедряемые команды

- **`vue-cli-service test:e2e`**

  Запускает E2E тесты с помощью [NightwatchJS](http://nightwatchjs.org).

  Опции:

  ```
  --url        запуск E2E тестов по указанному URL, вместо авто-запуска сервера
  --config     использовать пользовательский файл конфигурации nightwatch (перезаписывает внутренние настройки)
  -e, --env    указанные через запятую окружения браузеров, в которых требуется запуск (по умолчанию: chrome)
  -t, --test   указать запускаемый тест по имени
  -f, --filter glob для фильтрации тестов по имени файла
  ```

  > Примечание: этот плагин в настоящее время использует Nightwatch v0.9.x. Мы ждём стабильного релиза Nightwatch 1.0 для обновления.

  Дополнительно, [все опции Nightwatch CLI поддерживаются](https://nightwatchjs.org/guide#command-line-options).

## Конфигурация

Nightwatch предварительно сконфигурирован для запуска в Chrome по умолчанию. Если необходимо запустить E2E тесты в других браузерах — потребуется добавить `nightwatch.config.js` или `nightwatch.json` в корневой каталог проекта и указать там дополнительные браузеры. Конфигурация будет объединена с [внутренней конфигурацией Nightwatch](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-plugin-e2e-nightwatch/nightwatch.config.js).

Кроме того, можно полностью заменить внутреннюю конфигурацию на пользовательский конфигурационный файл с помощью опции `--config`.

Обратитесь к документации Nightwatch для получения информации о [параметрах конфигурации](http://nightwatchjs.org/gettingstarted#settings-file) и о том, как [установить драйверы браузера](http://nightwatchjs.org/gettingstarted#browser-drivers-setup).

## Установка в уже созданный проект

```sh
vue add e2e-nightwatch
```
