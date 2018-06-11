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
      <VueDropdown
        v-for="suggestion of data.suggestions"
        :key="suggestion.id"
        :disabled="!suggestion.message && !suggestion.link"
        class="suggestion"
        placement="bottom-end"
      >
        <VueButton
          slot="trigger"
          :label="$t(suggestion.label)"
          :loading="suggestion.busy"
          class="round"
          v-tooltip="$t('components.suggestion-bar.suggestion')"
          @click="if (!suggestion.message && !suggestion.link) activate(suggestion)"
        />

        <div class="suggestion-details">
          <div class="info label">
            {{ $t(suggestion.label) }}
          </div>

          <div
            v-if="suggestion.message"
            class="info message"
            v-html="$t(suggestion.message)"
          />

          <div class="actions-bar">
            <VueButton
              :href="suggestion.link"
              :label="$t('components.list-item-info.more-info')"
              target="_blank"
              class="flat"
              icon-right="open_in_new"
            />
            <div class="vue-ui-spacer"/>
            <VueButton
              :label="$t('components.suggestion-bar.modal.cancel')"
              icon-left="close"
              v-close-popover
            />
            <VueButton
              class="primary"
              :label="$t('components.suggestion-bar.modal.continue')"
              icon-left="done"
              v-close-popover
              @click="activate(suggestion)"
            />
          </div>
        </div>
      </VueDropdown>
    </template>
  </ApolloQuery>
</template>

<script>
import SUGGESTION_ACTIVATE from '../graphql/suggestionActivate.gql'

export default {
  methods: {
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

.suggestion-details
  padding ($padding-item * 2 - 8px) ($padding-item * 2)
  box-sizing border-box
  width 440px

  .label
    font-size 20px

  .actions-bar
    padding 0
    margin-top ($padding-item * 3)

  .info
    &:not(:last-child)
      margin-bottom $padding-item
</style>
