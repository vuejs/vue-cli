---
sidebarDepth: 0
---

# Visão Geral

<Bit/>

::: warning Atenção
Esta documentação é para a versão `@vue/cli` ** 3.x **. Para o antigo `vue-cli`, veja [aqui](https://github.com/vuejs/vue-cli/tree/v2#vue-cli--).
:::

O Vue CLI é um sistema completo para o rápido desenvolvimento do Vue.js, fornecendo:

- Estrutura de projeto interativo via `@vue/cli`.
- Configuração zero de prototipagem rápida via `@vue/cli` +` @vue/cli-service-global`.
- Uma dependência de tempo de execução (`@vue/cli-service`) que é:
   - Atualizável;
   - Construído em cima de webpack, com padrões sensatos;
   - Configurável via arquivo de configuração no projeto;
   - Extensível via plugins
- Uma rica coleção de plugins oficiais que integram as melhores ferramentas no ecossistema frontend.
- Uma interface gráfica completa para criar e gerenciar projetos Vue.js.

O Vue CLI pretende ser a linha de base de ferramentas padrão para o ecossistema Vue. Ele garante que as várias ferramentas de criação funcionem sem problemas, juntamente com padrões sensatos, para que você possa se concentrar em escrever seu aplicativo em vez de gastar dias com configurações. Ao mesmo tempo, ainda oferece a flexibilidade de ajustar a configuração de cada ferramenta sem a necessidade de ejetar.

## Componentes do Sistema

Existem várias partes móveis do Vue CLI - se você olhar o [código-fonte](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue), você verá que é um monorepo contendo um número de pacotes publicados separadamente.

### CLI

O CLI (`@ vue/cli`) é um pacote npm instalado globalmente e fornece o comando `vue` no seu terminal. Ele fornece a capacidade de organizar rapidamente um novo projeto através do `vue create`, ou prototipar novas idéias instantaneamente via `vue serve`. Você também pode gerenciar seus projetos usando uma interface gráfica do usuário via `vue ui`. Vamos percorrer o que ele pode fazer nas próximas seções do guia.

### CLI Service

O CLI Service (`@ vue/cli-service`) é uma dependência de desenvolvimento. É um pacote npm instalado localmente em todos os projetos criados pelo `@vue/cli`.

O CLI Service é construído em cima de [webpack](http://webpack.js.org/) e [webpack-dev-server](https://github.com/webpack/webpack-dev-server). Contém:

- O serviço principal que carrega outros plugins CLI;
- Uma configuração interna do webpack que é otimizada para a maioria dos aplicativos;
- O binário `vue-cli-service` dentro do projeto, que vem com os comandos básicos `serve`, `build` e `inspect`.

Se você estiver familiarizado com o [create-react-app](https://github.com/facebookincubator/create-react-app), o `@vue/cli-service` é praticamente o equivalente de `react-scripts`, embora o conjunto de recursos é diferente.

A seção sobre [CLI Service](./cli-service.md) cobre seu uso detalhado.

### CLI Plugins

Os Plug-ins CLI são pacotes npm que fornecem recursos opcionais para seus projetos Vue CLI, como transpilação Babel/TypeScript, integração ESLint, teste de unidade e teste de ponta a ponta. É fácil identificar um plugin Vue CLI como seus nomes começam com `@vue/cli-plugin-` (para plug-ins embutidos) ou `vue-cli-plugin-` (para plugins da comunidade).

Quando você executa o binário `vue-cli-service` dentro do seu projeto, ele automaticamente resolve e carrega todos os Plugins CLI listados no `package.json` do seu projeto.

Plugins podem ser incluídos como parte do processo de criação do projeto ou adicionados ao projeto posteriormente. Eles também podem ser agrupados em predefinições reutilizáveis. Discutiremos isso com mais profundidade na seção [Plugins e Presets](./ plugins-and-presets.md).
