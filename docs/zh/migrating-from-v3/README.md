---
sidebar: auto
---

# 从 v3 迁移

首先，全局安装最新版的 Vue CLI：

```sh
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

## 一次性更新所有插件

在已有的项目里运行：

```sh
vue upgrade
```

之后细节请参看各章节的重大更新。

------

## 一步步手动移植

如果你想要手动渐进式移植，这里有一些建议：

### 全局的 `@vue/cli`

#### [全新设计的](https://github.com/vuejs/vue-cli/pull/4090) `vue upgrade`

- 之前运行：`vue upgrade [patch | minor | major]`，这个命令只会安装最新版的插件。
- 现在运行：`vue upgrade [plugin-name]`。 除了升级插件外，该命令还可以运行移植工具来帮助你自动化移植过程。关于这个命令的更多选项，请执行 `vue upgrade --help`。
