# Trabalhando com Webpack

## Configuração simples

A maneira mais fácil de ajustar a configuração do webpack é fornecer um objeto para a opção `configureWebpack` no `vue.config.js`:

``` js
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      new MyAwesomeWebpackPlugin()
    ]
  }
}
``` 

O objeto será mesclado na configuração final do webpack usando [webpack-merge](https://github.com/survivejs/webpack-merge).

::: warning Atenção
Algumas opções de webpack são definidas com base em valores em `vue.config.js` e não devem ser transformadas diretamente. Por exemplo, em vez de modificar `output.path`, você deve usar a opção `outputDir` em `vue.config.js`; em vez de modificar `output.publicPath`, você deve usar a opção ` baseUrl` no `vue.config.js`. Isso ocorre porque os valores em `vue.config.js` serão usados em vários lugares dentro da configuração para garantir que tudo funcione corretamente juntos.
:::

Se você precisar de um comportamento condicional baseado no ambiente, ou quiser alterar diretamente a configuração, use uma função (que será avaliada tardiamente após as variáveis de ambiente serem definidas). A função recebe a configuração resolvida como o argumento. Dentro da função, você pode alterar a configuração diretamente ou retornar um objeto que será mesclado:

``` js
// vue.config.js
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mudando config para production...
    } else {
      // mudando para development...
    }
  }
}
```

## Chaining (Avançado)

A configuração interna do webpack é mantida usando
[webpack-chain](https://github.com/mozilla-neutrino/webpack-chain). A biblioteca fornece uma abstração sobre a configuração bruta do webpack, com a capacidade de definir regras de carregador nomeado e plugins nomeados e, posteriormente, "tocar" nessas regras e modificar suas opções.

Isso nos permite um controle mais refinado sobre a configuração interna. Abaixo você verá alguns exemplos de modificações comuns feitas através da opção `chainWebpack` no `vue.config.js`.

::: tip Dica
[vue inspect](#inspecting-the-project-s-webpack-config) será extremamente útil quando você estiver tentando acessar loaders específicos via encadeamento.
:::

### Modificando opções de um Loader

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
          // modificar as opções...
          return options
        })
  }
}
```

::: tip Dica
Para loaders relacionados ao CSS, recomenda-se usar [css.loaderOptions](../config/#css-loaderoptions) em vez de direcionar diretamente os loaders via encadeamento. Isso ocorre porque existem várias regras para cada tipo de arquivo CSS e `css.loaderOptions` garante que você pode afetar todas as regras em um único local.
:::

### Adicionando um novo Loader

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    // GraphQL Loader
    config.module
      .rule('graphql')
      .test(/\.graphql$/)
      .use('graphql-tag/loader')
        .loader('graphql-tag/loader')
        .end()
  }
}
```

### Substituindo Loaders de uma Regra

Se você quiser substituir um [Base Loader](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config/base.js) existente, por exemplo, usando `vue-svg-loader` para arquivos SVG embutidos em vez de carregar o arquivo:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')

    // clear all existing loaders.
    // if you don't do this, the loader below will be appended to
    // existing loaders of the rule.
    svgRule.uses.clear()

    // add replacement loader(s)
    svgRule
      .use('vue-svg-loader')
        .loader('vue-svg-loader')
  }
}
```

### Modificando as opções de um Plugin

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        return [/* novos argumentos para passar para o construtor do html-webpack-plugin */]
      })
  }
}
```

Você precisará se familiarizar com a [API do webpack-chain](https://github.com/mozilla-neutrino/webpack-chain#getting-started) e [ler algum código-fonte](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config) para entender como aproveitar todo o potencial desta opção, mas lhe dá uma maneira mais expressiva e segura de modificar configuração do webpack do que diretamente valores de mutação.

Por exemplo, digamos que você queira alterar o local padrão de `index.html` de `/Users/username/proj/public/index.html` para `/Users/username/proj/app/templates/index.html`. Referenciando [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options) você pode ver uma lista de opções que você pode passar. Para mudar nosso caminho de modelo, podemos passar em um novo caminho de modelo com a seguinte configuração:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = '/Users/username/proj/app/templates/index.html'
        return args
      })
  }
}
```

Você pode confirmar que esta mudança ocorreu examinando a configuração do webpack do vue com o utilitário `vue inspect`, que discutiremos a seguir.

## Inspecionando a configuração do Webpack do projeto

Já que `@vue/cli-service` abstrai a configuração do webpack, pode ser mais difícil entender o que está incluído na configuração, especialmente quando você está tentando fazer ajustes por conta própria.

`vue-cli-service` expõe o comando `inspect` para inspecionar a configuração resolvida do webpack. O binário global `vue` também fornece o comando `inspect`, e simplesmente faz proxy para o `vue-cli-service inspect` em seu projeto.

O comando imprimirá a configuração resolvida do webpack para stdout, que também contém dicas sobre como acessar regras e plug-ins via encadeamento.

Você pode redirecionar a saída para um arquivo para facilitar a inspeção:

``` bash
vue inspect > output.js
```

Note que a saída não é um arquivo de configuração webpack válido, é um formato serializado destinado apenas para inspeção.

Você também pode inspecionar um subconjunto da configuração especificando um caminho:

``` bash
# inspecionar somente a primeira regra
vue inspect module.rules.0
```

Ou segmente uma regra ou plug-in nomeado:

``` bash
vue inspect --rule vue
vue inspect --plugin html
```

Finalmente, você pode listar todas as regras e plugins nomeados:

``` bash
vue inspect --rules
vue inspect --plugins
```

## Usando a Configuração definida como um arquivo

Algumas ferramentas externas podem precisar de acesso à configuração webpack resolvida como um arquivo, por exemplo, IDEs ou ferramentas de linha de comando que esperam um caminho de configuração do webpack. Nesse caso, você pode usar o seguinte caminho:

```
<projectRoot>/node_modules/@vue/cli-service/webpack.config.js
```

Este arquivo dinamicamente resolve e exporta exatamente a mesma configuração do webpack usada nos comandos `vue-cli-service`, incluindo aqueles de plugins e até mesmo suas configurações customizadas.
