<template>
  <div class="project-configurations page">
    <ContentView
      :title="$t('org.vue.views.project-configurations.title')"
      class="limit-width"
    >
      <ApolloQuery
        :query="require('../graphql/configurations.gql')"
        class="fill-height"
      >
        <template slot-scope="{ result: { data, loading } }">
          <VueLoadingIndicator
            v-if="loading && (!data || !data.configurations)"
            class="overlay"
          />

          <NavContent
            v-else-if="data"
            :items="generateItems(data.configurations)"
            class="configurations"
          >
            <ConfigurationItem
              slot-scope="{ item, selected }"
              :configuration="item.configuration"
              :selected="selected"
            />
          </NavContent>
        </template>
      </ApolloQuery>
    </ContentView>
  </div>
</template>

<script>
import RestoreRoute from '../mixins/RestoreRoute'

import CONFIGS from '../graphql/configurations.gql'

export default {
  mixins: [
    RestoreRoute({
      baseRoute: { name: 'project-configurations' }
    })
  ],

  metaInfo () {
    return {
      title: this.$t('org.vue.views.project-configurations.title')
    }
  },

  bus: {
    quickOpenProject (project) {
      this.$apollo.getClient().writeQuery({
        query: CONFIGS,
        data: {
          configurations: null
        }
      })
    }
  },

  methods: {
    generateItems (configurations) {
      if (!configurations) return []
      return configurations.map(
        configuration => ({
          route: {
            name: 'project-configuration-details',
            params: {
              id: configuration.id
            }
          },
          configuration
        })
      )
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-configurations
  .content-view /deep/ > .content
    overflow-y hidden
</style>
