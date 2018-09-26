# Trabalhando com CSS

Os projetos do Vue CLI vêm com suporte para [PostCSS](http://postcss.org/), [CSS Modules](https://github.com/css-modules/css-modules) e pré-processadores incluindo [Sass](https://sass-lang.com/), [Less](http://lesscss.org/) e [Stylus](http://stylus-lang.com/).

## Referenciando Recursos

Todos os CSS compilados são processados pelo [css-loader](https://github.com/webpack-contrib/css-loader), que analisa o `url()` e os define como pedidos do módulo. Isso significa que você pode se referir a recursos usando caminhos relativos com base na estrutura de arquivos local. Note que se você quiser referenciar um arquivo dentro de uma dependência npm ou via alias de webpack, o caminho deve ser prefixado com `~` para evitar ambigüidade. Veja [Static Asset Handling](./html-and-static-assets.md#static-assets-handling) para mais detalhes.

## Pré-Processadores

Você pode selecionar pré-processadores (Sass/Less/Stylus) ao criar o projeto. Se você não fez isso, a configuração interna do webpack ainda está pré-configurada para lidar com todos eles. Você só precisa instalar manualmente os carregadores de webpack correspondentes:

``` bash
# Sass
npm install -D sass-loader node-sass

# Less
npm install -D less-loader less

# Stylus
npm install -D stylus-loader stylus
```
Então você pode importar os tipos de arquivos correspondentes ou usá-los em arquivos `*.vue` com:

``` vue
<style lang="scss">
$color: red;
</style>
```

### Importações automáticas

Se você quiser importar arquivos automaticamente (para cores, variáveis, mixins...), você pode usar o [style-resources-loader](https://github.com/yenshih/style-resources-loader). Aqui está um exemplo de stylus que importa `./src/styles/imports.styl` em cada SFC e todos os arquivos da stylus:

```js
// vue.config.js
const path = require('path')

module.exports = {
  chainWebpack: config => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResource(config.module.rule('stylus').oneOf(type)))
  },
}

function addStyleResource (rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/styles/imports.styl'),
      ],
    })
}
```

Você também pode usar o [vue-cli-plugin-style-resources-loader](https://www.npmjs.com/package/vue-cli-plugin-style-resources-loader).

## PostCSS

O Vue CLI usa o PostCSS internamente.

Você pode configurar o PostCSS via `.postcssrc` ou qualquer fonte de configuração suportada pelo [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config), e configurar o [postcss-loader]( https://github.com/postcss/postcss-loader) via `css.loaderOptions.postcss` no `vue.config.js`.

O plugin [autoprefixer](https://github.com/postcss/autoprefixer) está ativado por padrão. Para configurar os destinos do navegador, use o campo [browserslist](../guide/browser-compatibility.html#browserslist) em `package.json`.

::: tip Nota sobre regras CSS com prefixos Vendor
Na criação da produção, o Vue CLI otimiza seu CSS e elimina regras de CSS com prefixos Vendor desnecessários com base nos destinos de seu navegador. Com o `autoprefixer` ativado por padrão, você deve sempre usar apenas regras CSS não prefixadas.
:::

## CSS Modules

Você pode [usar CSS Modules em arquivos `*.vue`](https://vue-loader.vuejs.org/en/features/css-modules.html) fora da caixa com `<style module>`.

Para importar CSS ou outros arquivos pré-processador como módulos CSS em JavaScript, o nome do arquivo deve terminar com `.module.(css|less|sass|scss|styl)`:

``` js
import styles from './foo.module.css'
// funciona para todos os pré-processadores suportados
import sassStyles from './foo.module.scss'
```

Se você deseja descartar o `.module` nos nomes dos arquivos, configure `css.modules` para `true` no `vue.config.js`:

``` js
// vue.config.js
module.exports = {
  css: {
    modules: true
  }
}
```

Se você deseja customizar os nomes das classes dos módulos CSS gerados, você pode fazê-lo via `css.loaderOptions.css` no `vue.config.js`. Todas as opções do `css-loader` são suportadas aqui, por exemplo `localIdentName` e `camelCase`:

``` js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      css: {
        localIdentName: '[name]-[hash]',
        camelCase: 'only'
      }
    }
  }
}
```

## Opções de passagem para carregadores de pré-processador

Às vezes você pode querer passar opções para o carregador de webpack do pré-processador. Você pode fazer isso usando a opção `css.loaderOptions` no `vue.config.js`. Por exemplo, para passar algumas variáveis globais compartilhadas para todos os seus estilos Sass:

``` js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      // passa opções para o sass-loader
      sass: {
        // @/ é um alias para src /
        // então isso assume que você tem um arquivo chamado `src/variables.scss`
        data: `@import "@/variables.scss";`
      }
    }
  }
}
```

Loaders podem ser configurados via `loaderOptions` incluindo:

- [css-loader](https://github.com/webpack-contrib/css-loader)
- [postcss-loader](https://github.com/postcss/postcss-loader)
- [sass-loader](https://github.com/webpack-contrib/sass-loader)
- [less-loader](https://github.com/webpack-contrib/less-loader)
- [stylus-loader](https://github.com/shama/stylus-loader)

::: tip Dica
Isso é preferível ao tocar manualmente em carregadores específicos usando o `chainWebpack`, porque essas opções precisam ser aplicadas em vários locais onde o carregador correspondente é usado.
:::
