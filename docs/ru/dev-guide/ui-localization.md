# Локализация в UI

## Локализация стандартного UI

Для упрощения совместной работы и синхронизации результатов, исходная английская локализация из ветви `dev` автоматически импортируется в [Transifex](https://www.transifex.com/vuejs/vue-cli/dashboard/), платформу совместных переводов.

Для существующих переводов, вы можете [зарегистрироваться в качестве переводчика](https://www.transifex.com/vuejs/vue-cli/dashboard/).
Для новых переводов, вы можете [запросить добавление нового языка](https://www.transifex.com/vuejs/vue-cli/dashboard/) после регистрации.

В любом случае вы можете переводить ключи по мере их добавления или изменения в исходной локализации.

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
