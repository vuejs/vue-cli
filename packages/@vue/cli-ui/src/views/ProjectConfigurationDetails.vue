<template>
  <div class="project-configuration-details">
    <div class="content">
      <PromptsList
        :prompts="visiblePrompts"
        @answer="answerPrompt"
      />
    </div>

    <div class="actions-bar space-between">
      <VueButton
        :disabled="!hasPromptsChanged"
        icon-left="cancel"
        class="big"
        :label="$t('views.project-configuration-details.actions.cancel')"
        @click="cancel()"
      />

      <VueButton
        v-if="configuration && configuration.link"
        icon-right="open_in_new"
        class="big flat success"
        :label="$t('views.project-configuration-details.actions.more-info')"
        :href="configuration.link"
        target="_blank"
      />

      <VueButton
        :disabled="!hasPromptsChanged"
        icon-left="save"
        class="primary big"
        :label="$t('views.project-configuration-details.actions.save')"
        @click="save()"
      />
    </div>
  </div>
</template>

<script>
import Prompts from '../mixins/Prompts'

import CONFIGURATION from '../graphql/configuration.gql'
import CONFIGURATION_SAVE from '../graphql/configurationSave.gql'
import CONFIGURATION_CANCEL from '../graphql/configurationCancel.gql'

export default {
  mixins: [
    Prompts({
      field: 'configuration',
      query: CONFIGURATION
    })
  ],

  metaInfo () {
    return {
      title: this.configuration && `${this.configuration.name} - ${this.$t('views.project-configurations.title')}`
    }
  },

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      configuration: null
    }
  },

  apollo: {
    configuration: {
      query: CONFIGURATION,
      variables () {
        return {
          id: this.id
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  },

  methods: {
    async cancel () {
      await this.$apollo.mutate({
        mutation: CONFIGURATION_CANCEL,
        variables: {
          id: this.id
        }
      })

      this.$apollo.queries.configuration.refetch()
    },

    async save () {
      await this.$apollo.mutate({
        mutation: CONFIGURATION_SAVE,
        variables: {
          id: this.id
        }
      })

      this.$apollo.queries.configuration.refetch()
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-configuration-details
  v-box()
  align-items stretch
  height 100%

  .content
    flex 100% 1 1
    height 0
    overflow-x hidden
    overflow-y auto
</style>
