# Публикация

## Общие рекомендации

Если вы используете Vue CLI с бэкенд-фреймворком, который обрабатывает статические ресурсы, как часть своей публикации, всё что вам нужно сделать, это убедиться, что Vue CLI генерирует файлы сборки в правильном месте, а затем следуйте инструкциям по публикации вашего бэкенд-фреймворка.

Если вы разрабатываете фронтенд вашего приложения отдельно от бэкенда — т.е. ваш бэкенд предоставляет только API с которым вы работаете, то по сути ваш фронтенд является чисто статическим приложением. Вы можете публиковать собранный контент в каталоге `dist` на любой статический файловый сервер, главное не забудьте установить правильный [publicPath](../config/#publicpath).

### Локальный предпросмотр

Каталог `dist` предназначен для обслуживания HTTP-сервером (если не задали `publicPath` относительным значением), поэтому не сработает если напрямую открыть `dist/index.html` через `file://` протокол. Самый простой способ предпросмотра вашей сборки для production локально — использовать статический файловый сервер Node.js, например [serve](https://github.com/zeit/serve):

``` bash
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

1. Установите корректное значение `publicPath` в `vue.config.js`.

    Если вы публикуете по адресу `https://<USERNAME>.github.io/`, вы можете опустить `publicPath`, так как оно по умолчанию `"/"`.

    Если вы публикуете по адресу `https://<USERNAME>.github.io/<REPO>/`, (т.е. ваш репозиторий находится по адресу `https://github.com/<USERNAME>/<REPO>`), установите `publicPath` в значение `"/<REPO>/"`. Например, если ваш репозиторий называется "my-project", то ваш `vue.config.js` будет выглядеть примерно так:

    ``` js
    module.exports = {
      publicPath: process.env.NODE_ENV === 'production'
        ? '/my-project/'
        : '/'
    }
    ```

2. Внутри вашего проекта создайте `deploy.sh` со следующим содержимым (при необходимости раскомментировав подсвеченные строки) и запустите его для публикации:

    ``` bash{13,20,23}
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

    ::: tip Совет
    Вы также можете запустить скрипт выше в вашей конфигурации CI чтобы включить автоматическую публикацию на каждый push в репозиторий.
    :::

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
  artifacts:
    paths:
      - public # путь к артефакту должен быть /public для GitLab Pages
  only:
    - master
```

Как правило, по адресу `https://yourUserName.gitlab.io/yourProjectName` будет располагаться статический веб-сайт, поэтому вы также захотите создать файл `vue.config.js` для указания [значения `BASE_URL`](../config/#publicpath), соответствующего ему:

```javascript
// файл vue.config.js расположен в корне вашего репозитория
// убедитесь, что обновили `yourProjectName` на имя вашего проекта GitLab

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/yourProjectName/'
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

Для получения прямых хитов при использовании `режима history` во Vue Router, необходимо создавть файл `_redirects` в каталоге `/public` со следующим содержимым:

```
# Настройки Netlify для одностраничных приложений (SPA)
/*    /index.html   200
```

Подробнее можно изучить в [документации Netlify по перенаправлениям](https://www.netlify.com/docs/redirects/#history-pushstate-and-single-page-apps).

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

Теперь можно открыть проект по адресу `https://<YOUR-PROJECT-ID>.firebaseapp.com`.

Обратитесь к [документации Firebase](https://firebase.google.com/docs/hosting/deploying) для получения более подробной информации.

### Now

1. Установите глобально Now CLI:

```bash
npm install -g now
```

2. Добавьте файл `now.json` в корневой каталог проекта:

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

    Можно детальнее настроить статическую публикацию, обратившись к [документации Now](https://zeit.co/docs/deployment-types/static).

3. Добавьте скрипт для публикации в `package.json`:

    ```json
    "deploy": "npm run build && now && now alias"
    ```

    Если вы хотите по умолчанию публиковать публично, то измените команду на следующую:

    ```json
    "deploy": "npm run build && now --public && now alias"
    ```

    Это автоматически установит псевдоним сайта на последнюю публикацию. Теперь просто запустите команду `npm run deploy` для публикации приложения.

### Stdlib

> TODO | Присылайте пулл-реквесты.

### Heroku

> TODO | Присылайте пулл-реквесты.

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

    ``` bash{13,20,23}
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
