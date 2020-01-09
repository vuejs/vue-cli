<template>
  <div class="configuration-tab">
    <PromptsList
      :prompts="visiblePrompts"
      @answer="answerPrompt"
    />
  </div>
</template>

<script>
import Prompts from '@/mixins/Prompts'

import CONFIGURATION from '@/graphql/configuration/configuration.gql'

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
        const result = {}
        for (const prompt of prompts) {
          const list = result[prompt.tabId] || (result[prompt.tabId] = [])
          list.push(prompt)
        }
        for (const tabId in result) {
          data.configuration.tabs.find(t => t.id === tabId).prompts = result[tabId]
        }
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
