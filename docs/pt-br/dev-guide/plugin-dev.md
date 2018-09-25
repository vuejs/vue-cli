---
sidebarDepth: 3
---

# Guia de desenvolvimento de plug-ins

## Conceitos Básicos

Existem duas partes principais do sistema:

- `@vue/cli`: instalado globalmente, expõe o comando `vue create <app>`;
- `@vue/cli-service`: instalado localmente, expõe os comandos `vue-cli-service`.

Ambos utilizam uma arquitetura baseada em plugins.

### Creator

[Creator][creator-class] é a classe criada ao invocar o `vue create <app>`. Responsável por solicitar preferências, invocar generators e instalar dependências.
### Service


[Service][service-class] é a classe criada ao invocar `vue-cli-service <command> [...args]`. Responsável pelo gerenciamento da configuração interna do webpack, e expõe comandos para servir e construir o projeto.

### Plugin CLI

Um plugin CLI é um pacote npm que pode adicionar recursos adicionais a um projeto `@vue/cli`. Ele deve sempre conter um [Plugin de serviço](#service-plugin) como sua exportação principal, e pode opcionalmente conter um [Generator](#generator) e um [Arquivo de Prompt](#prompts-for-3rd-party-plugins).

A estrutura de pastas típica de um plugin CLI se parece com o seguinte:

```
.
├── README.md
├── generator.js  # generator (opcional)
├── prompts.js    # arquivos de prompt (opcional)
├── index.js      # plugin de serviço
└── package.json
```

### Service Plugin

Os plugins de serviço são carregados automaticamente quando uma instância de Serviço é criada - ou seja, toda vez que o comando `vue-cli-service` é chamado dentro de um projeto.

Note que o conceito de um "plugin de serviço" que estamos discutindo aqui é mais restrito que o de um "plugin CLI", que é publicado como um pacote npm. O primeiro se refere apenas a um módulo que será carregado pelo `@vue/cli-service` quando for inicializado e geralmente é uma parte dele.

Além disso, os [comandos incorporados][@vue/cli-service] do `@ vue/cli-service] e [config modules][config] também são implementados como plugins de serviço.

Um plugin de serviço deve exportar uma função que recebe dois argumentos:

- Uma instância de [PluginAPI][plugin-api]

- Um objeto contendo opções locais do projeto especificadas em `vue.config.js`, ou no campo` "vue" `em` package.json`.

A API permite que plugins de serviço estendam/modifiquem a configuração interna do webpack para diferentes ambientes e injetem comandos adicionais no `vue-cli-service`. Exemplo:

``` js
module.exports = (api, projectOptions) => {
  api.chainWebpack(webpackConfig => {
    // modificar a configuração do webpack com a webpack-chain
  })

  api.configureWebpack(webpackConfig => {
    // modificar as configurações do webpack
    // ou retornar o objeto a ser mesclado com o webpack-merge
  })

  api.registerCommand('test', args => {
    // registrar o comando `vue-cli-service test`
  })
}
```

#### Especificando o modo para comandos

> Nota: o modo como os modos de configuração dos plugins foram alterados no beta.10.

Se um comando plugin-register precisar ser executado em um modo padrão específico,
o plugin precisa expô-lo via `module.exports.defaultModes` no formulário
de `{[commandName]: mode}`:

``` js
module.exports = api => {
  api.registerCommand('build', () => {
    // ...
  })
}

module.exports.defaultModes = {
  build: 'production'
}
```

Isso ocorre porque o modo esperado do comando precisa ser conhecido antes de carregar as variáveis de ambiente, o que, por sua vez, precisa acontecer antes de carregar as opções do usuário/aplicar os plug-ins.

#### Decidindo o Webpack Config nos Plugins

Um plugin pode recuperar a configuração resolvida do webpack chamando o `api.resolveWebpackConfig()`. Cada chamada gera uma configuração nova do webpack que pode ser mutada conforme necessário:

``` js
module.exports = api => {
  api.registerCommand('my-build', args => {
    const configA = api.resolveWebpackConfig()
    const configB = api.resolveWebpackConfig()

    // mude o configA e o configB para finalidades diferentes...
  })
}

// Certifique-se de especificar o modo padrão para as variáveis de env corretas
module.exports.defaultModes = {
  'my-build': 'production'
}
```

Alternativamente, um plugin também pode obter uma nova [configuração de cadeia](https://github.com/mozilla-neutrino/webpack-chain) chamando `api.resolveChainableWebpackConfig()`:

``` js
api.registerCommand('my-build', args => {
  const configA = api.resolveChainableWebpackConfig()
  const configB = api.resolveChainableWebpackConfig()

  // modifique configA e configB em cadeia para diferentes propósitos...

  const finalConfigA = configA.toConfig()
  const finalConfigB = configB.toConfig()
})
```

#### Opções personalizadas para plugins de terceiros

As exportações do `vue.config.js` serão [validadas em um esquema](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/options.js#L3) para evitar erros de digitação e valores incorretos de configuração. No entanto, um plugin de terceiros ainda pode permitir que o usuário configure seu comportamento através do campo `pluginOptions`. Por exemplo, com o seguinte `vue.config.js`:

``` js
module.exports = {
  pluginOptions: {
    foo: { /* ... */ }
  }
}
```

O plugin de terceiros pode ler `projectOptions.pluginOptions.foo` para determinar configurações condicionais.

### Generator

O plugin CLI publicado como um pacote pode conter um arquivo `generator.js` ou `generator/index.js`. O generator dentro de um plugin será invocado em dois cenários possíveis:

- Durante a criação inicial de um projeto, se o plug-in da CLI estiver instalado como parte da predefinição de criação do projeto.

- Quando o plugin é instalado após a criação do projeto e invocado individualmente através do `vue invoke`.

O [GeneratorAPI][generator-api] permite que um generator injete dependências ou campos adicionais no `package.json` e adicione arquivos ao projeto.

Um Generator deve exportar uma função que recebe três argumentos:

1. Uma instância do `GeneratorAPI`;

2. As opções do gerador para este plugin. Essas opções são resolvidas durante a fase de prompt da criação do projeto ou carregadas a partir de uma predefinição salva em `~/.vuerc`. Por exemplo, se o `~/.vuerc` salvo se parece com isto:

    ``` json
    {
      "presets" : {
        "foo": {
          "plugins": {
            "@vue/cli-plugin-foo": { "option": "bar" }
          }
        }
      }
    }
    ```

    E se o usuário criar um projeto usando a predefinição `foo`, o gerador de` @vue/cli-plugin-foo` receberá `{option: 'bar'}` como seu segundo argumento.

    Para um plugin de terceiros, as opções serão resolvidas a partir dos prompts ou argumentos de linha de comando quando o usuário executar o `vue invoke` (consulte [Prompts para plug-ins de terceiros](#prompts-for-3rd-party-plugins)).

3. O preset inteiro (`presets.foo`) será passado como o terceiro argumento.

**Example:**

``` js
module.exports = (api, options, rootOptions) => {
  // modificar campos package.json
  api.extendPackage({
    scripts: {
      test: 'vue-cli-service test'
    }
  })

  // copie e renderize todos os arquivos em ./template com ejs
  api.render('./template')

  if (options.foo) {
    // gerar arquivos condicionalmente
  }
}
```

#### Templating do Generator

Quando você chama `api.render ('./template')`, o gerador irá renderizar os arquivos em `./Template` (resolvido em relação ao arquivo gerador) com [EJS](https://github.com/mde/ejs).

Além disso, você pode herdar e substituir partes de um arquivo de modelo existente (mesmo de outro pacote) usando o YAML front-matter:

``` ejs
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace: !!js/regexp /<script>[^]*?<\/script>/
---

<script>
export default {
  // Substituir script padrão
}
</script>
```

Também é possível fazer vários substituições, embora você precise incluir as strings de substituição nos blocos `<% # REPLACE %>` e `<% # END_REPLACE %>`:

``` ejs
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace:
  - !!js/regexp /Welcome to Your Vue\.js App/
  - !!js/regexp /<script>[^]*?<\/script>/
---

<%# REPLACE %>
Substituir mensagem de boas-vindas
<%# END_REPLACE %>

<%# REPLACE %>
<script>
export default {
  // Substituir script padrão
}
</script>
<%# END_REPLACE %>
```

#### Casos de borda de nome de arquivo

Se você deseja renderizar um arquivo de modelo que começa com um ponto (ou seja, `.env`), você terá que seguir uma convenção de nomenclatura específica, já que os arquivos pontuáveis são ignorados ao publicar seu plug-in no npm:
```
# templates dotfile tem que usar um sublinhado ao invés do ponto:

/generator/template/_env

# Ao chamar api.render ('./template'), isso será renderizado na pasta do projeto como:

.env
```
Consequentemente, isso significa que você também deve seguir uma convenção de nomenclatura especial se desejar renderizar o arquivo cujo nome realmente começa com um sublinhado:
```
# esses modelos têm que usar dois sublinhados em vez do ponto:

/generator/template/__variables.scss

# Ao chamar api.render ('./template'), isso será renderizado na pasta do projeto como:

_variables.scss
```


### Prompts

#### Prompts para Plug-ins internos

Somente plug-ins internos têm a capacidade de personalizar os prompts iniciais ao criar um novo projeto, e os módulos de prompt estão localizados [dentro do pacote `@ vue/cli`][prompt-modules].

Um módulo de prompt deve exportar uma função que recebe uma instância [PromptModuleAPI][prompt-api]. Os prompts são apresentados usando [Inquirer](https://github.com/SBoudrias/Inquirer.js) sob o capô:

``` js
module.exports = api => {
  // um objeto de recurso deve ser um objeto de escolha de um pesquisador válido
  api.injectFeature({
    name: 'Some great feature',
    value: 'my-feature'
  })

  // injectPrompt espera um objeto de prompt de consulta válido
  api.injectPrompt({
    name: 'someFlag',
    // certifique-se de que o seu prompt só apareça se o usuário tiver selecionado seu recurso
    when: answers => answers.features.include('my-feature'),
    message: 'Do you want to turn on flag foo?',
    type: 'confirm'
  })

  // quando todos os prompts estiverem prontos, injete seu plugin nas opções que
  // será repassado para os Geradores
  api.onPromptComplete((answers, options) => {
    if (answers.features.includes('my-feature')) {
      options.plugins['vue-cli-plugin-my-feature'] = {
        someFlag: answers.someFlag
      }
    }
  })
}
```

#### Prompts para Plug-ins de terceiros

Plugins de terceiros são tipicamente instalados manualmente depois que um projeto já é criado, e o usuário inicializará o plugin chamando o `vue invoke`. Se o plugin contiver um `prompts.js` em seu diretório raiz, ele será usado durante a invocação. O arquivo deve exportar um array de [Questions](https://github.com/SBoudrias/Inquirer.js#question) que será manipulada pelo Inquirer.js. O objeto de respostas resolvidas será passado para o gerador do plugin como opções.

Como alternativa, o usuário pode ignorar os prompts e inicializar diretamente o plug-in passando opções por meio da linha de comando, por exemplo:

``` bash
vue invoke my-plugin --mode awesome
```

## Distribuindo o Plugin

Para que um plugin CLI possa ser usado por outros desenvolvedores, ele deve ser publicado no npm seguindo a convenção de nomes `vue-cli-plugin- <name>`. Seguir a convenção de nomes permite que seu plugin seja:

- Detectável por `@ vue/cli-service`;
- Detectável por outros desenvolvedores através de pesquisa;
- Instalável via `vue add <name>` ou `vue invoke <name>`.

## Nota sobre o desenvolvimento de plugins básicos

::: Dica
Esta seção só se aplica se você estiver trabalhando em um plugin embutido dentro do próprio repositório `vuejs/vue-cli`.
:::

Um plugin com um gerador que injeta dependências adicionais além dos pacotes neste repositório (por exemplo, `chai` é injetado por `@vue/cli-plugin-unit-mocha/generator/index.js`) deve ter essas dependências listadas em seu próprio diretório. campo `devDependencies`. Isso garante que:

1. o pacote sempre existe na raiz deste repositório, node_modules, para que não tenhamos que reinstalá-lo em todos os testes.

2. `yarn.lock` permanece consistente para que o CI possa usá-lo melhor para inferir o comportamento do cache.

[creator-class]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/Creator.js
[service-class]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/Service.js
[generator-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/GeneratorAPI.js
[commands]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/commands
[config]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/config
[plugin-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-service/lib/PluginAPI.js
[prompt-modules]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/promptModules
[prompt-api]: https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli/lib/PromptModuleAPI.js
