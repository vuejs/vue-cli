<template>
  <div class="project-plugins page">
    <ContentView
      :title="$t('org.vue.views.project-plugins.title')"
      class="limit-width"
    >
      <template v-if="projectCurrent.type === 'vue'" slot="actions">
        <VueButton
          icon-left="add"
          :label="$t('org.vue.views.project-plugins.button')"
          class="primary round"
          :to="{ name: 'project-plugins-add' }"
          data-testid="add-plugin"
        />

        <VueDropdown>
          <VueButton
            slot="trigger"
            icon-left="more_vert"
            class="icon-button flat round"
          />

          <VueDropdownButton
            icon-left="file_download"
            :label="$t('org.vue.views.project-plugins.update-all')"
            @click="updateAll()"
          />
        </VueDropdown>
      </template>

      <ApolloQuery
        v-if="projectCurrent.type === 'vue'"
        :query="require('../graphql/projectPlugins.gql')"
      >
        <template slot-scope="{ result: { data, loading } }">
          <div class="cta-text">{{ $t('org.vue.views.project-plugins.heading') }}</div>

          <VueLoadingIndicator
            v-if="loading && !data"
            class="overlay"
          />

          <div v-else-if="data" class="plugins">
            <ProjectPluginItem
              v-for="plugin of data.projectCurrent.plugins"
              :key="plugin.id"
              :plugin="plugin"
            />
          </div>
        </template>
      </ApolloQuery>
    </ContentView>

    <ProgressScreen progress-id="plugin-update"/>
    <ProgressScreen progress-id="plugins-update"/>
  </div>
</template>

<script>
import PLUGINS_UPDATE from '../graphql/pluginsUpdate.gql'
import PROJECT_CURRENT from '../graphql/projectCurrent.gql'

export default {
  name: 'ProjectPlugins',

  metaInfo () {
    return {
      title: this.$t('org.vue.views.project-plugins.title')
    }
  },

  apollo: {
    projectCurrent: PROJECT_CURRENT
  },

  methods: {
    updateAll () {
      return this.$apollo.mutate({
        mutation: PLUGINS_UPDATE
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-plugins
  .content-view /deep/ > .content
    overflow-y auto
</style>
