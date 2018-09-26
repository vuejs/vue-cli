# Prototipagem Instantânea

Você pode rapidamente prototipar com apenas um único arquivo `*.vue` com os comandos `vue serve` e`vue build`, mas eles requerem um addon global adicional para ser instalado primeiro:

```bash
npm install -g @vue/cli-service-global
```

A desvantagem do `vue serve` é que ele depende de dependências instaladas globalmente, que podem ser inconsistentes em máquinas diferentes. Portanto, isso é recomendado apenas para prototipagem rápida.

### vue serve

```
Uso: serve [opções] [entrada]

servir um arquivo .js ou .vue no modo de desenvolvimento com zero config


Opções:

   -o, --open  Abrir Navegador
   -c, --copy  Copiar URL local para a área de transferência
   -h, --help  exibe informações de uso
```

Tudo o que você precisa é de um arquivo `App.vue`:

```vue
<template>
   <h1> Olá! </ h1>
</template>
```

Então, no diretório com o arquivo `App.vue`, execute:

```bash
vue serve
```

`vue serve` usa a mesma configuração padrão (webpack, babel, postcss & eslint) como projetos criados pelo `vue create`. Ele automaticamente infere o arquivo de entrada no diretório atual - a entrada pode ser uma das seguintes: main.js, index.js, App.vue ou app.vue. Você também pode especificar explicitamente o arquivo de entrada:

```bash
vue serve MyComponent.vue
```

Se necessário, você também pode fornecer um `index.html`, `package.json`, instalar e usar dependências locais, ou até mesmo configurar o babel, postcss & eslint com arquivos de configuração correspondentes.

### vue build

```
Uso: build [opções] [entrada]

Construa um arquivo .js ou .vue no modo de produção com zero config


Opções:

   -t, --target <target>  Construir destino (app | lib | wc | wc-async, padrão: app)
   -n, --name <nome>      nome para lib ou componente web (padrão: nome do arquivo de entrada)
   -d, --dest <dir>       diretório de saída (padrão: dist)
   -h, --help             exibe informações de uso
```

Você também pode construir o arquivo de destino em um pacote de produção para implementação com o `vue build`:

```bash
vue build MyComponent.vue
```

O `vue build` também fornece a capacidade de construir o componente como uma biblioteca ou um componente da web. Veja [Build Targets](./build-targets.md) para mais detalhes.