# vue-cli

A simple CLI for scaffolding Vue.js projects.

### Installation

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

When a new template is added to the `vuejs-templates` organization, you will be able to run `vue init <template-name> <project-name>` to use that template.

You can run `vue list` to see all available official templates.

### Custom Templates

It's unlikely to make everyone happy with the official templates. You can simply fork an official template and then use it via `vue-cli` with:

``` bash
vue init username/repo my-project
```

Where `username/repo` is the GitHub repo shorthand for your fork.

You can also create your own template from scratch:

- A template repo **must** have a `template` directory that holds the template files.

- All template files will be piped through Handlebars for simple templating - `vue-cli` will automatically infer the prompts based on `{{}}` interpolations found in the files.

- A template repo **may** have a `meta.json` file that provides a schema for the prompts. The schema will be passed to [prompt-for](https://github.com/segmentio/prompt-for#prompt-for) as options. See [example](https://github.com/vuejs-templates/webpack/blob/master/meta.json).
