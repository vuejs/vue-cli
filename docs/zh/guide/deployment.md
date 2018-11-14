# 部署

## 通用指南

如果你用 Vue CLI 处理静态资源并和后端框架一起作为部署的一部分，那么你需要的仅仅是确保 Vue CLI 生成的构建文件在正确的位置，并遵循后端框架的发布方式即可。

如果你独立于后端部署前端应用——也就是说后端暴露一个前端可访问的 API，然后前端实际上是纯静态应用。那么你可以将 `dist` 目录里构建的内容部署到任何静态文件服务器中，但要确保正确的 [baseUrl](../config/#baseurl)。

### 本地预览

`dist` 目录需要启动一个 HTTP 服务器来访问 (除非你已经将 `baseUrl` 配置为了一个相对的值)，所以以 `file://` 协议直接打开 `dist/index.html` 是不会工作的。在本地预览生产环境构建最简单的方式就是使用一个 Node.js 静态文件服务器，例如 [serve](https://github.com/zeit/serve)：

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

## Platform Guides

(暂未翻译，此部分英文文档处于开放贡献中)

### GitHub Pages

1. Set correct `baseUrl` in `vue.config.js`.

    If you are deploying to `https://<USERNAME>.github.io/`, you can omit `baseUrl` as it defaults to `"/"`.

    If you are deploying to `https://<USERNAME>.github.io/<REPO>/`, (i.e. your repository is at `https://github.com/<USERNAME>/<REPO>`), set `baseUrl` to `"/<REPO>/"`. For example, if your repo name is "my-project", your `vue.config.js` should look like this:

    ``` js
    module.exports = {
      baseUrl: process.env.NODE_ENV === 'production'
        ? '/my-project/'
        : '/'
    }
    ```

2. Inside your project, create `deploy.sh` with the following content (with highlighted lines uncommented appropriately) and run it to deploy:

    ``` bash{13,20,23}
    #!/usr/bin/env sh

    # abort on errors
    set -e

    # build
    npm run build

    # navigate into the build output directory
    cd dist

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

    ::: tip
    You can also run the above script in your CI setup to enable automatic deployment on each push.
    :::

### GitLab Pages

As described by [GitLab Pages documentation](https://docs.gitlab.com/ee/user/project/pages/), everything happens with a `.gitlab-ci.yml` file placed in the root of your repository. This working example will get you started:

```yaml
# .gitlab-ci.yml file to be placed in the root of your repository

pages: # the job must be named pages
  image: node:latest
  stage: deploy
  script:
    - npm ci
    - npm run build
    - mv public public-vue # GitLab Pages hooks on the public folder
    - mv dist public # rename the dist folder (result of npm run build)
  artifacts:
    paths:
      - public # artifact path must be /public for GitLab Pages to pick it up
  only:
    - master
```

Typically, your static website will be hosted on https://yourUserName.gitlab.io/yourProjectName, so you will also want to create an initial `vue.config.js` file to [update the `BASE_URL`](https://github.com/vuejs/vue-cli/tree/dev/docs/config#baseurl) value to match:

```javascript
// vue.config.js file to be place in the root of your repository
// make sure you update `yourProjectName` with the name of your GitLab project

module.exports = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? '/yourProjectName/'
    : '/'
}
```

Please read through the docs on [GitLab Pages domains](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_one.html#gitlab-pages-domain) for more info about the URL where your project website will be hosted. Be aware you can also [use a custom domain](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_three.html#adding-your-custom-domain-to-gitlab-pages).

Commit both the `.gitlab-ci.yml` and `vue.config.js` files before pushing to your repository. A GitLab CI pipeline will be triggered: when successful, visit your project's `Settings > Pages` to see your website link, and click on it.

### Netlify

1. On Netlify, setup up a new project from GitHub with the following settings:

    - **Build Command:** `npm run build` or `yarn build`
    - **Publish directory:** `dist`

2. Hit the deploy button!

Also checkout [vue-cli-plugin-netlify-lambda](https://github.com/netlify/vue-cli-plugin-netlify-lambda).

### Amazon S3

See [vue-cli-plugin-s3-deploy](https://github.com/multiplegeorges/vue-cli-plugin-s3-deploy).

### Firebase

Create a new Firebase project on your [Firebase console](https://console.firebase.google.com). Please refer to this [documentation](https://firebase.google.com/docs/web/setup) on how to setup your project.

Make sure you have installed [firebase-tools](https://github.com/firebase/firebase-tools) globally:

```
npm install -g firebase-tools
```

From the root of your project, initialize `firebase` using the command:

```
firebase init
```

Firebase will ask some questions on how to setup your project.

- Choose which Firebase CLI features you want to setup your project. Make sure to select `hosting`.
- Select the default Firebase project for your project.
- Set your `public` directory to `dist` (or where your build's output is) which will be uploaded to Firebase Hosting.

```javascript
// firebase.json

{
  "hosting": {
    "public": "dist"
  }
}
```

- Select `yes` to configure your project as a single-page app. This will create an `index.html` and on your `dist` folder and configure your `hosting` information.

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

Run `npm run build` to build your project.

To deploy your project on Firebase Hosting, run the command:

```
firebase deploy --only hosting
```

If you want other Firebase CLI features you use on your project to be deployed, run `firebase deploy` without the `--only` option.

You can now access your project on `https://<YOUR-PROJECT-ID>.firebaseapp.com`.

Please refer to the [Firebase Documentation](https://firebase.google.com/docs/hosting/deploying) for more details.

### Now

1. Install the Now CLI globally: `npm install -g now`

2. Add a `now.json` file to your project root:

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

    You can further customize the static serving behavior by consulting [Now's documentation](https://zeit.co/docs/deployment-types/static).

3. Adding a deployment script in `package.json`:

    ```json
    "deploy": "npm run build && now && now alias"
    ```

    If you want to deploy publicly by default, you can change the deployment script to the following one:

    ```json
    "deploy": "npm run build && now --public && now alias"
    ```

    This will automatically point your site's alias to the latest deployment. Now, just run `npm run deploy` to deploy your app.

### Stdlib

> TODO | Open to contribution.

### Heroku

> TODO | Open to contribution.

### Surge

To deploy with [Surge](http://surge.sh/) the steps are very straightforward.

First you would need to build your project by running `npm run build`. And if you haven't installed Surge's command line tool, you can simply do so by running the command:

```
npm install --global surge
```

Then cd into the `dist/` folder of your project and then run `surge` and follow the screen prompt. It will ask you to set up email and password if it is the first time you are using Surge. Confirm the project folder and type in your preferred domain and watch your project being deployed such as below.

```
            project: /Users/user/Documents/myawesomeproject/dist/
         domain: myawesomeproject.surge.sh
         upload: [====================] 100% eta: 0.0s (31 files, 494256 bytes)
            CDN: [====================] 100%
             IP: **.**.***.***

   Success! - Published to myawesomeproject.surge.sh
```

Verify your project is successfully published by Surge by visiting `myawesomeproject.surge.sh`, vola! For more setup details such as custom domains, you can visit [Surge's help page](https://surge.sh/help/).

### Bitbucket Cloud

1. As described in the [Bitbucket documentation](https://confluence.atlassian.com/bitbucket/publishing-a-website-on-bitbucket-cloud-221449776.html) you need to create a repository named exactly `<USERNAME>.bitbucket.io`.

2. It is possible to publish to a subfolder of the main repository, for instance if you want to have multiple websites. In that case set correct `baseUrl` in `vue.config.js`.

    If you are deploying to `https://<USERNAME>.bitbucket.io/`, you can omit `baseUrl` as it defaults to `"/"`.

    If you are deploying to `https://<USERNAME>.bitbucket.io/<SUBFOLDER>/`, set `baseUrl` to `"/<SUBFOLDER>/"`. In this case the directory structure of the repository should reflect the url structure, for instance the repository should have a `/<SUBFOLDER>` directory.

3. Inside your project, create `deploy.sh` with the following content and run it to deploy:

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
