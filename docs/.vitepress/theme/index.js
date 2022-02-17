import { h } from 'vue'
import DefaultTheme from 'vitepress/dist/client/theme-default'
import AlgoliaSearchBox from './AlgoliaSearchBox.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'navbar-search': () => {
        return h(AlgoliaSearchBox, {
          options: {
            indexName: 'cli_vuejs',
            apiKey: 'f6df220f7d246aff64a56300b7f19f21',
          }
        })
      }
    })
  }
}
