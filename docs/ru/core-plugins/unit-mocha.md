# @vue/cli-plugin-unit-mocha

> Плагин unit-mocha для vue-cli

## Внедряемые команды

- **`vue-cli-service test:unit`**

  Запускает тесты с помощью [mochapack](https://github.com/sysgears/mochapack) + [chai](http://chaijs.com/).

  **Обратите внимание, что тесты запускаются в Node.js с симулированным JSDOM окружением браузера.**

  ```
  Использование: vue-cli-service test:unit [options] [...files]

  Опции:

    --watch, -w   запуск в режиме отслеживания
    --grep, -g    запуск тестов, попадающих под <pattern>
    --slow, -s    порог "медленных" тестов в миллисекундах
    --timeout, -t порог таймаута в миллисекундах
    --bail, -b    останавливаться после первого неудачного теста
    --require, -r подключить указанный модуль перед запуском тестов
    --include     включить указанный модуль в тестовую сборку
    --inspect-brk использовать инспектор для отладки тестов
  ```

  По умолчанию под файлы тестов попадают: любые файлы `tests/unit` которые заканчиваются на `.spec.(ts|js)`.

  Поддерживаются все [опции командной строки mochapack](https://sysgears.github.io/mochapack/docs/installation/cli-usage.html).

## Установка в уже созданный проект

```bash
vue add unit-mocha
```
