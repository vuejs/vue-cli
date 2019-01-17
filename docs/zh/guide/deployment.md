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

如果你在 `history` 模式下使用 Vue Router，是无法搭配简单的静态文件服务器的。例如，如果你使用 Vue Router 为 `/todos/42/` 定义了一个路由，开发服务器已经配置了相应的 `localhost:3000/todos/42` 相应，但是一个为生产环境构建架设的简单的静态服务器会却会返回 404。

为了解决这个问题，你需要配置生产环境服务器，将任何没有匹配到静态文件的请求回退到 `index.html`。Vue Router 的文档提供了[常用服务器配置指引](https://router.vuejs.org/zh/guide/essentials/history-mode.html)。

### CORS

如果前端静态内容是部署在与后端 API 不同的域名上，你需要适当地配置 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)。

### PWA

如果你使用了 PWA 插件，那么应用必须架设在 HTTPS 上，这样 [Service Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API) 才能被正确注册。

<!-- @todo: translation -->

## 部署到各平台

(暂未翻译，此部分英文文档处于开放贡献中)

### GitHub Pages

1. 在 `vue.config.js` 中设置好正确的 `publicPath` 。

    如果你的页面部署在 `https://<USERNAME>.github.io/` 下，你可以不设置 `baseUrl` ，此时 `publicPath` 的默认值为 `"/"` 。

    如果你的页面部署在 `https://<USERNAME>.github.io/<REPO>/`，（例如：你的仓库地址是 `https://github.com/<USERNAME>/<REPO>` ），那么把 `publicPath`
    设置为 `"/<REPO>/"` 。举个具体的例子，你有一个名字叫"my-project"的仓库，因此你项目中的 `vue.config.js` 可以像下面的代码：

    ``` js
    module.exports = {
      publicPath: process.env.NODE_ENV === 'production'
        ? '/my-project/'
        : '/'
    }
    ```

2. 在你的项目目录下创建一个 `deploy.sh` 脚本，内容如下（高亮部分可根据情况自行删减），运行脚本就可以部署到github：

    ``` bash{13,20,23}
    #!/usr/bin/env sh

    # 当发生错误时中止脚本
    set -e

    # 构建部署项目
    npm run build

    # 进入构建项目的输出文件夹dist
    cd dist

    # 部署到自己的域名下
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

    ::: 提示
    你也可以集成脚本设置来实现在每次push代码后自动发布
    :::

### GitLab Pages

根据 [GitLab Pages 文档](https://docs.gitlab.com/ee/user/project/pages/) 的描述,  所有的配置都依据你的仓库根目录下的 `.gitlab-ci.yml` 文件。下面是一个能正常运行的 `.gitlab-ci.yml` 范例，帮助你入门:

```yaml
# .gitlab-ci.yml 文件应该在仓库的根目录下

pages: # 必须给页面命名
  image: node:latest
  stage: deploy
  script:
    - npm ci
    - npm run build
    - mv public public-vue # 将 GitLab Pages 挂载在 public 文件夹
    - mv dist public # 重命名 npm run build 生成的 dist 文件夹为 public
  artifacts:
    paths:
      - public # 资源路径必须是 /public 来让 GitLab Pages 获取资源
  only:
    - master
```

一般来说，你的静态页面会部署在 https://yourUserName.gitlab.io/yourProjectName 下面，因此你也需要创建一个 `vue.config.js` 文件来 [更改 `BASE_URL`](https://github.com/vuejs/vue-cli/tree/dev/docs/config#baseurl) 的路径来匹配上面的URL：

```javascript
// vue.config.js 文件应该在你的仓库根目录下
// 确保已经用你 GitLab 项目的名字替换下面的 `yourProjectName` 

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/yourProjectName/'
    : '/'
}
```

想要了解跟多关于你的项目页面部署URL的信息可以阅读这份文档 [GitLab Pages domains](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_one.html#gitlab-pages-domain) 。 提示：你依旧可以部署在自己的域名下 [使用自己的域名](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_three.html#adding-your-custom-domain-to-gitlab-pages).

在更新仓库前配置好 `.gitlab-ci.yml` 和 `vue.config.js` 两个文件， GitLab 的一个集成管道会被触发：成功之后，查看你项目的 `Settings > Pages` 就可以看到页面的链接，点击即可查看。

### Netlify

1. 在 Netlify 上，用以下的命令，从 Github 新建一个项目：

    - **Build Command:** `npm run build` or `yarn build`
    - **Publish directory:** `dist`

2. 点击 `部署` 按钮!

还可以了解一下这个插件 [vue-cli-plugin-netlify-lambda](https://github.com/netlify/vue-cli-plugin-netlify-lambda).

### Amazon S3

查看插件 [vue-cli-plugin-s3-deploy](https://github.com/multiplegeorges/vue-cli-plugin-s3-deploy).

### Firebase

在你的 [Firebase 控制台](https://console.firebase.google.com) 上创建一个 Firebase 项目。请根据这份 [文档](https://firebase.google.com/docs/web/setup) 来配置你的项目。

确保你在全局安装了 [firebase-tools](https://github.com/firebase/firebase-tools) ：

```
npm install -g firebase-tools
```

在项目根目录下用下面命令初始化 `firebase` ：

```
firebase init
```

Firebase 会询问你需要怎么配置你的项目

- 选择你项目所需要的 Firebase 脚手架功能。请务必选择 `hosting` 选项。
- 选择默认 Firebase 项目作为你的项目。
- 设置你的 `public` 文件夹为 `dist` (或者是你项目的其他输出文件夹)，这将会上传到 Firebase 主机。

```javascript
// firebase.json

{
  "hosting": {
    "public": "dist"
  }
}
```

- 选择 `yes` 会为你配置为一个单页面应用。这将会创建一个 `index.html` 在 `dist` 文件夹中，然后配置 `hosting` 信息。

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

运行 `npm run build` 构建你的项目。

运行下面的命令来把你的项目部署到 Firebase 主机：

```
firebase deploy --only hosting
```

如果你想要在你部署的项目上使用 Firebase 脚手架的其他功能, 运行 `firebase deploy` 不要 `--only` 选项.

你可以在 `https://<YOUR-PROJECT-ID>.firebaseapp.com` 上访问你的项目。

更多详细资料请查阅 [Firebase 文档](https://firebase.google.com/docs/hosting/deploying) 。

### Now

1. 全局安装 Now CLI： `npm install -g now`

2. 在项目根目录创建一个 `now.json` 文件，如下：

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

    你可以在 [Now's 文档](https://zeit.co/docs/deployment-types/static) 查阅更多有关自定义静态服务功能的资料。

3. 在 `package.json` 中添加部署脚本：

    ```json
    "deploy": "npm run build && now && now alias"
    ```

    如果你希望默认公开部署，可以把部署脚本改为下面这个命令：

    ```json
    "deploy": "npm run build && now --public && now alias"
    ```

    这将会自动把你的页面别名指向到最新的部署。现在运行 `npm run deploy` 就可以部署你的应用了。

### Stdlib

> TODO | Open to contribution.

### Heroku

> TODO | Open to contribution.

### Surge

部署到 [Surge](http://surge.sh/) 的步骤非常简单。

首先你需要运行 `npm run build` 去构建你的项目。如果你还没安装 Surge 的命令行工具，你只需运行下面命令安装：

```
npm install --global surge
```

然后 cd 进入你项目的 `dist/` 文件夹，运行 `surge` 根据提示操作即可。 如果你是第一次使用 Surge，它会向你询问邮箱地址和密码。 确认你的项目文件是否正确和选择你的首选域名，最后你会看到你的项目正在部署，如下：

```
            project: /Users/user/Documents/myawesomeproject/dist/
         domain: myawesomeproject.surge.sh
         upload: [====================] 100% eta: 0.0s (31 files, 494256 bytes)
            CDN: [====================] 100%
             IP: **.**.***.***

   Success! - Published to myawesomeproject.surge.sh
```

访问 `myawesomeproject.surge.sh` 确认你的项目成功在 Sugre 发布！你可以查看 [Surge's help page](https://surge.sh/help/) 来获取更多有关使用自己域名发布项目的详情。

### Bitbucket Cloud

1. 根据 [Bitbucket 文档](https://confluence.atlassian.com/bitbucket/publishing-a-website-on-bitbucket-cloud-221449776.html) 的描述，你需要创建一个这样 `<USERNAME>.bitbucket.io` 命名的仓库。

2. 如果你要发布多个页面可以发布在主仓库下子文件夹中，这种情况需要正确的设置 `vue.config.js` 中的 `publicPath` 。

    如果你部署项目到 `https://<USERNAME>.bitbucket.io/`, 你可以不设置 `publicPath` 默认为 `"/"`。

    如果你部署项目到 `https://<USERNAME>.bitbucket.io/<SUBFOLDER>/`, 设置 `publicPath` 为 `"/<SUBFOLDER>/"`。这种情况下目录结构会反映到url的路由，打个比方，你的仓库应该有 `/<SUBFOLDER>` 这样一个文件夹。

3. 在你的项目目录下创建一个 `deploy.sh` 脚本，内容如下，运行脚本就可以部署到Bitbucket Cloud：

    ``` bash
    #!/usr/bin/env sh

    # 当发生错误时中止脚本
    set -e

    # 构建项目
    npm run build

    # 进入构建项目的输出文件夹dist
    cd dist

    git init
    git add -A
    git commit -m 'deploy'

    git push -f git@bitbucket.org:<USERNAME>/<USERNAME>.bitbucket.io.git master

    cd -
    ```
