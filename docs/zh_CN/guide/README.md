---
sidebarDepth: 0
---

# 概览

Vue CLI 是一套完整的快速 Vue.js 开发系统，它包含：

- 基于 `@vue/cli` 的交互式项目模板。
- 基于 `@vue/cli` 和 `@vue/cli-service-global` 的零配置原型开发。
- 包含以下特性的运行时依赖（`@vue/cli-service`）：
  - 可升级的；
  - 基于 webpack 构建，同时带有合理的默认配置；
  - 通过项目中的配置文件进行调整和配置；
  - 通过插件进行扩展
- 丰富的的官方插件，而这些插件集成了前端生态中优秀的工具。

Vue CLI 旨在成为 Vue 生态的标准工具。 它可以确保各种构建工具的顺利运行以及带有合理的默认设置，因此您可以专注于编写应用程序，而不用将时间花费在配置上。 同时，您依然可以灵活地调整每个工具的配置，而不需要取出配置。

## 组件

Vue CLI 有几个部分 - 通过阅读 [源码](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue) 您可以发现它是一是 monorepo，里面包含一些单独发布的 npm 包。

### CLI

CLI（`@vue/cli`）是一个全局安装的 npm 包，并在终端中提供了 `vue` 命令。 它提供了通过 `vue create` 快速搭建一个新项目的功能，或者通过 `vue serve` 即时创建新想法的原型。 您还可以通过 `vue ui` 使用图形界面管理您的项目。 我们将在指南的接下来的几节中介绍它的功能。

### CLI 服务

CLI服务（`@ vue / cli-service`）是一个开发依赖项。 这是一个安装在由 `@vue/cli` 创建的每个项目中的 npm 包。

CLI 服务离不开 [webpack](http://webpack.js.org/) 和 [webpack-dev-server](https://github.com/webpack/webpack-dev-server)。它包含：

- 加载其它插件的核心服务；
- 为大多数应用优化的 webpack 配置；
- 项目中的 `vue-cli-service` 可执行文件，包含基本的 `serve`，`build` 和 `inspect` 命令。

如果您熟悉 [create-react-app](https://github.com/facebookincubator/create-react-app), `@vue/cli-service` 相当于 `react-scripts`，不过功能有所不同。

[CLI 服务](./cli-service.md) 一节会详细介绍它的用法。

### CLI 插件

CLI 插件是可为您的 Vue CLI 项目提供可选功能的 npm 软件包，如 Babel / TypeScript 编译，ESLint 集成，单元测试和 E2E 测试。您会发现 Vue CLI 插件的名字以 `@vue/cli-plugin-`（内置的插件）或 `vue-cli-plugin-`（社区的插件）开头。

在项目中运行 `vue-cli-service` 文件时，它会自动解析并加载项目 `package.json` 中列出的所有 CLI 插件。

插件可以作为项目创建过程的一部分，或者稍后添加到项目中。 它们也可以组成可重复使用的预设。 我们将在 [插件和预设](./plugins-and-presets.md) 部分更深入地讨论。
