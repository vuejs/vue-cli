# @vue/cli-plugin-unit-jest

> Плагин unit-jest для vue-cli

## Внедряемые команды

- **`vue-cli-service test:unit`**

  Запуск модульных тестов с помощью Jest. По умолчанию значением `testMatch` будет `<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))` что совпадает с:

  - Любыми файлами в `tests/unit` которые заканчиваются на `.spec.(js|jsx|ts|tsx)`;
  - Любыми js(x)/ts(x) файлами внутри каталогов `__tests__`.

  Использование: `vue-cli-service test:unit [options] <regexForTestFiles>`

  Также поддерживаются все [опции Jest CLI](https://facebook.github.io/jest/docs/en/cli.html).

## Отладка тестов

Обратите внимание, что запуск `jest` напрямую будет заканчиваться ошибкой, потому что для пресета Babel требуются подсказки как заставить код работать в Node.js. Поэтому необходимо запускать тесты командой `vue-cli-service test:unit`.

Если необходимо отладить тесты с помощью инспектора Node, можно запустить следующее:

```bash
# macOS или linux
node --inspect-brk ./node_modules/.bin/vue-cli-service test:unit

# Windows
node --inspect-brk ./node_modules/@vue/cli-service/bin/vue-cli-service.js test:unit
```

## Конфигурация

Jest можно настроить через `jest.config.js` в корне проекта, или через поле `jest` в файле `package.json`.

## Установка в уже созданный проект

```bash
vue add unit-jest
```

## Обработка зависимостей из `/node_modules`

По умолчанию jest не обрабатывает ничего из `/node_modules`.

Поскольку jest работает на Node, то нет необходимости транспилировать всё, где используются современные возможности ECMAScript, так как Node >=8 уже их поддерживает, поэтому это разумное решение по умолчанию. По этой же причине также cli-plugin-jest не поддерживает опцию `transpileDependencies` в файле `vue.config.js`.

Однако, есть (по крайней мере) три случая, когда необходимо транспилировать код из `/node_modules` в jest:

1. Использование выражений ES6 `import`/`export`, которые нужно скомпилировать в формат commonjs `module.exports`
2. Однофайловые компоненты (`.vue` файлы) которые запускаются через `vue-jest`
3. Код Typescript

Для этого необходимо добавить исключение в опции jest `transformIgnorePatterns`. Значение по умолчанию такое:

```javascript
transformIgnorePatterns: ['/node_modules/']
```

Необходимо добавить исключения из этого шаблона с негативным lookahead в RegExp:

```javascript
transformIgnorePatterns: ['/node_modules/(?!name-of-lib-o-transform)']
```

Для исключения нескольких библиотек:

```javascript
transformIgnorePatterns: ['/node_modules/(?!lib-to-transform|other-lib)']
```
