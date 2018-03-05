<template>
  <div class="project-select page">
    <VueTabs class="main-tabs" group-class="accent">
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

        <div class="actions">
          <VueButton
            icon-left="add"
            label="Create new project here"
            class="big primary"
          />
        </div>
      </VueTab>

      <VueTab
        id="import"
        label="Import"
        icon="unarchive"
      >
        <FolderExplorer/>

        <div class="actions">
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
      folderCurrent: {}
    }
  },

  apollo: {
    folderCurrent: FOLDER_CURRENT
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.main-tabs
  height 100%
  >>> .tabs
    background $vue-color-light-neutral
    .vue-icon
      width 24px
      height @width

  >>>.tabs-content
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

.actions
  padding 12px
  background $color-light-background
  h-box()
  box-center()

.project-select
  height 100%
</style>
