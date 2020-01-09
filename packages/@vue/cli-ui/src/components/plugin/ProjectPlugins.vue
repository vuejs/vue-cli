<template>
  <div class="project-plugins page">
    <ContentView
      :title="$t('org.vue.views.project-plugins.title')"
      class="limit-width list"
    >
      <template slot="actions">
        <VueInput
          v-model="search"
          icon-left="search"
          class="round"
        />

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
        :query="require('@/graphql/plugin/plugins.gql')"
      >
        <template slot-scope="{ result: { data, loading } }">
          <div class="cta-text">{{ $t('org.vue.views.project-plugins.heading') }}</div>

          <VueLoadingIndicator
            v-if="loading && (!data || !data.plugins)"
            class="overlay"
          />

          <ListFilter
            v-else-if="data"
            class="plugins"
            :list="data.plugins"
            :filter="item => !search || item.id.includes(search)"
          >
            <template slot-scope="{ list }">
              <ProjectPluginItem
                v-for="plugin of list"
                :key="plugin.id"
                :plugin="plugin"
              />
            </template>
          </ListFilter>
        </template>
      </ApolloQuery>
    </ContentView>

    <ProgressScreen progress-id="plugin-update"/>
    <ProgressScreen progress-id="plugins-update"/>
  </div>
</template>

<script>
import PLUGINS_UPDATE from '@/graphql/plugin/pluginsUpdate.gql'
import PROJECT_CURRENT from '@/graphql/project/projectCurrent.gql'
import PLUGINS from '@/graphql/plugin/plugins.gql'

export default {
  name: 'ProjectPlugins',

  metaInfo () {
    return {
      title: this.$t('org.vue.views.project-plugins.title')
    }
  },

  data () {
    return {
      search: ''
    }
  },

  apollo: {
    projectCurrent: PROJECT_CURRENT
  },

  bus: {
    quickOpenProject (project) {
      this.$apollo.getClient().writeQuery({
        query: PLUGINS,
        data: {
          plugins: null
        }
      })
    }
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
.project-plugins
  .content-view /deep/ > .content
    overflow-y auto
</style>
