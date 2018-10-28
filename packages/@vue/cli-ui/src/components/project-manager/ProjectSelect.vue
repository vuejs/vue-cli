<template>
  <div class="project-select page">
    <StepWizard
      :tab-id.sync="tab"
      :title="$route.query.hideTabs ? $t('org.vue.views.project-create.title') : $t('org.vue.views.project-select.title')"
      :hide-tabs="hideTabs"
      class="frame"
    >
      <VueTab
        id="existing"
        :label="$t('org.vue.views.project-select.tabs.projects')"
        icon="storage"
        class="select"
      >
        <ProjectSelectList/>
      </VueTab>

      <VueTab
        id="create"
        :label="$t('org.vue.views.project-select.tabs.create')"
        icon="add_box"
        class="create"
      >
        <div class="content">
          <FolderExplorer/>
        </div>

        <div class="actions-bar center">
          <VueButton
            icon-left="add"
            :label="$route.query.hideTabs ? $t('org.vue.views.project-create.tabs.details.form.folder.action') : $t('org.vue.views.project-select.buttons.create')"
            class="big primary create-project"
            @click="createProject()"
          />
        </div>
      </VueTab>

      <VueTab
        id="import"
        :label="$t('org.vue.views.project-select.tabs.import')"
        icon="unarchive"
        class="import"
      >
        <div class="content">
          <FolderExplorer/>
        </div>

        <div class="actions-bar center">
          <VueButton
            icon-left="unarchive"
            :label="$route.query.action || $t('org.vue.views.project-select.buttons.import')"
            class="big primary import-project"
            :disabled="folderCurrent && !folderCurrent.isPackage"
            :loading="busy"
            @click="importProject()"
          />
        </div>
      </VueTab>
    </StepWizard>

    <div class="top-menu left">
      <VueButton
        v-if="projectCurrent"
        :to="{ name: 'home' }"
        class="flat icon-button"
        icon-left="arrow_back"
      />
    </div>

    <div class="top-menu right">
      <VueButton
        :to="{ name: 'about' }"
        class="flat icon-button"
        icon-left="help"
        v-tooltip="$t('org.vue.views.about.title')"
      />
    </div>

    <VueModal
      v-if="showNoModulesModal"
      :title="$t('org.vue.views.project-select.import.no-modules.title')"
      class="small no-modules-modal"
      @close="showNoModulesModal = false"
    >
      <div class="default-body">
        <div class="message">
          {{ $t('org.vue.views.project-select.import.no-modules.message') }}
        </div>
      </div>

      <div slot="footer" class="actions center">
        <VueButton
          :label="$t('org.vue.views.project-select.import.force')"
          @click="importProject(true)"
        />
        <VueButton
          class="primary"
          :label="$t('org.vue.views.project-select.import.no-modules.close')"
          @click="showNoModulesModal = false"
        />
      </div>
    </VueModal>
  </div>
</template>

<script>
import FOLDER_CURRENT from '@/graphql/folder/folderCurrent.gql'
import PROJECT_INIT_CREATION from '@/graphql/project/projectInitCreation.gql'
import PROJECT_IMPORT from '@/graphql/project/projectImport.gql'
import PROJECT_CURRENT from '@/graphql/project/projectCurrent.gql'

export default {
  name: 'ProjectSelect',

  metaInfo () {
    return {
      title: this.$t('org.vue.views.project-select.title')
    }
  },

  data () {
    return {
      folderCurrent: {},
      tab: undefined,
      hideTabs: !!this.$route.query.hideTabs,
      showNoModulesModal: false,
      busy: false
    }
  },

  apollo: {
    folderCurrent: FOLDER_CURRENT,
    projectCurrent: PROJECT_CURRENT
  },

  mounted () {
    // Fix issue with Firefox
    setTimeout(() => {
      this.tab = this.$route.query.tab || 'existing'
    })
  },

  methods: {
    async createProject () {
      await this.$apollo.mutate({
        mutation: PROJECT_INIT_CREATION
      })

      this.$router.push({ name: 'project-create' })
    },

    async importProject (force = false) {
      this.showNoModulesModal = false
      this.busy = true
      await this.$nextTick()
      try {
        await this.$apollo.mutate({
          mutation: PROJECT_IMPORT,
          variables: {
            input: {
              path: this.folderCurrent.path,
              force
            }
          }
        })

        this.$router.push({ name: 'project-home' })
      } catch (e) {
        if (e.graphQLErrors && e.graphQLErrors.some(e => e.message === 'NO_MODULES')) {
          this.showNoModulesModal = true
        }
        this.busy = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.folder-explorer
  height 100%

.folder-explorer
  flex 100% 1 1

.project-select
  height 100%

.top-menu
  position fixed
  top $padding-item
  &.left
    left $padding-item
  &.right
    right $padding-item
</style>
