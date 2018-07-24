import { storiesOf } from '@storybook/vue'
import VueI18n from 'vue-i18n'

import ViewBadge from '../components/ViewBadge.vue'

storiesOf('ViewBadge', module)
  .add('info without label', () => ({
    components: { ViewBadge },
    template: `<ViewBadge :badge="{ type: 'info', count: 2 }"></ViewBadge>`,
    i18n: new VueI18n({
      locale: 'en',
      messages: {
        en: {}
      }
    })
  }))
