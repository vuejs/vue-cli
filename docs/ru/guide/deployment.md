# Публикация

## Общие рекомендации

Если вы используете Vue CLI с бэкенд-фреймворком, который обрабатывает статические ресурсы, как часть своей публикации, всё что вам нужно сделать, это убедиться, что Vue CLI генерирует файлы сборки в правильном месте, а затем следуйте инструкциям по публикации вашего бэкенд-фреймворка.

Если вы разрабатываете фронтенд вашего приложения отдельно от бэкенда — т.е. ваш бэкенд предоставляет только API с которым вы работаете, то по сути ваш фронтенд является чисто статическим приложением. Вы можете публиковать собранный контент в каталоге `dist` на любой статический файловый сервер, главное не забудьте установить правильный [publicPath](../config/#publicpath).

### Локальный предпросмотр

Каталог `dist` предназначен для обслуживания HTTP-сервером (если не задали `publicPath` относительным значением), поэтому не сработает если напрямую открыть `dist/index.html` через `file://` протокол. Самый простой способ предпросмотра вашей сборки для production локально — использовать статический файловый сервер Node.js, например [serve](https://github.com/zeit/serve):

```bash
npm install -g serve
# флаг -s означает запуск serve в режиме одностраничного приложения (SPA)
# который решает проблему маршрутизации, описанную ниже
serve -s dist
```

### Маршрутизация через `history.pushState`

Если вы используете Vue Router в режиме `history`, простой статический файловый сервер не подойдёт. Например, если вы использовали Vue Router для маршрута `/todos/42`, то сервер разработки уже был настроен для корректного ответа на запрос `localhost:3000/todos/42`, но простой статический сервер используемый с production-сборкой будет отвечать ошибкой 404.

Чтобы это исправить, необходимо настроить production сервер так, чтобы `index.html` возвращался для любых запросов, не соответствующих статическим файлам. В документации Vue Router есть [примеры конфигурации различных серверов](https://router.vuejs.org/ru/guide/essentials/history-mode.html).

### CORS

Если ваш статический фронтенд публикуется на домен, отличный от домена API бэкенда, то вам необходимо правильно сконфигурировать [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

### PWA

Если вы используете плагин PWA, ваше приложение необходимо публиковать по HTTPS адресу, чтобы [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) смог корректно зарегистрироваться.

## Руководства для платформ

### GitHub Pages

#### Публикация обновлений вручную

1. Установите корректное значение `publicPath` в `vue.config.js`.

    Если публикуете по адресу `https://<USERNAME>.github.io/` или на пользовательский домен, то можно опустить `publicPath`, так как оно по умолчанию `"/"`.

    Если вы публикуете по адресу `https://<USERNAME>.github.io/<REPO>/`, (т.е. ваш репозиторий находится по адресу `https://github.com/<USERNAME>/<REPO>`), установите `publicPath` в значение `"/<REPO>/"`. Например, если ваш репозиторий называется "my-project", то ваш `vue.config.js` будет выглядеть примерно так:

    ```js
    // файл vue.config.js должен быть расположен в корневом каталоге проекта

    module.exports = {
      publicPath: process.env.NODE_ENV === 'production'
        ? '/my-project/'
        : '/'
    }
    ```

2. Внутри вашего проекта создайте `deploy.sh` со следующим содержимым (при необходимости раскомментировав подсвеченные строки) и запустите его для публикации:

    ```bash{13,20,23}
    #!/usr/bin/env sh

    # остановить публикацию при ошибках
    set -e

    # сборка
    npm run build

    # переход в каталог сборки
    cd dist

    # если вы публикуете на пользовательский домен
    # echo 'www.example.com' > CNAME

    git init
    git add -A
    git commit -m 'deploy'

    # если вы публикуете по адресу https://<USERNAME>.github.io
    # git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

    # если вы публикуете по адресу https://<USERNAME>.github.io/<REPO>
    # git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

    cd -
    ```

#### Использование Travis CI для автоматических обновлений

1. Установите правильный `publicPath` в `vue.config.js`, как описано выше.

2. Установите клиент Travis CLI: `gem install travis && travis --login`

3. Сгенерируйте [токен доступа](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) на GitHub с правами доступа к репозиторию.

4. Разрешите доступ Travis к репозиторию: `travis env set GITHUB_TOKEN xxx` (`xxx` — это персональный токен доступа из шага 3.)

5. Создайте файл `.travis.yml` в корневом каталоге проекта.

    ```yaml
      language: node_js
      node_js:
        - "node"
      cache: npm
      script: npm run build
      deploy:
        provider: pages
        skip_cleanup: true
        github_token: $GITHUB_TOKEN
        local_dir: dist
        on:
          branch: master
    ```

6. Добавьте файл `.travis.yml` в репозиторий, чтобы запустить первую сборку.

### GitLab Pages

Как описано в [документации GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/), всё происходит с файлом `.gitlab-ci.yml`, расположенным в корневом каталоге проекта. Вы можете начать с этого рабочего примера:

```yaml
# .gitlab-ci.yml файл расположен в корневом каталоге репозитория

pages: # задание должно быть именованными страницами
  image: node:latest
  stage: deploy
  script:
    - npm ci
    - npm run build
    - mv public public-vue # GitLab Pages хук для каталога public
    - mv dist public # переименование каталога dist (результат команды npm run build)
    # опционально, можно активировать поддержку gzip с помощью следующей строки:
    - find public -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\)$' -exec gzip -f -k {} \;
  artifacts:
    paths:
      - public # путь к артефакту должен быть /public для GitLab Pages
  only:
    - master
```

Как правило, по адресу `https://yourUserName.gitlab.io/yourProjectName` будет располагаться статический веб-сайт, поэтому потребуется создать файл `vue.config.js` для указания [значения `BASE_URL`](../config/#publicpath), соответствующего имени проекта ([переменная окружения `CI_PROJECT_NAME`](https://docs.gitlab.com/ee/ci/variables/predefined_variables.html) содержит его):

```javascript
// файл vue.config.js расположен в корне вашего репозитория

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/' + process.env.CI_PROJECT_NAME + '/'
    : '/'
}
```

Изучите документацию по настройке [домена в GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_one.html#gitlab-pages-domain) для получения дополнительной информации об URL-адресе, где ваш веб-сайт будет размещён. Имейте ввиду, что можно также [использовать собственный домен](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_three.html#adding-your-custom-domain-to-gitlab-pages).

Закоммитьте оба файла `.gitlab-ci.yml` и `vue.config.js` перед push в ваш репозиторий. Будет запущен GitLab CI pipeline: при успешном выполнении, откройте `Settings > Pages` в вашем проекте, чтобы увидеть ссылку на свой сайт и нажмите на неё.

### Netlify

1. На сайте Netlify добавьте новый проект из GitHub со следующими настройками:

  - **Build Command:** `npm run build` или `yarn build`
  - **Publish directory:** `dist`

2. Нажмите кнопку публикации!

Также посмотрите [vue-cli-plugin-netlify-lambda](https://github.com/netlify/vue-cli-plugin-netlify-lambda).

#### Использование режима history во Vue Router

Для получения прямых хитов при использовании `режима history` во Vue Router, необходимо перенаправлять весь трафик в файл `/index.html`.

> Подробнее можно изучить в [документации Netlify по перенаправлениям](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps).

##### Рекомендуемый метод

Создать файл `netlify.toml` в корневом каталоге репозитория со следующим содержимым:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

##### Альтернативный метод

Создать файл `_redirects` в каталоге `/public` со следующим содержимым:

```
# Настройки Netlify для одностраничных приложений (SPA)
/*    /index.html   200
```

При использовании [@vue/cli-plugin-pwa](../core-plugins/pwa.md#vue-cli-plugin-pwa) убедитесь, что файл `_redirects` не кэшируется service worker.

Для этого добавьте в `vue.config.js` следующее:

```js
// файл vue.config.js должен быть расположен в корневом каталоге проекта

module.exports = {
  pwa: {
      workboxOptions: {
        exclude: [/_redirects/]
      }
    }
}
```

Подробнее об опциях [workboxOptions](../core-plugins/pwa.md#configuration) и [exclude](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest#InjectManifest).

### Render

[Render](https://render.com) предлагает [бесплатный хостинг статических сайтов](https://render.com/docs/static-sites) с полностью управляемым SSL, глобальным CDN и непрерывным автоматическим развёртыванием из GitHub.

1. Создайте новый Static Site в Render, и предоставьте доступ для GitHub-приложения Render в репозиторий.

2. При создании используйте следующие значения:

  - **Команда сборки:** `npm run build` или `yarn build`
  - **Каталог публикации:** `dist`

Всё! Приложение будет доступно по URL-адресу Render сразу, как только завершится сборка.

Для того, чтобы получать прямые хиты при использовании режима history во Vue Router, необходимо добавить следующее правило на вкладке `Redirects/Rewrites` вашего сайта.

  - **Источник:** `/*`
  - **Назначение:** `/index.html`
  - **Статус** `Rewrite`

Узнайте больше о настройке [перенаправлений, перезаписей](https://render.com/docs/redirects-rewrites) и [пользовательских доменах](https://render.com/docs/custom-domains) на Render.

### Amazon S3

Плагин [vue-cli-plugin-s3-deploy](https://github.com/multiplegeorges/vue-cli-plugin-s3-deploy).

### Firebase

Создайте новый проект Firebase в [консоли Firebase](https://console.firebase.google.com). Рекомендуем изучить [документацию](https://firebase.google.com/docs/web/setup) о том, как настроить проект.

Убедитесь, что у вас глобально установлены [firebase-tools](https://github.com/firebase/firebase-tools):

```bash
npm install -g firebase-tools
```

Из корня вашего проекта инициализируйте `firebase` с помощью команды:

```bash
firebase init
```

Firebase задаст несколько вопросов о том, как настроить проект.

- Выберите функции Firebase CLI, которые хотите настроить для проекта. Убедитесь, что выбрали `hosting`.
- Выберите проект Firebase по умолчанию для вашего проекта.
- Установите каталог `public` в значение `dist` (или куда генерируется итоговая сборка), который будет загружаться на Firebase Hosting.

```javascript
// firebase.json

{
  "hosting": {
    "public": "dist"
  }
}
```

- Выберите `yes` чтобы настроить проект как одностраничное приложение. Это создаст `index.html` и в вашем каталоге `dist` и добавит настройки в `hosting`.

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

Запустите `npm run build` для сборки вашего проекта.

Для публикации вашего проекта на Firebase Hosting выполните команду:

```bash
firebase deploy --only hosting
```

Если вы хотите использовать другие возможности Firebase CLI, которые вы используете в своём проекте для публикации, запустите `firebase deploy` без опции `--only`.

Теперь можно открыть проект по адресу `https://<YOUR-PROJECT-ID>.firebaseapp.com` или `https://<YOUR-PROJECT-ID>.web.app`.

Обратитесь к [документации Firebase](https://firebase.google.com/docs/hosting/deploying) для получения более подробной информации.

### Vercel

[Vercel](https://vercel.com/home) — облачная платформа, позволяющая разработчикам хостить Jamstack веб-сайты и веб-сервисы, которые публикуются мгновенно, автоматически масштабируются и не требуют никакого контроля, всё это с zero-конфигурацией. Они обеспечивают глобальный доступ, SSL-шифрование, сжатие ресурсов, инвалидацию кэша и многое другое.

#### Шаг 1: Публикация проекта Vue на Vercel

Для публикации проекта Vue с помощью [Vercel для интеграции с Git](https://vercel.com/docs/git-integrations), убедитесь, что он был выложен в Git-репозиторий.

Импортируйте проект в Vercel с помощью [Import Flow](https://vercel.com/import/git). Во время импорта будут запрошены все соответствующие [опции](https://vercel.com/docs/build-step#build-&-development-settings), предварительно сконфигурированные, но с возможностью изменения при необходимости.

После импорта проекта, все последующие push в ветку будут генерировать [публикации для предпросмотра](https://vercel.com/docs/platform/deployments#preview), а все изменения внесённые в [ветку Production](https://vercel.com/docs/git-integrations#production-branch) (обычно "master" или "main") будут приводить к [публикации Production](https://vercel.com/docs/platform/deployments#production).

После публикации вы получите URL-адрес для просмотра приложения вживую, например: https://vue-example-tawny.vercel.app/.

#### Шаг 2 (опционально): Использование пользовательского домена

При необходимости использовать пользовательский домен при публикации Vercel, можно **Добавить** или **Перенаправить** домен через [настройки домена аккаунта](https://vercel.com/dashboard/domains) Vercel.

Для добавления домена в проект, перейдите в раздел [Проект](https://vercel.com/docs/platform/projects) на панели Vercel. После выбора проекта перейдите на вкладку "Настройки", затем выберите пункт меню **Домены**. На странице **Домен** вашего проекта, укажите домен которые хотите использовать в проекте.

После добавления домена, будут предоставлены различные методы его настройки.

#### Публикация свежего проекта на Vue

Для публикации свежего проекта на Vue с настроенным Git-репозиторием, можно с помощью кнопки Deploy ниже:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/git?s=https%3A%2F%2Fgithub.com%2Fvercel%2Fvercel%2Ftree%2Fmaster%2Fexamples%2Fvue)

## Ресурсы:

- [Пример исходного кода](https://github.com/vercel/vercel/tree/master/examples/vue)
- [Официальное руководство Vercel](https://vercel.com/guides/deploying-vuejs-to-vercel)
- [Руководство по публикации Vercel](https://vercel.com/docs)
- [Документация по пользовательским доменам Vercel](https://vercel.com/docs/custom-domains)

### Stdlib

> TODO | Присылайте пулл-реквесты.

### Heroku

1. [Установите Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

2. Создайте файл `static.json`:

    ```json
    {
      "root": "dist",
      "clean_urls": true,
      "routes": {
        "/**": "index.html"
      }
    }
    ```

3. Добавьте файл `static.json` в git

    ```bash
    git add static.json
    git commit -m "add static configuration"
    ```

4. Запустите публикацию на Heroku

    ```bash
    heroku login
    heroku create
    heroku buildpacks:add heroku/nodejs
    heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static
    git push heroku master
    ```

Подробная информация: [Начало работы с SPA на Heroku](https://gist.github.com/hone/24b06869b4c1eca701f9)

### Surge

Публикация с помощью [Surge](http://surge.sh/) очень проста.

Сначала, вам потребуется собрать проект командой `npm run build`. И, если вы не установили утилиту Surge для командной строки, то вы можете сделать это командой:

```bash
npm install --global surge
```

Затем перейдите в каталог `dist/` вашего проекта, запустите `surge` и следуйте подсказкам на экране. Вас попросят указать электронную почту и пароль, если вы впервые используете Surge. Подтвердите каталог проекта, введите нужный домен и посмотрите как публикуется ваш проект, как примерно выглядит ниже.

```
            project: /Users/user/Documents/myawesomeproject/dist/
         domain: myawesomeproject.surge.sh
         upload: [====================] 100% eta: 0.0s (31 files, 494256 bytes)
            CDN: [====================] 100%
             IP: **.**.***.***

   Success! - Published to myawesomeproject.surge.sh
```

Убедитесь, что ваш проект успешно опубликован с помощью Surge открыв в браузере `myawesomeproject.surge.sh`! Дополнительные сведения о настройке, такие как конфигурация пользовательских доменов, можно найти на [странице справки Surge](https://surge.sh/help/).

### Bitbucket Cloud

1. Как описывается в [документации Bitbucket](https://confluence.atlassian.com/bitbucket/publishing-a-website-on-bitbucket-cloud-221449776.html) вам необходимо создать репозиторий названный в точности `<USERNAME>.bitbucket.io`.

2. Возможно публиковать в подкаталог, например, если требуется иметь несколько веб-сайтов. В этом случае укажите корректный `publicPath` в файле `vue.config.js`.

    Если публикуете по адресу `https://<USERNAME>.bitbucket.io/`, установку `publicPath` можно опустить, поскольку значение по умолчанию `"/"`.

    Если публикуете по адресу `https://<USERNAME>.bitbucket.io/<SUBFOLDER>/`, нужно задать `publicPath` в значение `"/<SUBFOLDER>/"`. В этом случае структура каталогов должна отражать структуру URL-адресов, например, репозиторий должен иметь каталог `/<SUBFOLDER>`.

3. В проекте создайте `deploy.sh` с указанным содержимым и запустите его для публикации:

    ```bash{13,20,23}
    #!/usr/bin/env sh

    # остановиться при ошибках
    set -e

    # сборка
    npm run build

    # переход в каталог итоговой сборки
    cd dist

    git init
    git add -A
    git commit -m 'deploy'

    git push -f git@bitbucket.org:<USERNAME>/<USERNAME>.bitbucket.io.git master

    cd -
    ```

### Docker (Nginx)

Опубликуйте ваше приложение, используя nginx внутри docker контейнера.

1. Установите [docker](https://www.docker.com/get-started)

2. Создайте файл `Dockerfile` в корневом каталоге проекта

    ```docker
    FROM node:latest as build-stage
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY ./ .
    RUN npm run build

    FROM nginx as production-stage
    RUN mkdir /app
    COPY --from=build-stage /app/dist /app
    COPY nginx.conf /etc/nginx/nginx.conf
    ```

3. Создайте файл `.dockerignore` в корневом каталоге проекта

    Настройка файла `.dockerignore` предотвращает копирование `node_modules` и любых промежуточных артефактов сборки в образ, что может вызывать проблемы при сборке.

    ```
    **/node_modules
    **/dist
    ```

4. Создайте файл `nginx.conf` в корневом каталоге проекта

    `Nginx` — это HTTP(s)-сервер, который будет работать в вашем контейнере docker. Он использует конфигурационный файл для определения того как предоставлять содержимое / какие порты прослушивать / и так далее. См. [документацию по конфигурации nginx](https://www.nginx.com/resources/wiki/start/topics/examples/full/) для ознакомления со всеми возможными примерами конфигураций.

    Ниже приведена простая конфигурация `nginx`, которая обслуживает ваш vue-проект на порту `80`. Корневой `index.html` служит для `page not found` / `404` ошибок, что позволяет использовать маршрутизации, основанной на `pushState()`.

    ```nginx
    user  nginx;
    worker_processes  1;
    error_log  /var/log/nginx/error.log warn;
    pid        /var/run/nginx.pid;
    events {
      worker_connections  1024;
    }
    http {
      include       /etc/nginx/mime.types;
      default_type  application/octet-stream;
      log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                        '$status $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" "$http_x_forwarded_for"';
      access_log  /var/log/nginx/access.log  main;
      sendfile        on;
      keepalive_timeout  65;
      server {
        listen       80;
        server_name  localhost;
        location / {
          root   /app;
          index  index.html;
          try_files $uri $uri/ /index.html;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
          root   /usr/share/nginx/html;
        }
      }
    }
    ```

5. Соберите образ docker

    ```bash
    docker build . -t my-app
    # Sending build context to Docker daemon  884.7kB
    # ...
    # Successfully built 4b00e5ee82ae
    # Successfully tagged my-app:latest
    ```

6. Запустите образ docker

    Эта сборка основана на официальном образе `nginx`, поэтому перенаправление логов уже настроено и само-демонтизация (self daemonizing) отключена. Для улучшения работы nginx в контейнере docker были установлены некоторые другие настройки по умолчанию. Подробнее см. в [репозитории nginx docker](https://hub.docker.com/_/nginx).

    ```bash
    docker run -d -p 8080:80 my-app
    curl localhost:8080
    # <!DOCTYPE html><html lang=en>...</html>
    ```
