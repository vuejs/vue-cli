module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue CLI 3',
      description: '🛠️ Standard Tooling for Vue.js Development'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Vue CLI 3',
      description: '🛠️ Vue.js 开发的标准工具'
    },
    '/ru/': {
      lang: 'ru',
      title: 'Vue CLI 3',
      description: '🛠️ Стандартный инструментарий для разработки на Vue.js'
    }
  },
  serviceWorker: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
  ],
  theme: 'vue',
  themeConfig: {
    repo: 'vuejs/vue-cli',
    docsDir: 'docs',
    docsBranch: 'docs',
    editLinks: true,
    sidebarDepth: 3,
    algolia: {
      indexName: 'cli_vuejs',
      apiKey: 'f6df220f7d246aff64a56300b7f19f21',
    },
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        lastUpdated: 'Last Updated',
        editLinkText: 'Edit this page on GitHub',
        serviceWorker: {
          updatePopup: {
            message: "New content is available.",
            buttonText: "Refresh"
          }
        },
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
              { text: 'TypeScript', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript' },
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
      '/zh/': {
        label: '简体中文',
        selectText: '选择语言',
        lastUpdated: '上次编辑时间',
        editLinkText: '在 GitHub 上编辑此页',
        serviceWorker: {
          updatePopup: {
            message: "发现新内容可用",
            buttonText: "刷新"
          }
        },
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
            text: '插件开发指南',
            items: [
              { text: '插件开发指南', link: '/zh/dev-guide/plugin-dev.md' },
              { text: 'UI 插件信息', link: '/zh/dev-guide/ui-info.md' },
              { text: 'UI 插件 API', link: '/zh/dev-guide/ui-api.md' },
              { text: 'UI 本地化', link: '/zh/dev-guide/ui-localization.md' }
            ]
          },
          {
            text: '插件',
            items: [
              { text: 'Babel', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-babel/README.md' },
              { text: 'TypeScript', link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-typescript/README.md' },
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
            '/zh/guide/installation',
            {
              title: '基础',
              collapsable: false,
              children: [
                '/zh/guide/prototyping',
                '/zh/guide/creating-a-project',
                '/zh/guide/plugins-and-presets',
                '/zh/guide/cli-service'
              ]
            },
            {
              title: '开发',
              collapsable: false,
              children: [
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
            {
              title: 'UI 开发',
              collapsable: false,
              children: [
                '/zh/dev-guide/ui-info.md',
                '/zh/dev-guide/ui-api.md',
                '/zh/dev-guide/ui-localization.md'
              ]
            }
          ]
        }
      },
      '/ru/': {
        label: 'Русский',
        selectText: 'Переводы',
        lastUpdated: 'Последнее обновление',
        editLinkText: 'Изменить эту страницу на GitHub',
        serviceWorker: {
          updatePopup: {
            message: 'Доступно обновление контента',
            buttonText: 'Обновить'
          }
        },
        nav: [
          {
            text: 'Руководство',
            link: '/ru/guide/'
          },
          {
            text: 'Конфигурация',
            link: '/ru/config/'
          },
          {
            text: 'Создание плагинов',
            items: [
              { text: 'Руководство по разработке', link: '/ru/dev-guide/plugin-dev.md' },
              { text: 'Информация о плагине в UI', link: '/ru/dev-guide/ui-info.md' },
              { text: 'API плагина в UI', link: '/ru/dev-guide/ui-api.md' },
              { text: 'Локализация в UI', link: '/ru/dev-guide/ui-localization.md' }
            ]
          },
          {
            text: 'Плагины',
            items: [
              { text: 'Babel', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel' },
              { text: 'TypeScript', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript' },
              { text: 'ESLint', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint' },
              { text: 'PWA', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa' },
              { text: 'Jest', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest' },
              { text: 'Mocha', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-mocha' },
              { text: 'Cypress', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-cypress' },
              { text: 'Nightwatch', link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch' }
            ]
          },
          {
            text: 'История изменений',
            link: 'https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md'
          }
        ],
        sidebar: {
          '/ru/guide/': [
            '/ru/guide/',
            '/ru/guide/installation',
            {
              title: 'Основы',
              collapsable: false,
              children: [
                '/ru/guide/prototyping',
                '/ru/guide/creating-a-project',
                '/ru/guide/plugins-and-presets',
                '/ru/guide/cli-service'
              ]
            },
            {
              title: 'Разработка',
              collapsable: false,
              children: [
                '/ru/guide/browser-compatibility',
                '/ru/guide/html-and-static-assets',
                '/ru/guide/css',
                '/ru/guide/webpack',
                '/ru/guide/mode-and-env',
                '/ru/guide/build-targets',
                '/ru/guide/deployment'
              ]
            }
          ],
          '/ru/dev-guide/': [
            '/ru/dev-guide/plugin-dev.md',
            {
              title: 'Разработка UI',
              collapsable: false,
              children: [
                '/ru/dev-guide/ui-info.md',
                '/ru/dev-guide/ui-api.md',
                '/ru/dev-guide/ui-localization.md'
              ]
            }
          ]
        }
      }
    }
  }
}
