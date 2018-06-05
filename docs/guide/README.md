---
sidebarDepth: 1
---

# Overview

Vue CLI is a full system for rapid Vue.js development, providing:

- Interactive project scaffolding via `@vue/cli`.
- Zero config rapid prototyping via `@vue/cli` + `@vue/cli-service-global`.
- A runtime dependency (`@vue/cli-service`) that is:
  - Upgradeable;
  - Built on top of webpack, with sensible defaults;
  - Configurable via in-project config file;
  - Extensible via plugins
- A rich collection of official plugins integrating the best tools in the frontend ecosystem.

Vue CLI aims to be the standard tooling baseline for the Vue ecosystem. It ensures the various build tools work smoothly together with sensible defaults so you can focus on writing your app instead of spending days wrangling with configurations. At the same time, it still offers the flexibility to tweak the config of each tool without the need for ejecting.

## Understanding the Architecture

### CLI

The CLI is a installed globally npm package and provides the `vue` command in your terminal:

``` bash
npm install -g @vue/cli
vue create my-project
```

### CLI Service

`@vue/cli-service` is an npm package installed locally into every project created by `@vue/cli`. It contains the core service that loads other plugins, resolves the final webpack config, and provides the `vue-cli-service` binary to your project. If you are familiar with [create-react-app](https://github.com/facebookincubator/create-react-app), `@vue/cli-service` is essentially the equivalent of `react-scripts`, but more flexible.

See [CLI Service docs](./cli-service.md) for all available commands.

### CLI Plugins

Each project will likely contain a number of

### Presets

A preset

## Development Features

- webpack
- webpack-dev-server
- pre-processors
- git hooks

## Configuration without Ejecting

Projects created from vue create are ready to go out-of-the-box. The plugins are designed to work with one another so in most cases, all you need to do is pick the features you want during the interactive prompts.

However, we also understand that it's impossible to cater to every possible need, and the need of a project may also change over time. Projects created by Vue CLI allows you to configure almost every aspect of the tooling without ever needing to eject. Check out the [Config Reference](../config/) for more details.
