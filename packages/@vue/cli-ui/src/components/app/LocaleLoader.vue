<script>
import { mergeLocale } from '@/i18n'

import LOCALES from '@/graphql/locale/locales.gql'
import LOCALE_ADDED from '@/graphql/locale/localeAdded.gql'

export default {
  apollo: {
    locales: {
      query: LOCALES,
      fetchPolicy: 'no-cache',
      manual: true,
      result ({ data: { locales } }) {
        locales.forEach(this.loadLocale)
      }
    },

    $subscribe: {
      localeAdded: {
        query: LOCALE_ADDED,
        result ({ data }) {
          this.loadLocale(data.localeAdded)
        }
      }
    }
  },

  methods: {
    loadLocale (locale) {
      // eslint-disable-next-line no-console
      console.log(`[UI] Locale ${locale.lang} updated with new strings`)
      mergeLocale(locale.lang, locale.strings)
    }
  },

  render () {
    return null
  }
}
</script>
