<template>
  <ApolloQuery
    :query="require('../graphql/suggestions.gql')"
    class="suggestion-bar"
  >
    <ApolloSubscribeToMore
      :document="require('../graphql/suggestionAdded.gql')"
      :updateQuery="(previousResult, { subscriptionData }) => ({
        suggestions: [
          ...previousResult.suggestions,
          subscriptionData.data.suggestionAdded
        ]
      })"
    />

    <ApolloSubscribeToMore
      :document="require('../graphql/suggestionUpdated.gql')"
    />

    <ApolloSubscribeToMore
      :document="require('../graphql/suggestionRemoved.gql')"
      :updateQuery="(previousResult, { subscriptionData }) => ({
        suggestions: previousResult.suggestions.filter(
          s => s.id !== subscriptionData.data.suggestionRemoved.id
        )
      })"
    />

    <template slot-scope="{ result: { data } }" v-if="data">
      <VueButton
        v-for="suggestion of data.suggestions"
        :key="suggestion.id"
        :label="$t(suggestion.label)"
        :loading="suggestion.busy"
        class="suggestion round"
        v-tooltip="$t('components.suggestion-bar.suggestion')"
        @click="select(suggestion)"
      />
    </template>

    <VueModal
      v-if="showDetails"
      :title="$t(currentSuggestion.label)"
      class="medium"
      @close="showDetails = false"
    >
      <div class="default-body">
        <div
          v-if="currentSuggestion.message"
          class="info message"
          v-html="$t(currentSuggestion.message)"
        />
        <div
          v-if="currentSuggestion.link"
          class="info links"
        >
          <a :href="currentSuggestion.link" target="_blank">
            {{ $t('components.list-item-info.more-info') }}
          </a>
        </div>
      </div>

      <div slot="footer" class="actions">
        <VueButton
          class="big"
          :label="$t('components.suggestion-bar.modal.cancel')"
          icon="close"
          @click="showDetails = false"
        />
        <VueButton
          class="primary big"
          :label="$t('components.suggestion-bar.modal.continue')"
          icon="done"
          @click="activate(currentSuggestion)"
        />
      </div>
    </VueModal>
  </ApolloQuery>
</template>

<script>
import SUGGESTION_ACTIVATE from '../graphql/suggestionActivate.gql'

export default {
  data () {
    return {
      currentSuggestion: null,
      showDetails: false
    }
  },

  methods: {
    select (suggestion) {
      if (suggestion.message || suggestion.link) {
        this.currentSuggestion = suggestion
        this.showDetails = true
      } else {
        this.activate(suggestion)
      }
    },

    async activate (suggestion) {
      this.showDetails = false
      await this.$apollo.mutate({
        mutation: SUGGESTION_ACTIVATE,
        variables: {
          input: {
            id: suggestion.id
          }
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.suggestion
  &:not(:first-child)
    margin-left $padding-item

.info
  &:not(:last-child)
    margin-bottom $padding-item
</style>
