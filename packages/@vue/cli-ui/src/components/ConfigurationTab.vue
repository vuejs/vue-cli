<template>
  <div class="configuration-tab">
    <PromptsList
      :prompts="visiblePrompts"
      @answer="answerPrompt"
    />
  </div>
</template>

<script>
import Prompts from '../mixins/Prompts'

import CONFIGURATION from '../graphql/configuration.gql'

export default {
  mixins: [
    Prompts({
      field: 'tab',
      query: CONFIGURATION,
      variables () {
        return {
          id: this.configuration.id
        }
      },
      updateQuery (data, prompts) {
        data.configuration.tabs.find(t => t.id === this.tab.id).prompts = prompts
      }
    })
  ],

  props: {
    configuration: {
      type: Object,
      required: true
    },

    tab: {
      type: Object,
      required: true
    }
  }
}
</script>
