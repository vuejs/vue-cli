# Plugins e Presets

## Plugins

O Vue CLI usa uma arquitetura baseada em plugins. Se você inspecionar `package.json` de um projeto recém-criado, você encontrará dependências que começam com `@vue/cli-plugin-`. Plugins podem modificar a configuração interna do webpack e injetar comandos no `vue-cli-service`. A maioria dos recursos listados durante o processo de criação do projeto é implementada como plug-ins.

A arquitetura baseada em plugins torna o Vue CLI flexível e extensível. Se você está interessado em desenvolver um plugin, confira o [Plugin Development Guide](../dev-guide/plugin-dev.md).


::: tip Dica
Você pode instalar e gerenciar Plugins usando a GUI com o comando `vue ui`.
:::

### Instalando Plugins em um Projeto Existente

Cada plugin CLI vem com um generator (que cria arquivos) e um plugin de tempo de execução (que ajusta a configuração do webpack principal e injeta comandos). Quando você usa o `vue create` para criar um novo projeto, alguns plugins serão pré-instalados para você com base na sua seleção de recursos. Caso você queira instalar um plugin em um projeto já criado, você pode fazê-lo com o comando `vue add`:

``` bash
vue add @vue/eslint
```

::: tip Dica
O `vue add` é especificamente projetado para instalar e invocar plugins do Vue CLI. Não é um substituto para pacotes npm normais. Para pacotes npm normais, você ainda deve usar o gerenciador de pacotes de sua preferência.
:::

::: warning Atenção
Recomenda-se realizar o commit do estado atual do seu projeto antes de executar o `vue add`, já que o comando invocará o gerador de arquivos do plugin e possivelmente fará alterações em seus arquivos existentes.
:::

O comando resolve `@vue/eslint` para o nome completo do pacote` @vue/cli-plugin-eslint`, instala-o a partir do npm e invoca seu gerador.

``` bash
# estes são equivalentes ao uso anterior
vue add @vue/cli-plugin-eslint
```

Sem o prefixo `@vue`, o comando será resolvido para um pacote sem escopo. Por exemplo, para instalar o plugin de terceiros `vue-cli-plugin-apollo`:

``` bash
# instala e invoca o vue-cli-plugin-apollo
vue add apollo
```

Você também pode usar plugins de terceiros em um escopo específico. Por exemplo, se um plugin é chamado `@foo/vue-cli-plugin-bar`, você pode adicioná-lo com:

``` bash
vue add @foo/bar
```

Você pode passar as opções do generator para o plugin instalado (isso irá ignorar os prompts):

``` bash
vue add @vue/eslint --config airbnb --lintOn save
```

`vue-router` e` vuex` são casos especiais - eles não possuem seus próprios plugins, mas você pode adicioná-los mesmo assim:

``` bash
vue add router
vue add vuex
```

Se um plugin já estiver instalado, você pode pular a instalação e só invocar seu generator com o comando `vue invoke`. O comando usa os mesmos argumentos que o `vue add`.

::: tip Dica
Se por algum motivo seus plugins estiverem listados em um arquivo `package.json` diferente do localizado em seu projeto, você pode definir a opção `vuePlugins.resolveFrom` no projeto `package.json` com o caminho para a pasta que contém o outro arquivo `package.json`.

Por exemplo, se você tiver um arquivo `.config/package.json`:

```json
{
  "vuePlugins": {
    "resolveFrom": ".config"
  }
}
```
:::

### Plugin local do projeto

Se você precisa acessar a API do plugin em seu projeto e não quer criar um plugin completo para isso, você pode usar a opção `vuePlugins.service` no seu arquivo `package.json`:

```json
{
  "vuePlugins": {
    "service": ["my-commands.js"]
  }
}
```

Cada arquivo precisará exportar uma função usando a API do plug-in como o primeiro argumento. Para obter mais informações sobre a API do plug-in, confira o [Plugin Development Guide](../dev-guide/plugin-dev.md).

Você também pode adicionar arquivos que se comportarão como plugins UI com a opção `vuePlugins.ui`:

```json
{
  "vuePlugins": {
    "ui": ["my-ui.js"]
  }
}
```

Para mais informações, leia [UI Plugin API](../dev-guide/ui-api.md).

## Predefinições

Uma predefinição do Vue CLI é um objeto JSON que contém opções predefinidas e plugins para criar um novo projeto, de modo que o usuário não precise percorrer os prompts para selecioná-los.

As predefinições salvas durante o `vue create` são armazenadas em um arquivo de configuração no diretório inicial do usuário (`~/.vuerc`). Você pode editar diretamente este arquivo para ajustar/adicionar/excluir as predefinições salvas.

Aqui está um exemplo predefinido:

``` json
{
  "useConfigFiles": true,
  "router": true,
  "vuex": true,
  "cssPreprocessor": "sass",
  "plugins": {
    "@vue/cli-plugin-babel": {},
    "@vue/cli-plugin-eslint": {
      "config": "airbnb",
      "lintOn": ["save", "commit"]
    }
  }
}
```

Os dados predefinidos são usados pelos geradores de plugins para gerar arquivos de projeto correspondentes. Além dos campos acima, você também pode adicionar configurações adicionais para ferramentas integradas:

``` json
{
  "useConfigFiles": true,
  "plugins": {...},
  "configs": {
    "vue": {...},
    "postcss": {...},
    "eslintConfig": {...},
    "jest": {...}
  }
}
```

Estas configurações adicionais serão fundidas em `package.json` ou arquivos de configuração correspondentes, dependendo do valor de `useConfigFiles`. Por exemplo, com `"useConfigFiles": true`, o valor de `configs.vue` será fundido em `vue.config.js`.

### Versionamento de plugins predefinidos

Você pode especificar explicitamente as versões dos plugins que estão sendo usados:

``` json
{
  "plugins": {
    "@vue/cli-plugin-eslint": {
      "version": "^3.0.0",
      // ... outras opções para este plugin
    }
  }
}
```

Observe que isso não é necessário para plug-ins oficiais - quando omitido, a CLI usará automaticamente a versão mais recente disponível no registro. No entanto, **é recomendável fornecer um intervalo de versão explícito para todos os plug-ins de terceiros listados em uma predefinição**.

### Permitindo prompts de plug-in

Cada plugin pode injetar seus próprios prompts durante o processo de criação do projeto, no entanto, quando você estiver usando uma predefinição, esses prompts serão ignorados, pois a Vue CLI assume que todas as opções do plug-in já estão declaradas na predefinição.

Em alguns casos, você pode querer que a predefinição declare apenas os plug-ins desejados, deixando alguma flexibilidade, permitindo que o usuário passe pelos prompts injetados pelos plug-ins.

Para tais cenários, você pode especificar `"prompts": true` nas opções de um plugin para permitir que seus prompts sejam injetados:

``` json
{
  "plugins": {
    "@vue/cli-plugin-eslint": {
      // deixe os usuários escolherem sua própria configuração do ESLint
      "prompts": true
    }
  }
}
```

### Remote Presets

Você pode compartilhar uma predefinição com outros desenvolvedores publicando-a em um repositório git. O repositório pode conter os seguintes arquivos:

- `preset.json`: o arquivo principal contendo os dados pré-definidos (requeridos).
- `generator.js`: um [Generator](../dev-guide/plugin-dev.md#generator) que pode injetar ou modificar arquivos no projeto.
- `prompts.js`: a [arquivo de prompts](../dev-guide/plugin-dev.md#prompts-for-3rd-party-plugins) que pode coletar opções para o gerador.

Uma vez que o repositório é publicado, você pode usar a opção `--preset` para usar a predefinição remota ao criar um projeto:

``` bash
# use preset from GitHub repo
vue create --preset username/repo my-project
```

O GitLab e o BitBucket também são suportados. Certifique-se de usar a opção `--clone` se buscar de repos privados:

``` bash
vue create --preset gitlab:username/repo --clone my-project
vue create --preset bitbucket:username/repo --clone my-project
```

### Predefinição do sistema de arquivos local

Ao desenvolver uma predefinição remota, pode ser entediante ter que pressionar repetidamente a predefinição para um repo remoto para testá-la. Para simplificar o fluxo de trabalho, você pode trabalhar diretamente com as predefinições locais. O Vue CLI irá carregar as predefinições locais se o valor para a opção `--preset` for relativo ou absoluto, ou terminar com` .json`:

``` bash
# ./my-preset deve ser um diretório contendo preset.json
vue create --preset ./my-preset my-project

# ou use diretamente um arquivo json no cwd:
vue create --preset my-preset.json
```
