<template>
  <div class="project-select-list">
    <ApolloQuery
      :query="require('@/graphql/projects.gql')"
      fetch-policy="network-only"
    >
      <template slot-scope="{ result: { data } }">
        <template v-if="data">
          <div v-if="data.projects.length">
            <ProjectSelectListItem
              v-for="project of data.projects"
              :key="project.id"
              :project="project"
              @click.native="openProject(project)"
              @remove="removeProject(project)"
              @favorite="toggleFavorite(project)"
            />
          </div>
          <div v-else class="vue-ui-empty">
            <VueIcon icon="attach_file" class="empty-icon"/>
            <div>No existing projects</div>
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
      // TODO
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
