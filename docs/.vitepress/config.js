const fs = require('fs')
const path = require('path')

const selfDestroyingSWVitePlugin = {
  name: 'generate-self-destroying-service-worker',
  buildStart() {
    this.emitFile({
      type: 'asset',
      fileName: 'service-worker.js',
      source: fs.readFileSync(path.join(__dirname, './self-destroying-service-worker.js'), 'utf-8')
    })
  }
}

module.exports = {
  vite: {
    // to destroy the service worker used by the previous vuepress build
    plugins: [selfDestroyingSWVitePlugin]
  },

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
    '/ru/': {
      lang: 'ru',
      title: 'Vue CLI',
      description: '🛠️ Стандартный инструментарий для разработки на Vue.js'
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }
    ],
    [
      'link',
      { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }
    ],
    [
      'link',
      {
        rel: 'mask-icon',
        href: '/icons/safari-pinned-tab.svg',
        color: '#3eaf7c'
      }
    ],
    [
      'meta',
      {
        name: 'msapplication-TileImage',
        content: '/icons/msapplication-icon-144x144.png'
      }
    ],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
  ],

  themeConfig: {
    repo: 'vuejs/vue-cli',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,

    algolia: {
      indexName: 'cli_vuejs',
      apiKey: 'f6df220f7d246aff64a56300b7f19f21'
    },

    carbonAds: {
      carbon: 'CEBDT27Y',
      placement: 'vuejsorg'
    },

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
            text: 'Plugins',
            items: [
              {
                text: 'Core Plugins',
                link: '/core-plugins/'
              },
              {
                text: 'Plugin Dev Guide',
                link: '/dev-guide/plugin-dev'
              },
              {
                text: 'Plugin API',
                link: '/dev-guide/plugin-api'
              },
              {
                text: 'Generator API',
                link: '/dev-guide/generator-api'
              },
              {
                text: 'UI Plugin Info',
                link: '/dev-guide/ui-info'
              },
              {
                text: 'UI Plugin API',
                link: '/dev-guide/ui-api'
              },
              {
                text: 'UI Localization',
                link: '/dev-guide/ui-localization'
              },
              {
                text: 'Discover More',
                link: 'https://awesomejs.dev/for/vue-cli/'
              }
            ]
          },
          {
            text: 'Migrate from Older Versions',
            items: [
              {
                text: 'From Vue CLI v3 to v4',
                link: '/migrations/migrate-from-v3'
              },
              {
                text: 'From Vue CLI v4 to v5',
                link: '/migrations/migrate-from-v4'
              },
              {
                text: 'Full Changelog',
                link: 'https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md'
              }
            ]
          }
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Overview',
              link: '/guide/',
              collapsable: true
            },

            {
              text: 'Installation',
              link: '/guide/installation'
            },

            {
              text: 'Basics',
              collapsable: false,
              children: [
                {
                  text: 'Creating a Project',
                  link: '/guide/creating-a-project'
                },
                {
                  text: 'Plugins and Presets',
                  link: '/guide/plugins-and-presets'
                },
                {
                  text: 'CLI Service',
                  link: '/guide/cli-service'
                }
              ]
            },

            {
              text: 'Development',
              collapsable: false,
              children: [
                {
                  text: 'Browser Compatibility',
                  link: '/guide/browser-compatibility'
                },
                {
                  text: 'HTML and Static Assets',
                  link: '/guide/html-and-static-assets'
                },
                {
                  text: 'Working with CSS',
                  link: '/guide/css'
                },
                {
                  text: 'Working with Webpack',
                  link: '/guide/webpack'
                },
                {
                  text: 'Modes and Environment Variables',
                  link: '/guide/mode-and-env'
                },
                {
                  text: 'Build Targets',
                  link: '/guide/build-targets'
                },
                {
                  text: 'Deployment',
                  link: '/guide/deployment'
                },
                {
                  text: 'Troubleshooting',
                  link: '/guide/troubleshooting'
                }
              ]
            }
          ],

          '/dev-guide/': [
            {
              text: 'Plugin Development Guide',
              link: '/dev-guide/plugin-dev'
            },
            {
              text: 'API reference',
              collapsable: false,
              children: [
                {
                  text: 'Plugin API',
                  link: '/dev-guide/plugin-api'
                },
                {
                  text: 'Generator API',
                  link: '/dev-guide/generator-api'
                }
              ]
            },
            {
              text: 'UI Development',
              collapsable: false,
              children: [
                {
                  text: 'UI Plugin Info',
                  link: '/dev-guide/ui-info'
                },
                {
                  text: 'UI Plugin API',
                  link: '/dev-guide/ui-api'
                },
                {
                  text: 'UI Localization',
                  link: '/dev-guide/ui-localization'
                }
              ]
            }
          ],

          '/core-plugins/': [
            {
              text: 'Core Vue CLI Plugins',
              collapsable: false,
              children: [
                {
                  text: '@vue/cli-plugin-babel',
                  link: '/core-plugins/babel'
                },
                {
                  text: '@vue/cli-plugin-typescript',
                  link: '/core-plugins/typescript'
                },
                {
                  text: '@vue/cli-plugin-eslint',
                  link: '/core-plugins/eslint'
                },
                {
                  text: '@vue/cli-plugin-pwa',
                  link: '/core-plugins/pwa'
                },
                {
                  text: '@vue/cli-plugin-unit-jest',
                  link: '/core-plugins/unit-jest'
                },
                {
                  text: '@vue/cli-plugin-unit-mocha',
                  link: '/core-plugins/unit-mocha'
                },
                {
                  text: '@vue/cli-plugin-e2e-cypress',
                  link: '/core-plugins/e2e-cypress'
                },
                {
                  text: '@vue/cli-plugin-e2e-nightwatch',
                  link: '/core-plugins/e2e-nightwatch'
                },
                {
                  text: '@vue/cli-plugin-e2e-webdriverio',
                  link: '/core-plugins/e2e-webdriverio'
                }
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
              { text: '插件开发指南', link: '/zh/dev-guide/plugin-dev' },
              { text: 'UI 插件信息', link: '/zh/dev-guide/ui-info' },
              { text: 'UI 插件 API', link: '/zh/dev-guide/ui-api' },
              { text: 'UI 本地化', link: '/zh/dev-guide/ui-localization' }
            ]
          },
          {
            text: '插件',
            items: [
              {
                text: 'Babel',
                link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-babel/README.md'
              },
              {
                text: 'TypeScript',
                link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-typescript/README.md'
              },
              {
                text: 'ESLint',
                link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-eslint/README.md'
              },
              {
                text: 'PWA',
                link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-pwa/README.md'
              },
              {
                text: 'Jest',
                link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-unit-jest/README.md'
              },
              {
                text: 'Mocha',
                link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-unit-mocha/README.md'
              },
              {
                text: 'Cypress',
                link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-e2e-cypress/README.md'
              },
              {
                text: 'Nightwatch',
                link: 'https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-e2e-nightwatch/README.md'
              }
            ]
          },
          {
            text: '更新记录',
            link: 'https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md'
          }
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '介绍',
              link: '/zh/guide/',
              collapsable: true
            },
            {
              text: '安装',
              link: '/zh/guide/installation'
            },
            {
              text: '基础',
              collapsable: false,
              children: [
                {
                  text: '创建一个项目',
                  link: '/zh/guide/creating-a-project'
                },
                {
                  text: '插件和 Preset',
                  link: '/zh/guide/plugins-and-presets'
                },
                {
                  text: 'CLI 服务',
                  link: '/zh/guide/cli-service'
                }
              ]
            },
            {
              text: '开发',
              collapsable: false,
              children: [
                {
                  text: '浏览器兼容性',
                  link: '/zh/guide/browser-compatibility'
                },
                {
                  text: 'HTML 和静态资源',
                  link: '/zh/guide/html-and-static-assets'
                },
                {
                  text: 'CSS 相关',
                  link: '/zh/guide/css'
                },
                {
                  text: 'webpack 相关',
                  link: '/zh/guide/webpack'
                },
                {
                  text: '模式和环境变量',
                  link: '/zh/guide/mode-and-env'
                },
                {
                  text: '构建目标',
                  link: '/zh/guide/build-targets'
                },
                {
                  text: '部署',
                  link: '/zh/guide/deployment'
                }
              ]
            }
          ],
          '/zh/dev-guide/': [
            {
              text: '插件开发指南',
              link: '/zh/dev-guide/plugin-dev'
            },
            {
              title: 'UI 开发',
              collapsable: false,
              children: [
                {
                  text: 'UI 插件信息',
                  link: '/zh/dev-guide/ui-info'
                },
                {
                  text: 'UI 插件 API',
                  link: '/zh/dev-guide/ui-api'
                },
                {
                  text: 'UI 本地化',
                  link: '/zh/dev-guide/ui-localization'
                }
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
            text: 'Плагины',
            items: [
              { text: 'Основные плагины', link: '/ru/core-plugins/' },
              {
                text: 'Руководство по разработке',
                link: '/ru/dev-guide/plugin-dev'
              },
              { text: 'API плагина', link: '/ru/dev-guide/plugin-api' },
              { text: 'API генератора', link: '/ru/dev-guide/generator-api' },
              {
                text: 'Информация о плагине в UI',
                link: '/ru/dev-guide/ui-info'
              },
              { text: 'API плагина для UI', link: '/ru/dev-guide/ui-api' },
              {
                text: 'Локализация в UI',
                link: '/ru/dev-guide/ui-localization'
              },
              { text: 'Поиск', link: 'https://awesomejs.dev/for/vue-cli/' }
            ]
          },
          {
            text: 'Миграция с v3',
            link: '/ru/migrating-from-v3/'
          },
          {
            text: 'История изменений',
            link: 'https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md'
          }
        ],
        sidebar: {
          '/ru/guide/': [
            {
              text: 'Введение',
              link: '/ru/guide/',
              collapsable: true
            },
            {
              text: 'Установка',
              link: '/ru/guide/installation'
            },
            {
              text: 'Основы',
              collapsable: false,
              children: [
                {
                  text: 'Создание проекта',
                  link: '/ru/guide/creating-a-project'
                },
                {
                  text: 'Плагины и пресеты настроек',
                  link: '/ru/guide/creating-a-project'
                },
                {
                  text: 'Сервис CLI',
                  link: '/ru/guide/cli-service'
                }
              ]
            },
            {
              text: 'Разработка',
              collapsable: false,
              children: [
                {
                  text: 'Совместимость с браузерами',
                  link: '/ru/guide/browser-compatibility'
                },
                {
                  text: 'HTML и статические ресурсы',
                  link: '/ru/guide/html-and-static-assets'
                },
                {
                  text: 'Работа с CSS',
                  link: '/ru/guide/css'
                },
                {
                  text: 'Работа с Webpack',
                  link: '/ru/guide/webpack'
                },
                {
                  text: 'Режимы работы и переменные окружения',
                  link: '/ru/guide/mode-and-env'
                },
                {
                  text: 'Цели сборки',
                  link: '/ru/guide/build-targets'
                },
                {
                  text: 'Публикация',
                  link: '/ru/guide/deployment'
                },
                {
                  text: 'Поиск и устранение неисправностей',
                  link: '/ru/guide/troubleshooting'
                }
              ]
            }
          ],
          '/ru/dev-guide/': [
            {
              text: 'Руководство по разработке плагинов',
              link: '/ru/dev-guide/plugin-dev'
            },
            {
              text: 'Справочник API',
              collapsable: false,
              children: [
                {
                  text: 'API плагина',
                  link: '/ru/dev-guide/plugin-api'
                },
                {
                  text: 'API генератора',
                  link: '/ru/dev-guide/generator-api'
                }
              ]
            },
            {
              text: 'Разработка UI',
              collapsable: false,
              children: [
                {
                  text: 'Информация о плагине в UI',
                  link: '/ru/dev-guide/ui-info'
                },
                {
                  text: 'API плагина для UI',
                  link: '/ru/dev-guide/ui-api'
                },
                {
                  text: 'Локализация в UI',
                  link: '/ru/dev-guide/ui-localization'
                }
              ]
            }
          ],
          '/ru/core-plugins/': [
            {
              text: 'Основные плагины Vue CLI',
              collapsable: false,
              children: [
                {
                  text: '@vue/cli-plugin-babel',
                  link: '/ru/core-plugins/babel'
                },
                {
                  text: '@vue/cli-plugin-typescript',
                  link: '/ru/core-plugins/typescript'
                },
                {
                  text: '@vue/cli-plugin-eslint',
                  link: '/ru/core-plugins/eslint'
                },
                {
                  text: '@vue/cli-plugin-pwa',
                  link: '/ru/core-plugins/pwa'
                },
                {
                  text: '@vue/cli-plugin-unit-jest',
                  link: '/ru/core-plugins/unit-jest'
                },
                {
                  text: '@vue/cli-plugin-unit-mocha',
                  link: '/ru/core-plugins/unit-mocha'
                },
                {
                  text: '@vue/cli-plugin-e2e-cypress',
                  link: '/ru/core-plugins/e2e-cypress'
                },
                {
                  text: '@vue/cli-plugin-e2e-nightwatch',
                  link: '/ru/core-plugins/e2e-nightwatch'
                },
                {
                  text: '@vue/cli-plugin-e2e-webdriverio',
                  link: '/ru/core-plugins/e2e-webdriverio'
                }
              ]
            }
          ]
        }
      }
    }
  },
}
