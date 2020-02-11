# Instalação

::: warning Aviso sobre versões anteriores
O nome do pacote foi alterado de `vue-cli` para` @vue/cli`.
Se você tem o pacote anterior `vue-cli` (1.x ou 2.x) instalado globalmente, você precisa desinstalá-lo primeiro com `npm uninstall vue-cli -g` ou `yarn global remove vue-cli`.
:::

::: tip Versão Requerida do Node
O Vue CLI requer [Node.js](https://nodejs.org/) versão 8.9 ou superior (8.11.0+ recomendado). Você pode gerenciar várias versões do Node na mesma máquina com [nvm](https://github.com/creationix/nvm) ou [nvm-windows] (https://github.com/coreybutler/nvm-windows).
:::

Para instalar o novo pacote, use um desses comandos:

``` bash
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

Após a instalação, você terá acesso ao binário `vue` na sua linha de comando. Você pode verificar se está instalado corretamente simplesmente executando o `vue`, que deve apresentar uma mensagem de ajuda listando todos os comandos disponíveis.

Você pode verificar se tem a versão correta (3.x) com este comando:

```bash
vue --version
```
