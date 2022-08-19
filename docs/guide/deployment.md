# Deployment

## General Guidelines

If you are using Vue CLI along with a backend framework that handles static assets as part of its deployment, all you need to do is make sure Vue CLI generates the built files in the correct location, and then follow the deployment instruction of your backend framework.

If you are developing your frontend app separately from your backend - i.e. your backend exposes an API for your frontend to talk to, then your frontend is essentially a purely static app. You can deploy the built content in the `dist` directory to any static file server, but make sure to set the correct [publicPath](../config/#publicpath).

### Previewing Locally

The `dist` directory is meant to be served by an HTTP server (unless you've configured `publicPath` to be a relative value), so it will not work if you open `dist/index.html` directly over `file://` protocol. The easiest way to preview your production build locally is using a Node.js static file server, for example [serve](https://github.com/zeit/serve):

```bash
npm install -g serve
# -s flag means serve it in Single-Page Application mode
# which deals with the routing problem below
serve -s dist
```

### Routing with `history.pushState`

If you are using Vue Router in `history` mode, a simple static file server will fail. For example, if you used Vue Router with a route for `/todos/42`, the dev server has been configured to respond to `localhost:3000/todos/42` properly, but a simple static server serving a production build will respond with a 404 instead.

To fix that, you will need to configure your production server to fallback to `index.html` for any requests that do not match a static file. The Vue Router docs provide [configuration instructions for common server setups](https://router.vuejs.org/guide/essentials/history-mode.html).

### CORS

If your static frontend is deployed to a different domain from your backend API, you will need to properly configure [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

### PWA

If you are using the PWA plugin, your app must be served over HTTPS so that [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) can be properly registered.

## Platform Guides

### GitHub Pages

#### Pushing updates manually

1. Set correct `publicPath` in `vue.config.js`.

    If you are deploying to `https://<USERNAME>.github.io/` or to a custom domain, you can omit `publicPath` as it defaults to `"/"`.

    If you are deploying to `https://<USERNAME>.github.io/<REPO>/`, (i.e. your repository is at `https://github.com/<USERNAME>/<REPO>`), set `publicPath` to `"/<REPO>/"`. For example, if your repo name is "my-project", your `vue.config.js` should look like this:

    ``` js
    // vue.config.js file to be placed in the root of your repository

    module.exports = {
      publicPath: process.env.NODE_ENV === 'production'
        ? '/my-project/'
        : '/'
    }
    ```

2. Inside your project, create `deploy.sh` with the following content (with highlighted lines uncommented appropriately) and run it to deploy:

    ```bash{13,20,23}
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
    # git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git main

    # if you are deploying to https://<USERNAME>.github.io/<REPO>
    # git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

    cd -
    ```

#### Using Travis CI for automatic updates

1. Set correct `publicPath` in `vue.config.js` as explained above.

2. Install the Travis CLI client: `gem install travis && travis --login`

3. Generate a GitHub [access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line)
   with repo permissions.

4. Grant the Travis job access to your repository: `travis env set GITHUB_TOKEN xxx`
   (`xxx` is the personal access token from step 3.)

5. Create a `.travis.yml` file in the root of your project.

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
       branch: main
    ```

6. Push the `.travis.yml` file to your repository to trigger the first build.

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
    # optionally, you can activate gzip support with the following line:
    - find public -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\)$' -exec gzip -f -k {} \;
  artifacts:
    paths:
      - public # artifact path must be /public for GitLab Pages to pick it up
  only:
    - master
```

Typically, your static website will be hosted on https://yourUserName.gitlab.io/yourProjectName, so you will also want to create an initial `vue.config.js` file to [update the `BASE_URL`](https://github.com/vuejs/vue-cli/tree/dev/docs/config#baseurl) value to match your project name (the [`CI_PROJECT_NAME` environment variable](https://docs.gitlab.com/ee/ci/variables/predefined_variables.html) contains this value):


```javascript
// vue.config.js file to be placed in the root of your repository

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/' + process.env.CI_PROJECT_NAME + '/'
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

#### Use history mode on Vue Router

In order to receive direct hits using `history mode` on Vue Router, you need to redirect all traffic to the `/index.html` file.

> More information on [Netlify redirects documentation](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps).

##### Recomended method

Create a file called `netlify.toml` in the root of your repository with the following content:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

##### Alternative method
Create a file called `_redirects` under `/public` with the following content:

```
# Netlify settings for single-page application
/*    /index.html   200
```

If you are using [@vue/cli-plugin-pwa](https://cli.vuejs.org/core-plugins/pwa.html#vue-cli-plugin-pwa) make sure to exclude the `_redirects` file from being cached by the service worker.
To do so, add the following to your `vue.config.js`:
```javascript
// vue.config.js file to be placed in the root of your repository

module.exports = {
  pwa: {
      workboxOptions: {
        exclude: [/_redirects/]
      }
    }
}
```
Checkout [workboxOptions](https://cli.vuejs.org/core-plugins/pwa.html#configuration) and [exclude](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest#InjectManifest) for more.

### Render

[Render](https://render.com) offers [free static site hosting](https://render.com/docs/static-sites) with fully managed SSL, a global CDN and continuous auto deploys from GitHub.

1. Create a new Static Site on Render, and give Render’s GitHub app permission to access your Vue repo.

2. Use the following values during creation:

    - **Build Command:** `npm run build` or `yarn build`
    - **Publish directory:** `dist`

That’s it! Your app will be live on your Render URL as soon as the build finishes.

In order to receive direct hits using history mode on Vue Router, you need to add the following rewrite rule in the `Redirects/Rewrites` tab for your site.

  - **Source:** `/*`
  - **Destination:** `/index.html`
  - **Status** `Rewrite`

Learn more about setting up [redirects, rewrites](https://render.com/docs/redirects-rewrites) and [custom domains](https://render.com/docs/custom-domains) on Render.

### Amazon S3

See [vue-cli-plugin-s3-deploy](https://github.com/multiplegeorges/vue-cli-plugin-s3-deploy).

### Firebase

Create a new Firebase project on your [Firebase console](https://console.firebase.google.com). Please refer to this [documentation](https://firebase.google.com/docs/web/setup) on how to setup your project.

Make sure you have installed [firebase-tools](https://github.com/firebase/firebase-tools) globally:

```bash
npm install -g firebase-tools
```

From the root of your project, initialize `firebase` using the command:

```bash
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

```bash
firebase deploy --only hosting
```

If you want other Firebase CLI features you use on your project to be deployed, run `firebase deploy` without the `--only` option.

You can now access your project on `https://<YOUR-PROJECT-ID>.firebaseapp.com` or `https://<YOUR-PROJECT-ID>.web.app`.

Please refer to the [Firebase Documentation](https://firebase.google.com/docs/hosting/deploying) for more details.

### Vercel

[Vercel](https://vercel.com/home) is a cloud platform that enables developers to host Jamstack websites and web services that deploy instantly, scale automatically, and requires no supervision, all with zero configuration. They provide a global edge network, SSL encryption, asset compression, cache invalidation, and more.

#### Step 1: Deploying your Vue project to Vercel

To deploy your Vue project with a [Vercel for Git Integration](https://vercel.com/docs/git-integrations), make sure it has been pushed to a Git repository.

Import the project into Vercel using the [Import Flow](https://vercel.com/import/git). During the import, you will find all relevant [options](https://vercel.com/docs/build-step#build-&-development-settings) preconfigured for you with the ability to change as needed.

After your project has been imported, all subsequent pushes to branches will generate [Preview Deployments](https://vercel.com/docs/platform/deployments#preview), and all changes made to the [Production Branch](https://vercel.com/docs/git-integrations#production-branch) (commonly "master" or "main") will result in a [Production Deployment](https://vercel.com/docs/platform/deployments#production).

Once deployed, you will get a URL to see your app live, such as the following: https://vue-example-tawny.vercel.app/.

#### Step 2 (optional): Using a Custom Domain

If you want to use a Custom Domain with your Vercel deployment, you can **Add** or **Transfer in** your domain via your Vercel [account Domain settings.](https://vercel.com/dashboard/domains)

To add your domain to your project, navigate to your [Project](https://vercel.com/docs/platform/projects) from the Vercel Dashboard. Once you have selected your project, click on the "Settings" tab, then select the **Domains** menu item. From your projects **Domain** page, enter the domain you wish to add to your project.

Once the domain has been added, you will be presented with different methods for configuring it.

#### Deploying a fresh Vue project

You can deploy a fresh Vue project, with a Git repository set up for you, with the following Deploy Button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/git?s=https%3A%2F%2Fgithub.com%2Fvercel%2Fvercel%2Ftree%2Fmaster%2Fexamples%2Fvue)

## References:

- [Example Source](https://github.com/vercel/vercel/tree/master/examples/vue)
- [Official Vercel Guide](https://vercel.com/guides/deploying-vuejs-to-vercel)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Vercel Custom Domain Docs](https://vercel.com/docs/custom-domains)

### Stdlib

> TODO | Open to contribution.

### Heroku

1. [Install Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

2. Create a `static.json` file:
```json
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
```

3. Add `static.json` file to git
```bash
git add static.json
git commit -m "add static configuration"
```

4. Deploy to Heroku
```bash
heroku login
heroku create
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static
git push heroku main
```

More info: [Getting started with SPAs on Heroku](https://gist.github.com/hone/24b06869b4c1eca701f9)

### Surge

To deploy with [Surge](http://surge.sh/) the steps are very straightforward.

First, you would need to build your project by running `npm run build`. And if you haven't installed Surge's command line tool, you can simply do so by running the command:

```bash
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

2. It is possible to publish to a subfolder of the main repository, for instance if you want to have multiple websites. In that case, set correct `publicPath` in `vue.config.js`.

    If you are deploying to `https://<USERNAME>.bitbucket.io/`, you can omit `publicPath` as it defaults to `"/"`.

    If you are deploying to `https://<USERNAME>.bitbucket.io/<SUBFOLDER>/`, set `publicPath` to `"/<SUBFOLDER>/"`. In this case, the directory structure of the repository should reflect the url structure, for instance, the repository should have a `/<SUBFOLDER>` directory.

3. Inside your project, create `deploy.sh` with the following content and run it to deploy:

    ```bash{13,20,23}
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

### Docker (Nginx)

Deploy your application using nginx inside of a docker container.

1. Install [docker](https://www.docker.com/get-started)

2. Create a `Dockerfile` file in the root of your project.

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

3. Create a `.dockerignore` file in the root of your project

    Setting up the `.dockerignore` file prevents `node_modules` and any intermediate build artifacts from being copied to the image which can cause issues during building.

    ```
    **/node_modules
    **/dist
    ```

4. Create a `nginx.conf` file in the root of your project

    `Nginx` is an HTTP(s) server that will run in your docker container. It uses a configuration file to determine how to serve content/which ports to listen on/etc. See the [nginx configuration documentation](https://www.nginx.com/resources/wiki/start/topics/examples/full/) for an example of all of the possible configuration options.

    The following is a simple `nginx` configuration that serves your vue project on port `80`. The root `index.html` is served for `page not found` / `404` errors which allows us to use `pushState()` based routing.

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

5. Build your docker image

    ```bash
    docker build . -t my-app
    # Sending build context to Docker daemon  884.7kB
    # ...
    # Successfully built 4b00e5ee82ae
    # Successfully tagged my-app:latest
    ```

6. Run your docker image

    This build is based on the official `nginx` image so log redirection has already been set up and self daemonizing has been turned off. Some other default settings have been setup to improve running nginx in a docker container. See the [nginx docker repo](https://hub.docker.com/_/nginx) for more info.

    ```bash
    docker run -d -p 8080:80 my-app
    curl localhost:8080
    # <!DOCTYPE html><html lang=en>...</html>
    ```
