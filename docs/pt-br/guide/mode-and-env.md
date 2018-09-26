# Variáveis e modos de ambiente

Você pode especificar variáveis env colocando os seguintes arquivos na raiz do seu projeto:

``` bash
.env                # carregado em todos os casos
.env.local          # carregado em todos os casos, ignorado pelo git
.env.[mode]         # apenas carregado no modo especificado
.env.[mode].local   # apenas carregado no modo especificado, ignorado pelo git
```

Um arquivo env simplesmente contém pares chave=valor de variáveis de ambiente:

```
FOO=bar
VUE_APP_SECRET=secret
```

As variáveis carregadas ficarão disponíveis para todos os comandos, plugins e dependências do `vue-cli-service`.

::: tip Prioridades de carregamento de Env

Um arquivo env para um modo específico (por exemplo, `.env.production`) terá prioridade mais alta do que um genérico (por exemplo, `.env`).

Além disso, as variáveis de ambiente que já existem quando o Vue CLI é inicializado têm a prioridade mais alta e não serão sobrescritas pelos arquivos `.env`.
:::

::: warning NODE_ENV
Se você tem um `NODE_ENV` padrão em seu ambiente, você deve removê-lo ou definir explicitamente `NODE_ENV` ao executar comandos `vue-cli-service`.
:::

## Modos

**Modo** é um conceito importante nos projetos do Vue CLI. Por padrão, existem três modos em um projeto do Vue CLI:

- `development` é usado por `vue-cli-service serve`
- `production` é usado por `vue-cli-service build` and `vue-cli-service test:e2e`
- `test` é usado por `vue-cli-service test:unit`

Note que um modo é diferente de `NODE_ENV`, já que um modo pode conter múltiplas variáveis de ambiente. Dito isso, cada modo configura `NODE_ENV` para o mesmo valor por padrão - por exemplo,` NODE_ENV` será configurado para `"development"` no modo de desenvolvimento.

Você pode definir variáveis de ambiente apenas disponíveis para um certo modo, adicionando um sufixo ao arquivo `.env`. Por exemplo, se você criar um arquivo chamado `.env.development` em sua raiz do projeto, as variáveis declaradas nesse arquivo serão carregadas apenas no modo de desenvolvimento.

Você pode sobrescrever o modo padrão usado para um comando passando o sinalizador de opção `--mode`. Por exemplo, se você quiser usar variáveis de desenvolvimento no comando build, adicione isto aos seus scripts `package.json`:

```
"dev-build": "vue-cli-service build --mode development",
```

## Exemplo: Modo Staging

Assumindo que temos um aplicativo com o seguinte arquivo `.env`:

```
VUE_APP_TITLE=My App
```

And the following `.env.staging` file:

```
NODE_ENV=production
VUE_APP_TITLE=My App (staging)
```

- `vue-cli-service build` constrói um aplicativo de produção, carregando` .env`, `.env.production` e `.env.production.local` se eles estiverem presentes;

- `vue-cli-service build --mode staging` constrói um aplicativo de produção no modo staging, usando `.env`, `.env.staging` e `.env.staging.local`, se estiverem presentes.

Em ambos os casos, o aplicativo é construído como um aplicativo de produção por causa do `NODE_ENV`, mas na versão temporária,` process.env.VUE_APP_TITLE` é sobrescrito com um valor diferente.

## Usando variáveis de ambiente no código do lado do cliente

Somente variáveis que começam com `VUE_APP_` serão incorporadas estaticamente ao pacote do cliente com o `webpack.DefinePlugin`. Você pode acessá-los no código do seu aplicativo:

``` js
console.log(process.env.VUE_APP_SECRET)
```

Durante a construção, `process.env.VUE_APP_SECRET` será substituído pelo valor correspondente. No caso de `VUE_APP_SECRET=secret`, ele será substituído por `"secret"`.

Além das variáveis `VUE_APP_*`, existem também duas variáveis especiais que estarão sempre disponíveis no código do aplicativo:

- `NODE_ENV` - este será um dos `"development"`, `"production"` ou `"test" `dependendo do [modo](#modos) em que o aplicativo está sendo executado.

- `BASE_URL` - corresponde à opção `baseUrl` no `vue.config.js` e é o caminho base onde seu aplicativo é implementado.

Todas as variáveis de env resolvidas estarão disponíveis dentro de `public/index.html` como discutido em [HTML - Interpolation](./html-and-static-assets.md#Interpolação).

::: tip Dica
Você pode ter computado variáveis de ambiente no seu arquivo `vue.config.js`. Elas ainda precisam ser prefixados com `VUE_APP_`. Isso é útil para informações de versão `process.env.VUE_APP_VERSION = require('./package.json').version`
:::

## Variáveis Apenas Locais

Às vezes, você pode ter variáveis de ambiente que não devem ser confirmadas na base de código, especialmente se o seu projeto estiver hospedado em um repositório público. Nesse caso, você deve usar um arquivo `.env.local` em seu lugar. Arquivos env locais são ignorados em `.gitignore` por padrão.

`.local` também pode ser anexado a arquivos env de modo específico, por exemplo, `.env.development.local` será carregado durante o desenvolvimento e será ignorado pelo git.
