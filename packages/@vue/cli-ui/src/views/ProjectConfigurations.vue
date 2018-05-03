<template>
  <div class="project-configurations page">
    <ContentView
      :title="$t('views.project-configurations.title')"
      class="limit-width"
    >
      <ApolloQuery
        :query="require('../graphql/configurations.gql')"
        fetch-policy="cache-and-network"
        class="fill-height"
      >
        <template slot-scope="{ result: { data, loading } }">
          <VueLoadingIndicator
            v-if="loading"
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

export default {
  mixins: [
    RestoreRoute()
  ],

  metaInfo () {
    return {
      title: this.$t('views.project-configurations.title')
    }
  },

  methods: {
    generateItems (configurations) {
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
