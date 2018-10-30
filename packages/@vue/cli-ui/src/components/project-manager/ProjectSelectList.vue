<template>
  <div class="project-select-list">
    <ApolloQuery
      :query="require('@/graphql/project/projects.gql')"
    >
      <template slot-scope="{ result: { data, loading } }">
        <template v-if="data">
          <div v-if="data.projects.length">
            <div class="toolbar">
              <VueInput
                v-model="search"
                icon-left="search"
                class="round"
              />
            </div>

            <ListFilter
              v-for="favorite of [true, false]"
              :key="favorite"
              :list="filterProjects(data.projects)"
              :filter="item => !!item.favorite === favorite"
            >
              <template slot-scope="{ list }">
                <div
                  v-if="data.projects.find(item => item.favorite)"
                  class="cta-text"
                  :class="favorite ? 'favorite' : 'other'"
                >
                  {{ $t(`org.vue.components.project-select-list.titles.${favorite ? 'favorite' : 'other'}`) }}
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
                      :class="{
                        open: projectCurrent && projectCurrent.id === project.id
                      }"
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
            <div>{{ $t('org.vue.components.project-select-list.empty') }}</div>
          </div>
        </template>

        <VueLoadingIndicator
          v-else-if="loading"
          class="overlay"
        />
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import { generateSearchRegex } from '@/util/search'

import PROJECTS from '@/graphql/project/projects.gql'
import PROJECT_CURRENT from '@/graphql/project/projectCurrent.gql'
import PROJECT_OPEN from '@/graphql/project/projectOpen.gql'
import PROJECT_REMOVE from '@/graphql/project/projectRemove.gql'
import PROJECT_SET_FAVORITE from '@/graphql/project/projectSetFavorite.gql'

export default {
  data () {
    return {
      search: ''
    }
  },

  apollo: {
    projectCurrent: PROJECT_CURRENT
  },

  methods: {
    async openProject (project) {
      if (!this.projectCurrent || this.projectCurrent.id !== project.id) {
        await this.$apollo.mutate({
          mutation: PROJECT_OPEN,
          variables: {
            id: project.id
          }
        })
      }

      this.$router.push({ name: 'project-home' })
    },

    async removeProject (project) {
      await this.$apollo.mutate({
        mutation: PROJECT_REMOVE,
        variables: {
          id: project.id
        },
        update: store => {
          let data = store.readQuery({ query: PROJECTS })
          // TODO this is a workaround
          // See: https://github.com/apollographql/apollo-client/issues/4031#issuecomment-433668473
          data = {
            projects: [...data.projects]
          }
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
    },

    filterProjects (projects) {
      const reg = generateSearchRegex(this.search)
      if (reg) {
        return projects.filter(
          p => reg.test(p.path)
        )
      }
      return projects
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-select-list
  height 100%
  overflow-y auto
  position relative
  min-height 400px

.toolbar
  h-box()
  box-center()
  margin-bottom $padding-item
</style>
