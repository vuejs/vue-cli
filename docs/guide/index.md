---
sidebarDepth: 0
---

# Overview

Vue CLI is a full system for rapid Vue.js development, providing:

- Interactive project scaffolding via `@vue/cli`.
- A runtime dependency (`@vue/cli-service`) that is:
  - Upgradeable;
  - Built on top of webpack, with sensible defaults;
  - Configurable via in-project config file;
  - Extensible via plugins
- A rich collection of official plugins integrating the best tools in the frontend ecosystem.
- A full graphical user interface to create and manage Vue.js projects.

Vue CLI aims to be the standard tooling baseline for the Vue ecosystem. It ensures the various build tools work smoothly together with sensible defaults so you can focus on writing your app instead of spending days wrangling with configurations. At the same time, it still offers the flexibility to tweak the config of each tool without the need for ejecting.

## Components of the System

There are several moving parts of Vue CLI - if you look at the [source code](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue), you will find that it is a monorepo containing a number of separately published packages.

### CLI

The CLI (`@vue/cli`) is a globally installed npm package and provides the `vue` command in your terminal. It provides the ability to quickly scaffold a new project via `vue create`. You can also manage your projects using a graphical user interface via `vue ui`. We will walk through what it can do in the next few sections of the guide.

### CLI Service

The CLI Service (`@vue/cli-service`) is a development dependency. It's an npm package installed locally into every project created by `@vue/cli`.

The CLI Service is built on top of [webpack](http://webpack.js.org/) and [webpack-dev-server](https://github.com/webpack/webpack-dev-server). It contains:

- The core service that loads other CLI Plugins;
- An internal webpack config that is optimized for most apps;
- The `vue-cli-service` binary inside the project, which comes with the basic `serve`, `build` and `inspect` commands.

If you are familiar with [create-react-app](https://github.com/facebookincubator/create-react-app), `@vue/cli-service` is roughly the equivalent of `react-scripts`, although the feature set is different.

The section on [CLI Service](./cli-service.md) covers its detailed usage.

### CLI Plugins

CLI Plugins are npm packages that provide optional features to your Vue CLI projects, such as Babel/TypeScript transpilation, ESLint integration, unit testing, and end-to-end testing. It's easy to spot a Vue CLI plugin as their names start with either `@vue/cli-plugin-` (for built-in plugins) or `vue-cli-plugin-` (for community plugins).

When you run the `vue-cli-service` binary inside your project, it automatically resolves and loads all CLI Plugins listed in your project's `package.json`.

Plugins can be included as part of your project creation process or added into the project later. They can also be grouped into reusable presets. We will discuss these in more depth in the [Plugins and Presets](./plugins-and-presets.md) section.
