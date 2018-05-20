<template>
  <div class="project-select-list">
    <ApolloQuery
      :query="require('@/graphql/projects.gql')"
      fetch-policy="network-only"
    >
      <template slot-scope="{ result: { data } }">
        <template v-if="data">
          <div v-if="data.projects.length">
            <ListFilter
              v-for="favorite of [true, false]"
              :key="favorite"
              :list="data.projects"
              :filter="item => !!item.favorite === favorite"
            >
              <template slot-scope="{ list }">
                <div
                  v-if="data.projects.find(item => item.favorite)"
                  class="cta-text"
                  :class="favorite ? 'favorite' : 'other'"
                >
                  {{ $t(`components.project-select-list.titles.${favorite ? 'favorite' : 'other'}`) }}
                </div>

                <ListSort
                  :list="list"
                  :compare="compareProjects"
                >
                  <template slot-scope="{ list }">
                    <ProjectSelectListItem
                      v-for="project of list"
                      :key="project.id"
                      :project="project"
                      @click.native="openProject(project)"
                      @remove="removeProject(project)"
                      @favorite="toggleFavorite(project)"
                    />
                  </template>
                </ListSort>
              </template>
            </ListFilter>
          </div>
          <div v-else class="vue-ui-empty">
            <VueIcon icon="attach_file" class="empty-icon"/>
            <div>{{ $t('components.project-select-list.empty') }}</div>
          </div>
        </template>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import PROJECTS from '../graphql/projects.gql'
import PROJECT_OPEN from '../graphql/projectOpen.gql'
import PROJECT_REMOVE from '../graphql/projectRemove.gql'
import PROJECT_SET_FAVORITE from '../graphql/projectSetFavorite.gql'

export default {
  methods: {
    async openProject (project) {
      await this.$apollo.mutate({
        mutation: PROJECT_OPEN,
        variables: {
          id: project.id
        }
      })

      this.$router.push({ name: 'project-home' })
    },

    async removeProject (project) {
      await this.$apollo.mutate({
        mutation: PROJECT_REMOVE,
        variables: {
          id: project.id
        },
        update: store => {
          const data = store.readQuery({ query: PROJECTS })
          const index = data.projects.findIndex(
            p => p.id === project.id
          )
          if (index !== -1) data.projects.splice(index, 1)
          store.writeQuery({ query: PROJECTS, data })
        }
      })
    },

    async toggleFavorite (project) {
      await this.$apollo.mutate({
        mutation: PROJECT_SET_FAVORITE,
        variables: {
          id: project.id,
          favorite: project.favorite ? 0 : 1
        }
      })
    },

    compareProjects (a, b) {
      return a.name.localeCompare(b.name)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-select-list
  height 100%
  overflow-y auto
</style>
