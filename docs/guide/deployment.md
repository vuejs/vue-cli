# Deployment

## General Guidelines

If you are using Vue CLI along with a backend framework that handles static assets as part of its deployment, all you need to do is making sure Vue CLI generates the built files in the correct location, and then follow the deployment instruction of your backend framework.

If you are developing your frontend app separately from your backend - i.e. your backend exposes an API for your frontend to talk to, then your frontend is essentially a purely static app. You can deploy the built content in the `dist` directory to any static file server, but make sure to set the correct [baseUrl](../config/#baseurl).

### Previewing Locally

The `dist` directory is meant to be served by an HTTP server (unless you've configured `baseUrl` to be a relative value), so it will not work if you open `dist/index.html` directly over `file://` protocol. The easiest way to preview your production build locally is using a Node.js static file server, for example [serve](https://github.com/zeit/serve):

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

#### Creating Heroku app

To deploy with [Heroku](https://www.heroku.com/), first you would need to sign up for a Heroku account [here](https://www.heroku.com/) and [install Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).

Now, you can create a Heroku app:

```bash
heroku create <YOUR-PROJECT-NAME-HERE>
```

After this step you will get a URL to your project as `https://<YOUR-PROJECT-NAME-HERE>.herokuapp.com`. You can try to follow the link and check if a temporary Heroku landing page is working.

Now, in order to avoid having Heroku install unnecessary development dependencies when deploying later, you can set the `NODE_ENV` setting to `production`:

```bash
heroku config:set NODE_ENV=production --app <YOUR-PROJECT-NAME-HERE>
```

#### Creating a mini web-server with Express

Since Vue is a frontend library, the easiest way to host it and do things like serve up assets is to create a simple Express script that Heroku can use to start a mini-web server. If you need more information about Express, you can find it [here](https://expressjs.com/).

First, add Express to your project:

```bash
npm install express
```

Now, create a `server.js` file in your project root and add the following code to it:

```js
var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
app = express();
app.use(serveStatic(__dirname + '/dist'));
var port = process.env.PORT || 5555;
app.listen(port);
```

This will run a server at `localhost:5555` hosting your project `dist` folder. You can try to run it locally:

```bash
npm run build
node server.js
```

Check [http://localhost:5555](http://localhost:5555) and make sure your app loads. This is the actual site Heroku will serve up.

Now we need to create a `start` script in the `package.json` to start the node server, because Heroku will [automatically look for this script](https://devcenter.heroku.com/articles/deploying-nodejs#specifying-a-start-script) when looking for how to run a node.js app.

```js
{
  //package.json
  "name": "vue-rx-presentatopn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "test": "vue-cli-service test",
    "lint": "vue-cli-service lint",
    "start": "node server.js" <--- ADD THIS LINE HERE
  },
```

#### Adding Heroku Remote Repository

Heroku allows us to push to a remote repository. So, first you need to init a git repo in your project:

```bash
git init
```

And now add Heroku remote repository:

```bash
heroku git:remote --app <YOUR-PROJECT-NAME-HERE>
```

Remove the `dist` folder from `.gitignore`. You need this to always keep a pristine copy of what you’ve deployed to Heroku. After this you can commit your files and deploy to Heroku via pushing to `master`:

```bash
git add . && git commit -a -m "Adding project files"
git push heroku master
```

This will take your committed code, push it to Heroku’s remote repository, run `start` command in `package.json` which will serve up your freshly built `dist` directory.

After successful deployment, check your project at `https://<YOUR-PROJECT-NAME-HERE>.herokuapp.com`.

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
