# Локализация в UI

## Локализация стандартного UI

Выполните следующие шаги, для добавления нового перевода в CLI UI!

1. Выполните `navigator.languages` или `navigator.language`, чтобы получить код текущего языка для новой локализации. *Например: `'fr'`.*

2. Поищите в NPM не существует ли уже пакета с именем `vue-cli-locale-<код языка>`. Если существует, пожалуйста отправляйте в него пулл-реквестаы для изменений! Если вы ничего не нашли, создайте новый пакет с именем `vue-cli-locale-<код языка>`. *Например: `vue-cli-locale-fr`*

3. Поместите JSON-файл локализации в каталог `locales` и установите ему в качестве имени языковой код. *Например: `locales/fr.json`*

4. В файле `package.json` установите полю `unpkg` значение пути до файла локализации. *Например: `"unpkg": "./locales/fr.json"`*

5. Опубликуйте пакет в NPM.

Английская локализация для отправной точки находится [здесь](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/locales/en.json).

Взгляните в качестве примера на [пакет французской локализации](https://github.com/Akryum/vue-cli-locale-fr).

## Локализация вашего плагина

Вы можете поместить файлы локализаций, совместимые с [vue-i18n](https://github.com/kazupon/vue-i18n) в каталог `locales` в корне вашего плагина. Они будут автоматически загружены в клиент при открытии проекта. Вы можете использовать `$t` для перевода строк в ваших компонентах и другие возможности vue-i18n. Также, любые строки используемые в UI API (такие как `describeTask`) будут также обрабатываться vue-i18n, поэтому вы сможете локализовать и их.

Пример каталога `locales`:

```
vue-cli-plugin/locales/en.json
vue-cli-plugin/locales/fr.json
```

Пример использования в API:

```js
api.describeConfig({
  // путь vue-i18n
  description: 'com.my-name.my-plugin.config.foo'
})
```

::: danger Убедитесь!
В правильно указанном пространстве имён; оно должно быть уникальным для всех плагинов. Рекомендуется применять [нотацию перевёрнутого доменного имени](https://en.wikipedia.org/wiki/Reverse_domain_name_notation).
:::

Пример использования в компонентах:

```html
<VueButton>{{ $t('com.my-name.my-plugin.actions.bar') }}</VueButton>
```

Вы также можете загружать переводы в клиентском расширении, с помощью `ClientAddonApi`:

```js
// Загрузка файлов локализации (используется vue-i18n)
const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
locales.keys().forEach(key => {
  const locale = key.match(/([a-z0-9]+)\./i)[1]
  ClientAddonApi.addLocalization(locale, locales(key))
})
```
