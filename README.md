# vue-cli

A simple CLI for scaffolding Vue.js projects.

### Installation

Prerequisites: [Node.js](https://nodejs.org/en/) and [Git](https://git-scm.com/).

``` bash
$ npm install -g vue-cli
```

### Usage

``` bash
$ vue init webpack my-project
$ cd my-project
$ npm install
$ npm run dev
```

The above command pulls the template from [vuejs-templates/webpack](https://github.com/vuejs-templates/webpack), prompts for some information, and generates the project at `.my-project/`.

### Official Templates

The purpose of official Vue project templates are to provide opinionated, battery-included development tooling setups so that users can get started with actual app code as fast as possible. However, these templates are un-opinionated in terms of how you structure your app code and what libraries you use in addition to Vue.js.

All official project templates are repos in the [vuejs-templates organization](https://github.com/vuejs-templates). When a new template is added to the organization, you will be able to run `vue init <template-name> <project-name>` to use that template. You can also run `vue list` to see all available official templates.

Current available templates include:

- [browserify](https://github.com/vuejs-templates/browserify) - A full-featured Browserify + vueify setup with hot-reload, linting & unit testing.

- [browserify-simple](https://github.com/vuejs-templates/browserify-simple) - A simple Browserify + vueify setup for quick prototyping.

- [webpack](https://github.com/vuejs-templates/webpack) - A full-featured Webpack + vue-loader setup with hot reload, linting, testing & css extraction.

- [webpack-simple](https://github.com/vuejs-templates/webpack-simple) - A simple Webpack + vue-loader setup for quick prototyping.

### Custom Templates

It's unlikely to make everyone happy with the official templates. You can simply fork an official template and then use it via `vue-cli` with:

``` bash
vue init username/repo my-project
```

Where `username/repo` is the GitHub repo shorthand for your fork.

The shorthand repo notation is passed to [download-git-repo](https://github.com/flipxfx/download-git-repo) so you can also use things like `bitbucket:username/repo` for a Bitbucket repo and `username/repo#branch` for tags or branches.

If you would like to download from a private repository use the `--clone` flag and the cli will use `git clone` so your SHH keys are used.

You can also create your own template from scratch:

- A template repo **must** have a `template` directory that holds the template files.

- All template files will be piped through Handlebars for simple templating - `vue-cli` will automatically infer the prompts based on `{{}}` interpolations found in the files.

- A template repo **may** have a `meta.json` file that provides a schema for the prompts. The schema will be passed to [prompt-for](https://github.com/segmentio/prompt-for#prompt-for) as options. See [example](https://github.com/vuejs-templates/webpack/blob/master/meta.json).

While developing your template you can test via `vue-cli` with:

``` bash
vue init ~/fs/path/to-custom-template my-project
```
