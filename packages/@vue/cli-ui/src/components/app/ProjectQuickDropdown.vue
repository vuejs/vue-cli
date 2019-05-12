<template>
  <div class="project-quick-dropdown">
    <VueDropdown
      v-if="$responsive.wide"
      :label="projectCurrent ? projectCurrent.name : $t('org.vue.components.status-bar.project.empty')"
      class="current-project"
      icon-right="arrow_drop_down"
      button-class="round"
    >
      <!-- Current project options -->

      <template v-if="projectCurrent">
        <VueSwitch
          :value="projectCurrent.favorite"
          :icon="projectCurrent.favorite ? 'star' : 'star_border'"
          class="extend-left"
          @update="toggleCurrentFavorite()"
        >
          {{ $t('org.vue.components.project-select-list-item.tooltips.favorite') }}
        </VueSwitch>

        <VueDropdownButton
          :label="$t('org.vue.components.project-select-list-item.tooltips.open-in-editor')"
          icon-left="open_in_browser"
          @click="openInEditor(projectCurrent)"
        />

        <VueDropdownButton
          :label="$t('org.vue.components.project-rename.title')"
          icon-left="edit"
          @click="showRename = true"
        />

        <VueDropdownButton
          v-if="projectCurrent.homepage"
          :href="projectCurrent.homepage"
          :label="$t('org.vue.components.top-bar.homepage')"
          target="_blank"
          icon-left="open_in_new"
        />
      </template>

      <div class="dropdown-separator"/>

      <!-- Favorites -->

      <div v-if="!favoriteProjects.length" class="vue-ui-empty">{{ $t('org.vue.components.top-bar.no-favorites') }}</div>

      <template v-else>
        <div class="section-title">
          {{ $t('org.vue.components.top-bar.favorite-projects') }}
        </div>

        <VueDropdownButton
          v-for="project of favoriteProjects"
          :key="project.id"
          :label="project.name"
          icon-left="star"
          @click="openProject(project)"
        />
      </template>

      <!-- Recents -->

      <template v-if="recentProjects.length">
        <div class="dropdown-separator"/>

        <div class="section-title">
          {{ $t('org.vue.components.top-bar.recent-projects') }}
        </div>

        <VueDropdownButton
          v-for="project of recentProjects"
          :key="project.id"
          :label="project.name"
          icon-left="restore"
          @click="openProject(project)"
        />
      </template>

      <div class="dropdown-separator"/>

      <VueDropdownButton
        :to="{ name: 'project-select' }"
        :label="$t('org.vue.views.project-select.title')"
        icon-left="home"
      />
    </VueDropdown>

    <ProjectRename
      v-if="showRename"
      :project="projectCurrent"
      @close="showRename = false"
    />
  </div>
</template>

<script>
import { resetApollo } from '@/vue-apollo'

import PROJECT_CURRENT from '@/graphql/project/projectCurrent.gql'
import PROJECTS from '@/graphql/project/projects.gql'
import PROJECT_OPEN from '@/graphql/project/projectOpen.gql'
import PROJECT_SET_FAVORITE from '@/graphql/project/projectSetFavorite.gql'
import OPEN_IN_EDITOR from '@/graphql/file/fileOpenInEditor.gql'

import ProjectRename from '../project-manager/ProjectRename.vue'

export default {
  components: {
    ProjectRename
  },

  apollo: {
    projectCurrent: PROJECT_CURRENT,
    projects: PROJECTS
  },

  data () {
    return {
      showRename: false
    }
  },

  computed: {
    favoriteProjects () {
      if (!this.projects) return []
      return this.projects.filter(
        p => p.favorite && (!this.projectCurrent || this.projectCurrent.id !== p.id)
      )
    },

    recentProjects () {
      if (!this.projects) return []
      return this.projects.filter(
        p => !p.favorite && (!this.projectCurrent || this.projectCurrent.id !== p.id)
      ).sort((a, b) => b.openDate - a.openDate).slice(0, 3)
    }
  },

  methods: {
    async openProject (project) {
      this.$bus('quickOpenProject', project)

      await this.$apollo.mutate({
        mutation: PROJECT_OPEN,
        variables: {
          id: project.id
        }
      })

      await resetApollo()
    },

    async toggleCurrentFavorite () {
      if (this.projectCurrent) {
        await this.$apollo.mutate({
          mutation: PROJECT_SET_FAVORITE,
          variables: {
            id: this.projectCurrent.id,
            favorite: this.projectCurrent.favorite ? 0 : 1
          }
        })
      }
    },

    async openInEditor (project) {
      await this.$apollo.mutate({
        mutation: OPEN_IN_EDITOR,
        variables: {
          input: {
            file: project.path
          }
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.current-project
  width 100%
  >>> .trigger
    .vue-ui-button
      .vue-ui-icon.right
        width 20px
        height @width

.vue-ui-empty
  padding 6px
</style>
