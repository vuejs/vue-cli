<template>
  <div class="project-create page">
    <div class="content">
      <StepWizard
        title="Create a new project"
      >
        <template slot-scope="{ next, previous }">
          <VueTab
            id="details"
            label="Details"
            icon="subject"
          >
            <div class="content">
              <div class="project-details vue-grid col-1 big-gap">
                <VueFormField
                  title="Project folder"
                >
                  <VueInput
                    v-model="formData.folder"
                    placeholder="my-app"
                    icon-left="folder"
                    class="big"
                  />

                  <div slot="subtitle">
                    <div class="project-path">
                      <div class="path">
                        <span
                          class="cwd"
                          v-tooltip="cwd"
                        >
                          {{ cwd | folder(42 - formData.folder.length) }}
                        </span>
                        <span class="folder">{{ formData.folder }}</span>
                      </div>

                      <VueButton
                        icon-left="edit"
                        class="icon-button"
                        v-tooltip="'Change base directory'"
                        :to="{ name: 'project-select', query: { tab: 'create', hideTabs: true } }"
                      />
                    </div>
                  </div>
                </VueFormField>

                <VueFormField
                  title="Package manager"
                >
                  <VueSelect
                    v-model="formData.packageManager"
                  >
                    <VueSelectButton
                      :value="undefined"
                      label="Default"
                    />
                    <VueSelectButton
                      value="npm"
                      label="npm"
                    />
                    <VueSelectButton
                      value="yarn"
                      label="yarn"
                    />
                  </VueSelect>
                </VueFormField>

                <VueFormField
                  title="Additional options"
                >
                  <VueSwitch
                    v-model="formData.force"
                    class="extend-left"
                  >
                    Overwrite target directory if it exists
                  </VueSwitch>
                </VueFormField>
              </div>
            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="close"
                label="Cancel"
                class="big"
                @click="showCancel = true"
              />

              <VueButton
                icon-right="arrow_forward"
                label="Next"
                class="big primary"
                :disabled="!detailsValid"
                @click="next()"
              />
            </div>
          </VueTab>

          <VueTab
            id="presets"
            label="Presets"
            icon="check_circle"
            :disabled="!detailsValid"
            lazy
          >
            <div class="content vue-disable-scroll">
              <div class="vue-text info banner">
                <VueIcon icon="info" class="big"/>
                <span>A preset is an association of plugins and configurations. After you've selected features, you can optionally save it as a preset so that you can reuse it for future projects, without having to reconfigure everything again.</span>
              </div>

              <div class="cta-text">Select a preset:</div>

              <template v-if="projectCreation">
                <ProjectPresetItem
                  v-for="preset of projectCreation.presets"
                  :key="preset.id"
                  :preset="preset"
                  :selected="formData.selectedPreset === preset.id"
                  @click.native="selectPreset(preset.id)"
                />
              </template>

              <ProjectPresetItem
                :preset="remotePresetInfo"
                :selected="formData.selectedPreset === 'remote'"
                @click.native="selectPreset('remote')"
              />
            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                label="Previous"
                class="big"
                @click="previous()"
              />

              <VueButton
                icon-right="arrow_forward"
                label="Next"
                class="big primary"
                :disabled="!presetValid"
                @click="next()"
              />
            </div>
          </VueTab>

          <VueTab
            id="features"
            label="Features"
            icon="device_hub"
            :disabled="!detailsValid || !presetValid"
            lazy
          >
            <div class="content">

            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                label="Previous"
                class="big"
                @click="previous()"
              />

              <VueButton
                icon-right="arrow_forward"
                label="Next"
                class="big primary"
                @click="next()"
              />
            </div>
          </VueTab>

          <VueTab
            id="plugins"
            label="Plugins"
            icon="widgets"
            :disabled="!detailsValid || !presetValid"
            lazy
          >
            <div class="content">

            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                label="Previous"
                class="big"
                @click="previous()"
              />

              <VueButton
                icon-right="arrow_forward"
                label="Next"
                class="big primary"
                @click="next()"
              />
            </div>
          </VueTab>

          <VueTab
            id="config"
            label="Configuration"
            icon="settings_applications"
            :disabled="!detailsValid || !presetValid"
            lazy
          >
            <div class="content">

            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                label="Previous"
                class="big"
                @click="previous()"
              />

              <VueButton
                icon-left="done"
                label="Create project"
                class="big primary"
              />
            </div>
          </VueTab>
        </template>
      </StepWizard>
    </div>

    <StatusBar cwd/>

    <VueModal
      v-if="showRemotePreset"
      title="Configure Remote preset"
      class="medium"
      @close="showRemotePreset = false"
    >
      <div class="default-body">
        <div class="vue-empty">
          <VueIcon icon="cake" class="large"/>
          <div>Available soon...</div>
        </div>
      </div>
    </VueModal>

    <VueModal
      v-if="showCancel"
      title="Cancel and reset project creation"
      class="small"
      @close="showCancel = false"
    >
      <div class="default-body">
        Are you sure you want to cancel the project creation?
      </div>

      <div slot="footer" class="actions end">
        <VueButton
          label="Go back"
          @click="showCancel = false"
        />

        <VueButton
          :to="{ name: 'project-select' }"
          label="Clear project"
          icon-left="delete_forever"
          class="danger"
          @click="cancel()"
        />
      </div>
    </VueModal>
  </div>
</template>

<script>
import ProjectPresetItem from '../components/ProjectPresetItem'
import StatusBar from '../components/StatusBar'
import StepWizard from '../components/StepWizard'

import CWD from '../graphql/cwd.gql'
import PROJECT_CREATION from '../graphql/projectCreation.gql'

function formDataFactory () {
  return {
    folder: '',
    force: false,
    packageManager: undefined,
    selectedPreset: null,
    remotePreset: {
      url: ''
    }
  }
}

let formData = formDataFactory()

export default {
  components: {
    ProjectPresetItem,
    StatusBar,
    StepWizard
  },

  data () {
    return {
      formData: formData,
      cwd: '',
      projectCreation: null,
      showCancel: false,
      showRemotePreset: false
    }
  },

  apollo: {
    cwd: CWD,
    projectCreation: PROJECT_CREATION
  },

  computed: {
    detailsValid () {
      return !!this.formData.folder
    },

    presetValid () {
      return !!this.formData.selectedPreset
    },

    remotePresetInfo () {
      return {
        name: 'Remote preset',
        description: 'Fetch a preset from a git repository'
      }
    }
  },

  methods: {
    cancel () {
      formData = formDataFactory()
    },

    selectPreset (id) {
      if (id === 'remote') {
        this.showRemotePreset = true
        return
      }

      this.formData.selectedPreset = id
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-create
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 28px
  grid-template-areas "content" "footer"

.content
  grid-area content

.status-bar
  grid-area footer

.project-details
  max-width 400px
  width 100%
  margin 42px auto

.project-path
  h-box()
  box-center()

  .path
    flex 100% 1 1
    margin-right 6px
    h-box()
    align-items baseline

    .folder
      font-weight bold
</style>
