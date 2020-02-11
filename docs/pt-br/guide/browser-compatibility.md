# Compatibilidade do navegador

## browserslist

Você observará um campo `browserslist` em` package.json` (ou um arquivo `.browserslistrc` separado) especificando um intervalo de navegadores que o projeto está direcionando. Este valor será usado por [@babel/preset-env][babel-preset-env] e [autoprefixer][autoprefixer] para determinar automaticamente os recursos JavaScript que precisam ser transpilados e os prefixos do fornecedor CSS necessários.

Veja [aqui][browserslist] para saber como especificar os intervalos do navegador.

## Polyfills

Um projeto padrão do Vue CLI usa [@vue/babel-preset-app][babel-preset-app], que usa `@babel/preset-env` e a configuração `browserslist` para determinar os Polyfills necessários para o seu projeto.

### useBuiltIns: 'usage'

Por padrão, ele passa [`useBuiltIns: 'usage'`](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) para `@babel/preset-env` que detecta automaticamente os polyfills necessários com base nos recursos de idioma usados em seu código-fonte. Isso garante que apenas a quantidade mínima de polyfills seja incluída no seu pacote final. No entanto, isso também significa **se uma de suas dependências tiver requisitos específicos em polyfills, por padrão, o Babel não poderá detectá-la.**

Se uma de suas dependências precisar de polyfills, você tem algumas opções:

1. **Se a dependência for escrita em uma versão ES que seus ambientes de destino não suportam:** Inclua essa dependência na opção [`transpileDependencies`](../config/#transpileependencies) em `vue.config.js`. Isso habilitaria as transformações de sintaxe e a detecção de polyfill baseada em uso para essa dependência.

2. **Se a dependência vier com código ES5 e listar explicitamente os polyfills necessários:** você pode pré-incluir os polyfills necessários usando os [polyfills](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app#polyfills) opção para `@vue/babel-preset-app`. **Note que o `es6.promise` é incluído por padrão, porque é muito comum as bibliotecas dependerem do Promises.**
    
    ``` js
    // babel.config.js
    module.exports = {
      presets: [
        ['@vue/app', {
          polyfills: [
            'es6.promise',
            'es6.symbol'
          ]
        }]
      ]
    }
    ```

    ::: tip Dica
    É recomendável adicionar polyfills dessa maneira, em vez de importá-los diretamente em seu código-fonte, porque os polyfills listados aqui podem ser excluídos automaticamente se os destinos de `browserslist` não precisarem deles.
    :::

3. **Se a dependência fornecer o código ES5, mas usar recursos ES6 + sem listar explicitamente os requisitos de preenchimento (por exemplo, Vuetify):** Use `useBuiltIns: 'entry'` e, em seguida, adicione `import '@babel/polyfill'` ao seu arquivo de entrada. Isso importará **TODOS** os polyfills com base nas segmentações de `browserslist`, para que você não precise mais se preocupar com os polyfills de dependência, mas provavelmente aumentará o tamanho final do pacote com alguns polyfills não utilizados.

Veja [@babel-preset/env docs](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) para mais detalhes.

### Polyfills ao criar como biblioteca ou componentes da Web

Ao usar o Vue CLI para [construir uma biblioteca ou Web Components](./build-targets.md), é recomendado passar `useBuiltIns: false` para `@vue/babel-preset-app` para desabilitar a injeção automática de polyfill. Isso garante que você não inclua polyfills desnecessários em seu código, pois deve ser responsabilidade do aplicativo consumidor incluir polyfills.

## Modo moderno

Com o Babel, podemos aproveitar todos os novos recursos de linguagem do ES2015+, mas isso também significa que temos que enviar pacotes transpilados e polyfilled para suportar navegadores mais antigos. Esses pacotes transpilados são geralmente mais detalhados do que o código original nativo do ES2015+, e também são analisados ​​e executados mais lentamente. Dado que hoje uma boa maioria dos navegadores modernos tem um suporte decente para o ES2015 nativo, é um desperdício termos que enviar um código mais pesado e menos eficiente para esses navegadores só porque temos que suportar os mais antigos.

O Vue CLI oferece um "Modo Moderno" para ajudá-lo a resolver este problema. Ao construir para produção com o seguinte comando:

``` bash
vue-cli-service build --modern
```

O Vue CLI produzirá duas versões do seu aplicativo: um pacote moderno direcionado a navegadores modernos que oferecem suporte a [módulos ES](https://jakearchibald.com/2017/es-modules-in-browsers/) e um pacote herdado direcionado a navegadores mais antigos isso não.

A parte legal é que não há requisitos especiais de implantação. O arquivo HTML gerado emprega automaticamente as técnicas discutidas no [excelente post de Phillip Walton](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/):

- O pacote moderno é carregado com `<script type="module ">`, nos navegadores que o suportam; eles também são pré-carregados usando `<link rel="modulepreload">`.

- O pacote herdado é carregado com `<script nomodule>`, que é ignorado pelos navegadores que suportam os módulos ES.

- Uma correção para o `<script nomodule>` no Safari 10 também é automaticamente injetada.

Para um aplicativo Hello World, o pacote moderno já é 16% menor. Na produção, o pacote moderno normalmente resulta em análise e avaliação significativamente mais rápidas, melhorando o desempenho de carregamento do aplicativo.

::: tip Dica
`<script type="module">` é carregado [com o CORS sempre ativado](https://jakearchibald.com/2017/es-modules-in-browsers/#always-cors). Isso significa que seu servidor deve retornar cabeçalhos CORS válidos como `Access-Control-Allow-Origin: *`. Se você deseja buscar os scripts com credenciais, defina a opção [crossorigin](../config/#crossorigin) para `use-credentials`.

Além disso, o modo moderno usa um script in-line para evitar que o Safari 10 carregue ambos os pacotes, portanto, se você estiver usando um CSP estrito, será necessário permitir explicitamente o script in-line com:

```
Content-Security-Policy: script-src 'self' 'sha256-4RS22DYeB7U14dra4KcQYxmwt5HkOInieXK1NUMBmQI='
```
:::

[autoprefixer]: https://github.com/postcss/autoprefixer
[babel-preset-env]: https://new.babeljs.io/docs/en/next/babel-preset-env.html
[babel-preset-app]: https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app
[browserslist]: https://github.com/ai/browserslist
