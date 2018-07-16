module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue CLI 3',
      description: '🛠️ Standard Tooling for Vue.js Development'
    },
    '/zh_CN/': {
      lang: 'zh-CN',
      title: 'Vue CLI',
      description: '🛠️ 标准的 Vue.js 开发工具'
    }
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
            text: 'Plugin Dev Guide',
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
            '/guide/installation',
            {
              title: 'Basics',
              collapsable: false,
              children: [
                '/guide/prototyping',
                '/guide/creating-a-project',
                '/guide/plugins-and-presets',
                '/guide/cli-service'
              ]
            },
            {
              title: 'Development',
              collapsable: false,
              children: [
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
            {
              title: 'UI Development',
              collapsable: false,
              children: [
                '/dev-guide/ui-info.md',
                '/dev-guide/ui-api.md',
                '/dev-guide/ui-localization.md'
              ]
            }
          ]
        }
      },
      '/zh_CN/': {
        label: '简体中文',
        selectText: '选择语言',
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新',
        nav: [
          {
            text: '指南',
            link: '/zh_CN/guide/',
          },
          {
            text: '配置',
            link: '/zh_CN/config/'
          },
          {
            text: '开发指南',
            items: [
              { text: '插件开发指南', link: '/zh_CN/dev-guide/plugin-dev.md' },
              { text: 'UI 插件开发指南', link: '/zh_CN/dev-guide/ui-plugin-dev.md' },
              { text: 'UI 本地化', link: '/zh_CN/dev-guide/ui-localization.md' }
            ]
          },
          {
            text: '插件',
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
            text: '更新日志',
            link: 'https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md'
          }
        ],
        sidebar: {
          '/zh_CN/guide/': [
            '/zh_CN/guide/',
            {
              title: 'CLI',
              collapsable: false,
              children: [
                '/zh_CN/guide/creating-a-project',
                '/zh_CN/guide/prototyping',
                '/zh_CN/guide/plugins-and-presets'
              ]
            },
            {
              title: '开发',
              collapsable: false,
              children: [
                '/zh_CN/guide/cli-service',
                '/zh_CN/guide/browser-compatibility',
                '/zh_CN/guide/html-and-static-assets',
                '/zh_CN/guide/css',
                '/zh_CN/guide/webpack',
                '/zh_CN/guide/mode-and-env',
                '/zh_CN/guide/build-targets',
                '/zh_CN/guide/deployment'
              ]
            }
          ],
          '/zh_CN/dev-guide/': [
            '/zh_CN/dev-guide/plugin-dev.md',
            '/zh_CN/dev-guide/ui-plugin-dev.md',
            '/zh_CN/dev-guide/ui-localization.md'
          ]
        }
      }
    }
  }
}
