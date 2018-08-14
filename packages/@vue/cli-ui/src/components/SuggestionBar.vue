<template>
  <ApolloQuery
    :query="require('../graphql/suggestions.gql')"
    class="suggestion-bar"
  >
    <ApolloSubscribeToMore
      :document="require('../graphql/suggestionAdded.gql')"
      :updateQuery="(previousResult, { subscriptionData }) => {
        const newSuggestion = subscriptionData.data.suggestionAdded
        if (!previousResult.suggestions) {
          return {
            suggestions: [newSuggestion]
          }
        }
        if (previousResult.suggestions.find(s => s.id === newSuggestion.id)) {
          return previousResult
        }
        return {
          suggestions: [
            ...previousResult.suggestions,
            newSuggestion
          ]
        }
      }"
    />

    <ApolloSubscribeToMore
      :document="require('../graphql/suggestionUpdated.gql')"
    />

    <ApolloSubscribeToMore
      :document="require('../graphql/suggestionRemoved.gql')"
      :updateQuery="(previousResult, { subscriptionData }) => ({
        suggestions: previousResult.suggestions ? previousResult.suggestions.filter(
          s => s.id !== subscriptionData.data.suggestionRemoved.id
        ) : []
      })"
    />

    <template slot-scope="{ result: { data } }" v-if="data">
      <transition-group name="suggestion" class="suggestions">
        <SuggestionBarItem
          v-for="suggestion of withBuiltins(data.suggestions)"
          :key="`${$i18n.locale}:${suggestion.id}`"
          :suggestion="suggestion"
        />
      </transition-group>
    </template>
  </ApolloQuery>
</template>

<script>
export default {
  data () {
    return {
      forceDevtoolsSuggestion: false
    }
  },
  methods: {
    // Builtin suggestions
    withBuiltins (suggestions) {
      let list = suggestions

      // Install devtools
      if (this.forceDevtoolsSuggestion || !Object.prototype.hasOwnProperty.call(window, '__VUE_DEVTOOLS_GLOBAL_HOOK__')) {
        let devtoolsLink = null
        if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
          devtoolsLink = 'https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd'
        } else if (/Firefox/.test(navigator.userAgent)) {
          devtoolsLink = 'https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/'
        }

        if (devtoolsLink) {
          list = [
            ...list,
            {
              id: 'vue-devtools',
              type: 'action',
              label: 'org.vue.cli-service.suggestions.vue-devtools.label',
              message: 'org.vue.cli-service.suggestions.vue-devtools.message',
              link: 'https://github.com/vuejs/vue-devtools',
              image: 'https://raw.githubusercontent.com/vuejs/vue-devtools/master/media/screenshot.png',
              actionLink: devtoolsLink
            }
          ]
        }
      }

      return list
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.suggestions
  h-box()
</style>
