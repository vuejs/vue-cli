<template>
  <div class="project-select page">
    <VueTabs
      :tab-id.sync="tab"
      class="main-tabs"
      group-class="accent"
    >
      <VueTab
        id="existing"
        label="Projects"
        icon="storage"
      >
        <ProjectSelectList/>
      </VueTab>

      <VueTab
        id="create"
        label="Create"
        icon="add_box"
      >
        <FolderExplorer/>

        <div class="actions-bar">
          <VueButton
            icon-left="add"
            label="Create a new project here"
            class="big primary"
            :to="{ name: 'project-create' }"
          />
        </div>
      </VueTab>

      <VueTab
        id="import"
        label="Import"
        icon="unarchive"
      >
        <FolderExplorer/>

        <div class="actions-bar">
          <VueButton
            icon-left="unarchive"
            label="Import this folder"
            class="big primary"
            :disabled="!folderCurrent.isVueProject"
          />
        </div>
      </VueTab>
    </VueTabs>
  </div>
</template>

<script>
import ProjectSelectList from '../components/ProjectSelectList'
import FolderExplorer from '../components/FolderExplorer'

import FOLDER_CURRENT from '../graphql/folderCurrent.gql'

export default {
  components: {
    ProjectSelectList,
    FolderExplorer
  },

  data () {
    return {
      folderCurrent: {},
      tab: undefined
    }
  },

  apollo: {
    folderCurrent: FOLDER_CURRENT
  },

  async mounted () {
    await this.$nextTick()
    this.tab = this.$route.query.tab
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.main-tabs
  height 100%
  >>> .tabs
    background $vue-color-light-neutral

  >>> .tabs-content
    height 0

.vue-tab,
>>> .vue-tab-content,
.folder-explorer
  height 100%

>>> .vue-tab-content
  overflow-y auto
  v-box()

.folder-explorer
  flex 100% 1 1

.project-select
  height 100%
</style>
