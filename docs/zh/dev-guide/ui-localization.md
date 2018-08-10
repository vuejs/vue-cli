# UI 本地化

## 标准 UI

请遵循下列简单步骤来为 CLI UI 提交一种其它语言的翻译！

1. 运行 `navigator.languages` 或 `navigator.language` 为新的地区获取语言代码。*例如：`'fr'`。*

2. 搜索 npm 确认名为 `vue-cli-locale-<language code>` 的包是否已经存在。如果存在，则请通过 PR 为它贡献！如果没找到，则创建一个新的名为 `vue-cli-locale-<language code>` 的地区的包。*例如：`vue-cli-locale-fr`.*

3. 将地区的 JSON 文件放置在一个 `locales` 文件夹并将这个文件命名为语言代码。*例如：`locales/fr.json`。*

4. 在 `package.json` 文件中，设置 `unpkg` 字段为地区文件的路径。*例如：`"unpkg": "./locales/fr.json"`。*

5. 将包发布到 npm 上。

可以参考[这里](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/locales)的英文地区文件。

作为示例，参考一份[法语的包](https://github.com/Akryum/vue-cli-locale-fr)。

## 翻译插件

你也可以在插件的根目录的 `locales` 文件夹放置与 [vue-i18n](https://github.com/kazupon/vue-i18n) 兼容的地区文件。这样做会在项目打开的时候自动加载，然后你可以使用 `$t` 在你的组件和 vue-i18n 辅助函数里翻译字符串。同样的 UI API (像 `describeTask`) 用到的字符串将会进入 vue-i18n，这样你就可以对它们做本地化。

示例 `locales` 文件夹：

```
vue-cli-plugin/locales/en.json
vue-cli-plugin/locales/fr.json
```

API 的用法示例：

```js
api.describeConfig({
  // vue-i18n 路径
  description: 'com.my-name.my-plugin.config.foo'
})
```

::: danger 危险
请确定为 id 设置正确的命名空间，因为它需要跨所有插件保持唯一。我们推荐使用[反向域名记号 (reverse domain name notation)](https://en.wikipedia.org/wiki/Reverse_domain_name_notation)。
:::

在组件中使用的示例：

```html
<VueButton>{{ $t('com.my-name.my-plugin.actions.bar') }}</VueButton>
```

如果你愿意的话，可以使用 `ClientAddonApi` 在一个客户端 addon 加载地区文件：

```js
// 加载本地文件 (使用 vue-i18n)
const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
locales.keys().forEach(key => {
  const locale = key.match(/([a-z0-9]+)\./i)[1]
  ClientAddonApi.addLocalization(locale, locales(key))
})
```
