# CLI Service

## Usando o Binário

Dentro de um projeto Vue CLI, o `@vue/cli-service` instala um binário chamado `vue-cli-service`. Você pode acessar o binário diretamente como `vue-cli-service` em scripts npm, ou como `./node_modules/.bin/vue-cli-service` do terminal.

Isto é o que você verá no `package.json` de um projeto usando a predefinição padrão:

``` json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build"
  }
}
```

Você pode invocar esses scripts usando npm ou Yarn:

``` bash
npm run serve
# OU
yarn serve
```

Se você tem [npx](https://github.com/zkat/npx) disponível (deve ser empacotado com uma versão atualizada do npm), você também pode invocar o binário diretamente com:

``` bash
npx vue-cli-service serve
```

::: tip Dica
Você pode executar scripts com recursos adicionais usando a GUI com o comando `vue ui`.
:::

Aqui está o Webpack Analyzer da GUI em ação:

![UI Webpack Analyzer](/ui-analyzer.png)

## vue-cli-service serve

```
Uso: vue-cli-service serve [opções] [entrada]

Opções:

  --open    abre o navegador no arranque do servidor
  --copy    copia a url para a área de transferência no arranque do servidor
  --mode    especifica o modo de ambiente (padrão: desenvolvimento)
  --host    especifica o host (padrão: 0.0.0.0)
  --port    especifica a porta (padrão: 8080)
  --https   uso de https (padrão: false)
```

O comando `vue-cli-service serve` inicia um servidor dev (baseado no [webpack-dev-server](https://github.com/webpack/webpack-dev-server)) que vem com Hot-Module-Replacement (HMR) trabalhando fora da caixa.

Além dos flags da linha de comando, você também pode configurar o servidor dev usando o campo [devServer](../config/#devserver) em `vue.config.js`.

## vue-cli-service build

```
Uso: vue-cli-service build [opções] [entrada|padrão]

Opções:

  --mode        especifica o modo de ambiente (padrão: desenvolvimento)
  --dest        especifica o diretório de saída (padrão: dist)
  --modern      criar aplicativo segmentando navegadores modernos com fallback automático
  --target      app | lib | wc | wc-async (padrão: app)
  --name        nome para o modo lib ou web-component (padrão: "name" in package.json ou nome do arquivo de entrada)
  --no-clean    não remove o diretório dist antes de construir o projeto
  --report      gera o report.html para ajudar a analisar o conteúdo do pacote
  --report-json gera o report.json para ajudar a analisar o conteúdo do pacote
  --watch       observa as mudanças
```

`vue-cli-service build` produz um pacote pronto para produção no diretório `dist/`, com minificação para divisão de partes JS/CSS/HTML e auto vendor para melhor armazenamento em cache. O manifesto do fragmento é embutido no HTML.

Existem algumas bandeiras úteis:

- `--modern` constrói seu aplicativo usando o [Modo Moderno](./browser-compatibility.md#modern-mode), enviando código ES2015 nativo para navegadores modernos que o suportam, com fallback automático para um pacote herdado.

- `--target` permite que você construa qualquer componente dentro de seu projeto como uma biblioteca ou como componentes web. Veja [Build Targets](./build-targets.md) para mais detalhes.

- `--report` e` --report-json` geram relatórios baseados nas estatísticas de construção que podem ajudá-lo a analisar o tamanho dos módulos incluídos no seu pacote.

## vue-cli-service inspect

```
Uso: vue-cli-service inspect [opções] [...paths]

Opções:

  --mode    especifica o modo de ambiente (padrão: desenvolvimento)
```

Você pode usar o `vue-cli-service inspect` para inspecionar a configuração do webpack dentro de um projeto do Vue CLI. Consulte [Inspecting Webpack Config](./webpack.md#inspecting-the-project-s-webpack-config) para mais detalhes.

## Verificando todos os comandos disponíveis

Alguns plugins CLI irão injetar comandos adicionais no `vue-cli-service`. Por exemplo, `@vue/cli-plugin-eslint` injeta o comando `vue-cli-service lint`. Você pode ver todos os comandos injetados executando:

``` bash
npx vue-cli-service help
```

Você também pode aprender sobre as opções disponíveis de cada comando com:

``` bash
npx vue-cli-service help [command]
```

## Cache e Paralelização

- `cache-loader` é habilitado para compilações Vue/Babel/TypeScript por padrão. Os arquivos são armazenados em cache dentro de `node_modules/.cache` - se estiver executando em problemas de compilação, sempre tente excluir o diretório de cache primeiro.

- `thread-loader` será habilitado para a transpilação Babel/TypeScript quando a máquina tiver mais de 1 núcleo de CPU.

## Git Hooks

Quando instalado, o `@vue/cli-service` também instala o [yorkie](https://github.com/yyx990803/yorkie), o que permite que você especifique facilmente os ganchos do Git usando o campo` gitHooks` no seu `package.json`:

``` json
{
  "gitHooks": {
    "pre-commit": "lint-staged"
  }
}
```

::: warning Atenção
`yorkie` é um fork de [`husky`](https://github.com/typicode/husky) e não é compatível com o último.
:::

## Configuração sem Ejetar

Projetos criados via `vue create` estão prontos para serem executados sem a necessidade de configuração adicional. Os plugins são projetados para funcionar uns com os outros, portanto, na maioria dos casos, tudo o que você precisa fazer é escolher os recursos desejados durante os prompts interativos.

No entanto, também entendemos que é impossível atender a todas as necessidades possíveis, e a necessidade de um projeto também pode mudar com o tempo. Os projetos criados pela Vue CLI permitem que você configure quase todos os aspectos do ferramental sem precisar ejetar. Confira a [Referência de configuração](../config/) para mais detalhes.