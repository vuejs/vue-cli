# Deployment

## Diretrizes Gerais

Se você estiver usando o Vue CLI juntamente com uma estrutura de backend que manipule ativos estáticos como parte de seu deploy, tudo o que você precisa fazer é garantir que a Vue CLI gere os arquivos criados no local correto e siga as instruções de implantação de sua estrutura de backend.

Se você estiver desenvolvendo seu aplicativo de front-end separadamente de seu back-end, ou seja, seu back-end expõe uma API para seu front-end para conversar, seu front-end é essencialmente um aplicativo puramente estático. Você pode implantar o conteúdo construído no diretório `dist` em qualquer servidor de arquivos estático, mas certifique-se de definir o [baseUrl](../config/#baseurl) correto .

### Visualizando localmente

O diretório `dist` é destinado a ser servido por um servidor HTTP (a menos que você tenha configurado `baseUrl` para ser um valor relativo), então não funcionará se você abrir `dist/index.html` diretamente sobre o protocolo `file://`. A maneira mais fácil de visualizar sua produção localmente é usando um servidor de arquivos estáticos do Node.js, por exemplo, [serve](https://github.com/zeit/serve):

``` bash
npm install -g serve
# o sinalizador -s significa servir no modo de aplicativo de página única
# que lida com o problema de roteamento abaixo
serve -s dist
```

### Roteamento com `history.pushState`

Se você estiver usando o Vue Router no modo `history`, um servidor de arquivos estático simples falhará. Por exemplo, se você usou o Vue Router com uma rota para `/todos/42`, o servidor dev foi configurado para responder a `localhost:3000/todos/42` corretamente, mas um servidor estático simples servindo uma compilação de produção responderá com um 404 em vez disso.

Para corrigir isso, você precisará configurar seu servidor de produção para retornar a `index.html` para quaisquer solicitações que não correspondam a um arquivo estático. A documentação do Vue Router fornece [instruções de configuração para configurações comuns de servidor](https://router.vuejs.org/guide/essentials/history-mode.html).

### CORS

Se sua interface estática for implantada em um domínio diferente da sua API de back-end, você precisará configurar corretamente o [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

### PWA

Se você estiver usando o plug-in do PWA, seu aplicativo deverá ser veiculado por HTTPS para que o [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) possa ser registrado corretamente.

## Guias de Plataforma

### GitHub Pages

1. Defina o `baseUrl` correto em `vue.config.js`.

     Se você está implementando em `https://<USERNAME>.github.io/`, você pode omitir `baseUrl` porque o padrão é `"/"`.

     Se você está implementando para `https://<NOME_DO_PRODUTO>.github.io/<REPO>/`, (ou seja, seu repositório está em `https://github.com/<NOME_DO_PRODUTO>/<REPO>`), configure `baseUrl` para `"/<REPO>/"`. Por exemplo, se o seu nome de repositório é "meu-projeto", seu `vue.config.js` deve ficar assim:

    ``` js
    module.exports = {
      baseUrl: process.env.NODE_ENV === 'production'
        ? '/my-project/'
        : '/'
    }
    ```

2. Dentro de seu projeto, crie `deploy.sh` com o seguinte conteúdo (com linhas destacadas descomentadas apropriadamente) e execute-o para implementar:

    ``` bash{13,20,23}
    #!/usr/bin/env sh

    # abort on errors
    set -e

    # build
    npm run docs:build

    # navigate into the build output directory
    cd docs/.vuepress/dist

    # if you are deploying to a custom domain
    # echo 'www.example.com' > CNAME

    git init
    git add -A
    git commit -m 'deploy'

    # if you are deploying to https://<USERNAME>.github.io
    # git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

    # if you are deploying to https://<USERNAME>.github.io/<REPO>
    # git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

    cd -
    ```

    ::: tip Dica
    Você também pode executar o script acima em sua configuração de IC para ativar a implantação automática em cada envio.
    :::

### GitLab Pages

Conforme descrito pela [documentação do GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/), tudo acontece com um arquivo `.gitlab-ci.yml` colocado na raiz do seu repositório. Este exemplo de trabalho irá ajudá-lo:

```yaml
# arquivo .gitlab-ci.yml a ser colocado na raiz do seu repositório

pages: # o trabalho deve ser nomeado pages
  image: node:latest
  stage: deploy
  script:
    - npm ci
    - npm run build
    - mv public public-vue # hooks do GitLab Pages na pasta public
    - mv dist public # renomear a pasta dist (resultado da compilação de execução npm)
  artifacts:
    paths:
      - public # O caminho do artefato deve ser /public para o GitLab Pages pegá-lo
  only:
    - master
```

Normalmente, seu website estático será hospedado em https://yourUserName.gitlab.io/yourProjectName, portanto, você também desejará criar um arquivo inicial `vue.config.js` para [atualizar o valor `BASE_URL`] (https://github.com/vuejs/vue-cli/tree/dev/docs/config#baseurl) para corresponder:

```javascript
// arquivo vue.config.js a ser colocado na raiz do seu repositório
// certifique-se de atualizar `yourProjectName` com o nome do seu projeto GitLab

module.exports = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? '/yourProjectName/'
    : '/'
}
```

Leia a Documentação em [domínios do GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_one.html#gitlab-pages-domain) para obter mais informações sobre o URL em que o site do seu projeto será hospedado. Esteja ciente de que você também pode [usar um domínio personalizado](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_three.html#adding-your-custom-domain-to-gitlab-pages).

Confirme os arquivos `.gitlab-ci.yml` e `vue.config.js` antes de enviar para o seu repositório. Um pipeline do GitLab CI será acionado: quando bem-sucedido, visite "Configurações > Páginas" do seu projeto para ver o link do seu site e clique nele.

### Netlify

1. No Netlify, configure um novo projeto no GitHub com as seguintes configurações:

     - **Comando de Build:** `npm run build` ou` yarn build`
     - **Diretório de publicação:** `dist`

2. Aperte o botão de deploy!

Também confira [vue-cli-plugin-netlify-lambda](https://github.com/netlify/vue-cli-plugin-netlify-lambda).

### Amazon S3

Veja [vue-cli-plugin-s3-deploy]s(https://github.com/multiplegeorges/vue-cli-plugin-s3-deploy).

### Firebase

Crie um novo projeto do Firebase no seu [Firebase console](https://console.firebase.google.com). Consulte esta [documentação](https://firebase.google.com/docs/web/setup) sobre como configurar seu projeto.

Certifique-se de ter instalado [firebase-tools](https://github.com/firebase/firebase-tools) globalmente:

```
npm install -g firebase-tools
```

A partir da raiz do seu projeto, inicialize o `firebase` usando o comando:

```
firebase init
```

O Firebase fará algumas perguntas sobre como configurar seu projeto.

- Escolha quais recursos do Firebase CLI você deseja configurar seu projeto. Certifique-se de selecionar `hosting`.
- Selecione o projeto padrão do Firebase para o seu projeto.
- Defina seu diretório `public` como `dist` (ou onde a saída de sua construção é), que será enviada para o Firebase Hosting.

```javascript
// firebase.json

{
  "hosting": {
    "public": "dist"
  }
}
```

- Selecione `yes` para configurar seu projeto como um aplicativo de página única. Isto irá criar um `index.html` e na sua pasta` dist` e configurar suas informações `hosting`.

```javascript
// firebase.json

{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Execute `npm run build` para construir seu projeto.

Para implantar seu projeto no Firebase Hosting, execute o comando:

```
firebase deploy --only hosting
```

Se você quiser que outros recursos CLI do Firebase que você usa em seu projeto sejam implantados, execute o `firebase deploy` sem a opção` --only`.

Agora você pode acessar seu projeto em
`https://<YOUR-PROJECT-ID>.firebaseapp.com`.

Consulte a [Documentação do Firebase](https://firebase.google.com/docs/hosting/deploying) para mais detalhes.

### Now

1. Instale o Now CLI globalmente: `npm install -g now`

2. Adicione um arquivo `now.json` à raiz do seu projeto:

    ```json
    {
      "name": "my-example-app",
      "type": "static",
      "static": {
        "public": "dist",
        "rewrites": [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      },
      "alias": "vue-example",
      "files": [
        "dist"
      ]
    }
    ```

    Você pode personalizar ainda mais o comportamento da veiculação estática consultando a [documentação do Now](https://zeit.co/docs/deployment-types/static).

3. Adicionando um script de deploy em `package.json`:

    ```json
    "deploy": "npm run build && now && now alias"
    ```

    Se você deseja implantar publicamente por padrão, você pode alterar o script de implantação para o seguinte:

    ```json
    "deploy": "npm run build && now --public && now alias"
    ```

    Isso apontará automaticamente o alias do seu site para a implantação mais recente. Agora, basta executar o `npm run deploy` para implantar seu aplicativo.

### Stdlib

> TODO | Aberto para contribuições.

### Heroku

> TODO | Aberto para contribuições.

### Surge

Para implantar com [Surge](http://surge.sh/), as etapas são muito diretas.

Primeiro você precisaria construir seu projeto executando `npm run build`. E se você não instalou a ferramenta de linha de comando do Surge, pode simplesmente fazê-lo executando o comando:

```
npm install --global surge
```

Então, vá para a pasta `dist/` do seu projeto e então execute `surge` e siga o prompt da tela. Ele pedirá que você configure o email e a senha se for a primeira vez que estiver usando o Surge. Confirme a pasta do projeto, digite seu domínio preferido e assista ao projeto que está sendo implantado, como abaixo.

```
            project: /Users/user/Documents/myawesomeproject/dist/
         domain: myawesomeproject.surge.sh
         upload: [====================] 100% eta: 0.0s (31 files, 494256 bytes)
            CDN: [====================] 100%
             IP: **.**.***.***

   Success! - Published to myawesomeproject.surge.sh
```

Verifique se o seu projeto foi publicado com sucesso pelo Surge, visitando `myawesomeproject.surge.sh`! Para mais detalhes de configuração, como domínios personalizados, você pode visitar a [página de ajuda do Surge](https://surge.sh/help/).

### Bitbucket Cloud

1. Conforme descrito na [documentação do Bitbucket](https://confluence.atlassian.com/bitbucket/publishing-a-website-on-bitbucket-cloud-221449776.html) você precisa criar um repositório com o nome exato <USERNAME>.bitbucket.io`.

2. É possível publicar em uma subpasta do repositório principal, por exemplo, se você quiser ter vários sites. Nesse caso, configure o `baseUrl` correto em` vue.config.js`.

     Se você está implementando em `https://<USERNAME>.bitbucket.io/`, você pode omitir `baseUrl` porque o padrão é` "/" `.

     Se você está implementando em `https://<NOME_DO_PRODUTO>.bitbucket.io/<SUBFOLDER>/`, defina `baseUrl` como `"/<SUBFOLDER>/"`. Neste caso, a estrutura de diretórios do repositório deve refletir a estrutura da URL, por exemplo, o repositório deve ter um diretório `/<SUBFOLDER>`.

3. Dentro de seu projeto, crie `deploy.sh` com o seguinte conteúdo e execute-o para implementar:

    ``` bash{13,20,23}
    #!/usr/bin/env sh

    # abort on errors
    set -e

    # build
    npm run build

    # navigate into the build output directory
    cd dist

    git init
    git add -A
    git commit -m 'deploy'

    git push -f git@bitbucket.org:<USERNAME>/<USERNAME>.bitbucket.io.git master

    cd -
    ```
