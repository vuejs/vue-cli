<template>
  <div class="project-configuration-details">
    <template v-if="configuration">
      <div v-if="configuration.tabs.length > 1" class="tabs">
        <VueGroup
          v-model="currentTab"
          class="tabs-selector"
        >
          <VueGroupButton
            v-for="tab of configuration.tabs"
            :key="tab.id"
            :value="tab.id"
            :icon-left="tab.icon"
            :label="$t(tab.label)"
          />
        </VueGroup>
      </div>

      <div class="content">
        <ConfigurationTab
          v-for="tab of configuration.tabs"
          v-show="tab.id === currentTab"
          :key="tab.id"
          :configuration="configuration"
          :tab="tab"
          @has-changes="value => tabsHaveChanges[tab.id] = value"
        />
      </div>
    </template>

    <VueLoadingIndicator
      v-else
      class="loading"
    />

    <div class="actions-bar">
      <VueButton
        v-if="configuration && configuration.link"
        icon-right="open_in_new"
        class="big flat success"
        :label="$t('org.vue.views.project-configuration-details.actions.more-info')"
        :href="configuration.link"
        target="_blank"
      />

      <div class="vue-ui-spacer"/>

      <VueButton
        :disabled="!hasPromptsChanged"
        icon-left="cancel"
        class="big"
        :label="$t('org.vue.views.project-configuration-details.actions.cancel')"
        @click="cancel()"
      />

      <VueButton
        v-if="configuration && !hasPromptsChanged"
        icon-left="refresh"
        class="big primary"
        :label="$t('org.vue.views.project-configuration-details.actions.refresh')"
        @click="refetch()"
      />

      <VueButton
        v-else
        icon-left="save"
        class="primary big"
        :label="$t('org.vue.views.project-configuration-details.actions.save')"
        @click="save()"
      />
    </div>
  </div>
</template>

<script>
import CONFIGURATION from '@/graphql/configuration/configuration.gql'
import CONFIGURATION_SAVE from '@/graphql/configuration/configurationSave.gql'
import CONFIGURATION_CANCEL from '@/graphql/configuration/configurationCancel.gql'

export default {
  metaInfo () {
    return {
      title: this.configuration && `${this.configuration.name} - ${this.$t('org.vue.views.project-configurations.title')}`
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
      configuration: null,
      currentTab: '__default',
      tabsHaveChanges: {}
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
      async result ({ data, loading }) {
        if (!this.$_init && !loading && data && data.configuration) {
          this.$_init = true
          this.tabsHaveChanges = data.configuration.tabs.reduce((obj, tab) => {
            obj[tab.id] = false
            return obj
          }, {})
          await this.$nextTick()
          this.currentTab = data.configuration.tabs[0].id
        }
      }
    }
  },

  computed: {
    hasPromptsChanged () {
      for (const key in this.tabsHaveChanges) {
        if (this.tabsHaveChanges[key]) return true
      }
      return false
    }
  },

  watch: {
    id: 'init'
  },

  created () {
    this.init()
  },

  methods: {
    init (tab) {
      this.currentTab = '__default'
      this.configuration = null
      this.$_init = false
    },

    async cancel () {
      await this.$apollo.mutate({
        mutation: CONFIGURATION_CANCEL,
        variables: {
          id: this.id
        }
      })

      this.refetch()
    },

    async save () {
      await this.$apollo.mutate({
        mutation: CONFIGURATION_SAVE,
        variables: {
          id: this.id
        }
      })

      this.refetch()
    },

    refetch () {
      this.$apollo.queries.configuration.refetch()
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-configuration-details
  v-box()
  align-items stretch
  height 100%
  background $vue-ui-color-light
  .vue-ui-dark-mode &
    background $vue-ui-color-darker

  .content,
  .loading
    flex 100% 1 1
    height 0

  .content
    overflow-x hidden
    overflow-y auto

  .tabs
    margin $padding-item 0
</style>
