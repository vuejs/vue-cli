import { h } from 'vue'
import DefaultTheme from 'vitepress/dist/client/theme-default'
import AlgoliaSearchBox from './AlgoliaSearchBox.vue'
import './custom.css'
import { useData } from 'vitepress'

export default {
  ...DefaultTheme,
  Layout: {
    setup() {
      const { lang } = useData()
      return () => {
        return h(DefaultTheme.Layout, null, {
          'page-top': () => {
            return lang.value === 'zh-CN' ? notice_zh_cn() : notice_en()
          },
          'navbar-search': () => {
            return h(AlgoliaSearchBox, {
              options: {
                indexName: 'cli_vuejs',
                apiKey: 'f6df220f7d246aff64a56300b7f19f21'
              }
            })
          }
        })
      }
    }
  }
}

function notice_en() {
  return h('div', { class: 'warning custom-block' }, [
    h(
      'p',
      { class: 'custom-block-title' },
      '⚠️ Vue CLI is in Maintenance Mode!'
    ),
    h('p', [
      'For new projects, it is now recommended to use ',
      h(
        'a',
        {
          href: 'https://github.com/vuejs/create-vue',
          target: '_blank'
        },
        [h('code', 'create-vue')]
      ),
      ' to scaffold ',
      h('a', { href: 'https://vitejs.dev', target: '_blank' }, 'Vite'),
      '-based projects. ',
      'Also refer to the ',
      h(
        'a',
        {
          href: 'https://vuejs.org/guide/scaling-up/tooling.html',
          target: '_blank'
        },
        'Vue 3 Tooling Guide'
      ),
      ' for the latest recommendations.'
    ])
  ])
}

function notice_zh_cn() {
  return h('div', { class: 'warning custom-block' }, [
    h('p', { class: 'custom-block-title' }, '⚠️ Vue CLI 现已处于维护模式!'),
    h('p', [
      '现在官方推荐使用 ',
      h(
        'a',
        {
          href: 'https://github.com/vuejs/create-vue',
          target: '_blank'
        },
        [h('code', 'create-vue')]
      ),
      ' 来创建基于 ',
      h('a', { href: 'https://cn.vitejs.dev', target: '_blank' }, 'Vite'),
      ' 的新项目。 ',
      '另外请参考 ',
      h(
        'a',
        {
          href: 'https://cn.vuejs.org/guide/scaling-up/tooling.html',
          target: '_blank'
        },
        'Vue 3 工具链指南'
      ),
      ' 以了解最新的工具推荐。'
    ])
  ])
}
