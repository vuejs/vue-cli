<template>
  <div class="project-select page">
    <StepWizard
      :tab-id.sync="tab"
      :title="$route.query.hideTabs ? $t('views.project-create.title') : $t('views.project-select.title')"
      :hide-tabs="hideTabs"
      class="frame"
    >
      <VueTab
        id="existing"
        :label="$t('views.project-select.tabs.projects')"
        icon="storage"
        class="select"
      >
        <ProjectSelectList/>
      </VueTab>

      <VueTab
        id="create"
        :label="$t('views.project-select.tabs.create')"
        icon="add_box"
        class="create"
      >
        <div class="content">
          <FolderExplorer/>
        </div>

        <div class="actions-bar center">
          <VueButton
            icon-left="add"
            :label="$route.query.hideTabs ? $t('views.project-create.tabs.details.form.folder.action') : $t('views.project-select.buttons.create')"
            class="big primary create-project"
            :to="{ name: 'project-create' }"
          />
        </div>
      </VueTab>

      <VueTab
        id="import"
        :label="$t('views.project-select.tabs.import')"
        icon="unarchive"
        class="import"
      >
        <div class="content">
          <FolderExplorer/>
        </div>

        <div class="actions-bar center">
          <VueButton
            icon-left="unarchive"
            :label="$route.query.action || $t('views.project-select.buttons.import')"
            class="big primary import-project"
            :disabled="!folderCurrent.isVueProject"
            @click="importProject()"
          />
        </div>
      </VueTab>
    </StepWizard>
  </div>
</template>

<script>
import FOLDER_CURRENT from '../graphql/folderCurrent.gql'
import PROJECT_IMPORT from '../graphql/projectImport.gql'

export default {
  name: 'ProjectSelect',

  metaInfo () {
    return {
      title: this.$t('views.project-select.title')
    }
  },

  data () {
    return {
      folderCurrent: {},
      tab: undefined,
      hideTabs: !!this.$route.query.hideTabs
    }
  },

  apollo: {
    folderCurrent: FOLDER_CURRENT
  },

  mounted () {
    // Fix issue with Firefox
    setTimeout(() => {
      this.tab = this.$route.query.tab || 'existing'
    })
  },

  methods: {
    async importProject () {
      await this.$apollo.mutate({
        mutation: PROJECT_IMPORT,
        variables: {
          input: {
            path: this.folderCurrent.path
          }
        }
      })

      this.$router.push({ name: 'project-home' })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.folder-explorer
  height 100%

.folder-explorer
  flex 100% 1 1

.project-select
  height 100%
</style>
