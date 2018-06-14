module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue CLI',
      description: '🛠️ Standard Tooling for Vue.js Development'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Vue CLI',
      description: '🛠️ Vue.js 开发的标准工具'
    },
  },
  serviceWorker: true,
  theme: 'vue',
  themeConfig: {
    repo: 'vuejs/vue-cli',
    docsDir: 'docs',
    docsBranch: 'dev',
    editLinks: true,
    sidebarDepth: 3,
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        lastUpdated: 'Last Updated',
        editLinkText: 'Edit this page on GitHub',
        nav: [
          {
            text: 'Guide',
            link: '/guide/'
          },
          {
            text: 'Config Reference',
            link: '/config/'
          },
          {
            text: 'Dev Guide',
            items: [
              { text: 'Plugin Dev Guide', link: '/dev-guide/plugin-dev.md' },
              { text: 'UI Plugin Info', link: '/dev-guide/ui-info.md' },
              { text: 'UI Plugin API', link: '/dev-guide/ui-api.md' },
              { text: 'UI Localization', link: '/dev-guide/ui-localization.md' }
            ]
          },
          {
            text: 'Plugins',
            items: [
              { text: 'Babel', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel' },
              { text: 'Typescript', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript' },
              { text: 'ESLint', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint' },
              { text: 'PWA', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa' },
              { text: 'Jest', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest' },
              { text: 'Mocha', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-mocha' },
              { text: 'Cypress', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-cypress' },
              { text: 'Nightwatch', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch' }
            ]
          },
          {
            text: 'Changelog',
            link: 'https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md'
          }
        ],
        sidebar: {
          '/guide/': [
            '/guide/',
            {
              title: 'CLI',
              collapsable: false,
              children: [
                '/guide/creating-a-project',
                '/guide/prototyping',
                '/guide/plugins-and-presets'
              ]
            },
            {
              title: 'Development',
              collapsable: false,
              children: [
                '/guide/cli-service',
                '/guide/browser-compatibility',
                '/guide/html-and-static-assets',
                '/guide/css',
                '/guide/webpack',
                '/guide/mode-and-env',
                '/guide/build-targets',
                '/guide/deployment'
              ]
            }
          ],
          '/dev-guide/': [
            '/dev-guide/plugin-dev.md',
            '/dev-guide/ui-info.md',
            '/dev-guide/ui-api.md',
            '/dev-guide/ui-localization.md'
          ]
        }
      },
      '/zh/': {
        label: '简体中文',
        selectText: '选择语言',
        lastUpdated: '上次编辑时间',
        editLinkText: '在 GitHub 上编辑此页',
        nav: [
          {
            text: '指南',
            link: '/zh/guide/'
          },
          {
            text: '配置参考',
            link: '/zh/config/'
          },
          {
            text: '开发指南',
            items: [
              { text: 'Plugin Dev Guide', link: '/zh/dev-guide/plugin-dev.md' },
              { text: 'UI Plugin Info', link: '/zh/dev-guide/ui-info.md' },
              { text: 'UI Plugin API', link: '/zh/dev-guide/ui-api.md' },
              { text: 'UI Localization', link: '/zh/dev-guide/ui-localization.md' }
            ]
          },
          {
            text: '插件',
            items: [
              { text: 'Babel', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-babel/README.md' },
              { text: 'Typescript', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-typescript/README.md' },
              { text: 'ESLint', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-eslint/README.md' },
              { text: 'PWA', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-pwa/README.md' },
              { text: 'Jest', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-unit-jest/README.md' },
              { text: 'Mocha', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-unit-mocha/README.md' },
              { text: 'Cypress', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-e2e-cypress/README.md' },
              { text: 'Nightwatch', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-e2e-nightwatch/README.md' }
            ]
          },
          {
            text: '更新记录',
            link: 'https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md'
          }
        ],
        sidebar: {
          '/zh/guide/': [
            '/zh/guide/',
            {
              title: 'CLI',
              collapsable: false,
              children: [
                '/zh/guide/creating-a-project',
                '/zh/guide/prototyping',
                '/zh/guide/plugins-and-presets'
              ]
            },
            {
              title: '开发',
              collapsable: false,
              children: [
                '/zh/guide/cli-service',
                '/zh/guide/browser-compatibility',
                '/zh/guide/html-and-static-assets',
                '/zh/guide/css',
                '/zh/guide/webpack',
                '/zh/guide/mode-and-env',
                '/zh/guide/build-targets',
                '/zh/guide/deployment'
              ]
            }
          ],
          '/zh/dev-guide/': [
            '/zh/dev-guide/plugin-dev.md',
            '/zh/dev-guide/ui-info.md',
            '/zh/dev-guide/ui-api.md',
            '/zh/dev-guide/ui-localization.md'
          ]
        }
      }
    }
  }
}
