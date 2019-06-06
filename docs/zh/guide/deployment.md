# 部署

## 通用指南

如果你用 Vue CLI 处理静态资源并和后端框架一起作为部署的一部分，那么你需要的仅仅是确保 Vue CLI 生成的构建文件在正确的位置，并遵循后端框架的发布方式即可。

如果你独立于后端部署前端应用——也就是说后端暴露一个前端可访问的 API，然后前端实际上是纯静态应用。那么你可以将 `dist` 目录里构建的内容部署到任何静态文件服务器中，但要确保正确的 [publicPath](../config/#publicpath)。

### 本地预览

`dist` 目录需要启动一个 HTTP 服务器来访问 (除非你已经将 `publicPath` 配置为了一个相对的值)，所以以 `file://` 协议直接打开 `dist/index.html` 是不会工作的。在本地预览生产环境构建最简单的方式就是使用一个 Node.js 静态文件服务器，例如 [serve](https://github.com/zeit/serve)：

``` bash
npm install -g serve
# -s 参数的意思是将其架设在 Single-Page Application 模式下
# 这个模式会处理即将提到的路由问题
serve -s dist
```

### 使用 `history.pushState` 的路由

如果你在 `history` 模式下使用 Vue Router，是无法搭配简单的静态文件服务器的。例如，如果你使用 Vue Router 为 `/todos/42/` 定义了一个路由，开发服务器已经配置了相应的 `localhost:3000/todos/42` 响应，但是一个为生产环境构建架设的简单的静态服务器会却会返回 404。

为了解决这个问题，你需要配置生产环境服务器，将任何没有匹配到静态文件的请求回退到 `index.html`。Vue Router 的文档提供了[常用服务器配置指引](https://router.vuejs.org/zh/guide/essentials/history-mode.html)。

### CORS

如果前端静态内容是部署在与后端 API 不同的域名上，你需要适当地配置 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)。

### PWA

如果你使用了 PWA 插件，那么应用必须架设在 HTTPS 上，这样 [Service Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API) 才能被正确注册。

<!-- @todo: translation -->

## Platform Guides

(暂未翻译，此部分英文文档处于开放贡献中)

### GitHub Pages
 
1. 在 `vue.config.js` 中设置正确的 `publicPath`。
    
   如果打算将项目部署到 `https://<USERNAME>.github.io/` 上 , `publicPath` 将默认被设为 `"/"`，你可以忽略这个参数。

   如果打算将项目部署到 `https://<USERNAME>.github.io/<REPO>/` 上, (换句话说 仓库地址为 `https://github.com/<USERNAME>/<REPO>`), 可将 `publicPath` 设为 `"/<REPO>/"` 。 举个例子， 如果仓库名字为 "my-project"，`vue.config.js` 的内容应如下所示:

    ``` js
    module.exports = {
      publicPath: process.env.NODE_ENV === 'production'
        ? '/my-project/'
        : '/'
    }
    ```

2. 在项目目录下， 用以下的代码创建 `deploy.sh`（可以适当地取消注释）并运行它以进行部署：

    ``` bash{13,20,23}
    #!/usr/bin/env sh

    # 当发生错误时中止脚本
    set -e

    # 构建
    npm run build

    # cd 到构建输出的目录下 
    cd dist

    # 部署到自定义域域名
    # echo 'www.example.com' > CNAME

    git init
    git add -A
    git commit -m 'deploy'

    # 部署到 https://<USERNAME>.github.io
    # git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

    # 部署到 https://<USERNAME>.github.io/<REPO>
    # git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

    cd -
    ```

    ::: tip
    您还可以在 CI 设置中配置上述脚本，以便在每次推送时启用自动部署。
    :::

### GitLab Pages

根据 [GitLab Pages 文档](https://docs.gitlab.com/ee/user/project/pages/)的描述，所有的配置都在根目录中的`.gitlab-ci.yml` 文件中。下面的范例是一个很好的入门:

```yaml
# .gitlab-ci.yml 文件应放在你仓库的根目录下 

pages: # 必须定义一个名为 pages 的 job
  image: node:latest
  stage: deploy
  script:
    - npm ci
    - npm run build
    - mv public public-vue # GitLab Pages 的钩子设置在 public 文件夹
    - mv dist public # 重命名 dist 文件夹 (npm run build 之后的输出位置)
  artifacts:
    paths:
      - public # artifact path 一定要在 /public , 这样 GitLab Pages 才能获取
  only:
    - master
```

通常, 你的静态页面将托管在 https://yourUserName.gitlab.io/yourProjectName 上, 所以你可以创建一个 initial `vue.config.js` 文件去 [更新 `BASE_URL`](https://github.com/vuejs/vue-cli/tree/dev/docs/config#baseurl) 要匹配的值 ：

```javascript
// vue.config.js 位于仓库的根目录下
// 确保用 GitLab 项目的名称替换了 `YourProjectName`

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/yourProjectName/'
    : '/'
}
```

请阅读在 [GitLab Pages domains](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_one.html#gitlab-pages-domain) 的文档来学习更多关于页面部署 URL 的信息。注意，你也可以[使用自定义域名](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_three.html#adding-your-custom-domain-to-gitlab-pages)。

在推送到仓库之前提交 `.gitlab-ci.yml` 和 `vue.config.js` 文件。GitLab CI 的管道将会被触发: 当成功时候, 到 `Settings > Pages` 查看关于网站的链接。

### Netlify

1. 在 Netlify 上，使用以下设置从 GitHub 创建新项目:

    - **构建命令:** `npm run build` or `yarn build`
    - **发布目录:** `dist`

2. 点击 deploy 按钮！

也可以查看 [vue-cli-plugin-netlify-lambda](https://github.com/netlify/vue-cli-plugin-netlify-lambda)。

### Amazon S3

见 [vue-cli-plugin-s3-deploy](https://github.com/multiplegeorges/vue-cli-plugin-s3-deploy)。

### Firebase

创建一个新的 Firebase 项目 [Firebase console](https://console.firebase.google.com)。 请参考[文档](https://firebase.google.com/docs/web/setup)。

确保已经全局安装了 [firebase-tools](https://github.com/firebase/firebase-tools) ：

```
npm install -g firebase-tools
```

在项目的根目录下, 用以下命令初始化 `firebase` ：

```
firebase init
```

Firebase 将会询问有关初始化项目的一些问题。

- 选择需要 Firebase CLI 的功能。 一定要选择 `hosting` 。
- 选择默认的 Firebase 项目。
- 将 `public` 目录设为 `dist` (或构建输出的位置) 这将会上传到 Firebase Hosting。 

```javascript
// firebase.json

{
  "hosting": {
    "public": "dist"
  }
}
```

- 选择 `yes` 设置项目为一个单页应用。 这将会创建一个 `index.html` 在 `dist` 文件夹并且配置 `hosting` 信息。

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

执行 `npm run build` 去构建项目。

在 `Firebase Hosting` 部署项目，执行以下命令 ：

```
firebase deploy --only hosting
```

如果需要在部署的项目中使用的其他 Firebase CLI 功能， 执行 `firebase deploy` 去掉 `--only` 参数。

现在可以到 `https://<YOUR-PROJECT-ID>.firebaseapp.com` 访问你的项目了。

请参考 [Firebase 文档](https://firebase.google.com/docs/hosting/deploying) 来获取更多细节。

### Now

1. 全局安装 Now CLI: `npm install -g now`

2. 添加 `now.json` 文件到项目根目录 ：

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

    您可以通过阅读来进一步了解自定义静态服务的信息 [Now's 文档](https://zeit.co/docs/deployment-types/static)。

3. 在 `package.json` 中添加部署脚本：

    ```json
    "deploy": "npm run build && now && now alias"
    ```

    如果想要将项目默认公开部署，部署脚本如下

    ```json
    "deploy": "npm run build && now --public && now alias"
    ```

    这将自动将站点的别名指向最新的部署。现在，只要运行 `npm run deploy` 就可以部署你的应用。

### Stdlib

> TODO | Open to contribution.

### Heroku

> TODO | Open to contribution.

### Surge

要使用 [Surge](http://surge.sh/) 进行部署，步骤非常简单。

首先，通过运行 `npm run build` 来构建项目。如果还没有安装 Surge 的命令行工具，可以通过运行命令来执行此操作：

```
npm install --global surge
```

然后 cd 进入项目的 `dist/` 文件夹，然后运行 `surge` 并按照屏幕提示操作 。如果是第一次使用 Surge，它会要求设置电子邮件和密码。确认项目文件夹以及输入首选域来查看正在部署的项目，如下所示。

```
            project: /Users/user/Documents/myawesomeproject/dist/
         domain: myawesomeproject.surge.sh
         upload: [====================] 100% eta: 0.0s (31 files, 494256 bytes)
            CDN: [====================] 100%
             IP: **.**.***.***

   Success! - Published to myawesomeproject.surge.sh
```

通过访问 `myawesomeproject.surge.sh` 来确保你的项目已经成功的用 Surge 发布，有关自定义域名等更多设置详细信息，可以到 [Surge's help page](https://surge.sh/help/) 查看。

### Bitbucket Cloud

1. 如 [Bitbucket 文档](https://confluence.atlassian.com/bitbucket/publishing-a-website-on-bitbucket-cloud-221449776.html) 创建一个命名为 `<USERNAME>.bitbucket.io` 的仓库。

2. 如果你想拥有多个网站， 想要发布到主仓库的子文件夹中。这种情况下就要在 `vue.config.js` 设置 `publicPath`。

    如果部署到 `https://<USERNAME>.bitbucket.io/`， `publicPath` 默认将被设为 `"/"`，你可以选择忽略它。

    如果要部署到 `https://<USERNAME>.bitbucket.io/<SUBFOLDER>/`，设置 `publicPath` 为 `"/<SUBFOLDER>/"`。在这种情况下，仓库的目录结构应该反映 url 结构，例如仓库应该有 `/<SUBFOLDER>` 目录。

3. 在项目中， `deploy.sh` 使用以下内容创建并运行它以进行部署：

    ``` bash{13,20,23}
    #!/usr/bin/env sh

    # 当发生错误时中止脚本
    set -e

    # 构建
    npm run build

    # cd 到构建输出的目录
    cd dist

    git init
    git add -A
    git commit -m 'deploy'

    git push -f git@bitbucket.org:<USERNAME>/<USERNAME>.bitbucket.io.git master

    cd -
    ```
