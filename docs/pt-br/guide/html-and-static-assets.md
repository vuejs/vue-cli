# HTML e recursos estáticos

## HTML

### O Arquivo Index

O arquivo `public/index.html` é um modelo que será processado com [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin). Durante a construção, os links de recursos serão injetados automaticamente. Além disso, o Vue CLI também injeta automaticamente dicas de recursos (`preload/prefetch`), links de manifesto/ícone (quando o plug-in do PWA é usado) e os links de recursos para os arquivos JavaScript e CSS produzidos durante a construção.

### Interpolação

Como o arquivo de índice é usado como um modelo, é possível usar a sintaxe [lodash template](https://lodash.com/docs/4.17.10#template) para interpolar valores nele:

- `<%= VALUE %>` para interpolação sem escape;
- `<%- VALUE %>` para interpolação com escape de HTML;
- `<% expression %>` para fluxos de controle JavaScript.

Além dos [valores padrão expostos pelo `html-webpack-plugin`](https://github.com/jantimon/html-webpack-plugin#writing-your-own-templates), todas as [variáveis de ambiente do lado do cliente ](./mode-and-env.md#using-env-variables-in-client-side-code) também estão disponíveis diretamente. Por exemplo, para usar o valor `BASE_URL`:

``` html
<link rel="icon" href="<%= BASE_URL %>favicon.ico">
```

Veja também:
- [baseUrl](../config/#baseurl)

### Preload

[`<link rel="preload">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) é um tipo de dica de recurso usado para especificar recursos que serão necessários logo após o carregamento, que você deseja iniciar o pré-carregamento no início do ciclo de vida de um carregamento de página, antes que a máquina de renderização principal do navegador seja ativada.

Por padrão, o aplicativo Vue CLI gerará automaticamente as dicas de pré-carregamento para todos os arquivos necessários para a renderização inicial do seu aplicativo.

As dicas são injetadas usando [@vue/preload-webpack-plugin](https://github.com/vuejs/preload-webpack-plugin) e podem ser modificadas/deletadas via `chainWebpack` as `config.plugin ('preload')`.

### Prefetch

[`<link rel="prefetch">`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ) é um tipo de dica de recurso que informa ao navegador para pré-buscar o conteúdo que o usuário pode visitar em um futuro próximo no tempo ocioso do navegador, após o carregamento da página.

Por padrão, um aplicativo Vue CLI gerará automaticamente as dicas de pré-busca para todos os arquivos JavaScript gerados para partes assíncronas (como resultado de [divisão de código sob demanda via `import()` dinâmico](https://webpack.js.org/guides/code-splitting/#dynamic-imports)).

As dicas são injetadas usando [@vue/preload-webpack-plugin](https://github.com/vuejs/preload-webpack-plugin) e podem ser modificadas/deletadas via `chainWebpack` como `config.plugin ('prefetch')`.

Exemplo:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    // remover o plugin de prefetch
    config.plugins.delete('prefetch')

    // ou:
    // modificar suas opções:
    config.plugin('prefetch').tap(options => {
      options[0].fileBlacklist = options[0].fileBlacklist || []
      options[0].fileBlacklist.push([/myasyncRoute(.)+?\.js$/])
      return options
    })
  }
}
```

Quando o plug-in de pré-busca está desativado, você pode selecionar manualmente blocos específicos para pré-busca usando os comentários embutidos do webpack:

``` js
import(/* webpackPrefetch: true */ './someAsyncComponent.vue')
```

O webpack injetará links de pré-busca quando o fragmento pai for carregado em tempo de execução.

::: tip Dica
Os links de prefetch consumirão largura de banda. Se você tiver um aplicativo grande com muitos fragmentos assíncronos e seu usuário for principalmente móvel e, portanto, ciente da largura de banda, você poderá desabilitar os links de prefetch e selecionar manualmente os fragmentos para pré-busca.
:::

### Desativar geração de Index

Ao usar o Vue CLI com um backend existente, você pode precisar desativar a geração do `index.html` para que os ativos gerados possam ser usados em uma página renderizada pelo servidor. Para fazer isso, o seguinte pode ser adicionado ao [`vue.config.js`](../config/#vue-config-js):

``` js
// vue.config.js
module.exports = {
  // desativar hashes em nomes de arquivos
  filenameHashing: false,
  // excluir plug-ins do webpack relacionados a HTML
  chainWebpack: config => {
    config.plugins.delete('html')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  }
}
```

No entanto, isso não é realmente recomendado porque:

- Nomes de arquivos codificados dificultam a implementação de um controle de cache eficiente.
- Os nomes de arquivos codificados também não funcionam bem com a divisão de código, que gera arquivos JavaScript adicionais com vários nomes de arquivos.
- Nomes de arquivos codificados não funcionam com o [Modo Moderno](../guide/browser-compatibility.md#modo-moderno).

Em vez disso, você deve considerar o uso da opção [indexPath](../config/#indexpath) para usar o HTML gerado como um modelo de exibição em sua estrutura do lado do servidor.

### Criando um aplicativo de múltiplas páginas

Nem todo aplicativo tem que ser um SPA. O Vue CLI suporta a construção de um aplicativo multi-paginado usando a opção [`pages` no `vue.config.js`](../config/#pages). O aplicativo construído compartilhará eficientemente partes comuns entre várias entradas para um desempenho de carregamento ideal.

## Manuseio de ativos estáticos

Os recursos estáticos podem ser manipulados de duas maneiras diferentes:

- Importado em JavaScript ou referenciado em templates/CSS por caminhos relativos. Tais referências serão tratadas pelo webpack.

- Colocado no diretório `public` e referenciado por caminhos absolutos. Esses recursos serão simplesmente copiados e não passarão pelo webpack.

### Importações de Paths Relativos

Quando você faz referência a um rescurso estático usando caminho relativo (deve começar com `.`) dentro de arquivos JavaScript, CSS ou `*.vue`, o recurso será incluído no gráfico de dependência do webpack. Durante este processo de compilação, todas as URLs de recursos, como `<img src="...">`, `background: url(...)` e CSS `@ import`, são **definidas como dependências do módulo**.

Por exemplo, `url(./image.png)` será traduzido em `require('./image.png')`, e

``` html
<img src="./image.png">
```

será compilado em:

``` js
h('img', { attrs: { src: require('./image.png') }})
```

Internamente, usamos o `file-loader` para determinar o local final do arquivo com hashes de versão e caminhos base públicos corretos, e usar o `url-loader` para recursos in-line condicionalmente menores que 4kb, reduzindo a quantidade de solicitações HTTP.

Você pode ajustar o limite de tamanho de arquivo embutido via [chainWebpack](../config/#cadewebpack). Por exemplo, para definir o limite como 10kb:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('images')
        .use('url-loader')
          .loader('url-loader')
          .tap(options => Object.assign(options, { limit: 10240 }))
  }
}
```

### Regras de transformação de URL

- Se o URL for um caminho absoluto (por exemplo, `/images/foo.png`), ele será preservado como está.

- Se a URL começar com `.`, ela será interpretada como uma solicitação de módulo relativa e resolvida com base na estrutura de pastas em seu sistema de arquivos.

- Se a URL começar com `~`, qualquer coisa depois é interpretada como uma requisição de módulo. Isso significa que você pode até mesmo referenciar ativos dentro dos módulos do node:

  ``` html
  <img src="~some-npm-package/foo.png">
  ```

- Se o URL começar com `@`, ele também será interpretado como uma solicitação de módulo. Isso é útil porque a Vue CLI, por padrão, atribui `@` a `<projectRoot>/src`. **(apenas modelos)**

### A pasta `public`

Qualquer ativo estático colocado na pasta `public` será simplesmente copiado e não passará pelo webpack. Você precisa referenciá-los usando caminhos absolutos.

Note que recomendamos a importação de ativos como parte de seu gráfico de dependência de módulo para que eles passem pelo webpack com os seguintes benefícios:

- Scripts e folhas de estilo são reduzidos e agrupados para evitar solicitações extras de rede.
- Arquivos ausentes causam erros de compilação em vez de erros 404 para seus usuários.
- Os nomes dos arquivos de resultado incluem hashes de conteúdo, para que você não precise se preocupar com os navegadores que armazenam em cache suas versões antigas.

O diretório `public` é fornecido como uma **saída de emergência** e, quando você faz referência a ele por meio do caminho absoluto, é preciso levar em conta onde o aplicativo será implantado. Se o seu aplicativo não estiver implantado na raiz de um domínio, você precisará prefixar seus URLs com o [baseUrl](../config/#baseurl):

- Em `public/index.html` ou outros arquivos HTML usados como templates pelo `html-webpack-plugin`, você precisa prefixar o link com`<%= BASE_URL %>`:

  ``` html
  <link rel="icon" href="<%= BASE_URL %>favicon.ico">
  ```

- Nos templates, você precisará primeiro passar o URL base para o seu componente:

  ``` js
  data () {
    return {
      baseUrl: process.env.BASE_URL
    }
  }
  ```

  Então:

  ``` html
  <img :src="`${baseUrl}my-image.png`">
  ```

### Quando usar a pasta `public`

- Você precisa de um arquivo com um nome específico na saída de compilação.
- Você tem milhares de imagens e precisa referenciar dinamicamente seus caminhos.
- Algumas bibliotecas podem ser incompatíveis com o Webpack e você não tem outra opção senão incluí-lo como uma tag `<script>`.