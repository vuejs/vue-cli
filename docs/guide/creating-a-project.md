my-blog/
├── docs/
│   ├── .vuepress/
│   │   └── config.js
│   ├── README.md
│   └── posts/
│       └── hello-world.md
├── package.json
{
  "name": "my-blog",
  "version": "1.0.0",
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  },
  "devDependencies": {
    "vuepress": "^2.0.0"
  }
}
export default {
  lang: 'zh-CN',
  title: '我的博客',
  description: '用 VuePress 搭建的个人博客',
  themeConfig: {
    navbar: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/hello-world.html' }
    ],
    sidebar: [
      {
        text: '文章',
        children: ['/posts/hello-world.md']
      }
    ]
  }
}
# 欢迎来到我的博客

这里是用 VuePress 2 搭建的个人博客主页。  
你可以在侧边栏查看文章列表。
# Hello World

这是我的第一篇博客文章！  
欢迎留言交流~

name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run docs:build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/.vuepress/dist
          

```
