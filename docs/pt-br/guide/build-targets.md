# Construir Targets

Quando você executa o `vue-cli-service build`, você pode especificar diferentes destinos de construção através da opção `--target`. Isso permite que você use a mesma base de código para produzir construções diferentes para diferentes casos de uso.

## App

App é o alvo de compilação padrão. Neste modo:

- `index.html` com injeção de dicas de recursos e recursos
- bibliotecas de fornecedores divididas em um bloco separado para melhor armazenamento em cache
- ativos estáticos abaixo de 4kb são incluídos no JavaScript
- os recursos estáticos em `public` são copiados no diretório de saída

## Biblioteca

::: tip Nota sobre Dependência Vue
No modo lib, o Vue é *externalizado*. Isso significa que o pacote não agrupará o Vue mesmo que seu código importe o Vue. Se o lib for usado através de um bundler, ele tentará carregar o Vue como uma dependência através do bundler; caso contrário, ele retorna a uma variável global `Vue`.
:::

Você pode criar uma única entrada como uma biblioteca usando

```
vue-cli-service build --target lib --name myLib [entry]
```

```
Arquivo                  Tamanho                  Gzipped

dist/myLib.umd.min.js    13.28 kb                 8.42 kb
dist/myLib.umd.js        20.95 kb                 10.22 kb
dist/myLib.common.js     20.57 kb                 10.09 kb
dist/myLib.css           0.33 kb                  0.23 kb
```

A entrada pode ser um arquivo `.js` ou` .vue`. Se nenhuma entrada for especificada, o `src/App.vue` será usado.

Um lib build produz:

- `dist/myLib.common.js`: Um pacote CommonJS para consumir via bundlers (infelizmente, o webpack atualmente não suporta o formato de saída dos módulos ES para pacotes ainda)

- `dist/myLib.umd.js`: Um pacote UMD para consumir diretamente em navegadores ou com loaders AMD

- `dist/myLib.umd.min.js`: Versão reduzida da compilação do UMD.

- `dist/myLib.css`: Arquivo CSS extraído (pode ser forçado a ser embutido configurando `css: {extract: false}` em `vue.config.js`)

### Vue vs. arquivos de entrada do JS/TS

Ao usar um arquivo `.vue` como entrada, sua biblioteca irá expor diretamente o próprio componente Vue, porque o componente é sempre a exportação padrão.

No entanto, quando você está usando um arquivo `.js` ou` .ts` como sua entrada, ele pode conter exportações nomeadas, então sua biblioteca será exposta como um módulo. Isto significa que a exportação padrão de sua biblioteca deve ser acessada como `window.yourLib.default` em compilações do UMD, ou como `const myLib = require('mylib').default` no build CommonJS. Se você não tem nenhuma exportação nomeada e deseja expor diretamente a exportação padrão, você pode usar a seguinte configuração do webpack no `vue.config.js`:

``` js
module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default'
    }
  }
}
```

## Componente da Web

::: tip Nota sobre compatibilidade
O modo Componente da Web não suporta o IE11 e abaixo. [Mais detalhes](https://github.com/vuejs/vue-web-component-wrapper#compatibility)
:::

::: tip Nota sobre Dependência Vue
No modo lib, o Vue é *externalizado*. Isso significa que o pacote não agrupará o Vue mesmo que seu código importe o Vue. Se o lib for usado através de um bundler, ele tentará carregar o Vue como uma dependência através do bundler; caso contrário, ele retorna a uma variável global `Vue`.
:::

Você pode criar uma única entrada como um componente da Web usando

```
vue-cli-service build --target wc --name my-element [entrada]
```

Note que a entrada deve ser um arquivo `*.vue`. O Vue CLI irá automaticamente quebrar e registrar o componente como um Web Component para você, e não há necessidade de fazer isso sozinho em main.js. Você pode usar o `main.js` como um aplicativo de demonstração apenas para desenvolvimento.

A construção produzirá um único arquivo JavaScript (e sua versão reduzida) com tudo embutido. O script, quando incluído em uma página, registra o elemento customizado `<my-element>`, que encapsula o componente Vue de destino usando `@vue/web-component-wrapper`. O wrapper automaticamente faz proxy de propriedades, atributos, eventos e slots. Veja os [docs para `@vue/web-component-wrapper`] (https://github.com/vuejs/vue-web-component-wrapper) para mais detalhes.

**Observe que o pacote depende do fato de o `Vue` estar globalmente disponível na página.**

Este modo permite que os consumidores do seu componente usem o componente Vue como um elemento DOM normal:

``` html
<script src="https://unpkg.com/vue"></script>
<script src="path/to/my-element.js"></script>

<!-- usar em HTML simples ou em qualquer outro framework -->
<my-element></my-element>
```

### Pacote que registra vários componentes da Web

Ao criar um pacote de componentes da Web, você também pode segmentar vários componentes usando um glob como entrada:

```
vue-cli-service build --target wc --name foo 'src/components/*.vue'
```

Ao construir múltiplos componentes web, `--name` será usado como prefixo e o nome do elemento customizado será inferido a partir do nome do arquivo do componente. Por exemplo, com `--name foo` e um componente chamado `HelloWorld.vue`, o elemento customizado resultante será registrado como `<foo-hello-world>`.

### Componente Web Assíncrono

Ao segmentar vários componentes da Web, o pacote pode se tornar muito grande e o usuário pode usar apenas alguns dos componentes que seu pacote registra. O modo de componente da Web assíncrono produz um pacote de divisão de código com um pequeno arquivo de entrada que fornece o tempo de execução compartilhado entre todos os componentes e registra todos os elementos personalizados antecipadamente. A implementação real de um componente é então buscada sob demanda somente quando uma instância do elemento personalizado correspondente é usada na página:

```
vue-cli-service build --target wc-async --name foo 'src/components/*.vue'
```

```
Arquivo              Tamanho                     Gzipped

dist/foo.0.min.js    12.80 kb                    8.09 kb
dist/foo.min.js      7.45 kb                     3.17 kb
dist/foo.1.min.js    2.91 kb                     1.02 kb
dist/foo.js          22.51 kb                    6.67 kb
dist/foo.0.js        17.27 kb                    8.83 kb
dist/foo.1.js        5.24 kb                     1.64 kb
```

Agora na página, o usuário só precisa incluir o Vue e o arquivo de entrada:

``` html
<script src="https://unpkg.com/vue"></script>
<script src="path/to/foo.min.js"></script>

<!-- A parte de implementação do foo-one é obtido automaticamente quando é usado -->
<foo-one></foo-one>
```
