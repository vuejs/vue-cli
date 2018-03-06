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
                    v-model="folder"
                    placeholder="my-app"
                    icon-left="folder"
                    class="big"
                  />

                  <VueButton
                    label="Change current working directory"
                    :to="{ name: 'project-select', query: { tab: 'create' } }"
                  />
                </VueFormField>

                <VueFormField
                  title="Package manager"
                >
                  <VueSelect
                    v-model="packageManager"
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
                    v-model="force"
                    class="extend-left"
                  >
                    Overwrite target directory if it exists
                  </VueSwitch>
                </VueFormField>
              </div>
            </div>

            <div class="actions-bar">
              <VueButton
                :to="{ name: 'project-select' }"
                icon-left="close"
                label="Cancel"
                class="big"
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
                  :selected="preset.id === selectedPreset"
                  @click.native="selectPreset(preset.id)"
                />
              </template>

              <ProjectPresetItem
                :preset="remotePresetInfo"
                :selected="selectedPreset === 'remote'"
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
                :disabled="!selectedPreset"
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
      v-if="remotePreset.openModal"
      title="Configure Remote preset"
      class="medium"
      @close="remotePreset.openModal = false"
    >
      <div class="default-body">
        <div class="vue-empty">
          <VueIcon icon="cake" class="large"/>
          <div>Available soon...</div>
        </div>
      </div>
    </VueModal>
  </div>
</template>

<script>
import ProjectPresetItem from '../components/ProjectPresetItem'
import StatusBar from '../components/StatusBar'
import StepWizard from '../components/StepWizard'

import PROJECT_CREATION from '../graphql/projectCreation.gql'
import PROJECT_INIT_CREATE from '../graphql/projectInitCreate.gql'

export default {
  components: {
    ProjectPresetItem,
    StatusBar,
    StepWizard
  },

  data () {
    return {
      folder: 'test-app',
      force: false,
      packageManager: undefined,
      projectCreation: null,
      selectedPreset: null,
      remotePreset: {
        url: '',
        openModal: false
      }
    }
  },

  apollo: {
    projectCreation: PROJECT_CREATION
  },

  computed: {
    detailsValid () {
      return !!this.folder
    },

    presetValid () {
      return !!this.selectedPreset
    },

    remotePresetInfo () {
      return {
        name: 'Remote preset',
        description: 'Fetch a preset from a git repository'
      }
    }
  },

  methods: {
    selectPreset (id) {
      if (id === 'remote') {
        this.remotePreset.openModal = true
        return
      }

      this.selectedPreset = id
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
</style>
