# Deployment

## General Guidelines

If you are using Vue CLI along with a backend framework that handles static assets as part of its deployment, all you need to do is making sure Vue CLI generates the built files in the correct location, and then follow the deployment instruction of your backend framework.

If you are developing your frontend app separately from your backend - i.e. your backend exposes an API for your frontend to talk to, then your frontend is essentially a purely static app. You can deploy the built content in the `dist` directory to any static file server, but make sure to set the correct [baseUrl](../config/#baseurl).

### Previewing Locally

The `dist` directory is meant to be served by an HTTP server, so it will not work if you open `dist/index.html` directly over `file://` protocol. The easiest way to preview your production build locally is using a Node.js static file server, for example [serve](https://github.com/zeit/serve):

``` bash
npm install -g serve
# -s flag means serve it in Single-Page Application mode
# which deals with the routing problem below
serve -s dist
```

### Routing with `history.pushState`

If you are using Vue Router in `history` mode, a simple static file server will fail. For example, if you used Vue Router with a route for `/todos/42`, the dev server has been configured to respond to `localhost:3000/todos/42` properly, but a simple static server serving a production build will respond with a 404 instead.

To fix that, you will need to configure your production server to fallback to `index.html` for any requests that do not match a static file. The Vue Router docs provides [configuration instructions for common server setups](https://router.vuejs.org/guide/essentials/history-mode.html).

### CORS

If your static frontend is deployed to a different domain from your backend API, you will need to properly configure [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

### PWA

If you are using the PWA plugin, your app must be served over HTTPS so that [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) can be properly registered.

## Platform Guides

### GitHub Pages

Есть несколько способ публикации, описанных в [документации GitHub Pages](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/). Один из способов — публикация с использованием каталога `/docs` на ветке `master`.

Создайте файл `vue.config.js` чтобы установить опцию [`outputDir`](https://cli.vuejs.org/config/#outputdir) в значение `docs`. Обычно, ваш статический веб-сайт будет располагаться по адресу `https://yourUserName.github.io/yourProjectName`, поэтому вы также заходите обновить значение опции [`BASE_URL`](https://github.com/vuejs/vue-cli/tree/dev/docs/config#baseurl) для соответствия:

  ```javascript
  // файл vue.config.js должен располагаться в корне вашего репозитория
  // убедитесь что обновили `yourProjectName` именем вашего проекта GitHub

  module.exports = {
    baseUrl: process.env.NODE_ENV === 'production'
      ? '/yourProjectName/'
      : '/',
    outputDir: 'docs'
  }
  ```

Сгенерируйте сборку для production в каталоге `docs` командой `npm run build`. Закоммитьте файл `vue.config.js` и собранные файлы `docs/*`, затем сделайте push в ваш репозиторий на ветку `master`. В GitHub настройте для вашего репозитория [публикацию вашего сайта в GitHub Pages из каталога `docs` на ветке `master`](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch)

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

> TODO | Open to contribution.

Also checkout [vue-cli-plugin-netlify-lambda](https://github.com/netlify/vue-cli-plugin-netlify-lambda).

### Amazon S3

See [vue-cli-plugin-s3-deploy](https://github.com/multiplegeorges/vue-cli-plugin-s3-deploy).

### Azure

> TODO | Open to contribution.

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
    "public": "app"
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

Please refer on the [Firebase Documentation](https://firebase.google.com/docs/hosting/deploying) for more details.

### Now

> TODO | Open to contribution.

### Stdlib

> TODO | Open to contribution.

### Heroku

> TODO | Open to contribution.

### Surge

Публикация с помощью [Surge](http://surge.sh/) очень проста. 

Сначала, вам потребуется собрать проект командой `npm run build`. И, если вы не установили утилиту Surge для командной строки, то вы можете сделать это командой:

```
npm install --global surge
```

Затем перейдите в каталог `dist/` вашего проекта, запустите `surge` и следуйте подсказкам на экране. Вас попросят указать электронную почту и пароль, если вы впервые используете Surge. Подтвердите каталог проекта, введите нужный домер и посмотрите как публикуется ваш проект, как примерно выглядит ниже.

```   
            project: /Users/user/Documents/myawesomeproject/dist/
         domain: myawesomeproject.surge.sh
         upload: [====================] 100% eta: 0.0s (31 files, 494256 bytes)
            CDN: [====================] 100%
             IP: **.**.***.***

   Success! - Published to myawesomeproject.surge.sh
```

Убедитесь, что ваш проект успешно опубликован с помощью Surge открыв в браузере `myawesomeproject.surge.sh`! Дополнительные сведения о настройке, такие как конфигурация пользовательских доменов, можно найти на [странице справки Surge](https://surge.sh/help/).
