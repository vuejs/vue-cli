<template>
  <div class="project-configurations page">
    <ContentView
      :title="$t('org.vue.views.project-configurations.title')"
      class="limit-width"
    >
      <ApolloQuery
        :query="require('@/graphql/configuration/configurations.gql')"
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
            <div
              slot="before"
              class="list-header"
            >
              <VueInput
                v-model="search"
                icon-left="search"
                class="search round"
              />
            </div>

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
import RestoreRoute from '@/mixins/RestoreRoute'
import { generateSearchRegex } from '@/util/search'

import CONFIGS from '@/graphql/configuration/configurations.gql'

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

  data () {
    return {
      search: ''
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

      const reg = generateSearchRegex(this.search)
      return configurations.filter(
        item => !reg || item.name.match(reg) || item.description.match(reg)
      ).map(
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
.project-configurations
  .content-view /deep/ > .content
    overflow-y hidden
</style>
